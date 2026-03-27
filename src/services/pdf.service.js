import { compile } from "./template.service.js";
import { generate } from "../generators/playwright.generator.js";
import { PDF_OPTIONS } from "../config/pdf.config.js";

const VALID_TYPES = ["invoice", "report", "certificate", "contract"];

export async function generatePdf(type, data) {
  if (!VALID_TYPES.includes(type)) {
    const error = new Error(`Invalid document type: "${type}". Valid types: ${VALID_TYPES.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
  const html = compile(type, data);
  return generate(html, PDF_OPTIONS[type]);
}
