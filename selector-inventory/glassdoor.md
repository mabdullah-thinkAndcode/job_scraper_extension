# Platform: Glassdoor

- Confidence: Medium - data-test attributes confirmed via multiple 2025/2026 guides, but exact suffixes rotate.
- URL pattern: `glassdoor.com/job-listing/*`
- Title selector(s): `[data-test='job-title'], .JobDetails_jobTitle__*`
- Company selector(s): `[data-test='employer-name'], .EmployerProfile_employerName__*`
- Company link selector(s): `[data-test='employer-name'] a`
- JD selector(s): `[data-test='jobDescription'], .JobDetails_jobDescription__*`
- Expand/"show more" button: `button[data-test='show-more-cta']`

## Notes
Uses hashed CSS class suffixes (e.g. __xY3z) that rotate on deploys - always prefer data-test attributes. Aggressive anti-bot; login wall appears after a few views.

## Verification checklist (fill in Codex session)
- [ ] Open a real job detail page for this platform
- [ ] Confirm URL pattern above matches actual detail page URLs
- [ ] Inspect title element in DevTools, confirm selector
- [ ] Inspect company name + link element, confirm selector
- [ ] Inspect JD container, confirm it captures full text (check for truncation / "show more")
- [ ] Check if page requires login/paywall for full JD
- [ ] Check if content is client-rendered (may need MutationObserver / delay before extraction)
- [ ] Record any anti-bot behavior encountered (CAPTCHA, block, redirect)
