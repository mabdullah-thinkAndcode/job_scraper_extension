import { toCsv, downloadCsv } from "../core/exporter.js";
import { normalize } from "../core/normalize.js";

let collectedRows = [];
let rowCounter = 0;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCRAPE_RESULT") {
    rowCounter += 1;
    const { row, missingFields } = normalize(message.payload.raw, rowCounter);
    collectedRows.push(row);
    sendResponse({ ok: true, row, missingFields });
  }

  if (message.type === "EXPORT_CSV") {
    const csv = toCsv(collectedRows);
    downloadCsv(csv);
    sendResponse({ ok: true, count: collectedRows.length });
  }

  if (message.type === "GET_ROWS") {
    sendResponse({ rows: collectedRows });
  }

  if (message.type === "CLEAR_ROWS") {
    collectedRows = [];
    rowCounter = 0;
    sendResponse({ ok: true });
  }

  return true;
});
