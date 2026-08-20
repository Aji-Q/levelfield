# Capture-led LevelField demo

This package records and assembles the real 2–3 minute LevelField product demo.
The picture track is made entirely from actual LevelField browser interactions,
real MCP/CLI output, and the public Somnia explorer. It does not use the legacy
presentation renderer or still-image scene cards.

The current `../levelfield-demo-preview.mp4` is the accepted capture-led edit.
It uses the offline macOS preview voice; replace only the narration with an
approved ElevenLabs voice before submission. The older `ef31acb` version of that
file was a timing/storyboard prototype and is superseded.

## Truth and interaction contract

- `edit-manifest.json` is the canonical cut: 173.563 seconds, 14 recorded clips,
  100% browser/terminal/explorer picture coverage, and zero standalone slides.
- `capture-manifest.json` mirrors the accepted source contract and enforces at
  least 85% authentic capture with at most 10 seconds of brief graphics.
- Every included clip declares visible user/system actions and fact IDs.
- DreamDEX data is a timestamped snapshot; the 95 score is a separate curated
  reference case.
- The MCP sequence is a real pre-action policy decision and visibly states that
  no order is submitted.
- The explorer proves the deployed ScoreRegistry source is verified. Current
  score provenance remains legacy until immutable-SHA republishing and a
  successful fail-closed read-back.
- `evidence-manifest.json` binds the accepted MP4, subtitles, source clip hashes,
  action requirements, and truth-state snapshot.

Raw runs live under `runs/RUN_ID/` and are gitignored. Claude's committed
`demo-footage/` handoff can be copied into a run by `prepare:run`.

## Record a run

Start the production web app at `http://127.0.0.1:3000`, create a run folder,
then record the seven deterministic browser flows. Each flow performs real
navigation, scrolling, clicking, paste, verification, and result assertions.

```bash
cd demo-video/capture
npm install

RUN="runs/$(date -u +%Y-%m-%dT%H%MZ)"
mkdir -p "$RUN/browser" "$RUN/terminal" "$RUN/explorer"

for FLOW in home-snapshot market-three curated-cb1 methodology \
  assess-prepared-json instruction-like-rejection closing-product; do
  node scripts/capture-browser.mjs \
    --base-url http://127.0.0.1:3000 \
    --flow "$FLOW" --name "$FLOW" --output-dir "$RUN/browser/$FLOW"
done

node scripts/capture-terminal.mjs mcp-policy --output-dir "$RUN/terminal"
node scripts/capture-terminal.mjs evidence --output-dir "$RUN/terminal"
node scripts/capture-explorer.mjs --output-dir "$RUN/explorer"
node scripts/prepare-run.mjs --run "$RUN" --copy-handoff
```

Browser and explorer capture use clean Playwright contexts. Terminal capture
uses a fixed command allowlist, `shell:false`, localhost-only staging, streamed
real stdout, and transcript assertions. Secrets and wallet material are never
part of the capture commands.

## Build and verify the preview

```bash
cd demo-video/capture
npm run captions
npm run compose:preview -- --run "$RUN"
npm run verify:final -- --run "$RUN"
npm run contact-sheet -- --run "$RUN"
npm test
```

The verifier requires 1920×1080 H.264/yuv420p at 30 fps, AAC 48 kHz stereo,
2–3 minute duration, preview loudness near -16 LUFS, exactly 21 synchronized
English subtitle cues, every required action, truthful snapshot/provenance facts,
and the exact SHA-256 emitted by the edit.

## Replace the preview voice with ElevenLabs

Only run this after both an approved voice ID and an API key are available:

```bash
cd demo-video/presentation
export ELEVENLABS_API_KEY="..."
export ELEVENLABS_VOICE_ID="..."
PRESENTATION_TTS=elevenlabs npm run synthesize-audio -- --force

cd ../capture
npm run captions
npm run compose:preview -- --run "$RUN" --output ../levelfield-demo-final.mp4
npm run verify:final -- --run "$RUN" --video ../levelfield-demo-final.mp4
npm run contact-sheet -- --run "$RUN" --video ../levelfield-demo-final.mp4
```

Recheck the three-minute ceiling after synthesis. If the approved voice changes
cue timing, update the edit durations to the regenerated timing manifest rather
than time-stretching the narration.
