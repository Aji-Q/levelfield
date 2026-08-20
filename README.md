# LevelField

**Know who you're really betting against.**

LevelField assesses the *structural information-asymmetry risk* of prediction-market event
contracts — before you bet, from the contract text alone, with no trading data.

It does not predict outcomes, track smart money, or detect anomalies after the fact. It answers
one question: **does the structure of this event allow a group of people to know the answer
before you do — and is anything stopping them from trading on it?**

Built for the Somnia × DreamDEX Event Contracts Hackathon (2026).

## How it works

Two-stage pipeline; the model never produces a number.

1. **Stage A — classification (LLM).** A contract's text is matched against a fixed, public
   [anchor library](data/anchors/anchors.yaml) on five dimensions:
   - **D1 Outcome Control** (30%) — what produces the outcome, from natural process to one person's will
   - **D3 Insider Tradability** (25%) — whether the people who know early can trade on it
   - **D2 Knowledge Circle** (20%) — how many people know before disclosure
   - **D4 Disclosure Synchronicity** (15%) — whether everyone learns the outcome at once
   - **D5 Outcome Manufacturability** (10%) — whether someone could cause the outcome to win a bet

   Every classification must quote the contract's own text verbatim (mechanically verified as a
   substring — this also defends against prompt injection via market descriptions). Each contract
   is classified in 3 independent runs with per-dimension majority voting; disagreement downgrades
   confidence and resolves toward higher risk.

2. **Stage B — scoring (deterministic code).** Levels → weighted score 0–100 → band
   (low / moderate / elevated / high), plus two circuit breakers:
   - **CB-1:** outcome decided by one person who is free to trade it → score floor 90
   - **CB-2:** outcome manufacturable unilaterally by someone free to trade it → score floor 85

   Ambiguity never scores low: a dimension that can't be determined from the text defaults
   conservatively to level 4 and is flagged.

The taxonomy follows the outcome-maker classification the Anti-Corruption Data Collective
validated against 435,000+ settled Polymarket markets ($54B volume, 2021–2026).

## Repository layout

```
packages/scoring/   two-stage pipeline: anchors, classifier, voting, engine
data/anchors/       the anchor library (single source of truth, YAML)
data/curated/       curated contracts spanning the risk spectrum + injection test
scripts/tracer.ts   one contract end-to-end:  npx tsx scripts/tracer.ts <file> [--mock]
scripts/probe-dreamdex.ts   field-coverage probe of the Shannon testnet indexer
FEEDBACK.md         running SDK & docs feedback journal (hackathon deliverable)
```

## Quick start

```bash
npm install
npm test                                                  # 30 unit/integration tests
npx tsx scripts/tracer.ts data/curated/celebrity-breakup.json --mock   # no API key needed
cp .env.example .env                                      # add ANTHROPIC_API_KEY for live scoring
npx tsx scripts/tracer.ts data/curated/celebrity-breakup.json          # live 3-run scoring
npx tsx scripts/probe-dreamdex.ts                         # DreamDEX testnet field coverage
```

## Status

- [x] Anchor library v1 (5 dimensions × 5 levels, reference cases)
- [x] Deterministic scoring engine + circuit breakers (unit-tested)
- [x] 3-run majority-vote classifier with verbatim-quote verification
- [x] DreamDEX Shannon testnet field-coverage probe
- [ ] Live batch scoring of testnet markets
- [ ] Web UI (markets list, detail with evidence highlighting, methodology)
- [ ] MCP server (`assess_market`, `assess_contract_text`)
- [ ] On-chain ScoreRegistry attestations (Somnia Shannon)
- [ ] Validation run: 15 contracts vs the ACDC risk gradient, agreement stats

## What this is not

- Not a prediction of any outcome, and not trading advice.
- Not live insider detection: the score reflects the structural risk of the event type,
  not activity in a specific market right now.
- Not an accusation against any person or account.
