// Server-side reads of the score cache (data/scores/). No network at request
// time — see docs/design/no-api.md, "Score cache". The batch scorer owns
// writing this directory; this app only reads it.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { findRepoRoot } from "./repo-root";
import type { ScoreIndex, ScoreResult } from "./types";

function scoresDir(): string {
  return path.join(findRepoRoot(), "data", "scores");
}

export function readScoreIndex(): ScoreIndex {
  const file = path.join(scoresDir(), "index.json");
  if (!existsSync(file)) return { generatedAt: new Date(0).toISOString(), markets: [] };
  return JSON.parse(readFileSync(file, "utf8")) as ScoreIndex;
}

// marketId reaches us from a URL param; keep the file lookup to the same
// charset the batch scorer uses for filenames so it can never escape scoresDir().
const SAFE_MARKET_ID = /^[a-zA-Z0-9_-]+$/;

export function readScoreResult(marketId: string): ScoreResult | null {
  if (!SAFE_MARKET_ID.test(marketId)) return null;
  const file = path.join(scoresDir(), `${marketId}.json`);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8")) as ScoreResult;
}

// On-chain attestation snapshot written by scripts/verify-onchain.ts (reads every
// attestation back from the ScoreRegistry on Somnia Shannon and cross-checks it
// against this cache). Same no-network-at-request-time rule as everything else here.
export interface OnchainSnapshot {
  registryAddress: string;
  chainId: number;
  explorerBase: string;
  verifiedAt: string;
  markets: Record<
    string,
    { score: number; band: string; dims: number[]; methodHash: string; scoredAt: string; matchesCache: boolean }
  >;
}

export function readOnchainSnapshot(): OnchainSnapshot | null {
  const file = path.join(scoresDir(), "onchain.json");
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8")) as OnchainSnapshot;
}
