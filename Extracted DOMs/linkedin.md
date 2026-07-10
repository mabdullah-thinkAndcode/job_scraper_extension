## Scraping Analysis: LinkedIn Search Results (Blended)

**Context**
Analysis of a LinkedIn blended search results page containing jobs, posts, and people. The goal is to isolate job-specific containers and extraction points for automation.

**Diagnostics**
The current page uses a dynamic, component-based architecture with highly hashed/obfuscated classes. Reliability depends on ARIA roles and internal `componentkey` attributes rather than standard CSS classes.

| Feature | Discovery |
| :--- | :--- |
| **Platform** | LinkedIn (Search Results All) |
| **Page Type** | Hybrid/Blended List (Jobs + Posts + Companies) |
| **Rendering** | Client-rendered (Dynamic) |
| **Scrolling** | Window scroll (Global) |
| **Key Attribute** | `componentkey` (Stable UUID-like identifier) |

**Core Extraction Selectors**
The following selectors were identified based on the rendered DOM:

*   **Results List:** `[role="list"]` (Specifically the one containing job card patterns).
*   **Job Card:** `[role="listitem"][componentkey]`
*   **Click Target:** `a[href*="currentJobId="]`
*   **Job ID Source:** Extracted from the `currentJobId` query parameter in the card's anchor `href`.

**Actionable Recommendations**
Because LinkedIn uses aggressive class obfuscation (e.g., `._75228706`), avoid class-based selection. Use the following strategy for source code implementation:

### 1. Extraction Strategy
Focus on the `currentJobId` parameter as the primary deduplication key. Since the page is a blended result, verify the presence of "Easy Apply" or "Posted" text within the card to distinguish jobs from posts.

### 2. Implementation Example
The following selector object is identified for extraction logic:


`````
js
{
  platform: "LinkedIn Search All",
  urlMatch: /linkedin\.com\/jobs\/search\/\?currentJobId=/,
  containers: {
    resultsList: "[role='main'] [role='list']",
    jobCard: "[role='listitem']",
    clickTarget: "a[href*='currentJobId=']",
    detailPane: "[role='main']", // Note: The detail pane often shares the main role on this view
    scrollContainer: "window",
    loadMoreButton: "button.artdeco-button--muted" 
  },
  fields: {
    title: ["h1", "h2", "[class*='title']"],
    company: ["a[href*='/company/']", ".job-details-panel__company-name"],
    companyLink: ["a[href*='/company/']"],
    jd: ["#job-details", ".jobs-description__container", ".jobs-box__html-content"],
    expandDescription: ["button[aria-label*='Continue reading']"]
  },
  dedupe: {
    primary: "currentJobId",
    fallback: "href"
  },
  detailChangeDetection: {
    primary: "URLSearchParams:currentJobId",
    fallback: "h1.innerText"
  },
  avoidSelectors: ["._75228706", "._3b42afd3", "div > div > div"],
  notes: ["Classes are heavily obfuscated; rely on ARIA roles and href patterns."]
}
`````


**Safe Selectors for Automation**
*   **Preferred:** `[role="listitem"]`, `[componentkey]`, `a[href*="currentJobId"]`.
*   **Avoid:** Any class starting with an underscore (e.g., `._9d763823`) or generic `div` nesting, as these are subject to change during LinkedIn's A/B deployments.

*Note: The code fixes and findings above were identified on a live page in DevTools. When applying them to your codebase, please adapt them to your project's specific technical stack (e.g., Tailwind CSS classes, CSS modules, framework components) rather than applying them as literal CSS overrides.*