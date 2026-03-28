import prisma from "../lib/prisma.js";

export const getDocuments = async (_req, res, next) => {
  try {
    const documents = await prisma.documentRecord.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, results: documents });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.documentRecord.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteAllDocuments = async (_req, res, next) => {
  try {
    await prisma.documentRecord.deleteMany();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
