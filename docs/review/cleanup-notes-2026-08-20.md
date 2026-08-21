# Cleanup pass — 2026-08-20

Scope: `packages/scoring/src|test`, `packages/mcp/src`, `apps/web/src`, `scripts/`, and
`package.json` files. Goal was subtraction only — dead code, redundancy, debris — with zero
behavior change. Out of scope and untouched: `data/`, `contracts/`, `README.md`,
`FEEDBACK.md`, `docs/` (except this file), `demo-*`, `.env*`, `.gitignore`, build configs.

**Headline: the repo was already clean.** Two removals total. Every other category the pass
looked for came back empty, and those zero-findings results are recorded below as evidence
rather than omitted.

## Changes made

| Path | What was removed | Proof it was dead |
|---|---|---|
| `packages/scoring/test/score.test.ts` | `SETTLED_IDS` (16-entry Set), `BAND_PATTERN`, and the `else` branch of the per-contract loop | `SETTLED_IDS` enumerated exactly the 16 marketIds present in `data/curated/*.json` — verified by parsing every curated file: 16 files, 16 set entries, zero curated ids outside the set, zero stale set entries. So `SETTLED_IDS.has(...)` was always true, the `else` branch was unreachable, and `BAND_PATTERN` was referenced only from inside it. All 16 curated files carry `expected.band`, so every contract still gets the strict band/circuit-breaker assertion. Test count unchanged (66). |
| `apps/web/src/app/assess/page.tsx`, `apps/web/src/app/assess/AssessClient.tsx` | The `anchorVersion` prop (declaration, destructure, and call site) | It was passed as `anchorVersion={anchorLibrary.version}` — the same object already given to the component as `anchorLibrary`. Its single use site now reads `anchorLibrary.version`, rendering a byte-identical string. |

Deletions are complete: no commented-out remnants, and `grep` for `SETTLED_IDS`,
`BAND_PATTERN`, and `anchorVersion` across `apps/`, `packages/`, and `scripts/` returns nothing.

## Zero-findings results (searched, nothing to remove)

- **Unused imports / locals / parameters — none.** Verified two ways: a custom import-clause
  scanner over all 47 in-scope source files, and `tsc --noEmit --noUnusedLocals
  --noUnusedParameters` run against all four tsconfigs (scoring, mcp, scripts, web). Every
  run was silent.
- **Dead CSS selectors — none.** All 122 class selectors in `globals.css` are referenced.
  The only four with no literal match (`.band-word--low|moderate|elevated|high`) are
  constructed dynamically in `BandWord.tsx` as `` `band-word--${band}` ``.
- **Unused exports — none.** All 90 exported symbols in scope were cross-referenced against
  every file in `apps/`, `packages/`, `scripts/`, and `demo-deck/`. The eleven that are not
  imported elsewhere are all genuinely live: `generateStaticParams` (called by the Next.js
  framework), and ten types/constants used to build the shapes their own module exports
  (`EngineOutput`, `ClassificationConsistencyFields`, `CONSERVATIVE_DEFAULT_LEVEL`,
  `OnchainProvenanceStatus`, `OnchainProvenanceState`, `ScoreSource`, `AnchorBand`,
  `AnchorCircuitBreaker`, `DEFAULT_GITHUB_REF`, `GitHubProvenance`).
- **Unused dependencies — none.** Every declared dependency resolves to a real import:
  root (`@somnia-chain/markets-sdk`, `viem`, `tsx`, `typescript`), scoring
  (`@anthropic-ai/sdk`, `yaml`, `zod`, `vitest`), mcp (`@levelfield/scoring`,
  `@modelcontextprotocol/sdk`, `zod`), web (`@levelfield/scoring`, `next`, `react`,
  `react-dom`, `yaml`, plus the `@types/*`/`vitest`/`typescript` dev set).
- **Dead npm script entries — none.** All 13 root scripts point at files that exist.
- **Debris files — none.** The in-scope directories contain 47 files, every one a real
  `.ts`/`.tsx`/`.css`/`.svg` source. No repro scripts, scratch files, or strays.
- **Stale TODOs, `FIXME`, `@ts-ignore`, `eslint-disable`, `debugger` — none present.**
- **Commented-out code — none.** The three greps that matched are prose comments whose text
  happens to start with a code keyword, not disabled code.
- **Debugging `console.log`s — none.** Every print is a deliberate runtime-decision message:
  `[live]`/`[curated]`/`[onchain]`/`[classify]` warnings, script progress output, and report
  summaries. Left as-is per the repo's stated style.

## Found and deliberately left alone

- **`loadScores()` duplicated between `scripts/publish-scores.ts` and
  `scripts/verify-onchain.ts`** (~35 lines each), along with the near-identical
  `toAttestation`/`expectedAttestation`. Diffed line by line: the copies agree on every
  behavior — same validation order, same error text shape, same `methodHash` formula, same
  `scoredAt` conversion. The divergence would not be a bug, and the one piece where drift
  *would* be a bug (the attestation URI) is already shared via `scripts/github-provenance.ts`,
  whose docstring says exactly that. Consolidating further would mean a new shared util
  module, which the cleanup brief and the repo's linear-script style both rule out.
- **`scripts/agreement.ts` has no `package.json` script entry.** It is not debris — it is the
  reproducer for the committed `docs/agreement.md`, documented in its own docstring. Adding a
  script entry would be an addition, not a subtraction, so it was left for the lead to decide.
- **`scanForInstructionLikeContent(contractText)` is recomputed inside the per-dimension
  `DIMENSION_IDS.map` in `scripts/score-all.ts` (~line 282)**, so it runs five times per
  curated contract instead of once. Hoisting it is a behavior-preserving efficiency tweak
  rather than a deletion, and this pass was scoped to subtraction only. Noted, not changed.
- **`scripts/agent-demo.ts` imports `@modelcontextprotocol/sdk` without the root
  `package.json` declaring it** (it resolves via hoisting from `packages/mcp`). This is a
  *missing* dependency, not an unused one; fixing it means adding a line, which is outside a
  subtraction pass. Flagged for the lead.
- **`BAND_LABEL` in `apps/web/src/lib/format.ts` is an identity map** (`low: "low"`, etc.).
  It is a documented design hook for the band vocabulary and is live via `BandWord.tsx`;
  collapsing it would be a style change, not a deletion.
- **Over-exported internal types** (e.g. `Confidence`, `ScoredDimension`, `DimensionId` in
  `apps/web/src/lib/types.ts`). All are used to build shapes the module does export. Only the
  `export` modifier is surplus, and that file's stated job is to mirror
  `packages/scoring/src/types.ts` — stripping modifiers would fight its purpose.

## Gate results

All six gates run after the changes. Every one passed with an explicit exit code of 0.

```
GATE 1  npm test
  Test Files  6 passed (6)          [scoring]
       Tests  66 passed (66)
  Test Files  1 passed (1)          [web]
       Tests  4 passed (4)
  => 70 passing, exit 0             (identical to the pre-change baseline)

GATE 2  npx tsc --noEmit -p packages/scoring/tsconfig.json
  (no output)  exit=0

GATE 3  npm run typecheck
  typecheck:scripts / scoring / mcp / web — all clean
  exit=0

GATE 4  npx tsx scripts/verify-classifications.ts
  ok   curated-protocol-upgrade.json
  All evidence quotes verified verbatim.
  exit=0

GATE 5  rm -rf apps/web/.next && npm run build -w @levelfield/web
  ✓ Compiled successfully in 3.0s
  ✓ Generating static pages using 7 workers (30/30) in 315ms
  => 30 pages, exit=0

GATE 6  npm run demo:agent
  Assessing 0x...4746
    score:     3/100 (low)  [from cache]
    decision:  PROCEED (3/100 low)
  Assessing curated-celebrity-breakup
    score:     95/100 (high)  [from cache]
    decision:  DECLINE (95/100 high, CB-1: ...)
  Demo complete.
  exit=0
```

No gate failed, so nothing had to be reverted. All changes are left uncommitted in the
working tree for review; no git commands were run.
