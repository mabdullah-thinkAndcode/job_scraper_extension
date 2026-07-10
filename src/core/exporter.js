import { OUTPUT_COLUMNS } from "./schema.js";

function escapeCsv(value = "") {
  const s = String(value).replace(/"/g, '""');
  return `"${s}"`;
}

export function toCsv(rows, columns = OUTPUT_COLUMNS) {
  const header = columns.map(escapeCsv).join(",");
  const body = rows
    .map(row => columns.map(col => escapeCsv(row[col] ?? "")).join(","))
    .join("\n");
  return `\uFEFF${header}\n${body}`;
}

export function downloadCsv(csvText) {
  const url = `data:text/csv;charset=utf-8,${encodeURIComponent(csvText)}`;
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  return chrome.downloads.download({
    url,
    filename: `jobs-${stamp}.csv`,
    saveAs: true
  });
}
