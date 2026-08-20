/**
 * Deterministic pre-trade risk-check demo: an agent that drives the REAL LevelField MCP
 * server over stdio (spawns packages/mcp/src/server.ts, exactly as any MCP host would)
 * to decide whether to trade two markets. No LLM call is involved anywhere in this demo —
 * the "agent" logic below is the fixed decision rule in step 3.
 *
 *   npx tsx scripts/agent-demo.ts
 *
 * Both markets resolve from the score cache (data/scores/*.json), so this runs offline.
 * See docs/design/no-api.md and packages/mcp/README.md for the protocol this drives.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, "..");
const serverPath = path.join(repoRoot, "packages/mcp/src/server.ts");

interface ScoredDimension {
  dimension: string;
  name: string;
  weight: number;
  effectiveLevel: number;
  reasoning: string;
}

interface AssessedMarket {
  note?: string;
  marketId: string;
  question: string;
  overallScore: number;
  band: "low" | "moderate" | "elevated" | "high";
  circuitBreaker: "CB-1" | "CB-2" | null;
  summary: string;
  dimensions: ScoredDimension[];
}

interface ScoreIndexEntry {
  marketId: string;
  question: string;
}

interface CallToolResult {
  content: Array<{ type: string; text?: string }>;
  isError?: boolean;
}

function toolText(result: CallToolResult): string {
  const block = result.content.find((c) => c.type === "text");
  if (!block?.text) throw new Error(`Tool call returned no text content: ${JSON.stringify(result)}`);
  if (result.isError) throw new Error(`Tool call returned an error: ${block.text}`);
  return block.text;
}

// Same driver-dimension selection buildSummary uses (packages/scoring/src/engine.ts):
// the highest weight * (level - 1) dimension among those at level >= 3, falling back to
// the highest-contribution dimension overall when nothing clears that bar.
function topRationale(dims: ScoredDimension[]): string {
  const contribution = (d: ScoredDimension) => d.weight * (d.effectiveLevel - 1);
  const byContribution = [...dims].sort((a, b) => contribution(b) - contribution(a));
  const top = byContribution.filter((d) => d.effectiveLevel >= 3)[0] ?? byContribution[0];
  return `${top.dimension} (${top.name}): ${top.reasoning}`;
}

// --- connect to the real MCP server over stdio --------------------------------------

const transport = new StdioClientTransport({ command: "npx", args: ["tsx", serverPath], cwd: repoRoot });
const client = new Client({ name: "levelfield-agent-demo", version: "0.1.0" });
await client.connect(transport);

console.log("LevelField agent demo: pre-trade risk check");
console.log("=".repeat(60));
console.log(`Connected to the LevelField MCP server over stdio (npx tsx ${path.relative(repoRoot, serverPath)}).\n`);

// --- step 1: pick the two markets the agent intends to trade -------------------------

const listResult = (await client.callTool({
  name: "list_scored_markets",
  arguments: { source: "dreamdex_testnet" },
})) as CallToolResult;
const list = JSON.parse(toolText(listResult)) as { generatedAt: string; markets: ScoreIndexEntry[] };
const liveMarket = list.markets[0];
if (!liveMarket) {
  throw new Error("No dreamdex_testnet markets in the score cache — run `npm run score:all` first.");
}

const targets: Array<{ marketId: string; label: string }> = [
  { marketId: liveMarket.marketId, label: "live DreamDEX testnet market" },
  { marketId: "curated-celebrity-breakup", label: "curated market" },
];

console.log(`Agent intends to trade ${targets.length} markets:`);
for (const t of targets) console.log(`  - ${t.marketId}  [${t.label}]`);
console.log();
console.log("Decision rule: PROCEED if band is low/moderate. DECLINE if band is elevated/high,");
console.log("quoting the summary and circuit breaker as the reason.\n");

// --- step 2 + 3: assess each market and apply the decision rule ----------------------

for (const target of targets) {
  console.log("-".repeat(60));
  console.log(`Assessing ${target.marketId}`);

  const assessResult = (await client.callTool({
    name: "assess_market",
    arguments: { market_id: target.marketId },
  })) as CallToolResult;
  const assessed = JSON.parse(toolText(assessResult)) as AssessedMarket;

  console.log(`  question:  ${assessed.question}`);
  console.log(`  score:     ${assessed.overallScore}/100 (${assessed.band})${assessed.note ? `  [${assessed.note}]` : ""}`);
  console.log(`  summary:   ${assessed.summary}`);
  console.log(`  rationale: ${topRationale(assessed.dimensions)}`);

  const proceed = assessed.band === "low" || assessed.band === "moderate";
  const decision = proceed
    ? `PROCEED (${assessed.overallScore}/100 ${assessed.band})`
    : `DECLINE (${assessed.overallScore}/100 ${assessed.band}, ${assessed.circuitBreaker ?? "no circuit breaker"}: ${assessed.summary})`;
  console.log(`  decision:  ${decision}`);
  console.log();
}

await client.close();
console.log("Demo complete.");
