// Majority voting across N independent Stage A runs, per dimension.
// Disagreement never averages: it downgrades confidence and resolves conservatively
// (toward higher risk), mirroring the conservative-default principle.

import type { Confidence, RunClassification, VotedDimension } from "./types.js";

const CONFIDENCE_ORDER: Confidence[] = ["high", "medium", "low"];

function downgrade(c: Confidence): Confidence {
  const i = CONFIDENCE_ORDER.indexOf(c);
  return CONFIDENCE_ORDER[Math.min(i + 1, CONFIDENCE_ORDER.length - 1)];
}

// Key for grouping: null level (insufficient info) is its own bucket.
const levelKey = (r: RunClassification) => (r.level === null ? "null" : String(r.level));

export function voteDimension(runs: RunClassification[]): VotedDimension {
  if (runs.length === 0) throw new Error("voteDimension called with zero runs");

  const buckets = new Map<string, RunClassification[]>();
  for (const r of runs) {
    const k = levelKey(r);
    buckets.set(k, [...(buckets.get(k) ?? []), r]);
  }

  const majorityThreshold = Math.floor(runs.length / 2) + 1;
  const majority = [...buckets.values()].find((b) => b.length >= majorityThreshold);

  if (majority) {
    const rep = majority[0];
    const unanimous = majority.length === runs.length;
    return {
      ...rep,
      confidence: unanimous ? rep.confidence : downgrade(rep.confidence),
      agreement: `${majority.length}/${runs.length}`,
    };
  }

  // No majority: resolve to the most conservative bucket. null (insufficient info)
  // counts as the conservative-default level 4 for comparison purposes.
  const conservativeValue = (r: RunClassification) => r.level ?? 4;
  const rep = [...runs].sort((a, b) => conservativeValue(b) - conservativeValue(a))[0];
  return { ...rep, confidence: "low", agreement: `1/${runs.length}` };
}
