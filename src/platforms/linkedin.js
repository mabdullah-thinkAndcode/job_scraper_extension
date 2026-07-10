// Adapter: LinkedIn
// Confidence: High - verified against 2026 selector reports.
// URL pattern: linkedin.com/jobs/view/* and linkedin.com/jobs/search/*?currentJobId=*
//
// Selector notes (from selector-inventory/linkedin.md and Extracted DOMs/linkedin.md):
//   Results list: [role='main'] [role='list'], .jobs-search-results-list, .scaffold-layout__list
//   Job card:      [role='listitem'][componentkey], [role='listitem']
//   Click target:  a[href*='currentJobId='], a[href*='/jobs/view/']
//   Detail pane:   .jobs-search__job-details--container, .scaffold-layout__detail, [role='main']
//   Title:         .job-details-jobs-unified-top-card__job-title, h1
//   Company:       .job-details-jobs-unified-top-card__company-name a, .topcard__org-name-link
//   JD:            .jobs-description__content, .jobs-box__html-content, .show-more-less-html__markup
//
// NOTE: Requires login for most job detail pages. Content loads async (SPA) - wait for hydration.

const RESULTS_LIST_SELECTORS = [
  "[role='main'] .jobs-search-results-list",
  "[role='main'] [role='list']",
  ".scaffold-layout__list [role='list']",
  ".jobs-search-results-list",
  ".jobs-search__results-list",
  "[role='list']"
];

const JOB_CARD_SELECTORS = [
  "[role='listitem'][componentkey]",
  "[role='listitem']"
];

const CARD_CLICK_TARGET_SELECTORS = [
  "a[href*='currentJobId=']",
  "a[href*='/jobs/view/']"
];

const DETAIL_PANE_SELECTORS = [
  ".jobs-search__job-details--container",
  ".jobs-details__main-content",
  ".job-view-layout",
  ".scaffold-layout__detail",
  "[data-job-detail-container]",
  ".jobs-unified-top-card",
  "[role='main']"
];

const TITLE_SELECTORS = [
  ".job-details-jobs-unified-top-card__job-title",
  ".jobs-unified-top-card__job-title",
  ".t-24.job-details-jobs-unified-top-card__job-title",
  "h1"
];

const COMPANY_SELECTORS = [
  ".job-details-jobs-unified-top-card__company-name a",
  ".job-details-jobs-unified-top-card__company-name",
  ".jobs-unified-top-card__company-name a",
  ".jobs-unified-top-card__company-name",
  ".topcard__org-name-link",
  "a[href*='/company/']"
];

const JD_SELECTORS = [
  ".jobs-description__content",
  ".jobs-box__html-content",
  ".show-more-less-html__markup",
  "[data-job-detail-description]",
  ".jobs-description",
  "article"
];

const EXPAND_BUTTON_SELECTORS = [
  "button[aria-label*='Click to see more']",
  "button[aria-label*='show more' i]",
  "button[aria-expanded='false'][aria-label*='description' i]",
  "button[aria-label*='Continue reading' i]",
  ".show-more-less-html__button"
];

export function canHandle(url, document) {
  return /linkedin\.com\/jobs\/view\//i.test(url)
    || (/linkedin\.com\/jobs\/search\//i.test(url) && /[?&]currentJobId=/i.test(url));
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

function isLinkedInSearchPage(url) {
  return /linkedin\.com\/jobs\/search\//i.test(url) && /[?&]currentJobId=/i.test(url);
}

function queryAllUnique(root, selectors) {
  const nodes = [];
  const seen = new Set();

  selectors.forEach((selector) => {
    try {
      root.querySelectorAll(selector).forEach((node) => {
        if (!node || seen.has(node)) return;
        seen.add(node);
        nodes.push(node);
      });
    } catch (error) {
      // Ignore invalid selectors.
    }
  });

  return nodes;
}

function getDetailPane(document) {
  return firstExisting(document, DETAIL_PANE_SELECTORS);
}

function hasMeaningfulJobPane(document) {
  const detailPane = getDetailPane(document);
  if (!detailPane) return false;

  return Boolean(firstMatch(detailPane, [
    ...TITLE_SELECTORS,
    ...JD_SELECTORS
  ]));
}

async function waitForLinkedInJobPane(document, attempts = 5, delayMs = 600) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (hasMeaningfulJobPane(document)) {
      return { ready: true, reason: "job-detail-pane-found", attempts: attempt + 1 };
    }

    await wait(delayMs);
  }

  return { ready: false, reason: "job-detail-pane-not-ready", attempts };
}

function getScopedMatch(root, selectors) {
  return root ? firstMatch(root, selectors) : null;
}

export function maybeExpandDescription(document) {
  const expandButton = firstExisting(document, EXPAND_BUTTON_SELECTORS);
  if (!expandButton) return false;

  try {
    expandButton.click();
    return true;
  } catch (error) {
    return false;
  }
}

function getCardClickTarget(card) {
  return firstExisting(card, CARD_CLICK_TARGET_SELECTORS) || (card.matches?.("a[href]") ? card : null);
}

function getJobIdFromUrl(value) {
  if (!value) return "";

  try {
    const parsed = new URL(value, window.location.origin);
    return parsed.searchParams.get("currentJobId")
      || (parsed.pathname.match(/\/jobs\/view\/(\d+)/i)?.[1] || "");
  } catch (error) {
    return "";
  }
}

function cardLooksLikeJob(card) {
  const clickTarget = getCardClickTarget(card);
  if (!clickTarget) return false;

  const text = card.textContent || "";
  return Boolean(
    getJobIdFromUrl(clickTarget.href)
    || /easy apply|posted|applicants|reposted/i.test(text)
  );
}

function scoreResultsContainer(container) {
  const cards = queryAllUnique(container, JOB_CARD_SELECTORS);
  const jobCards = cards.filter((card) => cardLooksLikeJob(card));
  const clickTargets = queryAllUnique(container, CARD_CLICK_TARGET_SELECTORS);
  return {
    container,
    score: (jobCards.length * 10) + clickTargets.length,
    totalCards: cards.length,
    jobCardCount: jobCards.length,
    clickTargetCount: clickTargets.length
  };
}

function getResultsContainerCandidates(document) {
  return queryAllUnique(document, RESULTS_LIST_SELECTORS).map(scoreResultsContainer);
}

export function getResultsContainer(document) {
  const candidates = getResultsContainerCandidates(document)
    .filter((candidate) => candidate.jobCardCount > 0 || candidate.clickTargetCount > 0)
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.container || null;
}

function queryJobCards(root) {
  const seen = new Set();
  const cards = [];

  for (const selector of JOB_CARD_SELECTORS) {
    try {
      const matches = root.querySelectorAll(selector);
      matches.forEach((card) => {
        if (!card || seen.has(card)) return;
        if (!cardLooksLikeJob(card)) return;
        seen.add(card);
        cards.push(card);
      });
    } catch (error) {
      // Ignore invalid selectors.
    }
  }

  return cards;
}

export function getJobCards(document) {
  const resultsContainer = getResultsContainer(document);
  if (!resultsContainer) return [];
  return queryJobCards(resultsContainer);
}

export function getCardKey(card) {
  const clickTarget = getCardClickTarget(card);
  const href = clickTarget?.href || "";
  const jobId = getJobIdFromUrl(href);
  return jobId || href || card.getAttribute("componentkey") || card.getAttribute("aria-label") || "";
}

function buildCanonicalJobUrl(jobId, href = "") {
  if (href) {
    try {
      const parsed = new URL(href, window.location.origin);
      if (/\/jobs\/view\//i.test(parsed.pathname)) {
        return `${parsed.origin}${parsed.pathname}`;
      }
    } catch (error) {
      // Fall through to the canonical path.
    }
  }

  return jobId ? `https://www.linkedin.com/jobs/view/${jobId}/` : "";
}

function getSelectedJobLinkFromCard(document) {
  const selectedCard = firstExisting(document, [
    "[role='listitem'][aria-current='true']",
    "[role='listitem'][aria-selected='true']",
    ".jobs-search-results__list-item--active",
    ".jobs-search-results__list-item.active"
  ]);
  const clickTarget = selectedCard ? getCardClickTarget(selectedCard) : null;
  const jobId = getJobIdFromUrl(clickTarget?.href || window.location.href);
  return buildCanonicalJobUrl(jobId, clickTarget?.href || "");
}

function getSelectedJobLinkFromDetailPane(document) {
  const detailPane = getDetailPane(document) || document;
  const detailAnchor = firstExisting(detailPane, [
    "a[href*='/jobs/view/']",
    "a[href*='currentJobId=']"
  ]);
  const href = detailAnchor?.href || "";
  const jobId = getJobIdFromUrl(href || window.location.href);
  return buildCanonicalJobUrl(jobId, href);
}

function getActualJobLink(document) {
  const fromDetailPane = getSelectedJobLinkFromDetailPane(document);
  if (fromDetailPane) return fromDetailPane;

  const fromCard = getSelectedJobLinkFromCard(document);
  if (fromCard) return fromCard;

  const jobId = getJobIdFromUrl(window.location.href);
  return buildCanonicalJobUrl(jobId) || window.location.href;
}

export function getCurrentDetailState(document) {
  const detailPane = getDetailPane(document);
  const title = textOrEmpty(getScopedMatch(detailPane || document, TITLE_SELECTORS));
  const siteLink = getActualJobLink(document);
  return {
    jobId: getJobIdFromUrl(siteLink || window.location.href),
    title,
    siteLink
  };
}

export function openJobCard(card) {
  const clickTarget = getCardClickTarget(card);
  if (!clickTarget) {
    throw new Error("LinkedIn card click target not found.");
  }

  card.scrollIntoView({ block: "center", inline: "nearest" });
  clickTarget.click();
}

export async function waitForJobDetailsChange(previousState, document, options = {}) {
  const timeoutMs = options.timeoutMs || 12000;
  const pollMs = options.pollMs || 350;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (hasMeaningfulJobPane(document)) {
      const currentState = getCurrentDetailState(document);
      if (
        (currentState.jobId && currentState.jobId !== previousState?.jobId)
        || (!currentState.jobId && currentState.title && currentState.title !== previousState?.title)
      ) {
        return {
          changed: true,
          state: currentState,
          reason: currentState.jobId ? "job-id-changed" : "title-changed"
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

export function getScrollContainer(document) {
  // The selector report explicitly called out window-level scrolling for this page type.
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
  const candidates = getResultsContainerCandidates(document);
  const chosen = getResultsContainer(document);
  const jobCards = chosen ? queryJobCards(chosen) : [];

  return {
    resultsContainerFound: Boolean(chosen),
    resultsContainerMatchCount: candidates.length,
    chosenContainerScore: candidates.find((candidate) => candidate.container === chosen)?.score || 0,
    candidateSummaries: candidates.slice(0, 5).map((candidate) => ({
      score: candidate.score,
      totalCards: candidate.totalCards,
      jobCardCount: candidate.jobCardCount,
      clickTargetCount: candidate.clickTargetCount
    })),
    cardCount: jobCards.length,
    sampleKeys: jobCards.slice(0, 5).map((card) => getCardKey(card))
  };
}

export async function extract(document, url) {
  maybeExpandDescription(document);

  const waitState = isLinkedInSearchPage(url)
    ? await waitForLinkedInJobPane(document)
    : { ready: true, reason: "direct-view-page", attempts: 0 };

  const detailPane = getDetailPane(document) || document;
  const titleEl = getScopedMatch(detailPane, TITLE_SELECTORS);
  const companyEl = getScopedMatch(detailPane, COMPANY_SELECTORS);
  const jdEl = getScopedMatch(detailPane, JD_SELECTORS);

  return {
    platform: "LinkedIn",
    siteLink: getActualJobLink(document),
    company: textOrEmpty(companyEl),
    jobTitle: textOrEmpty(titleEl),
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : "",
    _debug: {
      waitState,
      detailPaneFound: Boolean(getDetailPane(document)),
      titleFound: Boolean(titleEl),
      companyFound: Boolean(companyEl),
      jdFound: Boolean(jdEl),
      batch: getBatchDebugInfo(document)
    }
  };
}

export function getDebugInfo(document) {
  return {
    adapter: "linkedin",
    confidence: "High - verified against 2026 selector reports.",
    allowGenericFallback: false,
    supportsBatch: true,
    todo: false,
    selectors: {
      detailPaneFound: Boolean(getDetailPane(document)),
      ...getBatchDebugInfo(document)
    }
  };
}
