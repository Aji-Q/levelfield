import type { Band, CircuitBreaker } from "./types";

// Monochrome gray -> amber scale, per the design language: no red/green, the
// band word is always printed next to the number so color is never load-bearing.
export const BAND_LABEL: Record<Band, string> = {
  low: "low",
  moderate: "moderate",
  elevated: "elevated",
  high: "high",
};

export function weightPct(weight: number): string {
  return `${Math.round(weight * 100)}%`;
}

export const CIRCUIT_BREAKER_EXPLANATION: Record<Exclude<CircuitBreaker, null>, string> = {
  "CB-1":
    "CB-1: this market's outcome is decided by one person who faces no effective restriction on trading it, so the score is floored at 90 regardless of the other four dimensions.",
  "CB-2":
    "CB-2: this market's outcome could be manufactured unilaterally by someone free to trade it, so the score is floored at 85 regardless of the other four dimensions.",
};

// Per-market deep links (questions/{oracleQuestionId}) are deliberately not used: the
// indexer's oracleQuestionId pointed at unrelated questions 3/3 times in live sampling
// (docs/research-dreamdex.md §4, FEEDBACK.md #6). Root link only until that's fixed.
export const ORACLE_EXPLORER_ROOT = "https://prd.oracle.somnia.host/explore";
