// Adapter: Adzuna
// Confidence: Medium - itemprop microdata pattern is a reasonable starting bet, verify live.
// URL pattern: adzuna.com/details/*
//
// Selector notes (from selector-inventory/adzuna.md):
//   Title:        h1.header, h1[itemprop='title']
//   Company:      [itemprop='hiringOrganization'], .company
//   Company link: TODO
//   JD:           div.adp-body, [itemprop='description']
//   Expand button:none typically
//
// NOTE: Adzuna has a public search API as an alternative to scraping - recommend evaluating the API before building a DOM adapter. Uses schema.org itemprop microdata which is more stable than classes.

export function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /adzuna\\.com/i.test(url);
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
  const titleEl = firstMatch(document, ["h1.header", "h1[itemprop='title']"]);
  const companyEl = firstMatch(document, ["[itemprop='hiringOrganization']", ".company"]);
  const jdEl = firstMatch(document, ["div.adp-body", "[itemprop='description']"]);

  return {
    platform: "Adzuna",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

export function getDebugInfo(document) {
  return {
    adapter: "adzuna",
    confidence: "Medium - itemprop microdata pattern is a reasonable starting bet, verify live.",
    todo: false
  };
}
