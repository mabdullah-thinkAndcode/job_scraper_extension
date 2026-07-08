// Adapter: MeeBoss
// Confidence: Unverified - platform not found in search results.
// URL pattern: TODO - confirm domain and URL pattern
//
// Selector notes (from selector-inventory/meeboss.md):
//   Title:        TODO
//   Company:      TODO
//   Company link: TODO
//   JD:           TODO
//   Expand button:TODO
//
// NOTE: No public information found for this platform. Confirm it is a job board with a public web UI before building an adapter; otherwise use generic fallback.

export function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /meeboss/i.test(url);
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
    platform: "MeeBoss",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

export function getDebugInfo(document) {
  return {
    adapter: "meeboss",
    confidence: "Unverified - platform not found in search results.",
    todo: true
  };
}
