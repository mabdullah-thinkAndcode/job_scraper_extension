// Adapter: JobCopilot
// Confidence: Unverified.
// URL pattern: jobcopilot.com/* job detail pattern (confirm)
//
// Selector notes (from selector-inventory/jobcopilot.md):
//   Title:        TODO
//   Company:      TODO
//   Company link: TODO
//   JD:           TODO
//   Expand button:TODO
//
// NOTE: This is itself a job-application-automation SaaS (similar category to your own project), not a traditional job board. Likely shows aggregated JDs inside its own dashboard UI. No public selector documentation found - manual inspection required.

export function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /jobcopilot\\.com/i.test(url);
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
    platform: "JobCopilot",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

export function getDebugInfo(document) {
  return {
    adapter: "jobcopilot",
    confidence: "Unverified.",
    todo: true
  };
}
