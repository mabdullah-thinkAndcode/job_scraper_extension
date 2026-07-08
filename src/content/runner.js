import { detectAdapter } from "../platforms/registry.js";

// Executed in the page context via chrome.scripting.executeScript.
export function runExtraction() {
  const url = window.location.href;
  // registry.js is bundled/inlined by the build step or imported as ES module
  // if using type: module content scripts (MV3 supports this via chrome.scripting with 'world').
  const adapter = detectAdapter(url, document);
  let raw;
  try {
    raw = adapter.extract(document, url);
  } catch (error) {
    raw = {
      platform: adapter.getDebugInfo?.(document)?.adapter || "Unknown",
      siteLink: url,
      company: "",
      jobTitle: "",
      companyLink: "",
      jd: ""
    };
  }
  const debug = adapter.getDebugInfo ? adapter.getDebugInfo(document) : {};
  return { raw, debug };
}
