/* =========================================================
   PESAN & ADMIN — library fitur pesan.
   Dipisah dari main.js supaya file inti tetap ringkas.
   Butuh: window.AOZORA (helper dari main.js) dan window.Store (penyimpanan).
   ========================================================= */
(() => {
  "use strict";

  const { $, $$, esc, toast, I, TYPES } = window.AOZORA;

  /* ---------- HELPER PESAN ---------- */
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
        window.AOZORA.setFeedbackCount(feedback.length);
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
    window.AOZORA.setFeedbackCount(feedback.length);
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
    res.textContent = window.Store.offline
      ? "Pesan tersimpan di perangkat ini. Database sedang tidak bisa dihubungi, jadi belum tampil untuk pengunjung lain."
      : "Terima kasih! Pesanmu terkirim. Nama kamu cuma terlihat oleh pengurus.";
    toast(window.Store.offline ? "Tersimpan di perangkat" : "Pesan terkirim");
    setTimeout(() => {
      res.className = "form-msg";
    }, 6000);
  });

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
    res.textContent = window.Store.offline
      ? "Pesan tersimpan di perangkat ini. Database sedang tidak bisa dihubungi."
      : "Terkirim. Pesanmu cuma bisa dibaca pengurus, aman.";
    toast(window.Store.offline ? "Tersimpan di perangkat" : "Pesan pribadi terkirim");
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
    const f = window.AOZORA.forum;
    $("#fHari").value = f.hari;
    $("#fTempat").value = f.tempat;
    $("#fWaktu").value = f.waktu;
    $("#fCatatan").value = f.catatan;
  }
  $("#fSave").addEventListener("click", async () => {
    const D = window.Store.DEFAULT_FORUM;
    const next = {
      hari: $("#fHari").value.trim() || D.hari,
      tempat: $("#fTempat").value.trim() || D.tempat,
      waktu: $("#fWaktu").value.trim() || D.waktu,
      catatan: $("#fCatatan").value.trim() || D.catatan,
    };
    window.AOZORA.setForum(next);
    try {
      await window.Store.setForum(next);
    } catch (e) {
      toast("Gagal menyimpan (cek koneksi)");
    }
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

  /* ---------- INIT ---------- */
  applyAdminUI();
  loadFeedback();
  loadPrivate();
  if (window.Store.mode === "local") {
    setTimeout(
      () => toast("Mode lokal: pesan hanya tersimpan di perangkat ini. Hubungkan database untuk mode online."),
      2500,
    );
  }

  // Bagian pesan yang perlu dipakai file lain.
  Object.assign(window.AOZORA, {
    renderFeedback,
    loadFeedback,
    get feedback() {
      return feedback;
    },
    get privateMsgs() {
      return privateMsgs;
    },
  });
})();
