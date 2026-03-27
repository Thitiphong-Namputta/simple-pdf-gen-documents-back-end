import { Router } from "express";
import { generate } from "../controllers/pdf.controller.js";

const pdfRouter = Router();

pdfRouter.post("/generate", generate);

export default pdfRouter;
