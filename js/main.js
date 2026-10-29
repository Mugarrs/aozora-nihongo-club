/* =========================================================
   AOZORA NIHONGO CLUB — Main script v4
   ========================================================= */
(() => {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const LS = {
    kana:  "aozora.kanaDone.v1",
    fb:    "aozora.feedback.v1",
    pv:    "aozora.private.v1",
    forum: "aozora.forum.v1",
    gal:   "aozora.gallery.v1",
    theme: "aozora.theme",
    device:"aozora.deviceId",
  };
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const esc  = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

  /* ---------- IKON SVG (pengganti emoji) ---------- */
  const I = {
    saran:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.5.4.8 1 .8 1.6V17h5.6v-1.6c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3z"/></svg>',
    kritik: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L18 10l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
    ide:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/></svg>',
    apres:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 20s-7-4.4-9.3-8.4C1.1 8.9 2.7 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.3 0 4.9 3.4 3.3 6.1C19 15.6 12 20 12 20z"/></svg>',
    lain:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"/></svg>',
    star:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 3l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4L7.5 16.8l.9-5L4.8 8.3l5-.7z"/></svg>',
    heart:  on => '<svg viewBox="0 0 24 24" fill="' + (on ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 20s-7-4.4-9.3-8.4C1.1 8.9 2.7 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.3 0 4.9 3.4 3.3 6.1C19 15.6 12 20 12 20z"/></svg>',
  };
  const TYPES = [
    { v:"Saran",        ic:I.saran  },
    { v:"Kritik",       ic:I.kritik },
    { v:"Ide Kegiatan", ic:I.ide    },
    { v:"Apresiasi",    ic:I.apres  },
    { v:"Lainnya",      ic:I.lain   },
  ];

  /* ---------- TOAST ---------- */
  const toastWrap = $("#toastWrap");
  function toast(msg, ms = 2600) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<span class="dot"></span><span>${esc(msg)}</span>`;
    toastWrap.appendChild(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 320); }, ms);
  }

  /* ---------- TEMA ---------- */
  (function theme() {
    const root = document.documentElement, body = document.body;
    const stored = localStorage.getItem(LS.theme);
    const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
    const startDark = stored ? stored === "dark" : (root.classList.contains("dark-pre") || prefersDark);
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
      p.style.width = size + "px"; p.style.height = size + "px";
      p.style.opacity = (0.5 + Math.random() * 0.5).toFixed(2);
      p.style.animationDuration = (7 + Math.random() * 8).toFixed(1) + "s, " + (2 + Math.random() * 2).toFixed(1) + "s";
      p.style.animationDelay = (-Math.random() * 12).toFixed(1) + "s, " + (-Math.random() * 3).toFixed(1) + "s";
      box.appendChild(p);
    }
  })();

  /* ---------- PRELOADER ---------- */
  (function preloader() {
    const pre = $("#preloader"), bar = $("#plBar"), pct = $("#plPct"), tip = $("#plTip");
    const tips = ["Menyiapkan kelas…", "Memuat hiragana…", "Memuat katakana…", "Menyusun kosakata…", "ようこそ！"];
    let p = 0, done = false;
    const t = setInterval(() => {
      p += Math.random() * 22 + 14;
      if (p >= 100) { p = 100; clearInterval(t); finish(); }
      bar.style.width = p + "%"; pct.textContent = Math.floor(p);
      tip.textContent = tips[Math.min(tips.length - 1, Math.floor(p / 22))];
    }, 110);
    function finish() {
      if (done) return; done = true;
      setTimeout(() => { pre.classList.add("done"); document.body.classList.remove("locked"); revealInit(); }, 200);
    }
    // jangan menunggu terlalu lama di HP
    setTimeout(finish, 2200);
  })();

  /* ---------- CURSOR ---------- */
  (function cursor() {
    if (matchMedia("(pointer:coarse)").matches) return;
    const dot = $("#cursorDot"), ring = $("#cursorRing");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; });
    (function loop() { rx += (mx - rx) * .18; ry += (my - ry) * .18; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
    const sel = "a,button,.kana-cell,.vocab-card,.chip,.tab,input,textarea,.select-btn,.gallery-item";
    addEventListener("mouseover", e => { if (e.target.closest(sel)) document.body.classList.add("cursor-hover"); });
    addEventListener("mouseout",  e => { if (e.target.closest(sel)) document.body.classList.remove("cursor-hover"); });
  })();

  /* ---------- NAV + SCROLL ---------- */
  const nav = $("#nav"), burger = $("#navBurger"), navLinks = $("#navLinks");
  burger.addEventListener("click", () => { burger.classList.toggle("open"); navLinks.classList.toggle("open"); });
  navLinks.addEventListener("click", e => { if (e.target.tagName === "A") { burger.classList.remove("open"); navLinks.classList.remove("open"); } });

  const progress = $("#scrollProgress"), toTop = $("#toTop");
  const sections = $$("section[id], header[id]");
  function onScroll() {
    const y = scrollY;
    nav.classList.toggle("scrolled", y > 40);
    toTop.classList.toggle("show", y > 700);
    const h = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    let cur = "home";
    sections.forEach(s => { if (y >= s.offsetTop - 140) cur = s.id; });
    $$("#navLinks a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + cur));
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- TRANSISI HALAMAN ---------- */
  const curtain = $("#curtain");
  function pageTransition(target) {
    const go = () => { const el = document.querySelector(target); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };
    if (!curtain || matchMedia("(prefers-reduced-motion: reduce)").matches) { go(); return; }
    curtain.classList.remove("run"); void curtain.offsetWidth; curtain.classList.add("run");
    setTimeout(go, 240);
    setTimeout(() => curtain.classList.remove("run"), 620);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    e.preventDefault(); pageTransition(href);
  }));

  /* ---------- REVEAL ---------- */
  let io;
  function revealInit() {
    if (io) return;
    /* IntersectionObserver = "mata" yang memantau elemen.
       Ia memberi tahu JS ketika sebuah elemen masuk ke layar.
       threshold .1  -> picu saat 10% elemen terlihat.
       rootMargin -8% -> tunggu sedikit lebih masuk, biar animasinya terasa pas. */
    io = new IntersectionObserver(ents => {
      ents.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        io.unobserve(en.target);   // sudah muncul, tidak perlu dipantau lagi
      });
    }, { threshold: .1, rootMargin: "0px 0px -8% 0px" });

    /* Elemen yang tampil bersamaan diberi jeda bertingkat (stagger),
       jadi munculnya bergiliran seperti gelombang — bukan serentak. */
    $$(".reveal").forEach(el => io.observe(el));

    // Tambah jeda otomatis untuk anak-anak dalam satu wadah
    $$(".about-grid, .kegiatan-top, .feedback-grid, .hero-stats, .foot-grid, .gallery-grid").forEach(group => {
      [...group.querySelectorAll(".reveal")].forEach((el, i) => {
        if (!el.classList.contains("d1") && !el.classList.contains("d2") && !el.classList.contains("d3")) {
          el.style.transitionDelay = Math.min(i * 0.08, 0.4) + "s";
        }
      });
    });
  }
  addEventListener("load", revealInit);

  /* ---------- SUARA (cepat, tanpa delay) ---------- */
  let jaVoice = null, voicesReady = false;
  function pickVoice() {
    const vs = speechSynthesis.getVoices() || [];
    if (!vs.length) return;
    jaVoice = vs.find(v => /^ja[-_]?JP/i.test(v.lang)) || vs.find(v => /japanese|日本語/i.test(v.name)) || null;
    voicesReady = true;
  }
  if ("speechSynthesis" in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
    // "hangatkan" mesin suara supaya klik pertama tidak delay
    try { const w = new SpeechSynthesisUtterance(" "); w.volume = 0; w.lang = "ja-JP"; speechSynthesis.speak(w); speechSynthesis.cancel(); } catch {}
  }
  function speak(text) {
    if (!("speechSynthesis" in window)) { toast("Perangkat ini belum mendukung suara"); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ja-JP"; u.rate = .95; u.pitch = 1; u.volume = 1;
      if (jaVoice) u.voice = jaVoice;
      speechSynthesis.speak(u);
    } catch { toast("Gagal memutar suara"); }
  }

  /* =======================================================
     KANA
     ======================================================= */
  let script = "hiragana", kanaRow = "Semua", kanaQuery = "";
  let kanaDone = load(LS.kana, {});
  const grid = $("#kanaGroups"), chips = $("#kanaChips"), kanaSearch = $("#kanaSearch");
  const data = () => script === "hiragana" ? HIRAGANA : KATAKANA;
  const GROUP_ORDER = ["Vokal","K","S","T","N","H","M","Y","R","W","Dakuon","Handakuon","Youon"];
  const GROUP_TITLE = { Vokal:"Vokal", Dakuon:"Dakuon", Handakuon:"Handakuon", Youon:"Youon" };

  function buildChips() {
    const rows = ["Semua", ...new Set(data().map(x => x.row))];
    chips.innerHTML = rows.map(r => `<button class="chip${r === kanaRow ? " active" : ""}" data-row="${r}">${r}</button>`).join("");
    chips.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => {
      kanaRow = c.dataset.row;
      chips.querySelectorAll(".chip").forEach(x => x.classList.toggle("active", x === c));
      renderKana();
    }));
  }
  function matchesKana(x) {
    if (kanaRow !== "Semua" && x.row !== kanaRow) return false;
    if (!kanaQuery) return true;
    const q = kanaQuery.toLowerCase();
    return x.k.toLowerCase().includes(q) || x.r.toLowerCase().includes(q);
  }
  const cellHTML = x => `<button class="kana-cell${kanaDone[script + ":" + x.k] ? " done" : ""}" data-k="${x.k}" data-r="${x.r}" data-row="${x.row}">
      <span class="glyph">${x.k}</span><span class="rom">${x.r}</span></button>`;

  const ACC_ARROW = '<svg class="acc-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

  function renderKana() {
    const list = data().filter(matchesKana);
    if (!list.length) { grid.innerHTML = `<div class="kana-empty">Tidak ada huruf yang cocok. Coba kata kunci lain.</div>`; updateKanaProgress(); return; }
    const rows = [...new Set(list.map(x => x.row))].sort((a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b));
    const autoOpen = !!kanaQuery || kanaRow !== "Semua";
    grid.innerHTML = rows.map(row => {
      const items = list.filter(x => x.row === row);
      const range = items.length > 1 ? `${items[0].k} – ${items[items.length - 1].k}` : items[0].k;
      const title = GROUP_TITLE[row] || `Baris ${row}`;
      const done = items.filter(x => kanaDone[script + ":" + x.k]).length;
      return `<section class="kana-group acc${autoOpen ? " open" : ""}" data-row="${row}">
        <div class="kana-group-head acc-head">
          <h3>${title}</h3><span class="range">${range}</span><span class="cnt">${done}/${items.length} hafal</span>
          ${ACC_ARROW}
        </div>
        <div class="acc-body"><div class="kana-grid" data-built=""></div></div>
      </section>`;
    }).join("");
    // isi grid hanya saat dibuka (hemat performa)
    grid.querySelectorAll(".kana-group").forEach(sec => {
      const items = list.filter(x => x.row === sec.dataset.row);
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
  function updateKanaProgress() {
    const total = data().length;
    const done = data().filter(x => kanaDone[script + ":" + x.k]).length;
    $("#kanaTotal").textContent = total; $("#kanaDoneCount").textContent = done;
    $("#kanaBar").style.width = total ? (done / total) * 100 + "%" : "0%";
  }
  $$(".tab").forEach(t => t.addEventListener("click", () => {
    script = t.dataset.script;
    $$(".tab").forEach(x => x.classList.toggle("active", x === t));
    kanaRow = "Semua"; kanaQuery = ""; kanaSearch.value = "";
    buildChips(); renderKana();
  }));
  kanaSearch.addEventListener("input", e => { kanaQuery = e.target.value.trim(); renderKana(); });
  $("#kanaReset").addEventListener("click", () => {
    Object.keys(kanaDone).forEach(k => { if (k.startsWith(script + ":")) delete kanaDone[k]; });
    save(LS.kana, kanaDone); renderKana(); toast("Progres " + script + " direset");
  });

  const pop = $("#kanaPop");
  let popKey = null, popData = null;
  function openKanaPop(ds) {
    popData = ds; popKey = script + ":" + ds.k;
    $("#popGlyph").textContent = ds.k; $("#popRom").textContent = ds.r;
    $("#popRow").textContent = "Baris " + ds.row;
    $("#popHint").innerHTML = `Cara baca: <b>${ds.k}</b> dilafalkan <b>"${ds.r}"</b>. Klik <b>Dengar</b> buat contoh suara, lalu <b>Tandai Hafal</b> kalau sudah ingat.`;
    syncPopToggle(); pop.classList.add("open");
  }
  function syncPopToggle() { $("#popToggle").textContent = kanaDone[popKey] ? "Sudah Hafal" : "Tandai Hafal"; }
  $("#popClose").addEventListener("click", () => pop.classList.remove("open"));
  pop.addEventListener("click", e => { if (e.target === pop) pop.classList.remove("open"); });
  $("#popSpeak").addEventListener("click", () => speak(popData.k));
  $("#popToggle").addEventListener("click", () => {
    if (kanaDone[popKey]) delete kanaDone[popKey]; else kanaDone[popKey] = true;
    save(LS.kana, kanaDone); syncPopToggle(); renderKana();
  });
  addEventListener("keydown", e => { if (e.key === "Escape") { pop.classList.remove("open"); closeAdmin(); } });

  /* =======================================================
     KOSAKATA
     ======================================================= */
  const vGrid = $("#vocabGrid"), vChips = $("#vocabChips"), vSearch = $("#vocabSearch");
  let vCat = "Semua", vQuery = "";
  function buildVocabChips() {
    const cats = ["Semua", ...new Set(KOSAKATA.map(x => x.kat))];
    vChips.innerHTML = cats.map(c => `<button class="chip${c === vCat ? " active" : ""}" data-cat="${c}">${c}</button>`).join("");
    vChips.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => {
      vCat = c.dataset.cat; vChips.querySelectorAll(".chip").forEach(x => x.classList.toggle("active", x === c)); renderVocab();
    }));
  }
  function renderVocab() {
    const q = vQuery.toLowerCase();
    const list = KOSAKATA.filter(x => {
      if (vCat !== "Semua" && x.kat !== vCat) return false;
      if (!q) return true;
      return x.jp.includes(vQuery) || x.kana.toLowerCase().includes(q) || x.id.toLowerCase().includes(q);
    });
    if (!list.length) { vGrid.innerHTML = `<div class="kana-empty" style="grid-column:1/-1">Kosakata tidak ditemukan.</div>`; return; }
    const cats = [...new Set(list.map(x => x.kat))];
    const autoOpen = !!vQuery || vCat !== "Semua";
    vGrid.innerHTML = cats.map(cat => {
      const items = list.filter(x => x.kat === cat);
      return `<section class="vocab-group acc${autoOpen ? " open" : ""}" data-cat="${esc(cat)}">
        <div class="vocab-head acc-head">
          <span class="vocab-dot"></span>
          <h3>${esc(cat)}</h3>
          <span class="cnt">${items.length} kata</span>
          ${ACC_ARROW}
        </div>
        <div class="acc-body"><div class="vocab-grid" data-built=""></div></div>
      </section>`;
    }).join("");
    vGrid.querySelectorAll(".vocab-group").forEach(sec => {
      const items = list.filter(x => x.kat === sec.dataset.cat);
      const body = sec.querySelector(".vocab-grid");
      const build = () => {
        if (body.dataset.built) return;
        body.innerHTML = items.map(x => `
          <article class="vocab-card">
            <span class="cat">${esc(x.kat)}</span>
            <div class="jp">${esc(x.jp)}</div>
            <div class="kana">${esc(x.kana)}</div>
            <div class="id">${esc(x.id)}</div>
            <div class="foot"><small>${esc(x.kat)}</small>
              <button class="speak" data-speak="${esc(x.jp)}" aria-label="Dengar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8 8 0 0 1 0 12"/></svg></button>
            </div>
          </article>`).join("");
        body.querySelectorAll(".vocab-card").forEach((card, i) => {
          card.classList.add("fade-up");
          card.style.animationDelay = Math.min(i * 0.03, 0.45) + "s";
        });
        body.querySelectorAll(".speak").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); speak(b.dataset.speak); }));
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
  vSearch.addEventListener("input", e => { vQuery = e.target.value.trim(); renderVocab(); });

  /* =======================================================
     FORUM INFO (bisa diubah admin)
     ======================================================= */
  const DEFAULT_FORUM = window.Store.DEFAULT_FORUM;
  let forum = Object.assign({}, DEFAULT_FORUM);
  function renderForum() {
    $("#forumHari").textContent = forum.hari;
    $("#forumTempat").textContent = forum.tempat;
    $("#forumWaktu").textContent = forum.waktu;
    $("#forumCatatan").textContent = forum.catatan;
  }
  async function loadForum() { try { forum = await window.Store.getForum(); } catch (e) {} renderForum(); }

  /* =======================================================
     SLIDER TENTANG
     ======================================================= */
  const SLIDES = [
    { e:"Tentang kami", t:"Bukan kelas yang tegang", p:"Di Aozora, kamu nggak harus sudah bisa bahasa Jepang buat mulai. Kita belajar santai, banyak ketawa, dan saling bantu. Yang penting berani coba." },
    { e:"Cara belajar", t:"Satu huruf sehari, cukup", p:"Kita mulai dari hiragana & katakana, lanjut ke kosakata yang sering dipakai. Ada juga latihan ngobrol biar makin percaya diri." },
    { e:"Siapa saja boleh", t:"Terbuka buat semua jurusan", p:"Mau dari TKJ, RPL, atau jurusan lain — semua boleh ikut. Nggak ada syarat khusus, cuma niat buat belajar bareng." },
    { e:"Suasana", t:"Kadang belajar, kadang seru-seruan", p:"Sesekali kita bikin origami, kaligrafi, dengar lagu Jepang, atau sekadar ngobrol soal anime. Belajar jadi nggak membosankan." },
    { e:"Pesan pengurus", t:"Jangan takut salah", p:"Salah itu bagian dari belajar. Justru dari salah kita cepat paham. Jadi, berani tampil dan tanya, ya!" },
  ];
  (function slider() {
    const wrap = $("#aboutSlides"), dots = $("#slideDots");
    if (!wrap) return;
    wrap.innerHTML = SLIDES.map(s => `<div class="slide"><span class="s-eyebrow">${s.e}</span><h3>${s.t}</h3><p>${s.p}</p></div>`).join("");
    dots.innerHTML = SLIDES.map((_, i) => `<button data-i="${i}" class="${i === 0 ? "on" : ""}" aria-label="Slide ${i + 1}"></button>`).join("");
    let idx = 0, timer;
    const go = i => { idx = (i + SLIDES.length) % SLIDES.length; wrap.style.transform = `translateX(-${idx * 100}%)`;
      dots.querySelectorAll("button").forEach((b, j) => b.classList.toggle("on", j === idx)); };
    const next = () => go(idx + 1), prev = () => go(idx - 1);
    const restart = () => { clearInterval(timer); if (!matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(next, 5200); };
    $("#slideNext").addEventListener("click", () => { next(); restart(); });
    $("#slidePrev").addEventListener("click", () => { prev(); restart(); });
    dots.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { go(+b.dataset.i); restart(); }));
    restart();
  })();

  /* =======================================================
     GALERI
     ======================================================= */
  let gallery = [];
  const gGrid = $("#galleryGrid");
  function renderGallery() {
    if (!gGrid) return;
    if (!gallery.length) {
      gGrid.innerHTML = `<div class="gallery-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:40px;height:40px;margin:0 auto 12px;opacity:.6"><rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="M4 17l4.5-4.5 3.5 3.5 3-3L20 16"/></svg>
        <b>Momen seru kita belum ada di sini</b><br><small>Foto-foto kegiatan bakal muncul di sini segera. Pantengin terus ya!</small>
      </div>`;
      return;
    }
    gGrid.innerHTML = gallery.map(g => `<figure class="gallery-item"><img src="${esc(g.src)}" alt="${esc(g.caption || 'Foto kegiatan')}" loading="lazy" /><figcaption>${esc(g.caption || '')}</figcaption></figure>`).join("");
  }
  async function loadGallery() { try { gallery = await window.Store.listGallery(); } catch (e) { gallery = []; } renderGallery(); }

  /* =======================================================
     PESAN — helper
     ======================================================= */
  let deviceId = localStorage.getItem(LS.device);
  if (!deviceId) { deviceId = "d_" + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(LS.device, deviceId); }
  function anonName(id) {
    let h = 0; const s = String(id);
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return "Pengunjung " + ((h % 900) + 100);
  }
  const initials = n => n.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("") || "?";
  function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "baru saja";
    if (s < 3600) return Math.floor(s / 60) + " menit lalu";
    if (s < 86400) return Math.floor(s / 3600) + " jam lalu";
    const d = Math.floor(s / 86400);
    if (d < 30) return d + " hari lalu";
    return new Date(ts).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" });
  }
  const stars = n => n ? "★".repeat(n) + "☆".repeat(5 - n) : "";

  /* ---------- ADMIN STATE ---------- */
  const ADMIN_HASH = "245c4800c06a59aa9e91771db88e8b514270f11fa9533e62daf3c37fa1858b4c"; // aozora2026
  let isAdmin = sessionStorage.getItem("aozora.admin") === "1";

  async function sha256(str) {
    if (crypto?.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
    }
    return "";
  }

  /* =======================================================
     PESAN PUBLIK
     ======================================================= */
  const fbForm = $("#fbForm"), fbList = $("#fbList"), fbFilter = $("#fbFilter");
  let feedback = [];
  let rating = 0, fbCat = "Semua";
  const loadingFB = '<div class="fb-empty"><b>Memuat pesan…</b></div>';

  /* dropdown custom */
  (function select() {
    const sel = $("#fbTypeSelect"), btn = $("#fbTypeBtn"), menu = $("#fbTypeMenu"),
          icBox = $("#fbTypeIc"), label = $("#fbTypeLabel"), hidden = $("#fbType");
    function paint(v) {
      const t = TYPES.find(x => x.v === v) || TYPES[0];
      icBox.innerHTML = t.ic; label.textContent = t.v; hidden.value = t.v;
      menu.querySelectorAll("li").forEach(li => li.classList.toggle("on", li.dataset.v === t.v));
    }
    menu.innerHTML = TYPES.map(t => `<li data-v="${t.v}"><span class="select-ic">${t.ic}</span>${t.v}</li>`).join("");
    paint("Saran");
    btn.addEventListener("click", e => { e.stopPropagation(); sel.classList.toggle("open"); });
    menu.querySelectorAll("li").forEach(li => li.addEventListener("click", () => { paint(li.dataset.v); sel.classList.remove("open"); }));
    document.addEventListener("click", e => { if (!sel.contains(e.target)) sel.classList.remove("open"); });
  })();

  /* rating bintang */
  (function ratingUI() {
    const box = $("#fbRating");
    box.innerHTML = [1,2,3,4,5].map(v => `<button type="button" data-v="${v}" aria-label="${v} dari 5">${I.star}</button>`).join("");
    box.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      rating = +b.dataset.v;
      box.querySelectorAll("button").forEach(x => x.classList.toggle("on", +x.dataset.v <= rating));
    }));
  })();

  const likeCount = f => Number(f.likes) || 0;
  const likedByMe = f => window.Store.liked.has(f.id);
  const personOf = f => isAdmin
    ? { name: f.name, avatar: initials(f.name), real: true }
    : { name: anonName(f.id), avatar: "?", anon: true };

  function renderFeedback() {
    const cats = ["Semua", ...new Set(feedback.map(f => f.type))];
    fbFilter.innerHTML = cats.map(c => `<button class="chip${c === fbCat ? " active" : ""}" data-cat="${c}">${c}</button>`).join("");
    fbFilter.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => { fbCat = c.dataset.cat; renderFeedback(); }));

    const list = feedback.filter(f => fbCat === "Semua" || f.type === fbCat)
      .sort((a, b) => (isAdmin ? b.ts - a.ts : likeCount(b) - likeCount(a) || b.ts - a.ts));

    if (!list.length) {
      fbList.innerHTML = `<div class="fb-empty"><b>Belum ada pesan</b><br><small>Jadilah yang pertama menulis masukan atau cerita.</small></div>`;
      return;
    }
    fbList.innerHTML = list.map(f => {
      const p = personOf(f), liked = likedByMe(f);
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
    }).join("");
    fbList.querySelectorAll(".like-btn").forEach(b => b.addEventListener("click", () => toggleLike(b.dataset.like)));
    fbList.querySelectorAll(".del").forEach(b => b.addEventListener("click", async () => {
      const id = b.dataset.del;
      feedback = feedback.filter(f => String(f.id) !== String(id));
      renderFeedback(); updateStats();
      try { await window.Store.deleteFeedback(id); } catch (e) { toast("Gagal menghapus (koneksi?)"); }
      toast("Pesan dihapus");
    }));
  }
  async function loadFeedback() {
    fbList.innerHTML = loadingFB;
    try { feedback = await window.Store.listFeedback(); }
    catch (e) { feedback = []; toast("Gagal memuat pesan (cek koneksi)"); }
    renderFeedback(); updateStats();
  }
  async function toggleLike(id) {
    const f = feedback.find(x => String(x.id) === String(id)); if (!f) return;
    const wasLiked = window.Store.liked.has(id);
    const n = Math.max(0, likeCount(f) + (wasLiked ? -1 : 1));
    f.likes = n;
    window.Store.liked.set(id, !wasLiked);
    renderFeedback();
    if (!wasLiked) toast("Kamu menyukai pesan ini");
    try { await window.Store.setLikes(id, n); } catch (e) { toast("Gagal menyimpan like (koneksi?)"); }
  }
  const setInvalid = (sel, bad) => $(sel).classList.toggle("invalid", bad);

  fbForm.addEventListener("submit", async e => {
    e.preventDefault();
    const name = $("#fbName").value.trim(), msg = $("#fbMsg").value.trim(), type = $("#fbType").value;
    let bad = false;
    if (name.length < 2) { setInvalid("#fName", true); bad = true; } else setInvalid("#fName", false);
    if (msg.length < 5)  { setInvalid("#fMsg", true); bad = true; } else setInvalid("#fMsg", false);
    const res = $("#fbResult"); res.className = "form-msg";
    if (bad) { res.classList.add("bad"); res.textContent = "Lengkapi dulu: nama & pesan (min. 5 karakter)."; return; }
    try { await window.Store.addFeedback({ name, msg, type, rating }); }
    catch (err) { res.classList.add("bad"); res.textContent = "Gagal mengirim. Coba lagi ya."; return; }
    fbForm.reset(); rating = 0; $("#fbRating").querySelectorAll("button").forEach(x => x.classList.remove("on"));
    await loadFeedback();
    res.classList.add("ok"); res.textContent = "Terima kasih! Pesanmu terkirim. Nama kamu cuma terlihat oleh pengurus.";
    toast("Pesan terkirim");
    setTimeout(() => { res.className = "form-msg"; }, 6000);
  });

  /* =======================================================
     PESAN PRIBADI
     ======================================================= */
  let privateMsgs = [];
  const pvForm = $("#pvForm");
  pvForm.addEventListener("submit", async e => {
    e.preventDefault();
    const name = $("#pvName").value.trim(), msg = $("#pvMsg").value.trim();
    let bad = false;
    if (name.length < 2) { setInvalid("#pvNameField", true); bad = true; } else setInvalid("#pvNameField", false);
    if (msg.length < 5)  { setInvalid("#pvMsgField", true); bad = true; } else setInvalid("#pvMsgField", false);
    const res = $("#pvResult"); res.className = "form-msg";
    if (bad) { res.classList.add("bad"); res.textContent = "Lengkapi dulu: nama & pesan (min. 5 karakter)."; return; }
    try { await window.Store.addPrivate({ name, msg }); }
    catch (err) { res.classList.add("bad"); res.textContent = "Gagal mengirim. Coba lagi ya."; return; }
    pvForm.reset();
    res.classList.add("ok"); res.textContent = "Terkirim. Pesanmu cuma bisa dibaca pengurus, aman.";
    toast("Pesan pribadi terkirim");
    await loadPrivate(); renderPrivateAdmin();
    setTimeout(() => { res.className = "form-msg"; }, 6000);
  });
  async function loadPrivate() {
    try { privateMsgs = await window.Store.listPrivate(); } catch (e) { privateMsgs = []; }
  }

  /* =======================================================
     PANE TABS (publik / pribadi)
     ======================================================= */
  $$(".ptab").forEach(t => t.addEventListener("click", () => {
    $$(".ptab").forEach(x => x.classList.toggle("active", x === t));
    $$(".pesan-pane").forEach(p => p.classList.toggle("hidden", p.dataset.pane !== t.dataset.ptab));
  }));

  /* =======================================================
     ADMIN MODAL
     ======================================================= */
  const modal = $("#adminModal");
  const openAdmin  = () => modal.classList.add("open");
  const closeAdmin = () => modal.classList.remove("open");

  function applyAdminUI() {
    document.body.classList.toggle("is-admin", isAdmin);
    $("#adminLoginView").classList.toggle("hidden", isAdmin);
    $("#adminDash").classList.toggle("hidden", !isAdmin);
    $("#fbClear").classList.toggle("hidden", !isAdmin);
    renderFeedback();
    if (isAdmin) { fillForumForm(); loadPrivate().then(renderPrivateAdmin); renderGalleryAdmin(); }
  }

  $("#adminCorner").addEventListener("click", () => { openAdmin(); });
  $("#adminClose").addEventListener("click", closeAdmin);
  modal.addEventListener("click", e => { if (e.target === modal) closeAdmin(); });

  $("#adminLogin").addEventListener("submit", async e => {
    e.preventDefault();
    const u = $("#adminUser").value.trim().toLowerCase(), p = $("#adminPass").value, err = $("#adminErr");
    err.style.display = "none";
    if (u !== "admin") { err.textContent = "Username salah (gunakan: admin)."; err.style.display = "block"; return; }
    const h = await sha256(p);
    if (!h) { err.textContent = "Buka lewat server (http/localhost) supaya login bisa diverifikasi."; err.style.display = "block"; return; }
    if (h !== ADMIN_HASH) { err.textContent = "Password salah."; err.style.display = "block"; return; }
    isAdmin = true; sessionStorage.setItem("aozora.admin", "1");
    $("#adminPass").value = ""; applyAdminUI(); toast("Login pengurus berhasil");
  });
  $("#adminLogout").addEventListener("click", () => {
    isAdmin = false; sessionStorage.removeItem("aozora.admin"); applyAdminUI(); closeAdmin(); toast("Keluar dari mode pengurus");
  });

  $$(".atab").forEach(t => t.addEventListener("click", () => {
    $$(".atab").forEach(x => x.classList.toggle("active", x === t));
    $$(".admin-pane").forEach(p => p.classList.toggle("hidden", p.dataset.apane !== t.dataset.atab));
  }));

  /* forum form */
  function fillForumForm() {
    $("#fHari").value = forum.hari; $("#fTempat").value = forum.tempat;
    $("#fWaktu").value = forum.waktu; $("#fCatatan").value = forum.catatan;
  }
  $("#fSave").addEventListener("click", async () => {
    forum = {
      hari: $("#fHari").value.trim() || DEFAULT_FORUM.hari,
      tempat: $("#fTempat").value.trim() || DEFAULT_FORUM.tempat,
      waktu: $("#fWaktu").value.trim() || DEFAULT_FORUM.waktu,
      catatan: $("#fCatatan").value.trim() || DEFAULT_FORUM.catatan,
    };
    try { await window.Store.setForum(forum); } catch (e) { toast("Gagal menyimpan (cek koneksi)"); }
    renderForum(); toast("Info pertemuan disimpan");
  });

  /* private list (admin) */
  function renderPrivateAdmin() {
    const box = $("#privateList"); if (!box) return;
    if (!privateMsgs.length) { box.innerHTML = `<div class="admin-empty">Belum ada pesan pribadi.</div>`; return; }
    box.innerHTML = privateMsgs.slice().sort((a,b) => b.ts - a.ts).map(m => `
      <div class="admin-item">
        <div class="ai-top"><span class="ai-who">${esc(m.name)}</span><span class="ai-when">${timeAgo(m.ts)}</span></div>
        <p>${esc(m.msg)}</p>
        <button class="ai-del" data-pvdel="${m.id}">Hapus</button>
      </div>`).join("");
    box.querySelectorAll("[data-pvdel]").forEach(b => b.addEventListener("click", async () => {
      const id = b.dataset.pvdel;
      privateMsgs = privateMsgs.filter(m => String(m.id) !== String(id));
      renderPrivateAdmin();
      try { await window.Store.deletePrivate(id); } catch (e) { toast("Gagal menghapus (koneksi?)"); }
      toast("Pesan pribadi dihapus");
    }));
  }

  /* gallery admin */
  function renderGalleryAdmin() {
    const box = $("#galleryAdminList"); if (!box) return;
    if (!gallery.length) { box.innerHTML = `<div class="admin-empty">Belum ada foto.</div>`; return; }
    box.innerHTML = gallery.map(g => `
      <div class="g-item"><img src="${esc(g.src)}" alt="" /><span class="g-cap">${esc(g.caption || '(tanpa keterangan)')}</span>
      <button class="ai-del" data-gdel="${g.id}">Hapus</button></div>`).join("");
    box.querySelectorAll("[data-gdel]").forEach(b => b.addEventListener("click", async () => {
      const id = b.dataset.gdel;
      gallery = gallery.filter(g => String(g.id) !== String(id));
      renderGallery(); renderGalleryAdmin();
      try { await window.Store.deleteGallery(id); } catch (e) { toast("Gagal menghapus (koneksi?)"); }
      toast("Foto dihapus");
    }));
  }
  $("#gAdd").addEventListener("click", async () => {
    const cap = $("#gCaption").value.trim();
    const url = $("#gUrl").value.trim();
    const file = $("#gFile").files[0];
    const add = async src => {
      try { await window.Store.addGallery({ src, caption: cap }); }
      catch (e) { toast("Gagal menambah foto (cek koneksi)"); return; }
      $("#gCaption").value = ""; $("#gUrl").value = ""; $("#gFile").value = "";
      await loadGallery(); renderGalleryAdmin();
      toast("Foto ditambahkan");
    };
    if (file) {
      if (file.size > 3.5 * 1024 * 1024) { toast("Foto terlalu besar (maks ~3.5MB). Pakai link/URL untuk foto besar."); return; }
      const r = new FileReader(); r.onload = () => add(r.result); r.readAsDataURL(file);
    } else if (url) {
      add(url);
    } else {
      toast("Isi link foto atau pilih file dulu");
    }
  });

  /* clear all (admin) */
  $("#fbClear").addEventListener("click", async () => {
    if (!isAdmin) return;
    if (!feedback.length) { toast("Belum ada pesan untuk dihapus"); return; }
    if (confirm("Hapus SEMUA pesan di papan publik?")) {
      try { await window.Store.clearFeedback(); } catch (e) { toast("Gagal menghapus (koneksi?)"); }
      await loadFeedback(); toast("Semua pesan dihapus");
    }
  });

  /* =======================================================
     STATS + INIT
     ======================================================= */
  function updateStats() {
    $("#statKana").textContent  = HIRAGANA.length + KATAKANA.length;
    $("#statVocab").textContent = KOSAKATA.length;
    $("#statFb").textContent    = feedback.length;
  }
  function countUp(el, to) { let n = 0; const step = Math.max(1, Math.ceil(to / 40)); const t = setInterval(() => { n += step; if (n >= to) { n = to; clearInterval(t); } el.textContent = n; }, 26); }
  function animateStats() { countUp($("#statKana"), HIRAGANA.length + KATAKANA.length); countUp($("#statVocab"), KOSAKATA.length); countUp($("#statFb"), feedback.length); }

  $("#year").textContent = new Date().getFullYear();
  buildChips(); renderKana();
  buildVocabChips(); renderVocab();
  applyAdminUI();
  setTimeout(animateStats, 600);

  /* muat data dari store (Supabase / lokal) */
  loadFeedback();
  loadForum();
  loadGallery();
  loadPrivate();
  if (window.Store.mode === "local") {
    setTimeout(() => toast("Mode lokal: pesan hanya tersimpan di perangkat ini. Hubungkan database untuk mode online."), 2500);
  }

  window.AOZORA = { speak, renderKana, renderVocab, renderFeedback, get feedback() { return feedback; }, get privateMsgs() { return privateMsgs; }, get gallery() { return gallery; }, get mode() { return window.Store.mode; } };
})();
