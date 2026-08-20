# LevelField validation report

Generated 2026-08-20 by `scripts/validate.ts`. Reads `data/scores/index.json` (produced by
`scripts/score-all.ts`) and each curated contract's `expected.category` field
(`data/curated/*.json`); does not itself run any classification.

## Method and its honest limits

This report checks two things, both against the **curated** contract set only (the live
DreamDEX track has no category label and is excluded from every table below):

1. **Category median ordering** — do median scores rise in the order the ACDC taxonomy
   predicts (`market_data ≤ statistical ≤ public < institutional < individual`)?
2. **Spearman rank correlation** — across all scored curated contracts, does a contract's
   score rank track its category's expected rank?

Neither check is proof that LevelField's scores predict real-world insider activity. The
reference classifications behind the scored contracts are **single-run by design** — one
classification per contract, not a majority vote across independent runs (that only happens
for live/ad-hoc contracts via `voteDimension`, see `packages/scoring/src/vote.ts`) — so a
single misjudged dimension moves a contract's score with no averaging to catch it. The
category labels themselves are also single-run, hand-assigned judgment calls, not an
independent ground truth. What this report actually supports is a narrower claim:
**LevelField's deterministic scoring engine reproduces, from category-blind per-dimension
levels, an ordering consistent with the taxonomy ACDC validated against 435,000+ settled
Polymarket markets** (`data/anchors/anchors.yaml`). It is evidence of internal consistency
with that taxonomy, not external validation of predictive power, and the sample size (currently
16 scored curated contracts) is far too small to support a statistical claim
on its own.

## Coverage

16/16 curated contracts are scored. Contracts below are missing a
`data/classifications/{marketId}.json` reference classification and were skipped by
`score-all.ts`; they are excluded from every table below except the last.

- (none — every curated contract has a classification)

## 1. Category median ordering

| category | n scored | median score |
|---|---|---|
| market_data | 1 | 3 |
| statistical | 1 | 19 |
| public | 2 | 20.5 |
| institutional | 8 | 60 |
| individual | 4 | 90 |

| adjacent pair | median A | median B | result |
|---|---|---|---|
| market_data <= statistical | 3 | 19 | PASS |
| statistical <= public | 19 | 20.5 | PASS |
| public < institutional | 20.5 | 60 | PASS |
| institutional < individual | 60 | 90 | PASS |

## 2. Spearman rank correlation

rho = 0.911, n = 16.

Computed as the Pearson correlation of tie-aware ranks (average rank within ties) between
each contract's `overallScore` and its category's position in the ACDC order
(market_data=1 … individual=5). Ties are expected and handled explicitly: multiple contracts
can share a category (e.g. `institutional`).

## 3. Circuit breaker hits

| marketId | category | score | circuit breaker |
|---|---|---|---|
| curated-celebrity-breakup | individual | 90 | CB-1 |
| curated-injection-test | individual | 90 | CB-1 |
| curated-presidential-pardon | individual | 90 | CB-1 |

## 4. All curated markets

| marketId | category | score | band | circuit breaker | status |
|---|---|---|---|---|---|
| curated-award-show | institutional | 45 | moderate | — | scored |
| curated-bill-passage | institutional | 73 | elevated | — | scored |
| curated-btc-120k | market_data | 3 | low | — | scored |
| curated-celebrity-breakup | individual | 90 | high | CB-1 | scored |
| curated-ceo-resignation | individual | 75 | high | — | scored |
| curated-company-layoffs | institutional | 65 | elevated | — | scored |
| curated-court-ruling | institutional | 54 | elevated | — | scored |
| curated-cpi-above-3 | statistical | 19 | low | — | scored |
| curated-earnings-beat | institutional | 55 | elevated | — | scored |
| curated-election-winner | public | 21 | low | — | scored |
| curated-fed-rate-cut | institutional | 49 | moderate | — | scored |
| curated-football-match | public | 20 | low | — | scored |
| curated-injection-test | individual | 90 | high | CB-1 | scored |
| curated-military-strike | institutional | 78 | high | — | scored |
| curated-presidential-pardon | individual | 90 | high | CB-1 | scored |
| curated-protocol-upgrade | institutional | 68 | elevated | — | scored |
