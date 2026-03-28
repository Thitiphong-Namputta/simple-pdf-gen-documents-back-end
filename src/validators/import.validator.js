import { z } from "zod";

// ── Per-type schemas ──────────────────────────────────────────────────────────

const invoiceItemSchema = z.object({
  name: z.string().min(1, "ชื่อสินค้าต้องไม่ว่าง"),
  qty: z.coerce.number().positive("จำนวนต้องมากกว่า 0"),
  price: z.coerce.number().nonnegative("ราคาต้องไม่ติดลบ"),
});

const SCHEMAS = {
  invoice: z.object({
    companyName: z.string().min(1, "ชื่อบริษัทต้องไม่ว่าง"),
    invoiceNo: z.string().min(1, "เลขที่ใบแจ้งหนี้ต้องไม่ว่าง"),
    clientName: z.string().min(1, "ชื่อลูกค้าต้องไม่ว่าง"),
    companyAddress: z.string().optional(),
    companyTel: z.string().optional(),
    companyEmail: z.string().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
    invoiceDate: z.string().optional(),
    dueDate: z.string().optional(),
    clientAddress: z.string().optional(),
    note: z.string().optional(),
    tax: z.coerce.number().min(0).max(100).optional(),
  }),

  report: z.object({
    title: z.string().min(1, "ชื่อรายงานต้องไม่ว่าง"),
    period: z.string().optional(),
    notes: z.string().optional(),
  }),

  certificate: z.object({
    recipientName: z.string().min(1, "ชื่อผู้รับต้องไม่ว่าง"),
    courseName: z.string().min(1, "ชื่อหลักสูตรต้องไม่ว่าง"),
    date: z.string().min(1, "วันที่ต้องไม่ว่าง"),
    organizationName: z.string().optional(),
    certificateNo: z.string().optional(),
    description: z.string().optional(),
  }),

  contract: z.object({
    title: z.string().min(1, "ชื่อสัญญาต้องไม่ว่าง"),
    contractDate: z.string().min(1, "วันที่ทำสัญญาต้องไม่ว่าง"),
    party1Name: z.string().min(1, "ชื่อคู่สัญญาที่ 1 ต้องไม่ว่าง"),
    party1Role: z.string().min(1, "บทบาทคู่สัญญาที่ 1 ต้องไม่ว่าง"),
    party2Name: z.string().min(1, "ชื่อคู่สัญญาที่ 2 ต้องไม่ว่าง"),
    party2Role: z.string().min(1, "บทบาทคู่สัญญาที่ 2 ต้องไม่ว่าง"),
    party1Address: z.string().optional(),
    party2Address: z.string().optional(),
    preamble: z.string().optional(),
  }),
};

const VALID_TYPES = Object.keys(SCHEMAS);

/**
 * Validate all rows first, collect every error, then return results.
 * @param {string} type  - invoice | report | certificate | contract
 * @param {object[]} rows - array of row objects keyed by column header
 * @returns {{ valid: boolean, errors: {row: number, field: string, message: string}[], data: object[] }}
 */
export function validateImportRows(type, rows) {
  if (!VALID_TYPES.includes(type)) {
    const err = new Error(`Invalid import type: "${type}". Valid: ${VALID_TYPES.join(", ")}`);
    err.statusCode = 400;
    throw err;
  }

  const schema = SCHEMAS[type];
  const errors = [];
  const data = [];

  rows.forEach((row, idx) => {
    const result = schema.safeParse(row);
    if (result.success) {
      data.push(result.data);
    } else {
      result.error.errors.forEach((e) => {
        errors.push({
          row: idx + 2, // +2: 1-indexed + header row
          field: e.path.join("."),
          message: e.message,
        });
      });
    }
  });

  return { valid: errors.length === 0, errors, data };
}
