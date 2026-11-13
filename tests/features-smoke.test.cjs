const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");

class Element {
  constructor(dataset = {}) {
    this.dataset = dataset;
    this.handlers = {};
    this.textContent = "";
    this.style = {};
    this.className = "";
    this.hidden = false;
    this.classes = new Set();
    this.classList = {
      add: (...names) => names.forEach((name) => this.classes.add(name)),
      remove: (...names) => names.forEach((name) => this.classes.delete(name)),
      toggle: (name, force) => {
        const next = force ?? !this.classes.has(name);
        next ? this.classes.add(name) : this.classes.delete(name);
        return next;
      },
      contains: (name) => this.classes.has(name),
    };
  }
  addEventListener(name, callback) {
    this.handlers[name] = callback;
  }
  click() {
    this.handlers.click?.({ target: this });
  }
  querySelectorAll(selector) {
    if (selector === "button") return this.buttons || [];
    if (selector === ".quiz-opt") return this.options || [];
    return [];
  }
  set innerHTML(html) {
    this.html = html;
    if (html.includes("quiz-opt")) {
      this.options = [...html.matchAll(/data-r="([^"]+)"/g)].map((m) => {
        const button = new Element({ r: m[1] });
        button.classList.add = (...names) => names.forEach((name) => button.classes.add(name));
        return button;
      });
    } else if (html.includes("data-i=")) {
      this.buttons = [...html.matchAll(/data-i="(\d+)"/g)].map((m) => new Element({ i: m[1] }));
    }
  }
  get innerHTML() {
    return this.html || "";
  }
  get offsetWidth() {
    return 1;
  }
}

function runFeature(file, elements, extras = {}) {
  const document = {
    querySelector: (selector) => elements[selector] || null,
    querySelectorAll: (selector) => elements[selector] || [],
  };
  const context = {
    document,
    window: { AOZORA: { speak: (word) => (context.spoken = word) } },
    matchMedia: () => ({ matches: true }),
    setInterval: () => 1,
    clearInterval: () => {},
    setTimeout: (callback) => callback(),
    ...extras,
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
  return context;
}

// Slider initialization and next-button behavior.
const slides = new Element();
const dots = new Element();
const next = new Element();
const prev = new Element();
runFeature("js/features/about-slider.js", {
  "#aboutSlides": slides,
  "#slideDots": dots,
  "#slideNext": next,
  "#slidePrev": prev,
});
assert.equal((slides.innerHTML.match(/class="slide"/g) || []).length, 5);
assert.equal(dots.buttons.length, 5);
next.click();
assert.equal(slides.style.transform, "translateX(-100%)");

// Quiz starts and renders one question with four answer choices.
const quizElements = {
  "#quizBox .quiz-tabs .tab": ["hiragana", "katakana", "campur"].map((qs) => new Element({ qs })),
  "#quizStart": new Element(),
  "#quizPlay": new Element(),
  "#quizDone": new Element(),
  "#quizGlyph": new Element(),
  "#quizOpts": new Element(),
  "#quizFb": new Element(),
  "#quizNum": new Element(),
  "#quizGo": new Element(),
  "#quizRetry": new Element(),
  "#quizBack": new Element(),
  "#quizScore": new Element(),
  "#quizVerdict": new Element(),
};
runFeature("js/features/kana-quiz.js", quizElements, {
  HIRAGANA: [{ k: "あ", r: "a" }, { k: "い", r: "i" }, { k: "う", r: "u" }, { k: "え", r: "e" }],
  KATAKANA: [{ k: "ア", r: "a" }, { k: "イ", r: "i" }, { k: "ウ", r: "u" }, { k: "エ", r: "e" }],
});
quizElements["#quizGo"].click();
assert.equal(quizElements["#quizGlyph"].textContent.length, 1);
assert.equal(quizElements["#quizOpts"].options.length, 4);
assert.equal(quizElements["#quizNum"].textContent, 1);

// Daily word fills visible fields and routes pronunciation through the shared helper.
const wordElements = Object.fromEntries(
  ["#kotdJp", "#kotdKana", "#kotdId", "#kotdKat", "#kotdSpeak"].map((selector) => [selector, new Element()]),
);
const context = runFeature("js/features/daily-word.js", wordElements, {
  KOSAKATA: [{ jp: "こんにちは", kana: "konnichiwa", id: "Selamat siang", kat: "Salam" }],
});
assert.equal(wordElements["#kotdJp"].textContent, "こんにちは");
assert.equal(wordElements["#kotdId"].textContent, "Selamat siang");
wordElements["#kotdSpeak"].click();
assert.equal(context.spoken, "こんにちは");

console.log("slider navigation, kana quiz initialization, and daily-word speech passed");
