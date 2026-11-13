/* Kata harian: kosakata dari data.js dan helper suara dari main.js. */
(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  /* =======================================================
     KATA HARI INI
     ======================================================= */
  (function kotd() {
    // Hash tanggal hari ini supaya kata berubah tiap hari
    const d = new Date(),
      seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    const word = KOSAKATA[seed % KOSAKATA.length];
    if (!word) return;
    $("#kotdJp").textContent = word.jp;
    $("#kotdKana").textContent = word.kana;
    $("#kotdId").textContent = word.id;
    $("#kotdKat").textContent = word.kat;
    $("#kotdSpeak").addEventListener("click", () => window.AOZORA.speak(word.jp));
  })();
})();
