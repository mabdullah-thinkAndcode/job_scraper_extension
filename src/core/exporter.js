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
  return `${header}\n${body}`;
}

export function downloadCsv(csvText) {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  chrome.downloads.download({
    url,
    filename: `jobs-${stamp}.csv`,
    saveAs: true
  });
}
