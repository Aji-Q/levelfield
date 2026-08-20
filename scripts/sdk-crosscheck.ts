/**
 * Cross-checks the official @somnia-chain/markets-sdk against our own hand-rolled
 * GraphQL fetcher (packages/scoring/src/dreamdex.ts). SomniaMarkets is used strictly
 * READ-ONLY here — no privateKey is configured, so it never signs or sends anything.
 *
 * Loads the full market registry via exchange.loadMarkets(true), filters to active
 * binary markets on the DreamDEX testnet venue (DREAMDEX_TESTNET_VENUE, exported from
 * @levelfield/scoring), and diffs the resulting marketId set + question text against
 * our own fetchMarkets(). Prints a comparison table and a verdict.
 *
 * Per FEEDBACK.md #3, the SDK's dist build is not loadable under plain Node ESM
 * (extensionless relative imports resolve only under bundler-style resolvers) — run
 * this via tsx, not `node`.
 *
 *   npx tsx scripts/sdk-crosscheck.ts     (or: npm run sdk:crosscheck)
 *
 * Env: INDEXER_URL overrides the indexer endpoint both paths hit (default
 * https://dev.smk.somnia.host/v1/graphql).
 */
import { SomniaMarkets, isBinaryMarket, type BinaryMarket, type UnifiedMarket } from "@somnia-chain/markets-sdk";
import { somniaShannon } from "@somnia-chain/markets-sdk/chains";
import { DEFAULT_INDEXER_URL, DREAMDEX_TESTNET_VENUE, fetchMarkets, type DreamDexMarketRow } from "@levelfield/scoring";

const indexerUrl = process.env.INDEXER_URL ?? DEFAULT_INDEXER_URL;
const venue = DREAMDEX_TESTNET_VENUE.toLowerCase();

console.log("LevelField SDK cross-check: @somnia-chain/markets-sdk vs packages/scoring/src/dreamdex.ts");
console.log("=".repeat(88));
console.log(`indexer: ${indexerUrl}`);
console.log(`venue:   ${DREAMDEX_TESTNET_VENUE}\n`);

// --- our own fetcher (the hand-built GraphQL string dreamdex.ts sends) -----------------
console.log("[1/2] fetchMarkets({ indexerUrl }) -- our GraphQL query, clobStatus IN (Trading)...");
const ourRows = await fetchMarkets({ indexerUrl });
const ourById = new Map(ourRows.map((r) => [r.marketId.toLowerCase(), r]));
console.log(`      -> ${ourRows.length} row(s) (raw indexer status only, no liveness/expiry filter)\n`);

// --- the official SDK, strictly read-only ----------------------------------------------
console.log("[2/2] new SomniaMarkets({ indexerUrl, chain: somniaShannon }) -- no privateKey (read-only)...");
const exchange = new SomniaMarkets({ indexerUrl, chain: somniaShannon });

let allMarkets: Record<string, UnifiedMarket>;
try {
  allMarkets = await exchange.loadMarkets(true);
} finally {
  // Release the exchange's watches/sockets regardless of outcome so the process can exit.
  await exchange.close();
}

const sdkActiveOnVenue = Object.values(allMarkets)
  .filter((m): m is UnifiedMarket & { info: BinaryMarket } => m.type === "binary" && isBinaryMarket(m.info))
  .filter((m) => m.info.venueId?.toLowerCase() === venue)
  .filter((m) => m.active); // SDK's `active` = inside [tradingStart, expiry) and not Resolved/Voided

const sdkById = new Map(sdkActiveOnVenue.map((m) => [m.info.marketId.toLowerCase(), m]));
console.log(`      -> ${Object.keys(allMarkets).length} total market(s) loaded (all types, every venue)`);
console.log(`      -> ${sdkActiveOnVenue.length} active binary market(s) on the DreamDEX venue\n`);

// --- compare the two marketId sets ------------------------------------------------------
const ourIds = new Set(ourById.keys());
const sdkIds = new Set(sdkById.keys());
const common = [...ourIds].filter((id) => sdkIds.has(id));
const onlyOurs = [...ourIds].filter((id) => !sdkIds.has(id));
const onlySdk = [...sdkIds].filter((id) => !ourIds.has(id));

console.log("Comparison table");
console.log("-".repeat(88));
console.log(
  `${"metric".padEnd(46)}${"our fetchMarkets() (status=Trading)".padEnd(38)}SDK loadMarkets() (active)`,
);
console.log(`${"market count".padEnd(46)}${String(ourRows.length).padEnd(38)}${sdkActiveOnVenue.length}`);
console.log(`${"marketId set equal?".padEnd(46)}${(onlyOurs.length === 0 && onlySdk.length === 0 ? "yes" : "no").padEnd(38)}`);
console.log(`${"in common".padEnd(46)}${common.length}`);
console.log(`${"only in ours (stale \"Trading\" rows)".padEnd(46)}${onlyOurs.length}`);
console.log(`${"only in SDK's active set".padEnd(46)}${onlySdk.length}\n`);

console.log(`Sample of the ${Math.min(8, common.length)} common market(s) (question text agreement):`);
let questionMismatches = 0;
for (const id of common.slice(0, 8)) {
  const ours = ourById.get(id) as DreamDexMarketRow;
  const sdk = sdkById.get(id)!.info;
  const match = (ours.question ?? "") === sdk.question;
  if (!match) questionMismatches++;
  console.log(`  ${id}`);
  console.log(`    ours: ${JSON.stringify(ours.question)}`);
  console.log(`    sdk:  ${JSON.stringify(sdk.question)}  ${match ? "(match)" : "(MISMATCH)"}`);
}
for (const id of common.slice(8)) {
  if ((ourById.get(id)!.question ?? "") !== sdkById.get(id)!.info.question) questionMismatches++;
}
console.log();

if (onlyOurs.length > 0) {
  const sample = onlyOurs.slice(0, 5).map((id) => {
    const r = ourById.get(id)!;
    return `${id}  expiry=${r.expiry ? new Date(Number(r.expiry) * 1000).toISOString() : "null"}  clobStatus=${r.clobStatus}`;
  });
  console.log(`Rows only our fetcher returns (indexer says "Trading" but SDK's active window disagrees), sample:`);
  for (const line of sample) console.log(`  ${line}`);
  console.log();
}

// --- verdict -----------------------------------------------------------------------------
console.log("Verdict");
console.log("-".repeat(88));
if (onlyOurs.length === 0 && onlySdk.length === 0) {
  console.log("marketId sets AGREE exactly.");
} else {
  console.log(
    `marketId sets DISAGREE: our raw clobStatus="Trading" filter returns ${ourRows.length} row(s); the SDK's ` +
      `time-window "active" derivation (tradingStart <= now < expiry, not Resolved/Voided — computed from ` +
      `timestamps, NOT the indexed status) returns ${sdkActiveOnVenue.length}. This corroborates ` +
      `docs/review-2026-08-20.md §1.3: most "Trading" rows on this venue are expired zombies the indexer never ` +
      `transitioned to "Finalized"; clobStatus alone is not a liveness signal on this venue.`,
  );
}
console.log(
  questionMismatches === 0
    ? `Question text for all ${common.length} common market(s) matches exactly between the two paths.`
    : `${questionMismatches}/${common.length} common market(s) have DIFFERING question text between the two paths.`,
);

// subtle: exchange.close() (above, in the finally) does not release every handle the SDK
// opens during loadMarkets() -- something in its viem WebSocket transport or indexer
// client keeps an active libuv handle, so the process hangs after this point instead of
// exiting on its own (verified: it prints every line above, then never returns to the
// shell). Force the exit explicitly rather than let a cross-check script become a stuck
// process. See FEEDBACK.md for the dated entry.
process.exit(0);
