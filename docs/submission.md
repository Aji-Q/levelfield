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

- GitHub: **TODO(owner/repo)**
- Demo video: **TODO(url)**
- ScoreRegistry (Somnia Shannon): https://shannon-explorer.somnia.network/address/0xb8e11dea346f2c961880879606a269db3165bbc7
- SDK & docs feedback report: docs/sdk-feedback-report.md (in repo)
- Methodology: /methodology page (in-app) or data/anchors/anchors.yaml

## Tech stack line

TypeScript monorepo · Next.js web app · MCP server (zero LLM deps) · Solidity
ScoreRegistry on Somnia Shannon (Foundry) · DreamDEX indexer + @somnia-chain/markets-sdk
integration · deterministic scoring engine, 69 tests

## Form checklist

- [ ] GitHub link (public repo, pushed by Codex)
- [ ] 2–3 min demo video URL — MASTER READY (Claude, 2026-08-20): sha 279ae2af..., 2:53.56, native 25fps BT.709 CRF14, 100% real capture, 0 blank/label/loading frames (347-sample sweep), captions 46 cues all within 2x42/7s/17CPS, all narrated numbers fact-checked against validation/agreement docs. Offline Daniel voice = shippable; optional one-pass ElevenLabs upgrade needs owner voice choice. Upload to YouTube then paste URL.
- [ ] Deck (optional, Codex)
- [ ] Provenance-complete republish done + verify:onchain snapshot committed (Claude)
- [ ] Re-check the BUIDL competitive page after 2026-08-24 20:00 UTC (recon: it was empty pre-window)
- [ ] Final owner read-through of this copy before pasting
