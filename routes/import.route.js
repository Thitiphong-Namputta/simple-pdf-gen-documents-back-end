import { Router } from "express";
import multer from "multer";
import { importFile } from "../controllers/import.controller.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.post("/:docType", upload.single("file"), importFile);

export default router;
