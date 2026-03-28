import ExcelJS from "exceljs";
import { insertZWSP, formatThaiDate } from "../services/thai.service.js";

const HEADER_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
const HEADER_FONT = { bold: true, name: "TH Sarabun New", size: 14 };
const BODY_FONT = { name: "TH Sarabun New", size: 13 };

function applyHeaderStyle(row) {
  row.eachCell((cell) => {
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.alignment = { vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" },
    };
  });
  row.height = 22;
}

function applyBodyStyle(row) {
  row.eachCell((cell) => {
    cell.font = BODY_FONT;
    cell.alignment = { vertical: "middle", wrapText: true };
  });
}

function th(text) {
  return insertZWSP(String(text ?? ""));
}

// ── Invoice ──────────────────────────────────────────────────────────────────

function buildInvoice(ws, data) {
  ws.columns = [
    { header: th("ชื่อสินค้า/บริการ"), key: "name", width: 35 },
    { header: th("จำนวน"), key: "qty", width: 12 },
    { header: th("ราคา/หน่วย (฿)"), key: "price", width: 18 },
    { header: th("รวม (฿)"), key: "total", width: 18 },
  ];
  applyHeaderStyle(ws.getRow(1));

  (data.items || []).forEach((item, i) => {
    const row = ws.addRow({
      name: th(item.name),
      qty: item.qty,
      price: item.price,
      total: item.qty * item.price,
    });
    applyBodyStyle(row);
  });

  ws.addRow({});
  const subtotalRow = ws.addRow(["", "", th("ยอดรวม"), data.subtotal ?? 0]);
  applyBodyStyle(subtotalRow);
  const taxRow = ws.addRow(["", "", th(`ภาษี ${data.tax ?? 7}%`), data.taxAmount ?? 0]);
  applyBodyStyle(taxRow);
  const totalRow = ws.addRow(["", "", th("ยอดรวมสุทธิ"), data.total ?? 0]);
  totalRow.font = { ...BODY_FONT, bold: true };

  // Info sheet
  const infoWs = ws.workbook.addWorksheet(th("ข้อมูลทั่วไป"));
  infoWs.columns = [{ header: "หัวข้อ", key: "label", width: 25 }, { header: "ข้อมูล", key: "value", width: 45 }];
  applyHeaderStyle(infoWs.getRow(1));

  const infoRows = [
    ["เลขที่ใบแจ้งหนี้", data.invoiceNo],
    ["ชื่อบริษัท", data.companyName],
    ["ที่อยู่บริษัท", data.companyAddress],
    ["โทรศัพท์", data.companyTel],
    ["อีเมล", data.companyEmail],
    ["ชื่อลูกค้า", data.clientName],
    ["ที่อยู่ลูกค้า", data.clientAddress],
    ["วันที่ออก", data.invoiceDate ? formatThaiDate(data.invoiceDate) : ""],
    ["วันครบกำหนด", data.dueDate ? formatThaiDate(data.dueDate) : ""],
    ["หมายเหตุ", data.note],
  ];
  infoRows.forEach(([label, value]) => {
    const row = infoWs.addRow({ label: th(label), value: th(value ?? "") });
    applyBodyStyle(row);
  });
}

// ── Report ────────────────────────────────────────────────────────────────────

function buildReport(ws, data) {
  // Summary stats sheet
  ws.name = th("สรุปสถิติ");
  ws.columns = [
    { header: th("หัวข้อ"), key: "label", width: 30 },
    { header: th("ค่า"), key: "value", width: 20 },
    { header: th("หน่วย"), key: "unit", width: 15 },
  ];
  applyHeaderStyle(ws.getRow(1));
  (data.summary || []).forEach((s) => {
    const row = ws.addRow({ label: th(s.label), value: th(s.value), unit: th(s.unit) });
    applyBodyStyle(row);
  });

  // Data table sheet
  if (data.tableHeaders?.length && data.tableData?.length) {
    const tableWs = ws.workbook.addWorksheet(th(data.tableTitle || "ตารางข้อมูล"));
    tableWs.columns = data.tableHeaders.map((h, i) => ({
      header: th(h),
      key: `col${i}`,
      width: 20,
    }));
    applyHeaderStyle(tableWs.getRow(1));
    data.tableData.forEach((row) => {
      const rowObj = {};
      data.tableHeaders.forEach((_, i) => { rowObj[`col${i}`] = th(row[i] ?? ""); });
      const r = tableWs.addRow(rowObj);
      applyBodyStyle(r);
    });
  }

  // Info row at top
  ws.spliceRows(1, 0, [th(`${data.title}`), "", th(data.period ?? "")]);
  const titleRow = ws.getRow(1);
  titleRow.font = { ...HEADER_FONT, size: 16 };
  titleRow.height = 28;
  ws.spliceRows(2, 0, []);
}

// ── Certificate ───────────────────────────────────────────────────────────────

function buildCertificate(ws, data) {
  ws.columns = [
    { header: th("หัวข้อ"), key: "label", width: 30 },
    { header: th("ข้อมูล"), key: "value", width: 50 },
  ];
  applyHeaderStyle(ws.getRow(1));

  const rows = [
    ["องค์กร/สถาบัน", data.organizationName],
    ["เลขที่ใบรับรอง", data.certificateNo],
    ["ผู้รับ", data.recipientName],
    ["หลักสูตร/ความสำเร็จ", data.courseName],
    ["คำอธิบาย", data.description],
    ["วันที่ออก", data.date ? formatThaiDate(data.date) : ""],
  ];
  rows.forEach(([label, value]) => {
    const row = ws.addRow({ label: th(label), value: th(value ?? "") });
    applyBodyStyle(row);
  });

  if (data.signatories?.length) {
    const sigWs = ws.workbook.addWorksheet(th("ผู้ลงนาม"));
    sigWs.columns = [
      { header: th("ชื่อ"), key: "name", width: 30 },
      { header: th("ตำแหน่ง"), key: "title", width: 30 },
    ];
    applyHeaderStyle(sigWs.getRow(1));
    data.signatories.forEach((sig) => {
      const row = sigWs.addRow({ name: th(sig.name), title: th(sig.title) });
      applyBodyStyle(row);
    });
  }
}

// ── Contract ──────────────────────────────────────────────────────────────────

function buildContract(ws, data) {
  ws.columns = [
    { header: th("หัวข้อ"), key: "label", width: 30 },
    { header: th("ข้อมูล"), key: "value", width: 60 },
  ];
  applyHeaderStyle(ws.getRow(1));

  const rows = [
    ["ชื่อสัญญา", data.title],
    ["วันที่ทำสัญญา", data.contractDate ? formatThaiDate(data.contractDate) : ""],
    ["คู่สัญญาที่ 1 (ชื่อ)", data.party1Name],
    ["คู่สัญญาที่ 1 (บทบาท)", data.party1Role],
    ["คู่สัญญาที่ 1 (ที่อยู่)", data.party1Address],
    ["คู่สัญญาที่ 2 (ชื่อ)", data.party2Name],
    ["คู่สัญญาที่ 2 (บทบาท)", data.party2Role],
    ["คู่สัญญาที่ 2 (ที่อยู่)", data.party2Address],
    ["บทนำ", data.preamble],
  ];
  rows.forEach(([label, value]) => {
    const row = ws.addRow({ label: th(label), value: th(value ?? "") });
    applyBodyStyle(row);
  });

  if (data.clauses?.length) {
    const clauseWs = ws.workbook.addWorksheet(th("ข้อสัญญา"));
    clauseWs.columns = [
      { header: th("ลำดับ"), key: "no", width: 8 },
      { header: th("ชื่อข้อ"), key: "title", width: 30 },
      { header: th("รายละเอียด"), key: "content", width: 60 },
    ];
    applyHeaderStyle(clauseWs.getRow(1));
    data.clauses.forEach((clause, i) => {
      const row = clauseWs.addRow({ no: i + 1, title: th(clause.title), content: th(clause.content) });
      applyBodyStyle(row);
    });
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

const BUILDERS = {
  invoice: buildInvoice,
  report: buildReport,
  certificate: buildCertificate,
  contract: buildContract,
};

const VALID_TYPES = Object.keys(BUILDERS);

export async function generateXlsx(type, data) {
  if (!VALID_TYPES.includes(type)) {
    const err = new Error(`Invalid document type: "${type}". Valid: ${VALID_TYPES.join(", ")}`);
    err.statusCode = 400;
    throw err;
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = "simple-pdf-gen-documents";
  wb.created = new Date();

  const wsName =
    type === "invoice" ? th("รายการสินค้า") :
    type === "report"  ? th("สรุปสถิติ") :
    type === "certificate" ? th("ใบรับรอง") :
    th("สัญญา");

  const ws = wb.addWorksheet(wsName);
  BUILDERS[type](ws, data);

  return Buffer.from(await wb.xlsx.writeBuffer());
}
