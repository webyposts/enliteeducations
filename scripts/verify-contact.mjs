import { chromium } from "playwright";

const base = "http://127.0.0.1/enliteeducations";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto(`${base}/contact`, { waitUntil: "domcontentloaded" });
await page.getByLabel("Full Name").fill("Priya Sharma");
await page.getByRole("combobox").click();
await page.getByRole("option", { name: "Teacher" }).click();
await page.getByLabel("School/Organization Name").fill("Delhi Public School");
await page.getByLabel("Email Address").fill("priya.sharma@example.com");
await page.getByLabel("Phone Number").fill("9876543210");
await page.getByLabel("Message / Requirements").fill("We would like sample books for Class 4.");
await page.getByRole("button", { name: "Send Message" }).click();
await page.getByText("Message received").waitFor({ timeout: 15000 });
console.log("form_ok", true);
await browser.close();
