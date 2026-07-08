# Platform: ZipRecruiter

- Confidence: Low - needs manual verification in Codex session.
- URL pattern: `ziprecruiter.com/jobs/*`
- Title selector(s): `h1.job_title, h1[class*='JobTitle']`
- Company selector(s): `a.hiring_company_text, [class*='hiring_company']`
- Company link selector(s): `a.hiring_company_text`
- JD selector(s): `div.job_description, section[class*='jobDescription']`
- Expand/"show more" button: `button[class*='show_more'] (if truncated)`

## Notes
TODO: verify current class names live - ZipRecruiter frequently changes markup and uses bot detection (PerimeterX). Confirm selectors manually via DevTools before writing adapter.

## Verification checklist (fill in Codex session)
- [ ] Open a real job detail page for this platform
- [ ] Confirm URL pattern above matches actual detail page URLs
- [ ] Inspect title element in DevTools, confirm selector
- [ ] Inspect company name + link element, confirm selector
- [ ] Inspect JD container, confirm it captures full text (check for truncation / "show more")
- [ ] Check if page requires login/paywall for full JD
- [ ] Check if content is client-rendered (may need MutationObserver / delay before extraction)
- [ ] Record any anti-bot behavior encountered (CAPTCHA, block, redirect)
