// popup.js injects the built extractor bundle, then calls its exported
// window.__JOB_SCRAPER_RUN__ function inside the active tab.

const scrapeBtn = document.getElementById("scrape-btn");
const exportBtn = document.getElementById("export-btn");
const clearBtn = document.getElementById("clear-btn");
const preview = document.getElementById("preview");
const status = document.getElementById("status");
const platformLabel = document.getElementById("platform-label");

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function injectExtractor(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["src/injected/extractor.bundle.js"]
  });
}

async function runExtraction(tabId) {
  await injectExtractor(tabId);
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      if (typeof window.__JOB_SCRAPER_RUN__ !== "function") {
        throw new Error("Injected extractor bundle is unavailable.");
      }

      return window.__JOB_SCRAPER_RUN__();
    }
  });
  return result;
}

function sendRuntimeMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve(response);
    });
  });
}

function renderPlatform(result) {
  const detectedPlatform = result?.raw?.platform || result?.debug?.detectedAdapter || "unknown";
  platformLabel.textContent = `Platform: ${detectedPlatform}`;
}

async function refreshPlatformLabel() {
  try {
    const tab = await getActiveTab();
    const result = await runExtraction(tab.id);
    renderPlatform(result);
  } catch (error) {
    platformLabel.textContent = "Platform: unavailable";
  }
}

scrapeBtn.addEventListener("click", async () => {
  status.textContent = "Scraping current page...";

  try {
    const tab = await getActiveTab();
    const result = await runExtraction(tab.id);

    renderPlatform(result);

    const response = await sendRuntimeMessage({
      type: "SCRAPE_RESULT",
      payload: result
    });

    if (!response?.ok) {
      throw new Error("The background worker did not accept the scrape result.");
    }

    preview.textContent = JSON.stringify(response.row, null, 2);
    status.textContent = response.missingFields.length
      ? `Missing: ${response.missingFields.join(", ")}`
      : "All fields captured.";
  } catch (error) {
    status.textContent = `Scrape failed: ${error.message}`;
  }
});

exportBtn.addEventListener("click", async () => {
  try {
    const response = await sendRuntimeMessage({ type: "EXPORT_CSV" });
    status.textContent = `Exported ${response.count} rows.`;
  } catch (error) {
    status.textContent = `Export failed: ${error.message}`;
  }
});

clearBtn.addEventListener("click", async () => {
  try {
    await sendRuntimeMessage({ type: "CLEAR_ROWS" });
    preview.textContent = "";
    status.textContent = "Cleared.";
  } catch (error) {
    status.textContent = `Clear failed: ${error.message}`;
  }
});

refreshPlatformLabel();
