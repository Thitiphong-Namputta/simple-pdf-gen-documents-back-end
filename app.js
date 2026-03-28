import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { PORT, CLIENT_URL } from "./config/env.js";
import pdfRouter from "./routes/pdf.route.js";
import documentRouter from "./routes/document.route.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));
app.use("/fonts", express.static(path.join(__dirname, "src", "fonts")));

app.use("/api/v1/pdf", pdfRouter);
app.use("/api/v1/documents", documentRouter);

app.use(errorMiddleware);

app.get("/", (_req, res) => {
  res.send("Hello from Simple PDF Gen Documents Back End!");
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
