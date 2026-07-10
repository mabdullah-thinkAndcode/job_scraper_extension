## Platform Analysis: Remote Hunter Scraper Configuration

**Context**
Analysis of Remote Hunter’s job board (`remotehunter.com/jobs`) to establish robust DOM selectors and automation strategies for a job-scraping Chrome extension.

**Diagnostics**
The platform utilizes a Next.js framework with dynamic rendering and split-view layout (list on the left, details on the right).

| Feature | Technical Implementation |
| :--- | :--- |
| **Rendering** | Client-side (Next.js) |
| **Pagination** | Infinite scroll on `window` |
| **Detail Loading** | Dynamic update via split-pane |
| **ID Persistence** | UUIDs present in `/apply-with-ai/` links |

**Actionable Findings**
*   **Primary Container:** The job results are housed within `.job-search-results`.
*   **Identify Cards:** Each job entry is a `.rh-list-stack__layers` element. This element uses `aria-label` for descriptive text and contains the necessary click targets.
*   **Deduplication:** Use the UUID found in the card's anchor `href` (e.g., `8e017e61-...`) as the unique key.
*   **Detail Detection:** Monitor `.job-detail-scrollable-content h1` for text changes to confirm the detail pane has updated after a card click.

**Code Fixes**
The following selector object is identified as a potential configuration for the scraper adapter:


`````
js
{
  platform: "Remote Hunter",
  urlMatch: /remotehunter\.com\/jobs/,
  containers: {
    resultsList: ".job-search-results",
    jobCard: ".rh-list-stack__layers",
    clickTarget: ".rh-list-stack__layers a",
    detailPane: ".job-detail-scrollable-content",
    scrollContainer: "window"
  },
  fields: {
    title: [".job-detail-scrollable-content h1"],
    company: [".job-header-box .company-name"],
    jd: [".job-description"],
    expandDescription: [""] // Not required; JD loads fully in pane
  },
  dedupe: {
    primary: "href",
    fallback: "aria-label"
  },
  avoidSelectors: [".jsx-813e08cb7e8bf59f", ".jsx-72110bf09c96a235"] // Hashed Next.js classes
}
`````


**Automation Recommendations**
*   **Wait Strategy:** Implement a listener for the `h1` text content change in the detail pane after clicking a card to ensure the DOM has updated before extraction.
*   **Stability:** Avoid any classes prefixed with `jsx-` as these are generated at build-time and will break on platform updates.
*   **Scrolling:** Perform window-level scrolls to trigger infinite loading; the detail pane requires its own scroll logic for long descriptions.

*Note: The code fixes and findings above were identified on a live page in DevTools. When applying them to your codebase, please adapt them to your project's specific technical stack (e.g., Tailwind CSS classes, CSS modules, framework components) rather than applying them as literal CSS overrides.*