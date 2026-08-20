/**
 * Validation harness: checks the curated set's scores against the ACDC risk gradient.
 *
 *   npx tsx scripts/validate.ts
 *
 * Reads data/scores/index.json (written by scripts/score-all.ts) and every
 * data/curated/*.json contract's `expected.category` — a hand-assigned ACDC-taxonomy
 * bucket (market_data < statistical < public < institutional < individual), not itself
 * a scoring input. New curated contracts have no data/classifications/ file until the
 * project lead reconciles their draft expected.levels, so score-all.ts skips them and
 * they will not appear in the score index. This script must not fail on that — it
 * reports which curated contracts are awaiting classification instead.
 *
 * Writes docs/validation.md, prints a summary to stdout.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Band, NormalizedContract } from "@levelfield/scoring";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, "..");
const curatedDir = path.join(repoRoot, "data/curated");
const scoresIndexPath = path.join(repoRoot, "data/scores/index.json");
const outPath = path.join(repoRoot, "docs/validation.md");

type Category = "market_data" | "statistical" | "public" | "institutional" | "individual";

// The ordering under test: ACDC's outcome-maker taxonomy, from "no one can move it"
// to "one person decides it and can trade on their own decision."
const CATEGORY_ORDER: Category[] = ["market_data", "statistical", "public", "institutional", "individual"];
const CATEGORY_RANK: Record<Category, number> = Object.fromEntries(
  CATEGORY_ORDER.map((cat, i) => [cat, i + 1]),
) as Record<Category, number>;

interface CuratedFile extends NormalizedContract {
  expected?: { category?: Category };
}

interface ScoreIndexEntry {
  marketId: string;
  question: string;
  source: string;
  overallScore: number;
  band: Band;
  circuitBreaker: "CB-1" | "CB-2" | null;
}

// --- load --------------------------------------------------------------------------

const curated: CuratedFile[] = readdirSync(curatedDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(path.join(curatedDir, f), "utf8")))
  .sort((a, b) => a.marketId.localeCompare(b.marketId));

const scoreIndex: { generatedAt: string; markets: ScoreIndexEntry[] } = JSON.parse(
  readFileSync(scoresIndexPath, "utf8"),
);
const scoreById = new Map(scoreIndex.markets.map((m) => [m.marketId, m]));

interface Row {
  marketId: string;
  question: string;
  category: Category | null;
  score: number | null;
  band: Band | null;
  circuitBreaker: "CB-1" | "CB-2" | null;
  scored: boolean;
}

const rows: Row[] = curated.map((c) => {
  const entry = scoreById.get(c.marketId);
  const scored = entry !== undefined && entry.source === "curated";
  return {
    marketId: c.marketId,
    question: c.question,
    category: c.expected?.category ?? null,
    score: scored ? entry!.overallScore : null,
    band: scored ? entry!.band : null,
    circuitBreaker: scored ? entry!.circuitBreaker : null,
    scored,
  };
});

const scoredRows = rows.filter((r) => r.scored);
const awaitingRows = rows.filter((r) => !r.scored);

// --- (1) per-category medians + adjacent-pair ordering check -----------------------

function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

const scoresByCategory = new Map<Category, number[]>();
for (const r of scoredRows) {
  if (!r.category) continue;
  const list = scoresByCategory.get(r.category) ?? [];
  list.push(r.score!);
  scoresByCategory.set(r.category, list);
}
const medianByCategory = new Map<Category, number | null>(
  CATEGORY_ORDER.map((cat) => [cat, median(scoresByCategory.get(cat) ?? [])]),
);

// The first two pairs allow ties (<=): market_data, statistical, and public all cluster
// near the low end of the gradient in the reference set and are not expected to separate
// cleanly. The last two pairs require strict separation (<): institutional and individual
// are the pairs the two circuit breakers (CB-1, CB-2) exist specifically to pull apart.
const PAIRS: { a: Category; b: Category; op: "<=" | "<" }[] = [
  { a: "market_data", b: "statistical", op: "<=" },
  { a: "statistical", b: "public", op: "<=" },
  { a: "public", b: "institutional", op: "<" },
  { a: "institutional", b: "individual", op: "<" },
];

const pairChecks = PAIRS.map(({ a, b, op }) => {
  const medianA = medianByCategory.get(a) ?? null;
  const medianB = medianByCategory.get(b) ?? null;
  const result: "pass" | "fail" | "skip" =
    medianA === null || medianB === null ? "skip" : (op === "<=" ? medianA <= medianB : medianA < medianB) ? "pass" : "fail";
  return { a, b, op, medianA, medianB, result };
});

// --- (2) Spearman rank correlation --------------------------------------------------

// Tie-aware rank transform (average rank within a tied group), then Pearson on the ranks.
// A plain sum-of-squared-rank-differences formula assumes no ties, which does not hold
// here: 3 of the 8 currently-scored contracts share the "institutional" category.
function ranks(xs: number[]): number[] {
  const order = xs.map((_, i) => i).sort((i, j) => xs[i] - xs[j]);
  const out = new Array(xs.length);
  let i = 0;
  while (i < order.length) {
    let j = i;
    while (j + 1 < order.length && xs[order[j + 1]] === xs[order[i]]) j++;
    const avgRank = (i + j) / 2 + 1; // 1-indexed
    for (let k = i; k <= j; k++) out[order[k]] = avgRank;
    i = j + 1;
  }
  return out;
}

function pearson(xs: number[], ys: number[]): number | null {
  const n = xs.length;
  if (n < 2) return null;
  const mx = xs.reduce((s, x) => s + x, 0) / n;
  const my = ys.reduce((s, y) => s + y, 0) / n;
  let cov = 0;
  let vx = 0;
  let vy = 0;
  for (let i = 0; i < n; i++) {
    cov += (xs[i] - mx) * (ys[i] - my);
    vx += (xs[i] - mx) ** 2;
    vy += (ys[i] - my) ** 2;
  }
  if (vx === 0 || vy === 0) return null; // one series is constant — correlation undefined
  return cov / Math.sqrt(vx * vy);
}

const categorized = scoredRows.filter((r) => r.category !== null);
const expectedRanks = categorized.map((r) => CATEGORY_RANK[r.category!]);
const scoreValues = categorized.map((r) => r.score!);
const rho = categorized.length >= 2 ? pearson(ranks(expectedRanks), ranks(scoreValues)) : null;

// --- (3) circuit-breaker hit list ----------------------------------------------------

const cbHits = scoredRows.filter((r) => r.circuitBreaker !== null);

// --- (4) render docs/validation.md ---------------------------------------------------

const today = new Date().toISOString().slice(0, 10);
const fmtScore = (n: number | null) => (n === null ? "—" : String(n));
const fmtCat = (c: Category | null) => c ?? "—";
const fmtBand = (b: Band | null) => b ?? "—";
const fmtCb = (cb: "CB-1" | "CB-2" | null) => cb ?? "—";

const pairTable = pairChecks
  .map(
    (p) =>
      `| ${p.a} ${p.op} ${p.b} | ${fmtScore(p.medianA)} | ${fmtScore(p.medianB)} | ${p.result.toUpperCase()} |`,
  )
  .join("\n");

const categoryTable = CATEGORY_ORDER.map((cat) => {
  const scores = scoresByCategory.get(cat) ?? [];
  const m = medianByCategory.get(cat);
  return `| ${cat} | ${scores.length} | ${m === null ? "—" : m} |`;
}).join("\n");

const marketTable = rows
  .map(
    (r) =>
      `| ${r.marketId} | ${fmtCat(r.category)} | ${fmtScore(r.score)} | ${fmtBand(r.band)} | ${fmtCb(r.circuitBreaker)} | ${r.scored ? "scored" : "awaiting classification"} |`,
  )
  .join("\n");

const cbTable =
  cbHits.length > 0
    ? cbHits.map((r) => `| ${r.marketId} | ${fmtCat(r.category)} | ${fmtScore(r.score)} | ${fmtCb(r.circuitBreaker)} |`).join("\n")
    : "| (none) | | | |";

const awaitingList =
  awaitingRows.length > 0
    ? awaitingRows.map((r) => `- \`${r.marketId}\` — ${r.question}`).join("\n")
    : "- (none — every curated contract has a classification)";

const md = `# LevelField validation report

Generated ${today} by \`scripts/validate.ts\`. Reads \`data/scores/index.json\` (produced by
\`scripts/score-all.ts\`) and each curated contract's \`expected.category\` field
(\`data/curated/*.json\`); does not itself run any classification.

## Method and its honest limits

This report checks two things, both against the **curated** contract set only (the live
DreamDEX track has no category label and is excluded from every table below):

1. **Category median ordering** — do median scores rise in the order the ACDC taxonomy
   predicts (\`market_data ≤ statistical ≤ public < institutional < individual\`)?
2. **Spearman rank correlation** — across all scored curated contracts, does a contract's
   score rank track its category's expected rank?

Neither check is proof that LevelField's scores predict real-world insider activity. The
reference classifications behind the scored contracts are **single-run by design** — one
classification per contract, not a majority vote across independent runs (that only happens
for live/ad-hoc contracts via \`voteDimension\`, see \`packages/scoring/src/vote.ts\`) — so a
single misjudged dimension moves a contract's score with no averaging to catch it. The
category labels themselves are also single-run, hand-assigned judgment calls, not an
independent ground truth. What this report actually supports is a narrower claim:
**LevelField's deterministic scoring engine reproduces, from category-blind per-dimension
levels, an ordering consistent with the taxonomy ACDC validated against 435,000+ settled
Polymarket markets** (\`data/anchors/anchors.yaml\`). It is evidence of internal consistency
with that taxonomy, not external validation of predictive power, and the sample size (currently
${scoredRows.length} scored curated contracts) is far too small to support a statistical claim
on its own.

## Coverage

${scoredRows.length}/${rows.length} curated contracts are scored. Contracts below are missing a
\`data/classifications/{marketId}.json\` reference classification and were skipped by
\`score-all.ts\`; they are excluded from every table below except the last.

${awaitingList}

## 1. Category median ordering

| category | n scored | median score |
|---|---|---|
${categoryTable}

| adjacent pair | median A | median B | result |
|---|---|---|---|
${pairTable}

## 2. Spearman rank correlation

rho = ${rho === null ? "undefined (fewer than 2 categorized, scored contracts)" : rho.toFixed(3)}, n = ${categorized.length}.

Computed as the Pearson correlation of tie-aware ranks (average rank within ties) between
each contract's \`overallScore\` and its category's position in the ACDC order
(market_data=1 … individual=5). Ties are expected and handled explicitly: multiple contracts
can share a category (e.g. \`institutional\`).

## 3. Circuit breaker hits

| marketId | category | score | circuit breaker |
|---|---|---|---|
${cbTable}

## 4. All curated markets

| marketId | category | score | band | circuit breaker | status |
|---|---|---|---|---|---|
${marketTable}
`;

writeFileSync(outPath, md);

// --- stdout summary ------------------------------------------------------------------

console.log(`Validated ${scoredRows.length}/${rows.length} curated contracts (${awaitingRows.length} awaiting classification).`);
console.log(`Category medians: ${CATEGORY_ORDER.map((c) => `${c}=${fmtScore(medianByCategory.get(c) ?? null)}`).join(", ")}`);
console.log(`Ordering checks: ${pairChecks.map((p) => `${p.a}${p.op}${p.b}:${p.result}`).join(", ")}`);
console.log(`Spearman rho = ${rho === null ? "n/a" : rho.toFixed(3)} (n=${categorized.length})`);
console.log(`Circuit breaker hits: ${cbHits.length > 0 ? cbHits.map((r) => `${r.marketId}(${r.circuitBreaker})`).join(", ") : "none"}`);
console.log(`Wrote ${path.relative(repoRoot, outPath)}`);

const anyFail = pairChecks.some((p) => p.result === "fail");
if (anyFail) {
  console.error("\nFAIL: one or more adjacent-category ordering checks failed — see docs/validation.md.");
  process.exit(1);
}
