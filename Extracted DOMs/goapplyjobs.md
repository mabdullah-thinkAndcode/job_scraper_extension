## Automation Extraction Report: GoApplyJob

**Context**
Analysis of GoApplyJob search results for automated job scraping. The platform uses a list-based architecture with separate detail pages and numeric pagination.

**Diagnostics**
The platform employs client-side rendering (Next.js/React) and includes anti-scraping measures like randomized inline `<span>` elements within text nodes.

| Feature | Discovery |
| :--- | :--- |
| **Platform** | GoApplyJob |
| **Page Type** | Results List (Pagination-based) |
| **Primary Identifier** | `data-testid` containing job ID |
| **Navigation** | Standard anchor tags to external detail pages |

**Actionable Findings**
*   **Anti-Scraping Spans:** The DOM contains randomized classes (e.g., `mng34os6mrg4t3be97`) inside job titles and company names to disrupt text extraction. 
*   **Deduplication:** The `data-testid` attribute on the card container (e.g., `job-card-stack-875550`) provides a stable unique ID.
*   **Content Extraction:** Use `.innerText` rather than `.innerHTML` or `.textContent` to filter out hidden anti-bot spans effectively.

**Extraction Strategy**
1.  Verify the presence of `#job-listings`.
2.  Iterate through `[data-testid^="job-card-stack-"]` elements.
3.  Cleanse text data from `h2` and company links by accessing `innerText`.
4.  Execute pagination via the `button[aria-label="Next page"]` selector.

**Adapter-Ready Selector Object**
The following configuration identifies the necessary DOM elements for automation.


`````
js
{
  platform: "GoApplyJob",
  urlMatch: /goapplyjob\.online\/remote-jobs/,
  containers: {
    resultsList: "#job-listings",
    jobCard: "[data-testid^='job-card-stack-']",
    clickTarget: "h2 a",
    detailPane: "main article",
    scrollContainer: "window",
    loadMoreButton: "button[aria-label='Next page']"
  },
  fields: {
    title: ["h2"],
    company: ["a[href^='/companies/']:not(:has(img))"],
    companyLink: ["a[href^='/companies/']"],
    jd: [".line-clamp-2", ".prose"],
    expandDescription: ["a[aria-label^='View details']"]
  },
  dedupe: {
    primary: "data-testid",
    fallback: "href"
  },
  avoidSelectors: [
    "span[class*='mng']", 
    "span[class*='ml8']"
  ],
  notes: [
    "Cleanse text nodes of randomized spans to ensure data integrity.",
    "Pagination is required; infinite scroll is not implemented.",
    "The 'Apply' button uses an outbound redirect pattern: a[href^='/out?to=']"
  ]
}
`````

*Note: The code fixes and findings above were identified on a live page in DevTools. When applying them to your codebase, please adapt them to your project's specific technical stack (e.g., Tailwind CSS classes, CSS modules, framework components) rather than applying them as literal CSS overrides.*