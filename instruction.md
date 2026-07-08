# Project goal

Build a Chrome Extension (Manifest V3) that extracts job description data from
20 different job boards/platforms. The extension must be modular: each
platform has its own extractor ("adapter") module, and a generic fallback
adapter handles unrecognized/unverified platforms.

This repo is a **scaffold**, not a finished extension. Adapter stub files
already exist for every platform below with placeholder/TODO selectors.
Your job (Codex) is to:
1. Verify/complete selectors for each platform (see `selector-inventory/*.md`).
2. Bundle the ES module code so it can run inside `chrome.scripting.executeScript`.
3. Wire up popup -> background -> content extraction -> CSV export end-to-end.
4. Harden error handling per adapter contract below.

# Platform status (confidence assessed at scaffold time)

| Platform | URL pattern | Confidence |
|---|---|---|
| LinkedIn | `linkedin.com/jobs/view/*` | High - verified against 2026 selector reports. |
| Indeed | `indeed.com/viewjob?jk=* or indeed.com/jobs?...&vjk=*` | High - verified against multiple 2025/2026 scraping guides. |
| ZipRecruiter | `ziprecruiter.com/jobs/*` | Low - needs manual verification in Codex session. |
| Monster | `monster.com/job-openings/*` | Low - needs manual verification. |
| Glassdoor | `glassdoor.com/job-listing/*` | Medium - data-test attributes confirmed via multiple 2025/2026 guides, but exact suffixes rotate. |
| Hiring Cafe | `hiring.cafe/jobs/*` | Unverified - requires manual DOM inspection. |
| GoApplyJobs | `TODO - confirm domain/job detail URL pattern` | Unverified. |
| Remote Rocketship | `remoterocketship.com/company/*/jobs/* (confirm)` | Unverified. |
| Wellfound (AngelList Talent) | `wellfound.com/jobs/* or wellfound.com/company/*/jobs/*` | Unverified. |
| Paraform | `paraform.com/jobs/* (confirm)` | Unverified. |
| Jobright | `jobright.ai/jobs/* (confirm)` | Unverified. |
| Ladders | `theladders.com/job/*` | Unverified. |
| Slack Board (Slack-based job community) | `N/A - likely not a standard scrapeable HTML job board; may be Slack workspace content` | Not applicable to standard content-script scraping - flagged for clarification. |
| MeeBoss | `TODO - confirm domain and URL pattern` | Unverified - platform not found in search results. |
| Lensa | `lensa.com/*-jobs/j (confirm exact pattern)` | Unverified. |
| JobLeads | `jobleads.com/job/* (confirm)` | Unverified. |
| Haystack | `startup.jobs or haystack.app job detail pattern (confirm)` | Unverified - ambiguous platform name. |
| Dice | `dice.com/job-detail/*` | Medium - inferred from common Dice DOM patterns, verify live. |
| Adzuna | `adzuna.com/details/*` | Medium - itemprop microdata pattern is a reasonable starting bet, verify live. |
| Remote Hunter | `TODO - confirm domain/URL pattern` | Unverified. |
| JobCopilot | `jobcopilot.com/* job detail pattern (confirm)` | Unverified. |

Platforms marked "Unverified" have no public DOM documentation found during
research. Their adapter files (`src/platforms/<key>.js`) contain
`"TODO_SELECTOR"` placeholders. Do NOT assume these are correct - open the
real site in a browser, inspect the DOM with DevTools, and fill in real
selectors before relying on that adapter. Until verified, extraction from
these platforms will fall through to `generic.js`, which is intentional and
safe (no crashes, just weaker field capture).

One platform, **"Slack Board"**, may not be a public website at all (it may
refer to job postings inside a Slack workspace). A DOM content-script adapter
cannot scrape Slack's authenticated real-time app. Flag this back to the user
for clarification before building `slackboard.js` further - it currently
contains a placeholder with this note.

# Core requirements

1. Detect current platform from URL and/or DOM using `src/platforms/registry.js`.
2. Route extraction to the matching adapter; fall back to `generic.js` if none match
   or if a specific adapter throws/returns empty critical fields.
3. Normalize all adapter output to the schema in `src/core/schema.js`.
4. Export collected rows as a CSV file via `chrome.downloads`, compatible with Excel.
5. Keep all platform-specific selectors isolated inside their own adapter file -
   never let one platform's fragile selector break another platform's adapter.
6. Fail gracefully: partial data is acceptable, missing fields must be reported,
   the popup must never crash from a bad selector.
7. New platforms must be addable by creating one new file in `src/platforms/`
   and registering it in `registry.js` - no changes needed elsewhere.

# Output schema (already implemented in src/core/schema.js)

- Number
- Date
- Platform
- Site Link
- Company
- Job title
- Company Link
- JD

Do not rename these columns unless the user explicitly asks - this matches
their existing job-tracking sheet format used across other automation tools.

# Design rules

- Manifest V3 only.
- Permissions: `activeTab`, `scripting`, `downloads` only, unless a specific
  platform genuinely requires `host_permissions` (e.g. persistent background
  scraping without user click) - ask before widening permissions.
- Plain JavaScript ES modules, no TypeScript, no frontend framework needed for
  the popup (kept intentionally lightweight).
- Separate DOM selection (adapter `extract()`) from normalization
  (`core/normalize.js`) from export (`core/exporter.js`). Do not merge these
  responsibilities into one file.
- `chrome.scripting.executeScript` functions cannot use `import` statements
  directly - either bundle `src/platforms/*` + `src/core/*` into a single
  injected function with a bundler (esbuild is fine, no build config exists
  yet - you may add one), or inline the registry+adapters logic into the
  function passed to `executeScript`. `src/popup/popup.js` currently has a
  placeholder TODO marking exactly where this needs to happen.
- No `localStorage`/`sessionStorage` for extension state that must persist -
  use `chrome.storage.sync` or `chrome.storage.local` instead.

# Adapter contract (already followed by all stub files)

Each file in `src/platforms/<key>.js` must export:
- `canHandle(url, document)` -> boolean
- `extract(document, url)` -> `{ platform, siteLink, company, jobTitle, companyLink, jd }`
- `getDebugInfo(document)` -> `{ adapter, confidence, ...}`

`extract()` returns raw platform data. `core/normalize.js` converts raw data
into the standard schema and reports `missingFields`.

# Error handling

If required fields are missing:
- Still return partial data (never throw from `extract()`; catch internally).
- Include a `missingFields` array (already produced by `normalize.js`).
- Never crash the popup UI - `registry.js` already wraps `canHandle()` calls
  in try/catch; keep that pattern for `extract()` calls too (currently NOT
  wrapped - add try/catch around `adapter.extract()` calls in
  `content/runner.js` and in `popup.js`'s injected function as you bundle it).

# Export

- Default export format: CSV (`core/exporter.js`, already implemented).
- Escape commas, quotes, and line breaks correctly (already implemented).
- Preserve full JD text - do not truncate.
- Filename format: `jobs-YYYY-MM-DD-HH-mm.csv` (already implemented).
- XLSX export should be added later as a separate exporter module
  (e.g. `core/exporter-xlsx.js` using SheetJS via CDN or npm), without
  touching `exporter.js` or the scraping logic.

# UI (popup, already scaffolded in src/popup/)

Popup must include:
- Detect platform (label at top, wired but shows placeholder platform name
  until bundling is done)
- Scrape current page button (wired, calls placeholder inline function)
- Preview extracted fields (wired, shows normalized row + missing fields)
- Export CSV button (wired, calls background service worker)
- Clear collected rows button (wired)

# What to do first (recommended order for this Codex session)

1. Set up a minimal bundler step (esbuild recommended) so
   `src/platforms/registry.js` + all adapters + `core/*` can be injected via
   `chrome.scripting.executeScript` as a single function/string.
2. Wire the real bundle into `src/popup/popup.js`, replacing the placeholder
   inline function.
3. Verify + finish selectors for the 2-3 platforms the user uses most often
   first (based on prior context: LinkedIn, Indeed, ZipRecruiter, Dice were
   already part of their existing automation stack - prioritize these).
4. Load the extension unpacked in Chrome (`chrome://extensions` -> Developer
   mode -> Load unpacked -> select this folder) and test scraping + CSV export
   on 1 real job page per finished platform.
5. Move to the "Unverified" platforms one at a time using
   `selector-inventory/<key>.md` as your working notes and checklist.
6. Only after CSV export is solid, consider adding an XLSX exporter.

# Testing checklist per platform

- [ ] `canHandle()` correctly matches real job detail page URLs
- [ ] `extract()` captures Job title, Company, JD with no truncation
- [ ] Company link resolves to a real absolute URL, not relative/empty
- [ ] Adapter does not throw on pages that are still loading (client-rendered SPA)
- [ ] Missing-field reporting works (test on a page with an unusual layout, e.g.
      a job with no listed company link)
