## Platform Analysis: HiringCafe

**Context**
HiringCafe is an AI-powered job search platform using a modern React/Chakra UI stack. The interface follows a "results grid" pattern that opens job details in a side-drawer/modal overlay when a card is clicked.

**Diagnostics**
*   **Rendering:** Client-side rendered (Next.js/Chakra UI).
*   **Navigation:** Uses a hybrid approach where clicking a card opens a modal and updates the URL with a job slug without a full page reload.
*   **Structure:**
    *   **Results:** A responsive CSS grid.
    *   **Details:** A `chakra-modal` component that slides in from the side/bottom.
*   **URL Pattern:** The job ID is captured in the slug following `/job/`.

**Actionable Findings**

| Component | Technical Identifier |
| :--- | :--- |
| **Results List** | `div.grid.grid-cols-1.md\:grid-cols-2` |
| **Job Card** | `div.relative.bg-white.rounded-xl.border` |
| **Detail Pane** | `div.chakra-modal__content[role="dialog"]` |
| **Job ID Source** | URL slug or `a[href*="/job/"]` attribute |

### Extraction Strategy & Code Fixes

#### 1. Core Containers
The results list uses dynamic tailwind-style grid classes. Use the specific combination of background and border classes to isolate job cards from decorative elements.


`````
js
// Target the main job card
const jobCardSelector = 'div.relative.bg-white.rounded-xl.border';

// Target the clickable area that triggers the detail pane
const cardClickTarget = '.cursor-pointer'; 
`````


#### 2. Detail Field Extraction
Once the modal is active, fields are nested within Chakra-specific classes.

| Field | Selector | Note |
| :--- | :--- | :--- |
| **Title** | `.chakra-modal__body .font-bold`, `h2` | Usually the largest bold text in the body |
| **Company** | `a[href*="/org/"]` | Links to the organization profile |
| **Description** | `.chakra-modal__body` | Contains the full text; look for "Responsibilities" headers |
| **Dedupe Key** | `window.location.pathname` | Extract the unique slug from `/job/{ID}` |

#### 3. Automation Recommendations
The following object is optimized for an automated adapter. It avoids hashed classes in favor of structural and attribute-based selectors.


`````
js
{
  platform: "HiringCafe",
  urlMatch: /hiring\.cafe\/job\/.+/,
  containers: {
    resultsList: "div.grid.gap-y-12",
    jobCard: "div.relative.bg-white.rounded-xl.border",
    clickTarget: ".cursor-pointer",
    detailPane: ".chakra-modal__content",
    scrollContainer: "window",
    loadMoreButton: null // Uses infinite scroll
  },
  fields: {
    title: [".chakra-modal__header .font-bold", "h2"],
    company: ["a[href*='/org/']"],
    companyLink: ["a[href*='/org/']"],
    jd: [".chakra-modal__body"],
    expandDescription: [] // Content is fully expanded in modal
  },
  dedupe: {
    primary: "href",
    fallback: "currentJobId"
  },
  detailChangeDetection: {
    primary: "window.location.href"
  },
  avoidSelectors: [".css-1o3pyl4", ".css-hdd9l7"], // Avoid Chakra-generated emotion classes
  notes: ["Ensure modal is visible before extraction", "Clicking the card background triggers the modal"]
}

`````


**Implementation Guidance**
*   **Wait Strategy:** When clicking a card, wait for `.chakra-modal__content` to be visible (approx. 300-500ms).
*   **Loading:** The site uses infinite scroll. Monitor the `childCount` of the results grid to detect when new batches are appended.
*   **Avoid:** Do not use `button:contains()` as it is not a standard CSS selector; use `Array.from(document.querySelectorAll('button')).find(...)` instead.

*Note: The code fixes and findings above were identified on a live page in DevTools. When applying them to your codebase, please adapt them to your project's specific technical stack (e.g., Tailwind CSS classes, CSS modules, framework components) rather than applying them as literal CSS overrides.*