// Core types for the two-stage scoring pipeline.
// Stage A (LLM) produces RunClassification labels; Stage B (pure code) produces numbers.

export type DimensionId = "D1" | "D2" | "D3" | "D4" | "D5";
export const DIMENSION_IDS: readonly DimensionId[] = ["D1", "D2", "D3", "D4", "D5"];

export type Level = 1 | 2 | 3 | 4 | 5;
export type Confidence = "high" | "medium" | "low";
export type Band = "low" | "moderate" | "elevated" | "high";

export interface NormalizedContract {
  marketId: string;
  question: string;
  description: string;
  resolutionRules: string;
  closeTime?: string;
  // Venue context for D3 (Insider Tradability): the constraint regime is a property of
  // where the contract trades, not of its text. Unset -> the protocol's offshore default.
  venue?: string;
  source: "dreamdex_testnet" | "curated" | "adhoc";
}

// One dimension's classification from a single Stage A run.
export interface RunClassification {
  dimension: DimensionId;
  level: Level | null; // null only when insufficientInfo
  levelLabel: string | null;
  evidenceQuote: string | null; // verbatim substring of contract text, validated in code
  reasoning: string;
  confidence: Confidence;
  insufficientInfo: boolean;
}

// A full Stage A run: exactly one classification per dimension.
export interface StageARun {
  dimensions: Record<DimensionId, RunClassification>;
  instructionLikeContentDetected: boolean;
}

// Result of majority voting across N runs for one dimension.
export interface VotedDimension extends RunClassification {
  agreement: string; // e.g. "3/3", "2/3", "1/3"
}

export interface ScoredDimension extends VotedDimension {
  name: string;
  weight: number;
  effectiveLevel: Level; // after conservative default for insufficient info
}

export interface ScoreResult {
  marketId: string;
  question: string;
  source: NormalizedContract["source"];
  overallScore: number; // 0-100
  band: Band;
  circuitBreaker: "CB-1" | "CB-2" | null;
  summary: string;
  dimensions: ScoredDimension[];
  caveats: string[];
  flags: { instructionLikeContentDetected: boolean };
  metadata: {
    model: string;
    promptVersion: string; // sha256 of the rendered system prompt
    anchorLibraryVersion: string;
    runs: number;
    scoredAt: string; // ISO 8601
  };
}
