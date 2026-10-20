# Panduan Belajar Kode — Aozora Nihongo Club

Dokumen ini menjelaskan **cara kerja website** dan **kegunaan tiap kode**.
Ditulis buat kamu yang sedang belajar HTML & CSS. Baca pelan-pelan, tidak perlu hafal.

---

## 1. Tiga Bahasa, Tiga Tugas

Website itu seperti rumah:

| Bahasa | Ibarat rumah | Tugas |
|---|---|---|
| **HTML** | Dinding & ruangan | Isi & struktur — mana judul, mana tombol, mana gambar |
| **CSS** | Cat & perabot | Tampilan — warna, ukuran, jarak, animasi |
| **JavaScript** | Listrik & saklar | Perilaku — yang bergerak saat diklik |

Ketiganya **dipisah ke file berbeda**. Ini disebut *Separation of Concerns*
(memisahkan tanggung jawab) — supaya kalau mau ganti warna, tidak perlu
mengutak-atik data huruf Jepang.

---

## 2. Peta File

```
aozora-nihongo-club/
├── index.html          <- kerangka halaman (baca ini dulu)
├── css/
│   └── style.css       <- semua tampilan & warna
├── js/
│   ├── config.js       <- alamat & kunci database
│   ├── store.js        <- petugas simpan/ambil data
│   ├── data.js         <- daftar huruf kana & kosakata
│   └── main.js         <- otak: tampilan & interaksi
└── assets/             <- gambar & logo
```

**Urutan belajar yang disarankan:**

1. `index.html` — kenali bagian-bagiannya dulu
2. `css/style.css` bagian `:root` (variabel warna)
3. `js/data.js` — paling mudah, cuma daftar
4. `js/main.js` — baru logika, pelan-pelan

---

## 3. HTML — Struktur

### Bentuk dasar sebuah tag

```html
<h1 class="judul" id="utama">Halo</h1>
```

- `<h1>` = jenis elemen (heading/judul)
- `class="judul"` = nama panggilan, **boleh dipakai banyak elemen**
- `id="utama"` = nama unik, **hanya satu di satu halaman**
- `</h1>` = penutup

### Kapan pakai class, kapan id?

| | `class` | `id` |
|---|---|---|
| Jumlah | banyak elemen | satu-satunya |
| CSS | `.judul { }` | `#utama { }` |
| JS | `querySelector(".judul")` | `getElementById("utama")` |
| Dipakai untuk | gaya tampilan | penanda unik / target JS |

**Aturan simpel:** pakai `class` untuk gaya, `id` untuk yang dicari JavaScript.

### Tag semantik

Selain `<div>`, HTML5 punya tag yang namanya menjelaskan isinya:

| Tag | Arti |
|---|---|
| `<nav>` | menu navigasi |
| `<header>` | bagian pembuka |
| `<section>` | satu bagian/bab |
| `<article>` | konten mandiri (contoh: satu kartu) |
| `<footer>` | penutup halaman |

Gunanya: memudahkan pembaca layar (untuk teman difabel) dan mesin pencari
memahami halaman. `<div>` tidak salah, tapi tidak menjelaskan apa pun.

### Komentar HTML

```html
<!-- ini komentar, tidak tampil di browser -->
```

Dipakai untuk menandai bagian supaya kamu (atau orang lain) mudah mencarinya
bulan depan.

---

## 4. CSS — Tampilan

### Bentuk dasar

```css
.kartu {
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
}
```

Dibaca: *"semua elemen ber-class `kartu`: latarnya putih, jarak dalam 20px,
sudutnya bulat 16px."*

### Box Model — ini paling penting

Setiap elemen itu seperti kotak berlapis:

```
┌─────────────────────────┐
│  margin (jarak luar)    │
│  ┌───────────────────┐  │
│  │ border (garis)    │  │
│  │ ┌───────────────┐ │  │
│  │ │ padding (dalam)│ │  │
│  │ │   CONTENT      │ │  │
│  │ └───────────────┘ │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

- **padding** = jarak isi ke dinding dalam
- **margin** = jarak kotak ke kotak lain
- **border** = garis dinding

Bingung kenapa elemen melebar padahal sudah diatur lebarnya? Biasanya karena
`box-sizing`. Di file ini kita pakai `border-box`, artinya lebar **sudah
termasuk** padding & border — jauh lebih mudah diperhitungkan.

### Variabel CSS — kunci utama file ini

Di bagian paling atas `style.css`:

```css
:root{
  --teal: #43c7be;
  --ink:  #1f3038;
}
```

Lalu dipakai di mana-mana:

```css
body { color: var(--ink); }
```

**Kenapa penting?** Ganti satu nilai `--teal`, seluruh website ikut berubah.
Tanpa variabel, kamu harus mencari 50 tempat berbeda.

### Dark mode cuma soal menimpa variabel

```css
body.dark{
  --teal: #46cfc5;
  --ink:  #e9f7f5;
}
```

Saat `<body>` punya class `dark`, semua nilai diganti. Tidak ada satu pun
elemen yang diubah satu-satu. Itulah triknya.

### Flexbox vs Grid

| | Flexbox | Grid |
|---|---|---|
| Arah | satu arah (baris **atau** kolom) | dua arah (baris **dan** kolom) |
| Cocok untuk | menu, barisan tombol | galeri, tata letak kartu |
| Kunci | `display:flex` | `display:grid` |

Contoh di proyek ini: `.nav` pakai Flexbox (deretan menu), `.kana-grid`
pakai Grid (kotak huruf rapi otomatis).

### Media query — bikin responsif

```css
@media (max-width: 768px){
  .nav-links { display: none; }
}
```

Artinya: *"kalau layar 768px atau lebih kecil (HP/tablet), sembunyikan menu."*

Itu satu-satunya cara web tahu beda HP dan laptop — bukan dari merek
perangkatnya, tapi dari **lebar layar**.

### Animasi yang tidak bikin lag

```css
/* BAGUS — ringan, diproses GPU */
.kotak { transform: translateY(-10px); opacity: .5; }

/* BERAT — memaksa browser menghitung ulang tata letak */
.kotak { top: -10px; height: 200px; }
```

**Aturan:** animasikan `transform` dan `opacity` saja. Itu alasan di bagian
media query HP kita matikan `filter:blur()` — blur itu mahal.

---

## 5. Alur Data Website Ini

```
data.js  (angka & huruf mentah)
   ↓
main.js  (ambil data, susun jadi HTML)
   ↓
index.html  (wadah kosong: <div id="kanaGroups">)
   ↓
style.css  (rapikan tampilannya)
```

Perhatikan: `index.html` **tidak** berisi 104 huruf kana. Isinya cuma wadah
kosong. Hurufnya dibuat JavaScript dari `data.js`.

**Kenapa?** Karena kalau tulis manual, menambah satu huruf berarti mengedit
HTML. Dengan cara ini, cukup tambah satu baris di `data.js`.

---

## 6. Contekan Jawaban Kalau Ditanya

**"Kenapa tidak pakai React atau Bootstrap?"**

> Karena ini web profil eskul yang harus ringan di HP siswa. Tanpa framework,
> ukuran file kecil, tidak ada proses build, dan saya belajar dasarnya
> (HTML/CSS/JS) langsung — bukan menghafal cara kerja library.

**"Bagaimana web tahu ini HP atau laptop?"**

> Lewat media query, bukan deteksi perangkat. CSS mengecek lebar layar:
> di bawah 768px, tata letak berubah jadi satu kolom dan menu jadi tombol
> burger.

**"Bagaimana cara ganti tema gelap/terang?"**

> Semua warna disimpan sebagai variabel CSS di `:root`. Mode gelap adalah
> class `dark` pada `<body>` yang menimpa nilai variabel itu. JavaScript
> cuma menambah/mencabut class, lalu menyimpan pilihan di `localStorage`
> supaya tidak hilang saat di-refresh.

**"Kenapa huruf kana tidak langsung muncul semua? (accordion)"**

> Teknik *lazy rendering*. Awalnya browser hanya membuat judul kelompoknya.
> Isi huruf baru dibuat saat diklik. Jadi HP tidak perlu menyiapkan ratusan
> elemen sekaligus — ini yang membuat scroll tetap mulus.

**"Di mana data pesan disimpan?"**

> Lewat `store.js` yang bekerja dua mode: kalau database online (Supabase)
> terisi, data masuk ke sana sehingga semua orang melihat pesan yang sama.
> Kalau tidak, otomatis disimpan di `localStorage` perangkat.

**"Kenapa nama pengirim disamarkan?"**

> Nama asli tetap tersimpan demi akuntabilitas pengurus, tapi yang tampil ke
> publik diubah jadi samaran tetap seperti "Pengunjung 123". Hanya admin
> yang bisa melihat nama aslinya.

---

## 7. Cara Latihan Sendiri

1. **Ubah satu warna** — cari `--teal` di `style.css`, ganti nilainya,
   refresh. Lihat apa yang berubah.
2. **Ubah teks** — di `index.html`, cari `Ganbaruzo!`, ganti.
3. **Tambah kosakata** — buka `js/data.js`, tiru satu baris yang sudah ada,
   ganti isinya.
4. **Matikan satu animasi** — cari nama `@keyframes`, hapus sementara
   pemakaian `animation:`-nya.
5. **Bongkar satu bagian** — komentari satu `<section>` dengan `<!-- -->`,
   lihat bagian mana yang hilang.

Cara tercepat paham CSS: **ubah angka, lihat hasilnya.** Jangan takut rusak —
selalu simpan salinan file sebelum bereksperimen.

---

## 8. Istilah yang Sering Muncul

| Istilah | Arti singkat |
|---|---|
| **Selector** | penunjuk elemen yang mau diatur (`.nav`, `#kana`) |
| **Property** | hal yang diatur (`color`, `padding`) |
| **Value** | nilainya (`red`, `20px`) |
| **Class** | nama panggilan elemen, boleh banyak |
| **ID** | nama unik elemen, hanya satu |
| **DOM** | struktur halaman yang sudah dibaca browser |
| **Selector specificity** | aturan siapa menang kalau ada 2 gaya bentrok (id > class > tag) |
| **Responsive** | tampilan menyesuaikan ukuran layar |
| **z-index** | urutan tumpukan (makin besar makin depan) |
| **localStorage** | penyimpanan kecil di browser, bertahan walau ditutup |
