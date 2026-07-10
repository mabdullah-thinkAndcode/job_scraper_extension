import { toCsv, downloadCsv } from "../core/exporter.js";
import { normalize } from "../core/normalize.js";

let collectedRows = [];
let rowCounter = 0;

function appendRawRow(raw) {
  rowCounter += 1;
  const { row, missingFields } = normalize(raw, rowCounter);
  collectedRows.push(row);
  return { row, missingFields };
}

function appendRawRows(rawRows = []) {
  const acceptedRows = [];
  const missingFieldSummaries = [];

  rawRows.forEach((raw) => {
    const normalized = appendRawRow(raw);
    acceptedRows.push(normalized.row);
    missingFieldSummaries.push({
      siteLink: normalized.row["Site Link"],
      missingFields: normalized.missingFields
    });
  });

  return {
    acceptedRows,
    missingFieldSummaries
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCRAPE_RESULT") {
    const { row, missingFields } = appendRawRow(message.payload.raw);
    sendResponse({ ok: true, row, missingFields });
  }

  if (message.type === "SCRAPE_BATCH_RESULTS") {
    const { acceptedRows, missingFieldSummaries } = appendRawRows(message.payload?.rows || []);
    sendResponse({
      ok: true,
      acceptedRows,
      missingFieldSummaries,
      summary: {
        ...(message.payload?.summary || {}),
        accepted: acceptedRows.length,
        totalCollectedRows: collectedRows.length
      }
    });
  }

  if (message.type === "EXPORT_CSV") {
    const csv = toCsv(collectedRows);
    downloadCsv(csv)
      .then(() => {
        sendResponse({ ok: true, count: collectedRows.length });
      })
      .catch((error) => {
        sendResponse({ ok: false, error: error?.message || "CSV export failed." });
      });
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
