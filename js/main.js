/* =========================================================
   AOZORA NIHONGO CLUB — interaksi utama
   Peta: helper/tema/router → belajar → forum/pesan/admin → statistik/init.
   Kuis, slider klub, dan kata harian ada di js/features/.
   ========================================================= */
(() => {
  "use strict";

  // $ mengambil satu elemen; $$ di bawah mengambil semua elemen yang cocok.
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  // Nama kunci tersentral agar data perangkat konsisten dan mudah diberi versi.
  const LS = {
    kana: "aozora.kanaDone.v1",
    fb: "aozora.feedback.v1",
    pv: "aozora.private.v1",
    forum: "aozora.forum.v1",
    gal: "aozora.gallery.v1",
    theme: "aozora.theme",
    device: "aozora.deviceId",
  };
  // load membaca JSON dengan aman; data rusak/missing kembali ke nilai default.
  const load = (k, d) => {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? d;
    } catch {
      return d;
    }
  };
  // save menyimpan nilai sebagai JSON; kegagalan kuota tidak menghentikan halaman.
  const save = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  };
  // esc mengubah karakter khusus sebelum teks pengguna dimasukkan ke HTML.
  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );

  /* ---------- IKON SVG (pengganti emoji) ---------- */
  const I = {
    saran: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.5.4.8 1 .8 1.6V17h5.6v-1.6c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3z"/></svg>`,
    kritik: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L18 10l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>`,
    ide: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/></svg>`,
    apres: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 20s-7-4.4-9.3-8.4C1.1 8.9 2.7 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.3 0 4.9 3.4 3.3 6.1C19 15.6 12 20 12 20z"/></svg>`,
    lain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"/></svg>`,
    star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 3l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4L7.5 16.8l.9-5L4.8 8.3l5-.7z"/></svg>`,
    heart: (on) =>
      '<svg viewBox="0 0 24 24" fill="' +
      (on ? "currentColor" : "none") +
      '" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 20s-7-4.4-9.3-8.4C1.1 8.9 2.7 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.3 0 4.9 3.4 3.3 6.1C19 15.6 12 20 12 20z"/></svg>',
  };
  // TYPES menyatukan label kategori dan SVG ikon untuk dropdown pesan.
  const TYPES = [
    { v: "Saran", ic: I.saran },
    { v: "Kritik", ic: I.kritik },
    { v: "Ide Kegiatan", ic: I.ide },
    { v: "Apresiasi", ic: I.apres },
    { v: "Lainnya", ic: I.lain },
  ];

  /* ---------- TOAST ---------- */
  const toastWrap = $("#toastWrap");
  // toast memberi pemberitahuan singkat tanpa memindahkan halaman.
  function toast(msg, ms = 2600) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<span class="dot"></span><span>${esc(msg)}</span>`;
    toastWrap.appendChild(el);
    setTimeout(() => {
      el.classList.add("out");
      setTimeout(() => el.remove(), 320);
    }, ms);
  }

  /* ---------- TEMA ---------- */
  (function theme() {
    const root = document.documentElement,
      body = document.body;
    const stored = localStorage.getItem(LS.theme);
    const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
    const startDark = stored ? stored === "dark" : root.classList.contains("dark-pre") || prefersDark;
    body.classList.toggle("dark", startDark);
    root.classList.remove("dark-pre");
    $("#themeToggle")?.addEventListener("click", () => {
      const dark = !body.classList.contains("dark");
      body.classList.toggle("dark", dark);
      localStorage.setItem(LS.theme, dark ? "dark" : "light");
      toast(dark ? "Mode gelap aktif" : "Mode terang aktif");
    });
  })();

  /* ---------- KELOPAK SAKURA ---------- */
  (function petals() {
    const box = $("#petals");
    if (!box || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const count = innerWidth < 640 ? 6 : 14;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "petal";
      const size = 9 + Math.random() * 10;
      p.style.left = Math.random() * 100 + "%";
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.opacity = (0.5 + Math.random() * 0.5).toFixed(2);
      p.style.animationDuration =
        (7 + Math.random() * 8).toFixed(1) + "s, " + (2 + Math.random() * 2).toFixed(1) + "s";
      p.style.animationDelay =
        (-Math.random() * 12).toFixed(1) + "s, " + (-Math.random() * 3).toFixed(1) + "s";
      box.appendChild(p);
    }
  })();

  /* ---------- PRELOADER ---------- */
  (function preloader() {
    const pre = $("#preloader"),
      bar = $("#plBar"),
      pct = $("#plPct"),
      tip = $("#plTip");
    const tips = [
      "Menyiapkan kelas…",
      "Memuat hiragana…",
      "Memuat katakana…",
      "Menyusun kosakata…",
      "ようこそ！",
    ];
    let p = 0,
      done = false;
    const t = setInterval(() => {
      p += Math.random() * 22 + 14;
      if (p >= 100) {
        p = 100;
        clearInterval(t);
        finish();
      }
      bar.style.width = p + "%";
      pct.textContent = Math.floor(p);
      tip.textContent = tips[Math.min(tips.length - 1, Math.floor(p / 22))];
    }, 110);
    // finish menutup preloader dan melepas class locked setelah animasi selesai.
    function finish() {
      if (done) return;
      done = true;
      setTimeout(() => {
        pre.classList.add("done");
        document.body.classList.remove("locked");
        revealInit();
      }, 200);
    }
    // Batas waktu memastikan pengunjung HP tidak tertahan di layar loading.
    setTimeout(finish, 2200);
  })();

  /* ---------- CURSOR ---------- */
  (function cursor() {
    if (matchMedia("(pointer:coarse)").matches) return;
    const dot = $("#cursorDot"),
      ring = $("#cursorRing");
    let mx = innerWidth / 2,
      my = innerHeight / 2,
      rx = mx,
      ry = my;
    addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(loop);
    })();
    const sel = "a,button,.kana-cell,.vocab-card,.chip,.tab,input,textarea,.select-btn";
    addEventListener("mouseover", (e) => {
      if (e.target.closest(sel)) document.body.classList.add("cursor-hover");
    });
    addEventListener("mouseout", (e) => {
      if (e.target.closest(sel)) document.body.classList.remove("cursor-hover");
    });
  })();

  /* ---------- ROUTER HALAMAN ----------
     Satu panel aktif seperti aplikasi. Hash lama tetap diarahkan ke subtab Belajar.
     History menyimpan route, sehingga tombol Back/Forward memulihkan panel. */
  const nav = $("#nav"),
    burger = $("#navBurger"),
    navLinks = $("#navLinks");
  const progress = $("#scrollProgress"),
    toTop = $("#toTop");
  const pagePanels = $$("[data-page]"),
    learnPanes = $$("[data-learn]");
  // routes menerjemahkan hash URL ke panel; subfitur belajar tetap dalam satu panel.
  const routes = new Map([
    ["home", "home"],
    ["belajar", "belajar"],
    ["kana", "belajar"],
    ["kuis", "belajar"],
    ["kotd", "belajar"],
    ["kosakata", "belajar"],
    ["kegiatan", "kegiatan"],
    ["pesan", "pesan"],
  ]);
  let currentPage = "home",
    currentLearn = "kana";
  // showRoute memilih panel, menyelaraskan menu/hash, dan menjaga riwayat browser.
  function showRoute(route, updateHistory = true) {
    const id = String(route || "home").replace(/^#/, "");
    const page = routes.get(id) || "home";
    if (page === "belajar" && learnPanes.some((p) => p.id === id)) currentLearn = id;
    currentPage = page;
    pagePanels.forEach((panel) => {
      const active = panel.dataset.page === page;
      panel.classList.toggle("hidden", !active);
      panel.setAttribute("aria-hidden", String(!active));
      if (active) {
        panel.classList.remove("page-enter");
        void panel.offsetWidth;
        panel.classList.add("page-enter");
        panel.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
      }
    });
    learnPanes.forEach((p) => {
      const active = p.id === currentLearn;
      p.classList.toggle("hidden", !active);
      p.setAttribute("aria-hidden", String(!active));
    });
    $$(".page-subnav a").forEach((a) => a.classList.toggle("active", a.hash === "#" + currentLearn));
    $$("#navLinks a,#mobileDock a").forEach((a) => {
      const active = routes.get(a.hash.slice(1)) === page;
      a.classList.toggle("active", active);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (updateHistory && location.hash !== "#" + id)
      window.history.pushState({ route: id }, "", "#" + id);
    window.scrollTo({
      top: 0,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
    navLinks?.classList.remove("open");
    burger?.classList.remove("open");
    setTimeout(() => pagePanels.forEach((p) => p.classList.remove("page-enter")), 280);
    onScroll();
  }
  // onScroll hanya memperbarui indikator visual; pilihan panel ditentukan router.
  function onScroll() {
    nav.classList.toggle("scrolled", scrollY > 12);
    toTop.classList.toggle("show", scrollY > 500);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.hash.slice(1);
    if (!routes.has(id)) return;
    e.preventDefault();
    showRoute(id);
  });
  addEventListener("popstate", () => showRoute(location.hash || "#home", false));
  /* Scroll reveal dinonaktifkan di panel: tidak ada elemen tertinggal transparan saat scroll. */
  // revealInit memastikan isi panel pertama tidak transparan setelah preloader hilang.
  function revealInit() {
    document
      .querySelectorAll("[data-page]:not(.hidden) .reveal")
      .forEach((el) => el.classList.add("in"));
  }
  addEventListener("load", revealInit);

  /* Penjelasan blok di atas: toast, tema, sakura, preloader, dan kursor. */

  /* ---------- SUARA (cepat, tanpa delay) ---------- */
  let jaVoice = null,
    voicesReady = false;
  // pickVoice memilih voice Jepang yang dipakai bersama oleh semua tombol suara.
  function pickVoice() {
    const vs = speechSynthesis.getVoices() || [];
    if (!vs.length) return;
    jaVoice =
      vs.find((v) => /^ja[-_]?JP/i.test(v.lang)) ||
      vs.find((v) => /japanese|日本語/i.test(v.name)) ||
      null;
    voicesReady = true;
  }
  if ("speechSynthesis" in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
    // "hangatkan" mesin suara supaya klik pertama tidak delay
    try {
      const w = new SpeechSynthesisUtterance(" ");
      w.volume = 0;
      w.lang = "ja-JP";
      speechSynthesis.speak(w);
      speechSynthesis.cancel();
    } catch {}
  }
  // speak meminta Web Speech API membacakan teks Jepang bila suara tersedia.
  function speak(text) {
    if (!("speechSynthesis" in window)) {
      toast("Perangkat ini belum mendukung suara");
      return;
    }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ja-JP";
      u.rate = 0.95;
      u.pitch = 1;
      u.volume = 1;
      if (jaVoice) u.voice = jaVoice;
      speechSynthesis.speak(u);
    } catch {
      toast("Gagal memutar suara");
    }
  }

  /* =======================================================
     KANA
     ======================================================= */
  let script = "hiragana",
    kanaRow = "Semua",
    kanaQuery = "";
  let kanaDone = load(LS.kana, {});
  const grid = $("#kanaGroups"),
    chips = $("#kanaChips"),
    kanaSearch = $("#kanaSearch");
  const data = () => (script === "hiragana" ? HIRAGANA : KATAKANA);
  const GROUP_ORDER = [
    "Vokal",
    "K",
    "S",
    "T",
    "N",
    "H",
    "M",
    "Y",
    "R",
    "W",
    "Dakuon",
    "Handakuon",
    "Youon",
  ];
  const GROUP_TITLE = {
    Vokal: "Vokal",
    Dakuon: "Dakuon",
    Handakuon: "Handakuon",
    Youon: "Youon",
  };

  // buildChips membuat filter baris kana dari data script yang sedang aktif.
  function buildChips() {
    const rows = ["Semua", ...new Set(data().map((x) => x.row))];
    chips.innerHTML = rows
      .map((r) => `<button class="chip${r === kanaRow ? " active" : ""}" data-row="${r}">${r}</button>`)
      .join("");
    chips.querySelectorAll(".chip").forEach((c) =>
      c.addEventListener("click", () => {
        kanaRow = c.dataset.row;
        chips.querySelectorAll(".chip").forEach((x) => x.classList.toggle("active", x === c));
        renderKana();
      }),
    );
  }
  // matchesKana menentukan apakah satu huruf cocok dengan romaji dan baris filter.
  function matchesKana(x) {
    if (kanaRow !== "Semua" && x.row !== kanaRow) return false;
    if (!kanaQuery) return true;
    const q = kanaQuery.toLowerCase();
    return x.k.toLowerCase().includes(q) || x.r.toLowerCase().includes(q);
  }
  const cellHTML = (
    x,
  ) => `<button class="kana-cell${kanaDone[script + ":" + x.k] ? " done" : ""}" data-k="${x.k}" data-r="${x.r}" data-row="${x.row}">
      <span class="glyph">${x.k}</span><span class="rom">${x.r}</span></button>`;

  const ACC_ARROW =
    '<svg class="acc-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

  // renderKana membangun kelompok huruf dari data yang cocok dengan filter aktif.
  function renderKana() {
    const list = data().filter(matchesKana);
    if (!list.length) {
      grid.innerHTML = `<div class="kana-empty">Tidak ada huruf yang cocok. Coba kata kunci lain.</div>`;
      updateKanaProgress();
      return;
    }
    const rows = [...new Set(list.map((x) => x.row))].sort(
      (a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b),
    );
    const autoOpen = !!kanaQuery || kanaRow !== "Semua";
    grid.innerHTML = rows
      .map((row) => {
        const items = list.filter((x) => x.row === row);
        const range = items.length > 1 ? `${items[0].k} – ${items[items.length - 1].k}` : items[0].k;
        const title = GROUP_TITLE[row] || `Baris ${row}`;
        const done = items.filter((x) => kanaDone[script + ":" + x.k]).length;
        return `<section class="kana-group acc${autoOpen ? " open" : ""}" data-row="${row}">
        <div class="kana-group-head acc-head">
          <h3>${title}</h3><span class="range">${range}</span><span class="cnt">${done}/${items.length} hafal</span>
          ${ACC_ARROW}
        </div>
        <div class="acc-body"><div class="kana-grid" data-built=""></div></div>
      </section>`;
      })
      .join("");
    // isi grid hanya saat dibuka (hemat performa)
    grid.querySelectorAll(".kana-group").forEach((sec) => {
      const items = list.filter((x) => x.row === sec.dataset.row);
      const body = sec.querySelector(".kana-grid");
      const build = () => {
        if (body.dataset.built) return;
        body.innerHTML = items.map(cellHTML).join("");
        // beri animasi muncul bergiliran pada tiap huruf
        body.querySelectorAll(".kana-cell").forEach((c, i) => {
          c.classList.add("fade-up");
          c.style.animationDelay = Math.min(i * 0.02, 0.4) + "s";
          c.addEventListener("click", () => openKanaPop(c.dataset));
        });
        body.dataset.built = "1";
      };
      if (sec.classList.contains("open")) build();
      sec.querySelector(".acc-head").addEventListener("click", () => {
        const open = sec.classList.toggle("open");
        if (open) build();
      });
    });
    // grup muncul bergiliran saat pertama kali dirender
    grid.querySelectorAll(".kana-group").forEach((g, i) => {
      g.classList.add("pop-in");
      g.style.animationDelay = Math.min(i * 0.05, 0.5) + "s";
    });
    updateKanaProgress();
  }
  // updateKanaProgress menghitung huruf bertanda dan memperbarui progress belajar.
  function updateKanaProgress() {
    const total = data().length;
    const done = data().filter((x) => kanaDone[script + ":" + x.k]).length;
    $("#kanaTotal").textContent = total;
    $("#kanaDoneCount").textContent = done;
    $("#kanaBar").style.width = total ? (done / total) * 100 + "%" : "0%";
  }
  $$(".tab").forEach((t) =>
    t.addEventListener("click", () => {
      script = t.dataset.script;
      $$(".tab").forEach((x) => x.classList.toggle("active", x === t));
      kanaRow = "Semua";
      kanaQuery = "";
      kanaSearch.value = "";
      buildChips();
      renderKana();
    }),
  );
  kanaSearch.addEventListener("input", (e) => {
    kanaQuery = e.target.value.trim();
    renderKana();
  });
  $("#kanaReset").addEventListener("click", () => {
    Object.keys(kanaDone).forEach((k) => {
      if (k.startsWith(script + ":")) delete kanaDone[k];
    });
    save(LS.kana, kanaDone);
    renderKana();
    toast("Progres " + script + " direset");
  });

  const pop = $("#kanaPop");
  let popKey = null,
    popData = null;
  // openKanaPop menampilkan detail satu huruf kana yang dipilih.
  function openKanaPop(ds) {
    popData = ds;
    popKey = script + ":" + ds.k;
    $("#popGlyph").textContent = ds.k;
    $("#popRom").textContent = ds.r;
    $("#popRow").textContent = "Baris " + ds.row;
    $("#popHint").innerHTML = `Cara baca: <b>${ds.k}</b> dilafalkan <b>"${ds.r}"</b>.
       Klik <b>Dengar</b> buat contoh suara, lalu
       <b>Tandai Hafal</b> kalau sudah ingat.`;
    syncPopToggle();
    pop.classList.add("open");
  }
  // syncPopToggle menyamakan tombol popup dengan status belajar yang tersimpan.
  function syncPopToggle() {
    $("#popToggle").textContent = kanaDone[popKey] ? "Sudah Hafal" : "Tandai Hafal";
  }
  $("#popClose").addEventListener("click", () => pop.classList.remove("open"));
  pop.addEventListener("click", (e) => {
    if (e.target === pop) pop.classList.remove("open");
  });
  $("#popSpeak").addEventListener("click", () => speak(popData.k));
  $("#popToggle").addEventListener("click", () => {
    if (kanaDone[popKey]) delete kanaDone[popKey];
    else kanaDone[popKey] = true;
    save(LS.kana, kanaDone);
    syncPopToggle();
    renderKana();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      pop.classList.remove("open");
      closeAdmin();
    }
  });

  /*
   * KOLOM PENCARIAN — gunakan find/pegang nama fungsi di tiap section.
   * 1. awal file: ikon, toast, tema, sakura, preloader, cursor (baris 50–192)
   * 2. router + suara: showRoute(), revealInit(), speak() (baris 193–330)
   * 3. kana: buildChips(), renderKana(), popup huruf (baris 331–520)
   * 4. kosakata: buildVocabChips(), renderVocab() (baris 521–620)
   * 5. kegiatan: loadForum(); slider ada di js/features/about-slider.js
   * 6. pesan: helper anonim, pesan publik/pribadi, admin (baris 646–1150)
   * 7. akhir file: statistik dan init; kuis/kata harian ada di js/features/
   */

  /* =======================================================
     KOSAKATA
     ======================================================= */
  const vGrid = $("#vocabGrid"),
    vChips = $("#vocabChips"),
    vSearch = $("#vocabSearch");
  let vCat = "Semua",
    vQuery = "";
  // buildVocabChips membentuk tombol kategori yang benar-benar ada di data kata.
  function buildVocabChips() {
    const cats = ["Semua", ...new Set(KOSAKATA.map((x) => x.kat))];
    vChips.innerHTML = cats
      .map((c) => `<button class="chip${c === vCat ? " active" : ""}" data-cat="${c}">${c}</button>`)
      .join("");
    vChips.querySelectorAll(".chip").forEach((c) =>
      c.addEventListener("click", () => {
        vCat = c.dataset.cat;
        vChips.querySelectorAll(".chip").forEach((x) => x.classList.toggle("active", x === c));
        renderVocab();
      }),
    );
  }
  // renderVocab membangun hasil pencarian kosakata per kategori.
  function renderVocab() {
    const q = vQuery.toLowerCase();
    const list = KOSAKATA.filter((x) => {
      if (vCat !== "Semua" && x.kat !== vCat) return false;
      if (!q) return true;
      return x.jp.includes(vQuery) || x.kana.toLowerCase().includes(q) || x.id.toLowerCase().includes(q);
    });
    if (!list.length) {
      vGrid.innerHTML = `<div class="kana-empty" style="grid-column:1/-1">Kosakata tidak ditemukan.</div>`;
      return;
    }
    const cats = [...new Set(list.map((x) => x.kat))];
    const autoOpen = !!vQuery || vCat !== "Semua";
    vGrid.innerHTML = cats
      .map((cat) => {
        const items = list.filter((x) => x.kat === cat);
        return `<section class="vocab-group acc${autoOpen ? " open" : ""}" data-cat="${esc(cat)}">
        <div class="vocab-head acc-head">
          <span class="vocab-dot"></span>
          <h3>${esc(cat)}</h3>
          <span class="cnt">${items.length} kata</span>
          ${ACC_ARROW}
        </div>
        <div class="acc-body"><div class="vocab-grid" data-built=""></div></div>
      </section>`;
      })
      .join("");
    vGrid.querySelectorAll(".vocab-group").forEach((sec) => {
      const items = list.filter((x) => x.kat === sec.dataset.cat);
      const body = sec.querySelector(".vocab-grid");
      const build = () => {
        if (body.dataset.built) return;
        body.innerHTML = items
          .map(
            (x) => `
          <article class="vocab-card">
            <span class="cat">${esc(x.kat)}</span>
            <div class="jp">${esc(x.jp)}</div>
            <div class="kana">${esc(x.kana)}</div>
            <div class="id">${esc(x.id)}</div>
            <div class="foot"><small>${esc(x.kat)}</small>
              <button class="speak" data-speak="${esc(x.jp)}" aria-label="Dengar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8 8 0 0 1 0 12"/></svg></button>
            </div>
          </article>`,
          )
          .join("");
        body.querySelectorAll(".vocab-card").forEach((card, i) => {
          card.classList.add("fade-up");
          card.style.animationDelay = Math.min(i * 0.03, 0.45) + "s";
        });
        body.querySelectorAll(".speak").forEach((b) =>
          b.addEventListener("click", (e) => {
            e.stopPropagation();
            speak(b.dataset.speak);
          }),
        );
        body.dataset.built = "1";
      };
      if (sec.classList.contains("open")) build();
      sec.querySelector(".acc-head").addEventListener("click", () => {
        const open = sec.classList.toggle("open");
        if (open) build();
      });
    });
    // grup kosakata muncul bergiliran
    vGrid.querySelectorAll(".vocab-group").forEach((g, i) => {
      g.classList.add("pop-in");
      g.style.animationDelay = Math.min(i * 0.05, 0.5) + "s";
    });
  }
  vSearch.addEventListener("input", (e) => {
    vQuery = e.target.value.trim();
    renderVocab();
  });

  /* Selesai: render kana, filter, pencarian, progress, dan popup huruf. */

  /* =======================================================
     FORUM INFO (bisa diubah admin)
     ======================================================= */
  const DEFAULT_FORUM = window.Store.DEFAULT_FORUM;
  let forum = Object.assign({}, DEFAULT_FORUM);
  // renderForum menyalin data pertemuan dari Store ke elemen HTML.
  function renderForum() {
    $("#forumHari").textContent = forum.hari;
    $("#forumTempat").textContent = forum.tempat;
    $("#forumWaktu").textContent = forum.waktu;
    $("#forumCatatan").textContent = forum.catatan;
  }
  // loadForum mengambil pengumuman pertemuan; data default tetap tampil bila gagal.
  async function loadForum() {
    try {
      forum = await window.Store.getForum();
    } catch (e) {}
    renderForum();
  }

  /* Slider klub diinisialisasi pada js/features/about-slider.js. */

  // Router tetap membuka panel awal setelah helper halaman siap.
  showRoute(location.hash || "#home", false);

  /* =======================================================
     PESAN — helper
     ======================================================= */
  let deviceId = localStorage.getItem(LS.device);
  if (!deviceId) {
    deviceId = "d_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(LS.device, deviceId);
  }
  // anonName membuat nama samaran stabil untuk pengunjung yang sama.
  function anonName(id) {
    let h = 0;
    const s = String(id);
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return "Pengunjung " + ((h % 900) + 100);
  }
  const initials = (n) =>
    n
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("") || "?";
  // timeAgo mengubah timestamp menjadi waktu relatif yang mudah dibaca.
  function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "baru saja";
    if (s < 3600) return Math.floor(s / 60) + " menit lalu";
    if (s < 86400) return Math.floor(s / 3600) + " jam lalu";
    const d = Math.floor(s / 86400);
    if (d < 30) return d + " hari lalu";
    return new Date(ts).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  const stars = (n) => (n ? "★".repeat(n) + "☆".repeat(5 - n) : "");

  /* Selesai: helper pesan menyiapkan ID lokal, samaran, dan format waktu. */

  /* ---------- ADMIN STATE ---------- */
  const ADMIN_HASH = "245c4800c06a59aa9e91771db88e8b514270f11fa9533e62daf3c37fa1858b4c"; // Hash untuk pemeriksaan login; bukan password asli.
  let isAdmin = sessionStorage.getItem("aozora.admin") === "1";

  // sha256 membuat sidik teks untuk membandingkan login; bukan pengganti server auth.
  async function sha256(str) {
    if (crypto?.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    return "";
  }

  /* =======================================================
     PESAN PUBLIK
     ======================================================= */
  const fbForm = $("#fbForm"),
    fbList = $("#fbList"),
    fbFilter = $("#fbFilter");
  let feedback = [];
  let rating = 0,
    fbCat = "Semua";
  const loadingFB = '<div class="fb-empty"><b>Memuat pesan…</b></div>';

  /* dropdown custom */
  (function select() {
    const sel = $("#fbTypeSelect"),
      btn = $("#fbTypeBtn"),
      menu = $("#fbTypeMenu"),
      icBox = $("#fbTypeIc"),
      label = $("#fbTypeLabel"),
      hidden = $("#fbType");
    function paint(v) {
      const t = TYPES.find((x) => x.v === v) || TYPES[0];
      icBox.innerHTML = t.ic;
      label.textContent = t.v;
      hidden.value = t.v;
      menu.querySelectorAll("li").forEach((li) => li.classList.toggle("on", li.dataset.v === t.v));
    }
    menu.innerHTML = TYPES.map(
      (t) => `<li data-v="${t.v}"><span class="select-ic">${t.ic}</span>${t.v}</li>`,
    ).join("");
    paint("Saran");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      sel.classList.toggle("open");
    });
    menu.querySelectorAll("li").forEach((li) =>
      li.addEventListener("click", () => {
        paint(li.dataset.v);
        sel.classList.remove("open");
      }),
    );
    document.addEventListener("click", (e) => {
      if (!sel.contains(e.target)) sel.classList.remove("open");
    });
  })();

  /* rating bintang */
  (function ratingUI() {
    const box = $("#fbRating");
    box.innerHTML = [1, 2, 3, 4, 5]
      .map((v) => `<button type="button" data-v="${v}" aria-label="${v} dari 5">${I.star}</button>`)
      .join("");
    box.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => {
        rating = +b.dataset.v;
        box.querySelectorAll("button").forEach((x) => x.classList.toggle("on", +x.dataset.v <= rating));
      }),
    );
  })();

  const likeCount = (f) => Number(f.likes) || 0;
  const likedByMe = (f) => window.Store.liked.has(f.id);
  const personOf = (f) =>
    isAdmin
      ? { name: f.name, avatar: initials(f.name), real: true }
      : { name: anonName(f.id), avatar: "?", anon: true };

  // renderFeedback menampilkan pesan publik dengan escaping dan nama samaran.
  function renderFeedback() {
    const cats = ["Semua", ...new Set(feedback.map((f) => f.type))];
    fbFilter.innerHTML = cats
      .map((c) => `<button class="chip${c === fbCat ? " active" : ""}" data-cat="${c}">${c}</button>`)
      .join("");
    fbFilter.querySelectorAll(".chip").forEach((c) =>
      c.addEventListener("click", () => {
        fbCat = c.dataset.cat;
        renderFeedback();
      }),
    );

    const list = feedback
      .filter((f) => fbCat === "Semua" || f.type === fbCat)
      .sort((a, b) => (isAdmin ? b.ts - a.ts : likeCount(b) - likeCount(a) || b.ts - a.ts));

    if (!list.length) {
      fbList.innerHTML = `
        <div class="fb-empty">
          <b>Belum ada pesan</b><br />
          <small>Jadilah yang pertama menulis masukan atau cerita.</small>
        </div>`;
      return;
    }
    fbList.innerHTML = list
      .map((f) => {
        const p = personOf(f),
          liked = likedByMe(f);
        return `<div class="fb-item">
        ${isAdmin ? `<button class="del" data-del="${f.id}" title="Hapus">✕</button>` : ""}
        <div class="top">
          <div class="fb-avatar">${esc(p.avatar)}</div>
          <div><div class="who">${esc(p.name)} ${p.anon ? '<span class="badge-anon">anonim</span>' : '<span class="badge-real">nama asli</span>'}</div><div class="when">${timeAgo(f.ts)}</div></div>
          <span class="tag">${esc(f.type)}</span>
        </div>
        ${f.rating ? `<div class="stars">${stars(f.rating)}</div>` : ""}
        <p>${esc(f.msg)}</p>
        <div class="fb-actions"><button class="like-btn${liked ? " liked" : ""}" data-like="${f.id}">${I.heart(liked)}<span>${likeCount(f)}</span></button></div>
      </div>`;
      })
      .join("");
    fbList
      .querySelectorAll(".like-btn")
      .forEach((b) => b.addEventListener("click", () => toggleLike(b.dataset.like)));
    fbList.querySelectorAll(".del").forEach((b) =>
      b.addEventListener("click", async () => {
        const id = b.dataset.del;
        feedback = feedback.filter((f) => String(f.id) !== String(id));
        renderFeedback();
        updateStats();
        try {
          await window.Store.deleteFeedback(id);
        } catch (e) {
          toast("Gagal menghapus (koneksi?)");
        }
        toast("Pesan dihapus");
      }),
    );
  }
  async function loadFeedback() {
    fbList.innerHTML = loadingFB;
    try {
      feedback = await window.Store.listFeedback();
    } catch (e) {
      feedback = [];
      toast("Gagal memuat pesan (cek koneksi)");
    }
    renderFeedback();
    updateStats();
  }
  async function toggleLike(id) {
    const f = feedback.find((x) => String(x.id) === String(id));
    if (!f) return;
    const wasLiked = window.Store.liked.has(id);
    const n = Math.max(0, likeCount(f) + (wasLiked ? -1 : 1));
    f.likes = n;
    window.Store.liked.set(id, !wasLiked);
    renderFeedback();
    if (!wasLiked) toast("Kamu menyukai pesan ini");
    try {
      await window.Store.setLikes(id, n);
    } catch (e) {
      toast("Gagal menyimpan like (koneksi?)");
    }
  }
  const setInvalid = (sel, bad) => $(sel).classList.toggle("invalid", bad);

  // Form terasa responsif: hitung karakter dan cek input setelah pengguna selesai mengetik.
  const fbMsg = $("#fbMsg"),
    fbMsgCount = $("#fbMsgCount");
  const updateMsgCount = () => {
    if (!fbMsgCount) return;
    fbMsgCount.textContent = `${fbMsg.value.length} / ${fbMsg.maxLength}`;
    fbMsgCount.classList.toggle("near-limit", fbMsg.value.length >= fbMsg.maxLength * 0.85);
  };
  fbMsg?.addEventListener("input", () => {
    updateMsgCount();
    if (fbMsg.value.trim().length >= 5) setInvalid("#fMsg", false);
  });
  fbMsg?.addEventListener("blur", () => {
    setInvalid("#fMsg", fbMsg.value.trim().length > 0 && fbMsg.value.trim().length < 5);
  });
  const fbName = $("#fbName");
  fbName?.addEventListener("input", () => {
    if (fbName.value.trim().length >= 2) setInvalid("#fName", false);
  });
  fbName?.addEventListener("blur", () => {
    setInvalid("#fName", fbName.value.trim().length > 0 && fbName.value.trim().length < 2);
  });
  updateMsgCount();

  let submittingFeedback = false;
  fbForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submittingFeedback) return;
    const name = $("#fbName").value.trim(),
      msg = $("#fbMsg").value.trim(),
      type = $("#fbType").value;
    let bad = false;
    if (name.length < 2) {
      setInvalid("#fName", true);
      bad = true;
    } else setInvalid("#fName", false);
    if (msg.length < 5) {
      setInvalid("#fMsg", true);
      bad = true;
    } else setInvalid("#fMsg", false);
    const res = $("#fbResult"),
      sendBtn = fbForm.querySelector('[type="submit"]');
    res.className = "form-msg";
    if (bad) {
      res.classList.add("bad");
      res.textContent = "Lengkapi dulu: nama & pesan (min. 5 karakter).";
      fbForm.querySelector(".field.invalid input, .field.invalid textarea")?.focus();
      return;
    }
    submittingFeedback = true;
    sendBtn.disabled = true;
    sendBtn.classList.add("is-sending");
    sendBtn.setAttribute("aria-busy", "true");
    sendBtn.textContent = "Mengirim…";
    try {
      await window.Store.addFeedback({ name, msg, type, rating });
    } catch (err) {
      res.classList.add("bad");
      res.textContent = "Gagal mengirim. Periksa koneksi lalu coba lagi.";
      return;
    } finally {
      submittingFeedback = false;
      sendBtn.disabled = false;
      sendBtn.classList.remove("is-sending");
      sendBtn.removeAttribute("aria-busy");
      sendBtn.textContent = "Kirim Pesan";
    }
    fbForm.reset();
    updateMsgCount();
    rating = 0;
    $("#fbRating")
      .querySelectorAll("button")
      .forEach((x) => x.classList.remove("on"));
    await loadFeedback();
    res.classList.add("ok");
    res.textContent = "Terima kasih! Pesanmu terkirim. Nama kamu cuma terlihat oleh pengurus.";
    toast("Pesan terkirim");
    setTimeout(() => {
      res.className = "form-msg";
    }, 6000);
  });

  /* Selesai: pesan publik divalidasi, disimpan, difilter, dan dirender. */

  /* =======================================================
     PESAN PRIBADI
     ======================================================= */
  let privateMsgs = [];
  const pvForm = $("#pvForm");
  pvForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("#pvName").value.trim(),
      msg = $("#pvMsg").value.trim();
    let bad = false;
    if (name.length < 2) {
      setInvalid("#pvNameField", true);
      bad = true;
    } else setInvalid("#pvNameField", false);
    if (msg.length < 5) {
      setInvalid("#pvMsgField", true);
      bad = true;
    } else setInvalid("#pvMsgField", false);
    const res = $("#pvResult");
    res.className = "form-msg";
    if (bad) {
      res.classList.add("bad");
      res.textContent = "Lengkapi dulu: nama & pesan (min. 5 karakter).";
      return;
    }
    try {
      await window.Store.addPrivate({ name, msg });
    } catch (err) {
      res.classList.add("bad");
      res.textContent = "Gagal mengirim. Coba lagi ya.";
      return;
    }
    pvForm.reset();
    res.classList.add("ok");
    res.textContent = "Terkirim. Pesanmu cuma bisa dibaca pengurus, aman.";
    toast("Pesan pribadi terkirim");
    await loadPrivate();
    renderPrivateAdmin();
    setTimeout(() => {
      res.className = "form-msg";
    }, 6000);
  });
  async function loadPrivate() {
    try {
      privateMsgs = await window.Store.listPrivate();
    } catch (e) {
      privateMsgs = [];
    }
  }

  /* =======================================================
     PANE TABS (publik / pribadi)
     ======================================================= */
  $$(".ptab").forEach((t) =>
    t.addEventListener("click", () => {
      $$(".ptab").forEach((x) => x.classList.toggle("active", x === t));
      $$(".pesan-pane").forEach((p) => p.classList.toggle("hidden", p.dataset.pane !== t.dataset.ptab));
    }),
  );

  /* Selesai: pesan pribadi divalidasi dan hanya ditampilkan ke admin. */

  /* =======================================================
     ADMIN MODAL
     ======================================================= */
  const modal = $("#adminModal");
  const openAdmin = () => modal.classList.add("open");
  const closeAdmin = () => modal.classList.remove("open");

  // applyAdminUI menyamakan tampilan tombol/panel dengan status admin saat ini.
  function applyAdminUI() {
    document.body.classList.toggle("is-admin", isAdmin);
    $("#adminLoginView").classList.toggle("hidden", isAdmin);
    $("#adminDash").classList.toggle("hidden", !isAdmin);
    $("#fbClear").classList.toggle("hidden", !isAdmin);
    renderFeedback();
    if (isAdmin) {
      fillForumForm();
      loadPrivate().then(renderPrivateAdmin);
    }
    // Unggah foto terbuka untuk semua pengunjung, jadi kontrolnya tidak ikut dikunci.
  }

  $("#adminCorner").addEventListener("click", () => {
    openAdmin();
  });
  $("#adminClose").addEventListener("click", closeAdmin);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAdmin();
  });

  $("#adminLogin").addEventListener("submit", async (e) => {
    e.preventDefault();
    const u = $("#adminUser").value.trim().toLowerCase(),
      p = $("#adminPass").value,
      err = $("#adminErr");
    err.style.display = "none";
    if (u !== "admin") {
      err.textContent = "Username salah (gunakan: admin).";
      err.style.display = "block";
      return;
    }
    const h = await sha256(p);
    if (!h) {
      err.textContent = "Buka lewat server (http/localhost) supaya login bisa diverifikasi.";
      err.style.display = "block";
      return;
    }
    if (h !== ADMIN_HASH) {
      err.textContent = "Password salah.";
      err.style.display = "block";
      return;
    }
    isAdmin = true;
    sessionStorage.setItem("aozora.admin", "1");
    $("#adminPass").value = "";
    applyAdminUI();
    toast("Login pengurus berhasil");
  });
  $("#adminLogout").addEventListener("click", () => {
    isAdmin = false;
    sessionStorage.removeItem("aozora.admin");
    applyAdminUI();
    closeAdmin();
    toast("Keluar dari mode pengurus");
  });

  $$(".atab").forEach((t) =>
    t.addEventListener("click", () => {
      $$(".atab").forEach((x) => x.classList.toggle("active", x === t));
      $$(".admin-pane").forEach((p) => p.classList.toggle("hidden", p.dataset.apane !== t.dataset.atab));
    }),
  );

  /* forum form */
  // fillForumForm mengisi form admin dengan data pertemuan saat ini.
  function fillForumForm() {
    $("#fHari").value = forum.hari;
    $("#fTempat").value = forum.tempat;
    $("#fWaktu").value = forum.waktu;
    $("#fCatatan").value = forum.catatan;
  }
  $("#fSave").addEventListener("click", async () => {
    forum = {
      hari: $("#fHari").value.trim() || DEFAULT_FORUM.hari,
      tempat: $("#fTempat").value.trim() || DEFAULT_FORUM.tempat,
      waktu: $("#fWaktu").value.trim() || DEFAULT_FORUM.waktu,
      catatan: $("#fCatatan").value.trim() || DEFAULT_FORUM.catatan,
    };
    try {
      await window.Store.setForum(forum);
    } catch (e) {
      toast("Gagal menyimpan (cek koneksi)");
    }
    renderForum();
    toast("Info pertemuan disimpan");
  });

  /* private list (admin) */
  // renderPrivateAdmin menampilkan pesan pribadi hanya dalam panel admin.
  function renderPrivateAdmin() {
    const box = $("#privateList");
    if (!box) return;
    if (!privateMsgs.length) {
      box.innerHTML = `<div class="admin-empty">Belum ada pesan pribadi.</div>`;
      return;
    }
    box.innerHTML = privateMsgs
      .slice()
      .sort((a, b) => b.ts - a.ts)
      .map(
        (m) => `
      <div class="admin-item">
        <div class="ai-top"><span class="ai-who">${esc(m.name)}</span><span class="ai-when">${timeAgo(m.ts)}</span></div>
        <p>${esc(m.msg)}</p>
        <button class="ai-del" data-pvdel="${m.id}">Hapus</button>
      </div>`,
      )
      .join("");
    box.querySelectorAll("[data-pvdel]").forEach((b) =>
      b.addEventListener("click", async () => {
        const id = b.dataset.pvdel;
        privateMsgs = privateMsgs.filter((m) => String(m.id) !== String(id));
        renderPrivateAdmin();
        try {
          await window.Store.deletePrivate(id);
        } catch (e) {
          toast("Gagal menghapus (koneksi?)");
        }
        toast("Pesan pribadi dihapus");
      }),
    );
  }

  /* clear all (admin) */
  $("#fbClear").addEventListener("click", async () => {
    if (!isAdmin) return;
    if (!feedback.length) {
      toast("Belum ada pesan untuk dihapus");
      return;
    }
    if (confirm("Hapus SEMUA pesan di papan publik?")) {
      try {
        await window.Store.clearFeedback();
      } catch (e) {
        toast("Gagal menghapus (koneksi?)");
      }
      await loadFeedback();
      toast("Semua pesan dihapus");
    }
  });

  /* Kuis kana diinisialisasi pada js/features/kana-quiz.js. */

  /* =======================================================
     STATS + INIT
     ======================================================= */
  // updateStats memasang nilai statistik dari data aktual, bukan angka contoh.
  function updateStats() {
    $("#statKana").textContent = HIRAGANA.length + KATAKANA.length;
    $("#statVocab").textContent = KOSAKATA.length;
    $("#statFb").textContent = feedback.length;
  }
  // countUp menganimasikan angka statistik dari nol ke nilai sebenarnya.
  function countUp(el, to) {
    let n = 0;
    const step = Math.max(1, Math.ceil(to / 40));
    const t = setInterval(() => {
      n += step;
      if (n >= to) {
        n = to;
        clearInterval(t);
      }
      el.textContent = n;
    }, 26);
  }
  function animateStats() {
    countUp($("#statKana"), HIRAGANA.length + KATAKANA.length);
    countUp($("#statVocab"), KOSAKATA.length);
    countUp($("#statFb"), feedback.length);
  }

  $("#year").textContent = new Date().getFullYear();
  buildChips();
  renderKana();
  buildVocabChips();
  renderVocab();
  applyAdminUI();
  setTimeout(animateStats, 600);

  /* Kata harian diinisialisasi pada js/features/daily-word.js. */

  /* muat data dari store (Supabase / lokal) */
  loadFeedback();
  loadForum();
  loadPrivate();
  if (window.Store.mode === "local") {
    setTimeout(
      () =>
        toast(
          "Mode lokal: pesan hanya tersimpan di perangkat ini. Hubungkan database untuk mode online.",
        ),
      2500,
    );
  }

  window.AOZORA = {
    speak,
    renderKana,
    renderVocab,
    renderFeedback,
    get feedback() {
      return feedback;
    },
    get privateMsgs() {
      return privateMsgs;
    },
    get mode() {
      return window.Store.mode;
    },
  };
})();
