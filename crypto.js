// crypto.js — pengunci data portal.
// Daftar aplikasi disimpan terenkripsi (AES-256-GCM) di data.enc.js.
// Kuncinya diturunkan dari kode akses dengan PBKDF2-SHA256, jadi tanpa
// kode akses isinya tidak bisa dibaca sekalipun file-nya diunduh.
// Tidak ada yang perlu diubah di file ini.

window.PortalCrypto = (() => {
  'use strict';
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const ITER = 300000;
  const STORE = 'portal-kunci';

  function toB64(buf) {
    const u = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function fromB64(s) {
    return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  }

  async function deriveKey(pass, salt, iter) {
    const base = await crypto.subtle.importKey('raw', enc.encode(String(pass).normalize('NFKC')), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  }

  // Enkripsi objek JSON dengan kode akses -> paket {v, iter, salt, iv, ct}
  async function encrypt(pass, obj) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(pass, salt, ITER);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(obj)));
    return { v: 1, iter: ITER, salt: toB64(salt), iv: toB64(iv), ct: toB64(ct) };
  }

  async function decryptWithKey(key, pkg) {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(pkg.iv) }, key, fromB64(pkg.ct));
    return JSON.parse(dec.decode(plain));
  }

  // Coba buka paket dengan kode akses. Mengembalikan {key, data} atau melempar error.
  async function unlock(pass, pkg) {
    const key = await deriveKey(pass, fromB64(pkg.salt), pkg.iter || ITER);
    const data = await decryptWithKey(key, pkg);
    return { key, data };
  }

  // Kunci yang sudah diturunkan disimpan di browser (bukan kode aksesnya).
  async function saveKey(key, remember) {
    const raw = toB64(await crypto.subtle.exportKey('raw', key));
    try { sessionStorage.setItem(STORE, raw); } catch {}
    try { if (remember) localStorage.setItem(STORE, raw); else localStorage.removeItem(STORE); } catch {}
  }
  async function loadKey() {
    let raw = null;
    try { raw = sessionStorage.getItem(STORE) || localStorage.getItem(STORE); } catch {}
    if (!raw) return null;
    try {
      return await crypto.subtle.importKey('raw', fromB64(raw), { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
    } catch { return null; }
  }
  function clearKey() {
    try { sessionStorage.removeItem(STORE); } catch {}
    try { localStorage.removeItem(STORE); } catch {}
  }

  // Bentuk file data.enc.js dari paket terenkripsi.
  function toFile(pkg) {
    return '// data.enc.js — daftar aplikasi portal, terenkripsi. Dibuat dengan admin.html.\n' +
      '// Jangan diedit manual; buat ulang lewat admin.html.\n' +
      'window.PORTAL_DATA = ' + JSON.stringify(pkg, null, 2) + ';\n';
  }

  const supported = !!(window.crypto && crypto.subtle && window.TextEncoder);

  return { encrypt, unlock, decryptWithKey, saveKey, loadKey, clearKey, toFile, supported };
})();
