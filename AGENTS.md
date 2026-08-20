# AGENTS.md — LevelField agent collaboration protocol

Two AI agents work on this repository as teammates, coordinated by the human owner:

- **Claude** (Claude Code / Fable 5) — code trunk, tests, on-chain operations, GitHub
  push, commit integrity, subagent orchestration.
- **Codex** (GPT) — demo video, presentation deck, image assets, plus code contributions
  under the same rules as everyone else.

The human owner is the tie-breaker on any disagreement. This file is the contract both
agents follow; Codex reads it automatically at session start, Claude reads it every turn
it touches the repo.

## Communication channel (no direct process link exists — use the mailboxes)

- `docs/collab/inbox-codex.md` — messages **to Codex** (written by Claude or the owner).
- `docs/collab/inbox-claude.md` — messages **to Claude** (written by Codex or the owner).

Rules: append-only, newest entry at the top, each entry starts with
`## <UTC timestamp> · from <agent>` and ends with a `STATUS:` line
(`FYI | NEEDS_REPLY | CLAIMING | DONE | BLOCKED`). Read your inbox at the start of every
session and before every commit. Delete nothing; the mailbox is also the audit trail.

## Work claiming (the anti-collision rule)

Before editing more than ~2 files or anything under `packages/scoring/src`, post a
`CLAIMING` entry to the other agent's inbox listing the paths you are about to touch.
The claim stands until your `DONE` entry or 2 hours, whichever first. If you find a claim
covering a path you need, work elsewhere or leave a `NEEDS_REPLY`. Small single-file
fixes and additive new files need no claim.

## Commit discipline (both agents)

1. Never commit with failing gates. The gates:
   `npm test` (all suites) · `npx tsc --noEmit -p packages/scoring/tsconfig.json` ·
   `rm -rf apps/web/.next && npm run build -w @levelfield/web` ·
   `npx tsx scripts/verify-classifications.ts`.
2. Commit your own work under your own attribution line
   (`Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` or the Codex equivalent).
   Do not commit the other agent's uncommitted working-tree changes without a mailbox
   handoff saying so.
3. Never rewrite published history; no force-push, no `git reset --hard`, no reverting
   the other agent's commits without a mailbox agreement.
4. If you regenerate `data/scores/`, also run `npx tsx scripts/verify-onchain.ts` and
   note in the commit whether the on-chain registry needs a republish.

## Project invariants (do not undo these)

- **No paid-LLM dependency on any default path.** Stage A providers are: the rule
  classifier (live price binaries), reference classification files (curated), the MCP
  two-step protocol (any text). `ClaudeClassifier` stays optional.
- **Models never produce numbers.** All scores come from `packages/scoring/src/engine.ts`.
- **Evidence quotes are mechanically verified** (verbatim substring + injection-overlap
  rejection). Never weaken `verify.ts` checks; add tests when you extend them.
- **Anchor library** (`data/anchors/anchors.yaml`) is the single source of truth; version-
  bump it on any semantic change and re-run score-all + validate + agreement.
- Design language: instrument-panel neutrality — band words always printed next to
  numbers, no red/green, no gamification.
- Reference classifications (`data/classifications/`) are the project lead's (Claude's)
  call after review; propose changes via mailbox rather than editing them directly.

## Current state pointers (read before planning work)

- `README.md` — architecture + status checklist.
- `docs/review-2026-08-20.md` — adversarial review; remaining open items live in its §4.
- `docs/validation.md`, `docs/agreement.md` — the evidence artifacts the demo cites.
- ScoreRegistry is DEPLOYED on Somnia Shannon: `0xb8e11dea346f2c961880879606a269db3165bbc7`
  (owner key in the local `.env`, gitignored; 28+ attestations live).
- Hackathon deliverables still open: demo video (2–3 min), optional deck, GitHub push.

## Division of labor (current, owner-approved)

- Codex: demo video production, deck, any image/motion assets (it has image/video
  tooling), plus code PR-sized contributions under the claim rule.
- Claude: code trunk and integration, test/build gates, chain publishing, GitHub push,
  final submission packaging.
- Either agent may propose re-division via mailbox; the owner decides.
