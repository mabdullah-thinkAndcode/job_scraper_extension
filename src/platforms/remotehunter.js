// Adapter: Remote Hunter
// Confidence: Medium - based on 2026 AI selector report in Extracted DOMs/remotehunter.md.
// URL pattern: remotehunter.com/jobs*
//
// Selector notes (from Extracted DOMs/remotehunter.md):
//   Results list: .job-search-results
//   Job card:      .rh-list-stack__layers
//   Click target:  .rh-list-stack__layers a
//   Detail pane:   .job-detail-scrollable-content
//   Title:         .job-detail-scrollable-content h1
//   Company:       .job-header-box .company-name
//   JD:            .job-description
//   Dedupe:        UUID in href
//
// NOTE: Avoid jsx-* hashed classes. Next.js split-view page with window-level infinite scroll.

const RESULTS_CONTAINER_SELECTORS = [".job-search-results"];
const JOB_CARD_SELECTORS = [".rh-list-stack__layers"];
const CLICK_TARGET_SELECTORS = ["a[href*='/apply-with-ai/']", "a[href]"];
const DETAIL_PANE_SELECTORS = [".job-detail-scrollable-content"];
const TITLE_SELECTORS = [".job-detail-scrollable-content h1", "h1"];
const COMPANY_SELECTORS = [".job-header-box .company-name", ".company-name"];
const JD_SELECTORS = [".job-description"];

export function canHandle(url, document) {
  return /remotehunter\.com\/jobs/i.test(url);
}

function firstMatch(root, selectorList) {
  for (const selector of selectorList) {
    try {
      const el = root.querySelector(selector);
      if (el && el.textContent.trim()) return el;
    } catch (error) {
      // Ignore invalid selectors.
    }
  }
  return null;
}

function firstExisting(root, selectorList) {
  for (const selector of selectorList) {
    try {
      const el = root.querySelector(selector);
      if (el) return el;
    } catch (error) {
      // Ignore invalid selectors.
    }
  }
  return null;
}

function textOrEmpty(el) {
  return el ? el.textContent.trim() : "";
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getDetailPane(document) {
  return firstExisting(document, DETAIL_PANE_SELECTORS);
}

export function getResultsContainer(document) {
  return firstExisting(document, RESULTS_CONTAINER_SELECTORS);
}

function getClickTarget(card) {
  return firstExisting(card, CLICK_TARGET_SELECTORS) || (card.matches?.("a[href]") ? card : null);
}

function extractUuid(value) {
  if (!value) return "";
  return value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0] || "";
}

function getCurrentDetailHref(document) {
  const detailPane = getDetailPane(document) || document;
  return firstExisting(detailPane, ["a[href*='/apply-with-ai/']", "a[href*='/jobs/']"])?.href || "";
}

export function getCurrentDetailState(document) {
  const detailPane = getDetailPane(document) || document;
  const title = textOrEmpty(firstMatch(detailPane, TITLE_SELECTORS));
  const href = getCurrentDetailHref(document);
  return {
    uuid: extractUuid(href),
    title,
    href
  };
}

export function getJobCards(document) {
  const container = getResultsContainer(document);
  if (!container) return [];

  const cards = [];
  const seen = new Set();
  JOB_CARD_SELECTORS.forEach((selector) => {
    try {
      container.querySelectorAll(selector).forEach((card) => {
        if (!card || seen.has(card) || !getClickTarget(card)) return;
        seen.add(card);
        cards.push(card);
      });
    } catch (error) {
      // Ignore invalid selectors.
    }
  });
  return cards;
}

export function getCardKey(card) {
  const href = getClickTarget(card)?.href || "";
  return extractUuid(href) || href || card.getAttribute("aria-label") || "";
}

function getSiteLink(document, fallbackHref = "") {
  return getCurrentDetailHref(document) || fallbackHref || window.location.href;
}

export function openJobCard(card) {
  const clickTarget = getClickTarget(card);
  if (!clickTarget) {
    throw new Error("Remote Hunter card click target not found.");
  }

  card.scrollIntoView({ block: "center", inline: "nearest" });

  try {
    card.click();
  } catch (error) {
    clickTarget.click();
  }
}

export async function waitForJobDetailsChange(previousState, document, options = {}) {
  const timeoutMs = options.timeoutMs || 10000;
  const pollMs = options.pollMs || 300;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const detailPane = getDetailPane(document);
    const titleEl = firstMatch(detailPane || document, TITLE_SELECTORS);
    if (titleEl) {
      const currentState = getCurrentDetailState(document);
      if (
        (currentState.uuid && currentState.uuid !== previousState?.uuid)
        || (!currentState.uuid && currentState.title && currentState.title !== previousState?.title)
      ) {
        return {
          changed: true,
          state: currentState,
          reason: currentState.uuid ? "uuid-changed" : "title-changed"
        };
      }
    }

    await wait(pollMs);
  }

  return {
    changed: false,
    state: getCurrentDetailState(document),
    reason: "timeout"
  };
}

export function maybeExpandDescription(document) {
  return false;
}

export function getScrollContainer(document) {
  return window;
}

export function hasReachedEnd(document) {
  const scrollBottom = window.scrollY + window.innerHeight;
  const docHeight = Math.max(
    document.body?.scrollHeight || 0,
    document.documentElement?.scrollHeight || 0
  );
  return scrollBottom >= docHeight - 24;
}

export function getBatchDebugInfo(document) {
  const cards = getJobCards(document);
  const clickTargetCount = cards.filter((card) => Boolean(getClickTarget(card))).length;
  return {
    resultsContainerFound: Boolean(getResultsContainer(document)),
    cardCount: cards.length,
    clickTargetCount,
    sampleKeys: cards.slice(0, 5).map((card) => getCardKey(card))
  };
}

export function extract(document, url) {
  const detailPane = getDetailPane(document) || document;
  const titleEl = firstMatch(detailPane, TITLE_SELECTORS);
  const companyEl = firstMatch(detailPane, COMPANY_SELECTORS);
  const jdEl = firstMatch(detailPane, JD_SELECTORS);
  const companyLinkEl = companyEl?.closest?.("a") || companyEl?.querySelector?.("a") || null;
  const siteLink = getSiteLink(document);

  return {
    platform: "Remote Hunter",
    siteLink,
    company: textOrEmpty(companyEl),
    jobTitle: textOrEmpty(titleEl),
    companyLink: companyLinkEl?.href || "",
    jd: jdEl ? jdEl.innerText.trim() : "",
    _debug: {
      detailPaneFound: Boolean(getDetailPane(document)),
      resultsContainerFound: Boolean(getResultsContainer(document)),
      titleFound: Boolean(titleEl),
      companyFound: Boolean(companyEl),
      jdFound: Boolean(jdEl),
      titleLength: textOrEmpty(titleEl).length,
      companyLength: textOrEmpty(companyEl).length,
      jdLength: jdEl ? jdEl.innerText.trim().length : 0,
      batch: getBatchDebugInfo(document)
    }
  };
}

export function getDebugInfo(document) {
  return {
    adapter: "remotehunter",
    confidence: "Medium - based on 2026 AI selector report.",
    supportsBatch: true,
    todo: false,
    selectors: {
      detailPaneFound: Boolean(getDetailPane(document)),
      ...getBatchDebugInfo(document)
    }
  };
}
