# Platform: Adzuna

- Confidence: Medium - itemprop microdata pattern is a reasonable starting bet, verify live.
- URL pattern: `adzuna.com/details/*`
- Title selector(s): `h1.header, h1[itemprop='title']`
- Company selector(s): `[itemprop='hiringOrganization'], .company`
- Company link selector(s): `TODO`
- JD selector(s): `div.adp-body, [itemprop='description']`
- Expand/"show more" button: `none typically`

## Notes
Adzuna has a public search API as an alternative to scraping - recommend evaluating the API before building a DOM adapter. Uses schema.org itemprop microdata which is more stable than classes.

## Verification checklist (fill in Codex session)
- [ ] Open a real job detail page for this platform
- [ ] Confirm URL pattern above matches actual detail page URLs
- [ ] Inspect title element in DevTools, confirm selector
- [ ] Inspect company name + link element, confirm selector
- [ ] Inspect JD container, confirm it captures full text (check for truncation / "show more")
- [ ] Check if page requires login/paywall for full JD
- [ ] Check if content is client-rendered (may need MutationObserver / delay before extraction)
- [ ] Record any anti-bot behavior encountered (CAPTCHA, block, redirect)
