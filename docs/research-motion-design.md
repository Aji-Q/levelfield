# Motion-design research: upgrading the LevelField demo from "read-aloud" to "designed film"

Grounded in `demo-video/script.md`, `demo-video/levelfield-demo.en.srt` (46 cues),
`demo-video/capture/edit-manifest.json` (14 segments, 173.562584s), and
`docs/submission.md`.

## 0. Governance conflict — read before implementing

Two locked project documents already constrain post-production more tightly than
this brief asks for, and a submission master may already exist against them:

- `docs/superpowers/specs/2026-08-20-final-film-picture-lock-design.md` (owner-delegated
  lock, accepted by Codex + Claude 2026-08-20) permits only an "independent light-post
  Remotion layer" over the *muted, real* base picture: **8–12 focus camera moves
  (1.05–1.18x, never past 1.25x), 5–7 editorial callouts, focus outlines, short
  lower-thirds, cut transitions**. It explicitly bans "standalone title card, slide,
  screenshot, recreated UI, continuous floating camera, or decorative Web3 motion" and
  requires all animation to be **frame-driven** (no CSS/wall-clock timing).
- `demo-video/capture/capture-manifest.json` enforces two hard numeric gates:
  `minimumRecordedCoverage: 0.85` (≥147.53s of the 173.56s must be real, unobscured
  capture pixels) and `maximumGraphicSeconds: 10` (≤10s total may be non-capture
  graphics).
- `docs/submission.md`'s form checklist already lists a **"MASTER READY"** entry
  (sha `279ae2af...`, 2:53.56, native 25fps BT.709 CRF14, 100% real capture, 0
  blank/label/loading frames, 46 caption cues) — i.e. a submission-grade cut may
  already be locked under the conservative spec above.

This research plan is written to the brief's fuller ambition (animated diagram beats,
kinetic type, persistent motifs) but every shot below is designed to fit inside the
existing 85%-coverage / ≤10s-graphics / frame-driven / no-standalone-card envelope —
diagrams are composited as overlays or picture-in-picture on real footage, not full
replacements, except one ~3.5s moment flagged explicitly. **Anything marked
`[EXCEEDS LOCK]` needs an explicit owner/Codex re-approval citing the picture-lock
spec above before it touches the actual master** — this doc does not itself authorize
reopening picture lock.

---

## 1. Reference corpus

| Ref | What it is | What makes it feel produced, not read-aloud |
|---|---|---|
| [remotion-dev/github-unwrapped](https://github.com/remotion-dev/github-unwrapped) (2021–2024) | Personalized year-in-review stat film, MIT app code | Numerals count up in sync with a music grid (not narration cadence); each stat gets exactly one camera hold before a hard cut; GitHub's own brand palette is locked throughout — never a generic dark-UI look. |
| [charmbracelet/vhs](https://github.com/charmbracelet/vhs) | `.tape`-scripted terminal recorder, MIT | Real commands, but reveal speed, cursor blink, and theme are code-controlled and perfectly consistent — no mouse jitter, no dead air; `Sleep`/`Wait` directives let you beat-match a recording to narration instead of cutting around an ad hoc screen capture. |
| [remotion-dev/typewriter](https://github.com/remotion-dev/typewriter), [remotion-dev/morph-text](https://github.com/remotion-dev/morph-text), [remotion-dev/text-warping](https://github.com/remotion-dev/text-warping) | Small (<300-line) official kinetic-type examples | All three drive text reveal off `useCurrentFrame()`, not CSS transitions — the exact "frame-driven, no wall-clock" requirement the LevelField lock already mandates. Typewriter shows restrained character-reveal pacing; morph-text shows word-to-word shape morphing for a single beat emphasis (e.g. "3" → "95"). |
| [remotion-dev/d3-example](https://github.com/remotion-dev/d3-example) | D3 scales/axes bound to Remotion frames | Template for frame-accurate progressive diagram builds (axis draws in exactly N frames, not "eventually") — the pattern needed for the five-dimension anchor build and the validation-numeral sweep. |
| [JonnyBurger/spring-loaded](https://github.com/JonnyBurger/spring-loaded) | Apple-style spring-physics camera/text demo | Demonstrates why a spring easing curve (`@remotion/spring`) reads as "designed" where a linear `interpolate()` push reads as a slide-deck zoom — directly informs the zoom-to-evidence camera moves the lock already allows. |
| [pomber/stargazer](https://github.com/pomber/stargazer) | Repo-visualization video built with Remotion | Match-cuts between two states of the same data structure rather than cross-fading — the template for the 3-vs-95 same-engine/different-event cut. |
| [hylarucoder/remotion-bar-race-chart](https://github.com/hylarucoder/remotion-bar-race-chart) | Animated ranking chart | Template for the closing validation sweep (16 contracts, ρ 0.93, 69+8 tests) as a reinforcement overlay synced word-for-word to narration rather than a static caption. |
| [theatre-js/theatre](https://github.com/theatre-js/theatre) | Web motion-design/keyframe editor, Apache-2.0 | Not a Remotion example — included as an offline curve-authoring sandbox only. Its own runtime player uses wall-clock playback, which the lock forbids; the correct use here is exporting hand-tuned easing curves as static keyframe data and baking them into Remotion's frame-driven `interpolate()`, never shipping the Theatre.js runtime in the render. |

---

## 2. Pattern language (15 patterns, mapped to our exact cues)

Each pattern names the SRT cue(s) (`#n`, timestamp range) it attaches to. Timestamps
use total seconds from film start (0:00).

1. **Cold-open hook, no card** — Kinetic headline typed over the *first live frame* of
   real footage (never a black slide, to satisfy "real pixels visible throughout").
   Maps to **cue 1, 0.000–5.354s**: *"Every event contract gives you a price. It does
   not tell you who could know first."* Overlaid on `home-open.webm`'s opening frame.

2. **Kinetic stat reveal (numeral echo)** — A large mono numeral fades up *beside*
   (never over) the real score dial as its word is spoken, reinforcing not replacing.
   Maps to **cue 6, 18.936–22.776s** ("three out of one hundred") and **cue 11,
   38.345–42.639s** ("ninety-five out of one hundred").

3. **Match-cut contrast** — A literal wipe/graphic match between the two score dials
   at the exact moment the narration pivots. Maps to **cue 9, 31.340–33.109s** *"Now
   change only the event"* — cut from the 3/100 dial (seg `dreamdex-three`, ending
   31.340s) directly into `curated-95.webm`'s opening frame.

4. **Zoom-to-evidence** — Spring-eased push-in (1.0→~1.15x, within the lock's
   1.05–1.18 range) onto the exact UI element the narration is describing. Maps to
   **cue 20, 72.295–76.247s** *"Every evidence quote must match the contract's exact
   words"* — push into the D1 evidence-quote panel in `market-detail.webm`.

5. **Progressive diagram build (concept beat)** — Five instrument-panel nodes
   (Control / Early Knowledge / Tradability / Disclosure / Manufacturability) draw in
   sequentially, one per ~0.7s, as PiP over the real Methodology page. Maps to
   **cues 18–19, 64.117–72.095s** *"Under the interface is a public, five-dimension
   anchor library. A model classifies each dimension against those anchors."*

6. **Beat-aligned cut rhythm** — Segments longer than ~15s (seg `curated-ninety-five`
   at 21.2s, seg `real-mcp-policy` at 22.76s) get internal virtual cuts every 5–8s via
   camera re-frames on the *same* source clip, so no single static hold exceeds the
   lock's "~1.5s must justify itself" rule at length. Average segment is 173.56/14 ≈
   12.4s; the two outliers are the ones to break up.

7. **Lower-third discipline** — Chapter labels appear only at the five chapter
   boundaries already defined in `demo-video/outline.md`, each held ≤1.5s, never
   re-appearing mid-chapter: **0.000s** ("The Question"), **14.684s** ("3 vs 95"),
   **64.117s** ("Model Classifies, Code Decides"), **96.710s** ("Agent → Chain"),
   **137.178s** ("Proof & Growth").

8. **Breathing room before key claims** — A ~0.4s frame with no lower-third, no
   camera move, no callout, immediately before a caveat lands. Maps to the gap right
   before **cue 17, 60.002–63.917s** *"It does not allege wrongdoing or detect live
   insider activity"* — let the sentence land on a static, unadorned frame.

9. **Closing card via real hold, single CTA** — No new card; end on `closing.webm`'s
   real hero frame with one small overlay line, no fabricated UI. Maps to **cues
   44–46, 160.962–173.363s**, ending on *"...and traders know who can know before
   they do."*

10. **Instrument-panel diagram aesthetic** — Every overlay/diagram (not the real
    capture) uses near-black (`#0B0C0E`-family) background, single amber accent
    (`#C9A24B`-family, matching the product's existing palette per
    `production-plan.md`'s "premium cartographic instrument" red line), serif display
    for headline words, monospace for numerals/data. Applied to patterns 2, 5, 14, 15.
    Never neon, never generic Web3 gradient.

11. **Terminal-as-hero (VHS pacing)** — The MCP terminal segment is treated as a
    typed-reveal hero shot, not a raw screen recording: cursor-blink emphasis at the
    start, consistent reveal cadence matched to narration beats. Maps to **seg
    `real-mcp-policy`, cues 27–34, 96.710–119.475s**.

12. **Evidence underline / verbatim-match** — An animated stroke-dashoffset underline
    draws beneath the exact quoted substring as it's narrated, reinforcing the
    "verbatim quote" claim typographically. Maps to **cue 20, 72.295–76.247s** and
    reused at **cue 12** region of `market-detail.webm` (curated-evidence-detail,
    52.540–64.117s) under `curated.verbatim_evidence`.

13. **Fail-state stamp** — A small "REJECTED" mono-type stamp snaps in sync with the
    real on-screen rejection banner — typography reinforcing, not fabricating. Maps
    to **cue 21, 76.247–80.065s** *"Code rejects instruction-like text aimed at the
    assessor"* over `instruction-rejection.webm`.

14. **Persistent chain-of-custody motif** — A tiny 3-node diagram
    (Model classifies → Code decides → Chain records) pinned to one screen corner,
    reused verbatim across three non-adjacent segments so it threads the film's
    throughline (screen.studio-style persistent chrome). Node 1→2 lights at **cue 24,
    87.154–90.378s** ("deterministic code applies fixed weights") over
    `methodology.webm`'s second range; node 2 pulses through **seg `real-mcp-policy`**;
    node 3 lights at **seg `somnia-source-verified`, cues 35–36, 119.475–131.441s**
    ("...bind its band, five dimensions, method hash, timestamp, and immutable source
    on Somnia Shannon").

15. **Data-table sweep / count-up numerals** — Mono numerals count up beside (not
    over) the real terminal output as each validation number is spoken. Maps to
    **cues 39–43, 137.178–160.762s**: *"sixteen curated contracts... Spearman rho of
    point nine three... Sixty-nine software tests and eight smart-contract tests...
    read-only and without a private key."*

---

## 3. Shot-upgrade plan (full 173.562584s, zero gaps)

`[real+overlay]` = 100% real capture pixels dominant, graphic is a composited overlay/PiP (does **not** count against the 10s graphics cap). `[full-bleed]` = graphic covers the frame; counts against the cap. Segment IDs match `edit-manifest.json`.

| # | Time (s) | Cue(s) quoted | Shot type | Motion | On-screen text (≤6 words) | Source |
|---|---|---|---|---|---|---|
| 1a | 0.000–5.354 | #1 *"Every event contract gives you a price. It does not tell you who could know first."* | real capture + kinetic type `[real+overlay]` | Word-build headline over live frame; spring push 1.00→1.06 | "Who could know first?" | `demo-footage/picture-lock-raw/home-open.webm` |
| 1b | 5.354–14.684 | #2–4 *"LevelField is a pre-trade risk layer for DreamDEX... before a trader or agent takes a side."* | real capture + lower-third `[real+overlay]` | Continue scroll; Ch.1 label in/out ≤1.5s; focus outline on positioning copy | "01 — The Question" | same file |
| 2 | 14.684–31.340 | #5–6 *"Start with a captured DreamDEX price binary... scores it three out of one hundred: low risk."* | real capture + numeral echo `[real+overlay]` | Spring zoom-to-evidence 1.00→1.15 into the 3/100 dial at cue 6; mono "3" fades in beside dial | "3 / 100 — low risk" | `demo-footage/picture-lock-raw/market-three.webm` |
| 3a | 31.340–38.345 | #9–10 *"Now change only the event. This curated reference contract resolves on one person's private decision."* | real capture, match-cut `[real+overlay]` | Graphic wipe from seg-2's final 3-dial frame into this clip's open frame | "Same engine. Different event." | `demo-footage/picture-lock-raw/curated-95.webm` (in 1.6–~8.6 of its trim) |
| 3b | 38.345–45.017 | #11–12 *"The same engine returns ninety-five out of one hundred: high risk. One person controls the outcome."* | real capture + numeral echo `[real+overlay]` | Zoom-to-evidence into 95 dial; mono "95" fades in beside dial | "95 / 100 — high risk" | same file, continued |
| 3c | 45.017–52.540 | #13–14 *"No clear restriction stops an early knower from trading. Circuit breaker one sets a high-risk floor."* | real capture + callout `[real+overlay]` | Focus outline on CB-1 badge; 1 of the lock's 5–7 allowed callouts | "CB-1 — high-risk floor" | same file, continued |
| 4a | 52.540–55.379 | #15 *"That three-to-ninety-five contrast is the product."* | real capture, split-screen `[real+overlay]` | Frozen last frame of seg-2 (3/100) left pane + live `market-detail.webm` (95/100) right pane — addresses the lock's own noted "3-vs-95 must not leave viewer on a single page" defect | "The contrast is the product" | `demo-footage/picture-lock-raw/market-three.webm` (frozen) + `demo-footage/market-detail.webm` |
| 4b | 55.379–63.917 | #16–17 *"LevelField explains who can know first, not which side will win. It does not allege wrongdoing or detect live insider activity."* | real capture, breathing room `[real+overlay]` | Drop split; hold single evidence panel; ~0.4s unadorned frame right before cue 17 lands | (none — deliberate blank beat) | `demo-footage/market-detail.webm` |
| 4c | 63.917–64.117 | tail buffer | real capture | trail frame into chapter cut | — | same file |
| 5 | 64.117–72.295 | #18–19 *"Under the interface is a public, five-dimension anchor library. A model classifies each dimension against those anchors."* | **animated diagram, PiP** `[real+overlay]`; peak node-5 moment ~3.5s optionally full-bleed `[full-bleed, EXCEEDS LOCK if full-bleed]` | Progressive 5-node build (0.7s/node) over real Methodology page; Ch.3 lower-third at 64.117s | "Five structural dimensions" | `demo-footage/picture-lock-raw/methodology.webm` (in 1.3–9.478) + **new**: Remotion 5-node diagram component |
| 6 | 72.295–80.265 | #20–21 *"Every evidence quote must match the contract's exact words. Code rejects instruction-like text aimed at the assessor."* | real capture + underline + stamp `[real+overlay]` | Stroke-draw underline under quoted substring (cue 20); "REJECTED" stamp synced to real banner (cue 21) | "Verbatim match required" | `demo-footage/picture-lock-raw/instruction-rejection.webm` (alt B-roll: `demo-footage/quote-rejection.webm`) |
| 7 | 80.265–87.154 | #22–26 *"If information is missing, LevelField defaults conservatively to level four... deterministic code applies fixed weights, cross-dimension rules, and circuit breakers. The model never generates the numeric score."* | real capture + motif node 1→2 `[real+overlay]` | Chain-of-custody motif appears bottom-corner; node 2 pulses on "deterministic code applies fixed weights" (cue 24, 87.154s boundary) | "Model classifies → Code decides" | `demo-footage/picture-lock-raw/methodology.webm` (in 13.0–19.6) |
| 8 | 87.154–96.710 | #26 tail *"...numeric score."* | real capture, motif continues `[real+overlay]` | Hold computed RESULT 95/high; motif node 2 stays lit | "RESULT 95 / high" | `demo-footage/assess-flow.webm` |
| 9a | 96.710–100.321 | #27–28 *"Here, an agent calls the real LevelField MCP server"* | real capture, terminal-hero `[real+overlay]` | Ch.4 lower-third at 96.710s; cursor-blink emphasis; no zoom yet | "04 — Agent → Chain" | `demo-video/capture/runs/2026-08-20T1530Z-preview/terminal/mcp-policy.webm` (local, gitignored — see §note below) |
| 9b | 100.321–107.753 | #29–30 *"over standard input and output before it acts. The policy is visible: low or moderate risk can proceed."* | real capture + callout `[real+overlay]` | "PRE-ACTION POLICY" label pinned near printed policy table | "Pre-action policy, visible" | same file |
| 9c | 107.753–113.444 | #31–32 *"Elevated or high risk is declined. The DreamDEX example returns PROCEED at three."* | real capture, cursor-follow highlight `[real+overlay]` | Highlight box snaps onto literal "PROCEED" token as it prints | "PROCEED — score 3" | same file |
| 9d | 113.444–119.475 | #33–34 *"The individual-decision case returns DECLINE at ninety-five, with the reason attached."* | real capture, cursor-follow highlight `[real+overlay]` | Highlight box snaps onto "DECLINE" token; reason line underlines | "DECLINE — score 95" | same file |
| 10 | 119.475–131.641 | #35–36 *"After a provenance-complete republish, each current score will bind its band, five dimensions, method hash, timestamp, and immutable source on Somnia Shannon."* | real capture + motif node 3 `[real+overlay]` | Isolate address/registry/verified-banner; motif node 3 lights ("Chain records"); future-tense label kept explicit per truth contract | "Future: full provenance" | `demo-footage/picture-lock-raw/explorer-v2.webm` |
| 11 | 131.641–137.178 | #37–38 *"The verifier reads every field back and fails closed on anything missing or changed."* | real capture `[real+overlay]` | Return to real legacy/awaiting-republish state; single focus outline on status label; Ch.5 lower-third at 137.178s | "05 — Proof & Growth" | `demo-footage/landing.webm` |
| 12 | 137.178–148.166 | #39–40 *"Across sixteen curated contracts, scores span three to ninety-five. Category risk rises in the expected order, with a Spearman rho of point nine three."* | real capture + numeral sweep `[real+overlay]` | Mono numerals ("16", "ρ 0.93") count up beside real terminal output as spoken | "16 contracts, ρ = 0.93" | `demo-video/capture/runs/2026-08-20T1530Z-preview/terminal/evidence-cli.webm` (in 1–11.99) |
| 13 | 148.166–160.962 | #41–43 *"Sixty-nine software tests and eight smart-contract tests pass. The official DreamDEX SDK independently cross-checks active-market discovery, read-only and without a private key."* | real capture + numeral sweep `[real+overlay]` | Mono numerals ("69", "8") count up in sync with printed test totals | "69 + 8 tests pass" | same file (in 12–24.8) |
| 14 | 160.962–173.563 | #44–46 *"We delivered eleven evidence-backed SDK and documentation findings. As DreamDEX grows, LevelField helps agents, venues, and traders know who can know before they do."* | real capture, closing hold `[real+overlay]` | One restrained spring push 1.00→1.08 on real hero frame; single overlay line, no fabricated UI | "Know who can know first." | `demo-footage/picture-lock-raw/closing.webm` |

Sum check: 5.354+9.330+16.656+7.005+6.672+8.523+0.200+8.178+7.970+6.889+9.556+3.611+3.632+5.691+6.166+12.166+5.537+10.988+12.796+12.601 → reduces to the 14 manifest `outputDuration` values, total **173.562584s**, matching `targetDuration` exactly — no gaps, no overruns.

**Graphics-budget check**: only row 5's optional full-bleed peak (~3.5s) would count against `maximumGraphicSeconds: 10`; every other row is `[real+overlay]` and counts as recorded coverage, not graphics. Recorded-coverage floor (0.85 × 173.56 = 147.53s) is satisfied by a wide margin since real footage is visible in 100% of rows.

**Asset-location note**: rows 9a–9d and 12–13 point at `demo-video/capture/runs/2026-08-20T1530Z-preview/terminal/*.webm`, which exist on local disk but are excluded by `demo-video/capture/.gitignore` (`runs/`). Nothing in the committed `demo-footage/` or `demo-footage/picture-lock-raw/` packs currently covers the terminal beats — a fresh clone must either keep this run folder or re-run `capture:terminal` (`mcp-policy`, `evidence`) before the Remotion post-layer can render those five rows.

---

## 4. AI-animation resources usable fully offline, no paid API

| Tool | License | Verdict for this project |
|---|---|---|
| Native SVG `stroke-dashoffset` + Remotion `interpolate()`/`spring()` | N/A (zero new dependency) | **Primary recommendation** for patterns 4, 5, 10, 12, 14 — no dependency, fully frame-driven, matches the lock's ban on CSS/wall-clock animation exactly. |
| [charmbracelet/vhs](https://github.com/charmbracelet/vhs) | MIT | **Recommended** for regenerating the terminal segments (rows 9, 12, 13) as clean, reproducible `.tape`-scripted recordings of the *real* `npm run demo:agent` / evidence-CLI commands — better typography/theme control than a raw screen capture, still 100% real command output. |
| [motion-canvas/motion-canvas](https://github.com/motion-canvas/motion-canvas) | MIT | Usable offline as a **prototyping sandbox** for the five-dimension diagram build (generator-based scene authoring is faster to iterate than raw Remotion for a pure-diagram beat) — but export static curves/PNG sequences into the Remotion project rather than running two render pipelines. |
| [theatre-js/theatre](https://github.com/theatre-js/theatre) | Apache-2.0 | Usable offline as a **curve-authoring sandbox only**. Its runtime playback is wall-clock based, which the picture-lock spec forbids in the final render — bake exported keyframes into `interpolate()` calls, do not ship the Theatre.js player. |
| [flubber](https://github.com/veltman/flubber) (SVG path morphing) | MIT | Small (~10KB), zero-config path interpolation — only pull it in if the five-dimension node icons need to morph shape (pattern 5); skip it if the nodes are static and just fade/scale, per the "marginal win + exotic dep = no" bar. |
| LottieFiles community packs | **Not recommended** — per-file license, mostly non-commercial/attribution-restricted, not blanket permissive; would also require a rebuild to match the near-black/amber instrument-panel palette anyway, so there's no time saved. |
| Rive community files / Rive editor | **Not recommended** — community `.riv` files carry individual, often restrictive licenses, and the free Rive desktop editor gates some export/collaboration features behind a paid plan; no offline no-account authoring path exists for this palette from scratch. |

Recommendation: build all diagram/typography overlays as hand-authored React/SVG
Remotion components (zero new runtime dependency), use `charmbracelet/vhs` only as an
optional re-capture tool for the terminal segments, and treat motion-canvas/theatre.js
purely as offline design sandboxes whose *output* (curves, timing values) gets
hand-ported into the Remotion project — never as a second runtime in the render chain.

---

DONE_WITH_CONCERNS: (1) The brief's "designed film" ambition is broader than the
already-owner-approved picture-lock spec (`docs/superpowers/specs/2026-08-20-final-film-picture-lock-design.md`)
and `capture-manifest.json`'s 85%-coverage/≤10s-graphics gates — every shot above is
designed to fit inside those gates, but row 5's optional full-bleed diagram peak and
any expansion beyond "overlay on real footage" needs explicit owner/Codex
re-approval before touching the actual master, since `docs/submission.md` already
records a "MASTER READY" sha (`279ae2af...`) produced under the stricter spec. (2) The
terminal-segment source files (rows 9, 12, 13) live only in the gitignored
`demo-video/capture/runs/2026-08-20T1530Z-preview/terminal/` folder on this machine,
not in the committed `demo-footage/` packs — flagged in §3 so implementation doesn't
silently break on a fresh clone.
