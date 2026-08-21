# LevelField final pre-submission review — 2026-08-20 (Fable)

**Verdict: SHIP_WITH_FIXES.**

The engineering core is done and survives adversarial re-verification: every sanctioned
command passes, the injection defense that the 2026-08-20 Opus review disproved is now
actually fixed (re-probed end-to-end below), the validation and agreement numbers reproduce
exactly from committed data, and the deployed contract is real, source-verified, and
readable over RPC. What blocks submission is the known owner-gated chain (repo → provenance
republish → video URL → form), plus a stale-numbers pass on README and one eligibility
question nobody can answer until the BUIDL page goes live. Nothing found requires
re-architecting; everything found is fixable in hours.

---

## 1. Verification log (every check executed, not inferred)

| Check | Command | Result |
|---|---|---|
| Unit/integration tests | `npm test` | **PASS** — scoring 65/65, web 4/4 (69 total, matches README/submission "69") |
| Typecheck (sanctioned) | `npx tsc --noEmit -p packages/scoring/tsconfig.json` | **PASS** (exit 0) |
| Typecheck (full, extra) | `npm run typecheck` | **PASS** — scripts + scoring + mcp + web |
| Evidence quotes | `npx tsx scripts/verify-classifications.ts` | **PASS** — 16/16 files "All evidence quotes verified verbatim." |
| Validation harness | `npm run validate` | **PASS** — `Spearman rho = 0.930 (n=16)`, medians `3, 19, 23.5, 60, 95`, all 4 ordering checks pass, 4 CB hits |
| Web production build | `rm -rf apps/web/.next && npm run build -w @levelfield/web` | **PASS** — 30 static pages, exit 0 |
| Foundry tests | `cd contracts && forge test` | **PASS** — `8 passed; 0 failed` (forge 1.7.1) |
| Inter-run agreement | `npx tsx scripts/agreement.ts` | **PASS** — `band agreement (voted vs reference): 16/16`; regenerated file differs from committed only in the date line. Run dirs run-A/B/C are 16 distinct files each with distinct classifier tags (`independent-run-{A,B,C} (claude-sonnet-5 via LevelField protocol)`) vs reference (`claude-fable-5`) |
| MCP end-to-end | `npm run demo:agent` | **PASS** — real stdio server; `PROCEED (3/100 low)` on the DreamDEX binary, `DECLINE (95/100 high, CB-1)` on curated-celebrity-breakup; no order submitted anywhere in the script |
| Injection defense (adversarial re-probe) | custom MCP client, scratchpad | **PASS** — see §2, P-fixed |
| On-chain state | direct `viem` RPC read, scratchpad | chain id **50312**, registry bytecode present (2904 bytes), attestations readable — see P0-1 for the URI problem |
| Blockscout verification | `GET /api/v2/smart-contracts/0xb8e1…bbc7` | `is_verified: True`, name `ScoreRegistry`, compiler v0.8.24 — "source-verified" claim holds |
| SDK crosscheck (live) | `npx tsx scripts/sdk-crosscheck.ts` | **PASS** — official `@somnia-chain/markets-sdk` loads read-only (no key); 8 active markets, question text matches our fetcher exactly on all 8; corroborates FEEDBACK #10 verbatim |
| Indexer liveness (for the refresh step) | direct GraphQL POST | **UP** — fresh `Trading` rows with 2026-08-21 expiries exist right now |
| Video master evidence chain | `shasum`, `ffprobe`, `ffmpeg ebur128`, SRT count | sha256 `5d91fb13…` ✓, 175.0 s (2:55, inside 2–3 min) ✓, 1920×1080@25 h264 ✓, integrated loudness **−16.2 LUFS** ✓, **51** SRT cues ✓ — every measurable claim in `demo-video/film/README.md` and submission.md line 78 checks out |
| Watch the video content | — | **SKIPPED** — reviewer cannot view video; only the measurable QA chain above is verified. Visual truth-gates rest on `film/README.md`'s "every capture layer is the previously verified footage" plus the committed capture pipeline |
| Secrets | `.gitignore`, `git ls-files`, history grep | **CLEAN** — `.env` ignored and never tracked; only `.env.example` (empty values) tracked; no key-shaped strings in tracked files |

Working-tree note: `npm run validate` (sanctioned) and `scripts/agreement.ts` (run to verify
the 16/16 claim) each regenerate their doc with today's date; both diffs were date-only and
were restored to the committed text after verification. The only untracked path this review
leaves is `docs/review/`.

### Injection defense re-probe (the Opus review's §1.2(a), against current code)

The 2026-08-20 Opus review demonstrated `score=0 band=low flagInj=false` for an
attacker-authored market whose description addresses "AUTOMATED RISK ASSESSORS". The same
payload against the current MCP server (`packages/mcp/src/server.ts` +
`packages/scoring/src/verify.ts`):

```
probe1(injected-quote):     isError=true  error=evidence_quote_overlaps_injected_content
probe2(clean-quotes-all-1): isError=false score=0 band=low flagInj=true caveats=3
probe3(fabricated-quote):   isError=true  error=evidence_quote_not_verbatim
```

Quoting the attacker's sentence is now a hard rejection; a fabricated quote is a hard
rejection; and a host that complies with the attacker using only clean quotes still cannot
suppress the code-level flag (`flagInj=true` + caveat), because the scan runs server-side
(`verify.ts:70-87`, `server.ts:227`). Residual risk is inherent and disclosed: code cannot
re-classify, so a fully-complicit host model still yields a low number — but never an
unflagged one. The README's claim (lines 29–32) is now accurate.

---

## 2. Findings, ranked

### P0-1 — Every on-chain attestation URI is a dead placeholder link (known-open; risk is higher than the docs imply)

**Evidence** (direct RPC read, this session):

```
uri: 'https://github.com/LEVELFIELD_REPO_PLACEHOLDER/blob/main/data/scores/curated-ceo-resignation.json'
```

All 28 published attestations carry this. A judge who does the one thing the pitch invites —
open the registry on Shannon explorer and inspect an attestation — sees a 404 URL with the
literal string `PLACEHOLDER` in it. The winning-hackathons memo is unambiguous that broken
links are "the single most repeated instant-fail across every source reviewed", and the
infra memo's closest precedent (VibeCheck) won specifically on "verifiable onchain
attestations rather than just warnings". Right now the attestation content is verifiable but
its provenance pointer is fake-looking.

Mitigations already in place (verified): `scripts/github-provenance.ts:25-29` refuses to
write or verify placeholder URIs ever again; the web UI fails closed
(`apps/web/src/lib/scores.ts:75-92` rejects placeholder URIs, and the committed
`data/scores/onchain.json` — which predates the `uri` field entirely — renders as "Legacy
provenance … awaiting republish", never as verified). The site cannot lie about this. The
chain currently does.

**Fix:** the already-planned republish, but treat it as the hard core of the submission
checklist (§4): push repo → pin immutable SHA → `registry:publish --send` → `npm run
verify:onchain` → commit the new `onchain.json` (which flips the site to "complete") → push.

### P0-2 — Required deliverables still unset: public repo URL, video URL, DoraHacks form (known-open, owner-gated)

`docs/submission.md:63-64` — `GitHub: **TODO(owner/repo)**`, `Demo video: **TODO(url)**`.
Both are hard baseline requirements; the judging memo's most-quoted instant-fail is not
meeting baseline requirements. Nothing new to discover here; the artifacts behind them
(video master, repo content) are done and verified above. One repo-push consideration judges
will feel: `.git` is **445 MB** (multiple ~50–72 MB video masters across history;
`demo-video/levelfield-demo.mp4` 72 MB and `-preview.mp4` 50 MB are tracked). All files are
under GitHub's 100 MB hard limit, so the push succeeds, but a judge's clone is heavy.
Recommendation: push as-is (history rewriting would destroy the incremental-commit-history
evidence the memo says judges check) and put the YouTube link, not the repo file, everywhere
a viewer is pointed at the video.

### P0-3 — The committed live snapshot is fully expired; refresh before packaging (known-open; feasible today)

All 8 `dreamdex_testnet` entries in `data/scores/index.json` (generated 2026-08-20 02:25 UTC)
have Aug-20 expiries — every live market a judge opens is labeled "Expired". The UI is
honest about it (client-side `ExpiryState`, "never presented as a live feed"), but the
hero's live-vs-curated contrast reads much better with a live window. Verified this session:
the indexer is up and has fresh `Trading` rows (expiry 2026-08-21), and `score-all.ts`'s
selector correctly drops the ~500 zombie rows (SDK crosscheck reconfirmed 8 genuinely-active
vs 500 "Trading"). **Fix:** `npm run score:all` + commit, immediately before the repo push
in §4 — it must precede attestation publishing, since the pinned SHA has to contain the
score files the URIs point to.

### P1-1 — Eligibility unknowns: build predates the submission window, and the narration is TTS

Two rules for this specific hackathon are unconfirmable (the infra memo found *no public
rubric or rules page* for this event as of 2026-08-20):

- **Build window.** The entire commit history is 2026-08-19/20; the window opens 2026-08-25.
  ETHGlobal-style "must be started and developed during the hackathon" rules would
  disqualify this outright. DoraHacks events frequently allow pre-built projects, but that
  is an assumption, not a fact.
- **TTS narration.** The master's voice is ElevenLabs (Liam). ETHGlobal *explicitly bans*
  AI voiceover/TTS narration in demo videos. If Somnia/DreamDEX adopts a similar clause,
  the finished master is ineligible as-is (the capture-led preview master shares the same
  narration, so it is not a fallback).

**Fix:** `submission.md:81` already schedules a re-check of the BUIDL page after 2026-08-24;
extend that check to explicitly answer these two questions before uploading anything, and
keep the Remotion project's `FORCE_OFFLINE`/re-render path (`film/README.md`) as the
contingency for a human-voice or no-voiceover re-master. Do not submit assuming silence
means permission on the build-window question — ask in the event Discord if the page is
ambiguous.

### P1-2 — README is the judge's above-the-fold surface and it is stale in four places

Verified against current state:

- Line 57–58: gradient ends "→ 78 (military) → 90 (individual-will, circuit breaker)".
  Current curated top-end is **80 (ceo-resignation) and 95/95/95** (celebrity-breakup,
  injection-test, presidential-pardon). No curated market scores 90. A judge who runs
  `npm run score:all` sees numbers that contradict the README's flagship sentence.
- Line 100: "40 quotes verified" — current count is **80** non-null quotes across 16 files
  (counted this session; `verify-classifications` passes all 16).
- Line 108: "[ ] Required 2–3 minute demo video" unchecked — the master is done (v2.3,
  measured 2:55); only the upload is pending. Say that.
- Quick start omits the three best judge affordances: `npm run demo:agent` (the MCP spine
  of the whole pitch — the infra memo's #1 leverage point), `npm run validate`, and
  `npx tsx scripts/agreement.ts`. The submission copy cites all three; the README a judge
  lands on lists none.

**Fix:** one README pass — update the two numbers, tick/annotate the video line, add the
three commands to Quick start (agent demo first).

### P1-3 — Engine weights and anchors.yaml weights are two unlinked sources of truth

`data/anchors/anchors.yaml` (line 2: "single source of truth") carries `weight:` per
dimension, and it is what the classifier prompt, the /methodology page
(`apps/web/src/app/methodology/page.tsx:25`), and the MCP `list_anchor_library` tool all
render. But the score is computed from the **hardcoded** `WEIGHTS` map in
`packages/scoring/src/engine.ts:7-13`. `loadAnchors` validates only that the yaml weights
sum to 1.0 (`anchors.ts:38-41`); nothing anywhere asserts yaml == engine. Today they match
(0.30/0.20/0.25/0.15/0.10 verified). If either is ever edited alone, the public methodology,
the MCP-served protocol, and the actual scores silently diverge — the exact "undisclosed
test conditions" failure the benchmark-credibility memo warns about. **Fix (one test):** in
`engine.test.ts`, assert `lib.dimensions.every(d => d.weight === WEIGHTS[d.id])` (the file
already loads the real yaml).

### P2-1 — Beat 16's future tense goes stale the moment P0-1 completes

Narration/SRT (verified in the sidecar): "After a provenance-complete republish, every
current score **will** live on Somnia Shannon…". Correct today; after the republish the
finished video under-claims a completed feature. Re-rendering one beat reopens the entire
QA chain for marginal gain. **Fix:** leave the video; add one line to the submission
description ("the provenance republish shown as pending in the video is now complete —
attestation: <explorer link>"). Cheap, honest, and turns the stale tense into evidence of
follow-through.

### P2-2 — 8 of 16 curated contracts are still test-tier "drafts" though their classifications are settled

`packages/scoring/test/score.test.ts:41-56`: `SETTLED_IDS` pins exact band/CB assertions for
the original 8 contracts; the comment says the other 8 are "drafts … pending independent
reconciliation". All 16 now have committed reference classifications, are validated by
`verify-classifications`, and back the public ρ=0.930 / 16-16 claims — yet half get only a
smoke test. Not wrong (agreement.ts covers reproducibility), just weaker than the repo's own
standard. **Fix:** move the 8 into `SETTLED_IDS` with their now-settled expected bands, or
update the comment to say the reconciliation happened.

### P3 — Polish (each one line)

- `demo-video/README.md:14` says "46-cue" SRT (actual: 51) and points at `script.md` as the
  locked voiceover (actual: `script-v2.md` / `film/src/script-v2.json`); `script-v2.md:14`
  still names Brian as the final voice (actual master: Liam; the build source-of-truth JSON
  is already correct).
- `ScoreRegistry.sol` has no input bounds (score ≤ 100, band ≤ 3, dims 1–5) — readiness-doc
  P1.4, not done. Accepted risk at this stage: writes are owner-only, the publisher
  validates off-chain (`verify-onchain.ts:118-131`), and a redeploy would orphan the
  source-verified address quoted everywhere. State it as a known limitation rather than fix.
- `demo-deck/` is Codex-era and rebuilds only inside a Codex workspace runtime
  (`@oai/artifact-tool`); its own README orders a pre-submission refresh. It is optional:
  refresh it after the republish or drop it from the submission — do not ship it stale.
- Chain debris: after the republish, 4+ legacy attestations for markets no longer in the
  index remain on-chain forever. Harmless (verify-onchain iterates the current index only);
  worth one sentence in submission copy if a judge diffs counts.
- `apps/web/tsconfig.tsbuildinfo` is git-tracked, so every typecheck/build dirties the
  working tree (it did during this review; left modified rather than reverted via git).
  Add it to `.gitignore` and untrack it in the step-2 cleanup pass.

**Categories with zero findings** (checked, not skipped): secret handling; deterministic-score
constraint (only `engine.ts` produces numbers; MCP server imports carry zero LLM deps —
`packages/mcp/package.json` depends only on the scoring package, MCP SDK, and zod);
truth-gates in the web UI (timestamped snapshot labels, 3-vs-95 source separation,
fail-closed provenance, no fabricated UI found in any tracked page); MCP order-submission
(none exists in any code path); validation honesty (the "honest limits" section of
`validation.md` is auto-generated into every regeneration and matches the
benchmark-credibility memo's checklist almost point for point).

---

## 3. What winning projects have that we lack

Grounded in the two memos (`research-winning-hackathons.md`, `research-infra-track-judging.md`):

1. **A live deployment URL.** The complete-artifact set judges expect is "contract address,
   scan URL, demo video, GitHub link, and live link" — DoraHacks organizers gate BUIDL
   approval on working `https://` demo links. LevelField has the first four (pending P0-2)
   and no deployed site. The app is a static build (30 SSG pages, zero request-time
   network); deploying it is an hour of work and converts the strongest surface (the
   evidence UI) from "clone and build" to "click". Highest-leverage missing artifact.
2. **A judge-facing 60-second path.** Judges spend 3–5 minutes and decide in the first 60
   seconds. The video opens with a real hook (beat 0), but the README opens with prose.
   Winners put tagline + live-demo + contract-address + video links above the fold, then a
   component breakdown. The P1-2 README pass should restructure the top ~15 lines
   accordingly, not just fix numbers.
3. **Sponsor-theme surface area, made explicit.** DreamDEX's own positioning is "agent-first,
   MCP-native" — LevelField's MCP server is a direct hit, and the memo says that alignment
   is the single strongest lever. But the submission copy asserts it in one bullet. The
   precedent set (VibeCheck / ShieldBot / Aegis, CRE Risk Router) shows risk-scoring +
   attestation + agent tools are a *recognized, crowded* category; the differentiator the
   memo identifies — deterministic, code-verified scoring where none of the precedents have
   it — deserves the explicit one-line contrast in the description ("unlike LLM-scored risk
   tools, no model ever writes the number here").
4. **Early sponsor engagement.** Repeatedly named as a differentiator (Discord/mentors
   during the event, not at submission). Owner action; also the channel for resolving the
   P1-1 eligibility unknowns.
5. **In-window build evidence.** Winners show incremental commit history *inside the event
   window*. The history is incremental but pre-window (P1-1). If the rules allow pre-built
   projects, consider doing the P0-3 refresh, P1-2 README pass, republish, and deployment
   as post-window-open commits — real work, timestamped inside the window.
6. **What we already match:** hook-first video inside the length gate; one flawless
   end-to-end flow (agent demo, re-run this session); run-it-yourself commands (once
   surfaced in README); explorer-verifiable contract; Ledger-checklist-format SDK feedback
   report (11 findings, every one traceable to a command — this deliverable is genuinely
   ahead of the bar the memo describes); honest validation framing with limits attached.

---

## 4. Pre-submission checklist (dependency order)

Each item blocks everything below it.

1. **[owner, ~Aug 24]** BUIDL page re-check: confirm (a) pre-window builds are eligible,
   (b) TTS narration is allowed, (c) the exact required artifact list. Ask in Discord if
   unclear. — *Gates everything; a "no" on (a) or (b) changes the plan entirely.*
2. **[agent]** README pass (P1-2 numbers + quick-start commands + above-the-fold links
   restructure) and the P1-3 weight-drift test; P2-2 test tier; P3 doc nits. — *Must land
   before the SHA that gets pinned.*
3. **[agent]** `npm run score:all` (indexer confirmed up) → `npm test` → `npm run validate`
   → commit refreshed cache + docs. — *Fresh live windows; must precede publishing.*
4. **[owner]** Create the public GitHub repo, push everything (as-is history; see P0-2).
5. **[owner/agent]** Pin `GITHUB_REF="$(git rev-parse HEAD)"`, set `GITHUB_REPO`,
   `REGISTRY_ADDRESS`, `PRIVATE_KEY` (gitignored .env) → `npm run registry:publish -- --send`
   → `npm run verify:onchain` (writes the provenance-complete `onchain.json`; the scripts
   hard-refuse placeholders, verified) → commit `onchain.json` → push. — *Kills P0-1; the
   site flips from "awaiting republish" to "N/N verified current attestations" (rebuild to
   confirm).*
6. **[owner, optional but high-leverage]** Deploy the web app; put the URL in README +
   submission. (§3.1)
7. **[owner]** Upload `demo-video/levelfield-demo.mp4` (+ SRT) to YouTube; paste the URL
   into `submission.md`.
8. **[agent]** Fill every remaining TODO in `submission.md`, add the P2-1 provenance-complete
   sentence and the §3.3 deterministic-vs-LLM contrast line; regenerate or drop the deck
   (P3).
9. **[owner]** Final read-through of the submission copy against the live page, then submit
   on DoraHacks once the window opens 2026-08-25.

---

*Review method: all commands run from the repo root on 2026-08-20/21 local; read-only except
this file (two script-regenerated docs restored to committed text after date-only diffs;
scratchpad probes lived outside the repo). No paid API was called; RPC/Blockscout/indexer
reads were free public endpoints. The demo video's visual content could not be watched and
is the one deliberately unverified surface (its measurable QA chain fully checks out).*
