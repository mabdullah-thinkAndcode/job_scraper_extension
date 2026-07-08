// Adapter: ZipRecruiter
// Confidence: Low - needs manual verification in Codex session.
// URL pattern: ziprecruiter.com/jobs/*
//
// Selector notes (from selector-inventory/ziprecruiter.md):
//   Title:        h1.job_title, h1[class*='JobTitle']
//   Company:      a.hiring_company_text, [class*='hiring_company']
//   Company link: a.hiring_company_text
//   JD:           div.job_description, section[class*='jobDescription']
//   Expand button:button[class*='show_more'] (if truncated)
//
// NOTE: TODO: verify current class names live - ZipRecruiter frequently changes markup and uses bot detection (PerimeterX). Confirm selectors manually via DevTools before writing adapter.

export function canHandle(url, document) {
  return /ziprecruiter\.com\/jobs\//i.test(url);
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
  const titleEl = firstMatch(document, ["h1.job_title", "h1[class*='JobTitle']"]);
  const companyEl = firstMatch(document, ["a.hiring_company_text", "[class*='hiring_company']"]);
  const jdEl = firstMatch(document, ["div.job_description", "section[class*='jobDescription']"]);

  return {
    platform: "ZipRecruiter",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

export function getDebugInfo(document) {
  return {
    adapter: "ziprecruiter",
    confidence: "Low - needs manual verification in Codex session.",
    todo: false
  };
}
