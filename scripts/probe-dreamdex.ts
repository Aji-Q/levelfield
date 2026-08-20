/**
 * Field-coverage probe against the DreamDEX Shannon testnet indexer.
 * Answers the project's lifeline question: how much contract text does the
 * public API expose for third-party analysis tools?
 *
 *   npx tsx scripts/probe-dreamdex.ts
 *
 * Endpoints from dreamdex-bot-kit packages/ec-core/src/config.ts (the indexer
 * URL is documented there as unstable — override with INDEXER_URL if it moves).
 */

const INDEXER_URL = process.env.INDEXER_URL ?? "https://dev.smk.somnia.host/v1/graphql";
const DREAMDEX_TESTNET_VENUE = "0x679795a0195a1b76cdebb7c51d74e058aee92919b8c3389af86ef24535e8a28c";

interface MarketRow {
  marketId: string;
  question: string | null;
  context: string | null;
  oracleQuestion: string | null;
  asset: string | null;
  strike: string | null;
  expiry: string | null;
  clobStatus: string | null;
  venueId: string | null;
}

async function gql<T>(query: string): Promise<T> {
  const res = await fetch(INDEXER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Indexer HTTP ${res.status} — has the indexer URL moved? Set INDEXER_URL to override.`);
  const body = (await res.json()) as { data?: T; errors?: unknown[] };
  if (body.errors?.length) throw new Error(`GraphQL errors: ${JSON.stringify(body.errors)}`);
  if (!body.data) throw new Error("GraphQL response had no data");
  return body.data;
}

const { Market: markets } = await gql<{ Market: MarketRow[] }>(`{
  Market(limit: 200, order_by: {createdAtTimestamp: desc}, where: {marketType: {_eq: "BINARY"}}) {
    marketId question context oracleQuestion asset strike expiry clobStatus venueId
  }
}`);

const trading = markets.filter((m) => m.clobStatus === "Trading");
const onDreamdexVenue = markets.filter((m) => m.venueId?.toLowerCase() === DREAMDEX_TESTNET_VENUE);
const withQuestion = markets.filter((m) => (m.question ?? "").trim().length > 0);
const withContext = markets.filter((m) => m.context && m.context !== "0x" && m.context.trim().length > 0);
const withOracleText = markets.filter((m) => (m.oracleQuestion ?? "").trim().length > 0);
const distinctQuestions = new Set(markets.map((m) => m.question));

console.log(`indexer: ${INDEXER_URL}`);
console.log(`binary markets fetched: ${markets.length} (${trading.length} trading, ${onDreamdexVenue.length} on DreamDEX venue)`);
console.log(`with question text:     ${withQuestion.length}/${markets.length}`);
console.log(`with context text:      ${withContext.length}/${markets.length}`);
console.log(`with oracle question:   ${withOracleText.length}/${markets.length}`);
console.log(`distinct question strings: ${distinctQuestions.size}`);
console.log(`\nsample questions:`);
for (const q of [...distinctQuestions].slice(0, 5)) console.log(`  - ${q}`);
console.log(`\nfield-coverage verdict: ${withContext.length === 0 && withOracleText.length === 0 ? "question-only — no descriptions or resolution rules exposed; curated track carries the risk spectrum (see FEEDBACK.md)" : "richer text available — revisit normalization"}`);
