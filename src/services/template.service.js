import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cache = new Map();

Handlebars.registerHelper("multiply", (a, b) => (a * b).toFixed(2));
Handlebars.registerHelper("add", (a, b) => a + b);
Handlebars.registerHelper("formatNumber", (n) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 })
);

function getTemplate(type) {
  if (cache.has(type)) return cache.get(type);

  const templatePath = path.join(__dirname, "..", "templates", type, `${type}.hbs`);
  const source = fs.readFileSync(templatePath, "utf-8");
  const compiled = Handlebars.compile(source);
  cache.set(type, compiled);
  return compiled;
}

export function compile(type, data) {
  const template = getTemplate(type);
  return template(data);
}
