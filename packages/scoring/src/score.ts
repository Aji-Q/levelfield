// Pipeline orchestrator: N Stage A runs -> per-dimension majority vote -> Stage B.

import type { AnchorLibrary } from "./anchors.js";
import { renderContractData } from "./anchors.js";
import type { Classifier } from "./classify.js";
import { buildSummary, computeScore } from "./engine.js";
import { classificationConsistencyError, quoteOverlapsInjection, scanForInstructionLikeContent } from "./verify.js";
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

  // Code-level injection defense, independent of any classifier's judgment: scan the
  // contract text itself, and disqualify evidence that overlaps an instruction-like
  // sentence (demoted to the conservative insufficient-info path, never trusted).
  const scan = scanForInstructionLikeContent(renderContractData(contract));
  const voted = DIMENSION_IDS.map((id) => voteDimension(results.map((r) => r.dimensions[id]))).map((v) => {
    // A third-party Classifier implementation can bypass the provider-specific
    // parser. Normalize any contradictory nullable fields before score output so
    // neither a low level nor its evidence survives an insufficient-info state.
    if (classificationConsistencyError(v)) {
      return { ...v, level: null, levelLabel: null, evidenceQuote: null, insufficientInfo: true, confidence: "low" as const };
    }
    return v.evidenceQuote !== null && quoteOverlapsInjection(v.evidenceQuote, scan)
      ? { ...v, level: null, levelLabel: null, evidenceQuote: null, insufficientInfo: true, confidence: "low" as const }
      : v;
  });
  const engine = computeScore(voted, lib);

  const caveats = [...STANDARD_CAVEATS];
  if (scan.detected) {
    caveats.push(
      "Instruction-like content addressed at automated assessors was detected in the contract text; it was ignored for classification and disqualified as evidence.",
    );
  }
  caveats.push(...engine.notes);
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
      // OR of the model runs' judgment and the code-level scan: a complying host model
      // that suppresses the flag cannot suppress the scanner.
      instructionLikeContentDetected: scan.detected || results.some((r) => r.instructionLikeContentDetected),
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
