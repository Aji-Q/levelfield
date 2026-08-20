# Capture-led preview QA · 2026-08-20

## Result

**PASS as the capture-led offline-voice preview.** The picture is a genuine
LevelField demonstration rather than an auto-playing presentation. Submission
still waits for an approved ElevenLabs voice and the two recording-day pickups
listed below.

## Accepted artifacts

| Artifact | Result |
| --- | --- |
| `../../levelfield-demo-preview.mp4` | SHA-256 `1948747d82ad28b91bb4c05eeb7b0dcce26bac471dcbc98f6ea9b4cc155ae640` |
| `../../levelfield-demo.en.srt` | SHA-256 `168247dd6717dd9635e93673ec28f397f63a22a075c26d9e4034f5fa46a53fe4` |
| `../evidence-manifest.json` | Machine-readable media, source, action, and fact evidence |
| `contact-sheet.jpg` | 21 evenly spaced frames; SHA-256 `48239ed4848ce814e8cb5dc71151debf2b50f67d718f69bc48aaa79713698fe9` |

## Media gates

- Duration: **173.598 s** (2:53.60), within the required 2–3 minute window.
- Picture: H.264 High, 1920×1080, yuv420p, 30 fps, 5,208 frames.
- Audio: AAC-LC, 48 kHz, stereo, **-16.2 LUFS**, -0.94 dBTP.
- Captions: 21 monotonic English cues; final cue ends at 173.363 s.
- Blank-frame scan: 1,736 samples at 10 fps; no consecutive near-white or
  near-black blank run. `blackdetect` found no black interval of 0.5 s or more.
- Silence scan: no interval of 0.5 s or more below -45 dB.
- Visual sampling: all 21 QA frames have distinct hashes and the contact sheet
  contains no empty frame, slide card, or presentation-renderer output.

## Interaction coverage

- `edit-manifest.json` contains **14** browser, terminal, or explorer clips.
- Authentic recorded picture: **173.563 / 173.563 s (100%)**.
- Standalone title/transition time: **0 s**.
- All 52 declared action references (51 unique IDs) are present in the capture
  evidence. They cover navigation, scrolling, hover/click emphasis, JSON paste,
  verification, rejected instruction-like evidence, real MCP execution, public
  explorer interaction, and real validation/test/SDK command output.
- The Somnia cut begins on the loaded Contract details view and visibly enters
  the Contract tab before displaying the exact source-verification banner; no
  white page-load flash remains.

## Fact review

- DreamDEX is called a **captured/timestamped snapshot**, generated
  `2026-08-20T02:25:38.554Z`; it is never described as live.
- Score 3 comes from that DreamDEX Shannon snapshot. Score 95 comes from a
  separate curated reference case; the script does not call them the same venue.
- MCP is described and shown as a **pre-action policy**. The terminal visibly
  says `No order submitted — assessment only.`
- The explorer proves the deployed ScoreRegistry source is verified. Narration
  keeps complete score provenance in future tense because all 24 current cached
  attestations still lack valid immutable-source URIs.
- Validation claims remain scoped to 16 curated contracts: score range 3–95 and
  Spearman rho .930. The evidence terminal also shows 69 software tests, 8 Forge
  tests, and the read-only official SDK cross-check.

## Final pickup gates

1. When a public repository and immutable commit-SHA provenance republish pass
   `verify:onchain`, replace only the legacy-provenance pickup and update facts.
2. If a recording-day DreamDEX refresh lands, replace only timestamp-sensitive
   shots and regenerate the evidence manifest.
3. When `ELEVENLABS_API_KEY` and an approved `ELEVENLABS_VOICE_ID` exist,
   regenerate the 21 audio segments, subtitles, edit, contact sheet, duration,
   loudness, blank-frame, fact, interaction, and full repository gates.

The optional deck remains separate and is not used as video source material.
