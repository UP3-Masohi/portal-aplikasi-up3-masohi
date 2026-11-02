# Portal Aplikasi UP3 Masohi

Situs statis (tanpa server/backend) yang menampilkan semua aplikasi dan situs kerja UP3 Masohi dalam satu halaman, dilindungi kode akses. Dibangun di Claude.ai, dilanjutkan di Claude Code. Bahasa antarmuka: Indonesia.

## Struktur

| File | Peran |
|---|---|
| `index.html` | Landing page dua tahap: tampilan pembuka (logo AKSI, jam WIT, sapaan, 4 pilar 50-15-5, tombol "Masuk ke portal") → tampilan formulir kode akses. Tema gelap futuristik. |
| `portal.html` | Grid ikon aplikasi (cari, tab kategori, favorit per browser). Hanya terbuka jika kunci di `sessionStorage`/`localStorage` bisa membuka `data.enc.js`; jika tidak, redirect ke `index.html`. Tombol Beranda (`index.html#beranda`) dan Keluar (`index.html#keluar`). |
| `admin.html` | Alat pengelola: buka `data.enc.js` dengan kode saat ini → edit judul/daftar aplikasi lewat tabel → tentukan kode akses → unduh `data.enc.js` baru. |
| `data.enc.js` | `window.PORTAL_DATA = {v, iter, salt, iv, ct}` — JSON `{v:1, config:{title,subtitle,logo,footer}, apps:[{name,url,category,desc,icon}]}` terenkripsi. **Jangan diedit manual**; buat ulang lewat `admin.html`. |
| `crypto.js` | `window.PortalCrypto`: PBKDF2-SHA256 (300.000 iterasi) → AES-256-GCM. Fungsi: `encrypt`, `unlock`, `decryptWithKey`, `saveKey`/`loadKey`/`clearKey` (kunci tersimpan di storage dengan key `portal-kunci`), `toFile`. Jangan ubah parameter tanpa membuat ulang `data.enc.js`. |
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

## Cara menguji

```bash
python3 -m http.server 8765          # buka http://localhost:8765/index.html
```
Alur yang harus tetap jalan: pembuka → Masuk → formulir → kode benar → `portal.html` (34 ikon) → Beranda → pembuka ("Buka portal") → Keluar → pembuka dengan pesan. Back browser dari formulir harus kembali ke pembuka. Kode akses tidak dicantumkan di repository; minta ke pengelola portal. Pengujian otomatis sebelumnya memakai Playwright (Chromium) terhadap server lokal.

## Deploy

GitHub Pages: repository publik `portal-aplikasi-up3-masohi`, branch `main`, folder `/ (root)`. Semua file di akar repository (bukan di subfolder). Situs GitHub Pages bersifat publik; yang melindungi daftar aplikasi adalah enkripsi di `data.enc.js`.

## Pekerjaan yang masih terbuka

1. Ganti kode akses awal lewat `admin.html`, unggah `data.enc.js` baru.
2. Isi URL ke-34 aplikasi (saat ini kosong) dan beri kategori (mis. Keuangan, SDM, Operasional, Pengadaan).
3. Opsional: tema gelap-futuristik untuk `portal.html` agar senada dengan landing page; logo per aplikasi di `logos/`.
