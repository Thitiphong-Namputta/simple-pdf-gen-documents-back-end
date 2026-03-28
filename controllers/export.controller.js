import { exportDocument, CONTENT_TYPES, FILE_EXTENSIONS } from "../src/services/export.service.js";
import prisma from "../lib/prisma.js";

export const generate = async (req, res, next) => {
  try {
    const { type, format = "pdf", data, summary } = req.body;

    if (!type || !data) {
      const err = new Error('Body must contain "type" and "data"');
      err.statusCode = 400;
      throw err;
    }

    const buffer = await exportDocument(type, format, data);
    const ext = FILE_EXTENSIONS[format] ?? format;
    const filename = `${type}-${Date.now()}.${ext}`;

    await prisma.documentRecord.create({
      data: {
        type,
        format,
        filename,
        summary: summary || filename,
      },
    });

    res.set({
      "Content-Type": CONTENT_TYPES[format] ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": buffer.length,
    });
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};
