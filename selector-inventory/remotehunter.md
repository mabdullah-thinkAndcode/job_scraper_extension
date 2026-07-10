# Platform: Remote Hunter

- Confidence: Medium - based on `Extracted DOMs/remotehunter.md` structured report.
- URL pattern: `remotehunter.com/jobs*`
- Results list selector(s): `.job-search-results`
- Job card selector(s): `.rh-list-stack__layers`
- Click target selector(s): `.rh-list-stack__layers a, a[href*='/apply-with-ai/']`
- Detail pane selector(s): `.job-detail-scrollable-content`
- Title selector(s): `.job-detail-scrollable-content h1`
- Company selector(s): `.job-header-box .company-name`
- Company link selector(s): `closest(a)` from the company element when present
- JD selector(s): `.job-description`
- Expand/"show more" button: `not required in current report`

## Notes
Use the AI selector report as the primary source of truth for batch traversal on this platform. Avoid `jsx-*` hashed classes. The split view appears to update in place, so wait for detail-pane `h1` text or UUID-bearing href changes after clicking a card.

## Extracted DOM evidence
- Source: `Extracted DOMs/remotehunter.md`
- Primary scroll mode: `window` infinite scroll
- Dedupe key: UUID in `/apply-with-ai/` href
- Detail change detection: `.job-detail-scrollable-content h1`
- Avoid selectors: `.jsx-*` hashed classes

## Verification checklist (fill in Codex session)
- [ ] Open a real job detail page for this platform
- [ ] Confirm URL pattern above matches actual detail page URLs
- [ ] Inspect title element in DevTools, confirm selector
- [ ] Inspect company name + link element, confirm selector
- [ ] Inspect JD container, confirm it captures full text (check for truncation / "show more")
- [ ] Check if page requires login/paywall for full JD
- [ ] Check if content is client-rendered (may need MutationObserver / delay before extraction)
- [ ] Record any anti-bot behavior encountered (CAPTCHA, block, redirect)
