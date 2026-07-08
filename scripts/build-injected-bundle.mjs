import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const platformsDir = path.join(rootDir, "src", "platforms");
const outputDir = path.join(rootDir, "src", "injected");
const outputFile = path.join(outputDir, "extractor.bundle.js");

const adapterOrder = [
  "linkedin",
  "indeed",
  "ziprecruiter",
  "monster",
  "glassdoor",
  "hiringcafe",
  "goapplyjobs",
  "remoterocketship",
  "wellfound",
  "paraform",
  "jobright",
  "ladders",
  "slackboard",
  "meeboss",
  "lensa",
  "jobleads",
  "haystack",
  "dice",
  "adzuna",
  "remotehunter",
  "jobcopilot",
  "generic"
];

function transformModule(source) {
  const exported = [];
  const withoutImports = source.replace(/^\s*import\s.+?;\s*$/gm, "");
  const code = withoutImports
    .replace(/export function (\w+)\s*\(/g, (_, name) => {
      exported.push(name);
      return `function ${name}(`;
    })
    .replace(/export const (\w+)\s*=/g, (_, name) => {
      exported.push(name);
      return `const ${name} =`;
    });

  return {
    code: code.trim(),
    exported
  };
}

function buildModule(name) {
  const filePath = path.join(platformsDir, `${name}.js`);
  const source = fs.readFileSync(filePath, "utf8");
  const { code, exported } = transformModule(source);
  return `const ${name} = (() => {\n${code}\nreturn { ${exported.join(", ")} };\n})();`;
}

const moduleBlocks = adapterOrder.map(buildModule).join("\n\n");

const bundle = `(() => {
${moduleBlocks}

const ADAPTERS = [
  ${adapterOrder.join(",\n  ")}
];

function detectAdapter(url, document) {
  for (const adapter of ADAPTERS) {
    try {
      if (adapter.canHandle(url, document)) return adapter;
    } catch (error) {
      continue;
    }
  }
  return generic;
}

function hasCriticalFields(raw) {
  return Boolean(raw && (raw.jobTitle || raw.jd));
}

function safeExtract(adapter, document, url) {
  try {
    return adapter.extract(document, url);
  } catch (error) {
    return null;
  }
}

function runExtraction() {
  const url = window.location.href;
  const adapter = detectAdapter(url, document);
  const raw = safeExtract(adapter, document, url);
  const needsFallback = adapter !== generic && !hasCriticalFields(raw);
  const fallbackRaw = needsFallback ? safeExtract(generic, document, url) : null;
  const finalRaw = needsFallback && hasCriticalFields(fallbackRaw) ? fallbackRaw : raw;
  const debug = adapter.getDebugInfo ? adapter.getDebugInfo(document) : {};

  return {
    raw: finalRaw || {
      platform: adapter === generic ? "Unknown" : debug.adapter || "Unknown",
      siteLink: url,
      company: "",
      jobTitle: "",
      companyLink: "",
      jd: ""
    },
    debug: {
      ...debug,
      detectedAdapter: debug.adapter || "unknown",
      usedGenericFallback: Boolean(needsFallback && fallbackRaw && finalRaw === fallbackRaw),
      hasCriticalFields: hasCriticalFields(finalRaw)
    }
  };
}

window.__JOB_SCRAPER_RUN__ = runExtraction;
})();`;

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputFile, bundle);
console.log(`Wrote ${path.relative(rootDir, outputFile)}`);
