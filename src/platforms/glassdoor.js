// Adapter: Glassdoor
// Confidence: Medium - data-test attributes confirmed via multiple 2025/2026 guides, but exact suffixes rotate.
// URL pattern: glassdoor.com/job-listing/*
//
// Selector notes (from selector-inventory/glassdoor.md):
//   Title:        [data-test='job-title'], .JobDetails_jobTitle__*
//   Company:      [data-test='employer-name'], .EmployerProfile_employerName__*
//   Company link: [data-test='employer-name'] a
//   JD:           [data-test='jobDescription'], .JobDetails_jobDescription__*
//   Expand button:button[data-test='show-more-cta']
//
// NOTE: Uses hashed CSS class suffixes (e.g. __xY3z) that rotate on deploys - always prefer data-test attributes. Aggressive anti-bot; login wall appears after a few views.

export function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /glassdoor\\.com/i.test(url);
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
  const titleEl = firstMatch(document, ["[data-test='job-title']", ".JobDetails_jobTitle__*"]);
  const companyEl = firstMatch(document, ["[data-test='employer-name']", ".EmployerProfile_employerName__*"]);
  const jdEl = firstMatch(document, ["[data-test='jobDescription']", ".JobDetails_jobDescription__*"]);

  return {
    platform: "Glassdoor",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

export function getDebugInfo(document) {
  return {
    adapter: "glassdoor",
    confidence: "Medium - data-test attributes confirmed via multiple 2025/2026 guides, but exact suffixes rotate.",
    todo: false
  };
}
