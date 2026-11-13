# AOZORA NIHONGO CLUB — 青空日本語

Website statis ekstrakurikuler bahasa Jepang **SMK N 1 Purwokerto**. Fitur: Hiragana/Katakana, kuis kana, kata harian, kosakata, info pertemuan, slider klub, papan pesan, pesan pribadi, dan panel admin. Galeri tidak ditampilkan; data foto lama tetap tersimpan.

---

## Data dan keamanan

Mode penyimpanan aktif terlihat pada `window.Store.mode`. Penyimpanan lokal hanya berlaku di browser/perangkat itu. Jangan menaruh password, token, `service_role`, atau rahasia server di source publik. Foto lama tidak dihapus saat fitur Galeri disembunyikan.

Website memakai GitHub Pages. Panduan perubahan dan penerbitan ada di [`PANDUAN-KODE.md`](PANDUAN-KODE.md). Jangan mengunggah file konfigurasi yang memuat rahasia.

## Peta file

- `index.html` — struktur halaman, menu, dan urutan script.
- `css/style.css` — daftar import; aturan tampilan ada di `css/parts/`.
- `js/main.js` — router, tema, form, admin, dan inisialisasi.
- `js/features/` — slider klub, kuis kana, dan kata harian.
- `js/data.js` / `js/store.js` — data belajar / penyimpanan lokal atau online.
- `assets/` — logo, maskot, dan gambar.
- `tests/` — pemeriksaan otomatis.
- [`PANDUAN-KODE.md`](PANDUAN-KODE.md) — panduan lengkap, indeks fitur, alur data, dan troubleshooting.

## Jalankan lokal

Windows: klik dua kali **`MULAI-DISINI.bat`** dan biarkan jendela hitam tetap terbuka. Atau jalankan dari terminal di folder website:

```bash
python -m http.server 8000
```

Buka `http://localhost:8000/`. Login admin perlu HTTP/HTTPS; jangan buka `index.html` lewat `file://`.

## Tes

Jalankan dari folder website setelah mengubah file:

```bash
node --check js/main.js
node --check js/features/about-slider.js
node --check js/features/kana-quiz.js
node --check js/features/daily-word.js
node tests/features-smoke.test.cjs
node tests/site-structure.test.cjs
node tests/gallery-store.test.cjs
```

## Catatan

- Suara memakai Web Speech API bawaan browser; ketersediaan suara Jepang bergantung perangkat.
- Data mode lokal hanya tersimpan di browser/perangkat yang digunakan.
- Galeri tidak ditampilkan di website. Foto lama di Supabase dan penyimpanan perangkat tidak dihapus.

---

Dibuat untuk **Aozora Nihongo Club** · 青空の下で日本語を学ぼう
