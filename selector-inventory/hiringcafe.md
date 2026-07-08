# Platform: Hiring Cafe

- Confidence: Unverified - requires manual DOM inspection.
- URL pattern: `hiring.cafe/jobs/*`
- Title selector(s): `TODO - inspect h1 or job title container`
- Company selector(s): `TODO`
- Company link selector(s): `TODO`
- JD selector(s): `TODO`
- Expand/"show more" button: `TODO`

## Notes
Newer aggregator site - no public scraping documentation found. Inspect live DOM in Codex session and fill selectors before writing adapter.

## Verification checklist (fill in Codex session)
- [ ] Open a real job detail page for this platform
- [ ] Confirm URL pattern above matches actual detail page URLs
- [ ] Inspect title element in DevTools, confirm selector
- [ ] Inspect company name + link element, confirm selector
- [ ] Inspect JD container, confirm it captures full text (check for truncation / "show more")
- [ ] Check if page requires login/paywall for full JD
- [ ] Check if content is client-rendered (may need MutationObserver / delay before extraction)
- [ ] Record any anti-bot behavior encountered (CAPTCHA, block, redirect)
