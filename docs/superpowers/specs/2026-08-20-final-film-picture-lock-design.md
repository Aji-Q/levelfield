# LevelField final-film picture-lock design

## Authority and status

The owner delegated final-film lock to Codex and Claude on 2026-08-20. Codex proposed
the seven-part lock in `docs/collab/inbox-claude.md`; Claude accepted it point by point
in `docs/collab/inbox-codex.md` at 17:30 UTC and added the fact-review and secret-screen
gates captured below.

The checked-in MP4 with SHA-256 prefix `1948747d` is a truthful capture/source/timing
prototype. It is not the submission master. Commit `ef31acb` remains a storyboard
prototype only. The optional PowerPoint deck remains a separate judging artifact and
is never a picture source.

## Locked outcome

The final deliverable is a 2–3 minute English product demonstration. Every frame of
the evidence layer comes from real LevelField browser interaction, a real Assess flow,
the real Methodology pages, real MCP/CLI execution, or the public Somnia explorer.
Post-production may guide attention with restrained camera moves, focus outlines,
cursor emphasis, short lower-thirds, and necessary transitions. It never recreates a
product screen, manufactures a result, or replaces a visible system response.

The working duration target is 2:35–2:55, with 3:00 as a hard ceiling. The final
narration is trimmed before picture lock to fit this window at a natural professional
pace without relying on a paid voice regeneration or audible time stretching.

## Canonical truth state

These statements are frozen for the final film unless Claude supplies a replacement
pickup before picture lock:

1. DreamDEX footage is a visibly timestamped captured Shannon snapshot, never a live
   feed claim.
2. Score 3 is from that DreamDEX snapshot. Score 95 is from a separate curated
   reference case. They are never presented as the same venue or data source.
3. MCP is a pre-action policy evaluation. The demonstration submits no order.
4. The explorer currently proves that the ScoreRegistry source is verified.
5. Score provenance completion remains future tense while the public repository and
   immutable-SHA republish are unavailable. Legacy provenance is never described as
   complete.
6. LevelField measures structural information asymmetry. It does not allege
   misconduct, predict a winning side, or detect live insider activity.
7. Validation numbers come from `docs/validation.md` and `docs/agreement.md` at the
   narrated commit. Every spoken number must trace to those documents or to
   `docs/submission.md`.

Claude can produce a recording-day DreamDEX cache refresh on request. Codex requests
that refresh immediately before the timestamp-sensitive final pickup, not during
post-production development. Public-repository provenance has no committed delivery
time and therefore does not block picture lock. If it lands before lock, only the
affected pickup and future-tense caption are replaced; it never triggers a second paid
voice request.

## Mandatory corrections to the prototype

The frame-level review identified defects that must be cleared before the prototype
can become a picture master:

| Area | Required correction |
| --- | --- |
| Automation overlays | Remove persistent action labels from opening, market, Methodology, rejection, and closing shots. Prefer Claude's label-free `demo-footage/*.webm`; narrowly re-record only when neither substitution nor a truthful crop works. |
| Bad joins | Remove the contaminated/loading frames around 00:52.54 and the Explorer loading entry around 01:59.48. A transition may soften a valid dark/light cut but may not hide a failed page load. |
| 3-versus-95 proof | Show the real side-by-side product comparison while the narration describes the contrast; do not leave the viewer on a single 95 page. |
| Methodology-to-Score proof | Keep the real fixed weights and circuit-breaker evidence visible while that mechanism is narrated, then cut to the real Assess verification and hold the computed result long enough to read. |
| MCP proof | Reframe the real terminal output into command, policy, score-3 `PROCEED`, score-95 `DECLINE`, and combined-result beats. Preserve the on-screen `No order submitted` truth. |
| Chain proof | Start from a fully loaded Explorer frame, isolate the address, `ScoreRegistry`, and exact-match verification banner, and label current source verification separately from future provenance completion. |
| Validation proof | Reorder existing real terminal material to show validation first, then 69 software tests, 8 smart-contract tests, and the read-only SDK cross-check in the same order as narration. Do not include an empty terminal reset. |
| Ending | Replace the persistent closing automation label with a clean real hero hold and one restrained focus move. |
| Captions | Replace the 21 paragraph-sized cues. The final sidecar uses semantic cues of no more than two lines, 42 characters per line, 17 characters per second, and 7 seconds per cue. |

Readable UI holds are allowed. Near-static diagnostics are not a demand to animate
every second. Each hold longer than roughly 1.5 seconds must either have a clear reading
purpose or a single attention aid; unmotivated holds and repeated-frame drift are
removed. No uniform crossfade is applied to every cut.

## Picture architecture

### 1. Verified source layer

The source layer remains the committed real browser, terminal, and explorer recordings
plus their action/fact/hash manifests. Label-free `demo-footage/*.webm` clips are the
first substitution choice. The deterministic recorders remain available for narrowly
scoped pickups. Any new recording must reproduce a visible action and assertion and
must not expose environment values, API keys, wallet material, browser history, or
personal notifications.

### 2. Native-cadence clean edit

The current raw recordings are 25 fps. The clean base edit therefore uses native
25 fps rather than generating a nominal 30 fps stream with repeated frames. Source
in/out points and output durations are frame-aligned integers. The recut fixes proof
order, semantic A/V timing, and contaminated boundaries before any decorative layer is
applied.

The base edit stays at 1920x1080 and retains its source/action/fact SHA chain. A clip
may be reused at a different truthful time range when the narration returns to an
earlier product state, but the evidence manifest records every use.

### 3. Independent light-post layer

An independent Remotion package reads only the clean, muted base picture. It does not
decode and re-edit the twelve raw capture sources. A frame-number manifest drives:

- 8–12 focus camera moves, normally 1.05–1.18 scale and never more than 1.25;
- 5–7 editorial callouts tied to real facts or clearly marked future states;
- focus outlines and short click/cursor emphasis;
- short chapter lower-thirds over visible real footage;
- only the transitions required for hard luminance changes.

No standalone title card, slide, screenshot, recreated UI, continuous floating camera,
or decorative Web3 motion is allowed. Real product pixels remain visible throughout.
All animation is frame-driven; CSS animation and wall-clock timing are prohibited.

Remotion is pinned to one exact version. Its license must cover the owner's team under
the published individual/small-team/non-profit terms. If that license gate or the
10-second/60-second smoke renders fail, the same post manifest falls back to FFmpeg
camera/crop/PNG-overlay primitives without changing the clean base edit.

### 4. Picture and sound separation

Post-production renders a muted picture master. Audio is muxed afterward. This keeps
the accepted visual timing independent from the TTS transport and allows the same
picture QA to run before any paid call.

## Narration and caption design

`demo-video/script.md` remains the canonical copy source. Before picture lock it is
trimmed without changing the canonical facts, then checked line by line against
`docs/submission.md`, `docs/validation.md`, and `docs/agreement.md`. Claude performs the
independent fact review and returns a verdict through the mailbox.

Offline scratch narration drives all timing iterations. Caption generation splits
sentences at semantic phrase boundaries and measures rendered lines; narration segment
boundaries are not subtitle boundaries. During offline production, timing is derived
from the scratch audio. During the one paid final generation, ElevenLabs character
alignment replaces those provisional timings without changing caption text or picture
order.

The deliberately fabricated input in the quote-rejection shot carries an editorial
label so viewers cannot mistake it for product copy.

## One-pass ElevenLabs gate

No ElevenLabs network call occurs until all of these conditions are true:

1. clean edit and post-picture hashes are locked;
2. narration copy and facts are locked;
3. offline captions pass duration, line, reading-speed, and occlusion checks;
4. codec, color, blank/loading-frame, action, fact, privacy, and visual gates pass;
5. Claude has returned the line-by-line fact-review verdict;
6. the owner has supplied an explicit approved `ELEVENLABS_VOICE_ID`.

The final request uses the `with-timestamps` endpoint once for the complete narration.
Before the paid gate can open, the client verifies that the locked character count is
within the selected model's current documented input limit; otherwise it stops without
network access rather than splitting the script into multiple paid calls. Its lock record contains picture hash,
script hash, voice ID, model, stability, similarity, style, speed, speaker-boost,
pronunciation aliases, output format, and approval timestamp. The client has no
implicit voice fallback, no automatic paid POST retry, no `--force` regeneration, and
no partial-success continuation. It writes to a temporary path, verifies response and
audio integrity, then atomically places a content-addressed cached result.

Ambiguous transport failure stops the pipeline. Recovery first inspects ElevenLabs
history for the request; a second paid generation requires a new owner approval.
Credentials and request headers never enter logs, screen captures, manifests, commits,
or shell history.

## Master specifications

- Container: MP4 with Fast Start.
- Video: H.264 High, 1920x1080, native constant 25 fps, progressive, SAR 1:1,
  yuv420p, explicit BT.709 primaries/transfer/matrix.
- Delivery bitrate: 12–20 Mbps. An archived high-quality mezzanine is retained for
  later platform encodes.
- Audio: AAC-LC, 48 kHz stereo; narration target is approximately -18 LUFS with
  true peak at or below -2 dBTP before platform transcode.
- Runtime: 120–180 seconds; target 155–175 seconds.
- Captions: English SRT, complete and monotonic, at most two lines, at most 42 CPL,
  at most 17 CPS, at most 7 seconds per cue, with no sustained key-UI occlusion.

## Evidence and release gates

The final evidence chain records raw-source hashes, clean-edit hash, post manifest and
picture hash, narration lock and audio hash, final MP4/SRT hashes, action/fact mappings,
and the repository commit used for narrated claims.

Release requires all of the following:

- zero decode, mux, timestamp, blank-frame, or visible loading-state defects;
- every required action and response visible inside the actual trimmed source window;
- correct native cadence, color metadata, resolution, bitrate, audio, and duration;
- caption text, timing, line layout, reading speed, and UI-safe placement approved;
- no secret, environment value, wallet context, personal data, or fabricated product
  evidence visible;
- a full-resolution checkpoint review for every key CTA, score, decision, test number,
  and provenance state; VMAF and OCR may be recorded as not applicable when no valid
  reference/tool exists, but are never awarded invented scores;
- complete one-times-speed expert review, first-time silent review, audio-only review,
  720p legibility review, and post-upload platform-transcode review;
- project tests, scoring typecheck, clean web build, evidence-quote verification,
  capture tests, media verification, fact verification, and independent final QA;
- one final SHA explicitly accepted as the submission master.

## Deliverables

- `demo-video/levelfield-demo-preview.mp4`: retained capture/source/timing prototype.
- `demo-video/levelfield-demo-picture-lock.mp4`: offline-voice, fully corrected picture
  master used for pre-TTS review.
- `demo-video/levelfield-demo-final.mp4`: one-pass approved-voice submission master.
- `demo-video/levelfield-demo-final.en.srt`: final aligned English captions.
- Reproducible clean-edit, post, caption, TTS-lock, evidence, and QA artifacts.

The final master is not published or packaged until the owner-approved voice and every
release gate above pass. If the paid voice gate remains closed, the picture-lock master
is preserved as a reviewed fallback but is not silently renamed as the paid-voice
final.
