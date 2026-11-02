# Portal Aplikasi UP3 Masohi

Situs statis (tanpa server/backend) yang menampilkan semua aplikasi dan situs kerja UP3 Masohi dalam satu halaman, dilindungi kode akses. Dibangun di Claude.ai, dilanjutkan di Claude Code. Bahasa antarmuka: Indonesia.

## Struktur

| File | Peran |
|---|---|
| `index.html` | Landing page dua tahap: tampilan pembuka (logo AKSI, jam WIT, sapaan, 4 pilar 50-15-5, tombol "Masuk ke portal") → tampilan formulir kode akses. Tema gelap futuristik. |
| `portal.html` | Grid ikon aplikasi (cari, tab kategori, favorit per browser). Hanya terbuka jika kunci di `sessionStorage`/`localStorage` bisa membuka `data.enc.js`; jika tidak, redirect ke `index.html`. Tombol Beranda (`index.html#beranda`) dan Keluar (`index.html#keluar`). **Mode edit** (tombol Edit, hanya peran `kelola`): bilah edit lengket, klik ikon → `<dialog>` ubah/hapus, ubin "Tambah aplikasi"; Simpan memanggil `PortalCrypto.reencrypt` dengan kunci yang tersimpan (salt dan `kunci` tetap, hanya iv/ct baru, jadi sesi pengguna lain tetap berlaku) lalu mengunduh `data.enc.js`; dialog hasil menautkan ke `REPO_UPLOAD_URL` (halaman unggah repository). Penanda internal `_dirty` dibuang saat snapshot/simpan. |
| `admin.html` | Alat pengelola: buka `data.enc.js` dengan **kode kelola** (kode lihat ditolak) → edit judul/daftar aplikasi lewat tabel, "Mulai dari kosong" baru aktif setelah kode kelola diterima → tentukan kode lihat dan kode kelola (harus berbeda; lihat ≥4, kelola ≥8 karakter) → unduh `data.enc.js` baru. |
| `data.enc.js` | `window.PORTAL_DATA = {v:2, iter, salt, kunci:{lihat:{iv,ct}, kelola:{iv,ct}}, iv, ct}`. `ct` = JSON `{v:2, config:{title,subtitle,logo,footer}, apps:[{name,url,category,desc,icon}], kode:{lihat}}` dienkripsi dengan kunci data acak; `kunci.*` adalah kunci data itu dibungkus dengan kunci turunan dari masing-masing kode. Format lama `{v:1, iter, salt, iv, ct}` (satu kode) masih bisa dibuka dan dianggap peran `kelola`. **Jangan diedit manual**; buat ulang lewat `admin.html`. |
| `crypto.js` | `window.PortalCrypto`: PBKDF2-SHA256 (300.000 iterasi) → AES-256-GCM. Fungsi: `encrypt({lihat,kelola}, obj)`, `reencrypt(key, pkg, obj)` (paket baru dengan salt/bungkus lama), `unlock(pass, pkg) → {key, data, role, pass}` (mencoba bungkus `kelola` dulu lalu `lihat`), `decryptWithKey`, `saveKey(key, remember, role)`/`loadKey`/`loadRole`/`clearKey` (storage key `portal-kunci` dan `portal-peran`), `toFile`. Jangan ubah parameter tanpa membuat ulang `data.enc.js`. |
| `logos/` | Logo AKSI (`logo-aksi.webp/.png`, `logo-aksi-small.png`) dan tempat logo aplikasi. Logo AKSI juga sudah tertanam sebagai data URI di `index.html` dan `portal.html`, jadi folder ini opsional. |
| `README.md` | Panduan deploy dan pemakaian untuk pengelola (non-developer). |

## Rute tanda pagar di `index.html`

- tanpa hash / `#beranda` → tampilan pembuka (jika kunci tersimpan masih valid, tombol utama jadi "Buka portal" dan langsung ke `portal.html`)
- `#masuk` → formulir kode akses (dipakai `pushState` agar tombol Back browser kembali ke pembuka)
- `#keluar` → pembuka dengan pesan "Anda sudah keluar"
- `#kode-berubah` → formulir dengan pesan kode sudah diganti (dipicu `portal.html` saat kunci lama gagal membuka data)

## Konvensi

- Satu file HTML per halaman, CSS dan JS inline; tanpa framework/bundler. Hanya Google Fonts (Space Grotesk untuk display, Plus Jakarta Sans untuk teks) sebagai sumber eksternal.
- Warna merek dari logo AKSI: biru `#0B5FD6`, cyan `#00C2E8`, hijau `#19B33F`, kuning `#F2C21B`. Token di `:root` tiap file.
- Semua teks antarmuka berbahasa Indonesia, tanda kutip tipografis.
- Animasi harus mati di `prefers-reduced-motion: reduce`; tata letak responsif sampai ~360px.
- Data dari `data.enc.js` dan isian pengguna dirender dengan `textContent` (bukan `innerHTML`).
- Jam dan sapaan selalu zona `Asia/Jayapura` (WIT).
- GitHub Pages menyimpan cache 10 menit. Setiap kali `crypto.js` diubah, naikkan angka di `<script src="crypto.js?v=N">` pada ketiga halaman agar tidak bertemu `data.enc.js` versi lain dari cache. `admin.html` selalu mengambil `data.enc.js` segar lewat `fetch(..., {cache: "no-store"})`.
- `unlock` menoleransi variasi ketikan (spasi ujung, tanda pisah panjang, huruf besar/kecil) dan mengembalikan `pass` yang cocok.

## Cara menguji

```bash
python3 -m http.server 8765          # buka http://localhost:8765/index.html
```
Alur yang harus tetap jalan: pembuka → Masuk → formulir → kode benar → `portal.html` (34 ikon) → Beranda → pembuka ("Buka portal") → Keluar → pembuka dengan pesan. Back browser dari formulir harus kembali ke pembuka. Ada dua kode: kode lihat (portal saja) dan kode kelola (portal + `admin.html`); keduanya tidak dicantumkan di repository, minta ke pengelola portal. Uji juga: kode lihat ditolak di `admin.html`; tombol Edit di portal hanya tampil untuk kode kelola; mode edit → ubah ikon → Simpan menghasilkan `data.enc.js` yang terbuka dengan kedua kode. Pengujian otomatis sebelumnya memakai Playwright (Chromium) terhadap server lokal.

## Deploy

GitHub Pages: repository publik `portal-aplikasi-up3-masohi`, branch `main`, folder `/ (root)`. Semua file di akar repository (bukan di subfolder). Situs GitHub Pages bersifat publik; yang melindungi daftar aplikasi adalah enkripsi di `data.enc.js`.

## Pekerjaan yang masih terbuka

1. Isi URL ke-34 aplikasi (saat ini kosong) dan beri kategori (mis. Keuangan, SDM, Operasional, Pengadaan).
2. Opsional: tema gelap-futuristik untuk `portal.html` agar senada dengan landing page; logo per aplikasi di `logos/`.
