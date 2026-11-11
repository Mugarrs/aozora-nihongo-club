/* =========================================================
   STORE — satu pintu untuk semua data.
   Otomatis pakai Supabase kalau sudah dikonfigurasi,
   kalau belum, pakai localStorage (perangkat).
   ========================================================= */
// Store menyamakan API lokal dan Supabase agar main.js tidak perlu tahu jalurnya.
window.Store = (function () {
  "use strict";
  const cfg = window.AOZORA_CONFIG || {};
  const hasSB = !!(
    cfg.supabaseUrl &&
    cfg.supabaseKey &&
    window.supabase &&
    window.supabase.createClient
  );
  const sb = hasSB ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey) : null;
  const mode = hasSB ? "supabase" : "local";

  // Semua kunci localStorage diberi namespace dan versi agar tidak bertabrakan.
  const K = {
    fb: "aozora.feedback.v1",
    pv: "aozora.private.v1",
    gal: "aozora.gallery.v1",
    forum: "aozora.forum.v1",
    liked: "aozora.liked.v1",
  };
  const rd = (k, d) => {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? d;
    } catch {
      return d;
    }
  };
  // wr mengembalikan status agar fitur yang perlu tahu kegagalan storage bisa menanganinya.
  const wr = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
      return true;
    } catch {
      return false;
    }
  };
  const uid = () => "x" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const ms = (r) => r.ts || (r.created_at ? Date.parse(r.created_at) : Date.now());

  const DEFAULT_FORUM = {
    hari: "Kamis",
    tempat: "C107",
    waktu: "15.30 – selesai",
    catatan: "Bawa buku catatan & semangat. Kalau pindah ruang, bakal diinfokan lewat grup kelas.",
  };

  /* daftar pesan yang sudah di-like (per perangkat) */
  const liked = {
    all: () => rd(K.liked, []).map(String),
    has: (id) => rd(K.liked, []).map(String).includes(String(id)),
    set: (id, on) => {
      let a = rd(K.liked, []).map(String);
      id = String(id);
      if (on && !a.includes(id)) a.push(id);
      if (!on) a = a.filter((x) => x !== id);
      wr(K.liked, a);
    },
  };

  // Fungsi norm menyamakan bentuk record remote dengan format internal website.
  const normFb = (r) => ({
    id: r.id,
    name: r.name,
    msg: r.msg,
    type: r.type,
    rating: r.rating || 0,
    likes: r.likes || 0,
    ts: ms(r),
  });
  const normPv = (r) => ({ id: r.id, name: r.name, msg: r.msg, ts: ms(r) });
  const normG = (r) => ({
    id: r.id,
    src: r.src,
    caption: r.caption || "",
    ts: ms(r),
  });

  /* ---------------- MODE LOKAL (perangkat) ---------------- */
  // MODE LOKAL: tiap fungsi menyimpan/membaca data dari perangkat ini saja.
  const local = {
    // Ambil semua pesan publik dan normalkan field-nya.
    async listFeedback() {
      return rd(K.fb, []).map(normFb);
    },
    // Tambahkan pesan baru, lalu kembalikan record yang dibuat.
    async addFeedback(o) {
      const a = rd(K.fb, []);
      const row = {
        id: uid(),
        name: o.name,
        msg: o.msg,
        type: o.type,
        rating: o.rating || 0,
        likes: 0,
        ts: Date.now(),
      };
      a.push(row);
      wr(K.fb, a);
      return row;
    },
    // Simpan jumlah suka terbaru untuk satu pesan.
    async setLikes(id, n) {
      const a = rd(K.fb, []);
      const r = a.find((x) => String(x.id) === String(id));
      if (r) {
        r.likes = n;
        wr(K.fb, a);
      }
    },
    // Hapus satu pesan berdasarkan ID.
    async deleteFeedback(id) {
      wr(
        K.fb,
        rd(K.fb, []).filter((x) => String(x.id) !== String(id)),
      );
    },
    // Kosongkan papan pesan; panggilan dibatasi ke panel admin di UI.
    async clearFeedback() {
      wr(K.fb, []);
    },
    // Daftar pesan privat untuk pengurus.
    async listPrivate() {
      return rd(K.pv, []).map(normPv);
    },
    // Simpan pesan privat baru.
    async addPrivate(o) {
      const a = rd(K.pv, []);
      const row = { id: uid(), name: o.name, msg: o.msg, ts: Date.now() };
      a.push(row);
      wr(K.pv, a);
      return row;
    },
    // Hapus pesan privat terpilih.
    async deletePrivate(id) {
      wr(
        K.pv,
        rd(K.pv, []).filter((x) => String(x.id) !== String(id)),
      );
    },
    // Baca jadwal; isi default dipakai bila belum ada record.
    async getForum() {
      return Object.assign({}, DEFAULT_FORUM, rd(K.forum, {}));
    },
    // Tambah atau perbarui satu record jadwal klub.
    async setForum(o) {
      wr(K.forum, o);
      return o;
    },
    // Ambil foto terbaru untuk galeri.
    async listGallery() {
      return rd(K.gal, []).map(normG);
    },
    // Simpan foto/caption baru.
    async addGallery(o) {
      const a = rd(K.gal, []);
      const row = {
        id: uid(),
        src: o.src,
        caption: o.caption || "",
        ts: Date.now(),
      };
      a.push(row);
      if (!wr(K.gal, a)) {
        const error = new Error("Penyimpanan perangkat penuh.");
        error.name = "QuotaExceededError";
        throw error;
      }
      return row;
    },
    // Hapus satu foto berdasarkan ID.
    async deleteGallery(id) {
      wr(
        K.gal,
        rd(K.gal, []).filter((x) => String(x.id) !== String(id)),
      );
    },
  };

  /* ---------------- MODE SUPABASE (online) ---------------- */
  // MODE SUPABASE: operasi setara dengan local, tetapi mengakses tabel database.
  const remote = {
    // Ambil semua pesan publik dan normalkan field-nya.
    async listFeedback() {
      const { data, error } = await sb
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(normFb);
    },
    // Tambahkan pesan baru, lalu kembalikan record yang dibuat.
    async addFeedback(o) {
      const { data, error } = await sb
        .from("feedback")
        .insert([
          {
            name: o.name,
            msg: o.msg,
            type: o.type,
            rating: o.rating || 0,
            likes: 0,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return normFb(data);
    },
    // Simpan jumlah suka terbaru untuk satu pesan.
    async setLikes(id, n) {
      const { error } = await sb.from("feedback").update({ likes: n }).eq("id", id);
      if (error) throw error;
    },
    // Hapus satu pesan berdasarkan ID.
    async deleteFeedback(id) {
      const { error } = await sb.from("feedback").delete().eq("id", id);
      if (error) throw error;
    },
    // Kosongkan papan pesan; panggilan dibatasi ke panel admin di UI.
    async clearFeedback() {
      const { error } = await sb.from("feedback").delete().neq("id", -1);
      if (error) throw error;
    },
    // Daftar pesan privat untuk pengurus.
    async listPrivate() {
      const { data, error } = await sb
        .from("private_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(normPv);
    },
    // Simpan pesan privat baru.
    async addPrivate(o) {
      const { data, error } = await sb
        .from("private_messages")
        .insert([{ name: o.name, msg: o.msg }])
        .select()
        .single();
      if (error) throw error;
      return normPv(data);
    },
    // Hapus pesan privat terpilih.
    async deletePrivate(id) {
      const { error } = await sb.from("private_messages").delete().eq("id", id);
      if (error) throw error;
    },
    // Baca jadwal; isi default dipakai bila belum ada record.
    async getForum() {
      const { data, error } = await sb.from("forum").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return Object.assign({}, DEFAULT_FORUM, data || {});
    },
    // Tambah atau perbarui satu record jadwal klub.
    async setForum(o) {
      const { error } = await sb.from("forum").upsert({
        id: 1,
        hari: o.hari,
        tempat: o.tempat,
        waktu: o.waktu,
        catatan: o.catatan,
      });
      if (error) throw error;
      return o;
    },
    // Ambil foto terbaru untuk galeri.
    async listGallery() {
      const { data, error } = await sb
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(normG);
    },
    // Simpan foto/caption baru.
    async addGallery(o) {
      const { data, error } = await sb
        .from("gallery")
        .insert([{ src: o.src, caption: o.caption || "" }])
        .select()
        .single();
      if (error) throw error;
      return normG(data);
    },
    // Hapus satu foto berdasarkan ID.
    async deleteGallery(id) {
      const { error } = await sb.from("gallery").delete().eq("id", id);
      if (error) throw error;
    },
  };

  // Galeri tetap dapat dipakai saat database tak terjangkau; item fallback ditandai localOnly.
  let galleryLocalOnly = !hasSB;
  async function listGallery() {
    const localRows = await local.listGallery();
    if (galleryLocalOnly) return localRows.map((row) => ({ ...row, localOnly: true }));
    try {
      const remoteRows = await remote.listGallery();
      return [...localRows.map((row) => ({ ...row, localOnly: true })), ...remoteRows];
    } catch {
      galleryLocalOnly = true;
      return localRows.map((row) => ({ ...row, localOnly: true }));
    }
  }
  async function addGallery(item) {
    if (!galleryLocalOnly) {
      try {
        return await remote.addGallery(item);
      } catch {
        galleryLocalOnly = true;
      }
    }
    return { ...(await local.addGallery(item)), localOnly: true };
  }
  async function deleteGallery(id) {
    const localRows = await local.listGallery();
    const isLocalPhoto = localRows.some((row) => String(row.id) === String(id));
    await local.deleteGallery(id);
    if (!isLocalPhoto && !galleryLocalOnly) await remote.deleteGallery(id);
  }

  // Ekspor satu pintu: galeri memakai fallback lokal khusus; operasi lain mengikuti mode biasa.
  return Object.assign({ mode, liked, DEFAULT_FORUM }, hasSB ? remote : local, {
    listGallery,
    addGallery,
    deleteGallery,
  });
})();
