# Capture-led LevelField demo video design

## Decision

The submission film is a genuine product demonstration. It is not an auto-playing
slide deck, a sequence of screenshots, or a motion-graphics explainer that merely
describes the product. The film shows LevelField receiving user actions and producing
real responses.

Commit `ef31acb` remains useful as a narration, timing, brand, and storyboard prototype.
Its frame renderer and `demo-video/levelfield-demo-preview.mp4` are not final-film
sources. The PowerPoint deck remains an optional, separate judging aid.

## Success criteria

- Runtime is between 2:00 and 3:00; the working target is 2:45–2:55.
- At least 85% of runtime is authentic browser, terminal, or explorer capture.
- Title cards and transitions total no more than 10 seconds.
- The viewer sees real clicks, cursor movement, typing or paste, scrolling, command
  execution, and system responses.
- Browser footage includes the homepage, a DreamDEX snapshot score, a curated reference
  score, market evidence, Methodology, and an Assess result produced in the browser.
- Terminal footage shows a real MCP stdio run that returns both `PROCEED` and `DECLINE`.
- Chain footage distinguishes verified ScoreRegistry source code from score provenance.
  Provenance is described as complete only after immutable-source republish and a
  successful fail-closed read-back.
- The final English narration, SRT, interaction timeline, and picture are synchronized.
- Final video is 1920×1080, 30 fps, H.264 with AAC audio near -16 LUFS and no peak above
  -1 dBTP.

## Truth constraints

1. The DreamDEX material is a timestamped Shannon snapshot, never a live-feed claim.
2. The score-3 example is a DreamDEX snapshot; the score-95 example is a curated
   reference contract. They are not presented as the same venue.
3. The MCP sequence is a pre-action policy evaluation, not an order or trading
   integration.
4. A source-verified Solidity contract does not by itself prove current score
   provenance. The legacy snapshot remains visibly legacy until republished and fully
   verified.
5. LevelField describes structural information asymmetry; it does not allege wrongdoing,
   predict an outcome, or detect live insider activity.

## Editorial structure

| Time | Authentic action and response |
| --- | --- |
| 0:00–0:05 | Brief brand line over the real LevelField homepage; cursor is already visible. |
| 0:05–0:31 | Scroll the homepage comparison, reveal the snapshot timestamp, and click the DreamDEX `3 / low` market. |
| 0:31–0:57 | Inspect score evidence and dimensions; return and click the curated `95 / high` reference; reveal CB-1 and caveats. |
| 0:57–1:20 | Navigate to Methodology, scroll the five public anchors, fixed weights, quote verification, and conservative default. |
| 1:20–1:50 | Navigate to Assess, load a reference contract, paste committed classification JSON, click `Verify & score`, and inspect the computed result. Show instruction-like rejection through a real market/detail or Assess rejection response. |
| 1:50–2:14 | In a terminal view, type and execute `npm run demo:agent`; stream the real MCP stdout and emphasize `PROCEED 3` versus `DECLINE 95`. |
| 2:14–2:36 | Open the real Somnia explorer and inspect `ScoreRegistry` plus source verification. Replace this pickup after provenance republish; until then, pair it with the real fail-closed legacy state. |
| 2:36–2:49 | Stream actual validation/test/SDK evidence and its exit status. |
| 2:49–2:54 | Return to the product and end on the LevelField promise. |

## Capture architecture

### Browser capture

Playwright records continuous `.webm` interaction clips from a production Next build at
1920×1080, `deviceScaleFactor: 1`, UTC, and 100% zoom. Selectors use roles, labels, and
visible names. A small injected cursor and click pulse make Playwright actions visible;
they annotate actual actions rather than substituting for them.

The capture driver writes an action log with monotonic timestamps, route, selector,
action type, and resulting visible assertion. Recording fails when a required response
does not appear.

### Terminal capture

A localhost-only terminal stage executes a fixed allowlist of repository commands and
streams their real stdout/stderr into the recorded viewport. The command is visibly
typed before execution. Each transcript stores command, UTC time, exit code, and SHA-256.
No arbitrary command input, `.env` value, wallet material, token, or personal absolute
path is rendered.

The essential command is `npm run demo:agent`. Validation, agreement, tests, SDK
cross-check, and on-chain verification may be recorded as shorter proof clips.

### Explorer capture

A clean Chromium context opens the public Somnia Shannon explorer, clicks `Contract`,
and waits for `Contract source code verified (exact match)` plus `ScoreRegistry`.
External-console noise is not treated as product failure. This clip records source-code
verification only until current score provenance also passes the repository verifier.

### Composition

The edit manifest orders normalized 1080p30 clips and binds narration cues to source
time ranges. FFmpeg converts WebM clips to a common H.264/yuv420p timebase, performs
short cuts, mixes a loudness-normalized narration master, and exports the canonical
MP4. The accepted preview uses only cursor/click emphasis embedded in real captures;
it has no standalone opener, scene card, or transition clip.

The current macOS voice is a timing preview. When both `ELEVENLABS_API_KEY` and an
approved `ELEVENLABS_VOICE_ID` are available, all voice segments are regenerated,
durations are remeasured, the edit is rebuilt, and every QA gate runs again.

## Evidence manifest

Every run records:

- repository `HEAD` and dirty/clean status;
- capture UTC time and selected DreamDEX snapshot timestamp;
- source URLs and market IDs;
- browser action log and required visible assertions;
- terminal command, exit code, transcript hash, and transcript path;
- raw clip and final-file SHA-256 values;
- authentic-capture and title/transition durations;
- narration, SRT, codec, frame-rate, loudness, and true-peak measurements;
- public GitHub repository, immutable commit SHA, source URI, and on-chain verification
  result when those fields become available.

## Verification

The final verifier fails when any of these conditions holds:

- runtime, resolution, codec, frame rate, audio, loudness, or subtitle timing is outside
  the stated limits;
- authentic recorded coverage is below 85% or title/transition time exceeds 10 seconds;
- a required route, click/type/scroll action, command, decision, or visible response is
  missing;
- any final source clip is a PNG, screenshot, or output of the old presentation frame
  renderer;
- DreamDEX snapshot time or the different sources of the `3` and `95` examples are
  absent;
- terminal command exit status is nonzero or its transcript hash no longer matches;
- source verification is presented as provenance completion;
- provenance footage lacks a public immutable source URI or a successful full-field
  read-back;
- the automated blank-frame gate or independent motion/visual review fails;
- a contact sheet and independent visual/truth review are absent.

## Deliverables

- `demo-video/levelfield-demo-preview.mp4`: capture-led offline-voice preview during
  production, replacing the rejected storyboard render at the same canonical path.
- `demo-video/levelfield-demo-final.mp4`: ElevenLabs-voiced submission master once the
  approved credentials and recording-day pickup facts are available.
- `demo-video/levelfield-demo-final.en.srt`: final English captions.
- Reproducible capture scripts, edit manifest, evidence manifest, transcripts, contact
  sheet, and QA report under `demo-video/capture/`.
