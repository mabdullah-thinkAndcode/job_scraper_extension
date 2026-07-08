# Job Board Scraper - Chrome Extension Scaffold

A modular Manifest V3 Chrome extension scaffold for extracting job posting
data (title, company, JD, links) from 20+ job boards, normalizing it into one
schema, and exporting to CSV (Excel-compatible).

This is a starter scaffold for continuing work in Codex. It is not a finished,
installable extension yet - see `instruction.md` for the exact remaining work
and priorities.

## What's included

```text
job_scraper_extension/
|- manifest.json              MV3 manifest (activeTab, scripting, downloads)
|- instruction.md             Full task brief for Codex - READ THIS FIRST
|- README.md                  This file
|- package.json               Minimal build script entrypoint
|- scripts/
|  |- build-injected-bundle.mjs
|- selector-inventory/        One .md checklist per platform with selector notes
|- samples/
|  |- sample-output.csv       Example of expected CSV export shape
`- src/
   |- background/
   |  `- service-worker.js    Collects rows, triggers CSV export
   |- content/
   |  |- runner.js            Runs adapter registry against current page
   |  `- dom-utils.js         Shared selector helpers
   |- core/
   |  |- schema.js            OUTPUT_COLUMNS - single source of truth
   |  |- normalize.js         Raw adapter output -> standard schema row
   |  `- exporter.js          CSV generation + chrome.downloads trigger
   |- injected/
   |  `- extractor.bundle.js  Built script injected into the active tab
   |- platforms/
   |  |- registry.js          Adapter list + detectAdapter()
   |  |- generic.js           Fallback adapter
   |  `- <platform>.js        One adapter per platform
   |- popup/
   |  |- popup.html / .css / .js
   `- options/
      `- options.html / .js
```

## Platform coverage status

- LinkedIn - High - verified against 2026 selector reports.
- Indeed - High - verified against multiple 2025/2026 scraping guides.
- ZipRecruiter - Low - needs manual verification in a browser session.
- Monster - Low - needs manual verification.
- Glassdoor - Medium - data-test attributes confirmed via multiple 2025/2026 guides, but exact suffixes rotate.
- Hiring Cafe - Unverified - requires manual DOM inspection.
- GoApplyJobs - Unverified.
- Remote Rocketship - Unverified.
- Wellfound (AngelList Talent) - Unverified.
- Paraform - Unverified.
- Jobright - Unverified.
- Ladders - Unverified.
- Slack Board (Slack-based job community) - Not applicable to standard content-script scraping without clarification.
- MeeBoss - Unverified - platform not found in search results.
- Lensa - Unverified.
- JobLeads - Unverified.
- Haystack - Unverified - ambiguous platform name.
- Dice - Medium - inferred from common Dice DOM patterns, verify live.
- Adzuna - Medium - itemprop microdata pattern is a reasonable starting bet, verify live.
- Remote Hunter - Unverified.
- JobCopilot - Unverified.

High and medium confidence platforms should still be spot-checked. Low or
unverified platforms may safely fall back to the generic adapter until their
real selectors are confirmed from live pages.

## How to continue in Codex

1. Open this folder in Codex Desktop or CLI.
2. Read `instruction.md` in full.
3. Build the injected extractor bundle:

   ```bash
   npm run build
   ```

   Or in this Codex workspace:

   ```powershell
   .\scripts\build-injected-bundle.ps1
   ```

4. Load unpacked in Chrome via `chrome://extensions` -> Developer mode -> Load unpacked.
5. For each platform, open `selector-inventory/<key>.md`, verify selectors on a live job page, then update `src/platforms/<key>.js`.

## Build step

`chrome.scripting.executeScript` cannot inject ES module imports directly.
This scaffold now includes a minimal local build step in
`scripts/build-injected-bundle.mjs` that packages the adapter registry and all
platform extractors into `src/injected/extractor.bundle.js`.

The popup injects that built file first, then calls
`window.__JOB_SCRAPER_RUN__()` inside the active tab.

## Output schema

CSV columns (see `src/core/schema.js`):

```text
Number, Date, Platform, Site Link, Company, Job title, Company Link, JD
```

See `samples/sample-output.csv` for an example row shape.

## Permissions

Kept intentionally minimal: `activeTab`, `scripting`, `downloads`. No
`host_permissions` are requested by default - the extension only acts on the
tab the user is currently viewing when they click "Scrape current page."
