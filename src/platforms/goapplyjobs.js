// Adapter: GoApplyJobs
// Confidence: Unverified.
// URL pattern: TODO - confirm domain/job detail URL pattern
//
// Selector notes (from selector-inventory/goapplyjobs.md):
//   Title:        TODO
//   Company:      TODO
//   Company link: TODO
//   JD:           TODO
//   Expand button:TODO
//
// NOTE: No public documentation found for this platform's DOM structure. Treat as a candidate for the generic fallback adapter first; build a dedicated adapter only after manual inspection.

export function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /goapplyjobs/i.test(url);
}

function firstMatch(document, selectorList) {
  for (const sel of selectorList) {
    try {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim()) return el;
    } catch (e) { /* invalid selector, skip */ }
  }
  return null;
}

export function extract(document, url) {
  const titleEl = firstMatch(document, ["TODO_SELECTOR"]);
  const companyEl = firstMatch(document, ["TODO_SELECTOR"]);
  const jdEl = firstMatch(document, ["TODO_SELECTOR"]);

  return {
    platform: "GoApplyJobs",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

export function getDebugInfo(document) {
  return {
    adapter: "goapplyjobs",
    confidence: "Unverified.",
    todo: true
  };
}
