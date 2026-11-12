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
  vm.runInNewContext(source, { window, localStorage, Date, Math, JSON, fetch, Blob });
  return { store: window.Store, window, localStorage };
}

async function main() {
  assert.doesNotMatch(html, /id="dokumentasi"|id="galleryGrid"|id="gFile"|data-atab="gallery"/);
  assert.doesNotMatch(html, /href="#dokumentasi"|aria-label="Galeri"/);
  for (const id of ["home", "belajar", "kegiatan", "pesan", "adminModal"]) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(appSource, /function showRoute/);
  assert.match(appSource, /showRoute\(location\.hash \|\| "#home", false\)/);
  assert.match(appSource, /function applyAdminUI/);
  assert.doesNotMatch(appSource, /galleryAuto|loadGallery|galleryAdmin|gFile|renderGalleryAdmin|refreshGalleryAdminAuth/);
  const { store } = makeStore();
  await store.addGallery({ src: "data:image/jpeg;base64,AA==", caption: "data lama" });
  assert.equal((await store.listGallery()).length, 1, "gallery records stay preserved");
  console.log("gallery removal, remaining pages/admin, and preserved photo data passed");
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
