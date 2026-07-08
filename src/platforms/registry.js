import * as generic from "./generic.js";
import * as linkedin from "./linkedin.js";
import * as indeed from "./indeed.js";
import * as ziprecruiter from "./ziprecruiter.js";
import * as monster from "./monster.js";
import * as glassdoor from "./glassdoor.js";
import * as hiringcafe from "./hiringcafe.js";
import * as goapplyjobs from "./goapplyjobs.js";
import * as remoterocketship from "./remoterocketship.js";
import * as wellfound from "./wellfound.js";
import * as paraform from "./paraform.js";
import * as jobright from "./jobright.js";
import * as ladders from "./ladders.js";
import * as slackboard from "./slackboard.js";
import * as meeboss from "./meeboss.js";
import * as lensa from "./lensa.js";
import * as jobleads from "./jobleads.js";
import * as haystack from "./haystack.js";
import * as dice from "./dice.js";
import * as adzuna from "./adzuna.js";
import * as remotehunter from "./remotehunter.js";
import * as jobcopilot from "./jobcopilot.js";

// Ordered list of adapters. First adapter whose canHandle() returns true wins.
// generic.js is the fallback and must stay last.
export const ADAPTERS = [
  linkedin,
  indeed,
  ziprecruiter,
  monster,
  glassdoor,
  hiringcafe,
  goapplyjobs,
  remoterocketship,
  wellfound,
  paraform,
  jobright,
  ladders,
  slackboard,
  meeboss,
  lensa,
  jobleads,
  haystack,
  dice,
  adzuna,
  remotehunter,
  jobcopilot,
  generic
];

export function detectAdapter(url, document) {
  for (const adapter of ADAPTERS) {
    try {
      if (adapter.canHandle(url, document)) return adapter;
    } catch (e) {
      // Skip adapter if canHandle throws (defensive)
      continue;
    }
  }
  return generic;
}
