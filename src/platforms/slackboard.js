// Adapter: Slack Board (Slack-based job community)
// Confidence: Not applicable to standard content-script scraping - flagged for clarification.
// URL pattern: N/A - likely not a standard scrapeable HTML job board; may be Slack workspace content
//
// Selector notes (from selector-inventory/slackboard.md):
//   Title:        N/A
//   Company:      N/A
//   Company link: N/A
//   JD:           N/A
//   Expand button:N/A
//
// NOTE: Clarify with user: 'Slack Board' likely refers to job postings inside a Slack workspace/channel, not a public website. A content script cannot scrape Slack's app (it's an Electron/web app behind auth and real-time sockets). This needs a different approach (Slack API with a bot token) rather than a DOM scraper adapter.

export function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /slack\\.com/i.test(url);
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
    platform: "Slack Board (Slack-based job community)",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

export function getDebugInfo(document) {
  return {
    adapter: "slackboard",
    confidence: "Not applicable to standard content-script scraping - flagged for clarification.",
    todo: false
  };
}
