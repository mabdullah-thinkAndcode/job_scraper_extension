## Scraping Analysis: Lensa Job Board

**Context**
Analysis of the Lensa job opportunities page to identify DOM structures and selectors for automated data extraction. The page utilizes a hybrid two-pane layout (Svelte-based) where a left-side list updates a right-side detail pane.

**Diagnostics**
The following technical markers were identified for the automation environment:

| Category | Finding |
| :--- | :--- |
| **Platform** | Lensa (Svelte Framework) |
| **Layout Type** | Hybrid List + Detail (Split-screen) |
| **Pagination** | Infinite Scroll (Nested container) |
| **Deduplication** | Unique Hash IDs (e.g., `7701e4...`) |

**Core Selectors**
The following selectors were identified for the scraping adapter:

| Target | Selector |
| :--- | :--- |
| **Results List** | `.job-list` |
| **Job Card** | `.job-list-item` |
| **Click Target** | `.job-list-item__inside` |
| **Detail Pane** | `.job-details-card` |
| **Job Title** | `.job-header-title` |
| **Company Link** | `.company-wrapper__content__link` |
| **Description** | `.job-description__text` |

**Actionable Findings**
*   **Scrolling:** Automated scrolling must be targeted at the `.job-list` container rather than the window object, as it is a nested scroll area.
*   **Change Detection:** Monitor the `id` attribute of the `.job-details-card` to verify the UI has updated after a card click.
*   **Selector Safety:** Avoid utility classes (e.g., `.mng34os...`) and Svelte-scoped classes (e.g., `.svelte-yxesf8`) as these are unstable and change between builds.
*   **Data Deduplication:** Use the alphanumeric hash found in the `.job-list-item__inside` ID as a stable primary key.

**Adapter Configuration**
The following object is identified as a potential configuration for the automation adapter:


`````
js
{
  platform: "Lensa",
  urlMatch: /lensa\.com\/talent\/job-opportunities/,
  containers: {
    resultsList: ".job-list",
    jobCard: ".job-list-item",
    clickTarget: ".job-list-item__inside",
    detailPane: ".job-details-card",
    scrollContainer: ".job-list"
  },
  fields: {
    title: [".job-header-title", ".job-header h2"],
    company: [".company-wrapper__content__link"],
    jd: [".job-description__text"],
    expandDescription: [".show-more"]
  },
  dedupe: {
    primary: "id" // Extracted from .job-list-item__inside
  },
  avoidSelectors: [".svelte-[a-z0-9]+", ".mng[a-z0-9]+"]
}
`````

*Note: The code fixes and findings above were identified on a live page in DevTools. When applying them to your codebase, please adapt them to your project's specific technical stack (e.g., Tailwind CSS classes, CSS modules, framework components) rather than applying them as literal CSS overrides.*