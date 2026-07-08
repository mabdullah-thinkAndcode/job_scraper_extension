# Platform: Monster

- Confidence: Low - needs manual verification.
- URL pattern: `monster.com/job-openings/*`
- Title selector(s): `h1[data-testid='jobTitle'], h1.job-title`
- Company selector(s): `[data-testid='company-name'], .company`
- Company link selector(s): `[data-testid='company-name'] a`
- JD selector(s): `[data-testid='jobDescription'], .job-description`
- Expand/"show more" button: `none typically`

## Notes
TODO: verify selectors - Monster site redesigned recently; data-testid attributes preferred over class names for stability.

## Verification checklist (fill in Codex session)
- [ ] Open a real job detail page for this platform
- [ ] Confirm URL pattern above matches actual detail page URLs
- [ ] Inspect title element in DevTools, confirm selector
- [ ] Inspect company name + link element, confirm selector
- [ ] Inspect JD container, confirm it captures full text (check for truncation / "show more")
- [ ] Check if page requires login/paywall for full JD
- [ ] Check if content is client-rendered (may need MutationObserver / delay before extraction)
- [ ] Record any anti-bot behavior encountered (CAPTCHA, block, redirect)
