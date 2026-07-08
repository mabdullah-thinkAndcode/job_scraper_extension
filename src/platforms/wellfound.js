// Adapter: Wellfound (AngelList Talent)
// Confidence: Unverified.
// URL pattern: wellfound.com/jobs/* or wellfound.com/company/*/jobs/*
//
// Selector notes (from selector-inventory/wellfound.md):
//   Title:        TODO - inspect, site is React SPA (AngelList rebrand)
//   Company:      TODO
//   Company link: TODO
//   JD:           TODO
//   Expand button:TODO
//
// NOTE: Formerly AngelList Talent. React SPA with client-side rendering; content script must wait for hydration (MutationObserver recommended). No verified public selector list found - inspect manually.

export function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /wellfound\\.com/i.test(url);
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
    platform: "Wellfound (AngelList Talent)",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

export function getDebugInfo(document) {
  return {
    adapter: "wellfound",
    confidence: "Unverified.",
    todo: true
  };
}
