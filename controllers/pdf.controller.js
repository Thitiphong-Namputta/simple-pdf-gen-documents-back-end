import { generatePdf } from "../src/services/pdf.service.js";

export const generate = async (req, res, next) => {
  try {
    const { type, data } = req.body;

    if (!type || !data) {
      const error = new Error('Body must contain "type" and "data"');
      error.statusCode = 400;
      throw error;
    }

    const buffer = await generatePdf(type, data);
    const filename = `${type}-${Date.now()}.pdf`;

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
