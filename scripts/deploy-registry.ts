/**
 * Deploys ScoreRegistry to Somnia Shannon testnet (chain id 50312).
 *
 *   npx tsx scripts/deploy-registry.ts             # dry run: bytecode size + estimated cost
 *   npx tsx scripts/deploy-registry.ts --send       # actually deploy (needs a funded PRIVATE_KEY)
 *
 * Env: PRIVATE_KEY (required only with --send), RPC_URL (default the Shannon RPC).
 * Reads the compiled artifact from contracts/out/ScoreRegistry.sol/ScoreRegistry.json — run
 * `cd contracts && forge build` first if it's missing.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatEther, createPublicClient, createWalletClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { somniaShannon } from "@somnia-chain/markets-sdk/chains";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, "..");
const artifactPath = path.join(repoRoot, "contracts/out/ScoreRegistry.sol/ScoreRegistry.json");

const send = process.argv.slice(2).includes("--send");
const RPC_URL = process.env.RPC_URL ?? "https://dream-rpc.somnia.network";

interface ForgeArtifact {
  abi: unknown[];
  bytecode: { object: Hex };
}

let artifact: ForgeArtifact;
try {
  artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
} catch {
  throw new Error(`No compiled artifact at ${artifactPath} — run \`cd contracts && forge build\` first.`);
}

const publicClient = createPublicClient({ chain: somniaShannon, transport: http(RPC_URL) });

const bytecodeBytes = (artifact.bytecode.object.length - 2) / 2; // strip "0x", 2 hex chars per byte
console.log(`ScoreRegistry bytecode: ${bytecodeBytes.toLocaleString()} bytes`);
console.log(`RPC: ${RPC_URL} (chain id ${somniaShannon.id})`);

let gasEstimate: bigint | undefined;
let gasPrice: bigint | undefined;
try {
  [gasEstimate, gasPrice] = await Promise.all([
    publicClient.estimateGas({ data: artifact.bytecode.object }),
    publicClient.getGasPrice(),
  ]);
  const costWei = gasEstimate * gasPrice;
  console.log(`Estimated deployment gas: ${gasEstimate.toLocaleString()} @ ${gasPrice.toLocaleString()} wei/gas`);
  console.log(`Estimated cost: ${formatEther(costWei)} STT`);
} catch (err) {
  console.warn(`Could not reach ${RPC_URL} for a live gas estimate: ${(err as Error).message}`);
}

if (!send) {
  console.log("\nDry run only — no transaction sent. Pass --send to actually deploy.");
  process.exit(0);
}

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error(
    "PRIVATE_KEY is required with --send. Export a throwaway testnet private key " +
      "(0x-prefixed, 32 bytes) and fund it first at https://testnet.somnia.network.",
  );
}

const account = privateKeyToAccount(privateKey as Hex);
const walletClient = createWalletClient({ account, chain: somniaShannon, transport: http(RPC_URL) });

console.log(`\nDeploying from ${account.address}...`);
const hash = await walletClient.deployContract({ abi: artifact.abi, bytecode: artifact.bytecode.object });
console.log(`Transaction: ${hash}`);

const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (!receipt.contractAddress) {
  throw new Error(`Deployment transaction ${hash} mined but returned no contractAddress — check the receipt manually.`);
}

console.log(`\nDeployed ScoreRegistry at ${receipt.contractAddress}`);
console.log(`Explorer: ${somniaShannon.blockExplorers!.default.url}/address/${receipt.contractAddress}`);
console.log(`\nSet REGISTRY_ADDRESS=${receipt.contractAddress} before running scripts/publish-scores.ts.`);
