# LevelField no-API architecture (decision record, 2026-08-20)

LevelField runs with **zero LLM API dependencies**. The two-stage pipeline is unchanged
(labels first, deterministic scoring second) but Stage A now has three interchangeable
providers instead of a paid API call:

| Track | Stage A provider | Used for |
|---|---|---|
| Live (DreamDEX testnet) | `tryRuleClassify` — deterministic rules over typed market fields | All current event contracts (BTC/ETH price binaries) |
| Curated | Reference classification files in `data/classifications/` (produced once via the open protocol, auditable, in git) | The risk-spectrum demo + validation set |
| Ad-hoc (any contract text) | **The caller's own model**, via the LevelField MCP server's two-step protocol | Agents, Claude Code, any MCP host |

`ClaudeClassifier` stays in the codebase as an optional pluggable provider for users who
have a key; nothing defaults to it.

## Why rules are correct (not a shortcut) for the live track

Official docs, Gotcha #13: market creation events carry typed `asset` and `intervalSec`
fields; question wording has changed several times and "do not parse the question text."
DreamDEX event contracts are, by product definition, Up/Down markets on crypto prices
with on-chain multi-source oracle settlement (see docs.dreamdex.io/trading/event-contracts).
Structurally that pins every dimension:

- D1 = 1 (natural_process — exchange market price, no identifiable controller)
- D2 = 1 (none — the settlement price is public the moment it exists)
- D3 = 1 (cross-dimension rule: no early-knowledge window, no insider to constrain)
- D4 = 1 (fixed_schedule — hard window expiry, oracle publishes on schedule, auditable at
  `https://prd.oracle.somnia.host/questions/{oracleQuestionId}?view=graph`)
- D5 = 2 (prohibitively_costly — moving global BTC/ETH price dwarfs any bet)

Score: 3/100, band low. The rule classifier MUST gate on the typed fields
(`marketType == "BINARY"`, `asset` in a known price-asset set, DreamDEX venue) and return
`null` for anything it cannot prove is a price binary — unknown market shapes fall through
to the LLM protocol, never to a guessed rule score.

## MCP protocol (two-step, host-model classification)

The MCP server owns the anchors and the math; the host owns the model. Tools:

1. `get_assessment_protocol` → the rendered classification prompt (from `buildSystemPrompt`),
   the `<contract_data>` template, and the expected classification JSON shape. The host model
   performs the classification itself.
2. `score_classification` → input: contract text fields + the five per-dimension
   classifications. The server mechanically verifies every `evidence_quote` is a verbatim
   substring (`isVerbatimQuote`); on failure it returns a structured error telling the host
   which dimension to fix. On success: `computeScore` + `buildSummary` → full ScoreResult.
   `metadata.model` records `"host-model via MCP protocol"`; `runs: 1`.
3. `list_anchor_library` → the full anchor YAML as JSON, for display/audit.

Voting note: the MCP path is single-run by design (the host can call the protocol multiple
times and submit a majority itself; see "Single-run design" in packages/mcp/README.md).

## Shared data contracts

### DreamDexMarketRow (indexer → us)

```ts
export interface DreamDexMarketRow {
  marketId: string;
  question: string | null;
  context: string | null;        // observed "0x" (empty) on testnet
  marketType: string;            // "BINARY" for event contracts
  asset: string | null;          // "BTC" | "ETH" on current venue
  strike: string | null;
  intervalSec: string | null;
  tradingStart: string | null;
  expiry: string | null;         // unix seconds, stringified numeric
  clobStatus: string | null;     // "Trading" | "Locked" | "Finalized" | ...
  venueId: string | null;
  oracleQuestionId: string | null;
}
```

Indexer: `https://dev.smk.somnia.host/v1/graphql` (env `INDEXER_URL` override; the URL is
known-unstable). DreamDEX testnet venue id:
`0x679795a0195a1b76cdebb7c51d74e058aee92919b8c3389af86ef24535e8a28c`.

### Reference classification file (`data/classifications/{marketId}.json`)

```json
{
  "marketId": "curated-cpi-above-3",
  "classifier": "claude-fable-5 (reference classification via LevelField protocol)",
  "classifiedAt": "2026-08-20",
  "instructionLikeContentDetected": false,
  "dimensions": {
    "D1": { "level": 2, "levelLabel": "statistical_procedure", "evidenceQuote": "...verbatim substring...", "reasoning": "...", "confidence": "high", "insufficientInfo": false }
  }
}
```

All five dimensions required. `evidenceQuote` must pass `isVerbatimQuote` against
`renderContractData(contract)` of the matching `data/curated/{id}.json` — the batch scorer
asserts this and crashes loudly on violation.

### Score cache (`data/scores/`)

- `data/scores/{marketId}.json` — one full `ScoreResult` per market (type in
  `packages/scoring/src/types.ts`).
- `data/scores/index.json` — `{ generatedAt: string, markets: ScoreIndexEntry[] }` where
  `ScoreIndexEntry = { marketId, question, source, overallScore, band, circuitBreaker,
  summary, expiry?: string | null, clobStatus?: string | null, oracleQuestionId?: string | null }`.

The web app reads ONLY the score cache (no network at request time). The `/assess` workspace
supports ad-hoc contracts without adding a model API: it prepares the open classification task,
accepts JSON pasted back from the user's model, then verifies quotes and scores locally in the
browser.

## What did NOT change

Anchor library, engine weights, circuit breakers, conservative defaults, vote logic,
verbatim-quote defense, output schema. All still the single sources of truth in
`packages/scoring` + `data/anchors/anchors.yaml`.
