// Adapter: LinkedIn
// Confidence: High - verified against 2026 selector reports.
// URL pattern: linkedin.com/jobs/view/*
//
// Selector notes (from selector-inventory/linkedin.md):
//   Title:        .job-details-jobs-unified-top-card__job-title, h1
//   Company:      .job-details-jobs-unified-top-card__company-name a, .job-details-jobs-unified-top-card__company-name, .topcard__org-name-link
//   Company link: .job-details-jobs-unified-top-card__company-name a, .topcard__org-name-link
//   JD:           .jobs-description__content, .jobs-box__html-content, .show-more-less-html__markup
//   Expand button:button[aria-label*="Click to see more"], .show-more-less-html__button
//
// NOTE: Requires login for most job detail pages. Content loads async (SPA) - wait for hydration. Class names change periodically, verify before each large batch run.

export function canHandle(url, document) {
  return /linkedin\.com\/jobs\/view\//i.test(url);
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
  const titleEl = firstMatch(document, [".job-details-jobs-unified-top-card__job-title", "h1"]);
  const companyEl = firstMatch(document, [".job-details-jobs-unified-top-card__company-name a", ".job-details-jobs-unified-top-card__company-name", ".topcard__org-name-link"]);
  const jdEl = firstMatch(document, [".jobs-description__content", ".jobs-box__html-content", ".show-more-less-html__markup"]);

  return {
    platform: "LinkedIn",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

export function getDebugInfo(document) {
  return {
    adapter: "linkedin",
    confidence: "High - verified against 2026 selector reports.",
    todo: false
  };
}
