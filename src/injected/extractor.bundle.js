(() => {
const linkedin = (() => {
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

function canHandle(url, document) {
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

function maybeExpandDescription(document) {
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

function getResultsContainer(document) {
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

function getJobCards(document) {
  const resultsContainer = getResultsContainer(document);
  if (!resultsContainer) return [];
  return queryJobCards(resultsContainer);
}

function getCardKey(card) {
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

function getCurrentDetailState(document) {
  const detailPane = getDetailPane(document);
  const title = textOrEmpty(getScopedMatch(detailPane || document, TITLE_SELECTORS));
  const siteLink = getActualJobLink(document);
  return {
    jobId: getJobIdFromUrl(siteLink || window.location.href),
    title,
    siteLink
  };
}

function openJobCard(card) {
  const clickTarget = getCardClickTarget(card);
  if (!clickTarget) {
    throw new Error("LinkedIn card click target not found.");
  }

  card.scrollIntoView({ block: "center", inline: "nearest" });
  clickTarget.click();
}

async function waitForJobDetailsChange(previousState, document, options = {}) {
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

function getScrollContainer(document) {
  // The selector report explicitly called out window-level scrolling for this page type.
  return window;
}

function hasReachedEnd(document) {
  const scrollBottom = window.scrollY + window.innerHeight;
  const docHeight = Math.max(
    document.body?.scrollHeight || 0,
    document.documentElement?.scrollHeight || 0
  );
  return scrollBottom >= docHeight - 24;
}

function getBatchDebugInfo(document) {
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

async function extract(document, url) {
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

function getDebugInfo(document) {
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
return { waitForJobDetailsChange, extract, canHandle, maybeExpandDescription, getResultsContainer, getJobCards, getCardKey, getCurrentDetailState, openJobCard, getScrollContainer, hasReachedEnd, getBatchDebugInfo, getDebugInfo };
})();

const indeed = (() => {
// Adapter: Indeed
// Confidence: High - verified against multiple 2025/2026 scraping guides.
// URL pattern: indeed.com/viewjob?jk=* or indeed.com/jobs?...&vjk=*
//
// Selector notes (from selector-inventory/indeed.md):
//   Title:        h1.jobsearch-JobInfoHeader-title, [data-testid='jobsearch-JobInfoHeader-title']
//   Company:      [data-testid='inlineHeader-companyName'], .jobsearch-InlineCompanyRating
//   Company link: [data-testid='inlineHeader-companyName'] a
//   JD:           #jobDescriptionText, div#vjs-desc
//   Expand button:none typically - full JD usually rendered in DOM
//
// NOTE: Uses Cloudflare bot protection on some regions; heavy rate limiting. Job key 'jk' param identifies job uniquely - use for dedupe.

function canHandle(url, document) {
  return /indeed\.com\/(viewjob|jobs)/i.test(url) && /[?&](jk|vjk)=/i.test(url);
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

function extract(document, url) {
  const titleEl = firstMatch(document, ["h1.jobsearch-JobInfoHeader-title", "[data-testid='jobsearch-JobInfoHeader-title']"]);
  const companyEl = firstMatch(document, ["[data-testid='inlineHeader-companyName']", ".jobsearch-InlineCompanyRating"]);
  const jdEl = firstMatch(document, ["#jobDescriptionText", "div#vjs-desc"]);

  return {
    platform: "Indeed",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

function getDebugInfo(document) {
  return {
    adapter: "indeed",
    confidence: "High - verified against multiple 2025/2026 scraping guides.",
    todo: false
  };
}
return { canHandle, extract, getDebugInfo };
})();

const ziprecruiter = (() => {
// Adapter: ZipRecruiter
// Confidence: Low - needs manual verification in Codex session.
// URL pattern: ziprecruiter.com/jobs/*
//
// Selector notes (from selector-inventory/ziprecruiter.md):
//   Title:        h1.job_title, h1[class*='JobTitle']
//   Company:      a.hiring_company_text, [class*='hiring_company']
//   Company link: a.hiring_company_text
//   JD:           div.job_description, section[class*='jobDescription']
//   Expand button:button[class*='show_more'] (if truncated)
//
// NOTE: TODO: verify current class names live - ZipRecruiter frequently changes markup and uses bot detection (PerimeterX). Confirm selectors manually via DevTools before writing adapter.

function canHandle(url, document) {
  return /ziprecruiter\.com\/jobs\//i.test(url);
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

function extract(document, url) {
  const titleEl = firstMatch(document, ["h1.job_title", "h1[class*='JobTitle']"]);
  const companyEl = firstMatch(document, ["a.hiring_company_text", "[class*='hiring_company']"]);
  const jdEl = firstMatch(document, ["div.job_description", "section[class*='jobDescription']"]);

  return {
    platform: "ZipRecruiter",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

function getDebugInfo(document) {
  return {
    adapter: "ziprecruiter",
    confidence: "Low - needs manual verification in Codex session.",
    todo: false
  };
}
return { canHandle, extract, getDebugInfo };
})();

const monster = (() => {
// Adapter: Monster
// Confidence: Low - needs manual verification.
// URL pattern: monster.com/job-openings/*
//
// Selector notes (from selector-inventory/monster.md):
//   Title:        h1[data-testid='jobTitle'], h1.job-title
//   Company:      [data-testid='company-name'], .company
//   Company link: [data-testid='company-name'] a
//   JD:           [data-testid='jobDescription'], .job-description
//   Expand button:none typically
//
// NOTE: TODO: verify selectors - Monster site redesigned recently; data-testid attributes preferred over class names for stability.

function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /monster\\.com/i.test(url);
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

function extract(document, url) {
  const titleEl = firstMatch(document, ["h1[data-testid='jobTitle']", "h1.job-title"]);
  const companyEl = firstMatch(document, ["[data-testid='company-name']", ".company"]);
  const jdEl = firstMatch(document, ["[data-testid='jobDescription']", ".job-description"]);

  return {
    platform: "Monster",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

function getDebugInfo(document) {
  return {
    adapter: "monster",
    confidence: "Low - needs manual verification.",
    todo: false
  };
}
return { canHandle, extract, getDebugInfo };
})();

const glassdoor = (() => {
// Adapter: Glassdoor
// Confidence: Medium - data-test attributes confirmed via multiple 2025/2026 guides, but exact suffixes rotate.
// URL pattern: glassdoor.com/job-listing/*
//
// Selector notes (from selector-inventory/glassdoor.md):
//   Title:        [data-test='job-title'], .JobDetails_jobTitle__*
//   Company:      [data-test='employer-name'], .EmployerProfile_employerName__*
//   Company link: [data-test='employer-name'] a
//   JD:           [data-test='jobDescription'], .JobDetails_jobDescription__*
//   Expand button:button[data-test='show-more-cta']
//
// NOTE: Uses hashed CSS class suffixes (e.g. __xY3z) that rotate on deploys - always prefer data-test attributes. Aggressive anti-bot; login wall appears after a few views.

function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /glassdoor\\.com/i.test(url);
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

function extract(document, url) {
  const titleEl = firstMatch(document, ["[data-test='job-title']", ".JobDetails_jobTitle__*"]);
  const companyEl = firstMatch(document, ["[data-test='employer-name']", ".EmployerProfile_employerName__*"]);
  const jdEl = firstMatch(document, ["[data-test='jobDescription']", ".JobDetails_jobDescription__*"]);

  return {
    platform: "Glassdoor",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

function getDebugInfo(document) {
  return {
    adapter: "glassdoor",
    confidence: "Medium - data-test attributes confirmed via multiple 2025/2026 guides, but exact suffixes rotate.",
    todo: false
  };
}
return { canHandle, extract, getDebugInfo };
})();

const hiringcafe = (() => {
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

function canHandle(url, document) {
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

function extract(document, url) {
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

function getDebugInfo(document) {
  return {
    adapter: "hiringcafe",
    confidence: "Unverified - requires manual DOM inspection.",
    todo: true
  };
}
return { canHandle, extract, getDebugInfo };
})();

const goapplyjobs = (() => {
// Adapter: GoApplyJobs
// Confidence: Unverified.
// URL pattern: TODO - confirm domain/job detail URL pattern
//
// Selector notes (from selector-inventory/goapplyjobs.md):
//   Title:        TODO
//   Company:      TODO
//   Company link: TODO
//   JD:           TODO
//   Expand button:TODO
//
// NOTE: No public documentation found for this platform's DOM structure. Treat as a candidate for the generic fallback adapter first; build a dedicated adapter only after manual inspection.

function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /goapplyjobs/i.test(url);
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

function extract(document, url) {
  const titleEl = firstMatch(document, ["TODO_SELECTOR"]);
  const companyEl = firstMatch(document, ["TODO_SELECTOR"]);
  const jdEl = firstMatch(document, ["TODO_SELECTOR"]);

  return {
    platform: "GoApplyJobs",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

function getDebugInfo(document) {
  return {
    adapter: "goapplyjobs",
    confidence: "Unverified.",
    todo: true
  };
}
return { canHandle, extract, getDebugInfo };
})();

const remoterocketship = (() => {
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

function canHandle(url, document) {
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

function extract(document, url) {
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

function getDebugInfo(document) {
  return {
    adapter: "remoterocketship",
    confidence: "Unverified.",
    todo: true
  };
}
return { canHandle, extract, getDebugInfo };
})();

const wellfound = (() => {
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

function canHandle(url, document) {
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

function extract(document, url) {
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

function getDebugInfo(document) {
  return {
    adapter: "wellfound",
    confidence: "Unverified.",
    todo: true
  };
}
return { canHandle, extract, getDebugInfo };
})();

const paraform = (() => {
// Adapter: Paraform
// Confidence: Unverified.
// URL pattern: paraform.com/jobs/* (confirm)
//
// Selector notes (from selector-inventory/paraform.md):
//   Title:        TODO
//   Company:      TODO
//   Company link: TODO
//   JD:           TODO
//   Expand button:TODO
//
// NOTE: Recruiter marketplace platform - niche, no public scraping guides found. Manual inspection required.

function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /paraform\\.com/i.test(url);
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

function extract(document, url) {
  const titleEl = firstMatch(document, ["TODO_SELECTOR"]);
  const companyEl = firstMatch(document, ["TODO_SELECTOR"]);
  const jdEl = firstMatch(document, ["TODO_SELECTOR"]);

  return {
    platform: "Paraform",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

function getDebugInfo(document) {
  return {
    adapter: "paraform",
    confidence: "Unverified.",
    todo: true
  };
}
return { canHandle, extract, getDebugInfo };
})();

const jobright = (() => {
// Adapter: Jobright
// Confidence: Unverified.
// URL pattern: jobright.ai/jobs/* (confirm)
//
// Selector notes (from selector-inventory/jobright.md):
//   Title:        TODO
//   Company:      TODO
//   Company link: TODO
//   JD:           TODO
//   Expand button:TODO
//
// NOTE: AI job matching platform - dynamic SPA, likely renders JD in a modal/panel rather than full page. No public selector documentation found.

function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /jobright\\.ai/i.test(url);
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

function extract(document, url) {
  const titleEl = firstMatch(document, ["TODO_SELECTOR"]);
  const companyEl = firstMatch(document, ["TODO_SELECTOR"]);
  const jdEl = firstMatch(document, ["TODO_SELECTOR"]);

  return {
    platform: "Jobright",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

function getDebugInfo(document) {
  return {
    adapter: "jobright",
    confidence: "Unverified.",
    todo: true
  };
}
return { canHandle, extract, getDebugInfo };
})();

const ladders = (() => {
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

function canHandle(url, document) {
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

function extract(document, url) {
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

function getDebugInfo(document) {
  return {
    adapter: "ladders",
    confidence: "Unverified.",
    todo: true
  };
}
return { canHandle, extract, getDebugInfo };
})();

const slackboard = (() => {
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

function canHandle(url, document) {
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

function extract(document, url) {
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

function getDebugInfo(document) {
  return {
    adapter: "slackboard",
    confidence: "Not applicable to standard content-script scraping - flagged for clarification.",
    todo: false
  };
}
return { canHandle, extract, getDebugInfo };
})();

const meeboss = (() => {
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

function canHandle(url, document) {
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

function extract(document, url) {
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

function getDebugInfo(document) {
  return {
    adapter: "meeboss",
    confidence: "Unverified - platform not found in search results.",
    todo: true
  };
}
return { canHandle, extract, getDebugInfo };
})();

const lensa = (() => {
// Adapter: Lensa
// Confidence: Unverified.
// URL pattern: lensa.com/*-jobs/j (confirm exact pattern)
//
// Selector notes (from selector-inventory/lensa.md):
//   Title:        TODO
//   Company:      TODO
//   Company link: TODO
//   JD:           TODO
//   Expand button:TODO
//
// NOTE: Job aggregator (re-posts listings from other boards, so JD structure may vary per source). No verified selector documentation found.

function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /lensa\\.com/i.test(url);
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

function extract(document, url) {
  const titleEl = firstMatch(document, ["TODO_SELECTOR"]);
  const companyEl = firstMatch(document, ["TODO_SELECTOR"]);
  const jdEl = firstMatch(document, ["TODO_SELECTOR"]);

  return {
    platform: "Lensa",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

function getDebugInfo(document) {
  return {
    adapter: "lensa",
    confidence: "Unverified.",
    todo: true
  };
}
return { canHandle, extract, getDebugInfo };
})();

const jobleads = (() => {
// Adapter: JobLeads
// Confidence: Unverified.
// URL pattern: jobleads.com/job/* (confirm)
//
// Selector notes (from selector-inventory/jobleads.md):
//   Title:        TODO
//   Company:      TODO
//   Company link: TODO
//   JD:           TODO
//   Expand button:TODO
//
// NOTE: Premium/executive job board, some pages behind paywall/login. No public selector documentation found.

function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /jobleads\\.com/i.test(url);
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

function extract(document, url) {
  const titleEl = firstMatch(document, ["TODO_SELECTOR"]);
  const companyEl = firstMatch(document, ["TODO_SELECTOR"]);
  const jdEl = firstMatch(document, ["TODO_SELECTOR"]);

  return {
    platform: "JobLeads",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

function getDebugInfo(document) {
  return {
    adapter: "jobleads",
    confidence: "Unverified.",
    todo: true
  };
}
return { canHandle, extract, getDebugInfo };
})();

const haystack = (() => {
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

function canHandle(url, document) {
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

function extract(document, url) {
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

function getDebugInfo(document) {
  return {
    adapter: "haystack",
    confidence: "Unverified - ambiguous platform name.",
    todo: true
  };
}
return { canHandle, extract, getDebugInfo };
})();

const dice = (() => {
// Adapter: Dice
// Confidence: Medium - inferred from common Dice DOM patterns, verify live.
// URL pattern: dice.com/job-detail/*
//
// Selector notes (from selector-inventory/dice.md):
//   Title:        h1[data-cy='jobTitle'], h1.job-title
//   Company:      [data-cy='companyNameLink'], a.employerName
//   Company link: [data-cy='companyNameLink']
//   JD:           [data-testid='jobDescriptionHtml'], .job-description
//   Expand button:none typically
//
// NOTE: Tech-focused board, React SPA. data-cy/data-testid attributes are more stable than class names. Already in your existing target list per earlier automation plans.

function canHandle(url, document) {
  return /dice\.com\/job-detail\//i.test(url);
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

function extract(document, url) {
  const titleEl = firstMatch(document, ["h1[data-cy='jobTitle']", "h1.job-title"]);
  const companyEl = firstMatch(document, ["[data-cy='companyNameLink']", "a.employerName"]);
  const jdEl = firstMatch(document, ["[data-testid='jobDescriptionHtml']", ".job-description"]);

  return {
    platform: "Dice",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

function getDebugInfo(document) {
  return {
    adapter: "dice",
    confidence: "Medium - inferred from common Dice DOM patterns, verify live.",
    todo: false
  };
}
return { canHandle, extract, getDebugInfo };
})();

const adzuna = (() => {
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

function canHandle(url, document) {
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

function extract(document, url) {
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

function getDebugInfo(document) {
  return {
    adapter: "adzuna",
    confidence: "Medium - itemprop microdata pattern is a reasonable starting bet, verify live.",
    todo: false
  };
}
return { canHandle, extract, getDebugInfo };
})();

const remotehunter = (() => {
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

function canHandle(url, document) {
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

function getDetailPane(document) {
  return firstExisting(document, DETAIL_PANE_SELECTORS);
}

function getResultsContainer(document) {
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

function getCurrentDetailState(document) {
  const detailPane = getDetailPane(document) || document;
  const title = textOrEmpty(firstMatch(detailPane, TITLE_SELECTORS));
  const href = getCurrentDetailHref(document);
  return {
    uuid: extractUuid(href),
    title,
    href
  };
}

function getJobCards(document) {
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

function getCardKey(card) {
  const href = getClickTarget(card)?.href || "";
  return extractUuid(href) || href || card.getAttribute("aria-label") || "";
}

function getSiteLink(document, fallbackHref = "") {
  return getCurrentDetailHref(document) || fallbackHref || window.location.href;
}

function openJobCard(card) {
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

async function waitForJobDetailsChange(previousState, document, options = {}) {
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

function maybeExpandDescription(document) {
  return false;
}

function getScrollContainer(document) {
  return window;
}

function hasReachedEnd(document) {
  const scrollBottom = window.scrollY + window.innerHeight;
  const docHeight = Math.max(
    document.body?.scrollHeight || 0,
    document.documentElement?.scrollHeight || 0
  );
  return scrollBottom >= docHeight - 24;
}

function getBatchDebugInfo(document) {
  const cards = getJobCards(document);
  const clickTargetCount = cards.filter((card) => Boolean(getClickTarget(card))).length;
  return {
    resultsContainerFound: Boolean(getResultsContainer(document)),
    cardCount: cards.length,
    clickTargetCount,
    sampleKeys: cards.slice(0, 5).map((card) => getCardKey(card))
  };
}

function extract(document, url) {
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

function getDebugInfo(document) {
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
return { waitForJobDetailsChange, canHandle, getDetailPane, getResultsContainer, getCurrentDetailState, getJobCards, getCardKey, openJobCard, maybeExpandDescription, getScrollContainer, hasReachedEnd, getBatchDebugInfo, extract, getDebugInfo };
})();

const jobcopilot = (() => {
// Adapter: JobCopilot
// Confidence: Unverified.
// URL pattern: jobcopilot.com/* job detail pattern (confirm)
//
// Selector notes (from selector-inventory/jobcopilot.md):
//   Title:        TODO
//   Company:      TODO
//   Company link: TODO
//   JD:           TODO
//   Expand button:TODO
//
// NOTE: This is itself a job-application-automation SaaS (similar category to your own project), not a traditional job board. Likely shows aggregated JDs inside its own dashboard UI. No public selector documentation found - manual inspection required.

function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /jobcopilot\\.com/i.test(url);
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

function extract(document, url) {
  const titleEl = firstMatch(document, ["TODO_SELECTOR"]);
  const companyEl = firstMatch(document, ["TODO_SELECTOR"]);
  const jdEl = firstMatch(document, ["TODO_SELECTOR"]);

  return {
    platform: "JobCopilot",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

function getDebugInfo(document) {
  return {
    adapter: "jobcopilot",
    confidence: "Unverified.",
    todo: true
  };
}
return { canHandle, extract, getDebugInfo };
})();

const generic = (() => {
// Generic fallback adapter used when no platform-specific adapter matches,
// or when a specific adapter's selectors fail to find data.
function canHandle(url, document) {
  return true; // always matches - must remain last in registry
}

function firstMatch(document, selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent.trim()) return el;
  }
  return null;
}

function extract(document, url) {
  const titleEl = firstMatch(document, ["h1", "[class*='job-title' i]", "[data-testid*='title' i]"]);
  const companyEl = firstMatch(document, [
    "[class*='company-name' i]",
    "[data-testid*='company' i]",
    "[itemprop='hiringOrganization']"
  ]);
  const jdEl = firstMatch(document, [
    "[class*='description' i]",
    "[data-testid*='description' i]",
    "article",
    "main"
  ]);

  return {
    platform: "Unknown",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : "",
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

function getDebugInfo(document) {
  return { adapter: "generic", note: "Used heuristic keyword-based selectors." };
}
return { canHandle, extract, getDebugInfo };
})();

const ADAPTERS = [
  linkedin,
  indeed,
  ziprecruiter,
  monster,
  glassdoor,
  hiringcafe,
  goapplyjobs,
  remoterocketship,
  wellfound,
  paraform,
  jobright,
  ladders,
  slackboard,
  meeboss,
  lensa,
  jobleads,
  haystack,
  dice,
  adzuna,
  remotehunter,
  jobcopilot,
  generic
];

const DEFAULT_BATCH_OPTIONS = {
  minActionDelayMs: 1500,
  maxActionDelayMs: 4500,
  minScrollDelayMs: 1200,
  maxScrollDelayMs: 3500,
  maxJobsPerRun: 50,
  maxIdleScrollRounds: 3,
  detailTimeoutMs: 12000,
  detailPollMs: 350,
  discoveryRetryCount: 3,
  discoveryRetryDelayMs: 900
};

function detectAdapter(url, document) {
  for (const adapter of ADAPTERS) {
    try {
      if (adapter.canHandle(url, document)) return adapter;
    } catch (error) {
      continue;
    }
  }
  return generic;
}

function getAcceptanceInfo(raw) {
  const titleLength = raw?.jobTitle?.trim?.().length || 0;
  const jdLength = raw?.jd?.trim?.().length || 0;
  const companyLength = raw?.company?.trim?.().length || 0;
  const siteLinkLength = raw?.siteLink?.trim?.().length || 0;
  const accepted = Boolean(titleLength || jdLength || companyLength);

  return {
    accepted,
    reason: accepted ? "accepted" : "missing-title-company-jd",
    lengths: {
      titleLength,
      jdLength,
      companyLength,
      siteLinkLength
    }
  };
}

function hasCriticalFields(raw) {
  return getAcceptanceInfo(raw).accepted;
}

async function safeExtract(adapter, document, url) {
  try {
    return await adapter.extract(document, url);
  } catch (error) {
    return null;
  }
}

function randomBetween(min, max) {
  const lower = Math.max(0, Number.isFinite(min) ? min : 0);
  const upper = Math.max(lower, Number.isFinite(max) ? max : lower);
  return Math.floor(lower + Math.random() * (upper - lower + 1));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitRandom(min, max) {
  const value = randomBetween(min, max);
  await wait(value);
  return value;
}

function getBatchOptions(options = {}) {
  return {
    ...DEFAULT_BATCH_OPTIONS,
    ...(options || {})
  };
}

function getScrollPosition(scrollContainer) {
  if (scrollContainer === window) {
    return {
      top: window.scrollY,
      height: window.innerHeight,
      scrollHeight: Math.max(
        document.body?.scrollHeight || 0,
        document.documentElement?.scrollHeight || 0
      )
    };
  }

  return {
    top: scrollContainer.scrollTop,
    height: scrollContainer.clientHeight,
    scrollHeight: scrollContainer.scrollHeight
  };
}

function scrollContainerByStep(scrollContainer) {
  const position = getScrollPosition(scrollContainer);
  const step = Math.max(320, Math.floor(position.height * 0.75));

  if (scrollContainer === window) {
    window.scrollTo({
      top: position.top + step,
      behavior: "smooth"
    });
  } else {
    scrollContainer.scrollTo({
      top: position.top + step,
      behavior: "smooth"
    });
  }

  return step;
}

function buildFallbackRaw(adapter, debug, url) {
  return {
    platform: adapter === generic ? "Unknown" : debug.adapter || "Unknown",
    siteLink: url,
    company: "",
    jobTitle: "",
    companyLink: "",
    jd: ""
  };
}

async function runSingleExtraction(url = window.location.href) {
  const adapter = detectAdapter(url, document);
  const debug = adapter.getDebugInfo ? adapter.getDebugInfo(document) : {};
  const raw = await safeExtract(adapter, document, url);
  const allowGenericFallback = debug.allowGenericFallback !== false;
  const needsFallback = adapter !== generic && allowGenericFallback && !hasCriticalFields(raw);
  const fallbackRaw = needsFallback ? await safeExtract(generic, document, url) : null;
  const finalRaw = needsFallback && hasCriticalFields(fallbackRaw) ? fallbackRaw : raw;
  const adapterDebug = finalRaw?._debug || raw?._debug || null;

  return {
    adapter,
    raw: finalRaw || buildFallbackRaw(adapter, debug, url),
    debug: {
      ...debug,
      adapterDebug,
      detectedAdapter: debug.adapter || "unknown",
      allowGenericFallback,
      usedGenericFallback: Boolean(needsFallback && fallbackRaw && finalRaw === fallbackRaw),
      hasCriticalFields: hasCriticalFields(finalRaw)
    }
  };
}

function getCardState(adapter, document) {
  const cards = typeof adapter.getJobCards === "function" ? adapter.getJobCards(document) || [] : [];
  const keyed = [];
  const seen = new Set();

  cards.forEach((card) => {
    let key = "";
    try {
      key = adapter.getCardKey ? adapter.getCardKey(card, document) : "";
    } catch (error) {
      key = "";
    }

    if (!key || seen.has(key)) return;
    seen.add(key);
    keyed.push({ key, card });
  });

  return keyed;
}

async function getCardStateWithRetries(adapter, document, batchOptions, summary) {
  let cardState = [];

  for (let attempt = 0; attempt < batchOptions.discoveryRetryCount; attempt += 1) {
    cardState = getCardState(adapter, document);
    if (cardState.length > 0) {
      if (attempt > 0) {
        summary.discoveryAttempts = attempt + 1;
      }
      return cardState;
    }

    if (attempt < batchOptions.discoveryRetryCount - 1) {
      await wait(batchOptions.discoveryRetryDelayMs);
    }
  }

  summary.discoveryAttempts = batchOptions.discoveryRetryCount;
  return cardState;
}

function getScrollContainer(adapter, document) {
  return typeof adapter.getScrollContainer === "function"
    ? (adapter.getScrollContainer(document) || window)
    : window;
}

function getScrollContainerType(scrollContainer) {
  return scrollContainer === window ? "window" : "element";
}

function getAdapterBatchDebug(adapter, document) {
  try {
    return typeof adapter.getBatchDebugInfo === "function" ? (adapter.getBatchDebugInfo(document) || {}) : {};
  } catch (error) {
    return { debugError: error?.message || "batch-debug-failed" };
  }
}

async function runBatchExtraction(options = {}) {
  const { adapter, debug } = await runSingleExtraction(window.location.href);
  const batchOptions = getBatchOptions(options);
  const initialScrollContainer = getScrollContainer(adapter, document);

  if (!debug.supportsBatch || typeof adapter.getJobCards !== "function" || typeof adapter.openJobCard !== "function") {
    return {
      raw: buildFallbackRaw(adapter, debug, window.location.href),
      rows: [],
      summary: {
        supported: false,
        reason: "Batch crawling is not implemented for this platform yet.",
        adapter: debug.adapter || "unknown"
      },
      debug
    };
  }

  const initialBatchDebug = getAdapterBatchDebug(adapter, document);
  const summary = {
    supported: true,
    adapter: debug.adapter || "unknown",
    discovered: 0,
    processed: 0,
    skipped: 0,
    failed: 0,
    idleScrollRounds: 0,
    stopReason: "completed",
    resultsContainerFound: Boolean(initialBatchDebug.resultsContainerFound),
    initialCardCount: initialBatchDebug.cardCount || 0,
    finalCardCount: initialBatchDebug.cardCount || 0,
    scrollContainerType: getScrollContainerType(initialScrollContainer),
    acceptedRows: 0,
    reasonsRejected: [],
    discoveryAttempts: 1,
    initialBatchDebug
  };

  const rows = [];
  const discoveredKeys = new Set();
  const processedKeys = new Set();
  const failedCards = [];
  let idleRounds = 0;

  while (processedKeys.size < batchOptions.maxJobsPerRun && idleRounds < batchOptions.maxIdleScrollRounds) {
    const cardState = await getCardStateWithRetries(adapter, document, batchOptions, summary);
    let newCardsThisRound = 0;

    cardState.forEach(({ key }) => {
      if (!discoveredKeys.has(key)) {
        discoveredKeys.add(key);
        newCardsThisRound += 1;
      }
    });

    summary.discovered = discoveredKeys.size;
    summary.finalCardCount = cardState.length;

    console.debug("[job-scraper] batch discovery", {
      adapter: summary.adapter,
      resultsContainerFound: summary.resultsContainerFound,
      initialCardCount: summary.initialCardCount,
      currentCardCount: cardState.length,
      scrollContainerType: summary.scrollContainerType,
      discoveryAttempts: summary.discoveryAttempts
    });

    for (const { key, card } of cardState) {
      if (processedKeys.size >= batchOptions.maxJobsPerRun) {
        summary.stopReason = "max-jobs-reached";
        break;
      }

      if (processedKeys.has(key)) continue;
      processedKeys.add(key);

      const cardDiagnostics = {
        key,
        hasClickTarget: true
      };

      try {
        await waitRandom(batchOptions.minActionDelayMs, batchOptions.maxActionDelayMs);

        const previousState = typeof adapter.waitForJobDetailsChange === "function"
          ? (adapter.getCurrentDetailState ? adapter.getCurrentDetailState(document) : null)
          : null;

        cardDiagnostics.previousState = previousState;
        adapter.openJobCard(card, document);

        let detailState = { changed: true, reason: "no-detail-wait-hook" };
        if (typeof adapter.waitForJobDetailsChange === "function") {
          detailState = await adapter.waitForJobDetailsChange(previousState, document, {
            timeoutMs: batchOptions.detailTimeoutMs,
            pollMs: batchOptions.detailPollMs
          });
        }

        cardDiagnostics.detailState = detailState;

        await waitRandom(batchOptions.minActionDelayMs, batchOptions.maxActionDelayMs);

        if (typeof adapter.maybeExpandDescription === "function") {
          adapter.maybeExpandDescription(document);
        }

        const singleResult = await runSingleExtraction(window.location.href);
        const acceptance = getAcceptanceInfo(singleResult.raw);
        cardDiagnostics.extracted = {
          siteLink: singleResult.raw?.siteLink || "",
          lengths: acceptance.lengths,
          adapterDebug: singleResult.debug?.adapterDebug || null
        };

        if (acceptance.accepted) {
          rows.push(singleResult.raw);
          summary.acceptedRows = rows.length;
        } else {
          summary.skipped += 1;
          summary.reasonsRejected.push({
            key,
            reason: acceptance.reason,
            lengths: acceptance.lengths
          });
        }

        summary.processed += 1;

        if (detailState && detailState.changed === false) {
          failedCards.push({
            key,
            reason: detailState.reason || "detail-did-not-change",
            diagnostics: cardDiagnostics
          });
        }

        console.debug("[job-scraper] card result", {
          adapter: summary.adapter,
          key,
          accepted: acceptance.accepted,
          lengths: acceptance.lengths,
          detailChanged: detailState?.changed,
          detailReason: detailState?.reason
        });
      } catch (error) {
        summary.failed += 1;
        failedCards.push({
          key,
          reason: error?.message || "card-processing-failed",
          diagnostics: cardDiagnostics
        });
      }
    }

    if (processedKeys.size >= batchOptions.maxJobsPerRun) {
      summary.stopReason = "max-jobs-reached";
      break;
    }

    const scrollContainer = getScrollContainer(adapter, document);
    const beforeScroll = getScrollPosition(scrollContainer);

    if (typeof adapter.loadMoreIfNeeded === "function") {
      try {
        adapter.loadMoreIfNeeded(document);
      } catch (error) {
        // Ignore load-more failures and keep crawling.
      }
    }

    scrollContainerByStep(scrollContainer);
    await waitRandom(batchOptions.minScrollDelayMs, batchOptions.maxScrollDelayMs);

    const afterScrollState = getCardState(adapter, document);
    const discoveredAfterScroll = afterScrollState.filter(({ key }) => !discoveredKeys.has(key));
    const afterScroll = getScrollPosition(scrollContainer);
    const scrollGrowthDetected = afterScroll.scrollHeight > beforeScroll.scrollHeight || afterScroll.top > beforeScroll.top + 8;

    summary.finalCardCount = afterScrollState.length;
    summary.scrollGrowthDetected = scrollGrowthDetected;

    console.debug("[job-scraper] scroll step", {
      adapter: summary.adapter,
      beforeScroll,
      afterScroll,
      discoveredAfterScroll: discoveredAfterScroll.length,
      scrollGrowthDetected
    });

    if (discoveredAfterScroll.length === 0) {
      idleRounds += 1;
      summary.idleScrollRounds = idleRounds;

      if (
        ((typeof adapter.hasReachedEnd === "function") && adapter.hasReachedEnd(document))
        || !scrollGrowthDetected
      ) {
        summary.stopReason = "reached-end";
        break;
      }
    } else {
      idleRounds = 0;
      summary.idleScrollRounds = 0;
    }
  }

  if (idleRounds >= batchOptions.maxIdleScrollRounds) {
    summary.stopReason = "max-idle-scroll-rounds";
  }

  summary.finalBatchDebug = getAdapterBatchDebug(adapter, document);

  return {
    raw: rows[rows.length - 1] || buildFallbackRaw(adapter, debug, window.location.href),
    rows,
    summary: {
      ...summary,
      failedCards
    },
    debug
  };
}

async function runExtraction(options = {}) {
  const mode = options?.mode === "batch" ? "batch" : "single";
  return mode === "batch" ? runBatchExtraction(options) : runSingleExtraction(window.location.href);
}

window.__JOB_SCRAPER_RUN__ = runExtraction;
})();