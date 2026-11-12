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
  assert.doesNotMatch(html, /id="galleryAdminPassword"/, "gallery must not ask visitors for a password");
  const openSql = fs.readFileSync(path.join(project, "supabase-gallery-open.sql"), "utf8");
  assert.match(openSql, /'aozora-gallery'/, "open setup must create the bucket");
  assert.match(openSql, /for insert to anon/, "anonymous visitors may upload photos");
  assert.doesNotMatch(
    openSql,
    /create policy aozora_gallery_public_delete/i,
    "anonymous visitors must not delete shared photos",
  );
  assert.doesNotMatch(openSql, /gallery_upload_admins/, "open flow must not depend on admin accounts");
  assert.match(
    fs.readFileSync(path.join(project, "supabase-schema.sql"), "utf8"),
    /supabase-gallery-open.sql/,
  );

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

  const uploadedObjects = [];
  const insertedGalleryRows = [];
  let storageSession = null;
  const storageClient = {
    auth: {
      signInWithPassword: async () => {
        storageSession = { access_token: "test-session", user: { id: "admin-user" } };
        return { data: { user: { id: "admin-user" }, session: storageSession }, error: null };
      },
      getSession: async () => ({ data: { session: storageSession } }),
      signOut: async () => {
        storageSession = null;
        return { error: null };
      },
    },
    storage: {
      from(bucket) {
        return {
          async upload(path, blob, options) {
            uploadedObjects.push({ bucket, path, blob, options });
            return { data: { path }, error: null };
          },
          getPublicUrl(path) {
            return {
              data: { publicUrl: `https://unit.test/storage/v1/object/public/${bucket}/${path}` },
            };
          },
        };
      },
    },
    from(table) {
      return {
        select() {
          const query = {
            eq() {
              return query;
            },
            maybeSingle: async () => ({
              data: storageSession ? { user_id: "admin-user" } : null,
              error: null,
            }),
          };
          return query;
        },
        insert(rows) {
          insertedGalleryRows.push(rows[0]);
          return {
            select: () => ({
              single: async () => ({
                data: { ...rows[0], id: 42, created_at: new Date().toISOString() },
                error: null,
              }),
            }),
          };
        },
      };
    },
  };
  const storageWindow = {
    AOZORA_CONFIG: { supabaseUrl: "https://unit.test", supabaseKey: "public-test-key" },
    supabase: { createClient: () => storageClient },
  };
  const storageLocalData = new Map();
  const storageLocal = {
    getItem(key) {
      return storageLocalData.get(key) ?? null;
    },
    setItem(key, value) {
      storageLocalData.set(key, String(value));
    },
  };
  vm.runInNewContext(source, {
    window: storageWindow,
    localStorage: storageLocal,
    Date,
    Math,
    JSON,
    fetch,
    Blob,
  });
  const sharedPhoto = await storageWindow.Store.addGallery({
    src: "data:image/jpeg;base64,AA==",
    caption: "uji publik",
  });
  assert.equal(uploadedObjects.length, 1, "photo binary must upload to object storage");
  assert.equal(uploadedObjects[0].bucket, "aozora-gallery");
  assert.equal(uploadedObjects[0].options.contentType, "image/jpeg");
  await assert.rejects(
    storageWindow.Store.addGallery({
      src: new Blob([new Uint8Array(1024 * 1024 + 1)], { type: "image/jpeg" }),
      caption: "terlalu besar",
    }),
    /maksimal 1 MB/,
    "oversized images must be rejected before upload",
  );
  assert.equal(uploadedObjects.length, 1, "oversized image must not reach Storage");
  assert.equal(sharedPhoto.src, insertedGalleryRows[0].src);
  assert.match(sharedPhoto.src, /\/storage\/v1\/object\/public\/aozora-gallery\//);
  assert.doesNotMatch(
    insertedGalleryRows[0].src,
    /^data:image\//,
    "database must store public URL, not base64",
  );

  const fallbackData = new Map();
  const remoteWindow = {
    AOZORA_CONFIG: { supabaseUrl: "https://unit.test", supabaseKey: "public-test-key" },
    supabase: {
      createClient: () => ({
        auth: {
          getSession: async () => ({ data: { session: null } }),
          signOut: async () => ({ error: null }),
        },
        from: () => ({
          select: () => ({
            eq() {
              return this;
            },
            maybeSingle: async () => ({ data: null, error: null }),
          }),
          insert: () => ({
            select: () => ({
              single: async () => {
                throw new TypeError("Failed to fetch");
              },
            }),
          }),
          delete: () => ({
            eq: async () => {
              throw new Error("must not delete remote data");
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
    fetch,
    Blob,
  };
  vm.runInNewContext(source, context);
  const fallbackStore = remoteWindow.Store;
  await assert.rejects(
    fallbackStore.addGallery({ src: "data:image/jpeg;base64,AA==", caption: "fallback" }),
    /storage|undefined|Failed to fetch|from/i,
    "configured backend must surface upload failures instead of claiming success",
  );
  assert.equal(
    (await fallbackStore.listGallery()).length,
    0,
    "failed upload must not create a fake item",
  );
  assert.equal(
    remoteWindow.Store.mode,
    "supabase",
    "gallery failure must not switch other store features to local",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
