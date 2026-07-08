# Platform: Dice

- Confidence: Medium - inferred from common Dice DOM patterns, verify live.
- URL pattern: `dice.com/job-detail/*`
- Title selector(s): `h1[data-cy='jobTitle'], h1.job-title`
- Company selector(s): `[data-cy='companyNameLink'], a.employerName`
- Company link selector(s): `[data-cy='companyNameLink']`
- JD selector(s): `[data-testid='jobDescriptionHtml'], .job-description`
- Expand/"show more" button: `none typically`

## Notes
Tech-focused board, React SPA. data-cy/data-testid attributes are more stable than class names. Already in your existing target list per earlier automation plans.

## Verification checklist (fill in Codex session)
- [ ] Open a real job detail page for this platform
- [ ] Confirm URL pattern above matches actual detail page URLs
- [ ] Inspect title element in DevTools, confirm selector
- [ ] Inspect company name + link element, confirm selector
- [ ] Inspect JD container, confirm it captures full text (check for truncation / "show more")
- [ ] Check if page requires login/paywall for full JD
- [ ] Check if content is client-rendered (may need MutationObserver / delay before extraction)
- [ ] Record any anti-bot behavior encountered (CAPTCHA, block, redirect)
