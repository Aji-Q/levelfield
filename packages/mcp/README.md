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
