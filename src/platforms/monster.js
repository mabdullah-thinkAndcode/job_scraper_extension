// Adapter: Monster
// Confidence: Low - needs manual verification.
// URL pattern: monster.com/job-openings/*
//
// Selector notes (from selector-inventory/monster.md):
//   Title:        h1[data-testid='jobTitle'], h1.job-title
//   Company:      [data-testid='company-name'], .company
//   Company link: [data-testid='company-name'] a
//   JD:           [data-testid='jobDescription'], .job-description
//   Expand button:none typically
//
// NOTE: TODO: verify selectors - Monster site redesigned recently; data-testid attributes preferred over class names for stability.

export function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /monster\\.com/i.test(url);
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
  const titleEl = firstMatch(document, ["h1[data-testid='jobTitle']", "h1.job-title"]);
  const companyEl = firstMatch(document, ["[data-testid='company-name']", ".company"]);
  const jdEl = firstMatch(document, ["[data-testid='jobDescription']", ".job-description"]);

  return {
    platform: "Monster",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

export function getDebugInfo(document) {
  return {
    adapter: "monster",
    confidence: "Low - needs manual verification.",
    todo: false
  };
}
