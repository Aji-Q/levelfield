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
npx tsc --noEmit
npm run render   # -> out/levelfield-film.mp4 (h264, 1080p25, bt709 matrix)
```

Finalize (adds full BT.709 tags to the copied video stream, +3.1 dB narration
gain for loudness parity with the previous master, faststart):

```bash
ffmpeg -y -i out/levelfield-film.mp4 -map 0:v -map 0:a -c:v copy \
  -bsf:v "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1" \
  -af volume=3.1dB -c:a aac -b:a 192k -movflags +faststart \
  out/levelfield-film-final.mp4
cp out/levelfield-film-final.mp4 ../levelfield-demo.mp4
```

## QA reference (2026-08-20 master, sha256 8e652f75…fa06674d)

- 4339 frames, 173.568 s, 1920×1080 @ 25 fps, yuv420p, bt709/bt709/bt709.
- 58-frame luma sweep: no blank/black/washed frames (all 3 < YAVG < 235).
- Audio: −16.3 LUFS integrated (matches previous master's −16.2), true peak
  ≈ −0.5 dBFS after gain, LRA 2.4 LU.
- Scene design: `../film-shot-design.md`; per-scene stills verified in
  `out/stills/`.
