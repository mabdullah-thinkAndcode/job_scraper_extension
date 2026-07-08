(() => {
const linkedin = (() => {
// Adapter: LinkedIn
// Confidence: High - verified against 2026 selector reports.
// URL pattern: linkedin.com/jobs/view/*
//
// Selector notes (from selector-inventory/linkedin.md):
//   Title:        .job-details-jobs-unified-top-card__job-title, h1
//   Company:      .job-details-jobs-unified-top-card__company-name a, .job-details-jobs-unified-top-card__company-name, .topcard__org-name-link
//   Company link: .job-details-jobs-unified-top-card__company-name a, .topcard__org-name-link
//   JD:           .jobs-description__content, .jobs-box__html-content, .show-more-less-html__markup
//   Expand button:button[aria-label*="Click to see more"], .show-more-less-html__button
//
// NOTE: Requires login for most job detail pages. Content loads async (SPA) - wait for hydration. Class names change periodically, verify before each large batch run.

function canHandle(url, document) {
  return /linkedin\.com\/jobs\/view\//i.test(url);
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
  const titleEl = firstMatch(document, [".job-details-jobs-unified-top-card__job-title", "h1"]);
  const companyEl = firstMatch(document, [".job-details-jobs-unified-top-card__company-name a", ".job-details-jobs-unified-top-card__company-name", ".topcard__org-name-link"]);
  const jdEl = firstMatch(document, [".jobs-description__content", ".jobs-box__html-content", ".show-more-less-html__markup"]);

  return {
    platform: "LinkedIn",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

function getDebugInfo(document) {
  return {
    adapter: "linkedin",
    confidence: "High - verified against 2026 selector reports.",
    todo: false
  };
}
return { canHandle, extract, getDebugInfo };
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
// Confidence: Unverified.
// URL pattern: TODO - confirm domain/URL pattern
//
// Selector notes (from selector-inventory/remotehunter.md):
//   Title:        TODO
//   Company:      TODO
//   Company link: TODO
//   JD:           TODO
//   Expand button:TODO
//
// NOTE: No public documentation found. Confirm exact site (name is generic and may collide with other 'remote hunter' branded sites).

function canHandle(url, document) {
  // TODO: refine URL match if this is too broad/narrow.
  return /remotehunter/i.test(url);
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
    platform: "Remote Hunter",
    siteLink: url,
    company: companyEl ? companyEl.textContent.trim() : "",
    jobTitle: titleEl ? titleEl.textContent.trim() : "",
    companyLink: companyEl && companyEl.tagName === "A" ? companyEl.href : (companyEl?.querySelector("a")?.href || ""),
    jd: jdEl ? jdEl.innerText.trim() : ""
  };
}

function getDebugInfo(document) {
  return {
    adapter: "remotehunter",
    confidence: "Unverified.",
    todo: true
  };
}
return { canHandle, extract, getDebugInfo };
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

function hasCriticalFields(raw) {
  return Boolean(raw && (raw.jobTitle || raw.jd));
}

function safeExtract(adapter, document, url) {
  try {
    return adapter.extract(document, url);
  } catch (error) {
    return null;
  }
}

function runExtraction() {
  const url = window.location.href;
  const adapter = detectAdapter(url, document);
  const raw = safeExtract(adapter, document, url);
  const needsFallback = adapter !== generic && !hasCriticalFields(raw);
  const fallbackRaw = needsFallback ? safeExtract(generic, document, url) : null;
  const finalRaw = needsFallback && hasCriticalFields(fallbackRaw) ? fallbackRaw : raw;
  const debug = adapter.getDebugInfo ? adapter.getDebugInfo(document) : {};

  return {
    raw: finalRaw || {
      platform: adapter === generic ? "Unknown" : debug.adapter || "Unknown",
      siteLink: url,
      company: "",
      jobTitle: "",
      companyLink: "",
      jd: ""
    },
    debug: {
      ...debug,
      detectedAdapter: debug.adapter || "unknown",
      usedGenericFallback: Boolean(needsFallback && fallbackRaw && finalRaw === fallbackRaw),
      hasCriticalFields: hasCriticalFields(finalRaw)
    }
  };
}

window.__JOB_SCRAPER_RUN__ = runExtraction;
})();