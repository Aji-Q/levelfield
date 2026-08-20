import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { promisify } from "node:util";
import path from "node:path";

import { readJson, serializeJson } from "./files.mjs";

const execFileAsync = promisify(execFile);
const COMMIT_SHA = /^[0-9a-f]{40}$/i;
const PLACEHOLDER = /(?:placeholder|replace[_-]?me|your[_-]?(?:repo|org)|owner\/repo|example)/i;

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function marketIds(index) {
  if (!isRecord(index) || !Array.isArray(index.markets)) return [];
  return [...new Set(index.markets
    .map((market) => isRecord(market) && typeof market.marketId === "string" ? market.marketId : null)
    .filter(Boolean))];
}

export function isImmutableGitHubUri(uri) {
  if (typeof uri !== "string" || uri.trim().length === 0 || PLACEHOLDER.test(uri)) return false;
  try {
    const parsed = new URL(uri);
    if (parsed.protocol !== "https:" || parsed.hostname.toLowerCase() !== "github.com") return false;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 5 || parts[2] !== "blob" || !COMMIT_SHA.test(parts[3])) return false;
    const [owner, repo] = parts;
    if (!owner || !repo || /^(?:owner|org|repo|your[_-]?org|your[_-]?repo)$/i.test(owner) || /^(?:repo|example)$/i.test(repo)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function getProvenanceStatus(index, onchain) {
  const indexedIds = marketIds(index);
  if (!isRecord(onchain) || !isRecord(onchain.markets) || indexedIds.length === 0) {
    return {
      state: "unavailable",
      indexedCount: indexedIds.length,
      indexedAttestationCount: 0,
      indexedMatchCount: 0,
      missingAttestationCount: indexedIds.length,
      invalidUriCount: 0,
      unmatchedCount: 0,
    };
  }

  const attested = indexedIds.map((marketId) => onchain.markets[marketId]).filter(isRecord);
  const indexedAttestationCount = attested.length;
  const missingAttestationCount = indexedIds.length - indexedAttestationCount;
  const invalidUriCount = attested.filter((attestation) => !isImmutableGitHubUri(attestation.uri)).length;
  const indexedMatchCount = attested.filter((attestation) => attestation.matchesCache === true).length;
  const unmatchedCount = indexedAttestationCount - indexedMatchCount;
  const complete = missingAttestationCount === 0 && invalidUriCount === 0 && unmatchedCount === 0;

  return {
    state: complete ? "complete" : "legacy",
    indexedCount: indexedIds.length,
    indexedAttestationCount,
    indexedMatchCount,
    missingAttestationCount,
    invalidUriCount,
    unmatchedCount,
  };
}

export async function readGitHead(repoRoot) {
  const { stdout } = await execFileAsync("git", ["-C", repoRoot, "rev-parse", "HEAD"]);
  const head = stdout.trim();
  if (!COMMIT_SHA.test(head)) throw new Error(`git returned an invalid HEAD: ${JSON.stringify(head)}.`);
  return head;
}

function asIsoTimestamp(value, label) {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) {
    throw new Error(`${label} must be an ISO timestamp.`);
  }
  return new Date(value).toISOString();
}

export async function collectEvidenceFacts({ repoRoot, head, capturedAt = new Date().toISOString() }) {
  const scoresDir = path.join(repoRoot, "data", "scores");
  const index = await readJson(path.join(scoresDir, "index.json"));
  const onchainPath = path.join(scoresDir, "onchain.json");
  const onchain = existsSync(onchainPath) ? await readJson(onchainPath) : null;
  const evidenceSha = head ?? await readGitHead(repoRoot);
  if (!COMMIT_SHA.test(evidenceSha)) throw new Error(`Evidence SHA must be a 40-character commit SHA.`);
  if (!isRecord(index) || !Array.isArray(index.markets)) throw new Error("Score index must contain a markets array.");

  const dreamdexMarketIds = index.markets
    .filter((market) => isRecord(market) && market.source === "dreamdex_testnet" && typeof market.marketId === "string")
    .map((market) => market.marketId);
  const curatedMarketIds = index.markets
    .filter((market) => isRecord(market) && market.source === "curated" && typeof market.marketId === "string")
    .map((market) => market.marketId);
  const status = getProvenanceStatus(index, onchain);

  return {
    schemaVersion: 1,
    capturedAt: asIsoTimestamp(capturedAt, "capturedAt"),
    evidenceSha: evidenceSha.toLowerCase(),
    scoreCache: {
      label: "timestamped_snapshot",
      generatedAt: asIsoTimestamp(index.generatedAt, "score index generatedAt"),
      dreamdexMarketIds,
      curatedMarketIds,
    },
    provenance: {
      ...status,
      registryAddress: isRecord(onchain) && typeof onchain.registryAddress === "string" ? onchain.registryAddress : null,
      chainId: isRecord(onchain) && typeof onchain.chainId === "number" ? onchain.chainId : null,
      verifiedAt: isRecord(onchain) && typeof onchain.verifiedAt === "string" ? onchain.verifiedAt : null,
    },
  };
}

export function serializeFacts(facts) {
  return serializeJson(facts);
}
