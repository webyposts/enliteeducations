import { chromium } from "playwright";

const base = "http://127.0.0.1/enliteeducations";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));

await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 30000 });
await page.getByRole("heading", { name: "Books by Class" }).waitFor();
const folders = await page.locator("section").filter({ hasText: "Books by Class" }).locator("button").allTextContents();
console.log("folders", folders.join(" | "));
await page.getByRole("button", { name: /Class 5/ }).click();
await page.getByRole("heading", { name: "Class 5 samples" }).waitFor();
const titles = await page.locator("h4").allTextContents();
console.log("class5", titles.join(" | "));
await page.screenshot({
  path: "C:/Users/mahes/projects/enliteeducations/localhost-books.png",
  fullPage: false,
});

await page.goto(`${base}/catalog`, { waitUntil: "networkidle", timeout: 30000 });
console.log("catalog_h1", await page.locator("h1").first().innerText());
console.log("catalog_h2", (await page.locator("h2").allTextContents()).join(" | "));

await browser.close();
