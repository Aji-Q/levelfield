// Mirrors the score cache shapes documented in docs/design/no-api.md and defined
// in packages/scoring/src/types.ts. This app reads only the JSON cache (no code
// dependency on the scoring package), so the shapes are duplicated here — keep
// them in sync with that file if the schema changes.

export type DimensionId = "D1" | "D2" | "D3" | "D4" | "D5";
export type Confidence = "high" | "medium" | "low";
export type Band = "low" | "moderate" | "elevated" | "high";
export type CircuitBreaker = "CB-1" | "CB-2" | null;
export type ScoreSource = "dreamdex_testnet" | "curated" | "adhoc";

export interface ScoredDimension {
  dimension: DimensionId;
  name: string;
  level: number | null; // null only when insufficientInfo
  levelLabel: string | null;
  evidenceQuote: string | null;
  reasoning: string;
  confidence: Confidence;
  insufficientInfo: boolean;
  agreement: string; // e.g. "3/3", "2/3"
  weight: number;
  effectiveLevel: number; // after conservative default for insufficient info
}

export interface ScoreResult {
  marketId: string;
  question: string;
  source: ScoreSource;
  overallScore: number; // 0-100
  band: Band;
  circuitBreaker: CircuitBreaker;
  summary: string;
  dimensions: ScoredDimension[];
  caveats: string[];
  flags: { instructionLikeContentDetected: boolean };
  metadata: {
    model: string;
    promptVersion: string;
    anchorLibraryVersion: string;
    runs: number;
    scoredAt: string; // ISO 8601
  };
}

// data/scores/index.json entries carry a few live-market fields (expiry,
// clobStatus, oracleQuestionId) that live outside the per-market ScoreResult.
export interface ScoreIndexEntry {
  marketId: string;
  question: string;
  source: ScoreSource;
  overallScore: number;
  band: Band;
  circuitBreaker: CircuitBreaker;
  summary: string;
  expiry?: string | null;
  clobStatus?: string | null;
  oracleQuestionId?: string | null;
}

export interface ScoreIndex {
  generatedAt: string;
  markets: ScoreIndexEntry[];
}
