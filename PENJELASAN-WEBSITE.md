# Penjelasan Website Aozora Nihongo Club

Dokumen ini menjelaskan website dengan bahasa sederhana: tujuan situs, fungsi tiap halaman, cara kerja, dan cara membukanya.

## Tentang website

Aozora Nihongo Club (青空日本語) adalah website ekstrakurikuler bahasa Jepang SMK N 1 Purwokerto. Situs membantu pengunjung mengenal klub, belajar dasar bahasa Jepang, melihat kegiatan, dan mengirim pesan.

## Bagian yang bisa dibuka

- **Beranda:** pengenalan klub, maskot, logo, dan tombol menuju materi atau pesan.
- **Belajar:** Hiragana, Katakana, kuis kana, kata Jepang harian, dan kosakata.
- **Kegiatan:** informasi pertemuan dan pengenalan klub.
- **Pesan:** papan pesan publik dan formulir untuk menghubungi pengurus.
- **Panel admin:** pengurus dapat mengelola informasi pertemuan dan pesan sesuai akses yang tersedia.

Galeri tidak ditampilkan pada website. Data/foto tersimpan tidak otomatis dihapus ketika tombol atau halaman tidak ditampilkan.

## Cara kerja singkat

Website memakai tiga jenis kode:

1. **HTML** menyusun isi dan bagian halaman.
2. **CSS** mengatur warna, ukuran, tata letak, animasi, dan tampilan HP.
3. **JavaScript** menjalankan menu, perpindahan halaman, kuis, pencarian, formulir, tema, dan panel admin.

Materi Hiragana, Katakana, dan kosakata berada di `js/data.js`. `js/store.js` mengatur penyimpanan. Jika situs menggunakan penyimpanan lokal, data hanya tersimpan di browser/perangkat itu dan tidak otomatis terlihat di perangkat lain.

## Susunan file HTML

Sumber halaman berada di folder `pages/`, dibagi menurut bagian: `navigation.html`, `home.html`, `learning.html`, `activities.html`, `messages.html`, `footer.html`, `dialogs.html`, dan `scripts.html`.

`index.template.html` menyimpan kerangka dokumen. Jalankan perintah berikut dari folder website untuk menggabungkan semua bagian menjadi `index.html` yang dibaca browser:

```bash
python tools/build_html.py
```

Jangan edit `index.html` langsung karena file itu hasil build. Edit file bagian di `pages/`, lalu jalankan perintah build lagi.

## Membuka website di komputer

1. Buka folder website.
2. Klik dua kali `MULAI-DISINI.bat`.
3. Biarkan jendela hitam tetap terbuka selama memakai website.
4. Browser akan membuka alamat lokal website.

Jika file launcher tidak tersedia, jalankan `python -m http.server 8000` dari folder website, lalu buka `http://localhost:8000/`.

## Mengubah tampilan atau isi

- Ubah judul atau teks Beranda: `pages/home.html`.
- Ubah menu: `pages/navigation.html` dan `css/parts/01-navigation.css`.
- Ubah materi: `pages/learning.html`, `js/data.js`, dan berkas CSS terkait.
- Ubah kegiatan: `pages/activities.html`.
- Ubah formulir/papan pesan: `pages/messages.html`.
- Ubah tampilan umum: berkas di `css/parts/`.
- Ubah perilaku situs: `js/main.js` atau `js/features/`.

Setelah mengubah HTML, jalankan `python tools/build_html.py`, lalu muat ulang situs.

## Cara memeriksa perubahan

Jalankan dari folder website:

```bash
python tools/build_html.py
node --check js/main.js
node tests/features-smoke.test.cjs
node tests/site-structure.test.cjs
node tests/gallery-store.test.cjs
```

Periksa juga situs di layar komputer dan HP. Perubahan pada file lokal belum tentu sudah muncul di website publik; publikasi perlu dikirim ke GitHub dan deployment Pages harus selesai.

## Peta dokumen

- `PENJELASAN-WEBSITE.md` — gambaran website dan panduan penggunaan singkat.
- `PANDUAN-KODE.md` — peta kode lebih rinci, selector/fungsi, pengujian, dan troubleshooting.
