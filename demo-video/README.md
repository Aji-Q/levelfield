# LevelField demo video

The required deliverable is a 2–3 minute English **product demonstration**. Its
picture track is real LevelField UI, Assess workflow, MCP/CLI execution, and
Somnia explorer interaction—not an auto-playing deck.

## Deliverables

- `levelfield-demo.mp4` — current master: Remotion motion-design film
  (`film/`) over the same real captures and locked narration timing; kinetic
  type, animated diagrams, and camera moves replace the plain composed cut.
- `levelfield-demo-preview.mp4` — previous capture-led composed edit, kept for
  reference; same beat timing and narration.
- `levelfield-demo.en.srt` — 51-cue English sidecar subtitles, char-timestamp
  aligned to the v2.3 master (the film also burns these cues in).
- `film/` — Remotion project that renders the master
  (`npm run render`, then the BT.709/loudness finalize pass in `film/README`
  or the commands in `film-shot-design.md`).
- `capture/` — deterministic record, edit, evidence, caption, and QA pipeline.
- `script-v2.md` — locked English voiceover (v2; source of truth is
  `film/src/script-v2.json`). v1 archived in `script.md`.
- `production-plan.md` — voice direction and truth gates.
- `presentation/` — storyboard/motion-reference prototype only; excluded from
  the final picture track.

The optional hackathon deck is a separate artifact in `../demo-deck/`.

## Rebuild the capture-led edit

See `capture/README.md` for the full recording workflow. With an accepted run:

```bash
cd demo-video/capture
npm install
npm run captions
npm run compose:preview -- --run runs/RUN_ID
npm run verify:final -- --run runs/RUN_ID
npm run contact-sheet -- --run runs/RUN_ID
npm test
```

The current edit is 173.563 seconds and uses 100% authentic recorded picture.
It visibly demonstrates browser navigation, market evidence, injection-like
quote rejection, a real Assess verification, real MCP PROCEED/DECLINE output,
the source-verified ScoreRegistry, validation/tests, and the SDK cross-check.

## Final ElevenLabs narration

Credentials stay outside the repository. Generate audio only when an approved
voice ID is available, then rebuild the capture-led edit—not the presentation
renderer.

```bash
cd demo-video/presentation
export ELEVENLABS_API_KEY="..."
export ELEVENLABS_VOICE_ID="..."
PRESENTATION_TTS=elevenlabs npm run synthesize-audio -- --force

cd ../capture
npm run captions
npm run compose:preview -- --run runs/RUN_ID \
  --output ../levelfield-demo-final.mp4
npm run verify:final -- --run runs/RUN_ID \
  --video ../levelfield-demo-final.mp4
```

If the approved voice approaches three minutes, A/B test
`ELEVENLABS_SPEED=1.03` through `1.05`, regenerate all segments, then rebuild
subtitles, the edit, and QA evidence.

## Submission truth gates

1. Present cached DreamDEX examples as a timestamped snapshot, never as live.
2. Keep the DreamDEX score of 3 distinct from the curated reference score of 95.
3. Describe MCP as pre-action policy; no order is submitted in the demo.
4. Treat explorer source verification separately from complete score provenance.
5. After a real public repository and immutable-SHA republish exist, capture the
   final provenance pickup and rerun `verify:onchain` before changing narration.
6. Refresh recording-day DreamDEX evidence when available and rerun every media,
   caption, fact, interaction, test, and build gate before submission.
