// Adapter: Hiring Cafe
// Confidence: Unverified - requires manual DOM inspection.
// URL pattern: hiring.cafe/jobs/*
//
// Selector notes (from selector-inventory/hiringcafe.md):
//   Title:        TODO - inspect h1 or job title container
//   Company:      TODO
//   Company link: TODO
//   JD:           TODO
//   Expand button:TODO
//
// NOTE: Newer aggregator site - no public scraping documentation found. Inspect live DOM in Codex session and fill selectors before writing adapter.

export function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /hiring\\.cafe/i.test(url);
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
    platform: "Hiring Cafe",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

export function getDebugInfo(document) {
  return {
    adapter: "hiringcafe",
    confidence: "Unverified - requires manual DOM inspection.",
    todo: true
  };
}
