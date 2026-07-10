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
    .replace(/export async function (\w+)\s*\(/g, (_, name) => {
      exported.push(name);
      return `async function ${name}(`;
    })
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

const DEFAULT_BATCH_OPTIONS = {
  minActionDelayMs: 1500,
  maxActionDelayMs: 4500,
  minScrollDelayMs: 1200,
  maxScrollDelayMs: 3500,
  maxJobsPerRun: 50,
  maxIdleScrollRounds: 3,
  detailTimeoutMs: 12000,
  detailPollMs: 350,
  discoveryRetryCount: 3,
  discoveryRetryDelayMs: 900
};

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

function getAcceptanceInfo(raw) {
  const titleLength = raw?.jobTitle?.trim?.().length || 0;
  const jdLength = raw?.jd?.trim?.().length || 0;
  const companyLength = raw?.company?.trim?.().length || 0;
  const siteLinkLength = raw?.siteLink?.trim?.().length || 0;
  const accepted = Boolean(titleLength || jdLength || companyLength);

  return {
    accepted,
    reason: accepted ? "accepted" : "missing-title-company-jd",
    lengths: {
      titleLength,
      jdLength,
      companyLength,
      siteLinkLength
    }
  };
}

function hasCriticalFields(raw) {
  return getAcceptanceInfo(raw).accepted;
}

async function safeExtract(adapter, document, url) {
  try {
    return await adapter.extract(document, url);
  } catch (error) {
    return null;
  }
}

function randomBetween(min, max) {
  const lower = Math.max(0, Number.isFinite(min) ? min : 0);
  const upper = Math.max(lower, Number.isFinite(max) ? max : lower);
  return Math.floor(lower + Math.random() * (upper - lower + 1));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitRandom(min, max) {
  const value = randomBetween(min, max);
  await wait(value);
  return value;
}

function getBatchOptions(options = {}) {
  return {
    ...DEFAULT_BATCH_OPTIONS,
    ...(options || {})
  };
}

function getScrollPosition(scrollContainer) {
  if (scrollContainer === window) {
    return {
      top: window.scrollY,
      height: window.innerHeight,
      scrollHeight: Math.max(
        document.body?.scrollHeight || 0,
        document.documentElement?.scrollHeight || 0
      )
    };
  }

  return {
    top: scrollContainer.scrollTop,
    height: scrollContainer.clientHeight,
    scrollHeight: scrollContainer.scrollHeight
  };
}

function scrollContainerByStep(scrollContainer) {
  const position = getScrollPosition(scrollContainer);
  const step = Math.max(320, Math.floor(position.height * 0.75));

  if (scrollContainer === window) {
    window.scrollTo({
      top: position.top + step,
      behavior: "smooth"
    });
  } else {
    scrollContainer.scrollTo({
      top: position.top + step,
      behavior: "smooth"
    });
  }

  return step;
}

function buildFallbackRaw(adapter, debug, url) {
  return {
    platform: adapter === generic ? "Unknown" : debug.adapter || "Unknown",
    siteLink: url,
    company: "",
    jobTitle: "",
    companyLink: "",
    jd: ""
  };
}

async function runSingleExtraction(url = window.location.href) {
  const adapter = detectAdapter(url, document);
  const debug = adapter.getDebugInfo ? adapter.getDebugInfo(document) : {};
  const raw = await safeExtract(adapter, document, url);
  const allowGenericFallback = debug.allowGenericFallback !== false;
  const needsFallback = adapter !== generic && allowGenericFallback && !hasCriticalFields(raw);
  const fallbackRaw = needsFallback ? await safeExtract(generic, document, url) : null;
  const finalRaw = needsFallback && hasCriticalFields(fallbackRaw) ? fallbackRaw : raw;
  const adapterDebug = finalRaw?._debug || raw?._debug || null;

  return {
    adapter,
    raw: finalRaw || buildFallbackRaw(adapter, debug, url),
    debug: {
      ...debug,
      adapterDebug,
      detectedAdapter: debug.adapter || "unknown",
      allowGenericFallback,
      usedGenericFallback: Boolean(needsFallback && fallbackRaw && finalRaw === fallbackRaw),
      hasCriticalFields: hasCriticalFields(finalRaw)
    }
  };
}

function getCardState(adapter, document) {
  const cards = typeof adapter.getJobCards === "function" ? adapter.getJobCards(document) || [] : [];
  const keyed = [];
  const seen = new Set();

  cards.forEach((card) => {
    let key = "";
    try {
      key = adapter.getCardKey ? adapter.getCardKey(card, document) : "";
    } catch (error) {
      key = "";
    }

    if (!key || seen.has(key)) return;
    seen.add(key);
    keyed.push({ key, card });
  });

  return keyed;
}

async function getCardStateWithRetries(adapter, document, batchOptions, summary) {
  let cardState = [];

  for (let attempt = 0; attempt < batchOptions.discoveryRetryCount; attempt += 1) {
    cardState = getCardState(adapter, document);
    if (cardState.length > 0) {
      if (attempt > 0) {
        summary.discoveryAttempts = attempt + 1;
      }
      return cardState;
    }

    if (attempt < batchOptions.discoveryRetryCount - 1) {
      await wait(batchOptions.discoveryRetryDelayMs);
    }
  }

  summary.discoveryAttempts = batchOptions.discoveryRetryCount;
  return cardState;
}

function getScrollContainer(adapter, document) {
  return typeof adapter.getScrollContainer === "function"
    ? (adapter.getScrollContainer(document) || window)
    : window;
}

function getScrollContainerType(scrollContainer) {
  return scrollContainer === window ? "window" : "element";
}

function getAdapterBatchDebug(adapter, document) {
  try {
    return typeof adapter.getBatchDebugInfo === "function" ? (adapter.getBatchDebugInfo(document) || {}) : {};
  } catch (error) {
    return { debugError: error?.message || "batch-debug-failed" };
  }
}

async function runBatchExtraction(options = {}) {
  const { adapter, debug } = await runSingleExtraction(window.location.href);
  const batchOptions = getBatchOptions(options);
  const initialScrollContainer = getScrollContainer(adapter, document);

  if (!debug.supportsBatch || typeof adapter.getJobCards !== "function" || typeof adapter.openJobCard !== "function") {
    return {
      raw: buildFallbackRaw(adapter, debug, window.location.href),
      rows: [],
      summary: {
        supported: false,
        reason: "Batch crawling is not implemented for this platform yet.",
        adapter: debug.adapter || "unknown"
      },
      debug
    };
  }

  const initialBatchDebug = getAdapterBatchDebug(adapter, document);
  const summary = {
    supported: true,
    adapter: debug.adapter || "unknown",
    discovered: 0,
    processed: 0,
    skipped: 0,
    failed: 0,
    idleScrollRounds: 0,
    stopReason: "completed",
    resultsContainerFound: Boolean(initialBatchDebug.resultsContainerFound),
    initialCardCount: initialBatchDebug.cardCount || 0,
    finalCardCount: initialBatchDebug.cardCount || 0,
    scrollContainerType: getScrollContainerType(initialScrollContainer),
    acceptedRows: 0,
    reasonsRejected: [],
    discoveryAttempts: 1,
    initialBatchDebug
  };

  const rows = [];
  const discoveredKeys = new Set();
  const processedKeys = new Set();
  const failedCards = [];
  let idleRounds = 0;

  while (processedKeys.size < batchOptions.maxJobsPerRun && idleRounds < batchOptions.maxIdleScrollRounds) {
    const cardState = await getCardStateWithRetries(adapter, document, batchOptions, summary);
    let newCardsThisRound = 0;

    cardState.forEach(({ key }) => {
      if (!discoveredKeys.has(key)) {
        discoveredKeys.add(key);
        newCardsThisRound += 1;
      }
    });

    summary.discovered = discoveredKeys.size;
    summary.finalCardCount = cardState.length;

    console.debug("[job-scraper] batch discovery", {
      adapter: summary.adapter,
      resultsContainerFound: summary.resultsContainerFound,
      initialCardCount: summary.initialCardCount,
      currentCardCount: cardState.length,
      scrollContainerType: summary.scrollContainerType,
      discoveryAttempts: summary.discoveryAttempts
    });

    for (const { key, card } of cardState) {
      if (processedKeys.size >= batchOptions.maxJobsPerRun) {
        summary.stopReason = "max-jobs-reached";
        break;
      }

      if (processedKeys.has(key)) continue;
      processedKeys.add(key);

      const cardDiagnostics = {
        key,
        hasClickTarget: true
      };

      try {
        await waitRandom(batchOptions.minActionDelayMs, batchOptions.maxActionDelayMs);

        const previousState = typeof adapter.waitForJobDetailsChange === "function"
          ? (adapter.getCurrentDetailState ? adapter.getCurrentDetailState(document) : null)
          : null;

        cardDiagnostics.previousState = previousState;
        adapter.openJobCard(card, document);

        let detailState = { changed: true, reason: "no-detail-wait-hook" };
        if (typeof adapter.waitForJobDetailsChange === "function") {
          detailState = await adapter.waitForJobDetailsChange(previousState, document, {
            timeoutMs: batchOptions.detailTimeoutMs,
            pollMs: batchOptions.detailPollMs
          });
        }

        cardDiagnostics.detailState = detailState;

        await waitRandom(batchOptions.minActionDelayMs, batchOptions.maxActionDelayMs);

        if (typeof adapter.maybeExpandDescription === "function") {
          adapter.maybeExpandDescription(document);
        }

        const singleResult = await runSingleExtraction(window.location.href);
        const acceptance = getAcceptanceInfo(singleResult.raw);
        cardDiagnostics.extracted = {
          siteLink: singleResult.raw?.siteLink || "",
          lengths: acceptance.lengths,
          adapterDebug: singleResult.debug?.adapterDebug || null
        };

        if (acceptance.accepted) {
          rows.push(singleResult.raw);
          summary.acceptedRows = rows.length;
        } else {
          summary.skipped += 1;
          summary.reasonsRejected.push({
            key,
            reason: acceptance.reason,
            lengths: acceptance.lengths
          });
        }

        summary.processed += 1;

        if (detailState && detailState.changed === false) {
          failedCards.push({
            key,
            reason: detailState.reason || "detail-did-not-change",
            diagnostics: cardDiagnostics
          });
        }

        console.debug("[job-scraper] card result", {
          adapter: summary.adapter,
          key,
          accepted: acceptance.accepted,
          lengths: acceptance.lengths,
          detailChanged: detailState?.changed,
          detailReason: detailState?.reason
        });
      } catch (error) {
        summary.failed += 1;
        failedCards.push({
          key,
          reason: error?.message || "card-processing-failed",
          diagnostics: cardDiagnostics
        });
      }
    }

    if (processedKeys.size >= batchOptions.maxJobsPerRun) {
      summary.stopReason = "max-jobs-reached";
      break;
    }

    const scrollContainer = getScrollContainer(adapter, document);
    const beforeScroll = getScrollPosition(scrollContainer);

    if (typeof adapter.loadMoreIfNeeded === "function") {
      try {
        adapter.loadMoreIfNeeded(document);
      } catch (error) {
        // Ignore load-more failures and keep crawling.
      }
    }

    scrollContainerByStep(scrollContainer);
    await waitRandom(batchOptions.minScrollDelayMs, batchOptions.maxScrollDelayMs);

    const afterScrollState = getCardState(adapter, document);
    const discoveredAfterScroll = afterScrollState.filter(({ key }) => !discoveredKeys.has(key));
    const afterScroll = getScrollPosition(scrollContainer);
    const scrollGrowthDetected = afterScroll.scrollHeight > beforeScroll.scrollHeight || afterScroll.top > beforeScroll.top + 8;

    summary.finalCardCount = afterScrollState.length;
    summary.scrollGrowthDetected = scrollGrowthDetected;

    console.debug("[job-scraper] scroll step", {
      adapter: summary.adapter,
      beforeScroll,
      afterScroll,
      discoveredAfterScroll: discoveredAfterScroll.length,
      scrollGrowthDetected
    });

    if (discoveredAfterScroll.length === 0) {
      idleRounds += 1;
      summary.idleScrollRounds = idleRounds;

      if (
        ((typeof adapter.hasReachedEnd === "function") && adapter.hasReachedEnd(document))
        || !scrollGrowthDetected
      ) {
        summary.stopReason = "reached-end";
        break;
      }
    } else {
      idleRounds = 0;
      summary.idleScrollRounds = 0;
    }
  }

  if (idleRounds >= batchOptions.maxIdleScrollRounds) {
    summary.stopReason = "max-idle-scroll-rounds";
  }

  summary.finalBatchDebug = getAdapterBatchDebug(adapter, document);

  return {
    raw: rows[rows.length - 1] || buildFallbackRaw(adapter, debug, window.location.href),
    rows,
    summary: {
      ...summary,
      failedCards
    },
    debug
  };
}

async function runExtraction(options = {}) {
  const mode = options?.mode === "batch" ? "batch" : "single";
  return mode === "batch" ? runBatchExtraction(options) : runSingleExtraction(window.location.href);
}

window.__JOB_SCRAPER_RUN__ = runExtraction;
})();`;

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputFile, bundle);
console.log(`Wrote ${path.relative(rootDir, outputFile)}`);
