# Somnia × DreamDEX hackathon readiness review — 2026-08-20

## Executive view

LevelField has a strong and original product thesis, a tested deterministic scoring core, an MCP
agent interface, and a deployed Somnia attestation registry. The largest remaining submission
risks are not the scoring engine: they are the required public repository/video deliverables, the
product's static DreamDEX snapshot, and the gap between risk analysis and an explicit DreamDEX
action path.

## Requirement map

| Requirement / judging dimension | Status | Evidence / gap |
|---|---|---|
| Working prototype | Strong | Next.js UI, MCP server, scoring engine, validation harness, and ScoreRegistry all run |
| DreamDEX Event Contracts integration | Partial | Typed indexer fetch and rule classification are real; runtime UI reads a reproducible cache |
| Meaningful API/SDK use | Partial | Official SDK is exercised by `scripts/sdk-crosscheck.ts`, not yet the product's primary discovery path |
| Clear, intuitive UX | Strong after this pass | Judge-oriented hero, evidence path, snapshot disclosure, examples, responsive methodology |
| Adoption / trading / ecosystem impact | Promising, incomplete | Agent demo can proceed/decline, but the UI lacks a risk-check → DreamDEX action loop |
| Git repository link | Missing submission dependency | Local repository currently has no git remote |
| 2–3 minute demo video | Missing required deliverable | No video artifact or final link is present |
| SDK/documentation feedback report | Complete | `docs/sdk-feedback-report.md` and 11-entry evidence journal |
| Presentation deck | Optional, not present | Create only after the demo story is locked |

## Verified strengths

1. **Originality:** scores structural information asymmetry rather than predicting outcomes.
2. **Technical credibility:** quoted evidence is checked mechanically; numbers come from code;
   two circuit breakers and conservative defaults are tested.
3. **Agent fit:** the MCP protocol lets a host model classify while the server retains verification
   and scoring authority.
4. **Somnia fit:** the registry is deployed on Shannon. Its historical snapshot records matching
   score fields, but its legacy placeholder URIs do not satisfy the strengthened provenance check;
   the UI now treats that snapshot as pending republish rather than as current verification.
5. **Honest validation:** 16 curated cases show ordered category medians and Spearman `ρ = 0.93`,
   with limits stated in `docs/validation.md`.

## Findings fixed in this pass

- Contradictory `insufficient_info=true` classifications can no longer smuggle a low non-null
  level through the MCP/browser/pipeline; the engine also enforces the conservative fallback.
- `assess_market` no longer permits score-cache path traversal or accepts non-score JSON files.
- `publish-scores.ts` loads only market IDs from the canonical score index, so `onchain.json` and
  orphan metadata cannot crash a publish run.
- Publishing now checks the chain, registry bytecode, owner, simulation, and receipt status;
  verification compares every attestation field and fails closed without overwriting a good
  snapshot.
- Instruction-content scanning covers direct classifier-address patterns without treating ordinary
  event-contract prose as a command, and recovery paths preserve the classification invariant.
- Next.js and Vitest were moved to their current compatible major releases; the full production
  and development dependency audit now reports zero known vulnerabilities.
- The web UI labels DreamDEX data as a timestamped snapshot and updates expiry state in the
  browser instead of freezing a build-time relative timestamp.
- Legacy or incomplete attestation provenance is labeled as pending republish; the UI does not
  count orphaned records outside the current score index.
- Mobile methodology tables scroll inside their own accessible regions; the document no longer
  overflows a 390px viewport.
- The assessment workspace now has two contrasting one-click examples, required-state feedback,
  alert semantics, and result focus management.

## Remaining priorities

### P0 — before submission

1. Create/push the public repository and use its real URL everywhere.
2. Set `GITHUB_REPO=owner/repo` and `GITHUB_REF` to the immutable submission commit SHA,
   republish the current indexed attestations, then run `npm run verify:onchain`; the scripts
   reject placeholder/unsafe provenance and verify URI/method hash.
3. Refresh `data/scores/` immediately before recording/deployment. The current index is a snapshot
   generated at `2026-08-20 02:25 UTC`; short windows naturally expire.
4. Record the required 2–3 minute demo and test the public deployment in a clean browser.

### P1 — highest judging upside

1. Put `SomniaMarkets.loadMarkets(true)` into the real market-discovery path (or a scheduled build
   refresh) and gate candidates on SDK `active` plus on-chain status before writes.
2. Add an explicit action loop: select DreamDEX market → inspect score/evidence → open DreamDEX or
   let the demo agent proceed/decline.
3. Add a stable public deployment URL and show it in README/submission metadata.
4. Add ScoreRegistry input bounds (`score <= 100`, valid band, dimension levels 1–5) to strengthen
   the production-readiness story.

### P2 — polish

1. Add a market-specific DreamDEX deep link once the platform exposes a stable route contract.
2. Add automated build/typecheck/browser smoke checks in CI.
3. Produce the optional deck from the same proof sequence as the video; avoid creating a separate
   narrative.

## Recommended 2:30 demo spine

- **0:00–0:20 — Problem:** event contracts can look equally tradable while exposing radically
  different early-knowledge structures.
- **0:20–0:45 — Baseline:** open a DreamDEX price binary at `3/100`; show typed window/status data.
- **0:45–1:20 — Contrast:** open an individual-decision case at `95/100`; expand D1/D3 evidence and
  the circuit breaker.
- **1:20–1:45 — Agent:** run `npm run demo:agent` to show low-risk `PROCEED` and high-risk `DECLINE`.
- **1:45–2:05 — Trust:** show quote verification, injection detection, deterministic computation,
  tests, and methodology anchors.
- **2:05–2:20 — Chain:** open the Shannon ScoreRegistry and the matching attestation.
- **2:20–2:30 — Vision:** LevelField becomes the pre-trade risk layer for every new event category
  DreamDEX lists.
