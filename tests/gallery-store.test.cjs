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
  assert.doesNotMatch(
    html,
    /dokumentasi|galleryGrid|galleryUploadFields|data-atab="gallery"|Galeri/i,
    "gallery UI must be removed from the website",
  );
  assert.doesNotMatch(
    appSource,
    /galleryAuto|loadGallery|galleryAdminList|gFile|galleryTimer/i,
    "gallery upload and rendering logic must be removed",
  );
  assert.match(html, /id="adminCorner"[^>]*aria-controls="adminModal"/);
  assert.match(appSource, /\$\("#adminCorner"\)\.addEventListener\("click"/);
  const { store: working } = makeStore();
  assert.equal((await working.listGallery()).length, 0, "old gallery data may remain unused without UI");
  assert.equal(working.mode, "local", "removing gallery UI must not alter other storage features");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
