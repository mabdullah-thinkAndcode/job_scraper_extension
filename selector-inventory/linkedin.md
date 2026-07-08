# Platform: LinkedIn

- Confidence: High - verified against 2026 selector reports.
- URL pattern: `linkedin.com/jobs/view/*`
- Title selector(s): `.job-details-jobs-unified-top-card__job-title, h1`
- Company selector(s): `.job-details-jobs-unified-top-card__company-name a, .job-details-jobs-unified-top-card__company-name, .topcard__org-name-link`
- Company link selector(s): `.job-details-jobs-unified-top-card__company-name a, .topcard__org-name-link`
- JD selector(s): `.jobs-description__content, .jobs-box__html-content, .show-more-less-html__markup`
- Expand/"show more" button: `button[aria-label*="Click to see more"], .show-more-less-html__button`

## Notes
Requires login for most job detail pages. Content loads async (SPA) - wait for hydration. Class names change periodically, verify before each large batch run.

## Verification checklist (fill in Codex session)
- [ ] Open a real job detail page for this platform
- [ ] Confirm URL pattern above matches actual detail page URLs
- [ ] Inspect title element in DevTools, confirm selector
- [ ] Inspect company name + link element, confirm selector
- [ ] Inspect JD container, confirm it captures full text (check for truncation / "show more")
- [ ] Check if page requires login/paywall for full JD
- [ ] Check if content is client-rendered (may need MutationObserver / delay before extraction)
- [ ] Record any anti-bot behavior encountered (CAPTCHA, block, redirect)
