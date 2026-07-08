# Platform: MeeBoss

- Confidence: Unverified - platform not found in search results.
- URL pattern: `TODO - confirm domain and URL pattern`
- Title selector(s): `TODO`
- Company selector(s): `TODO`
- Company link selector(s): `TODO`
- JD selector(s): `TODO`
- Expand/"show more" button: `TODO`

## Notes
No public information found for this platform. Confirm it is a job board with a public web UI before building an adapter; otherwise use generic fallback.

## Verification checklist (fill in Codex session)
- [ ] Open a real job detail page for this platform
- [ ] Confirm URL pattern above matches actual detail page URLs
- [ ] Inspect title element in DevTools, confirm selector
- [ ] Inspect company name + link element, confirm selector
- [ ] Inspect JD container, confirm it captures full text (check for truncation / "show more")
- [ ] Check if page requires login/paywall for full JD
- [ ] Check if content is client-rendered (may need MutationObserver / delay before extraction)
- [ ] Record any anti-bot behavior encountered (CAPTCHA, block, redirect)
