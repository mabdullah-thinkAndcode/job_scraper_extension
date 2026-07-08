# Platform: Indeed

- Confidence: High - verified against multiple 2025/2026 scraping guides.
- URL pattern: `indeed.com/viewjob?jk=* or indeed.com/jobs?...&vjk=*`
- Title selector(s): `h1.jobsearch-JobInfoHeader-title, [data-testid='jobsearch-JobInfoHeader-title']`
- Company selector(s): `[data-testid='inlineHeader-companyName'], .jobsearch-InlineCompanyRating`
- Company link selector(s): `[data-testid='inlineHeader-companyName'] a`
- JD selector(s): `#jobDescriptionText, div#vjs-desc`
- Expand/"show more" button: `none typically - full JD usually rendered in DOM`

## Notes
Uses Cloudflare bot protection on some regions; heavy rate limiting. Job key 'jk' param identifies job uniquely - use for dedupe.

## Verification checklist (fill in Codex session)
- [ ] Open a real job detail page for this platform
- [ ] Confirm URL pattern above matches actual detail page URLs
- [ ] Inspect title element in DevTools, confirm selector
- [ ] Inspect company name + link element, confirm selector
- [ ] Inspect JD container, confirm it captures full text (check for truncation / "show more")
- [ ] Check if page requires login/paywall for full JD
- [ ] Check if content is client-rendered (may need MutationObserver / delay before extraction)
- [ ] Record any anti-bot behavior encountered (CAPTCHA, block, redirect)
