# LevelField hackathon deck (v2)

`levelfield-deck.pptx` / `levelfield-deck.pdf` — 10 slides, dark editorial
brand, real product screenshots (live deployed site, MCP transcript, explorer),
audited numbers only (see docs/review/fable-review-2026-08-20.md). The PDF is
the canonical shareable (fonts baked); the PPTX edits in PowerPoint.

Rebuild: `cd gen && npm install && node deck.cjs`, then export PDF
(PowerPoint or LibreOffice). Screenshots live in `assets-v2/`.

Before submission: update the live-site URL on slides 1 and 10 if the Vercel
project is renamed, and swap the GitHub line once the repo is public.

The Codex-era deck was removed 2026-08-21 (stale numbers; rebuildable only in
a Codex workspace runtime) — see git history for the artifact.
