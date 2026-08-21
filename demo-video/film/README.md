# LevelField film (Remotion)

Renders `demo-video/levelfield-demo.mp4`: a motion-design film over the same
real captures (`public/captures/*.webm`) and the locked 21-beat narration
(`public/audio/`, timing from `src/beat-map.json` + 0.2 s trails = 173.56 s,
so `../levelfield-demo.en.srt` stays valid unchanged).

What it deliberately does NOT do: re-record captures, alter narration timing,
or fabricate UI — every capture layer is the previously verified footage.

## Build

```bash
npm install
node scripts/build-narration.mjs   # narration + beat map + captions + SRT
npx tsc --noEmit
npm run render   # -> out/levelfield-film.mp4 (h264, 1080p25, bt709 matrix)
```

`build-narration.mjs` uses ElevenLabs (voice + settings in `src/script-v2.json`)
when `ELEVENLABS_API_KEY` is set — one call per beat via the with-timestamps
endpoint, so character alignment drives frame-accurate burned captions and the
sidecar SRT. Without the key (or with `FORCE_OFFLINE=1`) it falls back to macOS
`say` for timing-only scratch audio. Generated audio is cached per engine;
`REGEN=1` forces regeneration.

Finalize (adds full BT.709 tags to the copied video stream, +3.1 dB narration
gain for loudness parity with the previous master, faststart):

```bash
ffmpeg -y -i out/levelfield-film.mp4 -map 0:v -map 0:a -c:v copy \
  -bsf:v "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1" \
  -af loudnorm=I=-16:TP=-1.5:LRA=7 -c:a aac -b:a 192k -movflags +faststart \
  out/levelfield-film-final.mp4
cp out/levelfield-film-final.mp4 ../levelfield-demo.mp4
```

## QA reference (2026-08-20 master v2.3 FINAL VOICE, sha256 5d91fb13…)

- Narration: ElevenLabs Liam (young/energetic, owner directive; Brian retired), one pass per beat via with-timestamps; char
  alignment drives the 51 burned caption cues (Plex Sans plate, balanced
  two-line breaks; cues duplicating on-screen kinetic type are skipped) and
  the matching 51-cue sidecar SRT.
- 175.0 s, 1920×1080 @ 25 fps, yuv420p, bt709/bt709/bt709, faststart.
- 59-frame luma sweep: no blank/black/washed frames (all 3 < YAVG < 235).
- Audio: loudnorm to −16.2 LUFS integrated.
- Scene design: `../film-shot-design.md`; per-scene stills verified in
  `out/stills/`.
