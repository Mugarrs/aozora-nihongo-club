const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const html = read("index.html");
const main = read("js/main.js");
const css = read("css/style.css");
const imports = [...css.matchAll(/@import\s+url\(["']([^"']+)["']\);/g)].map((m) => m[1]);
assert.deepEqual(imports, [
  "parts/00-base.css",
  "parts/01-navigation.css",
  "parts/02-layout-buttons.css",
  "parts/03-hero-mascot.css",
  "parts/04-learning.css",
  "parts/05-activities.css",
  "parts/06-legacy-gallery.css",
  "parts/07-messages.css",
  "parts/08-footer-admin.css",
  "parts/09-motion-accordion.css",
  "parts/10-responsive-overrides.css",
]);
const cssParts = imports.map((file) => fs.readFileSync(path.join(root, "css", file), "utf8"));
assert.ok(cssParts[3].includes(".hero-mascot"), "mascot CSS must stay in hero file");
assert.ok(cssParts[4].includes(".kana-groups"), "kana styles must stay with learning CSS");
assert.ok(cssParts[8].includes(".modal"), "admin modal styles must stay with admin components");
assert.ok(cssParts[6].length > 0, "keep legacy storage styles separate; UI removal must not erase data code");
for (const file of imports) assert.ok(fs.existsSync(path.join(root, "css", file)), `missing CSS ${file}`);
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map((m) => m[1]);
const featureScripts = [
  "js/features/about-slider.js",
  "js/features/kana-quiz.js",
  "js/features/daily-word.js",
];
for (const feature of featureScripts) {
  assert.ok(scripts.indexOf("js/main.js") < scripts.indexOf(feature), `${feature} must load after main.js`);
  assert.ok(fs.existsSync(path.join(root, feature)), `missing ${feature}`);
}
assert.match(html, /assets\/mascot-hero\.png/);
assert.match(html, /class="hero-mascot"/);
assert.match(html, /class="hero-logo-badge"/);
assert.doesNotMatch(html, /mascot-plate|mascot-portrait\.jpg/);
assert.match(main, /showRoute/);
assert.doesNotMatch(main, /function quiz\s*\(/);
assert.doesNotMatch(main, /const SLIDES\s*=/);
assert.match(read("js/features/kana-quiz.js"), /quizGo/);
assert.match(read("js/features/about-slider.js"), /SLIDES/);
assert.match(read("js/features/daily-word.js"), /kotdJp/);
assert.doesNotMatch(html, /Galeri|galeri|gallery/i);
console.log("site structure, CSS order, feature scripts, mascot, and removed gallery UI passed");
