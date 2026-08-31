# DreamDEX SDK & documentation feedback report

Submitted alongside LevelField for the Somnia × DreamDEX Event Contracts Hackathon. Source
material is `FEEDBACK.md` (the running log kept during the build, 11 evidence-backed entries)
and `docs/research-dreamdex.md` (the field-mapping reference). Every claim below traces back
to a command, a query, or a file:line already in one of those two documents — nothing here is
new evidence, only reorganized for a reviewer with limited time.

## Executive summary

We integrated against four DreamDEX surfaces over two days: the Shannon testnet indexer
(direct GraphQL, `https://dev.smk.somnia.host/v1/graphql`), the official
`@somnia-chain/markets-sdk` (read-only client, no private key, exercised for real via
`scripts/sdk-crosscheck.ts`), the Prophecy oracle explorer (`prd.oracle.somnia.host`), and
`docs.dreamdex.io`. The indexer and the SDK agree with each other everywhere both apply — the
SDK's own market registry and our hand-rolled GraphQL fetcher return byte-identical question
text for the same market ids, and cross-checking the SDK's timestamp-derived liveness flag
against our raw `clobStatus` filter surfaced a real bug in *our own* live-market selector, not
in DreamDEX's data. The friction was concentrated in three places instead: the API exposes no
settlement text for BINARY markets, the one field that looks like a "verify this market"
pointer (`oracleQuestionId`) does not reliably point at the right thing, and there is no way
to discover which of the indexer's several venues is "the" DreamDEX venue without an
out-of-band config file. All three forced concrete, load-bearing changes to LevelField's
architecture, detailed below.

## The four findings that blocked or redirected our build

### 1. No settlement text is available through the public API (FEEDBACK #1)

**Observed:** Querying the 200 most recent BINARY markets on the DreamDEX venue: `context` is
`0x` (empty) on 200/200 rows, and `oracleQuestion` text is `null` on 200/200 rows. The `Market`
schema has fields for both (`context`, `oracleQuestion`), but nothing populates them beyond the
one-line `question` string (e.g. `"BTC closes at or above its opening price"`).

**What it forced us to change:** LevelField's entire pitch is "assess a contract from its text
alone" — but DreamDEX's own live markets have no description or resolution-rules text to read.
This is the reason `docs/design/no-api.md` specifies three separate Stage A providers instead
of one LLM-reads-the-text pipeline: the live DreamDEX track (`tryRuleClassify`) classifies off
typed on-chain fields only (`marketType`, `asset`, `venueId`) and never touches question text;
the curated risk-spectrum track exists specifically because DreamDEX cannot supply text for
anything beyond a price binary (see finding 4); and the MCP ad-hoc protocol only works when the
*caller* supplies contract text, because the server has none of its own to offer for a live
DreamDEX market.

**Fix we suggest:** Populate `context` (or a dedicated field) with the market's real
description and resolution criteria for BINARY markets. Until that exists, no third-party risk,
compliance, or analysis tool — ours included — can operate on a live DreamDEX market from the
public API alone; every such tool will independently reinvent the same typed-fields workaround.

### 2. `oracleQuestionId` does not reliably identify the matching settlement question (FEEDBACK #6)

**Observed:** 3/3 sampled DreamDEX BINARY markets carried an `oracleQuestionId` that resolves
on `prd.oracle.somnia.host` to an unrelated or mistimed question: one BTC market's id pointed
at "What will be the exact score of Newcastle United vs Liverpool on 23 Aug 2026?" — a sports
question, no relation to BTC; two others pointed at ETH price questions resolved days before the
citing market even opened (full table: `docs/research-dreamdex.md` §4).

**What it forced us to change:** We had originally built `toNormalizedContract`'s market
description around a per-market oracle deep link
(`https://prd.oracle.somnia.host/questions/{oracleQuestionId}?view=graph`) as the "verify this
market's settlement" affordance the docs describe. Once the 3/3 mismatch was confirmed, we
removed the per-market link entirely. `packages/scoring/src/dreamdex.ts` now points only at the
oracle explorer's root, with the removal reasoned in a comment at the point of use:

```ts
// Explorer root only — per-market oracleQuestionId deep links proved unreliable
// (3/3 sampled ids pointed at unrelated questions; docs/research-dreamdex.md §4).
const ORACLE_EXPLORER_ROOT = "https://prd.oracle.somnia.host/explore";
```

**Fix we suggest:** Fix the indexer's id mapping so `oracleQuestionId` names the question a
market actually settles against — or, if this is a testnet-only seed-data artifact, document
that explicitly so integrators know not to build a settlement-verification feature on it, as we
initially did.

### 3. Venue discovery requires out-of-band information (FEEDBACK #9)

**Observed:** The shared indexer serves at least 5 distinct `venueId`s with materially
different conventions on the same schema (strike is price×100 on a strike-ladder venue;
`strike: "0"` means "relative to this window's own opening price" on the DreamDEX venue).
Nothing in the API or the docs enumerates venues or identifies which one is "the" DreamDEX
venue — the id had to be copied out-of-band from `dreamdex-bot-kit/packages/ec-core/src/config.ts`,
a file whose own comments say the venue id "moved three times in the first week of August."

**What it forced us to change:** `DREAMDEX_TESTNET_VENUE` is a hardcoded bytes32 literal in
`packages/scoring/src/dreamdex.ts`, sourced the same out-of-band way. Every LevelField code path
that touches live data depends on this one constant staying correct: the live scorer
(`scripts/score-all.ts`), the MCP server's `assess_market`/`list_scored_markets` tools, and
today's `scripts/sdk-crosscheck.ts` all filter on it, and nothing in our stack — or in
DreamDEX's API — can detect if it goes stale again. It would fail silently: a wrong venue id
returns zero rows, not an error.

**Fix we suggest:** Publish a documented venue registry endpoint (id, name, conventions) on a
stable domain, so this stops being a constant every integrator has to independently reverse
out of an internal tool's config comments.

### 4. Testnet event contracts are a single template (FEEDBACK #2)

**Observed:** 200 recent binary markets on the DreamDEX venue collapse to 2 distinct question
strings (BTC/ETH open-close), plus strike-ladder variants on other venues. There are no
non-price event contracts (news, sports, politics, corporate) on the testnet venue at all.

**What it forced us to change:** LevelField's risk taxonomy has no way to demonstrate range
against live DreamDEX data — every real market scores 3/100 (low), the safest structure a
prediction market can have. The entire curated risk spectrum (16 contracts in
`data/curated/`, spanning sports, awards, court rulings, pardons, corporate earnings, protocol
governance) exists only because DreamDEX itself has nothing beyond price binaries to score
against. It also forces a narrative choice on the front page and demo: rather than showing a
live spread of scores, we have to explicitly argue that 3/100 is the *correct* null result for
the current product and frame the curated set as "the risk map for what DreamDEX lists next"
— a more complex pitch than "here's our tool scoring
your real markets," made necessary by the absence of any real non-price market to point at.

**Fix we suggest:** Seed the testnet venue with a handful of non-price demonstration markets so
tools whose behavior varies by event type — risk scoring (ours), categorization, discovery,
recommendation — have something to differentiate against beyond bitcoin's opening price.

## Remaining findings

| # | Observed | Suggestion |
|---|---|---|
| 3 | `@somnia-chain/markets-sdk`'s dist build is not loadable under plain Node ESM (`node --input-type=module` throws `ERR_MODULE_NOT_FOUND` for `dist/errors` — extensionless relative imports). Works under tsx/Vite/Next. | Emit `.js` extensions in relative dist imports, or ship a `moduleResolution`-safe build. |
| 4 | The indexer GraphQL URL appears nowhere in `docs.dreamdex.io`; recovered from `dreamdex-bot-kit`'s config, which itself warns the URL "moves." | Publish the indexer URL(s) per network next to the documented REST/WS endpoints, or proxy under `api.dreamdex.io`. |
| 5 (positive) | `SomniaMarkets` accepts an indexer-only, signerless config for read-only use — confirmed directly during our cross-check run (`new SomniaMarkets({ indexerUrl, chain: somniaShannon })`, no `privateKey`, worked exactly as documented). | Worth stating explicitly in the docs, which currently only show full trading configs. |
| 7 | The oracle explorer (`prd.oracle.somnia.host`) has no public JSON API — client-rendered Next.js app, no `/api/...` route found, no data in the RSC payload. | Publish a `GET /questions/{id}` JSON endpoint for settlement provenance (sources, median, consensus threshold). |
| 8 | Indexer status vocabulary diverges from the documented on-chain enum: indexer says `"Finalized"` for on-chain `Resolved(4)`; `"Locked"` returned zero rows across 200+ recent markets despite being a real on-chain state; the one sampled `Voided` row has null payout fields despite docs promising a 0.5/0.5 split. | Document the indexer↔on-chain status mapping explicitly; populate void payout data. |
| 10 | Cross-checking the SDK against our own fetcher (`scripts/sdk-crosscheck.ts`): the SDK's `active` flag is derived from `tradingStart`/`expiry` timestamps, not from `clobStatus`. On the DreamDEX venue at cross-check time, raw `clobStatus IN (Trading)` returned 500 rows; the SDK's timestamp-derived `active` filter over the same venue returned 8 — and all 8 matched our fetcher's rows exactly (marketId and question text both agree). | Not a DreamDEX action item — this is the SDK correctly working around the same indexer status-lag problem documented in #8. Flagged here because it's new evidence for that finding, gathered independently via a second client. |
| 11 | `SomniaMarkets.close()` does not release every handle the SDK opens during `loadMarkets()`; a read-only script with no other open handles does not exit the process after `close()` resolves until `process.exit()` is called explicitly. Separately, `loadMarkets()` has no venue/marketType filter — a single-venue read still pages through the SDK's entire shared registry (551 markets, every venue, every type at the time of the run). | Release the lingering handle inside `close()` (likely the viem WebSocket transport), or document that short-lived scripts must call `process.exit()`. Add an optional `loadMarkets({ venueId, marketType })` filter for the single-venue read-only case. |

## What worked well

- **Read-only SDK configuration needs no private key or WebSocket setup beyond the chain
  definition** (FEEDBACK #5, confirmed today by actually using it): `new SomniaMarkets({
  indexerUrl, chain: somniaShannon })` — no `privateKey`, no explicit `wsRpcUrl` (the shipped
  `somniaShannon` chain definition already carries one) — was enough to load the full market
  registry and cross-check it against our own data. This is exactly the shape an analytics tool
  needs, and it worked on the first attempt once the ESM-loadability workaround (run via tsx,
  finding 3) was applied.
- **The SDK and the raw indexer agree.** Every market both paths considered "active" matched
  exactly on `marketId` and `question` text, with zero transcription drift. For a hackathon
  judge deciding whether to trust either data path, that agreement — reached independently, by
  two differently-written clients hitting the same indexer — is stronger evidence than either
  client's own tests could provide alone.
- **`docs.dreamdex.io`'s gotchas page earned its keep.** Gotcha #13 ("read typed fields like
  `asset` and `intervalSec` from creation events rather than parsing question text") is the
  single piece of documentation that shaped LevelField's live-track architecture the most
  directly — it is the reason the rule classifier never touches `question`, and it turned out to
  be exactly correct once we found the question-text collisions in finding 4.
