import ExcelJS from "exceljs";
import { validateImportRows } from "../src/validators/import.validator.js";
import prisma from "../lib/prisma.js";

export const importFile = async (req, res, next) => {
  try {
    const { docType } = req.params;

    if (!req.file) {
      const err = new Error("กรุณาแนบไฟล์ Excel (.xlsx)");
      err.statusCode = 400;
      throw err;
    }

    // Parse Excel buffer
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(req.file.buffer);

    const ws = wb.worksheets[0];
    if (!ws) {
      const err = new Error("ไม่พบ worksheet ในไฟล์ Excel");
      err.statusCode = 422;
      throw err;
    }

    // Read headers from row 1
    const headers = [];
    ws.getRow(1).eachCell((cell) => {
      headers.push(String(cell.value ?? "").trim());
    });

    if (headers.length === 0) {
      const err = new Error("ไม่พบ header row ในไฟล์ Excel");
      err.statusCode = 422;
      throw err;
    }

    // Read data rows
    const rows = [];
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const obj = {};
      headers.forEach((header, colIdx) => {
        const cell = row.getCell(colIdx + 1);
        obj[header] = cell.value !== null && cell.value !== undefined ? String(cell.value) : "";
      });
      // Skip completely empty rows
      if (Object.values(obj).some((v) => v !== "")) {
        rows.push(obj);
      }
    });

    if (rows.length === 0) {
      const err = new Error("ไม่พบข้อมูลในไฟล์ Excel");
      err.statusCode = 422;
      throw err;
    }

    // Validate all rows first (collect all errors)
    const { valid, errors, data } = validateImportRows(docType, rows);

    if (!valid) {
      return res.status(422).json({
        message: "ข้อมูลบางแถวไม่ถูกต้อง กรุณาแก้ไขแล้วอัปโหลดใหม่",
        errors,
      });
    }

    // All-or-nothing insert
    await prisma.$transaction(
      data.map((row) =>
        prisma.importRecord.create({
          data: {
            type: docType,
            payload: JSON.stringify(row),
          },
        })
      )
    );

    res.status(201).json({
      message: `นำเข้าข้อมูลสำเร็จ ${data.length} รายการ`,
      count: data.length,
    });
  } catch (err) {
    next(err);
  }
};
