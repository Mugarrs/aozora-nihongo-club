/* Kuis pilihan ganda Hiragana/Katakana; data berasal dari js/data.js. */
(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
  /* =======================================================
     KUIS KANA
     ======================================================= */
  (function quiz() {
    const TOTAL = 10;
    let qScript = "hiragana",
      questions = [],
      idx = 0,
      score = 0,
      answered = false;
    const startEl = $("#quizStart"),
      playEl = $("#quizPlay"),
      doneEl = $("#quizDone");
    const glyphEl = $("#quizGlyph"),
      optsEl = $("#quizOpts"),
      fbEl = $("#quizFb"),
      numEl = $("#quizNum");

    $$("#quizBox .quiz-tabs .tab").forEach((t) =>
      t.addEventListener("click", () => {
        qScript = t.dataset.qs;
        $$("#quizBox .quiz-tabs .tab").forEach((x) => x.classList.toggle("active", x === t));
      }),
    );

    function pool() {
      if (qScript === "campur") return [...HIRAGANA, ...KATAKANA];
      return qScript === "katakana" ? [...KATAKANA] : [...HIRAGANA];
    }
    function shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    // generate memilih soal acak dan membuat pilihan jawaban.
    function generate() {
      const p = pool();
      shuffle(p);
      const picked = p.slice(0, TOTAL);
      const allRom = [...new Set(p.map((x) => x.r))];
      questions = picked.map((q) => {
        const wrongs = shuffle(allRom.filter((r) => r !== q.r)).slice(0, 3);
        return { glyph: q.k, answer: q.r, opts: shuffle([q.r, ...wrongs]) };
      });
    }

    function show() {
      const q = questions[idx];
      numEl.textContent = idx + 1;
      glyphEl.textContent = q.glyph;
      glyphEl.style.animation = "none";
      void glyphEl.offsetWidth;
      glyphEl.style.animation = "";
      fbEl.textContent = "";
      fbEl.className = "quiz-fb";
      answered = false;
      optsEl.innerHTML = q.opts
        .map((o) => `<button class="quiz-opt" data-r="${esc(o)}">${esc(o)}</button>`)
        .join("");
      optsEl.querySelectorAll(".quiz-opt").forEach((b) => b.addEventListener("click", () => pick(b)));
    }

    // pick menilai jawaban sekali, memperbarui skor, lalu lanjut ke soal berikutnya.
    function pick(btn) {
      if (answered) return;
      answered = true;
      const q = questions[idx],
        chosen = btn.dataset.r;
      optsEl.querySelectorAll(".quiz-opt").forEach((b) => {
        b.classList.add("disabled");
        if (b.dataset.r === q.answer) b.classList.add("correct");
      });
      if (chosen === q.answer) {
        score++;
        btn.classList.add("correct");
        fbEl.textContent = "Benar!";
        fbEl.className = "quiz-fb ok";
      } else {
        btn.classList.add("wrong");
        fbEl.textContent = `Salah — jawabannya "${q.answer}"`;
        fbEl.className = "quiz-fb bad";
      }
      setTimeout(() => {
        idx++;
        if (idx < TOTAL) show();
        else finish();
      }, 1200);
    }

    function finish() {
      playEl.classList.add("hidden");
      doneEl.classList.remove("hidden");
      $("#quizScore").textContent = score;
      const pct = score / TOTAL;
      $("#quizVerdict").textContent =
        pct === 1
          ? "Sempurna! Kamu luar biasa!"
          : pct >= 0.7
            ? "Bagus! Terus latihan ya."
            : pct >= 0.4
              ? "Lumayan, coba lagi biar makin hafal."
              : "Jangan menyerah — ulangi pelan-pelan.";
    }

    // start mengatur ulang ronde dan menampilkan pertanyaan pertama.
    function start() {
      generate();
      idx = 0;
      score = 0;
      startEl.classList.add("hidden");
      doneEl.classList.add("hidden");
      playEl.classList.remove("hidden");
      show();
    }

    $("#quizGo").addEventListener("click", start);
    $("#quizRetry").addEventListener("click", start);
    $("#quizBack").addEventListener("click", () => {
      playEl.classList.add("hidden");
      doneEl.classList.add("hidden");
      startEl.classList.remove("hidden");
    });
  })();
})();
