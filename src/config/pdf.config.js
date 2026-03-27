import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const FONTS_DIR = path.join(__dirname, "..", "fonts");

export const PDF_OPTIONS = {
  invoice: {
    format: "A4",
    printBackground: true,
    margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" },
  },
  report: {
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
    displayHeaderFooter: true,
    headerTemplate: `<div style="width:100%;font-size:9px;text-align:right;padding-right:15mm;color:#888;">รายงาน</div>`,
    footerTemplate: `<div style="width:100%;font-size:9px;text-align:center;color:#888;">หน้า <span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
  },
  certificate: {
    format: "A4",
    landscape: true,
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  },
  contract: {
    format: "A4",
    printBackground: true,
    margin: { top: "25mm", right: "20mm", bottom: "25mm", left: "25mm" },
    displayHeaderFooter: true,
    headerTemplate: `<div style="width:100%;font-size:9px;text-align:center;color:#888;border-bottom:1px solid #ddd;padding-bottom:4px;">สัญญา / ข้อตกลง</div>`,
    footerTemplate: `<div style="width:100%;font-size:9px;text-align:center;color:#888;">หน้า <span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
  },
};

export const TEMPLATE_TIMEOUT = 15000;
