import { generatePdf } from "../src/services/pdf.service.js";
import prisma from "../lib/prisma.js";

export const generate = async (req, res, next) => {
  try {
    const { type, data, summary } = req.body;

    if (!type || !data) {
      const error = new Error('Body must contain "type" and "data"');
      error.statusCode = 400;
      throw error;
    }

    const buffer = await generatePdf(type, data);
    const filename = `${type}-${Date.now()}.pdf`;

    await prisma.documentRecord.create({
      data: {
        type,
        filename,
        summary: summary || filename,
      },
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": buffer.length,
    });
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
