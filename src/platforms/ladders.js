// Adapter: Ladders
// Confidence: Unverified.
// URL pattern: theladders.com/job/*
//
// Selector notes (from selector-inventory/ladders.md):
//   Title:        TODO
//   Company:      TODO
//   Company link: TODO
//   JD:           TODO
//   Expand button:TODO
//
// NOTE: Older established board (premium/senior jobs) but no current selector documentation found. Inspect manually.

export function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /theladders\\.com/i.test(url);
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
    platform: "Ladders",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

export function getDebugInfo(document) {
  return {
    adapter: "ladders",
    confidence: "Unverified.",
    todo: true
  };
}
