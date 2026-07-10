## Extraction Report: TheLadders Job Board

**Context**
Analysis of TheLadders search results page (`/jobs/searchresults-jobs`) to identify selectors for automated scraping. The page utilizes a React-based Master-Detail (split-view) layout where the results list and job details coexist.

**Diagnostics**
Technical findings from the rendered DOM:

| Component | Technical Finding |
| :--- | :--- |
| **Architecture** | Hybrid list+detail page with dynamic React rendering. |
| **Scrolling** | Nested container scroll inside `.job-list-container`. |
| **Deduplication** | Unique job IDs are embedded at the end of card `href` attributes. |
| **Obfuscation** | Company names and full descriptions are gated or obfuscated for guest users. |
| **Noise** | Dynamic hashes (e.g., `.mng34os6mrg4t3be97`) are used for keyword highlighting and must be ignored. |

**Actionable Findings**
*   **Results Container:** The primary list is contained within `.job-list-pagination-jobs`.
*   **Job Cards:** Each result is wrapped in `.job-list-pagination-job-card-container`.
*   **Detail View:** Selecting a card triggers a re-render of `.job-list-detail-container`.
*   **Automation Safety:** Use the `action="job-card"` attribute for stable click targeting. Avoid index-based classes like `.job-card-container-0`.

**Code Fixes**
The following selector object is identified as the potential adapter for automation:


`````js
{
  platform: "theladders",
  urlMatch: /theladders\.com\/jobs\/searchresults-jobs/,
  containers: {
    resultsList: ".job-list-pagination-jobs",
    jobCard: ".job-list-pagination-job-card-container",
    clickTarget: ".clickable-card",
    detailPane: ".job-list-detail-container",
    scrollContainer: ".job-list-container",
    loadMoreButton: null
  },
  fields: {
    title: [".job-view-title", ".job-list-detail-container h2"],
    company: [".locked-feature-badge", ".job-view-card-linkless-company"],
    companyLink: [".industry.details-row a", ".job-view-card-location"],
    jd: [".obfuscated-job-description-section", ".job-details-wrapper"],
    expandDescription: [".unlock-job"]
  },
  dedupe: {
    primary: "href",
    fallback: "data-testid"
  },
  detailChangeDetection: {
    primary: ".job-view-title",
    fallback: ".selected-card"
  },
  avoidSelectors: [".mng34os6mrg4t3be97", "[class*='job-card-container-']"],
  notes: [
    "Results list is in a nested scroll container.",
    "Company names and descriptions may be obfuscated for guests.",
    "Ignore hashed classes used for keyword highlighting during text extraction."
  ]
}
`````


**Extraction Strategy**
1.  **Scroll Container:** Target `.job-list-container` to trigger lazy loading of cards.
2.  **Selection:** Click `.clickable-card` and monitor `.job-view-title` for content updates.
3.  **Timing:** Implement a 800ms–1500ms delay between clicks to account for React state updates.
4.  **Deduplication:** Parse the numeric ID from the card's `href` to prevent duplicate processing.

*Note: The code fixes and findings above were identified on a live page in DevTools. When applying them to your codebase, please adapt them to your project's specific technical stack (e.g., Tailwind CSS classes, CSS modules, framework components) rather than applying them as literal CSS overrides.*