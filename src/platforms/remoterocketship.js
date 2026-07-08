// Adapter: Remote Rocketship
// Confidence: Unverified.
// URL pattern: remoterocketship.com/company/*/jobs/* (confirm)
//
// Selector notes (from selector-inventory/remoterocketship.md):
//   Title:        TODO
//   Company:      TODO
//   Company link: TODO
//   JD:           TODO
//   Expand button:TODO
//
// NOTE: No public scraping documentation found. Use generic adapter first; add dedicated selectors after manual DOM inspection in Codex/DevTools.

export function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /remoterocketship/i.test(url);
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
    platform: "Remote Rocketship",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

export function getDebugInfo(document) {
  return {
    adapter: "remoterocketship",
    confidence: "Unverified.",
    todo: true
  };
}
