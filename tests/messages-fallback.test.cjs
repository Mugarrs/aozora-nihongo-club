/* Cek fallback: pesan tetap terkirim walau Supabase mati (DNS hilang / project paused). */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const project = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(project, "js/store.js"), "utf8");
const appSource = fs.readFileSync(path.join(project, "js/main.js"), "utf8");
const messagesSource = fs.readFileSync(path.join(project, "js/features/messages.js"), "utf8");

function makeStore({ deadDb = true } = {}) {
  const data = new Map();
  const boom = () => {
    throw new TypeError("Failed to fetch");
  };
  const window = {
    AOZORA_CONFIG: { supabaseUrl: "https://example.supabase.co", supabaseKey: "k" },
    supabase: {
      createClient: () => ({ from: deadDb ? boom : () => ({}) }),
    },
  };
  const localStorage = {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, String(v)),
  };
  vm.runInNewContext(source, { window, localStorage, Date, Math, JSON, fetch, Blob });
  return { store: window.Store, data };
}

async function main() {
  const { store, data } = makeStore();

  assert.equal(store.mode, "supabase", "konfigurasi remote tetap dianggap aktif");
  assert.equal(store.offline, false, "belum ada kegagalan saat start");

  const row = await store.addFeedback({ name: "Rina", msg: "Halo klub", type: "Saran", rating: 4 });
  assert.ok(row.id, "pesan dapat ID lokal");
  assert.equal(row.localOnly, true, "pesan ditandai tersimpan di perangkat");
  assert.equal(store.offline, true, "store tahu database tak terjangkau");
  assert.ok(data.get("aozora.feedback.v1").includes("Halo klub"), "pesan benar-benar tersimpan");

  const list = await store.listFeedback();
  assert.equal(list.length, 1);
  assert.equal(list[0].name, "Rina");

  await store.setLikes(row.id, 3);
  await store.deleteFeedback(row.id);
  assert.equal((await store.listFeedback()).length, 0, "hapus jalan tanpa database");

  const pv = await store.addPrivate({ name: "Dina", msg: "Pesan rahasia" });
  assert.equal(pv.localOnly, true, "pesan pribadi juga punya cadangan");
  assert.equal((await store.listPrivate()).length, 1);
  await store.deletePrivate(pv.id);
  assert.equal((await store.listPrivate()).length, 0);

  const forum = await store.getForum();
  assert.equal(forum.hari, "Kamis", "jadwal jatuh ke nilai default, bukan error");

  assert.match(messagesSource, /window\.Store\.offline/, "UI memberi tahu saat pesan hanya tersimpan lokal");
  console.log("fallback pesan publik & pribadi saat database mati: lulus");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
