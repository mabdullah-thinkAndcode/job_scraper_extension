// Adapter: Haystack
// Confidence: Unverified - ambiguous platform name.
// URL pattern: startup.jobs or haystack.app job detail pattern (confirm)
//
// Selector notes (from selector-inventory/haystack.md):
//   Title:        TODO
//   Company:      TODO
//   Company link: TODO
//   JD:           TODO
//   Expand button:TODO
//
// NOTE: No public documentation found. Confirm exact platform/domain (multiple products named 'Haystack' exist) before building adapter.

export function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /haystack/i.test(url);
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
    platform: "Haystack",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

export function getDebugInfo(document) {
  return {
    adapter: "haystack",
    confidence: "Unverified - ambiguous platform name.",
    todo: true
  };
}
