# Platform: Slack Board (Slack-based job community)

- Confidence: Not applicable to standard content-script scraping - flagged for clarification.
- URL pattern: `N/A - likely not a standard scrapeable HTML job board; may be Slack workspace content`
- Title selector(s): `N/A`
- Company selector(s): `N/A`
- Company link selector(s): `N/A`
- JD selector(s): `N/A`
- Expand/"show more" button: `N/A`

## Notes
Clarify with user: 'Slack Board' likely refers to job postings inside a Slack workspace/channel, not a public website. A content script cannot scrape Slack's app (it's an Electron/web app behind auth and real-time sockets). This needs a different approach (Slack API with a bot token) rather than a DOM scraper adapter.

## Verification checklist (fill in Codex session)
- [ ] Open a real job detail page for this platform
- [ ] Confirm URL pattern above matches actual detail page URLs
- [ ] Inspect title element in DevTools, confirm selector
- [ ] Inspect company name + link element, confirm selector
- [ ] Inspect JD container, confirm it captures full text (check for truncation / "show more")
- [ ] Check if page requires login/paywall for full JD
- [ ] Check if content is client-rendered (may need MutationObserver / delay before extraction)
- [ ] Record any anti-bot behavior encountered (CAPTCHA, block, redirect)
