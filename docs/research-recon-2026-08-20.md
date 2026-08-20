# Research recon — 2026-08-20

Three independent checks: competitive landscape on DoraHacks, DoraHacks submission mechanics,
and freshness of every external system LevelField depends on for its demo. Every claim below
carries an observed value, a URL, or is marked UNVERIFIED — nothing here is inferred from
memory of how these platforms "usually" work.

## §1 Competitive scan

**Source:** `https://dorahacks.io/hackathon/event-contracts/buidl`. Plain `curl`/WebFetch hit an
AWS WAF bot challenge (JS bundle requests returned a CAPTCHA `Human Verification` page; API-style
paths returned HTTP 405) — **WebFetch alone cannot render this page.** A real browser
(`mcp__Claude_Browser`) rendered it cleanly with no challenge.

**Observed, verbatim, 2026-08-20:**

> "No BUIDLs — There are no BUIDLs for this hackathon."

This is a definitive empty state, not a loading failure — the search box, sort control, and grid
toggle all rendered normally around it. The event timeline (also observed live) explains why:

| Phase | Timestamp |
|---|---|
| Pre-registration | 2026/08/17 20:00 |
| **Submission opens** | **2026/08/24 20:00** ("Submission starts in 4 days" banner, observed 2026-08-20) |
| Deadline | 2026/09/08 14:00 |

The "Submit BUIDL" button on the page is rendered but disabled/greyed out — consistent with
submissions not yet being open. **Hackers registered: 58** (from the "Hackers" tab counter) — so
there is real headcount, but nobody can submit a project yet.

### Competitive table

| BUIDL | Description | Category | Overlap vs. LevelField |
|---|---|---|---|
| *(none)* | — | — | — |

### Niche conclusion

**Not answerable yet, and that is itself the finding.** Zero BUIDLs exist for this hackathon as
of 2026-08-20 because the submission window has not opened (opens 2026-08-24 20:00 UTC, four days
from the observation date). Nobody — in the "protect the outsider" / risk-scoring niche or any
other — has a visible entry. A supplementary web search for public chatter about teams building
for this specific hackathon (`"Somnia" "DreamDEX" "Event Contracts Hackathon" project OR building
OR submission 2026`) returned only Somnia/DreamDEX's own announcement coverage, no third-party
project pre-announcements. This recon should be **re-run after 2026-08-24 20:00 UTC** once
submissions open — the current "no competitors" read is a timing artifact, not a durable
competitive fact, and should not be repeated in submission copy as if it were.

## §2 Submission mechanics

Source of truth for this specific hackathon: `https://dorahacks.io/hackathon/event-contracts/detail`
(rendered via real browser — WebFetch hit the same WAF challenge as §1). Generic DoraHacks
mechanics cross-checked against DoraHacks' own guide, `dorahacks.io/blog/guides/how-to-submit-a-buidl`.

**Verified (event-contracts hackathon page, observed 2026-08-20):**

- Required at submission: **GitHub/GitLab/Bitbucket link** and **demo video**, both flagged
  "Required" under "SUBMISSION REQUIREMENTS."
- Each team submits: working prototype on testnet, GitHub repo, **2–3 minute demo video**, and an
  **SDK/documentation feedback report**. Presentation deck is explicitly optional.
- Judging weights: Innovation & Originality 20%, Technical Implementation 25%, UX & Design 20%,
  Business & Ecosystem Impact 20%, Presentation & Demo 15%.
- Prize pool $5,000 USDso. Timeline: registrations opened 18 Aug; submission window 25 Aug – 8
  Sep 2026 (page banner said Sep 8 14:00 precisely).
- Team formation: a "Register as Hacker" flow and a "Join a Team" tab exist on the hackathon page;
  general DoraHacks guidance (not event-contracts-specific) says one team member registers the
  team with project details/members/UIDs, and hackathons commonly cap teams at 4 (occasionally
  4–6) — **UNVERIFIED for this specific hackathon**, no team-size cap is stated on the
  event-contracts detail page itself.

**Verified (DoraHacks general submission guide):**

- BUIDLs can be **edited after submission, up to the deadline** — DoraHacks' own guide: "You can
  edit any details of your project in 'Account-My BUIDLs'"; a separate DoraHacks guides page adds
  "you can submit your BUIDL early and continue editing until the submission deadline." This
  directly answers the "can BUIDLs be edited before the deadline" question: **yes.**
- After submission, status becomes "In review"; verification is manual (contact
  `@dorahacksofficial` on Telegram).
- Form guidance says to include full `http/https://` URLs for demo/social links — phrased
  generically, not restricted to a video-host whitelist.

**UNVERIFIED (could not find a platform-wide or event-specific statement):**

- Whether the demo-video field requires YouTube specifically, or accepts any video URL
  (Vimeo, Loom, Drive, etc.). No DoraHacks FAQ/help page stating a video-host restriction was
  found via search; the only concrete precedent found was a *different* hackathon (Bitcoin
  Hackathon) with its own bespoke 90-second-video rule, which does not transfer to this event.
  Recommendation: treat "any http(s) URL" as the working assumption but verify directly against
  the live submission form once it opens 2026-08-24.
- Description/tagline character or word limits — no source found stating a number for this
  platform or this hackathon. Mark UNVERIFIED; do not assume the current draft length in
  `docs/submission.md` is safe until the live form is checked.
- Exact team-size cap for this hackathon (see above).

## §3 Freshness check

### 3a. Indexer alive

`POST https://dev.smk.somnia.host/v1/graphql` with the exact query specified, run 2026-08-20:

- **HTTP 200.**
- Returned 3 rows, most recent first:

| marketId (suffix) | question | clobStatus | expiry (unix) | expiry (UTC) |
|---|---|---|---|---|
| `...4787` | ETH closes at or above its opening price | Trading | 1787205600 | 2026-08-20T06:00:00Z |
| `...4786` | BTC closes at or above its opening price | Trading | 1787205600 | 2026-08-20T06:00:00Z |
| `...4785` | ETH closes at or above its opening price | Finalized | 1787204700 | 2026-08-20T05:45:00Z |

- Observed wall-clock at query time: unix `1787205138` = 2026-08-20T05:52:18Z.
- The two `Trading` rows expire at 06:00:00Z, ~7.5 minutes **after** the observed query time —
  **confirmed: fresh Trading rows with future expiry exist right now.**

### 3b. New market types/venues since 2026-08-19

- `distinct_on: venueId` returned the **same 5 BINARY venueIds** as recorded in
  `docs/research-dreamdex.md` (`0x679795a0...`, `0x458b30c2...`, `0x1a1e6821...`, `0xcbc4e5fb...`,
  `0xcc69885f...`), plus `venueId: null` on `PERP` rows. **No new venue.**
- A query for BINARY-market questions containing neither `BTC` nor `ETH` (`_nlike: "%BTC%"` and
  `_nlike: "%ETH%"`) returned **zero rows.**
- `distinct_on: asset` returned only `BTC`, `ETH`, and `null` (on `PERP` rows).
- **Conclusion: no non-price / novel market category has appeared on this indexer.** The "major
  demo opportunity" scenario named in the task did not materialize as of this check.

### 3c. docs.dreamdex.io freshness vs. `docs/research-dreamdex.md`

Fetched `https://docs.dreamdex.io/llms.txt` (HTTP 200) and cross-read against the pages the prior
research doc cited (`gotchas.md`, `market-structure.md`, `event-contracts.md`, `recipes.md`,
`settlement-and-voids.md`). Findings:

- **Indexer GraphQL URL and a public venue registry are still undocumented.** Grepped every fetched
  page for `indexer`/`graphql`/`smk.somnia` — the word "indexer" appears (e.g. gotchas.md #1, #8:
  "the indexer lags by seconds," "a deployment hosts more than one venue... filter by the venue
  id") but **no page states the indexer's URL or a way to enumerate venues**, confirming
  `FEEDBACK.md` #4 is still an open, current gap — not fixed since 2026-08-19.
- **Two pages exist in the current llms.txt index that were not cited in the prior research doc:**
  - `developers/event-contracts/contracts-and-addresses.md` — publishes concrete addresses
    (identical testnet/mainnet via CREATE3): `BinaryMarketsModule
    0x3ecC694Cef705358864a646142ac17A90E29e388`, `MarketsCore
    0x2802504314685D89bF6C992CA5a8e7cC78bc0294`, `BinarySettlement
    0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23`, `OutcomeToken6909
    0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9`, `OracleHub
    0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b`, `CollateralRouter
    0xbC0C9834B15ACE38bB50dDaa7d7f7C7CC4DC183C`; collateral is USDso (mainnet, 18dp) vs. a
    faucet test USDC (testnet, 6dp). Explicitly warns never to hardcode market/pool addresses.
  - `trading/event-contracts/faq.md` — plain-language FAQ (price = implied Up probability, "line
    to beat" = window's own opening price, zero fees, exit any time pre-close, void-and-0.5-refund
    on feed failure, continuous window rollover, non-custodial funds, bot trading explicitly
    allowed with no rate limit).
- **`developers/event-contracts.md` now states a hard SDK floor:** "Use version 0.25.0 or newer.
  Anything below 0.23.0 no longer reads markets at all: the indexer dropped the `longOpenInterest`
  column those versions still ask for, so `loadMarkets` and `listBinaryMarkets` both fail."
  Checked against this repo: `package.json` pins `@somnia-chain/markets-sdk: ^0.27.0`, and
  `node_modules/@somnia-chain/markets-sdk/package.json` has installed `"version": "0.27.0"` —
  **LevelField is safely above the floor, verified directly, not assumed.**
- **New recipe, not previously recorded:** `recipes.md` § "Read a market's volume" — per-market
  `tradeCount` and traded volume are readable directly off a `listBinaryMarkets` row, no
  aggregation needed. Not currently used anywhere in LevelField (which deliberately avoids trading
  data per its own thesis), noted here only as a freshness delta, not a recommendation to adopt.
- No new event-contract categories are mentioned anywhere in the current doc set — consistent with
  §3b's live-query finding.

### 3d. Somnia Shannon RPC + explorer alive

- `POST https://dream-rpc.somnia.network` `eth_blockNumber` → **HTTP 200**,
  `result: "0x1bcb8c83"` = block **466,324,611**.
- `GET https://shannon-explorer.somnia.network/address/0xb8e11dea346f2c961880879606a269db3165bbc7`
  → HTTP 200, but the raw HTML is an empty Next.js shell (`__NEXT_DATA__.props.pageProps.apiData:
  null`) — **plain curl/WebFetch cannot confirm the page's content from this URL alone**, matching
  the same client-rendering pattern already documented for `prd.oracle.somnia.host` in
  `docs/research-dreamdex.md` §4.
  - Confirmed instead via the explorer's own Blockscout-style JSON API,
    `GET /api/v2/addresses/{address}` (HTTP 200): `"is_contract": true`, `"has_logs": true`,
    `"creation_transaction_hash": "0xa6947b332d8b4476e96f1997cc3545611ee7c7a810c2bbe466b5a9cdcb1a5574"`,
    `"creator_address_hash": "0x86767C6009e5f04236361b4022B8E41C3E2e0C37"`, **`"is_verified":
    false`** (source not verified on the explorer).
  - `GET /api/v2/addresses/{address}/transactions` (HTTP 200, single page, `next_page_params:
    null`): **7 transactions**, all method selector `0xabd2b1df`, all `status: "ok"`, most recent
    `2026-08-20T03:12:16Z`.
  - `GET /api/v2/addresses/{address}/logs` (HTTP 200, single page): **29 log entries** — close to
    but not exactly matching the README's claimed "28 legacy attestations published" (off by one;
    plausibly one non-attestation event, e.g. a constructor/ownership log, or the README count is
    stale by one entry). Consistent with a batched-publish design (7 txs → 29 logs means each tx
    writes multiple attestations, matching the repo's `score:all` + `publish-scores.ts` batch
    pattern).
  - **Net: the contract and its transaction/log history are real and live on Shannon, confirmed
    through the explorer's API — but the explorer's human-facing page cannot be confirmed by
    WebFetch/curl alone, and the contract source is not verified on-chain.**

## §4 Action candidates

1. **Contract source is unverified on the Shannon explorer** (`is_verified: false` via
   `/api/v2/addresses/{addr}`). A judge who opens the explorer link in the README will not see
   readable source, ABI, or a "Read/Write Contract" tab — verify `ScoreRegistry` on
   `shannon-explorer.somnia.network` before the submission deadline; this is independent of and in
   addition to the already-tracked `verify:onchain` provenance work.
2. **Do not claim "no competitors" in submission copy as a settled fact** — it is true only
   because the DoraHacks submission window (opens 2026-08-24 20:00 UTC) hasn't started; 58 hackers
   are already registered and could submit overlapping projects the moment it opens. Re-run the
   BUIDL-page check after 2026-08-24 and before finalizing any "first/only" positioning language.
3. **Verify the demo-video hosting requirement directly against the live submission form once it
   opens** (2026-08-24 20:00 UTC) rather than assuming YouTube-only or assuming no restriction —
   no authoritative source confirms either for this specific hackathon (§2 UNVERIFIED item).
4. **`FEEDBACK.md` #4 (undocumented indexer URL / no venue registry) remains valid and current**
   as of this check (§3c) — no doc update has addressed it; safe to keep citing as-is in the
   feedback report without re-verifying again before submission.
5. Given `docs.dreamdex.io/developers/event-contracts/contracts-and-addresses.md` now publishes
   canonical `BinaryMarketsModule`/`MarketsCore`/`OracleHub` addresses identical across
   testnet/mainnet via CREATE3, consider a one-line cross-check that LevelField's own DreamDEX
   integration (if it reads any of these addresses anywhere) matches this table — cheap
   verification against a page that wasn't in scope during the original integration research pass.
