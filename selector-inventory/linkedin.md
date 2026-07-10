# Platform: LinkedIn

- Confidence: High - verified against 2026 selector reports.
- URL pattern: `linkedin.com/jobs/view/*` and `linkedin.com/jobs/search/*?currentJobId=*`
- Title selector(s): `.job-details-jobs-unified-top-card__job-title, h1`
- Company selector(s): `.job-details-jobs-unified-top-card__company-name a, .job-details-jobs-unified-top-card__company-name, .topcard__org-name-link`
- Company link selector(s): `.job-details-jobs-unified-top-card__company-name a, .topcard__org-name-link`
- JD selector(s): `.jobs-description__content, .jobs-box__html-content, .show-more-less-html__markup`
- Expand/"show more" button: `button[aria-label*="Click to see more"], .show-more-less-html__button`

## Notes
Requires login for most job detail pages. Content loads async (SPA) - wait for hydration. Class names change periodically, verify before each large batch run.

## Extracted DOM evidence
- Source: `Extracted DOMs/linkedin.md`
- Confirmed URL shape from DOM: `linkedin.com/jobs/search/?currentJobId=...`
- Batch crawl selectors from the structured report:
  - Results list: `[role='main'] [role='list']`, `.jobs-search-results-list`, `.scaffold-layout__list`
  - Job cards: `[role='listitem'][componentkey]`, fallback `[role='listitem']`
  - Click target: `a[href*='currentJobId=']`, fallback `a[href*='/jobs/view/']`
  - Dedupe key: `currentJobId`, fallback href or `componentkey`
  - Scroll container: prefer list pane scroll parent if present, otherwise `window`
  - Detail change detection: `currentJobId` change, fallback title change in the detail pane
- The saved DOM snapshot is a noisy LinkedIn app-shell/feed export and does not expose stable job-detail markers such as `.job-details-jobs-unified-top-card__job-title` or `.jobs-description__content`.
- Because of that, this DOM file is useful for URL-pattern confirmation and for proving generic fallback is unsafe on LinkedIn search pages, but it is not sufficient by itself to fully re-verify title/company/JD selectors from raw HTML.
- Adapter behavior should prefer returning partial blank LinkedIn fields over scraping feed/sidebar content from the generic fallback.
- Search-page support should wait for the selected detail pane before extracting and should never fall back to generic scraping on recognized LinkedIn jobs pages.
- Current layered detail-pane selectors: `.jobs-search__job-details--container`, `.jobs-details__main-content`, `.job-view-layout`, `.scaffold-layout__detail`, `[data-job-detail-container]`, `.jobs-unified-top-card`
- Current layered title/company/JD extraction is scoped to the detected detail pane to avoid scraping the surrounding app shell.

## Verification checklist (fill in Codex session)
- [ ] Open a real job detail page for this platform
- [x] Confirm URL pattern above matches actual detail page URLs
- [ ] Inspect title element in DevTools, confirm selector
- [ ] Inspect company name + link element, confirm selector
- [ ] Inspect JD container, confirm it captures full text (check for truncation / "show more")
- [ ] Check if page requires login/paywall for full JD
- [ ] Check if content is client-rendered (may need MutationObserver / delay before extraction)
- [ ] Record any anti-bot behavior encountered (CAPTCHA, block, redirect)
