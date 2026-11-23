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
    theme: "aozora.theme",
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
  // Tombol hamburger membuka menu pada tablet/desktop kecil dan menutupnya setelah navigasi.
  function setMenuOpen(open) {
    navLinks?.classList.toggle("open", open);
    burger?.classList.toggle("open", open);
    burger?.setAttribute("aria-expanded", String(open));
  }
  burger?.addEventListener("click", () => {
    setMenuOpen(!navLinks?.classList.contains("open"));
  });
  navLinks?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });
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
    setMenuOpen(false);
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

  /* ---------- SUARA (ramah browser HP) ---------- */
  let jaVoice = null;
  // Daftar voice sering datang terlambat di Safari/iPhone; cari ulang saat siap.
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    const voices = speechSynthesis.getVoices();
    jaVoice =
      voices.find((voice) => /^ja[-_]?JP/i.test(voice.lang)) ||
      voices.find((voice) => /japanese|日本語/i.test(voice.name)) ||
      null;
  }
  if ("speechSynthesis" in window) {
    pickVoice();
    speechSynthesis.addEventListener?.("voiceschanged", pickVoice);
    if (!speechSynthesis.addEventListener) speechSynthesis.onvoiceschanged = pickVoice;
  }
  // Memulai ucapan langsung dari klik pengguna agar kebijakan autoplay HP mengizinkan audio.
  function speak(text) {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      toast("Browser ini belum mendukung suara. Coba buka situs di Safari atau Chrome.");
      return;
    }
    try {
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.lang = "ja-JP";
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      if (!jaVoice) pickVoice();
      if (jaVoice) utterance.voice = jaVoice;
      utterance.onerror = (event) => {
        if (event.error !== "canceled" && event.error !== "interrupted")
          toast("Suara gagal diputar. Cek volume media atau coba browser lain.");
      };
      speechSynthesis.speak(utterance);
      // Jangan panggil cancel() di sini: Safari/iOS bisa membatalkan ucapan baru.
    } catch {
      toast("Suara gagal diputar. Cek volume media atau coba browser lain.");
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
  // setForum menyimpan perubahan jadwal dari panel admin lalu menggambar ulang kartu info.
  function setForum(next) {
    forum = next;
    renderForum();
  }

  /* Slider klub diinisialisasi pada js/features/about-slider.js. */

  // Router tetap membuka panel awal setelah helper halaman siap.
  showRoute(location.hash || "#home", false);

  /* Kuis kana diinisialisasi pada js/features/kana-quiz.js. */
  /* Pesan & admin diinisialisasi pada js/features/messages.js. */

  /* =======================================================
     STATS + INIT
     ======================================================= */
  // setFeedbackCount memperbarui angka statistik pesan; dipanggil juga oleh features/messages.js.
  let feedbackCount = 0;
  function setFeedbackCount(n) {
    feedbackCount = n;
    const el = $("#statFb");
    if (el) el.textContent = n;
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
    countUp($("#statFb"), feedbackCount);
  }

  $("#year").textContent = new Date().getFullYear();
  buildChips();
  renderKana();
  buildVocabChips();
  renderVocab();
  setTimeout(animateStats, 600);

  /* Kata harian diinisialisasi pada js/features/daily-word.js. */

  /* muat jadwal pertemuan dari store (Supabase / lokal) */
  loadForum();

  // Helper yang dipakai js/features/*.js. Fitur pesan menambah propertinya sendiri.
  window.AOZORA = {
    $,
    $$,
    esc,
    toast,
    I,
    TYPES,
    speak,
    renderKana,
    renderVocab,
    setFeedbackCount,
    setForum,
    get forum() {
      return forum;
    },
    get mode() {
      return window.Store.mode;
    },
  };
})();
