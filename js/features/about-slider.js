/* Slider pengenalan klub; berjalan setelah HTML dan main.js siap. */
(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  /* =======================================================
     SLIDER TENTANG
     ======================================================= */
  const SLIDES = [
    {
      e: "Tentang kami",
      t: "Bukan kelas yang tegang",
      p: "Di Aozora, kamu nggak harus sudah bisa bahasa Jepang buat mulai. Kita belajar santai, banyak ketawa, dan saling bantu. Yang penting berani coba.",
    },
    {
      e: "Cara belajar",
      t: "Satu huruf sehari, cukup",
      p: "Kita mulai dari hiragana & katakana, lanjut ke kosakata yang sering dipakai. Ada juga latihan ngobrol biar makin percaya diri.",
    },
    {
      e: "Siapa saja boleh",
      t: "Terbuka buat semua jurusan",
      p: "Mau dari TKJ, RPL, atau jurusan lain — semua boleh ikut. Nggak ada syarat khusus, cuma niat buat belajar bareng.",
    },
    {
      e: "Suasana",
      t: "Kadang belajar, kadang seru-seruan",
      p: "Sesekali kita bikin origami, kaligrafi, dengar lagu Jepang, atau sekadar ngobrol soal anime. Belajar jadi nggak membosankan.",
    },
    {
      e: "Pesan pengurus",
      t: "Jangan takut salah",
      p: "Salah itu bagian dari belajar. Justru dari salah kita cepat paham. Jadi, berani tampil dan tanya, ya!",
    },
  ];
  // slider mengisi isi slideshow dan menangani panah, titik, serta jeda otomatis.
  (function slider() {
    const wrap = $("#aboutSlides"),
      dots = $("#slideDots");
    if (!wrap) return;
    wrap.innerHTML = SLIDES.map(
      (s) =>
        `<div class="slide"><span class="s-eyebrow">${s.e}</span><h3>${s.t}</h3><p>${s.p}</p></div>`,
    ).join("");
    dots.innerHTML = SLIDES.map(
      (_, i) =>
        `<button data-i="${i}" class="${i === 0 ? "on" : ""}" aria-label="Slide ${i + 1}"></button>`,
    ).join("");
    let idx = 0,
      timer;
    const go = (i) => {
      idx = (i + SLIDES.length) % SLIDES.length;
      wrap.style.transform = `translateX(-${idx * 100}%)`;
      dots.querySelectorAll("button").forEach((b, j) => b.classList.toggle("on", j === idx));
    };
    const next = () => go(idx + 1),
      prev = () => go(idx - 1);
    const restart = () => {
      clearInterval(timer);
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(next, 5200);
    };
    $("#slideNext").addEventListener("click", () => {
      next();
      restart();
    });
    $("#slidePrev").addEventListener("click", () => {
      prev();
      restart();
    });
    dots.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => {
        go(+b.dataset.i);
        restart();
      }),
    );
    restart();
  })();
})();
