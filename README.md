# AOZORA NIHONGO CLUB — 青空日本語

Website ekstrakurikuler bahasa Jepang **SMK N 1 Purwokerto**.

Fitur: Hiragana & Katakana (per kelompok baris, ada suara), kosakata, info pertemuan
yang bisa diubah pengurus, galeri dokumentasi, papan pesan & kritik anonim + like,
dan pesan pribadi ke pengurus. Ada mode gelap/terang & animasi.

---

## 🔑 Login Pengurus (admin)

| | |
|---|---|
| **Username** | `admin` |
| **Password** | `aozora2026` |

Tombol **Admin** ada di **pojok kiri atas**. Ganti password: cari `ADMIN_HASH` di
`js/main.js`, isi dengan hasil SHA-256 password baru
(buka https://emn178.github.io/online-tools/sha256.html).

---

## ⚙️ DUA MODE: lokal vs online

- **Mode lokal** (default, belum diatur): data (pesan, foto, info) disimpan di
  **perangkat masing-masing**. Cocok untuk uji coba. Pesan dari orang lain **tidak**
  terlihat lintas perangkat.
- **Mode online** (Supabase): semua data tersimpan di satu database, jadi pesan dari
  siapa pun terkumpul dan bisa dilihat pengurus. **Ini yang dipakai kalau web sudah
  dibuka banyak orang.**

Web otomatis mendeteksi mode. Kalau `js/config.js` masih kosong → mode lokal.

---

## 🌐 CARA 1 — Publikasikan ke GitHub Pages

1. **Buat repository baru** di GitHub (mis. `aozora-nihongo-club`), jangan dicentang README.
2. **Upload semua file** folder ini ke repo:
   - Cara gampang: di halaman repo klik **Add file → Upload files**, lalu seret semua
     isi folder `aozora-nihongo-club` (termasuk folder `assets`, `css`, `js`).
   - Klik **Commit changes**.
3. Masuk **Settings → Pages**.
4. Bagian **Build and deployment → Source**: pilih **Deploy from a branch**.
5. **Branch**: pilih `main`, folder `/ (root)`, lalu **Save**.
6. Tunggu 1–2 menit. Link web muncul: `https://<username>.github.io/<repo>/`

> Catatan: login pengurus butuh `crypto` yang aktif di https — GitHub Pages sudah https,
> jadi aman.

---

## 🗄️ CARA 2 — Pasang database Supabase (biar pesan terkumpul)

**1. Buat akun & project**
- Buka https://supabase.com → **Start your project** → daftar (gratis).
- **New project** → isi nama (mis. `aozora`), pilih region terdekat, buat password DB.

**2. Buat tabel-tabelnya**
- Di dashboard project, buka **SQL Editor → New query**.
- Buka file **`supabase-schema.sql`** di folder ini, **copy semua isinya**, tempel ke
  editor, lalu klik **Run**. (Ini membuat tabel feedback, private_messages, gallery,
  forum + izin akses.)

**3. Ambil kunci API**
- Buka **Project Settings (ikon gerigi) → API**.
- Copy dua hal:
  - **Project URL** (contoh: `https://abcdefghijklmn.supabase.co`)
  - **anon / public** key (kunci panjang)

**4. Isi ke web**
- Buka file **`js/config.js`**, isi seperti ini:
  ```js
  window.AOZORA_CONFIG = {
    supabaseUrl: "https://abcdefghijklmn.supabase.co",
    supabaseKey: "eyJhbGciOi... (anon key) ...",
  };
  ```
- Simpan, lalu **upload ulang** `js/config.js` ke GitHub (atau push kalau pakai git).

**5. Selesai**
- Buka web → sekarang pesan, pesan pribadi, foto, dan info pertemuan tersimpan
  **online** dan bisa dilihat dari HP mana saja.

> ✅ Kunci `anon` memang untuk dipakai di web (bukan rahasia).
> ⚠️ Jangan pernah menaruh **service_role key** di file web.

---

## 📁 Struktur

```
aozora-nihongo-club/
├── index.html            # halaman utama
├── css/style.css         # semua style + animasi (terang & gelap)
├── js/
│   ├── config.js         # ⬅️ isi kredensial Supabase di sini
│   ├── store.js          # otomatis pilih Supabase / lokal
│   ├── data.js           # data hiragana, katakana, kosakata
│   └── main.js           # logika interaksi
├── assets/               # logo (jpg + png tanpa background)
├── supabase-schema.sql   # ⬅️ tempel ke Supabase SQL Editor
├── MULAI-DISINI.bat      # jalankan server lokal (Windows)
└── README.md
```

## 💻 Menjalankan di komputer sendiri

Klik 2× **`MULAI-DISINI.bat`** (Windows) → browser terbuka otomatis.
Atau lewat terminal:
```bash
python -m http.server 8000
# buka http://localhost:8000
```
Login pengurus hanya bisa diverifikasi lewat `http://localhost` atau `https://`
(tidak bisa dari `file://`).

---

## 📝 Catatan
- Suara memakai Web Speech API bawaan browser (voice Jepang kalau tersedia).
- Foto galeri: disarankan pakai **link/URL** (mis. upload ke Google Drive/imgur lalu
  ambil link). Unggah file dibatasi ~3.5MB karena disimpan sebagai teks.
- Kalau mau semua orang bisa mengirim foto langsung, foto bisa diunggah ke
  **Supabase Storage** (fitur lanjutan).

---
Dibuat untuk **Aozora Nihongo Club** · 青空の下で日本語を学ぼう
