import { chromium } from "playwright";

const base = "http://127.0.0.1/enliteeducations";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));

await page.goto(`${base}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.getByRole("button", { name: "Check our catalogue" }).first().waitFor();
const count = await page.getByRole("button", { name: "Check our catalogue" }).count();
console.log("catalogue_buttons", count);
await page.getByRole("button", { name: "Check our catalogue" }).first().click();
await page.getByRole("button", { name: "Close" }).waitFor();
console.log("modal_title", await page.locator("h2").last().innerText());

const canvas = page.locator("canvas");
try {
  await canvas.first().waitFor({ timeout: 60000 });
  console.log("canvas_count", await canvas.count());
} catch {
  console.log("canvas_count", 0);
}

await page.screenshot({
  path: "C:/Users/mahes/projects/enliteeducations/localhost-catalogue.png",
});
await browser.close();
