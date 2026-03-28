const segmenter = new Intl.Segmenter("th", { granularity: "word" });

/**
 * Insert Zero-Width Space (U+200B) between Thai words to enable line-breaking
 * in Word/Excel documents.
 */
export function insertZWSP(text) {
  if (!text) return text;
  return [...segmenter.segment(text)].map((s) => s.segment).join("\u200B");
}

/**
 * Convert a CE year to Buddhist Era (พ.ศ.)
 */
export function toBuddhistYear(year) {
  return year + 543;
}

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
  "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
  "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

/**
 * Format a date string or Date object to Thai Buddhist Era format
 * e.g. "15 มกราคม 2568"
 */
export function formatThaiDate(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getDate();
  const month = THAI_MONTHS[d.getMonth()];
  const year = toBuddhistYear(d.getFullYear());
  return `${day} ${month} ${year}`;
}
