// Generic fallback adapter used when no platform-specific adapter matches,
// or when a specific adapter's selectors fail to find data.
export function canHandle(url, document) {
  return true; // always matches - must remain last in registry
}

function firstMatch(document, selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent.trim()) return el;
  }
  return null;
}

export function extract(document, url) {
  const titleEl = firstMatch(document, ["h1", "[class*='job-title' i]", "[data-testid*='title' i]"]);
  const companyEl = firstMatch(document, [
    "[class*='company-name' i]",
    "[data-testid*='company' i]",
    "[itemprop='hiringOrganization']"
  ]);
  const jdEl = firstMatch(document, [
    "[class*='description' i]",
    "[data-testid*='description' i]",
    "article",
    "main"
  ]);

  return {
    platform: "Unknown",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : "",
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

export function getDebugInfo(document) {
  return { adapter: "generic", note: "Used heuristic keyword-based selectors." };
}
