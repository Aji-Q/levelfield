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
  classificationConsistencyError,
  computeScore,
  fetchMarkets,
  isVerbatimQuote,
  loadAnchors,
  quoteOverlapsInjection,
  renderContractData,
  scanForInstructionLikeContent,
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
  intervalSec: string | null; // live rows only — the market window (900="15m", 3600="1h"); never inferred from question text
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
// The code-level injection scan runs here for every track, independent of what any
// classifier claimed (docs/review-2026-08-20.md §1.2: the quote check alone proves a
// quote exists, not that it wasn't attacker-authored).
function scoreRun(contract: NormalizedContract, run: StageARun, model: string): ScoreResult {
  const scan = scanForInstructionLikeContent(renderContractData(contract));
  const voted = DIMENSION_IDS.map((id) => voteDimension([run.dimensions[id]])).map((v) => {
    if (classificationConsistencyError(v)) {
      return { ...v, level: null, levelLabel: null, evidenceQuote: null, insufficientInfo: true, confidence: "low" as const };
    }
    return v.evidenceQuote !== null && quoteOverlapsInjection(v.evidenceQuote, scan)
      ? { ...v, level: null, levelLabel: null, evidenceQuote: null, insufficientInfo: true, confidence: "low" as const }
      : v;
  });
  const engine = computeScore(voted, lib);

  const caveats = [...STANDARD_CAVEATS];
  if (scan.detected) {
    caveats.push(
      "Instruction-like content addressed at automated assessors was detected in the contract text; it was ignored for classification and disqualified as evidence.",
    );
  }
  caveats.push(...engine.notes);
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
    flags: { instructionLikeContentDetected: scan.detected || run.instructionLikeContentDetected },
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

// Selects the currently-tradable representative per market series. The indexer carries
// hundreds of orphaned rows still marked "Trading" with expiries weeks in the past
// (docs/review-2026-08-20.md §1.3), so: keep only future-expiry Trading rows, group by
// the TYPED series key (asset|intervalSec, per Gotcha #13 — never the question text),
// and keep the soonest FUTURE expiry in each series (the window a user could bet now).
function selectLiveRows(rows: DreamDexMarketRow[]): { kept: DreamDexMarketRow[]; staleCount: number; collapsedCount: number } {
  const nowSec = Date.now() / 1000;
  const tradable = rows.filter((r) => r.clobStatus === "Trading" && r.expiry !== null && Number(r.expiry) > nowSec);
  const staleCount = rows.length - tradable.length;

  const groups = new Map<string, DreamDexMarketRow[]>();
  for (const row of tradable) {
    const key = `${row.asset}|${row.intervalSec}`;
    const list = groups.get(key);
    if (list) list.push(row);
    else groups.set(key, [row]);
  }

  const kept: DreamDexMarketRow[] = [];
  let collapsedCount = 0;
  for (const group of groups.values()) {
    kept.push([...group].sort((a, b) => expiryOf(a) - expiryOf(b))[0]);
    collapsedCount += group.length - 1;
  }
  return { kept, staleCount, collapsedCount };
}

async function runLiveTrack(): Promise<{ results: ScoreResult[]; entries: ScoreIndexEntry[] }> {
  const results: ScoreResult[] = [];
  const entries: ScoreIndexEntry[] = [];

  const rows = await fetchMarkets({ statuses: ["Trading"] });
  const { kept, staleCount, collapsedCount } = selectLiveRows(rows);
  console.warn(
    `[live] ${rows.length} Trading rows fetched: ${staleCount} stale (past expiry, indexer orphans) dropped, ` +
      `${collapsedCount} duplicate series rows collapsed -> ${kept.length} currently-tradable market(s) scored`,
  );
  if (kept.length === 0) {
    console.warn("[live] no currently-tradable market found (all Trading rows are past expiry) — live track is empty this run");
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
      intervalSec: row.intervalSec,
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
        const consistencyError = classificationConsistencyError(d);
        if (consistencyError) {
          throw new Error(`Classification file ${classificationPath} dimension ${id}: ${consistencyError}`);
        }
        if (!d.insufficientInfo && d.evidenceQuote !== null && !isVerbatimQuote(d.evidenceQuote, contractText)) {
          throw new Error(
            `Classification file ${classificationPath} dimension ${id}: evidenceQuote ${JSON.stringify(d.evidenceQuote)} ` +
              `is not a verbatim substring of the rendered contract text for ${contract.marketId} (${curatedPath}).`,
          );
        }
        // Reference files must never cite injected text as evidence.
        const scan = scanForInstructionLikeContent(contractText);
        if (d.evidenceQuote !== null && quoteOverlapsInjection(d.evidenceQuote, scan)) {
          throw new Error(
            `Classification file ${classificationPath} dimension ${id}: evidenceQuote overlaps instruction-like ` +
              `content in the contract text — a reference classification may not cite injected text.`,
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
      intervalSec: null,
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
