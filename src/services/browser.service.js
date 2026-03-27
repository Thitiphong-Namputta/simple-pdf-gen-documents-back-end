import { chromium } from "playwright";

let browser = null;
let pageCount = 0;
const PAGE_LIMIT = 50;

async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
    });
    pageCount = 0;
  }
  return browser;
}

export async function getPage() {
  if (pageCount >= PAGE_LIMIT) {
    await closeBrowser();
  }
  const b = await getBrowser();
  const page = await b.newPage();
  pageCount++;
  return page;
}

export async function closeBrowser() {
  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
    pageCount = 0;
  }
}
