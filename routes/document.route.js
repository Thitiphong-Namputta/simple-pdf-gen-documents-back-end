import { Router } from "express";
import {
  getDocuments,
  deleteDocument,
  deleteAllDocuments,
} from "../controllers/document.controller.js";

const documentRouter = Router();

documentRouter.get("/", getDocuments);
documentRouter.delete("/", deleteAllDocuments);
documentRouter.delete("/:id", deleteDocument);

export default documentRouter;
