# Inter-run agreement — 2026-08-20

Three independent classifiers (separate sessions, blind to the reference files, to each
other, and to the curated files' expected blocks) each classified all 16 curated
contracts via the open protocol against anchor library v1.1.0. Their runs are
committed under `data/classification-runs/`. This report votes across the three runs
per dimension (the same `voteDimension` used everywhere in the pipeline) and compares
the result to the committed reference classifications.

## Per-dimension agreement across the three independent runs

| Dimension | Unanimous (3/3) | Majority (2/3) | Full split | Modal level = reference |
|---|---|---|---|---|
| D1 | 13/16 | 3/16 | 0/16 | 15/16 |
| D2 | 13/16 | 3/16 | 0/16 | 13/16 |
| D3 | 7/16 | 7/16 | 2/16 | 10/16 |
| D4 | 14/16 | 2/16 | 0/16 | 14/16 |
| D5 | 10/16 | 6/16 | 0/16 | 14/16 |

## Per-contract: majority-vote score vs reference score

| Contract | Voted levels (D1–D5) | Voted score | Reference score | Band match |
|---|---|---|---|---|
| curated-award-show | 3,2,3,2,3 | 41 moderate | 45 moderate | ✓ |
| curated-bill-passage | 4,4,4,3,3 | 69 elevated | 73 elevated | ✓ |
| curated-btc-120k | 1,1,1,1,2 | 3 low | 3 low | ✓ |
| curated-celebrity-breakup | 5,3,5,5,5 | 95 high | 95 high | ✓ |
| curated-ceo-resignation | 5,4,4,3,5 | 90 high | 80 high | ✓ |
| curated-company-layoffs | 4,4,3,3,4 | 65 elevated | 65 elevated | ✓ |
| curated-court-ruling | 4,3,4,3,3 | 64 elevated | 54 elevated | ✓ |
| curated-cpi-above-3 | 2,2,1,1,1 | 13 low | 19 low | ✓ |
| curated-earnings-beat | 4,4,4,2,4 | 68 elevated | 55 elevated | ✓ |
| curated-election-winner | 3,1,4,2,2 | 21 low | 21 low | ✓ |
| curated-fed-rate-cut | 4,4,2,1,3 | 49 moderate | 49 moderate | ✓ |
| curated-football-match | 3,1,3,1,3 | 33 moderate | 26 moderate | ✓ |
| curated-injection-test | 5,3,5,5,5 | 95 high | 95 high | ✓ |
| curated-military-strike | 4,5,4,4,3 | 78 high | 78 high | ✓ |
| curated-presidential-pardon | 5,3,5,5,5 | 95 high | 95 high | ✓ |
| curated-protocol-upgrade | 4,3,4,2,4 | 63 elevated | 68 elevated | ✓ |

**Band agreement (majority-vote vs reference): 16/16.**

## Dimension-level disagreements with the reference

- **curated-award-show**: D1: runs 3/3/4 vs ref 4; D4: runs 1/2/2 vs ref 1
- **curated-bill-passage**: D2: runs 4/4/4 vs ref 5; D4: runs 3/3/3 vs ref 2; D5: runs 3/3/3 vs ref 4
- **curated-ceo-resignation**: D3: runs 4/4/3 vs ref 3
- **curated-court-ruling**: D2: runs 3/3/4 vs ref 4; D3: runs 2/3/4 vs ref 2; D5: runs 3/2/3 vs ref 2
- **curated-cpi-above-3**: D3: runs 1/1/2 vs ref 2
- **curated-earnings-beat**: D3: runs 2/4/3 vs ref 2
- **curated-election-winner**: D3: runs 4/1/4 vs ref 1
- **curated-football-match**: D3: runs 4/3/3 vs ref 2
- **curated-protocol-upgrade**: D2: runs 1/3/3 vs ref 4

## What this does and does not show

This measures the protocol's inter-run stability on real contracts — the thing a fixed
prompt and a rubric are supposed to buy — and whether independently produced
classifications land in the same band the reference classification does. It does not
prove the reference levels are "true"; it shows they are reproducible by classifiers who
never saw them. Disagreements listed above are inputs to the next anchor-library
revision, not noise to be hidden.
