/**
 * Reads every attestation back from the deployed ScoreRegistry on Somnia Shannon and
 * cross-checks it against the local score cache. Writes data/scores/onchain.json,
 * which the web app renders (keeping its no-network-at-request-time design).
 *
 *   REGISTRY_ADDRESS=0x... npx tsx scripts/verify-onchain.ts
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, http, keccak256, toBytes } from "viem";
import type { ScoreResult } from "@levelfield/scoring";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, "..");
const scoresDir = path.join(repoRoot, "data/scores");

const REGISTRY_ADDRESS = (process.env.REGISTRY_ADDRESS ?? "0xb8e11dea346f2c961880879606a269db3165bbc7") as `0x${string}`;
const RPC_URL = process.env.RPC_URL ?? "https://dream-rpc.somnia.network";

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

const BANDS = ["low", "moderate", "elevated", "high"] as const;
const client = createPublicClient({ transport: http(RPC_URL) });

const files = readdirSync(scoresDir).filter((f) => f.endsWith(".json") && f !== "index.json" && f !== "onchain.json");
const markets: Record<string, { score: number; band: string; dims: number[]; methodHash: string; scoredAt: string; matchesCache: boolean }> = {};
let mismatches = 0;

for (const f of files) {
  const local = JSON.parse(readFileSync(path.join(scoresDir, f), "utf8")) as ScoreResult;
  const a = await client.readContract({
    address: REGISTRY_ADDRESS,
    abi,
    functionName: "get",
    args: [keccak256(toBytes(local.marketId))],
  });
  if (a.scoredAt === 0n) {
    console.warn(`[onchain] ${local.marketId}: no attestation on chain — run registry:publish`);
    continue;
  }
  const dims = [...a.dims];
  const localDims = local.dimensions.map((d) => d.effectiveLevel);
  const matchesCache =
    a.score === local.overallScore &&
    BANDS[a.band] === local.band &&
    dims.join(",") === localDims.join(",");
  if (!matchesCache) {
    mismatches++;
    console.warn(`[onchain] MISMATCH ${local.marketId}: chain ${a.score}/${BANDS[a.band]} [${dims}] vs cache ${local.overallScore}/${local.band} [${localDims}] — republish after cache changes`);
  }
  markets[local.marketId] = {
    score: a.score,
    band: BANDS[a.band],
    dims,
    methodHash: a.methodHash,
    scoredAt: new Date(Number(a.scoredAt) * 1000).toISOString(),
    matchesCache,
  };
}

const out = {
  registryAddress: REGISTRY_ADDRESS,
  chainId: 50312,
  explorerBase: "https://shannon-explorer.somnia.network",
  verifiedAt: new Date().toISOString(),
  markets,
};
writeFileSync(path.join(scoresDir, "onchain.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`Verified ${Object.keys(markets).length}/${files.length} attestation(s) on-chain against ${REGISTRY_ADDRESS}; mismatches: ${mismatches}`);
console.log("Wrote data/scores/onchain.json");
