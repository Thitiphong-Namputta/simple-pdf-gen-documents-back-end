import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  ShadingType,
} from "docx";
import { insertZWSP, formatThaiDate } from "../services/thai.service.js";

const THAI_FONT = { cs: "TH Sarabun New", name: "TH Sarabun New" };
const FONT_SIZE = 28; // 14pt in half-points

function thaiText(text, opts = {}) {
  return new TextRun({ text: insertZWSP(String(text ?? "")), font: THAI_FONT, size: FONT_SIZE, ...opts });
}

function thaiParagraph(text, opts = {}) {
  return new Paragraph({ children: [thaiText(text)], ...opts });
}

function sectionHeading(text) {
  return new Paragraph({
    children: [thaiText(text, { bold: true, size: 32 })],
    spacing: { before: 200, after: 100 },
  });
}

function labelValue(label, value) {
  return new Paragraph({
    children: [
      thaiText(`${label}: `, { bold: true }),
      thaiText(value ?? "-"),
    ],
    spacing: { after: 60 },
  });
}

// ── Invoice ─────────────────────────────────────────────────────────────────

function buildInvoice(data) {
  const children = [];

  children.push(
    new Paragraph({
      children: [thaiText("ใบแจ้งหนี้", { bold: true, size: 48 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  children.push(sectionHeading("ข้อมูลบริษัท"));
  children.push(labelValue("ชื่อบริษัท", data.companyName));
  if (data.companyAddress) children.push(labelValue("ที่อยู่", data.companyAddress));
  if (data.companyTel) children.push(labelValue("โทรศัพท์", data.companyTel));
  if (data.companyEmail) children.push(labelValue("อีเมล", data.companyEmail));

  children.push(sectionHeading("รายละเอียดใบแจ้งหนี้"));
  children.push(labelValue("เลขที่", data.invoiceNo));
  if (data.invoiceDate) children.push(labelValue("วันที่", formatThaiDate(data.invoiceDate)));
  children.push(labelValue("ลูกค้า", data.clientName));
  if (data.clientAddress) children.push(labelValue("ที่อยู่ลูกค้า", data.clientAddress));
  if (data.dueDate) children.push(labelValue("วันครบกำหนด", formatThaiDate(data.dueDate)));

  // Items table
  children.push(sectionHeading("รายการสินค้า/บริการ"));

  const headerRow = new TableRow({
    children: ["ชื่อสินค้า/บริการ", "จำนวน", "ราคา/หน่วย", "รวม"].map(
      (h) =>
        new TableCell({
          children: [new Paragraph({ children: [thaiText(h, { bold: true })] })],
          shading: { type: ShadingType.SOLID, color: "F3F4F6" },
        })
    ),
  });

  const itemRows = (data.items || []).map(
    (item) =>
      new TableRow({
        children: [
          new TableCell({ children: [thaiParagraph(item.name)] }),
          new TableCell({ children: [thaiParagraph(String(item.qty))] }),
          new TableCell({ children: [thaiParagraph(Number(item.price).toLocaleString("th-TH", { minimumFractionDigits: 2 }))] }),
          new TableCell({ children: [thaiParagraph(Number(item.qty * item.price).toLocaleString("th-TH", { minimumFractionDigits: 2 }))] }),
        ],
      })
  );

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...itemRows],
    })
  );

  children.push(new Paragraph({ spacing: { before: 200 } }));
  children.push(labelValue("ยอดรวม", `฿${Number(data.subtotal ?? 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}`));
  children.push(labelValue(`ภาษี (${data.tax ?? 7}%)`, `฿${Number(data.taxAmount ?? 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}`));
  children.push(
    new Paragraph({
      children: [thaiText("ยอดรวมสุทธิ: ", { bold: true }), thaiText(`฿${Number(data.total ?? 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}`, { bold: true })],
    })
  );

  if (data.note) {
    children.push(sectionHeading("หมายเหตุ"));
    children.push(thaiParagraph(data.note));
  }

  return children;
}

// ── Report ───────────────────────────────────────────────────────────────────

function buildReport(data) {
  const children = [];

  children.push(
    new Paragraph({
      children: [thaiText(data.title, { bold: true, size: 48 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );
  if (data.period) children.push(new Paragraph({ children: [thaiText(`ช่วงเวลา: ${data.period}`)], alignment: AlignmentType.CENTER, spacing: { after: 100 } }));
  children.push(new Paragraph({ children: [thaiText(`วันที่สร้าง: ${data.generatedAt}`)], alignment: AlignmentType.CENTER, spacing: { after: 300 } }));

  if (data.summary?.length) {
    children.push(sectionHeading("สรุปสถิติ"));
    const headerRow = new TableRow({
      children: ["หัวข้อ", "ค่า", "หน่วย"].map((h) =>
        new TableCell({ children: [new Paragraph({ children: [thaiText(h, { bold: true })] })], shading: { type: ShadingType.SOLID, color: "F3F4F6" } })
      ),
    });
    const rows = data.summary.map((s) =>
      new TableRow({
        children: [s.label, s.value, s.unit].map((v) => new TableCell({ children: [thaiParagraph(v ?? "")] })),
      })
    );
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...rows] }));
  }

  if (data.tableHeaders?.length && data.tableData?.length) {
    children.push(sectionHeading(data.tableTitle || "ตารางข้อมูล"));
    const headerRow = new TableRow({
      children: data.tableHeaders.map((h) =>
        new TableCell({ children: [new Paragraph({ children: [thaiText(h, { bold: true })] })], shading: { type: ShadingType.SOLID, color: "F3F4F6" } })
      ),
    });
    const rows = data.tableData.map((row) =>
      new TableRow({ children: row.map((c) => new TableCell({ children: [thaiParagraph(c)] })) })
    );
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...rows] }));
  }

  if (data.notes) {
    children.push(sectionHeading("หมายเหตุ"));
    children.push(thaiParagraph(data.notes));
  }

  return children;
}

// ── Certificate ──────────────────────────────────────────────────────────────

function buildCertificate(data) {
  const children = [];

  if (data.organizationName) {
    children.push(new Paragraph({
      children: [thaiText(data.organizationName, { bold: true, size: 36 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }));
  }

  children.push(new Paragraph({
    children: [thaiText("ใบรับรอง", { bold: true, size: 56 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
  }));

  children.push(new Paragraph({
    children: [thaiText("มอบให้แก่", { size: 32 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
  }));

  children.push(new Paragraph({
    children: [thaiText(data.recipientName, { bold: true, size: 48 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }));

  children.push(new Paragraph({
    children: [thaiText(`ในการผ่านหลักสูตร: ${insertZWSP(data.courseName)}`, { size: 32 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }));

  if (data.description) {
    children.push(thaiParagraph(data.description, { alignment: AlignmentType.CENTER, spacing: { after: 200 } }));
  }

  children.push(new Paragraph({
    children: [thaiText(`วันที่: ${formatThaiDate(data.date)}`)],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  }));

  if (data.signatories?.length) {
    const sigCells = data.signatories.map((sig) =>
      new TableCell({
        children: [
          new Paragraph({ children: [thaiText("____________________")], alignment: AlignmentType.CENTER }),
          new Paragraph({ children: [thaiText(sig.name, { bold: true })], alignment: AlignmentType.CENTER }),
          new Paragraph({ children: [thaiText(sig.title)], alignment: AlignmentType.CENTER }),
        ],
        borders: {
          top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
        },
      })
    );
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: sigCells })],
      borders: {
        top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
        insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE },
      },
    }));
  }

  return children;
}

// ── Contract ─────────────────────────────────────────────────────────────────

function buildContract(data) {
  const children = [];

  children.push(new Paragraph({
    children: [thaiText(data.title, { bold: true, size: 48 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }));

  children.push(new Paragraph({
    children: [thaiText(`วันที่: ${formatThaiDate(data.contractDate)}`)],
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
  }));

  children.push(sectionHeading(`คู่สัญญาที่ 1 (${data.party1Role})`));
  children.push(labelValue("ชื่อ", data.party1Name));
  if (data.party1Address) children.push(labelValue("ที่อยู่", data.party1Address));

  children.push(sectionHeading(`คู่สัญญาที่ 2 (${data.party2Role})`));
  children.push(labelValue("ชื่อ", data.party2Name));
  if (data.party2Address) children.push(labelValue("ที่อยู่", data.party2Address));

  if (data.preamble) {
    children.push(sectionHeading("บทนำ"));
    children.push(thaiParagraph(data.preamble));
  }

  if (data.clauses?.length) {
    children.push(sectionHeading("ข้อสัญญา"));
    data.clauses.forEach((clause, i) => {
      children.push(new Paragraph({
        children: [thaiText(`ข้อ ${i + 1}. ${clause.title}`, { bold: true })],
        spacing: { before: 200, after: 80 },
      }));
      children.push(thaiParagraph(clause.content, { spacing: { after: 100 } }));
    });
  }

  // Signature blocks
  children.push(new Paragraph({ spacing: { before: 400 } }));
  const sigCells = [
    { name: data.party1Name, role: data.party1Role },
    { name: data.party2Name, role: data.party2Role },
  ].map((p) =>
    new TableCell({
      children: [
        new Paragraph({ children: [thaiText("____________________")], alignment: AlignmentType.CENTER }),
        new Paragraph({ children: [thaiText(`(${p.name})`, { bold: true })], alignment: AlignmentType.CENTER }),
        new Paragraph({ children: [thaiText(p.role)], alignment: AlignmentType.CENTER }),
      ],
      borders: {
        top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      },
    })
  );
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: sigCells })],
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE },
    },
  }));

  return children;
}

// ── Main export ──────────────────────────────────────────────────────────────

const BUILDERS = {
  invoice: buildInvoice,
  report: buildReport,
  certificate: buildCertificate,
  contract: buildContract,
};

const VALID_TYPES = Object.keys(BUILDERS);

export async function generateDocx(type, data) {
  if (!VALID_TYPES.includes(type)) {
    const err = new Error(`Invalid document type: "${type}". Valid: ${VALID_TYPES.join(", ")}`);
    err.statusCode = 400;
    throw err;
  }

  const children = BUILDERS[type](data);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
