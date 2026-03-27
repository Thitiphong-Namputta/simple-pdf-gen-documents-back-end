import { getPage, closeBrowser } from "../services/browser.service.js";
import { TEMPLATE_TIMEOUT } from "../config/pdf.config.js";

export async function generate(html, options = {}) {
  const page = await getPage();
  try {
    await page.setContent(html, { waitUntil: "networkidle", timeout: TEMPLATE_TIMEOUT });
    await page.evaluateHandle("document.fonts.ready");
    const buffer = await page.pdf({ printBackground: true, ...options });
    return Buffer.from(buffer);
  } catch (err) {
    if (String(err).includes("Target closed") || String(err).includes("Browser closed")) {
      await closeBrowser();
    }
    throw err;
  } finally {
    await page.close().catch(() => {});
  }
}
