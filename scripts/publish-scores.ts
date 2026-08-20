/**
 * Publishes the score cache (data/scores/*.json) to the on-chain ScoreRegistry in batches.
 *
 *   npx tsx scripts/publish-scores.ts             # dry run: prints every tx it would send
 *   npx tsx scripts/publish-scores.ts --send       # actually sends them
 *
 * Env: REGISTRY_ADDRESS (always required — the dry run previews calls against a real
 * target), PRIVATE_KEY (required only with --send), RPC_URL (default the Shannon RPC).
 *
 * band -> uint8: low=0, moderate=1, elevated=2, high=3 (ScoreRegistry.Attestation.band).
 * dims -> [D1..D5].effectiveLevel, in that fixed order (ScoreRegistry.Attestation.dims).
 * methodHash = sha256(anchorLibraryVersion + "|" + promptVersion) — NOT the same value as
 * ScoreResult.metadata.promptVersion (that's already a hash of the rendered prompt alone);
 * this is a second hash binding the anchor library version to it, so a later anchors.yaml
 * bump can never be misread onto an attestation scored under the old anchors.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, createWalletClient, http, keccak256, toBytes, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { somniaShannon } from "@somnia-chain/markets-sdk/chains";
import { DIMENSION_IDS, type Band, type ScoreResult } from "@levelfield/scoring";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, "..");
const scoresDir = path.join(repoRoot, "data/scores");
const artifactPath = path.join(repoRoot, "contracts/out/ScoreRegistry.sol/ScoreRegistry.json");

const GITHUB_REPO = "LEVELFIELD_REPO_PLACEHOLDER"; // replace with the real org/repo before publishing for real
const CHUNK_SIZE = 5; // headroom against per-tx calldata/gas limits, not a protocol constant

const BAND_CODE: Record<Band, number> = { low: 0, moderate: 1, elevated: 2, high: 3 };

const send = process.argv.slice(2).includes("--send");
const RPC_URL = process.env.RPC_URL ?? "https://dream-rpc.somnia.network";

const registryAddressEnv = process.env.REGISTRY_ADDRESS;
if (!registryAddressEnv) {
  throw new Error(
    "REGISTRY_ADDRESS is required (dry run previews calls against a real target too). " +
      "Deploy first with `npm run registry:deploy -- --send` and set REGISTRY_ADDRESS to the printed address.",
  );
}
const registryAddress = registryAddressEnv as Address;

interface ForgeArtifact {
  abi: unknown[];
}
let artifact: ForgeArtifact;
try {
  artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
} catch {
  throw new Error(`No compiled artifact at ${artifactPath} — run \`cd contracts && forge build\` first.`);
}

interface AttestationArg {
  score: number;
  band: number;
  dims: readonly [number, number, number, number, number];
  methodHash: Hex;
  scoredAt: bigint;
  uri: string;
}

function loadScores(): ScoreResult[] {
  const files = readdirSync(scoresDir).filter((f) => f.endsWith(".json") && f !== "index.json");
  return files.map((f) => JSON.parse(readFileSync(path.join(scoresDir, f), "utf8")) as ScoreResult);
}

function toAttestation(result: ScoreResult): AttestationArg {
  const dims = DIMENSION_IDS.map((id) => {
    const d = result.dimensions.find((dim) => dim.dimension === id);
    if (!d) throw new Error(`${result.marketId}: missing dimension ${id} in dimensions[]`);
    return d.effectiveLevel;
  }) as [number, number, number, number, number];

  const methodHash = `0x${createHash("sha256")
    .update(`${result.metadata.anchorLibraryVersion}|${result.metadata.promptVersion}`)
    .digest("hex")}` as Hex;

  return {
    score: result.overallScore,
    band: BAND_CODE[result.band],
    dims,
    methodHash,
    scoredAt: BigInt(Math.floor(new Date(result.metadata.scoredAt).getTime() / 1000)),
    uri: `https://github.com/${GITHUB_REPO}/blob/main/data/scores/${result.marketId}.json`,
  };
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

const results = loadScores();
console.log(`Loaded ${results.length} score(s) from ${scoresDir}`);
console.log(`Registry: ${registryAddress} on chain ${somniaShannon.id} via ${RPC_URL}`);

const rows = results.map((result) => ({
  marketId: result.marketId,
  key: keccak256(toBytes(result.marketId)),
  attestation: toAttestation(result),
}));

const chunks = chunk(rows, CHUNK_SIZE);
console.log(`Batching into ${chunks.length} publishBatch call(s) of up to ${CHUNK_SIZE} attestation(s) each\n`);

for (const [i, batch] of chunks.entries()) {
  console.log(`--- chunk ${i + 1}/${chunks.length} (${batch.length} market(s)) ---`);
  for (const row of batch) {
    console.log(
      `  ${row.marketId}\n` +
        `    key=${row.key}\n` +
        `    score=${row.attestation.score} band=${row.attestation.band} dims=[${row.attestation.dims.join(",")}]\n` +
        `    methodHash=${row.attestation.methodHash}\n` +
        `    scoredAt=${row.attestation.scoredAt} uri=${row.attestation.uri}`,
    );
  }
}

if (!send) {
  console.log(`\nDry run only — no transactions sent. Pass --send to publish ${chunks.length} batch(es) for real.`);
  process.exit(0);
}

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error(
    "PRIVATE_KEY is required with --send. Export the owner key that deployed the registry " +
      "(fund a throwaway key first at https://testnet.somnia.network if you haven't).",
  );
}

const account = privateKeyToAccount(privateKey as Hex);
const walletClient = createWalletClient({ account, chain: somniaShannon, transport: http(RPC_URL) });
const publicClient = createPublicClient({ chain: somniaShannon, transport: http(RPC_URL) });

console.log(`\nPublishing from ${account.address}...`);
for (const [i, batch] of chunks.entries()) {
  const hash = await walletClient.writeContract({
    address: registryAddress,
    abi: artifact.abi,
    functionName: "publishBatch",
    args: [batch.map((r) => r.key), batch.map((r) => r.attestation)],
  });
  console.log(`chunk ${i + 1}/${chunks.length}: ${hash} (waiting for receipt...)`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`  mined in block ${receipt.blockNumber}, status ${receipt.status}`);
}

console.log(`\nPublished ${rows.length} attestation(s) in ${chunks.length} transaction(s).`);
