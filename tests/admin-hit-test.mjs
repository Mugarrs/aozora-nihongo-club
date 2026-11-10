// Run after starting an isolated Chrome with CDP on port 9229 and serving the site at :8917.
import assert from "node:assert/strict";

const pages = await (await fetch("http://127.0.0.1:9229/json")).json();
const page = pages.find(
  (target) => target.type === "page" && target.url.startsWith("http://127.0.0.1:8917/"),
);
assert(page, "Local desktop test page was not found.");

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});

let nextId = 0;
const pending = new Map();
socket.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id || !pending.has(message.id)) return;
  const task = pending.get(message.id);
  pending.delete(message.id);
  message.error ? task.reject(Error(message.error.message)) : task.resolve(message.result);
};
const call = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const response = await call("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (response.exceptionDetails) throw Error(response.exceptionDetails.text);
  return response.result?.value;
};

await call("Page.enable");
await call("Page.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await call("Page.reload", { ignoreCache: true });
await new Promise((resolve) => setTimeout(resolve, 4000));

const button = await evaluate(`(() => {
  const element = document.querySelector("#adminCorner");
  const box = element.getBoundingClientRect();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2,
    visible: getComputedStyle(element).display !== "none" && box.width > 0,
    pointerEvents: getComputedStyle(element).pointerEvents,
    preloader: getComputedStyle(document.querySelector("#preloader")).pointerEvents };
})()`);
assert(button.visible, "Admin button must be visible at desktop width.");
assert.equal(button.pointerEvents, "auto");
assert.equal(button.preloader, "none", "finished preloader must not intercept pointer events");

await call("Input.dispatchMouseEvent", {
  type: "mouseMoved",
  x: button.x,
  y: button.y,
});
await call("Input.dispatchMouseEvent", {
  type: "mousePressed",
  x: button.x,
  y: button.y,
  button: "left",
  clickCount: 1,
});
await call("Input.dispatchMouseEvent", {
  type: "mouseReleased",
  x: button.x,
  y: button.y,
  button: "left",
  clickCount: 1,
});
await new Promise((resolve) => setTimeout(resolve, 100));
assert.equal(await evaluate('document.querySelector("#adminModal").classList.contains("open")'), true);
console.log("PASS: desktop mouse click opens Admin modal.");
socket.close();
