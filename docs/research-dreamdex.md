# DreamDEX integration reference (research, 2026-08-19)

Sources: `docs.dreamdex.io` (via `llms.txt` index), live introspection + queries against
`https://dev.smk.somnia.host/v1/graphql`, and live browser checks of
`https://prd.oracle.somnia.host`. Every claim below is either a doc quote with URL or an
observed value from a query run during this research pass. Anything not directly observed
is marked **UNVERIFIED**.

## 1. Field-mapping table

Indexer field names match `DreamDexMarketRow` (per `docs/design/no-api.md`) 1:1 — no renaming
needed in the fetcher. Introspected types are from `__type(name: "Market")` against the live
schema.

| Indexer field (`Market`) | `DreamDexMarketRow` field | GraphQL type | Observed example | Notes |
|---|---|---|---|---|
| `marketId` | `marketId` | `String` | `"0x000...4754"` | 32-byte hex, zero-padded `bytes32`. Docs: "Key your state by `marketId` or symbol, never by pool address" (market-structure.md). |
| `question` | `question` | `String` (nullable) | `"BTC closes at or above its opening price"` | One-liner only. Gotchas doc: "Read typed fields like `asset` and `intervalSec` from creation events rather than parsing question text" — question wording is not a stable data source. |
| `context` | `context` | `String` (nullable) | `"0x"` | Empty on every observed row on the DreamDEX venue (confirms `FEEDBACK.md` #1). No description/resolution-rules text is populated anywhere in the schema for BINARY markets. |
| `marketType` | `marketType` | `markettype` (custom scalar, NON_NULL) | `"BINARY"` | Distinct values observed indexer-wide: `SPOT`, `PERP`, `BINARY`. Filter `marketType: {_eq: "BINARY"}` for event contracts. |
| `asset` | `asset` | `String` (nullable) | `"BTC"` / `"ETH"` | Only BTC/ETH observed on the DreamDEX testnet venue — matches docs ("BTC and ETH markets on 15-minute and 1-hour windows", trading/event-contracts.md). |
| `strike` | `strike` | `numeric` (nullable), serialized as string | `"0"` (opening-price binaries) / `"6416510"` (strike-ladder markets, different venue) | See §5. `"0"` means "vs. this window's own opening price," not a literal price target. |
| `intervalSec` | `intervalSec` | `numeric` (nullable), stringified | `"900"` / `"3600"` | See §3. On the DreamDEX venue, only 900 and 3600 observed (12/12 sampled rows). On other venueIds sharing this indexer, values are noisy (298, 297, 598, 599, 898 — see §3 caveat). |
| `tradingStart` | `tradingStart` | `numeric` (nullable), stringified unix seconds | `"1787187600"` | Window open time. |
| `expiry` | `expiry` | `numeric` (nullable), stringified unix seconds | `"1787191200"` | `expiry - tradingStart == intervalSec` exactly in every sampled row (see §3). |
| `clobStatus` | `clobStatus` | `clobmarketstatus` (custom scalar, nullable) | `"Trading"` / `"Finalized"` / `"Voided"` | Distinct values seen live: `Trading`, `Finalized`, `Voided`, `null` (null on non-BINARY rows). `"Locked"` returned **zero** rows in a direct query — see §6. |
| `venueId` | `venueId` | `String` (nullable) | `"0x679795a0195a1b76cdebb7c51d74e058aee92919b8c3389af86ef24535e8a28c"` | **This indexer serves ≥5 distinct `venueId`s** (found via `distinct_on: venueId`), plus `null`. Filtering by `venueId` first is mandatory — other venues have different `intervalSec` conventions and non-zero `strike` semantics (see §3, §5). |
| `oracleQuestionId` | `oracleQuestionId` | `numeric` (nullable), stringified | `"43549"` | **Unreliable as a settlement-question pointer in this snapshot** — 3/3 sampled ids resolved to a different, unrelated Prophecy Oracle question. See §4. |

Not part of `DreamDexMarketRow` but present in the schema and worth knowing about: `oracleQuestion`
(String, nullable) — always `null` on every sampled BINARY row (confirms FEEDBACK #1);
`winningOutcome` (Int), `payoutNumerators` (`[numeric]`), `payoutDenominator` (numeric) — useful
for settlement analytics, see §6; `voided` (Boolean, NON_NULL), `voidPolicy` (Int).

`clobmarketstatus` and `markettype` introspect as `SCALAR` with `enumValues: null` (Hasura is not
exposing them as GraphQL enums on this schema) — you cannot enumerate legal values via
introspection; only by observing distinct values on live rows (as done here).

## 2. Copy-paste query: list Trading + Finalized markets on the DreamDEX testnet venue

Verified working against `https://dev.smk.somnia.host/v1/graphql` (POST, JSON body
`{"query": "..."}`) on 2026-08-19.

```graphql
query DreamDexMarkets {
  Market(
    where: {
      venueId: { _eq: "0x679795a0195a1b76cdebb7c51d74e058aee92919b8c3389af86ef24535e8a28c" }
      marketType: { _eq: "BINARY" }
      clobStatus: { _in: ["Trading", "Finalized"] }
    }
    order_by: { createdAtTimestamp: desc }
    limit: 200
  ) {
    marketId
    question
    context
    marketType
    asset
    strike
    intervalSec
    tradingStart
    expiry
    clobStatus
    venueId
    oracleQuestionId
  }
}
```

Note the query filters `clobStatus` with a plain string list even though the field is a custom
scalar (`clobmarketstatus`) — Hasura accepts string literals for it the same way it does for a
real enum. `"Voided"` and `null` rows are excluded by this filter; add `"Voided"` to the `_in`
list if the analytics track needs voided markets too (recommended — see §6).

## 3. Distinguishing 15-minute vs. 1-hour windows

Use `intervalSec` directly: `900` = 15-minute window, `3600` = 1-hour window. `expiry -
tradingStart` is redundant with `intervalSec` — they agree exactly in every sampled row, so
either can be used, but `intervalSec` is the documented typed field (gotchas.md: "Read typed
fields like `asset` and `intervalSec` from creation events") and needs no arithmetic.

Two example rows, same `tradingStart`, different window on the DreamDEX venue:

| marketId | asset | intervalSec | tradingStart | expiry | expiry−tradingStart | window |
|---|---|---|---|---|---|---|
| `0x...4754` | BTC | `3600` | `1787187600` (2026-08-20 01:00:00 UTC) | `1787191200` (2026-08-20 02:00:00 UTC) | 3600 | 1-hour |
| `0x...4756` | BTC | `900` | `1787187600` (2026-08-20 01:00:00 UTC) | `1787188500` (2026-08-20 01:15:00 UTC) | 900 | 15-minute |

**Caveat (venue-scoped):** on a different `venueId` present in the same indexer
(`0x458b30c2d72bfd2c6317304a4594ecbafe5f729d3111b65fdc3a33bd48e5432d`), sampled `intervalSec`
values were `598, 598, 298, 298, 598, 298, 298, 599, 297, 298` — clustering near 300s/600s, not
900/3600, and with jitter (297–299, 598–599). Do not hardcode `intervalSec ∈ {900, 3600}` as a
global assumption; filter by the DreamDEX `venueId` before applying that bucketing, or bucket by
nearest round value with tolerance if supporting multiple venues.

## 4. Oracle explorer deep link

**Format works**: `https://prd.oracle.somnia.host/questions/{oracleQuestionId}?view=graph` — verified
in a real browser (WebFetch alone cannot render it; the page is a client-rendered Next.js app with
no discoverable JSON API — see below). The plain URL without `?view=graph` also resolves (loads the
same question with an "Info" tab active instead of "Graph"); the query param just selects the tab
client-side (raw HTML diff between the two is 6 lines, all client-routing state, no data
difference). A syntactically invalid/nonexistent id (`999999999999`) still returns HTTP 200 with
the same app shell — the route is a client-side catch-all, so **HTTP status cannot be used to
validate an id**; only rendering it (headless browser or manual check) tells you if a question
exists.

**No JSON API found.** Probed `api/questions/{id}`, `api/question/{id}`, `questions/{id}.json`,
`api/v1/questions/{id}`, `questions/{id}/graph` — all either 404 or silently caught by the
`/questions/[id]` client route (not real JSON, `content-type: text/html`). The page ships as a
Next.js RSC app (`x-powered-by: Next.js`, `vary: rsc, next-router-state-tree, ...`); a component
named `ChainGuard` in the bundle's script manifest suggests data may be sourced client-side (wallet
RPC or a private API), not from a public REST/RSC data endpoint. **UNVERIFIED**: whether an
authenticated/internal API exists — not probed further, to avoid brute-forcing endpoints.

**⚠ `oracleQuestionId` does not reliably point at the matching question — verified 3/3 mismatches:**

| DreamDEX market | Market's `oracleQuestionId` | What that id shows on the oracle explorer |
|---|---|---|
| `0x...4752`, BTC, Finalized, expiry 2026-08-20 01:00 UTC | `43533` | **"What will be the exact score of Newcastle United vs Liverpool on 23 Aug 2026?"** — a sports question, unrelated to BTC, resolution scheduled 2026-08-23 |
| `0x...4754`, BTC, Trading, expiry 2026-08-20 02:00 UTC | `43546` | "What will ETH price in USDC at unix time 1786832100?" — right asset-family shape (a price question) but wrong asset (ETH not BTC) and already resolved 2026-08-15, four days before the DreamDEX market that cites it even opens |
| `0x...4757`, ETH, Trading, expiry 2026-08-20 01:15 UTC | `43549` | "What will the ETH price in USDC be at unix time 1786833000 UTC?" — right asset this time, but resolved 2026-08-15, ~5 days before the citing market's own expiry |

Recommendation: do not surface the oracle deep link as a "verify this market's
settlement" feature until DreamDEX confirms whether `oracleQuestionId` is populated correctly on
this testnet snapshot — right now it looks like either stale/placeholder data or an id-space that
doesn't match what BINARY markets actually settle against.

**Settlement question structure** (observed on a resolved, unrelated-but-representative price
question, id `43549`, "What will the ETH price in USDC be at unix time 1786833000 UTC?"):
- Answer type: `numeric`, `decimals: 2`, one interval defined (`>= 0.00`).
- **Median-of-sources pipeline**, 6 independent exchange sources queried in parallel this run:
  `data-api.binance.vision`, `okx.com`, `api.bybit.com`, `api.kucoin.com`, `api.gate.io`,
  `api.mexc.com`. Each resolves via a named `extractNumber()` function against a JSON path (e.g.
  `data[0][4]`) — labeled "SOMNIA AGENT · COMPLETE" per source.
- Minimum successful sources required: **4 of 6** ("MIN SUCCESSFUL SOURCES"); this run reported
  6/6 OK, median `1883.85`.
- Individual source outputs on this run: 1883.30, 1883.67, 1883.80, 1883.91, 1883.94, 1883.96 —
  median of the six ≈ matches the posted 1883.85 (with the two middle values averaged, per the
  "MEDIAN (AVERAGED)" labels on two of the six rows).
- Resolution posted on-chain at a specific block (`block 386813769` in this example) with a
  `RESOLVED` timestamp a few seconds after `RESOLUTION` time.

This matches `no-api.md`'s framing (D2: "the settlement price is public the moment it exists") and
gives concrete color for D4 evidence quotes: "median of source values," "4 of 6 sources," etc., if
useful for anchor-library citations — but note this was observed on an **unrelated question id**,
not on a confirmed DreamDEX BTC/ETH settlement, given the mismatch above. **Treat the mechanism as
representative-but-unconfirmed for DreamDEX's own markets specifically.**

## 5. Strike interpretation

Live BINARY markets on the DreamDEX venue all show `strike: "0"` with question text "BTC/ETH
closes at or above its opening price" — i.e. the strike is *relative* (vs. this window's own open),
not an absolute price target, so `strike == "0"` is the expected/normal case there and does not
mean "missing data."

A **different venue** on the same indexer (`venueId`
`0x458b30c2d72bfd2c6317304a4594ecbafe5f729d3111b65fdc3a33bd48e5432d`, and also seen on
`0x1a1e6821...` / `0xcbc4e5fb02...`) runs absolute strike-ladder markets, e.g.:

| question (verbatim) | strike (raw) | strike ÷ 100 |
|---|---|---|
| `"Will BTC's price be at or above 64165.10 at unix time 1785926400?"` | `"6416510"` | `64165.10` |
| `"Will ETH's price be at or above 1870.65 at unix time 1785925200?"` | `"187065"` | `1870.65` |
| `"BTC at or above 6341665 at expiry"` (the `FEEDBACK.md` sample) | `"6341665"` | `63416.65` |

**Conclusion, high confidence:** `strike` is the real asset price **× 100** (i.e. 2 implied decimal
places / cents-of-a-dollar precision), for both BTC and ETH. Cross-checked three independent
question/strike pairs where the question text spells out the decimal price explicitly
(`64165.10`, `1870.65`) and the raw `strike` integer equals `price × 100` exactly in both cases;
the `FEEDBACK.md` sample (`"6341665"` → `$63,416.65`) is consistent with BTC's actual price range and needs no unit reinterpretation. No rounding or off-by-one observed in the two
directly-checked pairs. This "strike-ladder" style is **not observed on the currently-documented
DreamDEX testnet venue** (`0x679795a0...5e8a28c`) — it appears to belong to a different
venue/product sharing the same indexer. Caution: don't assume every venue on this indexer
uses the same strike convention as the one `no-api.md` documents; always branch on `venueId`.

## 6. Facts affecting a read-only analytics integration

- **Indexer lag is explicit and documented, not incidental.** `developers/event-contracts/gotchas.md`
  (docs.dreamdex.io): "Gate on the **on-chain** status, not the indexer" and
  `developers/event-contracts/market-structure.md`: "Status transitions are time-derived on-chain —
  read the market's live status before every write; the indexed status lags by seconds." For a
  read-only/no-write analytics tool this is lower-stakes than for a trading bot, but it means a
  `clobStatus` value in a cached score can be a few seconds stale relative to chain truth — acceptable
  for LevelField's use case (scoring, not order placement) but worth a one-line caveat wherever
  `clobStatus` is displayed.
- **Pool reuse**: "pools are recycled across successive windows of a series, so a pool address is a
  time-varying binding" (market-structure.md). Confirms `no-api.md`'s own guidance to key by
  `marketId`, never `poolAddress` — the indexer data agrees (each sampled market row has a distinct
  `poolAddress` even for the same asset/interval series).
- **Market respawn / rolling windows**: "Every window has a hard expiry; the venue rolls a
  successor automatically" (developers/event-contracts.md). Live data confirms this: e.g. the
  15-minute BTC series rolls forward in exact `intervalSec`-sized steps
  (`tradingStart` 1787184002 → 1787184900 → 1787185800 → 1787186700 → 1787187600, consecutive
  `marketId`s 0x474c, 0x474e, 0x4750, 0x4752, 0x4756). An analytics fetcher can rely on this to
  discover the "next" market in a series without re-querying from scratch.
- **`clobStatus` string values vs. the on-chain numeric enum**: `market-structure.md` documents
  the on-chain enum as `Listed(0) → Trading(1) → Locked(2) → Settling(3) → Resolved(4) | Voided(5)`,
  noting `Settling(3)` is "effectively never observable." The **indexer's** string values observed
  live are `"Trading"`, `"Finalized"`, `"Voided"`, and `null` (on non-BINARY rows). Two
  discrepancies worth flagging: (1) the indexer says `"Finalized"` where the on-chain enum's name
  is `Resolved(4)` — different vocabulary for the same terminal state; (2) `"Locked"` (on-chain
  state 2) returned **zero rows** in a direct `where: {clobStatus: {_eq: "Locked"}}` query against
  200+ recent markets — either the indexer never/rarely writes that string, or the state is too
  short-lived to be caught between indexer polls (consistent with the "lags by seconds" warning,
  since `Locked` only lasts until settlement posts). Do not rely on ever observing `"Locked"` via
  this indexer for a locked-market feature.
- **Voided markets are not enriched with payout data in the indexer.** Docs (settlement-and-voids.md)
  say voided markets have "both sides redeem at 0.5 USDso" — but the one live `clobStatus: "Voided"`
  row sampled has `winningOutcome: null`, `payoutNumerators: null`, `payoutDenominator: null`. The
  0.5/0.5 split is an on-chain redemption mechanic, not something the indexer surfaces numerically;
  an analytics tool cannot read the void payout ratio from `Market` alone.
- **`marketType` distinct values indexer-wide**: `SPOT`, `PERP`, `BINARY` — confirms `BINARY` is the
  correct filter for event contracts and that this indexer is shared infrastructure across
  DreamDEX's spot/perp/event-contract products, consistent with FEEDBACK #4's finding that the
  indexer URL was recovered from `dreamdex-bot-kit` rather than documented.
- **`payoutNumerators`/`payoutDenominator` on finalized markets**: e.g. `["0", "10000000"]` /
  `"10000000"` with `winningOutcome: 1` means outcome index 1 pays 100% (10000000/10000000 = 1.0),
  outcome 0 pays 0%. Useful if LevelField ever wants to backtest realized outcomes against risk
  scores without hitting the SDK.
- **Recipes doc** (`developers/event-contracts/recipes.md`) is SDK-method-oriented, not GraphQL —
  it documents `listBinaryMarkets({ status: "Finalized" })` and notes `loadMarkets()` excludes
  finalized markets by default. No GraphQL examples were present in that doc; the query in §2 was
  built directly against the live schema, not copied from docs.

## 7. New SDK/docs feedback candidates (since incorporated into `FEEDBACK.md`)

1. **`oracleQuestionId` does not reliably identify the matching settlement question on
   `prd.oracle.somnia.host`** — 3/3 sampled DreamDEX BINARY markets pointed to unrelated or
   mistimed oracle questions (one pointed at a football score market entirely). This breaks the
   "every market's settlement question is public on the oracle explorer" claim
   (trading/event-contracts/settlement-and-voids.md) for any tool trying to deep-link users to
   proof of settlement. See §4 for the three examples.
2. **The oracle explorer (`prd.oracle.somnia.host`) has no public JSON API** — it's a client-rendered
   Next.js app with no `/api/...` route found (several were probed) and no data in server-rendered
   HTML or the RSC payload. A read-only analytics tool that wants to show settlement provenance
   (sources, median, consensus) has to either screen-scrape a headless browser or get an
   undocumented API. Publishing a JSON endpoint for `GET /questions/{id}` would unblock this.
3. **`clobStatus: "Locked"` is effectively unobservable via the indexer** — a direct query for it
   against 200+ recent markets returned zero rows, even though it's a real on-chain state
   (`Locked(2)`). If the indexer is meant to reflect on-chain status (per its own field name), this
   state seems to be missed by the indexing/polling cadence; worth a note in the docs that
   `"Locked"` should not be relied on for indexer-driven UI (already implicitly true per the
   "indexer lags by seconds" gotcha, but worth being explicit that this specific state may never be
   caught).
4. **Voided markets have no payout data in the indexer** (`payoutNumerators`/`payoutDenominator`/
   `winningOutcome` all `null` on the one sampled `Voided` row) despite docs stating a concrete 0.5/0.5
   split. If third parties want to reconcile void payouts programmatically without a full node/SDK
   call, the indexer would need to expose this.
5. **Indexer schema mixes vocabulary with docs**: on-chain enum names the terminal settled state
   `Resolved(4)`; the indexer's `clobStatus` string for the same state is `"Finalized"`. Minor, but
   caused confusion while writing this doc — worth aligning naming or documenting the mapping
   explicitly.
6. (Confirms existing FEEDBACK #1 and #4 with fresh evidence) `context` is `"0x"` and
   `oracleQuestion` is `null` on every sampled row on the DreamDEX venue in this pass too — the gap
   described in FEEDBACK #1 has not changed as of 2026-08-19. The indexer URL and its multi-venue,
   undocumented nature (≥5 `venueId`s sharing one indexer, different strike/interval conventions
   per venue) reinforces FEEDBACK #4's ask for stable, documented indexer access — a
   third-party integrator has no way to discover the full venue list, or which venue is "the"
   DreamDEX testnet venue, without out-of-band information (as `no-api.md` currently hardcodes it).

## Unverified / not fully checked

- Whether an authenticated or internal JSON API backs `prd.oracle.somnia.host` (not probed beyond
  a handful of obvious paths, per scope).
- Whether `oracleQuestionId` mismatches (§4) are a testnet-only artifact (e.g. seed/test data with
  scrambled ids) or would also occur on mainnet — only testnet was available to check.
- Full enumeration of `clobmarketstatus` legal values beyond the four observed strings — the schema
  does not expose them via introspection (custom scalar, not a GraphQL enum), so only empirically
  observed values are listed.
- Whether the strike ×100 scaling in §5 holds for assets other than BTC/ETH — no other assets were
  observed on any venue in this indexer.
