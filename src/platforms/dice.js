// Adapter: Dice
// Confidence: Medium - inferred from common Dice DOM patterns, verify live.
// URL pattern: dice.com/job-detail/*
//
// Selector notes (from selector-inventory/dice.md):
//   Title:        h1[data-cy='jobTitle'], h1.job-title
//   Company:      [data-cy='companyNameLink'], a.employerName
//   Company link: [data-cy='companyNameLink']
//   JD:           [data-testid='jobDescriptionHtml'], .job-description
//   Expand button:none typically
//
// NOTE: Tech-focused board, React SPA. data-cy/data-testid attributes are more stable than class names. Already in your existing target list per earlier automation plans.

export function canHandle(url, document) {
  return /dice\.com\/job-detail\//i.test(url);
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
  const titleEl = firstMatch(document, ["h1[data-cy='jobTitle']", "h1.job-title"]);
  const companyEl = firstMatch(document, ["[data-cy='companyNameLink']", "a.employerName"]);
  const jdEl = firstMatch(document, ["[data-testid='jobDescriptionHtml']", ".job-description"]);

  return {
    platform: "Dice",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

export function getDebugInfo(document) {
  return {
    adapter: "dice",
    confidence: "Medium - inferred from common Dice DOM patterns, verify live.",
    todo: false
  };
}
