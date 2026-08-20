/**
 * Batch scorer: writes the score cache the web app reads at request time (no network).
 *
 *   npx tsx scripts/score-all.ts
 *
 * Two tracks, both single-run (runs: 1) since both classifiers are deterministic:
 *   - Live: DreamDEX testnet markets, classified by tryRuleClassify (rule-classifier.ts).
 *     Rows the rule classifier declines are logged and skipped (need LLM-protocol
 *     classification via the MCP server instead).
 *   - Curated: data/curated/*.json scored against data/classifications/{marketId}.json
 *     reference classification files.
 *
 * The live track hits the known-unstable DreamDEX indexer; a network failure there must
 * not abort the curated track, so that split is a legitimate boundary try/catch.
 *
 * Writes data/scores/{marketId}.json (full ScoreResult) + data/scores/index.json
 * (see docs/design/no-api.md §"Score cache").
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DIMENSION_IDS,
  STANDARD_CAVEATS,
  buildSummary,
  buildSystemPrompt,
  computeScore,
  fetchMarkets,
  isVerbatimQuote,
  loadAnchors,
  renderContractData,
  toNormalizedContract,
  tryRuleClassify,
  voteDimension,
  type Band,
  type Confidence,
  type DimensionId,
  type DreamDexMarketRow,
  type Level,
  type NormalizedContract,
  type RunClassification,
  type ScoreResult,
  type StageARun,
} from "@levelfield/scoring";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, "..");
const anchorsPath = path.join(repoRoot, "data/anchors/anchors.yaml");
const curatedDir = path.join(repoRoot, "data/curated");
const classificationsDir = path.join(repoRoot, "data/classifications");
const scoresDir = path.join(repoRoot, "data/scores");

const lib = loadAnchors(anchorsPath);
// Shared promptVersion for every non-LLM classifier in this script: same formula
// ClaudeClassifier and the MCP server use, so the hash means "this anchor library
// rendering" regardless of which classifier (model, rule, or reference file) produced it.
const promptVersion = createHash("sha256")
  .update(buildSystemPrompt(lib) + "|anchors:" + lib.version)
  .digest("hex");

interface ScoreIndexEntry {
  marketId: string;
  question: string;
  source: NormalizedContract["source"];
  overallScore: number;
  band: Band;
  circuitBreaker: "CB-1" | "CB-2" | null;
  summary: string;
  expiry: string | null;
  clobStatus: string | null;
  oracleQuestionId: string | null;
}

interface CuratedFile extends NormalizedContract {
  expected?: unknown; // present for the test harness; ignored here
}

interface ClassificationDim {
  level: Level | null;
  levelLabel: string | null;
  evidenceQuote: string | null;
  reasoning: string;
  confidence: Confidence;
  insufficientInfo: boolean;
}

interface ClassificationFile {
  marketId: string;
  classifier: string;
  classifiedAt: string;
  instructionLikeContentDetected: boolean;
  dimensions: Record<DimensionId, ClassificationDim>;
}

// One Stage A run -> full ScoreResult. Both tracks feed exactly one deterministic run
// through voteDimension (agreement always "1/1") so the assembly logic is shared.
function scoreRun(contract: NormalizedContract, run: StageARun, model: string): ScoreResult {
  const voted = DIMENSION_IDS.map((id) => voteDimension([run.dimensions[id]]));
  const engine = computeScore(voted, lib);

  const caveats = [...STANDARD_CAVEATS];
  for (const d of engine.dimensions) {
    if (d.insufficientInfo) {
      caveats.push(
        `${d.dimension} (${d.name}) could not be determined from the contract text; scored conservatively at level ${d.effectiveLevel}.`,
      );
    }
  }

  return {
    marketId: contract.marketId,
    question: contract.question,
    source: contract.source,
    overallScore: engine.overallScore,
    band: engine.band,
    circuitBreaker: engine.circuitBreaker,
    summary: buildSummary(engine),
    dimensions: engine.dimensions,
    caveats,
    flags: { instructionLikeContentDetected: run.instructionLikeContentDetected },
    metadata: {
      model,
      promptVersion,
      anchorLibraryVersion: lib.version,
      runs: 1,
      scoredAt: new Date().toISOString(),
    },
  };
}

// --- live track --------------------------------------------------------------------

const expiryOf = (r: DreamDexMarketRow) => (r.expiry ? Number(r.expiry) : Infinity);

// Collapses rows sharing the same question template down to one representative, keeping
// the soonest-expiry Trading row (falling back to soonest-expiry overall if none of the
// group is currently Trading). Only kicks in once the fetched batch is large enough that
// duplication would make the cache unreadable.
function dedupeLiveRows(rows: DreamDexMarketRow[]): { kept: DreamDexMarketRow[]; collapsedCount: number } {
  if (rows.length <= 10) return { kept: rows, collapsedCount: 0 };

  const groups = new Map<string, DreamDexMarketRow[]>();
  for (const row of rows) {
    const key = row.question ?? `${row.marketType}|${row.asset}|${row.strike}`;
    const list = groups.get(key);
    if (list) list.push(row);
    else groups.set(key, [row]);
  }

  const kept: DreamDexMarketRow[] = [];
  let collapsedCount = 0;
  for (const group of groups.values()) {
    if (group.length === 1) {
      kept.push(group[0]);
      continue;
    }
    const trading = group.filter((r) => r.clobStatus === "Trading");
    const pool = trading.length > 0 ? trading : group;
    kept.push([...pool].sort((a, b) => expiryOf(a) - expiryOf(b))[0]);
    collapsedCount += group.length - 1;
  }
  return { kept, collapsedCount };
}

async function runLiveTrack(): Promise<{ results: ScoreResult[]; entries: ScoreIndexEntry[] }> {
  const results: ScoreResult[] = [];
  const entries: ScoreIndexEntry[] = [];

  const rows = await fetchMarkets({ statuses: ["Trading", "Locked"] });
  const { kept, collapsedCount } = dedupeLiveRows(rows);
  if (collapsedCount > 0) {
    console.warn(
      `[live] collapsed ${collapsedCount} duplicate-question row(s): ${rows.length} fetched -> ${kept.length} scored (kept soonest-expiry Trading row per distinct question)`,
    );
  }

  let declined = 0;
  for (const row of kept) {
    const contract = toNormalizedContract(row);
    const run = tryRuleClassify(row, contract);
    if (!run) {
      declined++;
      console.warn(
        `[live] WARNING: rule classifier declined marketId=${row.marketId} (question=${JSON.stringify(row.question)}) — needs LLM-protocol classification via the MCP server, skipping`,
      );
      continue;
    }

    const result = scoreRun(contract, run, "rule-classifier/v1");
    results.push(result);
    entries.push({
      marketId: result.marketId,
      question: result.question,
      source: result.source,
      overallScore: result.overallScore,
      band: result.band,
      circuitBreaker: result.circuitBreaker,
      summary: result.summary,
      expiry: row.expiry ? new Date(Number(row.expiry) * 1000).toISOString() : null,
      clobStatus: row.clobStatus,
      oracleQuestionId: row.oracleQuestionId,
    });
  }

  if (declined > 0) {
    console.warn(`[live] ${declined} market(s) need LLM-protocol classification (see warnings above)`);
  }

  return { results, entries };
}

// --- curated track -------------------------------------------------------------------

function runCuratedTrack(): { results: ScoreResult[]; entries: ScoreIndexEntry[] } {
  const results: ScoreResult[] = [];
  const entries: ScoreIndexEntry[] = [];

  let files: string[];
  try {
    files = readdirSync(curatedDir).filter((f) => f.endsWith(".json"));
  } catch {
    console.warn(`[curated] no curated directory at ${curatedDir} — skipping curated track`);
    return { results, entries };
  }

  for (const file of files) {
    const curatedPath = path.join(curatedDir, file);
    const contract = JSON.parse(readFileSync(curatedPath, "utf8")) as CuratedFile;

    const classificationPath = path.join(classificationsDir, `${contract.marketId}.json`);
    let raw: string;
    try {
      raw = readFileSync(classificationPath, "utf8");
    } catch {
      console.warn(
        `[curated] WARNING: no classification file for ${contract.marketId} (expected ${classificationPath}) — skipping`,
      );
      continue;
    }
    const classification = JSON.parse(raw) as ClassificationFile;

    const contractText = renderContractData(contract);
    const dimensions = Object.fromEntries(
      DIMENSION_IDS.map((id) => {
        const d = classification.dimensions[id];
        if (!d) {
          throw new Error(`Classification file ${classificationPath} is missing dimension ${id}.`);
        }
        if (!d.insufficientInfo && d.evidenceQuote !== null && !isVerbatimQuote(d.evidenceQuote, contractText)) {
          throw new Error(
            `Classification file ${classificationPath} dimension ${id}: evidenceQuote ${JSON.stringify(d.evidenceQuote)} ` +
              `is not a verbatim substring of the rendered contract text for ${contract.marketId} (${curatedPath}).`,
          );
        }
        const run: RunClassification = {
          dimension: id,
          level: d.level,
          levelLabel: d.levelLabel,
          evidenceQuote: d.evidenceQuote,
          reasoning: d.reasoning,
          confidence: d.confidence,
          insufficientInfo: d.insufficientInfo,
        };
        return [id, run];
      }),
    ) as Record<DimensionId, RunClassification>;

    const run: StageARun = { dimensions, instructionLikeContentDetected: classification.instructionLikeContentDetected };
    const result = scoreRun(contract, run, classification.classifier);
    results.push(result);
    entries.push({
      marketId: result.marketId,
      question: result.question,
      source: result.source,
      overallScore: result.overallScore,
      band: result.band,
      circuitBreaker: result.circuitBreaker,
      summary: result.summary,
      expiry: null,
      clobStatus: null,
      oracleQuestionId: null,
    });
  }

  return { results, entries };
}

// --- orchestrator ----------------------------------------------------------------

async function main() {
  mkdirSync(scoresDir, { recursive: true });

  let liveResults: ScoreResult[] = [];
  let liveEntries: ScoreIndexEntry[] = [];
  try {
    ({ results: liveResults, entries: liveEntries } = await runLiveTrack());
  } catch (err) {
    // Boundary: the DreamDEX indexer is known-unstable (docs/design/no-api.md). A live
    // network failure must not abort the curated track below.
    console.error(`[live] track failed, continuing with curated track only: ${(err as Error).message}`);
  }

  const { results: curatedResults, entries: curatedEntries } = runCuratedTrack();

  const allResults = [...liveResults, ...curatedResults];
  const allEntries = [...liveEntries, ...curatedEntries];

  for (const result of allResults) {
    writeFileSync(path.join(scoresDir, `${result.marketId}.json`), JSON.stringify(result, null, 2) + "\n");
  }

  allEntries.sort((a, b) => b.overallScore - a.overallScore || a.marketId.localeCompare(b.marketId));
  const index = { generatedAt: new Date().toISOString(), markets: allEntries };
  writeFileSync(path.join(scoresDir, "index.json"), JSON.stringify(index, null, 2) + "\n");

  const bandCounts: Partial<Record<Band, number>> = {};
  for (const e of allEntries) bandCounts[e.band] = (bandCounts[e.band] ?? 0) + 1;
  const bandSummary =
    (["low", "moderate", "elevated", "high"] as Band[])
      .filter((b) => bandCounts[b])
      .map((b) => `${b}=${bandCounts[b]}`)
      .join(", ") || "(none)";

  console.log(`\nScored ${allResults.length} market(s): ${liveResults.length} live, ${curatedResults.length} curated.`);
  console.log(`Band distribution: ${bandSummary}`);
  console.log(`Wrote data/scores/index.json + ${allResults.length} per-market file(s) to ${scoresDir}`);
}

await main();
