# Eligibility Rules Research — Somnia × DreamDEX Event Contracts Hackathon

Date: 2026-08-21
Researcher: background research worker (independent of owner's email to organizers)
Event page confirmed live at: https://dorahacks.io/hackathon/event-contracts (status at check time: **Pre-registration**, submission opens 2026/08/24 20:00 UTC per the page's own timeline widget — the page states "25th Aug" in prose, so the event is almost certainly using a timezone offset; treat 2026-08-25 as the practical start).

Note on tooling: DoraHacks blocks the automated WebFetch tool (HTTP 405 on every URL tried, including known-good pages), so all DoraHacks content below was retrieved by rendering the pages in a real browser and reading the DOM directly. Quotes are verbatim from that render.

---

## Q1 — Pre-window builds: must the project be built during the submission window?

**Verdict: NO-RULE-FOUND at the event level, with platform-level evidence pointing toward ALLOWED.**

What I checked:
- The event's own rules page (`Introduction`, `Timeline`, `Prizes`, `Eligibility`, `What to Build`, `Submission Guidelines`, `Judging criteria` — full text captured, see Evidence). **No clause anywhere requires the project to be created during, or only after, the submission window.** No minimum-commit-count or commit-history requirement either (contrast with a sibling Somnia event below, which does have one).
- The `Eligibility` section instead says: *"We encourage experienced builders to create production-ready applications rather than simple proof-of-concept."* — this reads as neutral-to-favorable toward more mature/pre-built submissions, not a bar against them.
- DoraHacks' own organizer guidance (platform blog, not this event) treats a "built during the event" clause as **optional and organizer-specific**, not a platform default:
  > "**The 'Fresh Code' Rule** — Do: If needed, require that projects be built specifically for the hackathon, or that significant, documented improvements be made during the event... Don't: Accept 'recycled' projects that were used to apply for hundreds of irrelevant hackathons."
  — [The Rules of Hackathon Rule-Making](https://dorahacks.io/blog/news/hackathon-rules)
  This confirms the "fresh code" clause is a rule organizers *choose* to add per event — and the Event Contracts Hackathon organizer did not add it.
- DoraHacks' platform-wide **Code of Conduct** has a "Be Original and Honest" clause, but it targets plagiarism/misrepresentation of authorship, not timing of the build:
  > "Contribute only original content and ensure that your actions and representations are truthful. Do not plagiarize or misrepresent yourself, your work, or your intentions."
  — [Code of Conduct](https://dorahacks.io/legal/code-of-conduct)
- **Platform mechanics actively support submitting a pre-existing project.** The Bitcoin Hackathon's submission guide (a different DoraHacks event, but describing the same shared submission engine) documents an explicit "Apply with Existing BUIDL" path:
  > "→ If you already have a BUIDL on DoraHacks: Choose your BUIDL project from 'Apply with Existing BUIDL' and identify the track you want to join."
  — [Bitcoin Hackathon Submission Rules](https://dorahacks.io/hackathon/btc-hackathon/submission-rules)
  This is DoraHacks-wide UI/UX, not specific to one event, and it presumes pre-existing projects are a normal submission path platform-wide, absent an organizer override.
- **Precedent from other Somnia-affiliated DoraHacks hackathons** (same organizer family, same platform):
  - Somnia DeFi Mini Hackathon: only requires *"Public GitHub repo with >2 commits and detailed README"* — a trivially low bar, not a "built from zero during the window" rule. — https://dorahacks.io/hackathon/defi-mini-hackathon/detail
  - Somnia Data Streams Mini Hackathon: submission requirements list a repo + working dApp + demo video, **no commit-count or freshness requirement at all**. — https://dorahacks.io/hackathon/somnia-datastreams/detail

What I did NOT find: any explicit sentence on this event's page, on DoraHacks' Terms of Use, or on Somnia's/DreamDEX's own sites, saying "pre-built projects are eligible" in so many words. The conclusion is inferential (absence of a restriction + platform default behavior + consistent precedent), not an affirmative quote.

**Confidence: Medium-High.** Three independent signals (this event's silence, platform mechanics, sibling-event precedent) all point the same direction, and none point the other way.

---

## Q2 — AI-generated content in the demo video (TTS voiceover / AI b-roll)

**Verdict: NO-RULE-FOUND — event level and platform level.**

What I checked:
- Event page's `Submission Guidelines` section only specifies format constraints: *"2–3 minute demo video."* No content-medium restrictions (no ban or requirement around live-action footage, voiceover source, or AI tooling).
- DoraHacks Code of Conduct and Terms of Use (read in full for the Code of Conduct; Terms of Use read through the "Contests/Competitions" and "Exclusivity of Submissions" sections — no AI-content clause appeared in either).
- General web search for DoraHacks-specific or Somnia-specific AI-voiceover/AI-video policy returned nothing on-platform. The only hits were from **unrelated hackathons on other platforms** (e.g., a Devpost-hosted "Build & Pitch w/ Raylu" event, Microsoft's AI Agents Hackathon) — these are NOT DoraHacks/Somnia rules and should not be treated as applicable; I'm flagging them only as general industry texture: some non-DoraHacks hackathons restrict video *format* (e.g., "must be a continuous screen recording, not a slide deck with narration") or require disclosure of heavy edits, but even those don't single out AI-generated voiceover as prohibited — one explicitly notes AI voiceover doesn't need disclosure unless it clones a real person's voice.
- I did not find any Somnia or DreamDEX blog/docs/X statement addressing AI content in submissions.

**Confidence: Medium.** Absence of a rule across the event page, Code of Conduct, and Terms of Use is fairly strong for "no restriction exists today," but I did not exhaustively read DoraHacks' Privacy Policy (low relevance expected) or every legal sub-page, and rules could still be amended before the 2026-08-25 submission opening.

---

## Q3 — Exact required artifact list

**Verdict: CONFIRMED — quoted verbatim from the event's own page.**

Source: https://dorahacks.io/hackathon/event-contracts, `Submission Guidelines` section (captured 2026-08-21):

> "Each team should submit:
> - Working prototype on testnet
> - GitHub repository
> - 2–3 minute demo video
>
> Optional:
> - Presentation deck
> - A feedback report regarding SDK and documentation"

Corroborating summary badge on the same page (`SUBMISSION REQUIREMENTS` box): *"GitHub/Gitlab/Bitbucket Link Required"* and *"Demo Video Required"* — consistent with the above, confirming repo + video are the two hard-gated requirements, everything else (deck, feedback report) is optional.

No separate "live demo link" is listed as its own required field — the "working prototype on testnet" is the functional-demo requirement; there's no requirement for a hosted/public frontend URL distinct from the testnet deployment. No explicit page-count or format spec for the optional deck.

Judging weights (for context, not an artifact requirement): Innovation & Originality 20%, Technical Implementation 25%, UX & Design 20%, Business & Ecosystem Impact 20%, Presentation & Demo 15%.

**Confidence: High.** This is a direct, dated, on-page quote for the exact event in question.

---

## Evidence chain / sources checked

| # | Source | Type | Relevant? |
|---|---|---|---|
| 1 | https://dorahacks.io/hackathon/event-contracts | This event's own rules (primary source) | Yes — full rules read |
| 2 | https://dorahacks.io/blog/news/hackathon-rules | DoraHacks platform guidance to organizers | Yes — shows "fresh code" rule is optional/per-event |
| 3 | https://dorahacks.io/legal/code-of-conduct | Platform-wide Code of Conduct | Yes — originality clause is anti-plagiarism, not anti-pre-build |
| 4 | https://dorahacks.io/legal/terms | Platform-wide Terms of Use | Checked through Contests/Competitions & Exclusivity sections — no AI/build-window clause found |
| 5 | https://dorahacks.io/hackathon/btc-hackathon/submission-rules | Different DoraHacks event, same submission engine | Yes — shows "Apply with Existing BUIDL" as a normal platform path |
| 6 | https://dorahacks.io/hackathon/defi-mini-hackathon/detail | Precedent: Somnia DeFi Mini Hackathon | Yes — >2 commits requirement only, no AI clause |
| 7 | https://dorahacks.io/hackathon/somnia-datastreams/detail | Precedent: Somnia Data Streams Mini Hackathon | Yes — no freshness/commit/AI clause at all |
| 8 | https://blog.somnia.network/p/somnia-reactivity-hackathon-shows | Somnia blog, Reactivity hackathon recap | Checked — no Event Contracts / DreamDEX / rules content |
| 9 | https://blog.somnia.network/p/dreamdex-is-the-endgame-dex | Somnia blog, DreamDEX product post | Checked — no hackathon content |
| 10 | Various web searches for DoraHacks/Somnia AI-content and build-window policy | General search | No dedicated help-center article found; no platform-wide AI policy found |

Not found / not attempted: Somnia's or DreamDEX's X/Twitter feeds (not directly fetchable by these tools; the DoraHacks event page itself is the authoritative and most current source and supersedes any social post). Discord content (requires join, out of scope for this pass).

---

## Recommended posture

1. **Pre-window builds (Q1) — proceed.** No rule on the event page bars it, DoraHacks' own "fresh code" clause is opt-in and this organizer opted out, and the platform's own submission flow assumes pre-existing BUIDLs are normal. This risk looks phantom, not real.
2. **AI TTS narration (Q2) — proceed.** No rule anywhere (event, Code of Conduct, Terms) restricts it; nothing suggests judges would even ask.
3. **AI-generated b-roll (Q2) — low risk, but be ready to say so.** Same absence-of-rule finding applies; if asked, be transparent that it's AI-generated (aligns with the Code of Conduct's "be honest," which is about representation, not tooling).
4. **Artifact list (Q3) — lock scope now:** repo (required) + 2–3 min video (required) + testnet-deployed working prototype (required). Deck and SDK feedback report are optional bonus points (feedback report likely helps under "Technical Implementation" goodwill with DreamDEX/Somnia); no separate hosted live-demo link is mandated.
5. **One real residual risk:** the event is still in "Pre-registration" as of 2026-08-21, submissions open ~2026-08-24/25 — re-check the rules page right when submissions open (2026-08-25) in case the organizer adds late clauses; do not wait on the owner's email before proceeding, but don't treat today's silence as immutable either.
