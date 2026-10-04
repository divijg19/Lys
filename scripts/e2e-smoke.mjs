import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL || "http://localhost:3000";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

try {
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 30_000 });

  const title = await page.title();
  if (!title || !/Divij|Portfolio|Lys/i.test(title)) {
    throw new Error(`Unexpected page title: ${title}`);
  }

  const bodyVisible = await page.locator("body").isVisible();
  if (!bodyVisible) {
    throw new Error("Body is not visible.");
  }

  const hasMainOrNav =
    (await page.locator("main").count()) > 0 || (await page.locator("nav").count()) > 0;
  if (!hasMainOrNav) {
    throw new Error("Expected <main> or <nav> landmark on homepage.");
  }

  console.log(`E2E smoke passed for ${baseUrl}`);
} finally {
  await context.close();
  await browser.close();
}
