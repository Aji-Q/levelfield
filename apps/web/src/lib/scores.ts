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
export interface OnchainSnapshotMarket {
  score: number;
  band: string;
  dims: number[];
  methodHash: string;
  scoredAt: string;
  /**
   * A source record must be present before the UI calls this attestation
   * verified. Older snapshots did not persist it and are intentionally
   * rendered as legacy provenance rather than as a current match.
   */
  uri?: string;
  matchesCache?: boolean;
}

export interface OnchainSnapshot {
  registryAddress: string;
  chainId: number;
  explorerBase: string;
  verifiedAt: string;
  markets: Record<string, OnchainSnapshotMarket>;
}

export type OnchainProvenanceState = "complete" | "legacy" | "unavailable";

export interface OnchainProvenanceStatus {
  state: OnchainProvenanceState;
  /** Number of scores currently exposed by the web index. */
  indexedCount: number;
  /** Current indexed scores that have an on-chain snapshot entry. */
  indexedAttestationCount: number;
  /** Current indexed scores whose snapshot entry matches the cache. */
  indexedMatchCount: number;
  /** Current indexed scores that have no corresponding snapshot entry. */
  missingAttestationCount: number;
  /** Current indexed attestation rows that lack a usable source URI. */
  invalidUriCount: number;
  /** Current indexed attestation rows that do not explicitly match the cache. */
  unmatchedCount: number;
}

const PLACEHOLDER_PROVENANCE = /(?:placeholder|replace[_-]?me|your[_-]?(?:repo|org)|owner\/repo|example)/i;

/**
 * A snapshot URI is provenance only when it is a real HTTPS URL and not a
 * placeholder. This check deliberately sits in the UI data boundary so stale
 * JSON cannot turn an unproven cache claim into a green status in the product.
 */
export function isValidProvenanceUri(uri: unknown): uri is string {
  if (typeof uri !== "string" || uri.trim().length === 0 || PLACEHOLDER_PROVENANCE.test(uri)) {
    return false;
  }
  try {
    const parsed = new URL(uri);
    return parsed.protocol === "https:" && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

/**
 * Inspect provenance against the current score index. Orphaned historical
 * rows never influence the result: only market IDs in index.json are checked.
 * A snapshot is complete only when every current score has an attestation that
 * explicitly matches the cache and links to a valid, non-placeholder source
 * record. Anything less is legacy, so the UI fails closed until
 * verify-onchain writes a complete new snapshot.
 */
export function getOnchainProvenanceStatus(
  snapshot: OnchainSnapshot | null,
  index: Pick<ScoreIndex, "markets">,
): OnchainProvenanceStatus {
  const indexedIds = [...new Set(index.markets.map((market) => market.marketId))];
  const indexedCount = indexedIds.length;

  if (!snapshot || indexedCount === 0) {
    return {
      state: "unavailable",
      indexedCount,
      indexedAttestationCount: 0,
      indexedMatchCount: 0,
      missingAttestationCount: 0,
      invalidUriCount: 0,
      unmatchedCount: 0,
    };
  }

  // Iterate from the authoritative current index, not from the snapshot.
  // This deliberately ignores stale/orphaned historical snapshot rows.
  const currentAttestations = indexedIds.map((marketId) => ({
    marketId,
    attestation: snapshot.markets[marketId],
  }));
  // A malformed runtime row is treated exactly like a missing attestation;
  // parsing it must never create a green provenance state or crash the page.
  const attested = currentAttestations.filter(({ attestation }) => isRecord(attestation));
  const missingAttestationCount = indexedCount - attested.length;
  const invalidUriCount = attested.filter(({ attestation }) => !isValidProvenanceUri(attestation.uri)).length;
  const indexedMatchCount = attested.filter(({ attestation }) => attestation.matchesCache === true).length;
  const unmatchedCount = attested.length - indexedMatchCount;
  const complete =
    missingAttestationCount === 0 &&
    invalidUriCount === 0 &&
    unmatchedCount === 0;

  return {
    state: complete ? "complete" : "legacy",
    indexedCount,
    indexedAttestationCount: attested.length,
    indexedMatchCount,
    missingAttestationCount,
    invalidUriCount,
    unmatchedCount,
  };
}

export function readOnchainSnapshot(): OnchainSnapshot | null {
  const file = path.join(scoresDir(), "onchain.json");
  if (!existsSync(file)) return null;
  const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
  if (
    !isRecord(parsed) ||
    !Object.hasOwn(parsed, "markets") ||
    !isRecord(parsed.markets) ||
    typeof parsed.registryAddress !== "string" ||
    typeof parsed.chainId !== "number" ||
    typeof parsed.explorerBase !== "string" ||
    typeof parsed.verifiedAt !== "string"
  ) {
    return null;
  }
  return {
    registryAddress: parsed.registryAddress,
    chainId: parsed.chainId,
    explorerBase: parsed.explorerBase,
    verifiedAt: parsed.verifiedAt,
    // Invalid rows are discarded here and therefore become missing current
    // attestations in the provenance status rather than unsafe UI data.
    markets: Object.fromEntries(
      Object.entries(parsed.markets).filter(
        (entry): entry is [string, OnchainSnapshotMarket] => isOnchainSnapshotMarket(entry[1]),
      ),
    ),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOnchainSnapshotMarket(value: unknown): value is OnchainSnapshotMarket {
  return (
    isRecord(value) &&
    typeof value.score === "number" &&
    typeof value.band === "string" &&
    Array.isArray(value.dims) &&
    value.dims.every((dimension) => typeof dimension === "number") &&
    typeof value.methodHash === "string" &&
    typeof value.scoredAt === "string" &&
    (value.uri === undefined || typeof value.uri === "string") &&
    (value.matchesCache === undefined || typeof value.matchesCache === "boolean")
  );
}
