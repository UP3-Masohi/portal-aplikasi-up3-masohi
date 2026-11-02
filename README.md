# Portal Aplikasi UP3 Masohi (dengan kode akses)

Portal aplikasi statis yang bisa ditayangkan di GitHub Pages, dengan halaman masuk berkode akses. Daftar aplikasi disimpan **terenkripsi**, jadi orang yang tidak punya kode akses tidak bisa melihat daftar aplikasinya, sekalipun ia tahu alamat situsnya atau mengunduh file-filenya.

| File | Fungsi |
|---|---|
| `index.html` | Landing page: pembuka interaktif (logo AKSI, pilar 50-15-5), lalu formulir kode akses setelah tombol **Masuk ke portal** |
| `portal.html` | Portal aplikasi — hanya terbuka setelah kode akses benar; tombol **Beranda** kembali ke halaman depan tanpa keluar, **Keluar** menghapus kunci dari perangkat |
| `admin.html` | Alat pengelola: ubah daftar aplikasi dan kode akses, lalu buat `data.enc.js` baru |
| `data.enc.js` | Daftar aplikasi dan judul portal, terenkripsi |
| `crypto.js` | Pengunci data (tidak perlu diubah) |
| `logos/` | Folder opsional untuk logo aplikasi (salinan logo AKSI juga ada di sini) |

**Kode akses** tidak dicantumkan di repository ini; tanyakan ke pengelola portal. Kode yang sedang berlaku bisa diganti kapan saja lewat `admin.html`.

## Cara deploy ke GitHub Pages

1. Masuk ke [github.com](https://github.com), klik **New repository**. Beri nama bebas (mis. `portal-up3-masohi`), pilih **Public**, lalu **Create repository**.
2. Klik **Add file → Upload files**, seret semua file dan folder di atas ke sana, lalu **Commit changes**.
3. Buka **Settings → Pages**. Pada *Build and deployment* pilih **Source: Deploy from a branch**, **Branch: `main`**, folder **`/ (root)`**, lalu **Save**.
4. Tunggu 1–2 menit. Portal tayang di `https://NAMA-AKUN.github.io/portal-up3-masohi/`.

## Mengubah daftar aplikasi atau kode akses

1. Buka `admin.html` (di situs yang sudah tayang, atau langsung dari file di komputer).
2. **Langkah 1:** masukkan kode akses yang berlaku, klik **Buka**. Daftar aplikasi yang sedang tayang akan dimuat.
3. **Langkah 2:** ubah judul, tambah/hapus aplikasi, isi alamat, kategori, dan ikon.
4. **Langkah 3:** isi kode akses (boleh sama dengan yang lama, atau yang baru), klik **Buat file data.enc.js**. File akan terunduh.
5. Di GitHub, **Add file → Upload files**, seret `data.enc.js` yang baru (menggantikan yang lama), lalu **Commit changes**. Perubahan tayang dalam sekitar satu menit.

Yang disimpan di GitHub hanya hasil enkripsinya; kode akses itu sendiri tidak pernah tersimpan di mana pun. Kalau kode akses hilang, buat `data.enc.js` baru lewat `admin.html` dengan memilih **Mulai dari kosong**.

## Logo unit

Logo AKSI sudah tertanam di dalam `index.html` dan `portal.html`, jadi tetap tampil walaupun folder `logos/` tidak ikut terunggah. Untuk menggantinya dengan logo lain, isi kolom **Logo unit** di `admin.html` dengan nama file di folder `logos/` (mis. `logos/logo-unit.png`); untuk halaman masuk, kirim logonya untuk ditanam ulang.

## Menambahkan logo aplikasi

Upload gambar (PNG/JPG/SVG) ke folder `logos/`, lalu isi kolom **Ikon** di `admin.html` dengan nama filenya, mis. `logos/sap.png`. Tanpa logo, ikon dibuat otomatis dari inisial nama. Bisa juga diisi satu emoji.

## Apa yang dilindungi, dan apa yang tidak

- **Dilindungi:** daftar aplikasi, alamat, dan judul portal tidak bisa dibaca tanpa kode akses (AES-256-GCM, kunci diturunkan dari kode akses dengan PBKDF2 300.000 iterasi).
- **Tidak dilindungi:** halaman masuk (`index.html`) dan alat `admin.html` bisa dilihat siapa saja — keduanya tidak berisi rahasia. Siapa pun yang diberi tahu kode akses bisa masuk; kalau kode bocor, ganti lewat `admin.html` dan sebarkan kode yang baru.
- Pilih kode akses yang cukup panjang (minimal 8 karakter, lebih panjang lebih baik), karena file terenkripsinya bisa diunduh orang dan dicoba-coba secara offline.
- Ini satu kode bersama untuk semua pengguna, bukan login per orang. Untuk login per pegawai (SSO), portal perlu ditaruh di server internal kantor atau layanan hosting yang mendukung autentikasi.
