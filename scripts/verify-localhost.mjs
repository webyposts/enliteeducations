import { chromium } from "playwright";

const base = "http://127.0.0.1/enliteeducations";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
page.on("console", (m) => {
  if (m.type() === "error") console.log("CONSOLE", m.text());
});

const home = await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 30000 });
console.log("home_status", home?.status());
console.log("home_title", await page.title());
const rootText = (await page.locator("#root").innerText().catch(() => "")).trim();
console.log("home_root_chars", rootText.length);
console.log("home_h1", await page.locator("h1").first().innerText().catch(() => ""));
await page.screenshot({
  path: "C:/Users/mahes/projects/enliteeducations/localhost-home.png",
  fullPage: true,
});

const about = await page.goto(`${base}/about`, { waitUntil: "networkidle", timeout: 30000 });
console.log("about_status", about?.status());
console.log("about_h1", await page.locator("h1").first().innerText().catch(() => ""));
await page.screenshot({
  path: "C:/Users/mahes/projects/enliteeducations/localhost-about.png",
  fullPage: true,
});

await browser.close();
