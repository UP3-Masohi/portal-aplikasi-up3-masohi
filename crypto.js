// crypto.js — pengunci data portal.
// Daftar aplikasi disimpan terenkripsi (AES-256-GCM) di data.enc.js.
// Ada dua kode akses dengan peran berbeda:
//   • kode LIHAT  — membuka portal (hanya melihat daftar aplikasi)
//   • kode KELOLA — membuka portal dan admin.html (mengubah/menghapus data)
// Data dienkripsi dengan kunci acak; kunci acak itu dibungkus dua kali, masing-masing
// dengan kunci turunan (PBKDF2-SHA256) dari kode lihat dan kode kelola. Dengan begitu
// satu file melayani kedua kode, dan kode kelola tidak pernah tersimpan di mana pun.
// Tidak ada yang perlu diubah di file ini.

window.PortalCrypto = (() => {
  'use strict';
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const ITER = 300000;
  const STORE = 'portal-kunci';
  const STORE_ROLE = 'portal-peran';
  const ROLES = ['kelola', 'lihat'];   // urutan percobaan: kelola dulu

  function toB64(buf) {
    const u = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function fromB64(s) {
    return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  }
  function rand(n) { return crypto.getRandomValues(new Uint8Array(n)); }

  // Kunci turunan dari kode akses (dipakai untuk membungkus kunci data)
  async function deriveKey(pass, salt, iter) {
    const base = await crypto.subtle.importKey('raw', enc.encode(String(pass).normalize('NFKC')), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  }
  async function importRaw(raw) {
    return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
  }
  async function wrap(kek, dataKey) {
    const iv = rand(12);
    const raw = await crypto.subtle.exportKey('raw', dataKey);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, kek, raw);
    return { iv: toB64(iv), ct: toB64(ct) };
  }
  async function unwrap(kek, w) {
    const raw = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(w.iv) }, kek, fromB64(w.ct));
    return importRaw(raw);
  }

  // Enkripsi objek JSON dengan dua kode akses -> paket v2
  //   codes = { lihat: '…', kelola: '…' }
  // (bentuk lama: codes berupa string -> paket v1 satu kode, dipakai hanya untuk kompatibilitas)
  async function encrypt(codes, obj) {
    const salt = rand(16), iv = rand(12);
    const plain = enc.encode(JSON.stringify(obj));
    if (typeof codes === 'string') {
      const key = await deriveKey(codes, salt, ITER);
      const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain);
      return { v: 1, iter: ITER, salt: toB64(salt), iv: toB64(iv), ct: toB64(ct) };
    }
    if (!codes || !codes.lihat || !codes.kelola) throw new Error('Kode lihat dan kode kelola harus diisi.');
    const dataKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, dataKey, plain);
    const kunci = {};
    for (const role of ROLES) kunci[role] = await wrap(await deriveKey(codes[role], salt, ITER), dataKey);
    return { v: 2, iter: ITER, salt: toB64(salt), kunci, iv: toB64(iv), ct: toB64(ct) };
  }

  // Enkripsi ulang isi dengan kunci data yang sudah terbuka: salt dan bungkus kunci (kedua kode)
  // dipertahankan, hanya iv dan ct yang baru. Dipakai mode edit di portal.html, jadi pengelola
  // tidak perlu mengetik kode lagi untuk menyimpan perubahan daftar.
  async function reencrypt(key, pkg, obj) {
    const iv = rand(12);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(obj)));
    return Object.assign({}, pkg, { iv: toB64(iv), ct: toB64(ct) });
  }

  async function decryptWithKey(key, pkg) {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(pkg.iv) }, key, fromB64(pkg.ct));
    return JSON.parse(dec.decode(plain));
  }

  // Variasi ketikan yang sering terjadi di ponsel: spasi di ujung, tanda pisah panjang (– —),
  // huruf besar/kecil otomatis. Dicoba berurutan, yang persis seperti diketik lebih dulu.
  function variants(pass) {
    const p = String(pass), t = p.trim(), d = t.replace(/[\u2010-\u2015\u2212]/g, '-');
    return [...new Set([p, t, d, d.toUpperCase(), d.toLowerCase()])];
  }

  // Coba buka paket dengan kode akses. Mengembalikan {key, data, role} atau melempar error.
  //   role: 'kelola' (boleh mengubah data) atau 'lihat' (hanya melihat portal)
  async function unlock(pass, pkg) {
    let last = null;
    for (const v of variants(pass)) {
      try { const r = await unlockExact(v, pkg); r.pass = v; return r; } catch (e) { last = e; }
    }
    throw last || new Error('Kode akses salah.');
  }
  async function unlockExact(pass, pkg) {
    const kek = await deriveKey(pass, fromB64(pkg.salt), pkg.iter || ITER);
    if (pkg.v === 2 && pkg.kunci) {
      for (const role of ROLES) {
        if (!pkg.kunci[role]) continue;
        let key;
        try { key = await unwrap(kek, pkg.kunci[role]); } catch { continue; }
        const data = await decryptWithKey(key, pkg);
        return { key, data, role };
      }
      throw new Error('Kode akses salah.');
    }
    // paket v1 (satu kode): kode tunggal dianggap kode kelola
    const data = await decryptWithKey(kek, pkg);
    return { key: kek, data, role: 'kelola' };
  }

  // Kunci data (bukan kode aksesnya) dan peran disimpan di browser.
  async function saveKey(key, remember, role) {
    const raw = toB64(await crypto.subtle.exportKey('raw', key));
    const r = ROLES.includes(role) ? role : 'lihat';
    try { sessionStorage.setItem(STORE, raw); sessionStorage.setItem(STORE_ROLE, r); } catch {}
    try {
      if (remember) { localStorage.setItem(STORE, raw); localStorage.setItem(STORE_ROLE, r); }
      else { localStorage.removeItem(STORE); localStorage.removeItem(STORE_ROLE); }
    } catch {}
  }
  async function loadKey() {
    let raw = null;
    try { raw = sessionStorage.getItem(STORE) || localStorage.getItem(STORE); } catch {}
    if (!raw) return null;
    try { return await importRaw(fromB64(raw)); } catch { return null; }
  }
  function loadRole() {
    let r = null;
    try { r = sessionStorage.getItem(STORE_ROLE) || localStorage.getItem(STORE_ROLE); } catch {}
    return ROLES.includes(r) ? r : 'lihat';
  }
  function clearKey() {
    try { sessionStorage.removeItem(STORE); sessionStorage.removeItem(STORE_ROLE); } catch {}
    try { localStorage.removeItem(STORE); localStorage.removeItem(STORE_ROLE); } catch {}
  }

  // Bentuk file data.enc.js dari paket terenkripsi.
  function toFile(pkg) {
    return '// data.enc.js — daftar aplikasi portal, terenkripsi. Dibuat dengan admin.html.\n' +
      '// Jangan diedit manual; buat ulang lewat admin.html.\n' +
      'window.PORTAL_DATA = ' + JSON.stringify(pkg, null, 2) + ';\n';
  }

  const supported = !!(window.crypto && crypto.subtle && window.TextEncoder);

  return { encrypt, reencrypt, unlock, decryptWithKey, saveKey, loadKey, loadRole, clearKey, toFile, supported };
})();
