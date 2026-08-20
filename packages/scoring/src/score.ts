// Pipeline orchestrator: N Stage A runs -> per-dimension majority vote -> Stage B.

import type { AnchorLibrary } from "./anchors.js";
import type { Classifier } from "./classify.js";
import { buildSummary, computeScore } from "./engine.js";
import { voteDimension } from "./vote.js";
import type { NormalizedContract, ScoreResult } from "./types.js";
import { DIMENSION_IDS } from "./types.js";

export const STANDARD_CAVEATS = [
  "This score reflects the structural risk of the event type, not live detection of insider activity in this market.",
  "This is not a prediction of the outcome and not trading advice.",
];

export async function scoreContract(
  contract: NormalizedContract,
  lib: AnchorLibrary,
  classifier: Classifier,
  opts: { runs?: number } = {},
): Promise<ScoreResult> {
  const runs = opts.runs ?? 3;
  const results = await Promise.all(Array.from({ length: runs }, () => classifier.classify(contract)));

  const voted = DIMENSION_IDS.map((id) => voteDimension(results.map((r) => r.dimensions[id])));
  const engine = computeScore(voted, lib);

  const caveats = [...STANDARD_CAVEATS];
  for (const d of engine.dimensions) {
    if (d.insufficientInfo) {
      caveats.push(
        `${d.dimension} (${d.name}) could not be determined from the contract text; scored conservatively at level ${d.effectiveLevel}.`,
      );
    }
  }

  return {
    marketId: contract.marketId,
    question: contract.question,
    source: contract.source,
    overallScore: engine.overallScore,
    band: engine.band,
    circuitBreaker: engine.circuitBreaker,
    summary: buildSummary(engine),
    dimensions: engine.dimensions,
    caveats,
    flags: {
      instructionLikeContentDetected: results.some((r) => r.instructionLikeContentDetected),
    },
    metadata: {
      model: classifier.model,
      promptVersion: classifier.promptVersion,
      anchorLibraryVersion: lib.version,
      runs,
      scoredAt: new Date().toISOString(),
    },
  };
}
