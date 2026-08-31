# DoraHacks BUIDL submission copy (draft)

Shared phrasing source for the submission form and the deck. TODO fields are filled at
packaging time. Owner submits the form; agents keep this file current.

## Project name

**LevelField**

## One-liner

Know who you're really betting against: structural information-asymmetry risk scores for
event contracts — from contract text alone, with no trading data and no LLM API.

## Description (form body)

Every existing prediction-market tool answers "who are the insiders, and how do I copy
them." LevelField answers the question nobody serves: **is this the kind of market where
someone knows the outcome before you do — and is anything stopping them from trading on
it?**

LevelField scores any event contract on five structural dimensions (who controls the
outcome, how many know it early, whether they can trade, how it's disclosed, whether it
can be manufactured), using a fixed public anchor library validated against the risk
gradient the Anti-Corruption Data Collective found across 435,000+ settled Polymarket
markets. Scores are produced by a two-stage pipeline in which **no model ever outputs a
number**: classification is matched to public anchors with mechanically verified verbatim
evidence quotes (which also defeats prompt-injection via market descriptions — try it on
our injection test contract), and the score is a deterministic, unit-tested function.
Unlike LLM-scored risk tools, no model ever writes the number here.

Built DreamDEX-native and agent-native:

- **Live track**: DreamDEX Shannon testnet markets scored from typed on-chain fields
  (per the official Gotcha #13 guidance), zero LLM involved — and the result is honest:
  today's price binaries score 3/100, the structurally safest category, which is the
  risk map's null point, not a limitation.
- **MCP server**: any trading agent can call `assess_market` before placing an order —
  our demo shows an agent PROCEED on a 3/100 market and DECLINE a 90+/100 one, quoting
  the evidence. The classification protocol itself is open: the calling agent's own
  model classifies; the server verifies and computes. No API key anywhere.
- **On-chain**: scores are published as attestations on Somnia Shannon
  (ScoreRegistry `0xb8e11dea346f2c961880879606a269db3165bbc7`), method-hash-pinned to
  the anchor-library version, read back and rendered on every market page — a public
  good any contract or agent can read without our site.

Evidence, not vibes: 16-contract validation set with category medians strictly ordered
and Spearman ρ = 0.93; three independent blind classification runs agree with the
reference band 16/16; inter-run agreement stats published per dimension. All of it
reproducible from the repo with `npm test`, `npm run validate`, and
`npx tsx scripts/agreement.ts`.

## Why this grows the ecosystem

A market lists new event categories only if users trust them. LevelField converts
"feels rigged" into a readable, auditable number — lowering the trust barrier for new
users (UX for the risk-illiterate), giving agents a pre-trade risk hook (trading
activity), and giving the venue a listing-time risk instrument for the categories it
could list next (adoption). The SDK feedback report (docs/sdk-feedback-report.md, 11
evidence-backed findings from real integration) is part of the same contribution.

## Links

- GitHub: https://github.com/Aji-Q/levelfield
- Demo video: https://youtu.be/XDMKRzUT_nI
- ScoreRegistry (Somnia Shannon): https://shannon-explorer.somnia.network/address/0xb8e11dea346f2c961880879606a269db3165bbc7
- SDK & docs feedback report: docs/sdk-feedback-report.md (in repo)
- Methodology: /methodology page (in-app) or data/anchors/anchors.yaml

## Tech stack line

TypeScript monorepo · Next.js web app · MCP server (zero LLM deps) · Solidity
ScoreRegistry on Somnia Shannon (Foundry) · DreamDEX indexer + @somnia-chain/markets-sdk
integration · deterministic scoring engine, 70 software tests + 8 contract tests

## Form checklist

- [x] GitHub link: https://github.com/Aji-Q/levelfield (full history, main + codex branch, pushed 2026-08-21)
- [x] Demo video LIVE: https://youtu.be/XDMKRzUT_nI (Public, 2:56, title/description/chapters set, EN subtitles published) — MASTER v2.3 (Claude, 2026-08-20): demo-video/levelfield-demo.mp4, sha 5d91fb13..., 2:55.0, Remotion motion-design film, rewritten v2 narration (script-v2.md) in ElevenLabs Liam — young/energetic per owner directive (one pass, char-timestamp-aligned), 51 burned caption cues + matching sidecar SRT; 1080p25 BT.709 fully tagged, loudnorm −16.2 LUFS, luma sweep clean, per-scene stills verified. Previous master kept: composed v1 levelfield-demo-preview.mp4 (sha 279ae2af...).
- [x] Deck (optional): demo-deck/levelfield-deck.pdf — v2, 10 slides, real product surfaces (Claude, 2026-08-21); refresh URLs at packaging
- [x] Provenance-complete republish done 2026-08-31: 26 attestations, URIs pinned to ea725e2, verify:onchain 26/26 zero mismatches, onchain.json committed
- [ ] Re-check the rules page (https://dorahacks.io/hackathon/event-contracts) when submissions open (~2026-08-24 20:00 UTC) for late-added clauses; cross-check the organizer's email reply when it arrives. Recon verdicts (docs/review/research-eligibility-rules.md, 2026-08-21): pre-window builds — no rule bars them (event page silent, platform "Apply with Existing BUIDL" path, sibling-event precedent); TTS/AI narration — no restriction anywhere; artifact list confirmed verbatim: prototype on testnet + repo + 2–3 min video required, deck & SDK feedback report optional. Judging: Technical 25 / Innovation 20 / UX & Design 20 / Ecosystem 20 / Presentation 15.
- [ ] Final owner read-through of this copy before pasting
