# Portal Aplikasi UP3 Masohi (dengan kode akses)

Portal aplikasi statis yang bisa ditayangkan di GitHub Pages, dengan halaman masuk berkode akses. Daftar aplikasi disimpan **terenkripsi**, jadi orang yang tidak punya kode akses tidak bisa melihat daftar aplikasinya, sekalipun ia tahu alamat situsnya atau mengunduh file-filenya.

| File | Fungsi |
|---|---|
| `index.html` | Landing page: pembuka interaktif (logo AKSI, pilar 50-15-5), lalu formulir kode akses setelah tombol **Masuk ke portal** |
| `portal.html` | Portal aplikasi — hanya terbuka setelah kode akses benar; tombol **Beranda** kembali ke halaman depan tanpa keluar, **Keluar** menghapus kunci dari perangkat. Yang masuk dengan kode kelola juga melihat tombol **Edit** untuk mengubah daftar langsung di portal |
| `admin.html` | Alat pengelola lengkap: judul, logo, kedua kode akses, dan daftar aplikasi dalam bentuk tabel, lalu buat `data.enc.js` baru. Hanya terbuka dengan **kode kelola** |
| `data.enc.js` | Daftar aplikasi dan judul portal, terenkripsi |
| `crypto.js` | Pengunci data (tidak perlu diubah) |
| `logos/` | Folder opsional untuk logo aplikasi (salinan logo AKSI juga ada di sini) |

## Dua kode akses

| Kode | Siapa yang memegang | Bisa apa |
|---|---|---|
| **Kode lihat** | semua pengguna portal | membuka `portal.html` dan melihat daftar aplikasi |
| **Kode kelola** | pengelola portal | semua yang bisa kode lihat, ditambah tombol **Edit** di portal dan `admin.html` untuk mengubah, menghapus, dan mengganti kode |

Kedua kode tidak dicantumkan di repository ini; tanyakan ke pengelola portal. Keduanya bisa diganti kapan saja lewat `admin.html`.

## Cara deploy ke GitHub Pages

1. Masuk ke [github.com](https://github.com), klik **New repository**. Beri nama bebas (mis. `portal-up3-masohi`), pilih **Public**, lalu **Create repository**.
2. Klik **Add file → Upload files**, seret semua file dan folder di atas ke sana, lalu **Commit changes**.
3. Buka **Settings → Pages**. Pada *Build and deployment* pilih **Source: Deploy from a branch**, **Branch: `main`**, folder **`/ (root)`**, lalu **Save**.
4. Tunggu 1–2 menit. Portal tayang di `https://NAMA-AKUN.github.io/portal-up3-masohi/`.

## Logo aplikasi

Kalau kolom ikon dikosongkan dan alamatnya terisi, portal mencoba mengambil logo dari situs aplikasi itu sendiri: ikon resolusi tinggi dari situsnya, lalu layanan favicon Google untuk situs publik, lalu `favicon.ico`. Sampai ketemu, yang tampil adalah inisial berwarna. Aplikasi intranet hanya mendapat logo saat dibuka dari jaringan kantor. Hasilnya diingat di browser masing-masing selama 7 hari. Isi kolom ikon dengan `inisial` untuk memaksa inisial, satu emoji, atau nama file di folder `logos/` (mis. `logos/sap.png`) untuk logo pilihan sendiri.

## Mengubah daftar aplikasi langsung di portal (cara cepat)

1. Masuk ke portal dengan **kode kelola**, klik **Edit** di kanan atas.
2. Klik ikon aplikasi untuk mengubah nama, alamat, kategori, keterangan, atau ikon, atau untuk **Hapus**. Klik **+ Tambah** untuk aplikasi baru.
3. Klik **Simpan**.
   - **Jika simpan langsung ke GitHub sudah diatur** (lihat di bawah): perubahan langsung ditulis ke repository dan tayang untuk semua pengguna dalam sekitar satu menit. Di browser Anda daftar baru langsung terlihat.
   - **Jika belum:** file `data.enc.js` baru terunduh. Klik **Buka halaman unggah**, seret file itu ke GitHub (menggantikan yang lama), lalu **Commit changes**. Sebelum diunggah, situs masih memakai daftar lama.

Pengguna yang sedang masuk tidak perlu masuk ulang setelah daftar berubah. Judul portal, logo, dan penggantian kode akses tetap lewat `admin.html`.

### Mengaktifkan simpan langsung ke GitHub (sekali per perangkat pengelola)

1. Di GitHub, buka **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Beri nama (mis. “Portal UP3 Masohi”), pilih masa berlaku, dan pada **Repository access** pilih *Only select repositories* → repository portal.
3. Pada **Permissions → Repository permissions**, atur **Contents** menjadi *Read and write*. Biarkan yang lain.
4. Klik **Generate token**, salin tokennya (hanya tampil sekali).
5. Di portal, masuk dengan kode kelola → **Edit** → tombol **GitHub** → tempel token → **Uji dan simpan**. Centang “Ingat di perangkat ini” hanya pada perangkat pribadi.

Token disimpan terenkripsi di browser itu saja dan hanya dikirim ke GitHub. Siapa pun yang bisa membuka portal di browser itu dengan kode kelola dapat memakainya, jadi jangan aktifkan di komputer bersama. Token bisa dicabut kapan saja dari pengaturan GitHub, dan tombol **Lupakan token** menghapusnya dari browser.

## Mengubah judul, logo, kode akses, atau daftar lewat tabel

1. Buka `admin.html` (di situs yang sudah tayang, atau langsung dari file di komputer).
2. **Langkah 1:** masukkan **kode kelola** yang berlaku, klik **Buka**. Daftar aplikasi yang sedang tayang akan dimuat. Kode lihat ditolak di sini.
3. **Langkah 2:** ubah judul, tambah/hapus aplikasi, isi alamat, kategori, dan ikon.
4. **Langkah 3:** periksa kode lihat dan kode kelola (keduanya sudah terisi dengan yang berlaku; ganti kalau perlu, keduanya harus berbeda), klik **Buat file data.enc.js**. File akan terunduh.
5. Di GitHub, **Add file → Upload files**, seret `data.enc.js` yang baru (menggantikan yang lama), lalu **Commit changes**. Perubahan tayang dalam sekitar satu menit.

Yang disimpan di GitHub hanya hasil enkripsinya; kode kelola tidak pernah tersimpan di mana pun (kode lihat ikut tersimpan terenkripsi di dalam data agar bisa diisikan kembali di langkah 3). Kalau kode kelola hilang, daftar yang lama tidak bisa dimuat lagi: buat `data.enc.js` baru lewat `admin.html` dengan memilih **Mulai dari kosong** dan isi ulang daftarnya.

## Logo unit

Logo AKSI sudah tertanam di dalam `index.html` dan `portal.html`, jadi tetap tampil walaupun folder `logos/` tidak ikut terunggah. Untuk menggantinya dengan logo lain, isi kolom **Logo unit** di `admin.html` dengan nama file di folder `logos/` (mis. `logos/logo-unit.png`); untuk halaman masuk, kirim logonya untuk ditanam ulang.

## Menambahkan logo aplikasi

Upload gambar (PNG/JPG/SVG) ke folder `logos/`, lalu isi kolom **Ikon** di `admin.html` dengan nama filenya, mis. `logos/sap.png`. Tanpa logo, ikon dibuat otomatis dari inisial nama. Bisa juga diisi satu emoji.

## Apa yang dilindungi, dan apa yang tidak

- **Dilindungi:** daftar aplikasi, alamat, dan judul portal tidak bisa dibaca tanpa salah satu kode akses (AES-256-GCM dengan kunci acak; kunci acak itu dibungkus dengan kunci turunan PBKDF2 300.000 iterasi dari masing-masing kode).
- **Tidak dilindungi:** halaman masuk (`index.html`) dan alat `admin.html` bisa dilihat siapa saja — keduanya tidak berisi rahasia. Siapa pun yang diberi tahu kode akses bisa masuk; kalau kode bocor, ganti lewat `admin.html` dan sebarkan kode yang baru.
- Pilih kode yang cukup panjang (kode kelola minimal 8 karakter; kode lihat yang pendek lebih mudah ditebak), karena file terenkripsinya bisa diunduh orang dan dicoba-coba secara offline.
- Pemisahan kode lihat/kelola mengatur siapa yang bisa membuka `admin.html`. Yang benar-benar mencegah orang lain mengganti daftar yang tayang adalah hak tulis ke repository GitHub, jadi jangan bagikan akses repository ke sembarang orang.
- Ini kode bersama, bukan login per orang. Untuk login per pegawai (SSO), portal perlu ditaruh di server internal kantor atau layanan hosting yang mendukung autentikasi.
