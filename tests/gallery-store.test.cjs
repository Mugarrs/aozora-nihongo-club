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
  return window.Store;
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
  assert.match(appSource, /Server penyimpanan tidak bisa dijangkau/);

  const working = makeStore();
  await working.addGallery({ src: "data:image/jpeg;base64,AA==", caption: "latihan" });
  assert.equal((await working.listGallery()).length, 1, "saved photo should appear in gallery");

  const full = makeStore({ failWrite: true });
  await assert.rejects(
    full.addGallery({ src: "data:image/jpeg;base64,AA==", caption: "latihan" }),
    { name: "QuotaExceededError" },
    "gallery save must report storage quota errors instead of claiming success",
  );
  assert.equal((await full.listGallery()).length, 0, "failed write must not create a fake gallery item");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
