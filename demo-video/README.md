# LevelField demo film

The deliverable is a five-chapter, 21-step, English 16:9 film built as a
browser-rendered presentation. Narration is the timing source: every audio
segment advances exactly one visual step, followed by a 200 ms breathing gap.

## Deliverables

- `script.md` — locked English voiceover.
- `outline.md` — 5 chapters / 21 visual beats.
- `production-plan.md` — ElevenLabs direction, recording spec, and truth gates.
- `presentation/` — editable React/Vite source and local render pipeline.
- `levelfield-demo.en.srt` — generated from the final per-step audio durations.
- `levelfield-demo-preview.mp4` — offline preview render when present. Replace
  its macOS preview voice with ElevenLabs before submission.

## Rebuild

```bash
cd demo-video/presentation
npm install
npm run build
npm run extract-narrations
```

### Final ElevenLabs narration

The adapter defaults match `production-plan.md`: `eleven_multilingual_v2`,
stability `0.58`, similarity `0.75`, style `0`, speed `1.0`, and speaker boost
off. Credentials remain outside the repository.

```bash
export ELEVENLABS_API_KEY="..."
export ELEVENLABS_VOICE_ID="..."
PRESENTATION_TTS=elevenlabs npm run synthesize-audio -- --force
npm run captions
VIDEO_OUTPUT=../levelfield-demo-final.mp4 npm run render:video
npm run verify:deliverables
```

Measure the generated voice before rendering. If it approaches the three-minute
limit, set `ELEVENLABS_SPEED=1.03` (or A/B test up to `1.05`) and regenerate;
ElevenLabs supports speed values from 0.7 to 1.2, with 1.0 as the default.

### Offline timing preview

```bash
PRESENTATION_TTS=say npm run synthesize-audio -- --force
npm run captions
npm run render:video
```

The renderer captures all 21 actual React scenes at 1920×1080 in Chromium,
holds each scene for its ffprobe-derived narration duration, builds a narration
master at approximately -16 LUFS, and exports H.264/AAC at 30 fps. This
frame-driven path remains synchronized even if a headless browser has no audio
sink or the host sleeps mid-render. `CHROMIUM_EXECUTABLE` may point to a local
Chromium binary if Playwright has no cached browser.

## Submission truth gates

Before locking the final voice and screen evidence:

1. Refresh DreamDEX scores and show a capture timestamp; use `snapshot`, never
   `live`, for cached examples.
2. Publish current score attestations with a real repository and immutable
   commit ref, then make `npm run verify:onchain` pass.
3. Replace all `republish pending` / legacy-provenance shots with the verified
   current state.
4. Add public GitHub and deployment links only after they exist.
5. Re-run the software, Forge, validation, agreement, MCP, and SDK evidence
   commands against the final commit.
