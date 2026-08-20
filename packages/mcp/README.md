# @levelfield/mcp

A stdio MCP server that exposes the LevelField structural information-asymmetry protocol
with **zero LLM API dependencies** — this server never calls a model, and needs no API key.

Instead it splits scoring the way `packages/scoring` already does: the calling model
(your MCP host — Claude Code, an agent, whatever) does the classification, and this
server verifies it and computes the score.

1. `get_assessment_protocol` hands the host model the same classification prompt, anchor
   library, and contract-data template that `packages/scoring`'s `ClaudeClassifier` uses.
2. The host model classifies the contract on its own, off-protocol.
3. `score_classification` mechanically checks every `evidence_quote` is a verbatim
   substring of the contract text, then runs the same deterministic engine
   (`computeScore` + `buildSummary` from `@levelfield/scoring`) that every other track uses.
4. `list_scored_markets` and `assess_market` read (and, for `assess_market`'s live-rule
   path, extend) the score cache described below — the fast path for "is this market
   risky" that doesn't require the host to classify anything itself.

See `docs/design/no-api.md` ("MCP protocol") for why this design exists — it's the
ad-hoc track for any contract text, alongside the rule-based live track and the curated
reference-file track.

## Tools

### `get_assessment_protocol`

No inputs. Returns one text block containing:
- the rendered Stage A system prompt (`buildSystemPrompt(loadAnchors(...))`) — the five
  dimensions, their five anchor levels each, and the classification rules
- the `<contract_data>` template (`renderContractData` with placeholder fields), so the
  host knows exactly how its contract text will be delimited
- the classification JSON shape the host must produce: five dimensions D1–D5, each
  `{ level: 1-5|null, level_label, evidence_quote, reasoning, confidence, insufficient_info }`,
  plus a top-level `instruction_like_content_detected`

The response text is explicit that the **caller's own model** performs the
classification — this tool only returns instructions, never a classification.

### `score_classification`

Inputs:

```ts
{
  question: string,
  description: string,
  resolution_rules: string,
  close_time?: string,        // ISO 8601
  market_id?: string,
  classifications: {          // exactly D1..D5, same shape as get_assessment_protocol's output
    D1: { level, level_label, evidence_quote, reasoning, confidence, insufficient_info },
    D2: { ... }, D3: { ... }, D4: { ... }, D5: { ... },
  },
  instruction_like_content_detected?: boolean,
}
```

Behavior:
1. Renders the contract text via `renderContractData` (identical to what
   `get_assessment_protocol` described).
2. For every dimension with a non-null `evidence_quote`, checks it's a verbatim substring
   (`isVerbatimQuote`, whitespace-insensitive). If any fail, returns an error result
   (`isError: true`) listing the failing dimensions and their quotes — **nothing is
   scored** until every quote checks out. Fix the quote and call again.
3. On success: converts the classification into a single-run vote per dimension
   (`voteDimension` on a length-1 array — always resolves to `agreement: "1/1"`), runs
   `computeScore` + `buildSummary`, and returns the full `ScoreResult` as JSON text.
   `metadata.model` is `"host-model via MCP protocol"`, `metadata.runs` is `1`, and
   `metadata.promptVersion` is a sha256 of the exact system prompt text (same formula
   `ClaudeClassifier` uses), so a promptVersion hash means the same thing across tracks.
   Standard caveats (`STANDARD_CAVEATS` from `packages/scoring`) are always included,
   plus one caveat per dimension that scored on `insufficient_info`.

### `list_anchor_library`

No inputs. Returns the fully parsed `data/anchors/anchors.yaml` as JSON — dimensions,
levels, weights, scoring bands, circuit breakers — for display or audit.

### `list_scored_markets`

Reads `data/scores/index.json` — a pure cache read, no network, no model. Inputs (both
optional):

```ts
{ band?: "low" | "moderate" | "elevated" | "high", source?: "dreamdex_testnet" | "curated" }
```

Returns `{ generatedAt, markets }`, where `markets` is the index entries matching the
given filters (an entry passes through unfiltered when a field is omitted). Each entry
has `marketId, question, source, overallScore, band, circuitBreaker, summary, expiry,
clobStatus, oracleQuestionId` — the same shape `scripts/score-all.ts` writes.

If the cache file doesn't exist yet, returns an error result telling you to run
`npm run score:all` from the repo root first.

### `assess_market`

Input: `{ market_id: string }`. Resolves a score for one market, in this order:

1. **Cached** — if `data/scores/{market_id}.json` exists, returns it verbatim with
   `note: "from cache"`.
2. **Scored live** — else, fetches the market's row from the DreamDEX indexer
   (`fetchMarkets({ marketId })`) and runs it through `toNormalizedContract` +
   `tryRuleClassify` (the same deterministic live-track classifier
   `scripts/score-all.ts` uses). If the row is rule-classifiable, scores it
   (`voteDimension` → `computeScore` → `buildSummary`, `metadata.model:
   "rule-classifier/v1"`, `runs: 1`) and returns the full `ScoreResult` with
   `note: "scored live, not cached"`. Nothing is written to the cache — that's
   `npm run score:all`'s job.
3. **Needs model classification** — else, if the market exists but the rule classifier
   declines it (not a plain DreamDEX price binary — see `docs/design/no-api.md`), returns
   a structured response:
   ```json
   {
     "status": "needs_model_classification",
     "message": "This market needs model classification — call get_assessment_protocol, classify the following contract text yourself, then call score_classification with your classification to get the score.",
     "market_id": "...", "question": "...", "description": "...", "resolution_rules": "...", "close_time": "..."
   }
   ```
   The embedded `question`/`description`/`resolution_rules` are the normalized contract
   text, ready to hand straight to the two-step protocol above — no extra fetch needed.
4. **Not found** — else, an error result naming both the cache path and the indexer
   lookup that came up empty.

A network failure while reaching the indexer returns an MCP error result naming the
`INDEXER_URL` override (the indexer is known-unstable); it never crashes the server.

## `npx tsx scripts/agent-demo.ts` (`npm run demo:agent`)

A narrated, deterministic pre-trade risk-check demo. It drives this MCP server over
stdio like any real host would (spawns `packages/mcp/src/server.ts` via
`@modelcontextprotocol/sdk`'s `Client` + `StdioClientTransport`), assesses one live
DreamDEX testnet market and one curated high-risk market, and applies a fixed
proceed/decline rule to each — see "for agent developers" below for the same rule. Both
markets resolve from the score cache, so the demo runs fully offline.

## Example call sequence

```
1. call get_assessment_protocol           -> read the prompt + template + output shape
2. (host model classifies the contract text against the anchor levels, off-protocol)
3. call score_classification with:
     { question, description, resolution_rules, close_time?, market_id?, classifications }
   -> if isError: fix the listed evidence_quote(s) verbatim and retry step 3
   -> else: a full ScoreResult (overallScore, band, circuitBreaker, summary, dimensions, caveats)
```

## Single-run design

`packages/scoring`'s `scoreContract` runs the classifier 3 times and majority-votes per
dimension to catch model inconsistency. This MCP server only ever sees **one**
classification per call (`runs: 1`, `agreement: "1/1"` on every dimension) — voting across
independent runs is a host-side concern here, not a server-side one.

A host that wants the same vote-stability guarantee can call the protocol 3 times (i.e.
run `get_assessment_protocol` classification independently 3 times), take its own
per-dimension majority across the 3 results, and submit only that majority classification
to `score_classification`.

## For agent developers: pre-trade hook pattern

The intended integration point is a single `assess_market` call before an order goes out
— block the trade on `elevated`/`high` bands and require an explicit human override to
proceed anyway. Pseudo-config for a trading agent's order pipeline:

```ts
// pseudo-config: hook into your agent's order pipeline before createOrder
async function beforeCreateOrder(order, { mcpClient, humanOverride }) {
  const result = await mcpClient.callTool({
    name: "assess_market",
    arguments: { market_id: order.marketId },
  });
  const assessment = JSON.parse(result.content[0].text);

  if (assessment.status === "needs_model_classification") {
    // Run the two-step protocol yourself (get_assessment_protocol -> classify ->
    // score_classification) before trading this market, or decline it.
    throw new Error(`${order.marketId} has no score yet — classify it first`);
  }

  const blocked = assessment.band === "elevated" || assessment.band === "high";
  if (blocked && !humanOverride) {
    throw new Error(
      `Blocked: ${order.marketId} scored ${assessment.overallScore}/100 (${assessment.band})` +
        `${assessment.circuitBreaker ? ` [${assessment.circuitBreaker}]` : ""}: ${assessment.summary}`,
    );
  }
  // low/moderate, or elevated/high with an explicit human override: proceed to createOrder.
}
```

`scripts/agent-demo.ts` (`npm run demo:agent`) runs exactly this decision rule — without
an override, and without ever placing an order — against one live market and one curated
high-risk market, and narrates the PROCEED/DECLINE outcome for each.

## Registering with Claude Code

```bash
claude mcp add levelfield -- npx tsx /ABS/PATH/TO/levelfield/packages/mcp/src/server.ts
```

Or via `.mcp.json`:

```json
{
  "mcpServers": {
    "levelfield": {
      "command": "npx",
      "args": ["tsx", "/ABS/PATH/TO/levelfield/packages/mcp/src/server.ts"]
    }
  }
}
```

Replace `/ABS/PATH/TO/levelfield` with this repo's absolute path. No environment
variables or API keys are required — the anchors.yaml path is resolved relative to the
server file itself via `import.meta.url`, so the server works from any working directory.

## Run it directly

```bash
npm install                             # from the repo root
npx tsx packages/mcp/src/server.ts      # or: npm run mcp
```
