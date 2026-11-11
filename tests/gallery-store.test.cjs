const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const project = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(project, "js/store.js"), "utf8");
const html = fs.readFileSync(path.join(project, "index.html"), "utf8");
const appSource = fs.readFileSync(path.join(project, "js/main.js"), "utf8");

function makeStore({ failWrite = false } = {}) {
  const data = new Map();
  const window = { AOZORA_CONFIG: {} };
  const localStorage = {
    getItem(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      if (failWrite) {
        const error = new Error("Quota exceeded");
        error.name = "QuotaExceededError";
        throw error;
      }
      data.set(key, String(value));
    },
  };
  vm.runInNewContext(source, { window, localStorage, Date, Math, JSON });
  return { store: window.Store, window, localStorage };
}

async function main() {
  assert.match(html, /id="gFile"[^>]*multiple/, "gallery must accept multiple image files");
  assert.doesNotMatch(
    html,
    /id="gUrl"|id="gAdd"|id="gCaption"/,
    "gallery must not ask for URLs, captions, or submit button",
  );
  assert.match(
    appSource,
    /uploadInput\?\.addEventListener\("change", async \(\) =>/,
    "selecting files must begin upload immediately",
  );
  assert.match(
    appSource,
    /await window\.Store\.addGallery\(\{ src: photoData, caption \}\)[\s\S]*?await loadGallery\(\)/,
    "successful save must refresh visible gallery",
  );
  assert.match(html, /id="adminCorner"[^>]*aria-controls="adminModal"/);
  assert.match(appSource, /\$\("#adminCorner"\)\.addEventListener\("click"/);
  assert.match(appSource, /File tidak bisa dibuka|Browser tidak bisa membaca format foto/);
  assert.match(appSource, /Server galeri belum terhubung/);

  const { store: working } = makeStore();
  await working.addGallery({ src: "data:image/jpeg;base64,AA==", caption: "latihan" });
  assert.equal((await working.listGallery()).length, 1, "saved photo should appear in gallery");

  const { store: full } = makeStore({ failWrite: true });
  await assert.rejects(
    full.addGallery({ src: "data:image/jpeg;base64,AA==", caption: "latihan" }),
    { name: "QuotaExceededError" },
    "gallery save must report storage quota errors instead of claiming success",
  );
  assert.equal((await full.listGallery()).length, 0, "failed write must not create a fake gallery item");

  const fallbackData = new Map();
  const remoteWindow = {
    AOZORA_CONFIG: { supabaseUrl: "https://unit.test", supabaseKey: "public-test-key" },
    supabase: {
      createClient: () => ({
        from: () => ({
          insert: () => ({
            select: () => ({
              single: async () => {
                throw new TypeError("Failed to fetch");
              },
            }),
          }),
          delete: () => ({
            eq: async () => {
              throw new Error("local-only photo must not call remote delete");
            },
          }),
        }),
      }),
    },
  };
  const context = {
    window: remoteWindow,
    localStorage: {
      getItem(key) {
        return fallbackData.get(key) ?? null;
      },
      setItem(key, value) {
        fallbackData.set(key, String(value));
      },
    },
    Date,
    Math,
    JSON,
  };
  vm.runInNewContext(source, context);
  const fallbackStore = remoteWindow.Store;
  const localPhoto = await fallbackStore.addGallery({
    src: "data:image/jpeg;base64,AA==",
    caption: "fallback",
  });
  assert.equal(localPhoto.localOnly, true, "failed remote insert must return local-only status");
  assert.equal((await fallbackStore.listGallery())[0].localOnly, true);
  await fallbackStore.deleteGallery(localPhoto.id);
  assert.equal((await fallbackStore.listGallery()).length, 0, "local-only photo should delete locally");
  assert.equal(
    remoteWindow.Store.mode,
    "supabase",
    "fallback must not switch other store features offline",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
