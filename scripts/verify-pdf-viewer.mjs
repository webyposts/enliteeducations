import { chromium } from "playwright";

const base = "http://127.0.0.1/enliteeducations";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));

await page.goto(`${base}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.getByRole("button", { name: /Class 3/ }).click();
await page.getByRole("heading", { name: "Class 3 samples" }).waitFor();
await page.getByRole("button", { name: "View sample PDF" }).first().click();
const closeBtn = page.getByRole("button", { name: "Close" });
await closeBtn.waitFor();
console.log("modal_open", await closeBtn.isVisible());
console.log("modal_title", await page.locator("h2").last().innerText());

const canvas = page.locator("canvas");
try {
  await canvas.first().waitFor({ timeout: 45000 });
  console.log("canvas_count", await canvas.count());
} catch {
  console.log("canvas_count", 0);
  console.log("body_snip", (await page.locator("body").innerText()).slice(0, 400));
}

await page.screenshot({
  path: "C:/Users/mahes/projects/enliteeducations/localhost-pdf-viewer.png",
});

await page.getByRole("button", { name: "Close" }).click();
await page.goto(`${base}/read/class-3-evs-text-book`, { waitUntil: "domcontentloaded" });
console.log("reader_h1", await page.locator("h1").first().innerText());

await browser.close();
