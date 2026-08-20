/**
 * Inter-run agreement analysis: three INDEPENDENT protocol classifications of the
 * curated set (data/classification-runs/run-{A,B,C}/) versus each other and versus the
 * committed reference classifications (data/classifications/).
 *
 *   npx tsx scripts/agreement.ts
 *
 * This is the non-circular counterpart to scripts/validate.ts: the runs were produced
 * blind to the reference files and to each other, so per-dimension modal agreement here
 * is real inter-run stability evidence, and majority-vote bands vs reference bands is a
 * real reproducibility check. Writes docs/agreement.md.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DIMENSION_IDS,
  computeScore,
  loadAnchors,
  voteDimension,
  type Confidence,
  type DimensionId,
  type Level,
  type RunClassification,
} from "@levelfield/scoring";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, "..");
const runsDir = path.join(repoRoot, "data/classification-runs");
const refDir = path.join(repoRoot, "data/classifications");
const lib = loadAnchors(path.join(repoRoot, "data/anchors/anchors.yaml"));

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
  dimensions: Record<DimensionId, ClassificationDim>;
}

const RUN_IDS = ["run-A", "run-B", "run-C"] as const;

function loadDir(dir: string): Map<string, ClassificationFile> {
  const out = new Map<string, ClassificationFile>();
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const parsed = JSON.parse(readFileSync(path.join(dir, f), "utf8")) as ClassificationFile;
    out.set(parsed.marketId, parsed);
  }
  return out;
}

const runs = RUN_IDS.map((id) => loadDir(path.join(runsDir, id)));
const refs = loadDir(refDir);
const marketIds = [...refs.keys()].sort();

for (const [i, run] of runs.entries()) {
  const missing = marketIds.filter((id) => !run.has(id));
  if (missing.length > 0) {
    throw new Error(`${RUN_IDS[i]} is missing ${missing.length} contract(s): ${missing.join(", ")} — rerun that classifier`);
  }
}

const toRun = (id: DimensionId, d: ClassificationDim): RunClassification => ({
  dimension: id,
  level: d.level,
  levelLabel: d.levelLabel,
  evidenceQuote: d.evidenceQuote,
  reasoning: d.reasoning,
  confidence: d.confidence,
  insufficientInfo: d.insufficientInfo,
});

// Per-dimension stats across all contracts.
const perDim: Record<DimensionId, { unanimous: number; majority: number; split: number; modalMatchesRef: number }> =
  Object.fromEntries(DIMENSION_IDS.map((d) => [d, { unanimous: 0, majority: 0, split: 0, modalMatchesRef: 0 }])) as never;

interface ContractRow {
  marketId: string;
  votedLevels: string;
  refLevels: string;
  votedScore: number;
  votedBand: string;
  refScore: number;
  refBand: string;
  bandMatch: boolean;
  disagreements: string[];
}
const rows: ContractRow[] = [];

for (const marketId of marketIds) {
  const ref = refs.get(marketId)!;
  const voted = DIMENSION_IDS.map((dim) => voteDimension(runs.map((r) => toRun(dim, r.get(marketId)!.dimensions[dim]))));
  const refVoted = DIMENSION_IDS.map((dim) => voteDimension([toRun(dim, ref.dimensions[dim])]));

  const disagreements: string[] = [];
  for (const [i, dim] of DIMENSION_IDS.entries()) {
    const levels = runs.map((r) => r.get(marketId)!.dimensions[dim].level);
    const distinct = new Set(levels.map((l) => String(l)));
    if (distinct.size === 1) perDim[dim].unanimous++;
    else if (distinct.size === 2) perDim[dim].majority++;
    else perDim[dim].split++;

    const modal = voted[i].level;
    const refLevel = ref.dimensions[dim].level;
    if (modal === refLevel) perDim[dim].modalMatchesRef++;
    else disagreements.push(`${dim}: runs ${levels.map((l) => l ?? "∅").join("/")} vs ref ${refLevel ?? "∅"}`);
  }

  const votedEngine = computeScore(voted, lib);
  const refEngine = computeScore(refVoted, lib);
  rows.push({
    marketId,
    votedLevels: DIMENSION_IDS.map((_, i) => voted[i].level ?? "∅").join(","),
    refLevels: DIMENSION_IDS.map((d) => ref.dimensions[d].level ?? "∅").join(","),
    votedScore: votedEngine.overallScore,
    votedBand: votedEngine.band,
    refScore: refEngine.overallScore,
    refBand: refEngine.band,
    bandMatch: votedEngine.band === refEngine.band,
    disagreements,
  });
}

const n = marketIds.length;
const bandMatches = rows.filter((r) => r.bandMatch).length;

const dimTable = DIMENSION_IDS.map((d) => {
  const s = perDim[d];
  return `| ${d} | ${s.unanimous}/${n} | ${s.majority}/${n} | ${s.split}/${n} | ${s.modalMatchesRef}/${n} |`;
}).join("\n");

const contractTable = rows
  .map(
    (r) =>
      `| ${r.marketId} | ${r.votedLevels} | ${r.votedScore} ${r.votedBand} | ${r.refScore} ${r.refBand} | ${r.bandMatch ? "✓" : "✗"} |`,
  )
  .join("\n");

const disagreementList = rows
  .filter((r) => r.disagreements.length > 0)
  .map((r) => `- **${r.marketId}**: ${r.disagreements.join("; ")}`)
  .join("\n");

const md = `# Inter-run agreement — ${new Date().toISOString().slice(0, 10)}

Three independent classifiers (separate sessions, blind to the reference files, to each
other, and to the curated files' expected blocks) each classified all ${n} curated
contracts via the open protocol against anchor library v${lib.version}. Their runs are
committed under \`data/classification-runs/\`. This report votes across the three runs
per dimension (the same \`voteDimension\` used everywhere in the pipeline) and compares
the result to the committed reference classifications.

## Per-dimension agreement across the three independent runs

| Dimension | Unanimous (3/3) | Majority (2/3) | Full split | Modal level = reference |
|---|---|---|---|---|
${dimTable}

## Per-contract: majority-vote score vs reference score

| Contract | Voted levels (D1–D5) | Voted score | Reference score | Band match |
|---|---|---|---|---|
${contractTable}

**Band agreement (majority-vote vs reference): ${bandMatches}/${n}.**

## Dimension-level disagreements with the reference

${disagreementList || "None."}

## What this does and does not show

This measures the protocol's inter-run stability on real contracts — the thing a fixed
prompt and a rubric are supposed to buy — and whether independently produced
classifications land in the same band the reference classification does. It does not
prove the reference levels are "true"; it shows they are reproducible by classifiers who
never saw them. Disagreements listed above are inputs to the next anchor-library
revision, not noise to be hidden.
`;

writeFileSync(path.join(repoRoot, "docs/agreement.md"), md);
console.log(`Contracts: ${n}; band agreement (voted vs reference): ${bandMatches}/${n}`);
for (const d of DIMENSION_IDS) {
  const s = perDim[d];
  console.log(`${d}: unanimous ${s.unanimous}/${n}, majority ${s.majority}/${n}, split ${s.split}/${n}, modal=ref ${s.modalMatchesRef}/${n}`);
}
console.log("Wrote docs/agreement.md");
