import { generatePdf } from "./pdf.service.js";
import { generateDocx } from "../generators/docx.generator.js";
import { generateXlsx } from "../generators/xlsx.generator.js";

const FORMATS = ["pdf", "docx", "xlsx"];

/**
 * Factory: generate a document buffer in the requested format.
 * @param {string} type  - invoice | report | certificate | contract
 * @param {string} format - pdf | docx | xlsx
 * @param {object} data  - document data
 * @returns {Promise<Buffer>}
 */
export async function exportDocument(type, format, data) {
  if (!FORMATS.includes(format)) {
    const err = new Error(`Invalid format: "${format}". Valid: ${FORMATS.join(", ")}`);
    err.statusCode = 400;
    throw err;
  }

  if (format === "pdf") return generatePdf(type, data);
  if (format === "docx") return generateDocx(type, data);
  return generateXlsx(type, data);
}

export const CONTENT_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export const FILE_EXTENSIONS = { pdf: "pdf", docx: "docx", xlsx: "xlsx" };
