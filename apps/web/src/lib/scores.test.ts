import { describe, expect, it } from "vitest";
import {
  getOnchainProvenanceStatus,
  type OnchainSnapshot,
  type OnchainSnapshotMarket,
} from "./scores.js";
import type { ScoreIndex } from "./types.js";

function currentIndex(ids: string[]): Pick<ScoreIndex, "markets"> {
  return {
    markets: ids.map((marketId) => ({
      marketId,
      question: "Test contract",
      source: "curated",
      overallScore: 50,
      band: "moderate",
      circuitBreaker: null,
      summary: "Test score",
    })),
  };
}

function attestation(overrides: Partial<OnchainSnapshotMarket> = {}): OnchainSnapshotMarket {
  return {
    score: 50,
    band: "moderate",
    dims: [1, 1, 1, 1, 1],
    methodHash: "0xmethod",
    scoredAt: "2026-01-01T00:00:00.000Z",
    uri: "https://github.com/LevelField/levelfield/blob/main/data/scores/test.json",
    matchesCache: true,
    ...overrides,
  };
}

function snapshot(markets: Record<string, OnchainSnapshotMarket>): OnchainSnapshot {
  return {
    registryAddress: "0x0000000000000000000000000000000000000000",
    chainId: 50312,
    explorerBase: "https://shannon-explorer.somnia.network",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    markets,
  };
}

describe("getOnchainProvenanceStatus", () => {
  it("is complete for every current indexed market, ignoring stale orphan rows", () => {
    const status = getOnchainProvenanceStatus(
      snapshot({
        current_a: attestation(),
        current_b: attestation(),
        // A historical orphan is intentionally not part of the current release check.
        old_orphan: attestation({ uri: undefined, matchesCache: false }),
      }),
      currentIndex(["current_a", "current_b"]),
    );

    expect(status).toMatchObject({
      state: "complete",
      indexedCount: 2,
      indexedAttestationCount: 2,
      indexedMatchCount: 2,
      missingAttestationCount: 0,
      invalidUriCount: 0,
      unmatchedCount: 0,
    });
  });

  it("is legacy when a current indexed score is absent, even if an orphan is present", () => {
    const status = getOnchainProvenanceStatus(
      snapshot({
        current_a: attestation(),
        old_orphan: attestation(),
      }),
      currentIndex(["current_a", "current_b"]),
    );

    expect(status).toMatchObject({
      state: "legacy",
      indexedCount: 2,
      indexedAttestationCount: 1,
      indexedMatchCount: 1,
      missingAttestationCount: 1,
      invalidUriCount: 0,
      unmatchedCount: 0,
    });
  });

  it("is legacy when any current attestation does not explicitly match the cache", () => {
    const status = getOnchainProvenanceStatus(
      snapshot({
        current_a: attestation(),
        current_b: attestation({ matchesCache: false }),
      }),
      currentIndex(["current_a", "current_b"]),
    );

    expect(status).toMatchObject({
      state: "legacy",
      indexedMatchCount: 1,
      unmatchedCount: 1,
    });
  });

  it("is legacy when a current attestation has a placeholder or missing source URI", () => {
    const status = getOnchainProvenanceStatus(
      snapshot({
        current_a: attestation({ uri: "https://github.com/OWNER/REPO/blob/main/SCORE.json" }),
        current_b: attestation({ uri: undefined }),
      }),
      currentIndex(["current_a", "current_b"]),
    );

    expect(status).toMatchObject({
      state: "legacy",
      invalidUriCount: 2,
      missingAttestationCount: 0,
      unmatchedCount: 0,
    });
  });
});
