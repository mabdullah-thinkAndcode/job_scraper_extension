// Adapter: Indeed
// Confidence: High - verified against multiple 2025/2026 scraping guides.
// URL pattern: indeed.com/viewjob?jk=* or indeed.com/jobs?...&vjk=*
//
// Selector notes (from selector-inventory/indeed.md):
//   Title:        h1.jobsearch-JobInfoHeader-title, [data-testid='jobsearch-JobInfoHeader-title']
//   Company:      [data-testid='inlineHeader-companyName'], .jobsearch-InlineCompanyRating
//   Company link: [data-testid='inlineHeader-companyName'] a
//   JD:           #jobDescriptionText, div#vjs-desc
//   Expand button:none typically - full JD usually rendered in DOM
//
// NOTE: Uses Cloudflare bot protection on some regions; heavy rate limiting. Job key 'jk' param identifies job uniquely - use for dedupe.

export function canHandle(url, document) {
  return /indeed\.com\/(viewjob|jobs)/i.test(url) && /[?&](jk|vjk)=/i.test(url);
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
  const titleEl = firstMatch(document, ["h1.jobsearch-JobInfoHeader-title", "[data-testid='jobsearch-JobInfoHeader-title']"]);
  const companyEl = firstMatch(document, ["[data-testid='inlineHeader-companyName']", ".jobsearch-InlineCompanyRating"]);
  const jdEl = firstMatch(document, ["#jobDescriptionText", "div#vjs-desc"]);

  return {
    platform: "Indeed",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

export function getDebugInfo(document) {
  return {
    adapter: "indeed",
    confidence: "High - verified against multiple 2025/2026 scraping guides.",
    todo: false
  };
}
