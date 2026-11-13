# Panduan Lengkap Website Aozora Nihongo Club

Dokumen ini jadi peta utama untuk memahami, mencari, menguji, dan mengubah website. Cocokkan isi panduan dengan source sebelum mengedit; nama file dan label fitur di bawah mengikuti versi yang sedang dipakai.

> **Keamanan:** jangan menulis password, API key, token, hash login, atau connection string di panduan, komentar, tangkapan layar, maupun chat. File `js/config.js` berisi konfigurasi browser; jangan menaruh rahasia server seperti `service_role` di sana.

## 1. Ringkasan website

Website statis Aozora Nihongo Club (青空日本語), ekstrakurikuler bahasa Jepang SMK N 1 Purwokerto. Tidak memakai framework/build step. HTML menyusun isi, CSS mengatur tampilan, JavaScript menjalankan interaksi, `data.js` menyimpan materi belajar, dan `store.js` mengatur penyimpanan.

Bagian utama yang tersedia: Beranda dengan logo dan maskot, belajar Hiragana/Katakana, kuis kana, kata harian, kosakata, informasi kegiatan/slider klub, papan pesan dan formulir pesan pribadi, serta panel admin. **Menu/halaman Galeri tidak tampil di website.** Foto dan API penyimpanannya tidak dihapus.

## 2. Peta folder

```text
aozora-nihongo-club/
├── index.html                              # hasil gabungan siap dibuka/deploy
├── index.template.html                     # kerangka head + marker bagian
├── pages/                                  # sumber HTML per bagian situs
│   ├── navigation.html                     # navigasi atas dan dock HP
│   ├── home.html                           # hero Beranda dan dekorasi
│   ├── learning.html                       # kana, kuis, kata harian, kosakata
│   ├── activities.html                     # info kegiatan dan slider
│   ├── messages.html                       # form dan daftar pesan
│   ├── footer.html                         # penutup halaman
│   ├── dialogs.html                        # popup kana dan modal admin
│   └── scripts.html                        # urutan pemuatan JavaScript
├── tools/
│   └── build_html.py                       # gabungkan sumber HTML menjadi index.html
├── css/
│   ├── style.css                           # daftar import CSS; jaga urutannya
│   └── parts/
│       ├── 00-base.css                     # token, reset, latar, preloader
│       ├── 01-navigation.css               # navigasi desktop dan mobile
│       ├── 02-layout-buttons.css           # lebar halaman dan tombol
│       ├── 03-hero-mascot.css              # hero, logo, dan maskot
│       ├── 04-learning.css                 # kana, kosakata, pencarian
│       ├── 05-activities.css               # kegiatan dan slider
│       ├── 06-legacy-gallery.css           # aturan lama; UI Galeri tidak ada
│       ├── 07-messages.css                 # form dan daftar pesan
│       ├── 08-footer-admin.css             # footer, toast, modal admin
│       ├── 09-motion-accordion.css         # accordion dan gerak
│       └── 10-responsive-overrides.css     # HP, tema, dan aturan final.
├── js/
│   ├── config.js                           # pengaturan koneksi browser
│   ├── store.js                            # penyimpanan lokal/online
│   ├── data.js                             # data kana dan kosakata
│   ├── main.js                             # router, tema, form, admin, init
│   └── features/
│       ├── about-slider.js                 # slider pengenalan klub
│       ├── kana-quiz.js                    # kuis pilihan ganda
│       └── daily-word.js                   # kata harian
├── assets/                                 # logo dan gambar
├── tests/                                  # tes otomatis tanpa framework
├── PANDUAN-KODE.md                         # dokumentasi utama ini
└── README.md                               # pengantar dan cara menjalankan
```

## 3. Cari fitur langsung

| Fitur/yang mau diubah | Buka file | Cari teks/selector/fungsi |
|---|---|---|
| Judul/teks Beranda | `pages/home.html` | `id="home"`, `.hero-title`, `.hero-mascot` |
| Menu desktop dan dock HP | `pages/navigation.html`, `css/parts/01-navigation.css` | `#nav`, `#mobileDock`, `#navBurger` |
| Materi belajar | `pages/learning.html` | `data-learn`, `#kanaGroups`, `#vocabGrid` |
| Kegiatan klub | `pages/activities.html` | `data-page="kegiatan"`, `.slider` |
| Pesan dan kritik | `pages/messages.html` | `data-page="pesan"`, `#fbForm` |
| Footer | `pages/footer.html` | `.foot-inner` |
| Popup dan modal admin | `pages/dialogs.html` | `#kanaPop`, `#adminModal` |
| Dokumen hasil yang dibuka browser | `index.html` (dibuat otomatis) | jangan edit manual — edit `pages/` lalu build |
| Ilustrasi maskot besar di sisi hero | `pages/home.html`, `assets/mascot-hero.png` | `.hero-mascot` |
| Logo klub pada hero | `index.html`, `css/parts/03-hero-mascot.css` | `.hero-logo-badge` |
| Warna dan tema | `css/parts/00-base.css` | `:root`, `body.dark` |
| Navigasi atas dan dock HP | `index.html`, `css/parts/01-navigation.css` | `#nav`, `#mobileDock`, `.nav`, `.mobile-dock` |
| Lebar konten dan tombol | `css/parts/02-layout-buttons.css` | `.wrap`, `.btn`, `.hero-cta` |
| Bagian hero | `index.html`, `css/parts/03-hero-mascot.css` | `.hero`, `.hero-card`, `.logo-disc` |
| Materi belajar | `css/parts/04-learning.css` | `.kana-*`, `.vocab-*`, `.quiz-*`, `.kotd-*` |
| Info kegiatan | `css/parts/05-activities.css` | `.kegiatan-*`, `.forum-*`, `.slider` |
| Form dan daftar pesan | `css/parts/07-messages.css` | `.feedback-*`, `.private-*`, `.field` |
| Modal admin dan pemberitahuan | `css/parts/08-footer-admin.css` | `.modal`, `.toast`, `footer` |
| Layout HP dan gerak | `css/parts/10-responsive-overrides.css` | `@media`, `prefers-reduced-motion`, `.page-panel` |
| Ganti panel/hash browser | `js/main.js` | `routes`, `showRoute`, `popstate` |
| Hiragana/Katakana dan tanda belajar | `js/main.js`, `js/data.js` | `renderKana`, `buildChips`, `updateKanaProgress`, `HIRAGANA`, `KATAKANA` |
| Kuis kana | `js/features/kana-quiz.js`, `index.html` | `quiz()`, `#quizBox`, `#quizGo` |
| Kosakata/filter/pencarian | `js/main.js`, `js/data.js` | `renderVocab`, `buildVocabChips`, `KOSAKATA` |
| Kata harian dan suara | `js/features/daily-word.js`, `js/main.js` | `kotd()`, `speak()` |
| Info pertemuan | `js/main.js`, `js/store.js` | `loadForum`, `renderForum`, `getForum`, `setForum` |
| Slider pengenalan klub | `js/features/about-slider.js`, `index.html` | `SLIDES`, `#aboutSlides`, `#slideNext`, `#slidePrev` |
| Form dan daftar pesan publik | `js/main.js`, `js/store.js`, `index.html` | `fbForm`, `loadFeedback`, `renderFeedback`, `addFeedback` |
| Pesan pribadi | `js/main.js`, `js/store.js` | `loadPrivate`, `renderPrivateAdmin`, `addPrivate` |
| Login dan panel admin | `js/main.js`, `index.html` | `sha256`, `applyAdminUI`, `#adminModal` |
| Foto yang tersimpan lama | `js/store.js`, storage | `gallery`; jangan hapus atau tulis ulang data saat merapikan UI |
| Accordion dan gerak elemen | `css/parts/09-motion-accordion.css` | `.acc`, `.pop-in`, `@keyframes` |
| Override responsive dan tema | `css/parts/10-responsive-overrides.css` | `@media`, `prefers-reduced-motion`, `.page-panel` |
| CSS lama Galeri (tidak tampil) | `css/parts/06-legacy-gallery.css` | gaya yang tersisa; jangan menyalakan UI |
| Susunan CSS | `css/style.css` | daftar `@import`; aturan berikutnya dapat menimpa sebelumnya |

## 4. Cara bagian-bagian bekerja

### HTML — struktur

`<head>` berisi judul tab, deskripsi, font, dan stylesheet. `<body>` berisi navigasi, panel halaman, form, dialog, dan elemen tempat JS merender daftar. `id` harus unik karena tautan dan JS memakainya sebagai tujuan. `data-page` menandai panel utama; route seperti `#kuis` tetap membuka panel Belajar.

Script dimuat di akhir `index.html` dengan urutan berikut:

1. Pustaka Supabase dari CDN.
2. `js/config.js`.
3. `js/store.js`.
4. `js/data.js`.
5. `js/main.js`.
6. Tiga file `js/features/*.js`.

Jangan memindahkan file tanpa memeriksa dependensi. File fitur berjalan setelah data dan main siap.

### CSS — tampilan

`css/style.css` hanya daftar import. Sebelas berkas `css/parts/` memuat aturan CSS dalam urutan cascade yang sama seperti sebelum dipisah. Jaga daftar `@import`: aturan belakangan dapat menimpa aturan awal. Mulai dari token di `00-base.css` untuk warna global. Selector `.kelas` memilih elemen ber-class; `#id` memilih satu elemen; `@media` menyesuaikan lebar layar. `06-legacy-gallery.css` hanya berisi aturan lama yang tidak terpakai oleh UI; jangan anggap Galeri masih tersedia. Tambahkan aturan dekat dengan bagian yang dimiliki, bukan override acak di akhir file.

### JavaScript — interaksi

`main.js` memakai `$()` untuk satu elemen dan `$$()` untuk banyak elemen. Kode utama dibungkus IIFE agar variabel internal tidak bocor. `window.AOZORA` menyediakan beberapa helper yang dipakai file fitur lain, termasuk suara. `data.js` mendefinisikan materi; fungsi render membentuk HTML untuk panel belajar. Konten input pengguna harus di-escape sebelum dimasukkan sebagai HTML.

Tiga fitur yang dipisah memakai data/helper yang sama, tetapi punya scope sendiri. `kana-quiz.js` mengambil data kana dan membuat kuis; `daily-word.js` memakai kosakata dan helper suara; `about-slider.js` memasang tombol serta slide pengenalan klub.

## 5. Data dan penyimpanan

Alurnya: pengunjung melakukan aksi → fungsi fitur memvalidasi → `window.Store` membaca/menulis → halaman merender hasil. Saat koneksi online siap, `store.js` menggunakan backend; tanpa konfigurasi yang berjalan, ia memakai penyimpanan lokal browser. Penyimpanan lokal hanya ada pada browser/perangkat itu, tidak otomatis dibagikan ke pengunjung lain.

`data.js` berisi array `HIRAGANA`, `KATAKANA`, dan `KOSAKATA`. Objek kana menyimpan karakter, romaji, dan kelompok; objek kosakata menyimpan tulisan Jepang, bacaannya, arti, dan kategori.

Menghapus tombol/halaman tidak sama dengan menghapus data. UI Galeri sudah tidak ada. Jangan jalankan penghapusan tabel/bucket atau bersihkan `localStorage` sebagai bagian dari edit tampilan. Foto lama tetap di penyimpanannya.

Status admin di front-end tidak setara dengan kontrol keamanan server. Jangan masukkan secret server ke kode browser; perubahan akses produksi perlu autentikasi/policy backend yang benar.

### Mengubah isi HTML

1. Edit bagian yang sesuai di folder `pages/` (misalnya `pages/home.html` untuk Beranda).
2. Jalankan `python tools/build_html.py` dari folder project. Perintah ini membuat ulang `index.html` untuk browser dan GitHub Pages.
3. Jangan mengedit `index.html` langsung; perubahan berikutnya akan ditimpa builder.

`index.template.html` memegang kerangka `<head>` dan marker urutan bagian. Builder hanya menggabungkan berkas HTML saat pengembangan/publish; browser tetap membaca satu `index.html` biasa.

## 6. Menjalankan dan memeriksa lokal

Di Windows, klik dua kali `MULAI-DISINI.bat` pada folder website. Biarkan jendela hitam tetap terbuka, lalu buka URL lokal yang ditampilkan. Alternatif dari terminal di folder website:

```bash
python -m http.server 8000
```

Lalu buka `http://localhost:8000/`. Jangan buka `index.html` dengan `file://` karena beberapa fitur browser (misalnya hash kriptografi admin) memerlukan HTTP/HTTPS.

Tes dasar setelah mengedit:

```bash
node --check js/main.js
node --check js/features/about-slider.js
node --check js/features/kana-quiz.js
node --check js/features/daily-word.js
node tests/gallery-store.test.cjs
node tests/site-structure.test.cjs
```

Periksa desktop dan HP: Beranda, navigasi ke Belajar/Kegiatan/Pesan, pencarian kana/kosakata, tombol tema, kuis, slider, form, serta panel admin. Pastikan halaman Galeri tidak muncul lagi.

## 7. Troubleshooting cepat

| Gejala | Periksa |
|---|---|
| Tampilan CSS kosong/berantakan | URL file di `css/style.css`, urutan import, tab Network untuk 404 |
| Tombol kuis atau slider tidak merespons | URL script pada akhir `index.html`, urutannya, lalu Console browser |
| Data lokal tidak terlihat di HP lain | `localStorage` bersifat lokal; periksa mode `window.Store.mode` |
| Hash link membuka panel yang salah | daftar `routes` dan atribut `data-page` di HTML |
| Perubahan tidak terlihat | server mengarah ke folder yang benar; lakukan refresh paksa |
| Nama fitur sulit dicari | gunakan tabel bagian 3; cari nama fungsi dengan `Ctrl+F` di file yang tertera |

## 8. Cara aman mengubah proyek

1. Simpan salinan atau buat commit sebelum perubahan.
2. Ubah satu fitur kecil; jangan format ulang semua file sekaligus.
3. Jalankan pemeriksaan syntax dan tes di atas.
4. Buka situs lokal, cek desktop dan HP.
5. Jangan mengubah `config.js`, tabel, bucket, atau data simpanan untuk perubahan tampilan.
6. Sebelum menerbitkan, periksa daftar file berubah dan pastikan tidak ada rahasia.

## 9. Istilah singkat

- **DOM:** susunan elemen HTML yang dibaca browser.
- **Selector:** pola untuk menemukan elemen HTML dari CSS/JavaScript.
- **Route/hash:** nama panel pada bagian akhir URL, misalnya `#belajar`.
- **IIFE:** fungsi yang langsung dijalankan dan membatasi scope variabel.
- **localStorage:** tempat menyimpan data sederhana pada satu browser.
- **Responsive:** tampilan menyesuaikan lebar layar, bukan merek perangkat.
- **Cascade:** urutan dan tingkat kekhususan yang menentukan aturan CSS yang berlaku.
