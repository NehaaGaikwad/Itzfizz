import { writeFile } from "node:fs/promises";

const [width, height, scrollY, filename] = process.argv.slice(2);
const pages = await fetch("http://127.0.0.1:9222/json/list").then((response) => response.json());
const page = pages.find((item) => item.type === "page" && item.url.includes("localhost:3000"));
if (!page) throw new Error("No localhost:3000 browser page is available.");
const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let id = 0;
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  const resolve = pending.get(message.id);
  if (resolve) { pending.delete(message.id); resolve(message.result); }
});
await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));
const call = (method, params = {}) => new Promise((resolve) => {
  id += 1;
  pending.set(id, resolve);
  socket.send(JSON.stringify({ id, method, params }));
});
await call("Emulation.setDeviceMetricsOverride", { deviceScaleFactor: 1, height: Number(height), mobile: false, width: Number(width) });
await call("Page.navigate", { url: "http://localhost:3000" });
await new Promise((resolve) => setTimeout(resolve, 1800));
await call("Runtime.evaluate", { expression: `window.scrollTo(0, ${Number(scrollY)})` });
await new Promise((resolve) => setTimeout(resolve, 700));
const image = await call("Page.captureScreenshot", { format: "png" });
await writeFile(filename, Buffer.from(image.data, "base64"));
socket.close();
