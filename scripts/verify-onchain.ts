/**
 * Reads every current score-cache attestation back from ScoreRegistry on Somnia Shannon
 * and verifies every field against the local cache. A new data/scores/onchain.json is
 * written only after a complete match, so the web app never receives a fresh-but-invalid
 * verification snapshot.
 *
 *   GITHUB_REPO=owner/repo GITHUB_REF=<commit-sha> REGISTRY_ADDRESS=0x... npx tsx scripts/verify-onchain.ts
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, http, isAddress, keccak256, toBytes, type Hex } from "viem";
import { somniaShannon } from "@somnia-chain/markets-sdk/chains";
import { DIMENSION_IDS, type Band, type ScoreResult } from "@levelfield/scoring";
import { githubScoreUri, resolveGitHubProvenance } from "./github-provenance.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, "..");
const scoresDir = path.join(repoRoot, "data/scores");
const scoresIndexPath = path.join(scoresDir, "index.json");

const registryAddressEnv = process.env.REGISTRY_ADDRESS?.trim() ?? "0xb8e11dea346f2c961880879606a269db3165bbc7";
if (!isAddress(registryAddressEnv)) {
  throw new Error(`REGISTRY_ADDRESS must be a valid address; received ${JSON.stringify(registryAddressEnv)}.`);
}
const REGISTRY_ADDRESS = registryAddressEnv as `0x${string}`;
const RPC_URL = process.env.RPC_URL ?? "https://dream-rpc.somnia.network";

const githubProvenance = resolveGitHubProvenance();

const abi = [
  {
    name: "get",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "key", type: "bytes32" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "score", type: "uint8" },
          { name: "band", type: "uint8" },
          { name: "dims", type: "uint8[5]" },
          { name: "methodHash", type: "bytes32" },
          { name: "scoredAt", type: "uint64" },
          { name: "uri", type: "string" },
        ],
      },
    ],
  },
] as const;

const BAND_CODE: Record<Band, number> = { low: 0, moderate: 1, elevated: 2, high: 3 };
const BANDS = ["low", "moderate", "elevated", "high"] as const;
const SAFE_MARKET_ID = /^[a-zA-Z0-9_-]+$/;

interface ScoreIndexEntry {
  marketId: string;
}

interface ExpectedAttestation {
  score: number;
  band: number;
  dims: [number, number, number, number, number];
  methodHash: Hex;
  scoredAt: bigint;
  uri: string;
}

interface SnapshotMarket {
  score: number;
  band: string;
  dims: number[];
  methodHash: string;
  scoredAt: string;
  uri: string;
  matchesCache: true;
}

function loadScores(): ScoreResult[] {
  let index: { markets?: unknown };
  try {
    index = JSON.parse(readFileSync(scoresIndexPath, "utf8")) as { markets?: unknown };
  } catch (err) {
    throw new Error(`Could not read score index at ${scoresIndexPath}: ${(err as Error).message}`);
  }
  if (!Array.isArray(index.markets)) {
    throw new Error(`Score index at ${scoresIndexPath} has no markets array — run \`npm run score:all\` first.`);
  }

  const ids = index.markets.map((entry, i) => {
    const marketId = (entry as Partial<ScoreIndexEntry>).marketId;
    if (typeof marketId !== "string" || !SAFE_MARKET_ID.test(marketId)) {
      throw new Error(`Score index entry ${i} has an invalid marketId: ${JSON.stringify(marketId)}.`);
    }
    return marketId;
  });
  if (new Set(ids).size !== ids.length) {
    throw new Error(`Score index at ${scoresIndexPath} contains duplicate marketId values.`);
  }

  return ids.map((marketId) => {
    const scorePath = path.join(scoresDir, `${marketId}.json`);
    let result: ScoreResult;
    try {
      result = JSON.parse(readFileSync(scorePath, "utf8")) as ScoreResult;
    } catch (err) {
      throw new Error(`Could not read score for ${marketId} at ${scorePath}: ${(err as Error).message}`);
    }
    if (result.marketId !== marketId || !Array.isArray(result.dimensions)) {
      throw new Error(`Score file ${scorePath} is not a ScoreResult for market ${marketId}.`);
    }
    return result;
  });
}

function expectedAttestation(local: ScoreResult): ExpectedAttestation {
  if (!Number.isInteger(local.overallScore) || local.overallScore < 0 || local.overallScore > 100) {
    throw new Error(`${local.marketId}: overallScore must be an integer from 0 to 100.`);
  }
  const dims = DIMENSION_IDS.map((id) => {
    const dimension = local.dimensions.find((d) => d.dimension === id);
    if (!dimension || !Number.isInteger(dimension.effectiveLevel) || dimension.effectiveLevel < 1 || dimension.effectiveLevel > 5) {
      throw new Error(`${local.marketId}: ${id}.effectiveLevel must be an integer from 1 to 5.`);
    }
    return dimension.effectiveLevel;
  }) as [number, number, number, number, number];
  const scoredAtMs = new Date(local.metadata.scoredAt).getTime();
  if (!Number.isFinite(scoredAtMs)) {
    throw new Error(`${local.marketId}: metadata.scoredAt is not a valid ISO timestamp.`);
  }

  return {
    score: local.overallScore,
    band: BAND_CODE[local.band],
    dims,
    methodHash: `0x${createHash("sha256")
      .update(`${local.metadata.anchorLibraryVersion}|${local.metadata.promptVersion}`)
      .digest("hex")}` as Hex,
    scoredAt: BigInt(Math.floor(scoredAtMs / 1000)),
    uri: githubScoreUri(githubProvenance, local.marketId),
  };
}

const client = createPublicClient({ chain: somniaShannon, transport: http(RPC_URL) });
const chainId = await client.getChainId();
if (chainId !== somniaShannon.id) {
  throw new Error(`RPC ${RPC_URL} reports chain id ${chainId}, expected Somnia Shannon ${somniaShannon.id}.`);
}

const scores = loadScores();
const markets: Record<string, SnapshotMarket> = {};
let missing = 0;
let mismatches = 0;

for (const local of scores) {
  const expected = expectedAttestation(local);
  const a = await client.readContract({
    address: REGISTRY_ADDRESS,
    abi,
    functionName: "get",
    args: [keccak256(toBytes(local.marketId))],
  });

  if (a.scoredAt === 0n) {
    missing++;
    console.warn(`[onchain] MISSING ${local.marketId}: no attestation on chain — run registry:publish`);
    continue;
  }

  const dims = [...a.dims];
  const differences: string[] = [];
  if (a.score !== expected.score) differences.push(`score chain=${a.score} cache=${expected.score}`);
  if (a.band !== expected.band) differences.push(`band chain=${BANDS[a.band] ?? a.band} cache=${local.band}`);
  if (dims.join(",") !== expected.dims.join(",")) differences.push(`dims chain=[${dims}] cache=[${expected.dims}]`);
  if (a.methodHash.toLowerCase() !== expected.methodHash.toLowerCase()) {
    differences.push(`methodHash chain=${a.methodHash} cache=${expected.methodHash}`);
  }
  if (a.scoredAt !== expected.scoredAt) differences.push(`scoredAt chain=${a.scoredAt} cache=${expected.scoredAt}`);
  if (a.uri !== expected.uri) differences.push(`uri chain=${JSON.stringify(a.uri)} cache=${JSON.stringify(expected.uri)}`);

  if (differences.length > 0) {
    mismatches++;
    console.warn(`[onchain] MISMATCH ${local.marketId}: ${differences.join("; ")} — republish after cache/provenance changes`);
    continue;
  }

  markets[local.marketId] = {
    score: a.score,
    band: BANDS[a.band],
    dims,
    methodHash: a.methodHash,
    scoredAt: new Date(Number(a.scoredAt) * 1000).toISOString(),
    uri: a.uri,
    matchesCache: true,
  };
}

const failures = missing + mismatches;
console.log(
  `Verified ${Object.keys(markets).length}/${scores.length} current attestation(s) on-chain against ${REGISTRY_ADDRESS}; ` +
    `missing: ${missing}; mismatches: ${mismatches}.`,
);

if (failures > 0) {
  console.error(`Verification failed; leaving existing data/scores/onchain.json untouched so no misleading snapshot is written.`);
  process.exitCode = 1;
} else {
  const out = {
    registryAddress: REGISTRY_ADDRESS,
    chainId: somniaShannon.id,
    explorerBase: "https://shannon-explorer.somnia.network",
    verifiedAt: new Date().toISOString(),
    markets,
  };
  writeFileSync(path.join(scoresDir, "onchain.json"), JSON.stringify(out, null, 2) + "\n");
  console.log("Wrote data/scores/onchain.json");
}
