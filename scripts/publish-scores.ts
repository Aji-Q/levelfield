/**
 * Publishes the score cache (data/scores/*.json) to the on-chain ScoreRegistry in batches.
 *
 *   npx tsx scripts/publish-scores.ts             # dry run: prints every tx it would send
 *   npx tsx scripts/publish-scores.ts --send       # actually sends them
 *
 * Env: REGISTRY_ADDRESS and GITHUB_REPO=owner/repo (always required — URLs are part of
 * every attestation), optional GITHUB_REF (defaults to main; use a commit SHA for releases),
 * PRIVATE_KEY (required only with --send), RPC_URL (default Shannon RPC).
 *
 * band -> uint8: low=0, moderate=1, elevated=2, high=3 (ScoreRegistry.Attestation.band).
 * dims -> [D1..D5].effectiveLevel, in that fixed order (ScoreRegistry.Attestation.dims).
 * methodHash = sha256(anchorLibraryVersion + "|" + promptVersion) — NOT the same value as
 * ScoreResult.metadata.promptVersion (that's already a hash of the rendered prompt alone);
 * this is a second hash binding the anchor library version to it, so a later anchors.yaml
 * bump can never be misread onto an attestation scored under the old anchors.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, createWalletClient, http, isAddress, keccak256, toBytes, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { somniaShannon } from "@somnia-chain/markets-sdk/chains";
import { DIMENSION_IDS, type Band, type ScoreResult } from "@levelfield/scoring";
import { githubScoreUri, resolveGitHubProvenance } from "./github-provenance.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, "..");
const scoresDir = path.join(repoRoot, "data/scores");
const scoresIndexPath = path.join(scoresDir, "index.json");
const artifactPath = path.join(repoRoot, "contracts/out/ScoreRegistry.sol/ScoreRegistry.json");

const CHUNK_SIZE = 5; // headroom against per-tx calldata/gas limits, not a protocol constant

const BAND_CODE: Record<Band, number> = { low: 0, moderate: 1, elevated: 2, high: 3 };

const send = process.argv.slice(2).includes("--send");
const RPC_URL = process.env.RPC_URL ?? "https://dream-rpc.somnia.network";

const githubProvenance = resolveGitHubProvenance();

const registryAddressEnv = process.env.REGISTRY_ADDRESS?.trim();
if (!registryAddressEnv || !isAddress(registryAddressEnv)) {
  throw new Error(
    "A valid REGISTRY_ADDRESS is required (dry run previews calls against a real target too). " +
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

interface ScoreIndexEntry {
  marketId: string;
}

function loadScores(): ScoreResult[] {
  // index.json is the score cache's source of truth. Scanning every JSON file also
  // picks up metadata snapshots such as onchain.json (and historical orphan files),
  // neither of which is a ScoreResult or should be republished.
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
    if (typeof marketId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(marketId)) {
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

function toAttestation(result: ScoreResult): AttestationArg {
  if (!Number.isInteger(result.overallScore) || result.overallScore < 0 || result.overallScore > 100) {
    throw new Error(`${result.marketId}: overallScore must be an integer from 0 to 100.`);
  }
  const dims = DIMENSION_IDS.map((id) => {
    const d = result.dimensions.find((dim) => dim.dimension === id);
    if (!d) throw new Error(`${result.marketId}: missing dimension ${id} in dimensions[]`);
    if (!Number.isInteger(d.effectiveLevel) || d.effectiveLevel < 1 || d.effectiveLevel > 5) {
      throw new Error(`${result.marketId}: ${id}.effectiveLevel must be an integer from 1 to 5.`);
    }
    return d.effectiveLevel;
  }) as [number, number, number, number, number];

  const methodHash = `0x${createHash("sha256")
    .update(`${result.metadata.anchorLibraryVersion}|${result.metadata.promptVersion}`)
    .digest("hex")}` as Hex;

  const scoredAtMs = new Date(result.metadata.scoredAt).getTime();
  if (!Number.isFinite(scoredAtMs)) {
    throw new Error(`${result.marketId}: metadata.scoredAt is not a valid ISO timestamp.`);
  }

  return {
    score: result.overallScore,
    band: BAND_CODE[result.band],
    dims,
    methodHash,
    scoredAt: BigInt(Math.floor(scoredAtMs / 1000)),
    uri: githubScoreUri(githubProvenance, result.marketId),
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

const [chainId, registryCode] = await Promise.all([publicClient.getChainId(), publicClient.getCode({ address: registryAddress })]);
if (chainId !== somniaShannon.id) {
  throw new Error(`RPC ${RPC_URL} reports chain id ${chainId}, expected Somnia Shannon ${somniaShannon.id}. Not publishing.`);
}
if (!registryCode || registryCode === "0x") {
  throw new Error(`REGISTRY_ADDRESS ${registryAddress} has no deployed bytecode on Somnia Shannon. Not publishing.`);
}

const registryOwner = (await publicClient.readContract({
  address: registryAddress,
  abi: artifact.abi,
  functionName: "owner",
})) as Address;
if (registryOwner.toLowerCase() !== account.address.toLowerCase()) {
  throw new Error(
    `Signer ${account.address} is not ScoreRegistry owner ${registryOwner} at ${registryAddress}. Not publishing.`,
  );
}

console.log(`\nPublishing from ${account.address}...`);
for (const [i, batch] of chunks.entries()) {
  // Simulate with the actual signer first so an ownership/ABI/calldata issue is
  // discovered before a transaction is broadcast.
  const { request } = await publicClient.simulateContract({
    account,
    address: registryAddress,
    abi: artifact.abi,
    functionName: "publishBatch",
    args: [batch.map((r) => r.key), batch.map((r) => r.attestation)],
  });
  const hash = await walletClient.writeContract(request);
  console.log(`chunk ${i + 1}/${chunks.length}: ${hash} (waiting for receipt...)`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    throw new Error(`publishBatch chunk ${i + 1}/${chunks.length} reverted in block ${receipt.blockNumber}. Publishing stopped.`);
  }
  console.log(`  mined in block ${receipt.blockNumber}, status ${receipt.status}`);
}

console.log(`\nPublished ${rows.length} attestation(s) in ${chunks.length} transaction(s).`);
