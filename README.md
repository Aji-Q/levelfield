# LevelField

**Know who you're really betting against.**

LevelField assesses the *structural information-asymmetry risk* of prediction-market event
contracts — before you bet, from the contract text alone, with no trading data and
**no LLM API dependency**.

It does not predict outcomes, track smart money, or detect anomalies after the fact. It answers
one question: **does the structure of this event allow a group of people to know the answer
before you do — and is anything stopping them from trading on it?**

Built for the Somnia × DreamDEX Event Contracts Hackathon (2026).

## How it works

Two-stage pipeline; no model ever produces a number.

**Stage A — classification.** A contract is matched against a fixed, public
[anchor library](data/anchors/anchors.yaml) on five dimensions:

- **D1 Outcome Control** (30%) — what produces the outcome, from natural process to one person's will
- **D3 Insider Tradability** (25%) — whether the people who know early can trade on it
- **D2 Knowledge Circle** (20%) — how many people know before disclosure
- **D4 Disclosure Synchronicity** (15%) — whether everyone learns the outcome at once
- **D5 Outcome Manufacturability** (10%) — whether someone could cause the outcome to win a bet

Every classification must quote the contract's own text verbatim (mechanically verified as a
substring), and a code-level scanner — independent of any model's judgment — detects
instruction-like content addressed at automated assessors, flags it, and disqualifies any
evidence quote drawn from those sentences. A market creator can neither talk a model into
a low score nor have the attack text itself pass as evidence.

Stage A has three providers, none of which calls a paid API:

| Track | Provider |
|---|---|
| Live DreamDEX markets | Deterministic rules over typed on-chain fields (per official guidance, question text is never parsed) |
| Curated risk spectrum | [Reference classifications](data/classifications/) produced once via the open protocol, auditable in git |
| Any contract text | **Your agent's own model**, via the [LevelField MCP server](packages/mcp/) — the server hands out the protocol, verifies quotes, and computes; the host model classifies |

**Stage B — scoring (deterministic code).** Levels → weighted score 0–100 → band
(low / moderate / elevated / high), plus two circuit breakers:

- **CB-1:** outcome decided by one person not clearly barred from trading it → graduated floor 80/90/95 (by D3 level 3/4/5)
- **CB-2:** outcome manufacturable unilaterally by such a party → graduated floor 75/85/90; also trips at D2=1 with D5=5 (a manufacturer needs no disclosure lag)

Two cross-dimension rules are enforced deterministically in the engine (not just requested
of the classifier), and every adjustment is reported in the output's caveats.

Ambiguity never scores low: a dimension that can't be determined from the text defaults
conservatively to level 4 and is flagged.

The taxonomy follows the outcome-maker classification the Anti-Corruption Data Collective
validated against 435,000+ settled Polymarket markets ($54B volume, 2021–2026). Running the
full pipeline over live testnet markets plus the curated set reproduces that risk gradient
end-to-end with zero API calls: 3 (price binaries) → 19–21 (statistics, elections) → 49 (FOMC)
→ 65 (layoffs) → 78 (military) → 90 (individual-will, circuit breaker).

## Repository layout

```
packages/scoring/       two-stage pipeline: anchors, classifiers, voting, engine, DreamDEX fetcher
packages/mcp/           MCP server: assessment protocol + verification + scoring, zero LLM deps
apps/web/               Next.js UI: markets, per-market detail, methodology (reads the score cache)
data/anchors/           the anchor library (single source of truth, YAML)
data/curated/           curated contracts spanning the risk spectrum + injection test
data/classifications/   reference classifications (open protocol, quotes mechanically verified)
data/scores/            score cache written by score:all (in git for reproducible demos)
docs/design/no-api.md   architecture decision record
docs/research-dreamdex.md  verified integration reference (field mapping, gotchas, live findings)
FEEDBACK.md             SDK & docs feedback journal (hackathon deliverable, 11 evidence-backed entries)
```

## Quick start (no API key needed)

Requires Node.js 20.9 or newer (the current Next.js 16 runtime floor).

```bash
npm install
npm test                      # 69 unit/integration tests
npm run score:all             # score live testnet markets + curated set -> data/scores/
npm run dev -w @levelfield/web    # UI at localhost:3000
rm -rf apps/web/.next && npm run build -w @levelfield/web  # production build — the rm -rf is
                               # required if a `dev` session ran in this directory first, else
                               # `next build` can report success but leave a `.next/` with no
                               # BUILD_ID, which `next start` then refuses to serve
npm run mcp                   # stdio MCP server (see packages/mcp/README.md)
npx tsx scripts/probe-dreamdex.ts          # indexer field-coverage probe
npx tsx scripts/verify-classifications.ts  # re-verify all evidence quotes
# after setting the public repo/immutable commit and republishing provenance-complete attestations:
GITHUB_REPO=OWNER/REPO GITHUB_REF="$(git rev-parse HEAD)" npm run verify:onchain
```

## Status

- [x] Anchor library v1 (5 dimensions × 5 levels, reference cases)
- [x] Deterministic scoring engine + circuit breakers (unit-tested)
- [x] Rule classifier for live price binaries (typed fields only)
- [x] Reference classifications for the curated spectrum (40 quotes verified)
- [x] Batch scorer + score cache (live + curated, ACDC gradient reproduced)
- [x] MCP server (protocol / score / anchors), verified over stdio
- [x] Web UI (auditable snapshot, market evidence, methodology, local assessment workspace)
- [x] ScoreRegistry **deployed on Somnia Shannon**: [`0xb8e11dea346f2c961880879606a269db3165bbc7`](https://shannon-explorer.somnia.network/address/0xb8e11dea346f2c961880879606a269db3165bbc7) — 28 legacy attestations published. Before final release, set `GITHUB_REPO=owner/repo` and `GITHUB_REF` to the immutable submission commit SHA, republish the current score index to replace legacy placeholder URIs, then run `npm run verify:onchain` for a complete field-by-field read-back snapshot.
- [x] Validation harness: 16 contracts, category medians strictly ordered, Spearman ρ = 0.93 (docs/validation.md)
- [x] Inter-run agreement: 3 independent blind classifiers, majority-vote band matches the reference 16/16 (docs/agreement.md)
- [x] Final SDK feedback report (`docs/sdk-feedback-report.md`)
- [ ] Required 2–3 minute demo video
- [ ] Optional presentation deck

## What this is not

- Not a prediction of any outcome, and not trading advice.
- Not live insider detection: the score reflects the structural risk of the event type,
  not activity in a specific market right now.
- Not an accusation against any person or account.
