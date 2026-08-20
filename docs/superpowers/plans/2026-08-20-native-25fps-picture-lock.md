# LevelField Native-25fps Picture Lock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a truthful 159.56-second, native-25fps LevelField picture lock from verified real captures, with restrained frame-driven post-production, offline scratch narration, and a hash-bound visual/privacy/fact evidence chain—without calling ElevenLabs.

**Architecture:** Preserve the existing 30fps capture-led MP4 as a prototype and create a parallel frame-native pipeline. Nine exact, label-free browser pickups replace every runner-overlay, semantically wrong Methodology shot, loading Explorer shot, and unstable comparison hold; a clean editor then trims only verified 25fps browser, terminal, and explorer sources into a muted 3989-frame base. An independent Remotion light-post package and an FFmpeg fallback share one half-open frame manifest, while picture-lock verification binds decoded/packet hashes, exact action windows, a final fact registry, 21-beat scratch timing, checkpoints, privacy evidence, candidate selection, two full-film human reviews, and manual 720p/occlusion review before any paid voice work can begin.

**Tech Stack:** Node.js 24 ESM, `node:test`, FFmpeg/ffprobe 8.0.1, Playwright 1.62.1, Remotion 4.0.514 exact, React/ReactDOM 19.2.8 exact, H.264/BT.709/AAC, JSON evidence manifests.

---

## Primary implementation references

- Remotion’s official Agent Skills: <https://github.com/remotion-dev/remotion/blob/main/packages/skills/README.md>
- Remotion 4.0.514 release: <https://github.com/remotion-dev/remotion/releases/tag/v4.0.514>
- Remotion 4.0.514 license at tag commit `e9e612b2033803efb14b78c47ef7d5a482321e01`: <https://github.com/remotion-dev/remotion/blob/e9e612b2033803efb14b78c47ef7d5a482321e01/LICENSE.md>
- Playwright video capture: <https://playwright.dev/docs/videos>
- Playwright’s open configurable-fps request, documenting the fixed capture cadence constraint: <https://github.com/microsoft/playwright/issues/17217>
- YouTube’s official upload encoding guidance: <https://support.google.com/youtube/answer/1722171?hl=en>

## Locked boundaries

Codex does not modify or overwrite these prototype/storyboard artifacts. The sole exception is the mandatory Task 2 refresh input: Claude's own attributed refresh commit may update `demo-video/capture/evidence-manifest.json` and the score-cache evidence it hashes; Codex only verifies and consumes that committed input and never stages those paths itself.

- `demo-video/levelfield-demo-preview.mp4`
- `demo-video/capture/edit-manifest.json`
- `demo-video/capture/scripts/compose.mjs`
- `demo-video/capture/evidence-manifest.json`
- `demo-video/presentation/**`
- `demo-deck/**`

Use this exact existing run for the first lock:

```text
demo-video/capture/runs/2026-08-20T1530Z-preview
```

The muted post picture is 3989 frames at 25fps: 159.56 seconds. Every `sourceEndFrame` and `outputEndFrame` below is exclusive. Do not add implicit retiming, duplicated cadence, presentation frames, or standalone title cards.

Nine sources are mandatory frame-native clean pickups, not optional fallbacks. All are recorded from the real production build/public explorer with the capture action banner disabled; the closing pickup replaces the known labeled runner ending. They are normalized once to 1920×1080/25fps and accepted only at these exact decoded lengths:

| canonical pickup | decoded frames | visible contract |
|---|---:|---|
| `demo-footage/picture-lock/market-three-clean.webm` | 389 | one internally consistent visible snapshot timestamp, score 3, public-outcome explanation, and visible `LEGACY PROVENANCE` / `awaiting republish` block |
| `demo-footage/picture-lock/comparison-clean.webm` | 218 | stable real 3-versus-95 comparison visible throughout; no landing-page carousel/evidence detour |
| `demo-footage/picture-lock/methodology-anchors-clean.webm` | 202 | five-dimension framing followed by the D1 public-anchor table |
| `demo-footage/picture-lock/methodology-default-clean.webm` | 100 | real `Conservative default` heading and level 4 copy |
| `demo-footage/picture-lock/methodology-scoring-clean.webm` | 100 | real fixed scoring, score bands, and circuit breakers |
| `demo-footage/picture-lock/methodology-scope-clean.webm` | 103 | real `What this is not` list with all three scope limits |
| `demo-footage/picture-lock/instruction-rejection-clean.webm` | 132 | real instruction-overlap rejection with `Not scored`; never the `detected:false` fabricated-quote-not-found handoff |
| `demo-footage/picture-lock/explorer-source-clean.webm` | 262 | fully loaded public Explorer with address, `ScoreRegistry`, and exact-match source verification visible from frame 0 through 261 |
| `demo-footage/picture-lock/closing-clean.webm` | 263 | clean real product hero-to-proof closing movement with no runner label |

The recorder may retain longer raw WebM files privately, but the nine paths above are the canonical trimmed sources consumed by the edit. A pickup that misses its exact visual contract, exposes an automation label, contains a loading frame, or has a decoded length other than the table value is rejected and recorded again; the editor never substitutes a still, freezes a frame, or guesses a new trim. The previous Explorer f180–442 is excluded because direct frame inspection shows `Loading data` through the selected tail, `demo-footage/quote-rejection.webm` is excluded because its visible response is `instruction_like_content_detected:false` plus quote-not-found rather than the narrated instruction-overlap rejection, and `landing.webm` f72–237 is not registered as a continuous comparison action because the landing carousel leaves the comparison state inside that interval.

No ignored `runs/**` media or log is an unverifiable prerequisite. Task 2 records nine browser pickups and re-records both terminal stages only after Playwright 1.62.1/Chromium revision 1234 is installed and verified; it never copies the older terminal WebMs or backfills their unknown browser provenance. All eleven new canonical sources plus eleven de-identified `*.actions.json` logs live under tracked `demo-footage/picture-lock/`, while the already tracked label-free `demo-footage/landing.webm`, `market-detail.webm`, and `assess-flow.webm` remain direct sources. `demo-footage/picture-lock/source-pack.json` stores the repository-relative path, exact SHA-256, decoded-frame count, tracked provenance-file path/SHA (the matching action log for each new capture; `demo-footage/MANIFEST.md` for Claude's three clips), capture origin, and reviewed commit for every selected source. Private raw logs may retain a local capture path but are never referenced or published; the tracked action log contains only repository-relative identifiers, readiness/action intervals, public fixture IDs, the private raw-log SHA-256, and no secret or personal path. A clean clone must reproduce every media and provenance hash before composition.

### File map

Create or modify only the following groups during this plan:

```text
docs/collab/inbox-claude.md (append-only coordination entries only)
demo-video/script.md
demo-video/README.md
demo-video/.gitignore
demo-video/picture-lock-evidence.json
demo-video/capture/package.json
demo-video/capture/package-lock.json
demo-video/capture/.gitignore
demo-video/capture/README.md
demo-video/capture/picture-pickup-manifest.json
demo-video/capture/final-actions.json
demo-video/capture/final-facts.json
demo-video/capture/clean-edit-manifest.json
demo-video/capture/post-manifest.json
demo-video/capture/final-checkpoints.json
demo-video/capture/review-protocol.json
demo-video/capture/scripts/picture-pickups.mjs
demo-video/capture/scripts/capture-terminal.mjs
demo-video/capture/scripts/clean-edit.mjs
demo-video/capture/scripts/compose-clean.mjs
demo-video/capture/scripts/scratch-narration.mjs
demo-video/capture/scripts/post-picture.mjs
demo-video/capture/scripts/post-ffmpeg.mjs
demo-video/capture/scripts/review-picture.mjs
demo-video/capture/scripts/verify-picture-lock.mjs
demo-video/capture/scripts/fact-review-packet.mjs
demo-video/capture/scripts/evidence-artifacts.mjs
demo-video/capture/scripts/lib/media-contract.mjs
demo-video/capture/scripts/lib/pickup-contract.mjs
demo-video/capture/scripts/lib/mailbox-evidence.mjs
demo-video/capture/scripts/lib/immutable-artifact.mjs
demo-video/capture/scripts/lib/evidence-chain.mjs
demo-video/capture/scripts/lib/checkpoint-gates.mjs
demo-video/capture/scripts/lib/privacy-gates.mjs
demo-video/capture/test/clean-edit.test.mjs
demo-video/capture/test/compose-clean.integration.test.mjs
demo-video/capture/test/media-contract.test.mjs
demo-video/capture/test/picture-pickups.test.mjs
demo-video/capture/test/post-manifest.test.mjs
demo-video/capture/test/post-picture.test.mjs
demo-video/capture/test/evidence-chain.test.mjs
demo-video/capture/test/checkpoint-gates.test.mjs
demo-video/capture/test/privacy-gates.test.mjs
demo-video/capture/test/picture-lock.test.mjs
demo-video/capture/test/fixtures/native-picture-lock.json
demo-video/capture/test/fixtures/native-picture-lock-candidate.json
demo-video/capture/test/fixtures/build-native-contract-fixtures.mjs
demo-video/capture/test/fixtures/native-fact-review-request.json
demo-video/capture/test/narration-lock.test.mjs
demo-video/capture/test/fact-review-packet.test.mjs
demo-video/capture/test/evidence-artifacts.test.mjs
demo-video/capture/test/mailbox-evidence.test.mjs
demo-video/capture/test/immutable-artifact.test.mjs
demo-video/post/package.json
demo-video/post/package-lock.json
demo-video/post/.gitignore
demo-video/post/tsconfig.json
demo-video/post/src/index.ts
demo-video/post/src/Root.tsx
demo-video/post/src/LevelFieldLightPost.tsx
demo-video/post/src/manifest.ts
demo-video/post/src/components/Camera.tsx
demo-video/post/src/components/Callout.tsx
demo-video/post/src/components/TransitionVeil.tsx
demo-video/post/scripts/license-gate.mjs
demo-video/post/scripts/remotion-license-owner-input.schema.json
demo-video/post/scripts/render.mjs
demo-video/post/test/manifest.test.mjs
demo-video/post/test/architecture.test.mjs
demo-video/post/test/license-gate.test.mjs
demo-footage/picture-lock/market-three-clean.webm
demo-footage/picture-lock/comparison-clean.webm
demo-footage/picture-lock/methodology-anchors-clean.webm
demo-footage/picture-lock/methodology-default-clean.webm
demo-footage/picture-lock/methodology-scoring-clean.webm
demo-footage/picture-lock/methodology-scope-clean.webm
demo-footage/picture-lock/instruction-rejection-clean.webm
demo-footage/picture-lock/explorer-source-clean.webm
demo-footage/picture-lock/closing-clean.webm
demo-footage/picture-lock/mcp-policy.webm
demo-footage/picture-lock/evidence-cli.webm
demo-footage/picture-lock/market-three-clean.actions.json
demo-footage/picture-lock/comparison-clean.actions.json
demo-footage/picture-lock/methodology-anchors-clean.actions.json
demo-footage/picture-lock/methodology-default-clean.actions.json
demo-footage/picture-lock/methodology-scoring-clean.actions.json
demo-footage/picture-lock/methodology-scope-clean.actions.json
demo-footage/picture-lock/instruction-rejection-clean.actions.json
demo-footage/picture-lock/explorer-source-clean.actions.json
demo-footage/picture-lock/closing-clean.actions.json
demo-footage/picture-lock/mcp-policy.actions.json
demo-footage/picture-lock/evidence-cli.actions.json
demo-footage/picture-lock/window-evidence/*.png
demo-footage/picture-lock/source-pack.json
```

Generated run artifacts stay under `demo-video/capture/runs/2026-08-20T1530Z-preview/picture-lock-work/` and remain gitignored. Task 9 treats the local `demo-video/levelfield-demo-picture-lock.mp4` and its hash-named JSON strictly as a review candidate; only Task 10's authenticated Claude PASS plus no-clobber accept mode establishes the picture lock. The MP4 is never named `final`. At the locked 12–20Mbps delivery bitrate it exceeds GitHub’s ordinary per-file limit, so it is never added to git. Only after acceptance does Git track the byte-identical accepted contract at `demo-video/picture-lock-evidence.json`; before that path must be absent.

## Global collaboration and commit gate (G0)

This implementation touches more than two files, so its first repository action is a newest-first `CLAIMING` entry in `docs/collab/inbox-claude.md` naming the full file-map scope, start time, and two-hour expiry. Commit that mailbox-only claim under Codex attribution before editing implementation files. If work reaches the expiry, stop editing, add and commit a newest-first renewal with a new UTC timestamp, and resume only after the renewal is visible; the claim never silently rolls forward. The final Task 10 handoff changes the live claim to `DONE`.

Immediately before **every** commit in this plan, from repository root, execute all four AGENTS gates and then re-read Codex's inbox. A commit touching capture code/data also runs the relevant capture tests named in that task. Every gate exports the one fixed ignored repository browser root before invoking capture/post code; a test or renderer that consults a default Playwright cache or downloads implicitly fails. A post-package gate is availability-aware so a missing/owner-declined/license-failed Remotion path cannot block the mandatory FFmpeg route: dependency-free architecture/license/manifest tests and the typed fallback verifier always run once those files exist; post typecheck and smoke run only when the bound decision is available and the exact locked `node_modules` is installed. No tracked byte may change between this gate and the commit except staging the already tested explicit path set:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
npm test
npx tsc --noEmit -p packages/scoring/tsconfig.json
rm -rf apps/web/.next && npm run build -w @levelfield/web
npx tsx scripts/verify-classifications.ts
# When the commit touches demo-video/capture/**, also run the task's exact capture test command.
# When the commit touches demo-video/post/** and package.json now exists, execute:
POST_RUNTIME_STATUS=demo-video/capture/runs/2026-08-20T1530Z-preview/picture-lock-work/remotion-runtime-status.json
if test -f demo-video/post/package.json; then
  (cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/post && node --test test/architecture.test.mjs test/license-gate.test.mjs test/manifest.test.mjs)
  test -f "$POST_RUNTIME_STATUS"
  RUNTIME_AVAILABLE="$(node demo-video/post/scripts/license-gate.mjs \
    --runtime-status "$POST_RUNTIME_STATUS" --print-runtime-available)"
  case "$RUNTIME_AVAILABLE" in
    true)
      test -d demo-video/post/node_modules
      node demo-video/post/scripts/license-gate.mjs \
        --runtime-status "$POST_RUNTIME_STATUS" --require-qualified-runtime
      (cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/post && npm test && npm run typecheck && node scripts/render.mjs --smoke \
        --runtime-status ../capture/runs/2026-08-20T1530Z-preview/picture-lock-work/remotion-runtime-status.json \
        --source ../capture/runs/2026-08-20T1530Z-preview/picture-lock-work/clean-picture.mp4 \
        --manifest ../capture/post-manifest.json)
      ;;
    false)
      node demo-video/post/scripts/license-gate.mjs \
        --runtime-status "$POST_RUNTIME_STATUS" --require-typed-unavailable
      ;;
    *) exit 1 ;;
  esac
fi
cat docs/collab/inbox-codex.md
```

Any failure, `NEEDS_REPLY`/conflicting claim, unread inbox, expired claim, or unexpected staged path blocks the commit. References to “run G0” below mean executing this entire block in the same commit attempt, not relying on an earlier task's result.

### Task 0: Claim the implementation scope

- [ ] **Step 1: Publish and commit the initial mailbox claim**

Prepend an AGENTS-format entry with header `## <current ISO-8601 UTC ending Z> · from Codex`, a body that names this plan's exact file-map scope and an expiry exactly two hours later, and final line `STATUS: CLAIMING`. Run G0, stage only `docs/collab/inbox-claude.md`, prove the staged set is exactly that path, commit it with Codex attribution, and require a clean working tree before Task 1. Renewal commits use the same G0 and one-path rule.

## Task 1: Define the native media contract

**Files:**
- Create: `demo-video/capture/scripts/lib/media-contract.mjs`
- Create: `demo-video/capture/test/media-contract.test.mjs`

- [ ] **Step 1: Write the failing pure-function tests**

Create `test/media-contract.test.mjs` with fixtures that require the clean source and delivery contracts:

```js
import assert from "node:assert/strict";
import test from "node:test";

import {
  DELIVERY_CONTRACT,
  framesToSeconds,
  parseFrameRate,
  validateCleanPictureProbe,
  validateDeliveryPictureProbe,
} from "../scripts/lib/media-contract.mjs";

const compliantVideo = {
  codec_type: "video",
  codec_name: "h264",
  profile: "High",
  width: 1920,
  height: 1080,
  pix_fmt: "yuv420p",
  field_order: "progressive",
  sample_aspect_ratio: "1:1",
  display_aspect_ratio: "16:9",
  r_frame_rate: "25/1",
  avg_frame_rate: "25/1",
  nb_read_frames: "3989",
  color_space: "bt709",
  color_transfer: "bt709",
  color_primaries: "bt709",
  color_range: "tv",
  level: 42,
  disposition: { attached_pic: 0 },
  side_data_list: [],
  bit_rate: "16000000",
};

const compliantCadence = Array.from({ length: 3989 }, (_, index) => ({
  best_effort_timestamp_time: (index * 0.04).toFixed(6),
  duration_time: "0.040000",
}));
const compliantPackets = Array.from({ length: 3989 }, (_, index) => ({
  dts_time: ((index - 2) * 0.04).toFixed(6),
  duration_time: "0.040000",
  size: "4096",
}));

test("locks 3989 native frames to 159.56 seconds", () => {
  assert.equal(framesToSeconds(3989), 159.56);
  assert.equal(parseFrameRate("25/1"), 25);
  assert.equal(DELIVERY_CONTRACT.fps, 25);
});

test("accepts a compliant muted delivery picture and decoded cadence", () => {
  const probe = { streams: [compliantVideo], format: { duration: "159.560000" } };
  assert.doesNotThrow(() => validateDeliveryPictureProbe(probe, compliantCadence, compliantPackets, 3989));
});

test("rejects missing/non-finite bitrate, cadence, color, geometry, extra streams, and side-data drift", () => {
  for (const change of [
    { codec_name: undefined }, { profile: undefined }, { level: undefined },
    { avg_frame_rate: "30/1" },
    { r_frame_rate: "30000/1001" },
    { color_space: "bt470bg" },
    { color_transfer: "unknown" },
    { color_primaries: undefined }, { color_range: "unknown" }, { pix_fmt: undefined },
    { display_aspect_ratio: "4:3" }, { side_data_list: [{ side_data_type: "Display Matrix", rotation: 90 }] },
    { bit_rate: undefined }, { bit_rate: null }, { bit_rate: "NaN" }, { bit_rate: "Infinity" },
    { bit_rate: "11999999" },
    { bit_rate: "20000001" },
    { width: 1280 },
    { field_order: "tt" },
    { sample_aspect_ratio: "4:3" },
    { disposition: undefined },
    { nb_read_frames: "3988" },
  ]) {
    const probe = { streams: [{ ...compliantVideo, ...change }], format: { duration: "159.56" } };
    assert.throws(() => validateDeliveryPictureProbe(probe, compliantCadence, compliantPackets, 3989));
  }
  assert.throws(() => validateDeliveryPictureProbe({
    streams: [compliantVideo, { codec_type: "audio", codec_name: "aac" }],
    format: { duration: "159.56" },
  }, compliantCadence, compliantPackets, 3989), /exactly one video/i);
  for (const codecType of ["subtitle", "data", "attachment"]) {
    assert.throws(() => validateDeliveryPictureProbe({
      streams: [compliantVideo, { codec_type: codecType }], format: { duration: "159.56" },
    }, compliantCadence, compliantPackets, 3989), /exactly one video/i);
  }
  assert.throws(() => validateDeliveryPictureProbe(
    { streams: [compliantVideo], format: { duration: "159.56" } },
    compliantCadence.map((frame, index) => index === 800 ? { ...frame, best_effort_timestamp_time: "32.080000" } : frame),
    compliantPackets,
    3989,
  ), /cadence/i);
  assert.throws(() => validateDeliveryPictureProbe(
    { streams: [compliantVideo], format: { duration: "159.56" } }, [], compliantPackets, 3989,
  ), /zero decoded frames/i);
  assert.throws(() => validateDeliveryPictureProbe(
    { streams: [compliantVideo], format: { duration: "159.56" } }, compliantCadence, [], 3989,
  ), /zero video packets/i);
});

test("allows high-bitrate clean intermediates but never changes cadence", () => {
  const source = { ...compliantVideo, bit_rate: "42000000" };
  assert.doesNotThrow(() => validateCleanPictureProbe({ streams: [source], format: { duration: "159.56" } }, compliantCadence, compliantPackets, 3989));
  assert.throws(() => validateCleanPictureProbe({
    streams: [{ ...source, avg_frame_rate: "30/1" }],
    format: { duration: "159.56" },
  }, compliantCadence, compliantPackets, 3989), /25/);
});

test("validates DTS on packets, not decoded-frame metadata that may be absent for trailing B-frames", () => {
  const framesWithoutPacketDts = compliantCadence.map((frame) => ({ ...frame }));
  assert.doesNotThrow(() => validateDeliveryPictureProbe(
    { streams: [compliantVideo], format: { duration: "159.56" } }, framesWithoutPacketDts, compliantPackets, 3989,
  ));
  const badPackets = compliantPackets.map((packet, index) => index === 100 ? { ...packet, dts_time: "3.000000" } : packet);
  assert.throws(() => validateDeliveryPictureProbe(
    { streams: [compliantVideo], format: { duration: "159.56" } }, compliantCadence, badPackets, 3989,
  ), /DTS/i);
  assert.throws(() => validateDeliveryPictureProbe(
    { streams: [compliantVideo], format: { duration: "159.56" } },
    compliantCadence.map((frame, index) => index === 7 ? { ...frame, duration_time: "0.080000" } : frame),
    compliantPackets,
    3989,
  ), /duration/i);
  const shiftedStart = compliantCadence.map((frame, index) => ({ ...frame, best_effort_timestamp_time: ((index + 1) / 25).toFixed(6) }));
  assert.throws(() => validateDeliveryPictureProbe(
    { streams: [compliantVideo], format: { duration: "159.56" } }, shiftedStart, compliantPackets, 3989,
  ), /start/i);
  const lateTail = compliantCadence.map((frame, index) => index === 3988 ? { ...frame, duration_time: "0.080000" } : frame);
  assert.throws(() => validateDeliveryPictureProbe(
    { streams: [compliantVideo], format: { duration: "159.56" } }, lateTail, compliantPackets, 3989,
  ), /tail/i);
});
```

- [ ] **Step 2: Run the new test and confirm RED**

Run:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node --test test/media-contract.test.mjs
```

Expected: fail with `ERR_MODULE_NOT_FOUND` for `scripts/lib/media-contract.mjs`.

- [ ] **Step 3: Implement the minimal contract**

Create `scripts/lib/media-contract.mjs` with these public values and validators:

```js
export const DELIVERY_CONTRACT = Object.freeze({
  fps: 25,
  width: 1920,
  height: 1080,
  frames: 3989,
  duration: 159.56,
  pixelFormat: "yuv420p",
  color: "bt709",
  minimumVideoBitrate: 12_000_000,
  maximumVideoBitrate: 20_000_000,
});

export function framesToSeconds(frames, fps = DELIVERY_CONTRACT.fps) {
  if (!Number.isInteger(frames) || frames < 0 || !Number.isInteger(fps) || fps <= 0) {
    throw new Error("frames and fps must be non-negative/positive integers");
  }
  return frames / fps;
}

export function parseFrameRate(value) {
  const [numerator, denominator = "1"] = String(value).split("/").map(Number);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    throw new Error(`Invalid frame rate ${value}`);
  }
  return numerator / denominator;
}

function onlyVideo(probe) {
  const streams = probe?.streams ?? [];
  if (streams.length !== 1 || streams[0]?.codec_type !== "video") {
    throw new Error("Muted picture must contain exactly one video stream and no audio, subtitle, data, or attachment stream");
  }
  return streams[0];
}

function finiteNumber(value, label) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) throw new Error(`${label} must be finite`);
  return number;
}

function gcd(a, b) {
  for (a = a < 0n ? -a : a; b !== 0n; ) [a, b] = [b, a % b];
  return a;
}

function decimalRational(value, label) {
  const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(String(value));
  if (!match) throw new Error(`${label} must be a finite decimal`);
  const fraction = match[3] ?? "";
  let numerator = BigInt(`${match[2]}${fraction}`);
  if (match[1]) numerator = -numerator;
  let denominator = 10n ** BigInt(fraction.length);
  const divisor = gcd(numerator, denominator);
  return { numerator: numerator / divisor, denominator: denominator / divisor };
}

const ratio = (numerator, denominator = 1n) => ({ numerator: BigInt(numerator), denominator: BigInt(denominator) });
const ratioEqual = (a, b) => a.numerator * b.denominator === b.numerator * a.denominator;
const ratioCompare = (a, b) => a.numerator * b.denominator - b.numerator * a.denominator;
const ratioAdd = (a, b) => ratio(a.numerator * b.denominator + b.numerator * a.denominator, a.denominator * b.denominator);

function validateCadence(frames, packets, expectedFrames) {
  if (!Array.isArray(frames) || frames.length === 0) throw new Error("Cadence probe returned zero decoded frames");
  if (frames.length !== expectedFrames) throw new Error(`Cadence probe decoded ${frames.length}, expected ${expectedFrames}`);
  if (!Array.isArray(packets) || packets.length === 0) throw new Error("Cadence probe returned zero video packets");
  if (packets.length !== expectedFrames) throw new Error(`Cadence probe read ${packets.length} packets, expected ${expectedFrames}`);
  const first = decimalRational(frames[0].best_effort_timestamp_time, "first frame timestamp");
  if (!ratioEqual(first, ratio(0n))) throw new Error("Decoded cadence must start at PTS 0");
  const lastTimestamp = decimalRational(frames.at(-1).best_effort_timestamp_time, "last frame timestamp");
  const lastDuration = decimalRational(frames.at(-1).duration_time, "last frame duration");
  if (!ratioEqual(ratioAdd(lastTimestamp, lastDuration), ratio(BigInt(expectedFrames), 25n))) {
    throw new Error(`Decoded cadence tail must end exactly at ${expectedFrames}/25 seconds`);
  }
  for (const [index, frame] of frames.entries()) {
    const bestEffort = decimalRational(frame.best_effort_timestamp_time, `frame ${index} best-effort timestamp`);
    const duration = decimalRational(frame.duration_time, `frame ${index} duration`);
    if (!ratioEqual(bestEffort, ratio(BigInt(index), 25n))) throw new Error(`Decoded cadence drift at frame ${index}`);
    if (!ratioEqual(duration, ratio(1n, 25n))) throw new Error(`Decoded frame duration drift at frame ${index}`);
  }
  let previousDts;
  for (const [index, packet] of packets.entries()) {
    const dts = decimalRational(packet.dts_time, `packet ${index} DTS`);
    const duration = decimalRational(packet.duration_time, `packet ${index} duration`);
    const size = finiteNumber(packet.size, `packet ${index} size`);
    if (previousDts && ratioCompare(dts, previousDts) <= 0n) throw new Error(`Packet DTS is not strictly increasing at packet ${index}`);
    if (!ratioEqual(duration, ratio(1n, 25n))) throw new Error(`Packet duration drift at packet ${index}`);
    if (size <= 0) throw new Error(`Empty video packet at packet ${index}`);
    previousDts = dts;
  }
}

export function validateCleanPictureProbe(probe, decodedFrames, packets, expectedFrames) {
  const video = onlyVideo(probe);
  validateCadence(decodedFrames, packets, expectedFrames);
  const formatDuration = decimalRational(probe?.format?.duration, "format duration");
  const checks = [
    [video.codec_name === "h264" && video.profile === "High", "H.264 High"],
    [Number(video.level) === 42, "H.264 level 4.2"],
    [video.width === 1920 && video.height === 1080, "1920x1080"],
    [video.pix_fmt === "yuv420p", "yuv420p"],
    [video.field_order === "progressive", "progressive"],
    [video.sample_aspect_ratio === "1:1", "SAR 1:1"],
    [video.display_aspect_ratio === "16:9", "DAR 16:9"],
    [parseFrameRate(video.r_frame_rate) === 25 && parseFrameRate(video.avg_frame_rate) === 25, "native 25 fps"],
    [Number(video.nb_read_frames) === expectedFrames, `${expectedFrames} decoded frames`],
    [video.color_space === "bt709" && video.color_transfer === "bt709" && video.color_primaries === "bt709" && video.color_range === "tv", "BT.709 limited range"],
    [video.disposition?.attached_pic === 0, "no attached picture"],
    [!video.side_data_list || video.side_data_list.length === 0, "no video side-data anomaly"],
    [ratioEqual(formatDuration, ratio(BigInt(expectedFrames), 25n)), "exact frame-aligned duration"],
  ];
  for (const [passed, label] of checks) if (!passed) throw new Error(`Picture contract failed: ${label}`);
  return { video, duration: Number(probe.format.duration), frames: expectedFrames };
}

export function validateDeliveryPictureProbe(probe, decodedFrames, packets, expectedFrames) {
  const result = validateCleanPictureProbe(probe, decodedFrames, packets, expectedFrames);
  const bitrate = finiteNumber(result.video.bit_rate, "Delivery bitrate");
  if (bitrate < DELIVERY_CONTRACT.minimumVideoBitrate || bitrate > DELIVERY_CONTRACT.maximumVideoBitrate) {
    throw new Error(`Delivery bitrate ${bitrate} is outside 12–20 Mbps`);
  }
  return { ...result, bitrate };
}
```

Every caller obtains `probe` with `ffprobe -count_frames`, `decodedFrames` with `ffprobe -select_streams v:0 -show_frames -show_entries frame=best_effort_timestamp_time,duration_time`, and `packets` with `ffprobe -select_streams v:0 -show_packets -show_entries packet=dts_time,duration_time,size`. FFmpeg 8.0.1 does not reliably emit `pkt_duration_time` on frame records, and trailing decoded B-frames may have no frame-level packet DTS, so those fields are never required on `-show_frames` output. Packet PTS is deliberately not inspected because H.264 B-frames reorder presentation. Decimal timestamps are parsed as exact reduced BigInt rationals: decoded PTS must start at 0, frame `i` must equal `i/25`, every frame/packet duration must equal `1/25`, and the last decoded PTS plus duration must equal `3989/25 = 159.56` exactly; packet DTS must be finite and strictly increasing.

- [ ] **Step 4: Run focused and package tests**

Run:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node --test test/media-contract.test.mjs
npm test
```

Expected: the new test passes; the existing capture suite remains green.

- [ ] **Step 5: Commit Task 1**

Run G0, then rerun `node --test demo-video/capture/test/media-contract.test.mjs` as the relevant capture test. Only after both return zero:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add demo-video/capture/scripts/lib/media-contract.mjs demo-video/capture/test/media-contract.test.mjs
git commit -m "test(video): lock native 25fps media contract" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
```

## Task 2: Lock the tracked source pack, real action windows, final facts, and exact edit

**Files:**
- Create: `demo-video/capture/picture-pickup-manifest.json`
- Create: `demo-video/capture/final-actions.json`
- Create: `demo-video/capture/final-facts.json`
- Create: `demo-video/capture/clean-edit-manifest.json`
- Create: `demo-video/capture/scripts/picture-pickups.mjs`
- Modify: `demo-video/capture/scripts/capture-terminal.mjs`
- Create: `demo-video/capture/scripts/lib/pickup-contract.mjs`
- Create: `demo-video/capture/scripts/clean-edit.mjs`
- Create: `demo-video/capture/test/picture-pickups.test.mjs`
- Create: `demo-video/capture/test/clean-edit.test.mjs`
- Create: `demo-footage/picture-lock/source-pack.json`
- Create: the eleven tracked WebM files and eleven matching tracked `*.actions.json` files listed in the file map
- Modify: `demo-video/capture/package.json`
- Modify: `demo-video/capture/package-lock.json`
- Modify: `demo-video/capture/.gitignore`

- [ ] **Step 1: Write recorder, source-pack, and manifest contract tests before capture**

Author both test files before implementation and include them in the recorder-code commit in Step 3, before recording anything. Their ordinary `node --test` path creates deterministic temporary media/provenance fixtures and exercises the recorder, discriminated provenance, two-phase snapshot-decision, action, fact, and edit validators without requiring the not-yet-created canonical pickups. The initial tracked manifest may contain only the explicit pre-refresh sentinel `snapshotDecision:{"status":"PENDING_REFRESH"}`; synthetic recorder-contract tests accept that sentinel only with `phase:"recorder-code"`, while refresh binding, capture, source-pack generation, and real-file acceptance all reject it. Their explicitly selected acceptance path, enabled only by `PICTURE_LOCK_ACCEPTANCE=1`, loads every real tracked file and fails (never skips or synthesizes a PASS) if any canonical media, action log, registry, or PNG is absent. After capture, Step 10 runs that acceptance path; Step 11 commits only after it passes. Its final assertions include:

```js
const expectedSources = new Map([
  ["demo-footage/landing.webm", 598],
  ["demo-footage/market-detail.webm", 266],
  ["demo-footage/assess-flow.webm", 670],
  ["demo-footage/picture-lock/market-three-clean.webm", 389],
  ["demo-footage/picture-lock/comparison-clean.webm", 218],
  ["demo-footage/picture-lock/methodology-anchors-clean.webm", 202],
  ["demo-footage/picture-lock/methodology-default-clean.webm", 100],
  ["demo-footage/picture-lock/methodology-scoring-clean.webm", 100],
  ["demo-footage/picture-lock/methodology-scope-clean.webm", 103],
  ["demo-footage/picture-lock/instruction-rejection-clean.webm", 132],
  ["demo-footage/picture-lock/explorer-source-clean.webm", 262],
  ["demo-footage/picture-lock/closing-clean.webm", 263],
  ["demo-footage/picture-lock/mcp-policy.webm", 685],
  ["demo-footage/picture-lock/evidence-cli.webm", 716],
]);

assert.deepEqual(new Map(sourcePack.sources.map((item) => [item.path, item.decodedFrames])), expectedSources);
for (const source of sourcePack.sources) {
  assert.match(source.sha256, /^[0-9a-f]{64}$/);
  assert.equal(await sha256File(repoPath(source.path)), source.sha256);
  assert.equal((await probeNativeFrames(repoPath(source.path))).decodedFrames, source.decodedFrames);
  assert.ok(source.provenancePath);
  assert.match(source.provenanceSha256, /^[0-9a-f]{64}$/);
  assert.equal(await sha256File(repoPath(source.provenancePath)), source.provenanceSha256);
  assert.ok(source.reviewedCommit);
  assert.ok(!source.provenancePath.includes("runs/"));
}
const trackedActionLogs = sourcePack.sources.filter(({path}) => path.startsWith("demo-footage/picture-lock/"));
assert.equal(trackedActionLogs.length, 11);
assert.ok(trackedActionLogs.every(({provenancePath}) => provenancePath.endsWith(".actions.json")));
assert.equal(capturePackage.devDependencies.playwright, "1.62.1");
assert.equal(captureLock.packages["node_modules/playwright"].version, "1.62.1");
const provenancePairs = await Promise.all(trackedActionLogs.map(async (source) => ({
  source,
  log: JSON.parse(await readFile(repoPath(source.provenancePath), "utf8")),
})));
const browserLogs = provenancePairs.filter(({log}) => log.captureKind === "browser");
const terminalLogs = provenancePairs.filter(({log}) => log.captureKind === "terminal");
assert.equal(browserLogs.length, 9);
assert.equal(terminalLogs.length, 2);
for (const {source, log} of provenancePairs) {
  assert.match(log.captureBatchId, /^[0-9a-f]{64}$/);
  assert.ok(Number.isInteger(log.captureOrdinal) && log.captureOrdinal >= 1 && log.captureOrdinal <= 11);
  assert.ok(Number.isFinite(Date.parse(log.captureStartedAt)) && log.captureStartedAt.endsWith("Z"));
  assert.equal(log.dirty, false);
  assert.match(log.productBuildCommit, /^[0-9a-f]{40}$/);
  assert.match(log.recorderCommit, /^[0-9a-f]{40}$/);
  assert.equal(log.productBuildCommit, log.recorderCommit);
  assert.equal(source.reviewedCommit, log.recorderCommit);
  assert.match(log.pickupManifestSha256, /^[0-9a-f]{64}$/);
  assert.equal(await sha256File(repoPath("demo-video/capture/picture-pickup-manifest.json")), log.pickupManifestSha256);
  assert.equal(await gitBlobSha256(log.recorderCommit, "demo-video/capture/picture-pickup-manifest.json"), log.pickupManifestSha256);
  assert.ok(log.recorderPath);
  assert.match(log.recorderSha256, /^[0-9a-f]{64}$/);
  assert.equal(await gitBlobSha256(log.recorderCommit, log.recorderPath), log.recorderSha256);
  assert.equal(log.playwrightVersion, "1.62.1");
  assert.equal(log.browserName, "chromium");
  assert.equal(log.browserInstallSource, "npx playwright install chromium");
  assert.equal(log.playwrightBrowsersPath, "demo-video/capture/.playwright-browsers");
  assert.equal(log.browserRevision, "1234");
  assert.equal(log.browserSourceDescriptorPath, "demo-video/capture/node_modules/playwright-core/browsers.json");
  assert.ok(log.browserExecutableRelativePath);
  assert.ok(!path.isAbsolute(log.browserExecutableRelativePath));
  assert.ok(realpath(repoPath(path.join(log.playwrightBrowsersPath, log.browserExecutableRelativePath))).startsWith(`${realpath(repoPath(log.playwrightBrowsersPath))}${path.sep}`));
  assert.match(log.browserExecutableSha256, /^[0-9a-f]{64}$/);
  assert.match(log.browserSourceDescriptorSha256, /^[0-9a-f]{64}$/);
  assert.match(log.packageLockSha256, /^[0-9a-f]{64}$/);
  assert.equal(await sha256File(repoPath(log.browserSourceDescriptorPath)), log.browserSourceDescriptorSha256);
  assert.equal(await sha256File(repoPath("demo-video/capture/package-lock.json")), log.packageLockSha256);
}
assert.equal(new Set(provenancePairs.map(({log}) => log.captureBatchId)).size, 1);
assert.deepEqual(provenancePairs.map(({log}) => log.captureOrdinal).sort((a, b) => a - b), [1,2,3,4,5,6,7,8,9,10,11]);
const marketLog = provenancePairs.find(({source}) => source.path.endsWith("market-three-clean.webm")).log;
assert.equal(marketLog.captureOrdinal, 1);
assert.equal(Date.parse(marketLog.captureStartedAt), Math.min(...provenancePairs.map(({log}) => Date.parse(log.captureStartedAt))));
assert.equal(marketLog.captureBatchId, sha256Utf8([
  marketLog.recorderCommit,
  marketLog.pickupManifestSha256,
  marketLog.browserExecutableSha256,
  marketLog.captureStartedAt,
].join("\n")));
const pickupManifest = JSON.parse(await readFile(repoPath("demo-video/capture/picture-pickup-manifest.json"), "utf8"));
const decision = pickupManifest.snapshotDecision;
assert.deepEqual(Object.keys(decision).sort(), [
  "boundAt", "decision", "evidencePath", "evidenceSha256",
  "expectedDisplayedTimestamp", "generatedAt", "refreshAckEntrySha256",
  "refreshAckMailboxBlobOid", "refreshCommit", "refreshRequestEntrySha256",
  "refreshActor", "refreshRequestId", "refreshRequestMailboxBlobOid",
  "refreshRequestMailboxCommit", "requestActor", "status",
].sort());
assert.equal(decision.status, "READY_FOR_CAPTURE");
assert.equal(decision.decision, "recording-day-refresh");
assert.equal(decision.requestActor, "OpenAI Codex");
assert.equal(decision.refreshActor, "Claude Fable 5");
assert.equal(decision.evidencePath, "demo-video/capture/evidence-manifest.json");
assert.equal(decision.expectedDisplayedTimestamp, formatTimestampUtc(decision.generatedAt));
for (const key of ["evidenceSha256", "refreshAckEntrySha256", "refreshRequestEntrySha256"]) assert.match(decision[key], /^[0-9a-f]{64}$/);
for (const key of ["refreshAckMailboxBlobOid", "refreshCommit", "refreshRequestMailboxBlobOid", "refreshRequestMailboxCommit"]) assert.match(decision[key], /^[0-9a-f]{40}$/);
assert.deepEqual(marketLog.snapshotDecision, decision);
assert.equal(marketLog.displayedTimestampText, decision.expectedDisplayedTimestamp);
for (const {source, log} of browserLogs) {
  assert.ok(!source.path.endsWith("mcp-policy.webm") && !source.path.endsWith("evidence-cli.webm"));
  assert.equal(log.recorderPath, "demo-video/capture/scripts/picture-pickups.mjs");
  for (const key of [
    "terminalRecorderPath", "terminalRecorderSha256", "terminalRendererPath", "terminalRendererSha256",
    "fontDescriptor", "fontDescriptorSha256", "resolvedFontName", "resolvedFontFileSha256",
    "transcript", "transcriptSha256",
  ]) assert.equal(log[key], undefined);
}
for (const {source, log} of terminalLogs) {
  assert.ok(source.path.endsWith("mcp-policy.webm") || source.path.endsWith("evidence-cli.webm"));
  assert.equal(log.recorderPath, "demo-video/capture/scripts/capture-terminal.mjs");
  assert.equal(log.terminalRecorderPath, "demo-video/capture/scripts/capture-terminal.mjs");
  assert.equal(log.terminalRendererPath, "demo-video/capture/scripts/terminal-stage-server.mjs");
  assert.equal(await sha256File(repoPath(log.terminalRecorderPath)), log.terminalRecorderSha256);
  assert.equal(await sha256File(repoPath(log.terminalRendererPath)), log.terminalRendererSha256);
  assert.equal(log.ffmpegVersion, "8.0.1");
  assert.match(log.ffmpegBinarySha256, /^[0-9a-f]{64}$/);
  assert.equal(log.fontDescriptor, "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace");
  assert.equal(sha256Utf8(log.fontDescriptor), log.fontDescriptorSha256);
  assert.ok(log.resolvedFontName);
  assert.match(log.resolvedFontFileSha256, /^[0-9a-f]{64}$/);
  assert.ok(log.transcript.length > 0);
  assert.equal(sha256Utf8(log.transcript), log.transcriptSha256);
  assert.match(log.privateRawMediaSha256, /^[0-9a-f]{64}$/);
  assert.equal(await sha256File(repoPath(source.path)), log.canonicalMediaSha256);
  assert.ok(!new Set([
    "438191977ebcee9e8ee8d747b0573b6f80879905b8108a397016b5c4e95c971e",
    "41820f05d6f12fb31bd5c86217a5005f43c38f5210363f3aa18e0d7e632136c5",
  ]).has(log.canonicalMediaSha256));
}
for (const action of finalActions.actions) {
  const evidenceFrame = Math.floor((action.sourceStartFrame + action.sourceEndFrame - 1) / 2);
  assert.equal(action.windowEvidenceFrame, evidenceFrame);
  assert.equal(action.windowEvidencePath, `demo-footage/picture-lock/window-evidence/${action.id}--f${evidenceFrame}.png`);
  assert.equal(await sha256File(repoPath(action.windowEvidencePath)), action.windowEvidenceSha256);
  assert.equal(await sha256File(repoPath(action.source)), action.windowEvidenceSourceSha256);
  assert.equal(await decodeRgbaFrameSha256(repoPath(action.source), evidenceFrame), action.windowEvidencePixelSha256);
}
assert.equal(manifest.schemaVersion, 3);
assert.equal(manifest.fps, 25);
assert.equal(manifest.targetFrames, 3989);
assert.equal(resolveTimeline(manifest).at(-1).outputEndFrame, 3989);
assert.equal(resolveTimeline(manifest).reduce((sum, shot) => sum + shot.frameCount, 0), 3989);
assert.ok(resolveTimeline(manifest).every((shot, index, all) => shot.outputStartFrame === (index ? all[index - 1].outputEndFrame : 0)));
assert.ok(!JSON.stringify(manifest).includes("runs/"));
assert.ok(!JSON.stringify(manifest).includes("presentation/"));
assert.ok(!JSON.stringify(manifest).includes("quote-rejection.webm"));
```

Mutation tests reject a missing file, media/provenance/window-PNG SHA mismatch, ignored or untracked provenance, a tracked action log containing a local path or secret, `dirty:true`, missing/different product-build or recorder commit, a `reviewedCommit` that predates/omits the recorded runtime code, recorder/manifest working bytes that differ from their commit blobs, an absent/unknown `captureKind`, a browser log with terminal-only fields, a terminal log missing recorder/renderer/FFmpeg/font/transcript data, either terminal log carrying a prior-run media hash, a Playwright/package-lock/browser-revision/executable/source-descriptor mismatch in either provenance kind, PENDING/default/alternate/stale snapshot state, missing or forged request/ack/refresh commit evidence, mismatched S03a/S03b/DOM/evidence timestamps, a refreshed timeline that consumes the old landing snapshot, zero decoded frames, 24/30/VFR input, loading-state pickup, runner-label pickup, fractional frame, gap, overlap, out-of-source trim, a required action with no visible source intersection, missing action/fact ID, cited fact without a hashed evidence source, visible fact without a mapped in-shot action intersection, incomplete beat-level composite evidence, and any total other than 3989. Task 2 establishes each accepted source-window PNG before composition; Task 8 separately binds the corresponding mapped output window to a rendered final checkpoint after post exists.

- [ ] **Step 2: Implement and lock the two-phase recorder/provenance contract without capturing**

The recorder-code commit deliberately carries this exact unresolved sentinel and no timestamp value:

```json
{"snapshotDecision":{"status":"PENDING_REFRESH"}}
```

`pickup-contract.mjs` models `snapshotDecision` as an `additionalProperties:false` discriminated union. `PENDING_REFRESH` is legal only for the synthetic `phase:"recorder-code"` test/commit. The sole capture-eligible variant, materialized only in Step 4 after the committed refresh acknowledgment, has these exact keys and actual values:

```json
{
  "status": "READY_FOR_CAPTURE",
  "decision": "recording-day-refresh",
  "refreshRequestId": "lowercase RFC 4122 UUID v4",
  "refreshRequestMailboxCommit": "40-lowercase-hex Codex mailbox-only request commit",
  "refreshRequestMailboxBlobOid": "40-lowercase-hex request mailbox blob OID",
  "refreshRequestEntrySha256": "64-lowercase-hex exact request-entry SHA-256",
  "refreshCommit": "40-lowercase-hex Claude refresh/ack commit",
  "refreshAckMailboxBlobOid": "40-lowercase-hex acknowledgment mailbox blob OID",
  "refreshAckEntrySha256": "64-lowercase-hex exact acknowledgment-entry SHA-256",
  "generatedAt": "exact full ISO-8601 UTC timestamp from the refreshed evidence manifest",
  "expectedDisplayedTimestamp": "formatTimestampUtc(generatedAt) as YYYY-MM-DD HH:MM UTC",
  "evidencePath": "demo-video/capture/evidence-manifest.json",
  "evidenceSha256": "recomputed 64-lowercase-hex SHA-256 of that file at refreshCommit",
  "requestActor": "actor derived from the authenticated Codex request commit/header",
  "refreshActor": "actor derived from the authenticated Claude refresh commit/header",
  "boundAt": "actual ISO-8601 UTC ending Z"
}
```

Those quoted descriptions specify schema slots; the committed capture manifest contains actual values. The binder derives `requestActor:"OpenAI Codex"` and `refreshActor:"Claude Fable 5"` only after authenticating the respective commit/header bytes, and supplies its own `boundAt`; no owner identity or actor string is accepted from CLI. `expectedDisplayedTimestamp` is computed by byte-for-byte logic equivalent to `apps/web/src/lib/format.ts#formatTimestampUtc`: validate the ISO input, then emit `${generatedAt.slice(0,10)} ${generatedAt.slice(11,16)} UTC`. It is never compared byte-for-byte with the full ISO `generatedAt`. Tests cover minute/hour/month/year and leap-day boundaries and reject `PENDING_REFRESH` outside the recorder-code phase, any alternate decision, absent/null refresh provenance, a request or acknowledgment not introduced by its recorded commit, a non-ancestor refresh commit, stale evidence, a `generatedAt`/display string/evidence SHA that differs from the exact committed evidence blob, a DOM display unequal to the derived minute display, an inferred/default actor/decision, or any capture attempt before the READY manifest commit.

`picture-pickup-manifest.json` contains these exact canonical frame contracts. `startFrame` is inclusive and `endFrame` exclusive:

| pickup | action ID | canonical window | required visible state |
|---|---|---:|---|
| market-three-clean | `pickup.market-three.snapshot-visible` | 0–42 | the exact visible timestamp text equal to `snapshotDecision.expectedDisplayedTimestamp` |
| market-three-clean | `pickup.market-three.score-visible` | 42–187 | `3/100`, Low, same snapshot timestamp/event, `LEGACY PROVENANCE`, `awaiting republish` |
| market-three-clean | `pickup.market-three.legacy-visible` | 42–181 | `LEGACY PROVENANCE` and `awaiting republish` continuously visible for S18; same timestamped refreshed snapshot |
| market-three-clean | `pickup.market-three.public-outcome-visible` | 187–389 | real D1/public-outcome copy from the same snapshot; no participant-control claim is supported by the visible contract evidence |
| comparison-clean | `pickup.comparison.three-vs-ninety-five-visible` | 0–218 | stable real score 3 and score 95 comparison for every frame; no carousel transition or evidence-only detour |
| methodology-anchors-clean | `pickup.methodology.dimensions-visible` | 0–152 | `The five dimensions` and D1 framing |
| methodology-anchors-clean | `pickup.methodology.public-anchor-visible` | 152–202 | D1 public-anchor levels table |
| methodology-default-clean | `pickup.methodology.default-visible` | 0–100 | `Conservative default`, `level 4`, caveat copy |
| methodology-scoring-clean | `pickup.methodology.scoring-visible` | 0–100 | fixed weighted formula, score bands, circuit breakers |
| methodology-scope-clean | `pickup.methodology.scope-visible` | 0–103 | all three `What this is not` bullets |
| instruction-rejection-clean | `pickup.instruction.input-visible` | 0–45 | the real instruction-like sentence and attempted overlapping quote |
| instruction-rejection-clean | `pickup.instruction.overlap-refused` | 45–132 | `Evidence quote overlaps instruction-like content` and `Not scored` |
| explorer-source-clean | `pickup.explorer.source-verified` | 0–262 | fully loaded address, `ScoreRegistry`, and exact-match verification; literal `Loading data` absent in every frame |
| closing-clean | `pickup.closing.product-visible` | 0–263 | clean real LevelField hero-to-proof move; no runner label |

The two terminal sources are mandatory new recordings too, with these exact canonical/action windows:

| terminal source | canonical frames | required real-output action windows |
|---|---:|---|
| `mcp-policy.webm` | 0–685 | command 55–85; stdio/policy 108–223/108–270; PROCEED 180–228; DECLINE 372–432; combined/no-order 504–611 |
| `evidence-cli.webm` | 0–716 | validation command 48–134; web 4 at 132–216; Forge 8 at 216–264; SDK command 264–340; validation/rho 360–423/360–420; agreement 432–470; core 65 at 480–520; SDK result/close 600–663/663–716 |

Install and lock the browser runtime metadata before the recorder commit:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
CAPTURE_ROOT="$(git rev-parse --show-toplevel)/demo-video/capture"
export PLAYWRIGHT_BROWSERS_PATH="$CAPTURE_ROOT/.playwright-browsers"
grep -Fx '.playwright-browsers/' .gitignore
git check-ignore -q .playwright-browsers/probe
npm install --save-dev --save-exact playwright@1.62.1
npx playwright install chromium
```

Implement `picture-pickups.mjs`, the verified-browser branch in `capture-terminal.mjs`, `pickup-contract.mjs`, and `clean-edit.mjs` now, before any canonical recording. Add the exact line `.playwright-browsers/` to `demo-video/capture/.gitignore`; tests require `git check-ignore` to accept a child and reject any tracked file below the root. The browser recorder will launch the production build and terminal stage at 1920×1080 with Playwright exactly `1.62.1` and Chromium revision `1234` installed by that package, use `recordVideo`, never import the action-label component, record action timestamps separately, and wait for two consecutive animation frames after every readiness assertion before starting a canonical window. The lock-producing recorder must not fall back to cached older Chromium, a system Chrome channel, `PLAYWRIGHT_MODULE_PATH`, or another package's install: only the revision/path/SHA under the exact resolved `$REPO/demo-video/capture/.playwright-browsers` root may launch. It captures longer raw footage, converts the logged monotonic action boundaries to source frames, trims each canonical file exactly once with `trim=start_frame=...:end_frame=...`, and rejects rather than padding when the required continuous window is short. The Explorer flow waits until `Loading data` is absent and the exact-match banner is present before its frame-zero marker. The instruction flow asserts the actual overlap error and `Not scored`; `instruction_like_content_detected:false` plus quote-not-found is a hard failure. `capture-terminal.mjs` is changed to accept only that same verified executable, capture the real fixed command output afresh, serialize the sanitized visible transcript/action markers, and reject the old `mcp-policy`/`evidence-cli` SHA-256 values `438191977ebcee9e8ee8d747b0573b6f80879905b8108a397016b5c4e95c971e` and `41820f05d6f12fb31bd5c86217a5005f43c38f5210363f3aa18e0d7e632136c5` as canonical inputs.

All eleven sanitized action logs record `captureKind`, one shared 64-lowercase-hex `captureBatchId`, unique integer `captureOrdinal` 1–11, full-ISO `captureStartedAt`, `dirty:false` as observed immediately before build/capture, `productBuildCommit`, `recorderCommit`, `recorderPath`, `recorderSha256`, `pickupManifestSha256`, `playwrightVersion:"1.62.1"`, `browserName:"chromium"`, `browserInstallSource:"npx playwright install chromium"`, fixed repository-relative `playwrightBrowsersPath:"demo-video/capture/.playwright-browsers"`, exact `browserRevision:"1234"` read from `demo-video/capture/node_modules/playwright-core/browsers.json`, that exact repository-relative `browserSourceDescriptorPath` and its SHA-256, the browser executable path relative to the fixed browsers root (never `/Users/...` or another absolute path), the executable SHA-256, and the committed `package-lock.json` SHA-256. The recorder resolves the fixed root with `realpath`, requires it to be inside the repository and ignored by `.gitignore`, and rejects an unset/different `PLAYWRIGHT_BROWSERS_PATH`, a symlink escape, or an executable outside it. Before the first recording, the recorder defines `batchStartedAt` as ordinal 1's `captureStartedAt` and `captureBatchId = sha256Utf8([CAPTURE_COMMIT,pickupManifestSha256,browserExecutableSha256,batchStartedAt].join("\n"))`; acceptance recomputes that digest entirely from the tracked logs and committed blobs. The market-three log must be ordinal 1 and have the earliest start time; ordinals are contiguous and timestamps nondecreasing. `productBuildCommit` and `recorderCommit` are the same clean `CAPTURE_COMMIT` created after refresh binding in Step 4; source-pack `reviewedCommit` must equal that value, and validation reads the recorder and final pickup-manifest blobs from that commit and recomputes their SHA-256. `CAPTURE_COMMIT` contains `RECORDER_CODE_COMMIT` as an ancestor and contains the identical tested recorder bytes plus the READY manifest. The nine product/explorer logs use `captureKind:"browser"` and `recorderPath:"demo-video/capture/scripts/picture-pickups.mjs"`. The two freshly recorded terminal logs use `captureKind:"terminal"` and `recorderPath:"demo-video/capture/scripts/capture-terminal.mjs"`; they additionally bind the terminal-stage renderer repository path/SHA, FFmpeg 8.0.1 binary SHA, exact terminal CSS font descriptor/SHA, resolved font name and font-file SHA (without its absolute path), embedded sanitized transcript/SHA, private raw-media SHA, and canonical media SHA. The source-pack entry independently hashes each action-log file itself. Acceptance recomputes every field from committed/runtime bytes. A dirty capture start, missing/noncontiguous batch order, market not first, missing recorder/manifest blob, commit mismatch, missing browser, revision/path/source-descriptor mismatch, terminal provenance/font mismatch, old terminal media hash, or package-lock drift rejects the source rather than fabricating provenance.

`market-three-clean.actions.json` additionally stores the exact READY `snapshotDecision` object and browser-read `displayedTimestampText`. The recorder accepts its first frame only when the rendered text equals the derived `expectedDisplayedTimestamp`, retains that same text through both snapshot and score action windows, and hashes the DOM observation. It may not inherit the prior landing action or timestamp.

Add the exact command to `demo-video/capture/package.json`, and make `picture-pickups.test.mjs` assert the key/value so the documented command cannot drift:

```json
{"scripts":{"capture:picture-pickups":"node scripts/picture-pickups.mjs"}}
```

Run only the pre-capture synthetic contract suites:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
test -z "${PICTURE_LOCK_ACCEPTANCE:-}"
node --test test/picture-pickups.test.mjs test/clean-edit.test.mjs
```

Expected: recorder/provenance/edit contract tests pass from temporary fixtures, and no canonical WebM or action log has been created.

- [ ] **Step 3: Run all AGENTS gates, read the inbox, and commit the recorder code**

This pre-refresh commit contains every recorder, validator, the manifest with only `snapshotDecision.status:"PENDING_REFRESH"`, package lock, and test needed to reproduce capture, but no refresh values, generated media, action log, source pack, source-window PNG, or final registry. It is a code identity, not the eventual capture identity:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
npm test
npx tsc --noEmit -p packages/scoring/tsconfig.json
rm -rf apps/web/.next && npm run build -w @levelfield/web
npx tsx scripts/verify-classifications.ts
(cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture && node --test test/picture-pickups.test.mjs test/clean-edit.test.mjs)
cat docs/collab/inbox-codex.md

git add -- \
  demo-video/capture/.gitignore \
  demo-video/capture/package-lock.json \
  demo-video/capture/package.json \
  demo-video/capture/picture-pickup-manifest.json \
  demo-video/capture/scripts/capture-terminal.mjs \
  demo-video/capture/scripts/clean-edit.mjs \
  demo-video/capture/scripts/lib/pickup-contract.mjs \
  demo-video/capture/scripts/picture-pickups.mjs \
  demo-video/capture/test/clean-edit.test.mjs \
  demo-video/capture/test/picture-pickups.test.mjs
expected_stage="$(cat <<'EOF'
demo-video/capture/.gitignore
demo-video/capture/package-lock.json
demo-video/capture/package.json
demo-video/capture/picture-pickup-manifest.json
demo-video/capture/scripts/capture-terminal.mjs
demo-video/capture/scripts/clean-edit.mjs
demo-video/capture/scripts/lib/pickup-contract.mjs
demo-video/capture/scripts/picture-pickups.mjs
demo-video/capture/test/clean-edit.test.mjs
demo-video/capture/test/picture-pickups.test.mjs
EOF
)"
test "$(git diff --cached --name-only | LC_ALL=C sort)" = "$expected_stage"
git commit -m "feat(video): lock picture pickup recorder contract" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
test -z "$(git status --porcelain=v1 --untracked-files=all)"
RECORDER_CODE_COMMIT="$(git rev-parse HEAD)"
test "$(git rev-parse "${RECORDER_CODE_COMMIT}^{commit}")" = "$RECORDER_CODE_COMMIT"
```

Expected: `RECORDER_CODE_COMMIT` is a clean `HEAD` that contains the exact tested recorder bytes and PENDING manifest. `picture-pickups.mjs --capture`, `--build-source-pack`, and the acceptance mode all reject this manifest. A gate failure, new inbox instruction, unexpected staged path, or dirty post-commit tree stops the task.

- [ ] **Step 4: Obtain the mandatory committed refresh, bind it, and commit the capture identity**

The recording-day refresh is mandatory and is the sole valid timestamp decision. Starting from clean `RECORDER_CODE_COMMIT`, use the committed recorder CLI to generate a fresh lowercase RFC 4122 UUID v4 and prepend one request to `docs/collab/inbox-claude.md` under exact subheading `### Recording-day snapshot refresh request · <refreshRequestId>`. The entry header is `## <ISO-8601 UTC ending Z> · from Codex`, its final non-empty line is `STATUS: NEEDS_REPLY`, and its sole fenced JSON payload has exactly `{schemaVersion:1,kind:"recording-day-snapshot-refresh-request",refreshRequestId,evidencePath:"demo-video/capture/evidence-manifest.json",generatedAtJsonPointer:"/facts/dreamdex/generatedAt",requestedAt}`. Append-only validation rejects a reused UUID, another payload key, a non-UTC time, or any older request selected as current.

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
test -z "$(git status --porcelain=v1 --untracked-files=all)"
RECORDER_CODE_COMMIT="$(git rev-parse HEAD)"
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node scripts/picture-pickups.mjs --append-snapshot-refresh-request \
  --mailbox ../../docs/collab/inbox-claude.md \
  --request-record runs/2026-08-20T1530Z-preview/picture-lock-work/snapshot-refresh-request.json
cd /Users/qinjiaji/Desktop/GitProject/levelfield
# Run the complete G0 block and the two Task 2 synthetic tests here, then re-read inbox-codex.
git add -- docs/collab/inbox-claude.md
test "$(git diff --cached --name-only)" = docs/collab/inbox-claude.md
git commit -m "chore(video): request recording-day snapshot refresh" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
REFRESH_REQUEST_COMMIT="$(git rev-parse HEAD)"
test "$(git diff-tree --no-commit-id --name-only -r "$REFRESH_REQUEST_COMMIT")" = docs/collab/inbox-claude.md
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node scripts/picture-pickups.mjs --seal-snapshot-refresh-request \
  --request-record runs/2026-08-20T1530Z-preview/picture-lock-work/snapshot-refresh-request.json \
  --request-mailbox ../../docs/collab/inbox-claude.md \
  --request-mailbox-commit "$REFRESH_REQUEST_COMMIT" \
  --recorder-code-commit "$RECORDER_CODE_COMMIT"
```

The sealed ignored record has exact closed schema `{schemaVersion:1,kind:"recording-day-snapshot-refresh-request-envelope",recorderCodeCommit,requestSource:{mailboxPath,requestMailboxCommit,requestMailboxBlobOid,entryHeader,entrySubheading,mailboxEntrySha256},payload}`. The sealer reconstructs the mailbox blob/entry from Git, proves `requestMailboxCommit^ === recorderCodeCommit`, and writes atomically; it never trusts those values from the draft. This record is the only cross-turn source for the two commits.

Claude must refresh the DreamDEX score cache and regenerate—not hand-edit—`demo-video/capture/evidence-manifest.json`, append an acknowledgment to `docs/collab/inbox-codex.md`, and commit those bytes with Claude's own author identity or exact `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` trailer. Starting from the clean committed recorder/request base with network access to the DreamDEX indexer, the exact refresh pipeline is:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
npm run score:all
npm run sdk:crosscheck

cd demo-video/capture
npm run prepare:run -- \
  --run runs/2026-08-20T1530Z-preview \
  --copy-handoff
npm run verify:final -- \
  --run runs/2026-08-20T1530Z-preview \
  --video ../levelfield-demo-preview.mp4 \
  --srt ../levelfield-demo.en.srt

node --input-type=module - <<'NODE'
import fs from "node:fs";
const index = JSON.parse(fs.readFileSync("../../data/scores/index.json", "utf8"));
const evidence = JSON.parse(fs.readFileSync("evidence-manifest.json", "utf8"));
if (evidence.facts?.dreamdex?.generatedAt !== index.generatedAt) {
  throw new Error("evidence-manifest DreamDEX generatedAt does not match refreshed score index");
}
if (!Array.isArray(evidence.facts?.dreamdex?.marketIds) || evidence.facts.dreamdex.marketIds.length === 0) {
  throw new Error("refreshed evidence-manifest has no DreamDEX market IDs");
}
NODE
```

`prepare:run` is the only writer of the run's refreshed `facts.json`; `verify:final` is the only writer of the tracked evidence manifest. The verifier must PASS against the already hash-bound prototype MP4/SRT/edit-result before the evidence file is accepted. A hand-edited `facts.json` or `evidence-manifest.json`, a failed SDK cross-check, a generated timestamp unequal to `data/scores/index.json.generatedAt`, or an empty refreshed market set invalidates the refresh. Because this regenerates `data/scores/`, Claude also runs the four AGENTS gates plus `npx tsx scripts/verify-onchain.ts` and records whether the registry needs republish in the refresh commit message. Its entry header is `## <ISO-8601 UTC ending Z> · from claude`, its exact subheading is `### Recording-day snapshot refresh acknowledgment · <refreshRequestId>`, its final non-empty line is `STATUS: DONE`, and its sole fenced JSON payload has exactly `{schemaVersion:1,kind:"recording-day-snapshot-refresh-ack",refreshRequestId,generatedAt,evidencePath:"demo-video/capture/evidence-manifest.json",evidenceSha256,refreshedAt,status:"PASS"}`. `generatedAt` and `refreshedAt` are full ISO-8601 UTC values; the former exactly matches `/facts/dreamdex/generatedAt` in the evidence blob at that commit. A prose acknowledgment, Codex-authored refresh, working-tree-only refresh, stale cache timestamp, `FAIL`, missing AGENTS/verify-onchain evidence, or payload/evidence mismatch does not authorize final capture.

After Claude supplies the explicit 40-hex commit, verify—not infer—its ancestry, attribution, introduced entry, current working mailbox bytes, committed evidence blob, SHA, and timestamp. The verifier writes an ignored envelope that binds request commit/blob/entry provenance and refresh commit/mailbox blob/entry provenance; it rejects a request commit that changed any path besides `docs/collab/inbox-claude.md`, a refresh commit that lacks both the target evidence change and acknowledgment, or unrelated/unclaimed paths. Then atomically replace only the PENDING object in the pickup manifest with the exact `READY_FOR_CAPTURE` object from Step 2:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
unset REFRESH_REQUEST_COMMIT RECORDER_CODE_COMMIT
REQUEST_RECORD=demo-video/capture/runs/2026-08-20T1530Z-preview/picture-lock-work/snapshot-refresh-request.json
REFRESH_REQUEST_COMMIT="$(node -e 'const r=JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8"));process.stdout.write(r.requestSource.requestMailboxCommit)' "$REQUEST_RECORD")"
RECORDER_CODE_COMMIT="$(node -e 'const r=JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8"));process.stdout.write(r.recorderCodeCommit)' "$REQUEST_RECORD")"
test "${#REFRESH_REQUEST_COMMIT}" = 40
test "${#RECORDER_CODE_COMMIT}" = 40
git rev-parse "${REFRESH_REQUEST_COMMIT}^{commit}"
git rev-parse "${RECORDER_CODE_COMMIT}^{commit}"
test "$(git rev-parse "${REFRESH_REQUEST_COMMIT}^")" = "$RECORDER_CODE_COMMIT"
: "${REFRESH_COMMIT:?export the explicit Claude-attributed 40-hex refresh/ack commit}"
test "${#REFRESH_COMMIT}" = 40
git rev-parse "${REFRESH_COMMIT}^{commit}"
git merge-base --is-ancestor "$REFRESH_REQUEST_COMMIT" "$REFRESH_COMMIT"
git merge-base --is-ancestor "$REFRESH_COMMIT" HEAD
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node scripts/picture-pickups.mjs --verify-snapshot-refresh \
  --request-record runs/2026-08-20T1530Z-preview/picture-lock-work/snapshot-refresh-request.json \
  --request-mailbox ../../docs/collab/inbox-claude.md \
  --request-mailbox-commit "$REFRESH_REQUEST_COMMIT" \
  --ack-mailbox ../../docs/collab/inbox-codex.md \
  --refresh-commit "$REFRESH_COMMIT" \
  --evidence evidence-manifest.json \
  --output runs/2026-08-20T1530Z-preview/picture-lock-work/snapshot-refresh-ack-envelope.json
node scripts/picture-pickups.mjs --bind-snapshot-refresh \
  --manifest picture-pickup-manifest.json \
  --refresh-envelope runs/2026-08-20T1530Z-preview/picture-lock-work/snapshot-refresh-ack-envelope.json
node --test test/picture-pickups.test.mjs test/clean-edit.test.mjs
cd /Users/qinjiaji/Desktop/GitProject/levelfield
# Run the complete G0 block and the same two synthetic tests again, then re-read inbox-codex.
git add -- demo-video/capture/picture-pickup-manifest.json
test "$(git diff --cached --name-only)" = demo-video/capture/picture-pickup-manifest.json
git commit -m "chore(video): bind recording-day snapshot refresh" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
CAPTURE_COMMIT="$(git rev-parse HEAD)"
git merge-base --is-ancestor "$RECORDER_CODE_COMMIT" "$CAPTURE_COMMIT"
test "$(git rev-parse "${CAPTURE_COMMIT}^")" = "$REFRESH_COMMIT"
test -z "$(git diff --name-only "$RECORDER_CODE_COMMIT" "$CAPTURE_COMMIT" -- \
  demo-video/capture/scripts demo-video/capture/test demo-video/capture/package.json demo-video/capture/package-lock.json)"
test -z "$(git status --porcelain=v1 --untracked-files=all)"
```

Expected: the final manifest is committed at clean `CAPTURE_COMMIT`, contains `decision:"recording-day-refresh"`, full ISO `generatedAt`, derived `YYYY-MM-DD HH:MM UTC` display text, non-null request/ack/refresh provenance, and the exact refreshed evidence SHA. `CAPTURE_COMMIT` contains the tested recorder code and the READY manifest, so it—not `RECORDER_CODE_COMMIT`—is recorded as both `recorderCommit` and `productBuildCommit`. A test launches the resume verifier with both commit environment variables absent, reconstructs both solely from the sealed record/Git, and passes; deleting, forging, or swapping either record field fails. Any refresh/request/ack failure blocks picture lock; non-timestamp work may continue, but no canonical timestamp-sensitive pickup or final picture may be accepted.

- [ ] **Step 5: Immediately build from the capture identity and record all eleven sources**

No network refresh, unrelated edit, other capture, or discretionary task may occur between the READY manifest commit and the first canonical pickup. Re-create the locked dependencies and browser from tracked metadata, build the product at `CAPTURE_COMMIT`, then start one atomic capture batch whose first recording is `market-three-clean`. The recorder checks cleanliness before writing its first output; later files created by that same batch do not change the recorded clean-start fact:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
test -z "$(git status --porcelain=v1 --untracked-files=all)"
CAPTURE_COMMIT="$(git rev-parse HEAD)"
PRODUCT_BUILD_COMMIT="$CAPTURE_COMMIT"
git cat-file -e "${CAPTURE_COMMIT}:demo-video/capture/picture-pickup-manifest.json"
git cat-file -e "${CAPTURE_COMMIT}:demo-video/capture/scripts/picture-pickups.mjs"
git cat-file -e "${CAPTURE_COMMIT}:demo-video/capture/scripts/capture-terminal.mjs"

cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
CAPTURE_ROOT="$(git rev-parse --show-toplevel)/demo-video/capture"
export PLAYWRIGHT_BROWSERS_PATH="$CAPTURE_ROOT/.playwright-browsers"
git check-ignore -q "$PLAYWRIGHT_BROWSERS_PATH/probe"
npm ci --ignore-scripts
npx playwright install chromium
node --input-type=module <<'NODE'
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const browsers = JSON.parse(readFileSync("node_modules/playwright-core/browsers.json", "utf8"));
assert.equal(browsers.browsers.find(({name}) => name === "chromium")?.revision, "1234");
NODE

cd /Users/qinjiaji/Desktop/GitProject/levelfield
rm -rf apps/web/.next
npm run build -w @levelfield/web
test -z "$(git status --porcelain=v1 --untracked-files=all)"

cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
npm run capture:picture-pickups -- \
  --run runs/2026-08-20T1530Z-preview \
  --recorder-commit "$CAPTURE_COMMIT" \
  --product-build-commit "$PRODUCT_BUILD_COMMIT" \
  --snapshot-decision-from-manifest picture-pickup-manifest.json \
  --first-pickup market-three-clean \
  --require-clean-start
```

Expected: the timestamp-sensitive market-three snapshot is `captureOrdinal:1` and has the earliest `captureStartedAt` in the single content-addressed `captureBatchId`, immediately after the mandatory committed refresh and manifest binding; then the remaining eight browser pickups and two freshly recorded terminal sources complete that batch at strictly increasing ordinals. All visible/action assertions PASS, with no loading/action-label frame. Every sanitized log records that batch/ordinal/time plus the same `CAPTURE_COMMIT` for `recorderCommit`, `productBuildCommit`, and the eventual source-pack `reviewedCommit`. No prior terminal WebM, still frame, `tpad`, clone, `fps` conversion, or playback-rate filter is permitted.

- [ ] **Step 6: Build the tracked, content-addressed source pack**

Place the nine accepted browser pickups and two newly accepted terminal recordings at their eleven tracked `demo-footage/picture-lock/*.webm` destinations, and leave the three existing label-free handoff sources at their already tracked paths. For each new WebM, sanitize its accepted raw log into a tracked same-stem `*.actions.json` using the discriminated provenance contract above: browser and terminal records share their real Playwright/Chromium fields, while only terminal records carry terminal-recorder/renderer/FFmpeg/font/transcript fields. `writeSourcePack({recorderCommit, productBuildCommit})` computes every SHA-256 and decoded-frame count from the files and writes `demo-footage/picture-lock/source-pack.json`; for every new source it requires both arguments to equal clean `CAPTURE_COMMIT`, verifies the READY pickup manifest and named recorder blobs at that commit, binds the matching tracked action log, and writes `reviewedCommit: recorderCommit`. The three handoff sources remain bound to their already recorded `demo-footage/MANIFEST.md` provenance and commit. Never derive a new source's reviewed commit from the now-dirty runtime `HEAD`, type a media or provenance SHA by hand, reuse an older terminal WebM, or point `provenancePath` into ignored `runs/**`.

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
CAPTURE_COMMIT="$(git rev-parse HEAD)"
node scripts/picture-pickups.mjs \
  --build-source-pack ../../demo-footage/picture-lock/source-pack.json \
  --run runs/2026-08-20T1530Z-preview \
  --recorder-commit "$CAPTURE_COMMIT" \
  --product-build-commit "$CAPTURE_COMMIT"
```

Expected: the content-addressed pack lists all fourteen selected source paths and eleven required action logs outside ignored `runs/**`; no private origin path is recorded.

- [ ] **Step 7: Create the exact final action registry and accept its source windows**

Write `final-actions.json` with these source-frame windows. Each row is a visible state derived from a real upstream action or accepted real handoff; it is not a synthetic claim:

| action ID | source | visible source frames |
|---|---|---:|
| `handoff.landing.hero` | `demo-footage/landing.webm` | 12–96 |
| `handoff.landing.pretrade-proof` | `demo-footage/landing.webm` | 151–371 |
| `pickup.market-three.snapshot-visible` | `demo-footage/picture-lock/market-three-clean.webm` | 0–42 |
| `pickup.comparison.three-vs-ninety-five-visible` | `demo-footage/picture-lock/comparison-clean.webm` | 0–218 |
| `handoff.market-detail.curated-context` | `demo-footage/market-detail.webm` | 12–125 |
| `handoff.market-detail.score95` | `demo-footage/market-detail.webm` | 12–100 |
| `handoff.market-detail.cb1` | `demo-footage/market-detail.webm` | 31–100 |
| `handoff.market-detail.d1-quote` | `demo-footage/market-detail.webm` | 210–265 |
| `handoff.assess.result95-cb1` | `demo-footage/assess-flow.webm` | 180–304 |
| `pickup.market-three.score-visible` | `demo-footage/picture-lock/market-three-clean.webm` | 42–187 |
| `pickup.market-three.public-outcome-visible` | `demo-footage/picture-lock/market-three-clean.webm` | 187–389 |
| `pickup.methodology.dimensions-visible` | `demo-footage/picture-lock/methodology-anchors-clean.webm` | 0–152 |
| `pickup.methodology.public-anchor-visible` | `demo-footage/picture-lock/methodology-anchors-clean.webm` | 152–202 |
| `pickup.methodology.default-visible` | `demo-footage/picture-lock/methodology-default-clean.webm` | 0–100 |
| `pickup.methodology.scoring-visible` | `demo-footage/picture-lock/methodology-scoring-clean.webm` | 0–100 |
| `pickup.methodology.scope-visible` | `demo-footage/picture-lock/methodology-scope-clean.webm` | 0–103 |
| `pickup.instruction.input-visible` | `demo-footage/picture-lock/instruction-rejection-clean.webm` | 0–45 |
| `pickup.instruction.overlap-refused` | `demo-footage/picture-lock/instruction-rejection-clean.webm` | 45–132 |
| `terminal.mcp.command-visible` | `demo-footage/picture-lock/mcp-policy.webm` | 55–85 |
| `terminal.mcp.stdio-visible` | `demo-footage/picture-lock/mcp-policy.webm` | 108–223 |
| `terminal.mcp.policy-visible` | `demo-footage/picture-lock/mcp-policy.webm` | 108–270 |
| `terminal.mcp.proceed-visible` | `demo-footage/picture-lock/mcp-policy.webm` | 180–228 |
| `terminal.mcp.decline-visible` | `demo-footage/picture-lock/mcp-policy.webm` | 372–432 |
| `terminal.mcp.combined-visible` | `demo-footage/picture-lock/mcp-policy.webm` | 504–611 |
| `pickup.explorer.source-verified` | `demo-footage/picture-lock/explorer-source-clean.webm` | 0–262 |
| `pickup.market-three.legacy-visible` | `demo-footage/picture-lock/market-three-clean.webm` | 42–181 |
| `terminal.validation.command-visible` | `demo-footage/picture-lock/evidence-cli.webm` | 48–134 |
| `terminal.validation.result-visible` | `demo-footage/picture-lock/evidence-cli.webm` | 360–423 |
| `terminal.agreement.visible` | `demo-footage/picture-lock/evidence-cli.webm` | 432–470 |
| `terminal.rho.visible` | `demo-footage/picture-lock/evidence-cli.webm` | 360–420 |
| `terminal.web-tests.4-visible` | `demo-footage/picture-lock/evidence-cli.webm` | 132–216 |
| `terminal.core-tests.65-visible` | `demo-footage/picture-lock/evidence-cli.webm` | 480–520 |
| `terminal.forge.result-visible` | `demo-footage/picture-lock/evidence-cli.webm` | 216–264 |
| `terminal.sdk.command-visible` | `demo-footage/picture-lock/evidence-cli.webm` | 264–340 |
| `terminal.sdk.result-visible` | `demo-footage/picture-lock/evidence-cli.webm` | 600–663 |
| `terminal.sdk.close-visible` | `demo-footage/picture-lock/evidence-cli.webm` | 663–716 |
| `pickup.closing.product-visible` | `demo-footage/picture-lock/closing-clean.webm` | 0–263 |

Every row already carries its full repository-relative source path. Each entry also stores `sourcePackSha256`, its upstream action ID or handoff commit, and the exact `windowEvidencePath`, `windowEvidenceSha256`, `windowEvidenceSourceSha256`, `windowEvidenceFrame`, and `windowEvidencePixelSha256` established during this pre-composition source-window acceptance.

For every completed registry entry, compute `evidenceFrame = floor((sourceStartFrame + sourceEndFrame - 1) / 2)`, extract that exact decoded source frame with FFmpeg 8.0.1, and write the tracked PNG as `demo-footage/picture-lock/window-evidence/<actionId>--f<evidenceFrame>.png`. Tests require the frame to be inside the half-open action window, hash the PNG file, re-hash the referenced source, decode that source frame independently to verify the pixel hash, and reject any missing, stale, or source-mismatched evidence. Finish `--verify-source-pack` only after these action-window files exist, so acceptance produces all fourteen sources, eleven action logs, and one tracked PNG per final action before clean composition starts. These PNGs prove only accepted source-window content; they do not substitute for Task 8's checkpoint review of rendered output.

Run the full clean-clone acceptance only now:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node scripts/picture-pickups.mjs --verify-source-pack ../../demo-footage/picture-lock/source-pack.json \
  --actions final-actions.json
```

Expected: all fourteen media files, eleven provenance logs, and every action-window PNG are tracked and reproducible; every media/provenance/browser/package-lock/PNG/pixel hash and decoded length matches before composition.

- [ ] **Step 8: Create the complete final fact registry**

`final-facts.json` uses four evidence contracts. `mode:"visible"` requires a registered action whose continuously visible source interval intersects the consuming trim; Task 8 later requires a rendered checkpoint inside that mapped intersection. `mode:"narrated"` requires an exact cited path/locator and narration-beat range but makes no raw-pixel claim. `mode:"composite"` declares explicit `actionGroups` (OR between groups, AND within one group), a citation, and either `scope:"shot"` or `scope:"beat"`; every member of the satisfied group must intersect the declared scope, but it need not fit inside one consuming shot when the scope is a beat. `mode:"editorial"` requires exact callout frames/text plus cited evidence and is never assigned a raw source-frame window. Populate exactly this registry:

| fact ID | mode | authoritative evidence |
|---|---|---|
| `product.real_ui` | visible | `handoff.landing.hero` |
| `product.pre_trade_layer` | composite | `handoff.landing.pretrade-proof`; `apps/web/src/app/page.tsx`, hero lede |
| `dreamdex.timestamped_snapshot` | composite | `pickup.market-three.snapshot-visible` and the exact `snapshotDecision.generatedAt`; `demo-video/capture/evidence-manifest.json#/facts/dreamdex` |
| `dreamdex.score_3` | composite | `pickup.market-three.score-visible` or `terminal.mcp.proceed-visible`; `data/scores/0x0000000000000000000000000000000000000000000000000000000000004746.json#/overallScore` |
| `dreamdex.public_outcome` | composite | beat 4; `pickup.market-three.public-outcome-visible`; the same score file `#/dimensions/0`, `#/dimensions/1`, and `#/dimensions/3` (D1 outcome control, D2 early-knowledge window, D4 disclosure synchronicity) |
| `comparison.separate_sources` | composite | `pickup.comparison.three-vs-ninety-five-visible` or `terminal.mcp.combined-visible`; `demo-video/capture/evidence-manifest.json#/facts/comparison` |
| `curated.reference` | composite | `handoff.market-detail.curated-context`; `data/scores/curated-celebrity-breakup.json` |
| `curated.score_95` | composite | `handoff.market-detail.score95` or `terminal.mcp.decline-visible`; that file `#/overallScore` |
| `curated.cb_1` | composite | `handoff.market-detail.cb1` or `terminal.mcp.decline-visible`; that file `#/circuitBreaker` |
| `curated.verbatim_evidence` | composite | `handoff.market-detail.d1-quote`; that file `#/dimensions/0/evidenceQuote` |
| `curated.no_clear_restriction` | narrated | beat 7 / output 1002–1236; `data/scores/curated-celebrity-breakup.json#/dimensions/2/levelLabel` (`unconstrained`) and `#/dimensions/2/reasoning` (the stated absence of a trading restriction) |
| `product.scope_limit` | composite | `pickup.methodology.scope-visible`; `apps/web/src/app/methodology/page.tsx`, `What this is not` |
| `methodology.five_dimensions` | composite | `pickup.methodology.dimensions-visible`; `data/anchors/anchors.yaml#/dimensions` |
| `methodology.public_anchors` | composite | `pickup.methodology.public-anchor-visible`; `data/anchors/anchors.yaml#/dimensions/0/levels` |
| `verification.instruction_overlap_rejected` | composite | `pickup.instruction.overlap-refused`; `packages/scoring/src/verify.ts` |
| `verification.not_scored` | visible | `pickup.instruction.overlap-refused` |
| `methodology.conservative_default` | composite | `pickup.methodology.default-visible`; `data/anchors/anchors.yaml#/scoring/conservative_default` |
| `methodology.deterministic_scoring` | composite | `pickup.methodology.scoring-visible`; `packages/scoring/src/score.ts` |
| `assess.score_95` | visible | `handoff.assess.result95-cb1` |
| `assess.cb_1` | visible | `handoff.assess.result95-cb1` |
| `mcp.pre_action_policy` | composite | `terminal.mcp.policy-visible`; `demo-video/capture/evidence-manifest.json#/facts/mcp/role`; exact decision-rule output and threshold predicate at `scripts/agent-demo.ts#L98-L99` and `scripts/agent-demo.ts#L118-L121` |
| `mcp.no_order_submitted` | composite | `terminal.mcp.combined-visible`; `demo-video/capture/evidence-manifest.json#/facts/mcp/orderSubmitted` |
| `somnia.registry_deployed` | composite | `pickup.explorer.source-verified`; `demo-video/capture/evidence-manifest.json#/facts/provenance/registryAddress` |
| `somnia.source_verified` | visible | `pickup.explorer.source-verified` |
| `provenance.not_complete` | narrated | beat 17 / output 2714–2976; `demo-video/capture/evidence-manifest.json#/facts/provenance/currentUriComplete` and `#/facts/provenance/verifyOnchainPassed` |
| `provenance.future_attestation_fields` | narrated | beat 17 / output 2714–2976, conditional on a provenance-complete republish; exact `band`, five-element `dims`, `methodHash`, `scoredAt`, and `uri` fields at `contracts/src/ScoreRegistry.sol#L15-L35`; value mapping at `scripts/publish-scores.ts#L115-L144`; URI construction/validation at `scripts/github-provenance.ts#L21-L48`; immutable release-ref requirement at `contracts/README.md#L60-L80` |
| `provenance.legacy` | composite | `pickup.market-three.legacy-visible`; `demo-video/capture/evidence-manifest.json#/facts/provenance/state` |
| `provenance.fail_closed` | editorial | K07 / output 2978–3110; `apps/web/src/lib/scores.ts`, `getOnchainProvenanceStatus`; `apps/web/src/lib/scores.test.ts`, legacy/invalid-URI cases |
| `validation.n_16` | composite | `terminal.validation.result-visible`; `docs/validation.md`, validation summary |
| `validation.range_3_95` | composite | `terminal.validation.result-visible`; `docs/validation.md`, validation summary |
| `validation.rho_0_930` | composite | `terminal.rho.visible`; `docs/validation.md`, rank-correlation result |
| `agreement.band_16_16` | composite | `terminal.agreement.visible`; `docs/agreement.md`, band-agreement result |
| `tests.web_4` | visible | `terminal.web-tests.4-visible` |
| `tests.software_65` | visible | `terminal.core-tests.65-visible` |
| `tests.software_69` | composite | beat 20 / output 3362–3486; both `terminal.web-tests.4-visible` and `terminal.core-tests.65-visible`; current root test transcript proving 4 + 65 = 69 |
| `tests.contract_8` | visible | `terminal.forge.result-visible` |
| `sdk.read_only_crosscheck` | composite | `terminal.sdk.result-visible`; `docs/sdk-feedback-report.md`, read-only discovery evidence |
| `product.agents_venues_traders` | narrated | beat 21 / output 3673–3989; `docs/submission.md`, product summary |

`tests.software_69` uses one beat-scoped AND group, `[terminal.web-tests.4-visible, terminal.core-tests.65-visible]`; all other “or” rows above become separate one-action groups. Beat 7's “no clear restriction” sentence is a D3 narration claim and must resolve both exact `/dimensions/2` locators rather than borrow D1's visible quote. Beat 15's low/moderate-versus-elevated/high threshold must resolve the exact executable predicate and output lines in `scripts/agent-demo.ts`. Beat 17 must simultaneously preserve the current negative state in `provenance.not_complete` and the conditional future field set in `provenance.future_attestation_fields`; it may not imply the legacy URI is already complete. `provenance.fail_closed` is deliberately editorial rather than assigned a raw S18 frame. `validateFinalFacts()` rejects any ID outside this table, a missing citation locator/hash, a citation path outside the repository, a visible fact without an in-shot mapped action intersection, a narrated fact outside its beat, an editorial fact without exact callout text/frames, or a composite fact with no satisfied action group inside its declared scope. It does not incorrectly require every component of a beat-level composite fact to appear in one consuming shot.

- [ ] **Step 9: Create the exact seamless 3989-frame edit**

`clean-edit-manifest.json` uses repository-root-relative source paths and contains exactly this half-open timeline:

| id | output frames | source | source frames | required action IDs | fact IDs |
|---|---:|---|---:|---|---|
| S01-product-open | 0–139 | `demo-footage/landing.webm` | 12–151 | `handoff.landing.hero` | `product.real_ui` |
| S02-risk-layer | 139–359 | `demo-footage/landing.webm` | 151–371 | `handoff.landing.pretrade-proof` | `product.pre_trade_layer` |
| S03a-snapshot-context | 359–401 | `demo-footage/picture-lock/market-three-clean.webm` | 0–42 | `pickup.market-three.snapshot-visible` | `dreamdex.timestamped_snapshot` |
| S03b-score-three | 401–546 | `demo-footage/picture-lock/market-three-clean.webm` | 42–187 | `pickup.market-three.score-visible` | `dreamdex.score_3,dreamdex.timestamped_snapshot` |
| S04-public-outcome | 546–748 | `demo-footage/picture-lock/market-three-clean.webm` | 187–389 | `pickup.market-three.public-outcome-visible` | `dreamdex.public_outcome` |
| S05a-real-comparison | 748–801 | `demo-footage/picture-lock/comparison-clean.webm` | 0–53 | `pickup.comparison.three-vs-ninety-five-visible` | `comparison.separate_sources` |
| S05b-curated-context | 801–914 | `demo-footage/market-detail.webm` | 12–125 | `handoff.market-detail.curated-context` | `curated.reference` |
| S06-score-ninety-five | 914–1002 | `demo-footage/market-detail.webm` | 12–100 | `handoff.market-detail.score95` | `curated.score_95` |
| S07-cb1-evidence | 1002–1236 | `demo-footage/market-detail.webm` | 31–265 | `handoff.market-detail.cb1,handoff.market-detail.d1-quote` | `curated.cb_1,curated.verbatim_evidence,curated.no_clear_restriction` |
| S08-three-vs-ninety-five | 1236–1401 | `demo-footage/picture-lock/comparison-clean.webm` | 53–218 | `pickup.comparison.three-vs-ninety-five-visible` | `comparison.separate_sources` |
| S09-scope | 1401–1504 | `demo-footage/picture-lock/methodology-scope-clean.webm` | 0–103 | `pickup.methodology.scope-visible` | `product.scope_limit` |
| S10-five-dimensions | 1504–1656 | `demo-footage/picture-lock/methodology-anchors-clean.webm` | 0–152 | `pickup.methodology.dimensions-visible` | `methodology.five_dimensions` |
| S11a-public-anchor | 1656–1706 | `demo-footage/picture-lock/methodology-anchors-clean.webm` | 152–202 | `pickup.methodology.public-anchor-visible` | `methodology.public_anchors` |
| S11b-instruction-rejection | 1706–1838 | `demo-footage/picture-lock/instruction-rejection-clean.webm` | 0–132 | `pickup.instruction.input-visible,pickup.instruction.overlap-refused` | `verification.instruction_overlap_rejected,verification.not_scored` |
| S12-conservative-default | 1838–1938 | `demo-footage/picture-lock/methodology-default-clean.webm` | 0–100 | `pickup.methodology.default-visible` | `methodology.conservative_default` |
| S13a-deterministic-code | 1938–2038 | `demo-footage/picture-lock/methodology-scoring-clean.webm` | 0–100 | `pickup.methodology.scoring-visible` | `methodology.deterministic_scoring` |
| S13b-assess-result | 2038–2162 | `demo-footage/assess-flow.webm` | 180–304 | `handoff.assess.result95-cb1` | `assess.score_95,assess.cb_1` |
| S14a-mcp-command | 2162–2222 | `demo-footage/picture-lock/mcp-policy.webm` | 25–85 | `terminal.mcp.command-visible` | `[]` |
| S14b-mcp-stdio | 2222–2337 | `demo-footage/picture-lock/mcp-policy.webm` | 108–223 | `terminal.mcp.stdio-visible` | `mcp.pre_action_policy` |
| S15-policy-visible | 2337–2499 | `demo-footage/picture-lock/mcp-policy.webm` | 108–270 | `terminal.mcp.policy-visible` | `mcp.pre_action_policy` |
| S16a-proceed-three | 2499–2547 | `demo-footage/picture-lock/mcp-policy.webm` | 180–228 | `terminal.mcp.proceed-visible` | `dreamdex.score_3` |
| S16b-decline-ninety-five | 2547–2607 | `demo-footage/picture-lock/mcp-policy.webm` | 372–432 | `terminal.mcp.decline-visible` | `curated.score_95,curated.cb_1` |
| S16c-combined-policy | 2607–2714 | `demo-footage/picture-lock/mcp-policy.webm` | 504–611 | `terminal.mcp.combined-visible` | `comparison.separate_sources,mcp.no_order_submitted` |
| S17-source-verified | 2714–2976 | `demo-footage/picture-lock/explorer-source-clean.webm` | 0–262 | `pickup.explorer.source-verified` | `somnia.registry_deployed,somnia.source_verified,provenance.not_complete,provenance.future_attestation_fields` |
| S18-awaiting-republish | 2976–3115 | `demo-footage/picture-lock/market-three-clean.webm` | 42–181 | `pickup.market-three.legacy-visible` | `provenance.legacy,provenance.fail_closed` |
| S19a-validation-command | 3115–3201 | `demo-footage/picture-lock/evidence-cli.webm` | 48–134 | `terminal.validation.command-visible` | `[]` |
| S19b-validation-result | 3201–3264 | `demo-footage/picture-lock/evidence-cli.webm` | 360–423 | `terminal.validation.result-visible` | `validation.n_16,validation.range_3_95,validation.rho_0_930` |
| S19c-agreement | 3264–3302 | `demo-footage/picture-lock/evidence-cli.webm` | 432–470 | `terminal.agreement.visible` | `agreement.band_16_16` |
| S19d-rho-hold | 3302–3362 | `demo-footage/picture-lock/evidence-cli.webm` | 360–420 | `terminal.rho.visible` | `validation.rho_0_930` |
| S20a-web-four | 3362–3446 | `demo-footage/picture-lock/evidence-cli.webm` | 132–216 | `terminal.web-tests.4-visible` | `tests.web_4,tests.software_69` |
| S20b-core-sixty-five | 3446–3486 | `demo-footage/picture-lock/evidence-cli.webm` | 480–520 | `terminal.core-tests.65-visible` | `tests.software_65,tests.software_69` |
| S20c-forge-result | 3486–3534 | `demo-footage/picture-lock/evidence-cli.webm` | 216–264 | `terminal.forge.result-visible` | `tests.contract_8` |
| S20d-sdk-command | 3534–3610 | `demo-footage/picture-lock/evidence-cli.webm` | 264–340 | `terminal.sdk.command-visible` | `sdk.read_only_crosscheck` |
| S20e-sdk-result | 3610–3673 | `demo-footage/picture-lock/evidence-cli.webm` | 600–663 | `terminal.sdk.result-visible` | `sdk.read_only_crosscheck` |
| S21a-sdk-close | 3673–3726 | `demo-footage/picture-lock/evidence-cli.webm` | 663–716 | `terminal.sdk.close-visible` | `sdk.read_only_crosscheck` |
| S21b-clean-product-close | 3726–3989 | `demo-footage/picture-lock/closing-clean.webm` | 0–263 | `pickup.closing.product-visible` | `product.agents_venues_traders` |

Every row carries its full repository-relative source path. Every output and source end is exclusive. Adjacent S03a→S03b→S04 and S10→S11a consume contiguous frames of one pickup; no decoder seek or transition is inserted at those internal boundaries. `validateSnapshotContinuity()` preserves the full ISO `generatedAt` for evidence, independently re-derives `expectedDisplayedTimestamp` with the app-equivalent UTC formatter, and requires S03a/S03b's visible text plus the market action log's `displayedTimestampText` to equal that derived display value. It always requires `decision:"recording-day-refresh"`, READY status, the exact request/ack/refresh commit evidence, and timestamp equality between the manifest, refreshed evidence blob, DOM observation, both shot windows, and fact registry. The timestamped-snapshot fact has no allowed action or consuming shot from the old landing capture, and tests reject every timestamp from that excluded source or any other stale snapshot. The shot lengths are exactly:

```text
139+220+42+145+202+53+113+88+234+165+103+152+50+132+100+100+124+60+115+162+48+60+107+262+139+86+63+38+60+84+40+48+76+63+53+263 = 3989
```

- [ ] **Step 10: Run strict real-file resolution and GREEN acceptance tests**

`validateCleanEditManifest(manifest, {sourcePack, actions, facts})` resolves every action window from `final-actions.json`, maps each non-empty source intersection to output frames, applies the four fact-mode contracts above, validates evidence paths and hashes, rejects any required action with an empty intersection, any `outputDuration`, `playbackRate`, `tpad`, `fps`, presentation source, ignored-run source, or unregistered fact, and requires authentic real-capture coverage to equal 100%. S05a and S08 must both resolve to `comparison-clean.webm`; any reintroduction of `landing.webm` f72–237 as continuous comparison evidence fails.

`buildClipFilter()` is exactly:

```js
export function buildClipFilter(shot) {
  return [
    `trim=start_frame=${shot.sourceStartFrame}:end_frame=${shot.sourceEndFrame}`,
    "setpts=N/(25*TB)",
    "scale=1920:1080:force_original_aspect_ratio=decrease:flags=lanczos:in_range=auto:out_range=tv:out_color_matrix=bt709",
    "pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x080807",
    "setsar=1",
    "format=yuv420p",
    "setparams=range=limited:field_mode=prog:color_primaries=bt709:color_trc=bt709:colorspace=bt709",
  ].join(",");
}
```

The validator implementation is already present in the clean recorder commit; this step exercises it against the newly materialized registries and media. Run the explicit real-file acceptance mode:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
PICTURE_LOCK_ACCEPTANCE=1 node --test test/picture-pickups.test.mjs test/clean-edit.test.mjs
```

Expected: exact source-pack hashes, action windows, fact registry, and 3989-frame timeline pass; every mutation fails for its named reason.

- [ ] **Step 11: Commit only generated media, logs, source pack, and registries**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
npm test
npx tsc --noEmit -p packages/scoring/tsconfig.json
rm -rf apps/web/.next && npm run build -w @levelfield/web
npx tsx scripts/verify-classifications.ts
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
PICTURE_LOCK_ACCEPTANCE=1 node --test \
  test/picture-pickups.test.mjs \
  test/clean-edit.test.mjs
cd /Users/qinjiaji/Desktop/GitProject/levelfield
cat docs/collab/inbox-codex.md

generated_paths=(
  demo-footage/picture-lock/market-three-clean.webm
  demo-footage/picture-lock/comparison-clean.webm
  demo-footage/picture-lock/methodology-anchors-clean.webm
  demo-footage/picture-lock/methodology-default-clean.webm
  demo-footage/picture-lock/methodology-scoring-clean.webm
  demo-footage/picture-lock/methodology-scope-clean.webm
  demo-footage/picture-lock/instruction-rejection-clean.webm
  demo-footage/picture-lock/explorer-source-clean.webm
  demo-footage/picture-lock/closing-clean.webm
  demo-footage/picture-lock/mcp-policy.webm
  demo-footage/picture-lock/evidence-cli.webm
  demo-footage/picture-lock/market-three-clean.actions.json
  demo-footage/picture-lock/comparison-clean.actions.json
  demo-footage/picture-lock/methodology-anchors-clean.actions.json
  demo-footage/picture-lock/methodology-default-clean.actions.json
  demo-footage/picture-lock/methodology-scoring-clean.actions.json
  demo-footage/picture-lock/methodology-scope-clean.actions.json
  demo-footage/picture-lock/instruction-rejection-clean.actions.json
  demo-footage/picture-lock/explorer-source-clean.actions.json
  demo-footage/picture-lock/closing-clean.actions.json
  demo-footage/picture-lock/mcp-policy.actions.json
  demo-footage/picture-lock/evidence-cli.actions.json
  demo-footage/picture-lock/source-pack.json
  demo-footage/picture-lock/window-evidence/handoff.landing.hero--f53.png
  demo-footage/picture-lock/window-evidence/handoff.landing.pretrade-proof--f260.png
  demo-footage/picture-lock/window-evidence/pickup.market-three.snapshot-visible--f20.png
  demo-footage/picture-lock/window-evidence/pickup.comparison.three-vs-ninety-five-visible--f108.png
  demo-footage/picture-lock/window-evidence/handoff.market-detail.curated-context--f68.png
  demo-footage/picture-lock/window-evidence/handoff.market-detail.score95--f55.png
  demo-footage/picture-lock/window-evidence/handoff.market-detail.cb1--f65.png
  demo-footage/picture-lock/window-evidence/handoff.market-detail.d1-quote--f237.png
  demo-footage/picture-lock/window-evidence/handoff.assess.result95-cb1--f241.png
  demo-footage/picture-lock/window-evidence/pickup.market-three.score-visible--f114.png
  demo-footage/picture-lock/window-evidence/pickup.market-three.public-outcome-visible--f287.png
  demo-footage/picture-lock/window-evidence/pickup.methodology.dimensions-visible--f75.png
  demo-footage/picture-lock/window-evidence/pickup.methodology.public-anchor-visible--f176.png
  demo-footage/picture-lock/window-evidence/pickup.methodology.default-visible--f49.png
  demo-footage/picture-lock/window-evidence/pickup.methodology.scoring-visible--f49.png
  demo-footage/picture-lock/window-evidence/pickup.methodology.scope-visible--f51.png
  demo-footage/picture-lock/window-evidence/pickup.instruction.input-visible--f22.png
  demo-footage/picture-lock/window-evidence/pickup.instruction.overlap-refused--f88.png
  demo-footage/picture-lock/window-evidence/terminal.mcp.command-visible--f69.png
  demo-footage/picture-lock/window-evidence/terminal.mcp.stdio-visible--f165.png
  demo-footage/picture-lock/window-evidence/terminal.mcp.policy-visible--f188.png
  demo-footage/picture-lock/window-evidence/terminal.mcp.proceed-visible--f203.png
  demo-footage/picture-lock/window-evidence/terminal.mcp.decline-visible--f401.png
  demo-footage/picture-lock/window-evidence/terminal.mcp.combined-visible--f557.png
  demo-footage/picture-lock/window-evidence/pickup.explorer.source-verified--f130.png
  demo-footage/picture-lock/window-evidence/pickup.market-three.legacy-visible--f111.png
  demo-footage/picture-lock/window-evidence/terminal.validation.command-visible--f90.png
  demo-footage/picture-lock/window-evidence/terminal.validation.result-visible--f391.png
  demo-footage/picture-lock/window-evidence/terminal.agreement.visible--f450.png
  demo-footage/picture-lock/window-evidence/terminal.rho.visible--f389.png
  demo-footage/picture-lock/window-evidence/terminal.web-tests.4-visible--f173.png
  demo-footage/picture-lock/window-evidence/terminal.core-tests.65-visible--f499.png
  demo-footage/picture-lock/window-evidence/terminal.forge.result-visible--f239.png
  demo-footage/picture-lock/window-evidence/terminal.sdk.command-visible--f301.png
  demo-footage/picture-lock/window-evidence/terminal.sdk.result-visible--f631.png
  demo-footage/picture-lock/window-evidence/terminal.sdk.close-visible--f689.png
  demo-footage/picture-lock/window-evidence/pickup.closing.product-visible--f131.png
  demo-video/capture/final-actions.json
  demo-video/capture/final-facts.json
  demo-video/capture/clean-edit-manifest.json
)
git add -- "${generated_paths[@]}"
expected_stage="$(printf '%s\n' "${generated_paths[@]}" | LC_ALL=C sort)"
test "$(git diff --cached --name-only | LC_ALL=C sort)" = "$expected_stage"
git commit -m "feat(video): lock reproducible clean picture source pack" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
test -z "$(git status --porcelain=v1 --untracked-files=all)"
```

Expected: this post-capture data commit contains only the explicitly enumerated canonical media, sanitized action logs, content-addressed source pack, source-window evidence PNGs, and three final registries. Recorder code, package metadata, the READY pickup manifest, and tests are byte-identical to their blobs at `CAPTURE_COMMIT`; any additional staged path or post-commit dirt blocks progress.


## Task 3: Compose the muted clean base and prove cadence

**Files:**
- Create: `demo-video/capture/scripts/compose-clean.mjs`
- Create: `demo-video/capture/scripts/lib/evidence-chain.mjs`
- Create: `demo-video/capture/test/compose-clean.integration.test.mjs`
- Create: `demo-video/capture/test/evidence-chain.test.mjs`
- Modify: `demo-video/capture/package.json`
- Modify: `demo-video/capture/.gitignore`

- [ ] **Step 1: Write a five-second synthetic integration test**

The test generates two 1920×1080 25fps VP8 fixtures with FFmpeg, trims 50 frames from each, calls `composeClean()`, probes the result, and asserts 100 frames, 25/1 cadence, BT.709 tags, no audio, and a result record containing SHA-256 for both inputs, the manifest, and the output.

```js
const mini = {
  schemaVersion: 3,
  fps: 25,
  width: 1920,
  height: 1080,
  targetFrames: 100,
  timeline: [
    { id: "a", kind: "browser", source: "a.webm", sourceStartFrame: 10, sourceEndFrame: 60, requiredActionIds: ["a.visible"], factIds: ["fact.a"] },
    { id: "b", kind: "terminal", source: "b.webm", sourceStartFrame: 20, sourceEndFrame: 70, requiredActionIds: ["b.visible"], factIds: ["fact.b"] }
  ]
};
const actions = { actions: [
  { id: "a.visible", source: "a.webm", sourceStartFrame: 10, sourceEndFrame: 60 },
  { id: "b.visible", source: "b.webm", sourceStartFrame: 20, sourceEndFrame: 70 },
]};
const facts = { facts: [
  { id: "fact.a", mode: "visible", actionIds: ["a.visible"] },
  { id: "fact.b", mode: "visible", actionIds: ["b.visible"] },
]};
```

- [ ] **Step 2: Run the integration test and confirm RED**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node --test test/compose-clean.integration.test.mjs
```

Expected: fail because `compose-clean.mjs` and `evidence-chain.mjs` do not exist.

- [ ] **Step 3: Implement deterministic source hashing and atomic JSON output**

`evidence-chain.mjs` exports:

```js
export async function hashJson(value) {
  return createHash("sha256").update(`${JSON.stringify(value, null, 2)}\n`).digest("hex");
}

export function assertSha256(value, label) {
  if (!/^[0-9a-f]{64}$/i.test(String(value))) throw new Error(`${label} is not SHA-256`);
  return value.toLowerCase();
}

export function linkEvidence({ manifestSha256, sourcePackSha256, actionsSha256, factsSha256, sources, cleanPictureSha256, packetSha256, decodedStreamSha256, cadenceProbeSha256, commit }) {
  assertSha256(manifestSha256, "manifest");
  assertSha256(sourcePackSha256, "source pack");
  assertSha256(actionsSha256, "actions");
  assertSha256(factsSha256, "facts");
  assertSha256(cleanPictureSha256, "clean picture");
  assertSha256(packetSha256, "packet stream");
  assertSha256(decodedStreamSha256, "decoded stream");
  assertSha256(cadenceProbeSha256, "cadence probe");
  for (const source of sources) assertSha256(source.sha256, source.id);
  return { schemaVersion: 2, manifestSha256, sourcePackSha256, actionsSha256, factsSha256, sources, cleanPictureSha256, packetSha256, decodedStreamSha256, cadenceProbeSha256, commit };
}
```

Use `sha256File()` and `writeJson()` from `scripts/lib/files.mjs`; never load video files fully into memory.

- [ ] **Step 4: Implement `composeClean()`**

For each resolved occurrence, run FFmpeg with `-vf buildClipFilter(clip) -frames:v frameCount -an` and encode a temporary H.264 High intermediate. Concatenate those intermediates, then make one high-quality clean base:

```text
-map 0:v:0 -an -sn -dn
-fps_mode passthrough -enc_time_base 1:25 -video_track_timescale 25000
-c:v libx264 -preset slow -crf 8
-profile:v high -level:v 4.2
-pix_fmt yuv420p
-color_range tv -color_primaries bt709 -color_trc bt709 -colorspace bt709
-x264-params force-cfr=1:keyint=50:min-keyint=50:scenecut=0
-movflags +faststart
```

Do not pass output `-r`, `fps`, `minterpolate`, or a CFR mode that may silently add/drop frames. The inputs and `setpts=N/(25*TB)` are already exact; `-fps_mode passthrough` must preserve all 3989 frames. `composeClean()` fails unless source-pack SHA, final-actions SHA, and final-facts SHA match the files used by `validateCleanEditManifest()`.

Write:

```text
runs/2026-08-20T1530Z-preview/picture-lock-work/clean-picture.mp4
runs/2026-08-20T1530Z-preview/picture-lock-work/clean-edit-result.json
```

The result contains `3989`, `25`, exact source/output frame ranges, each source SHA, source-pack/action/fact/manifest SHAs, clean-picture file SHA, H.264 packet-stream SHA, decoded yuv420p-frame SHA, cadence-probe JSON SHA, and `git rev-parse HEAD`. Generate the packet hash with `ffmpeg -i clean-picture.mp4 -map 0:v:0 -c copy -f hash -hash sha256 -` and decoded hash with `ffmpeg -i clean-picture.mp4 -map 0:v:0 -f rawvideo -pix_fmt yuv420p -f hash -hash sha256 -`. Fail on any media-contract field or cadence error.

- [ ] **Step 5: Add safe package commands and ignore generated work**

Add to `demo-video/capture/package.json`:

```json
{
  "compose:clean": "node scripts/compose-clean.mjs"
}
```

Add these lines to `.gitignore`:

```gitignore
runs/*/picture-lock-work/
tts-cache/
```

- [ ] **Step 6: Run the integration test and real clean compose**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node --test test/compose-clean.integration.test.mjs test/evidence-chain.test.mjs
npm run compose:clean -- --run runs/2026-08-20T1530Z-preview --manifest clean-edit-manifest.json
ffprobe -v error -count_frames \
  -show_entries stream=codec_type,codec_name,profile,level,width,height,pix_fmt,field_order,r_frame_rate,avg_frame_rate,nb_read_frames,bit_rate,color_range,color_space,color_transfer,color_primaries,sample_aspect_ratio,display_aspect_ratio:stream_disposition=attached_pic:stream_side_data \
  -show_entries format=duration -of json \
  runs/2026-08-20T1530Z-preview/picture-lock-work/clean-picture.mp4
ffprobe -v error -select_streams v:0 -show_frames \
  -show_entries frame=best_effort_timestamp_time,duration_time -of json \
  runs/2026-08-20T1530Z-preview/picture-lock-work/clean-picture.mp4 \
  > runs/2026-08-20T1530Z-preview/picture-lock-work/clean-cadence-frames.json
ffprobe -v error -select_streams v:0 -show_packets \
  -show_entries packet=dts_time,duration_time,size -of json \
  runs/2026-08-20T1530Z-preview/picture-lock-work/clean-picture.mp4 \
  > runs/2026-08-20T1530Z-preview/picture-lock-work/clean-cadence-packets.json
```

Expected: 3989 decoded frames and packets, exact 0.04-second decoded/packet cadence, strictly increasing packet DTS, 25/1, 159.56 seconds, H.264 High level 4.2, 1920×1080, SAR 1:1/DAR 16:9, yuv420p, progressive BT.709 limited range, no audio/subtitle/data/attachment stream, and no side data.

- [ ] **Step 7: Commit Task 3**

Run G0, then rerun `node --test demo-video/capture/test/compose-clean.integration.test.mjs demo-video/capture/test/evidence-chain.test.mjs` as the relevant capture tests. Only after both return zero:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add demo-video/capture/scripts/compose-clean.mjs demo-video/capture/scripts/lib/evidence-chain.mjs \
  demo-video/capture/test/compose-clean.integration.test.mjs demo-video/capture/test/evidence-chain.test.mjs \
  demo-video/capture/package.json demo-video/capture/.gitignore
git commit -m "feat(video): compose hash-bound native clean picture" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
```

## Task 4: Lock narration copy and offline scratch timing

**Files:**
- Modify: `demo-video/script.md`
- Create: `demo-video/capture/scripts/scratch-narration.mjs`
- Create: `demo-video/capture/test/narration-lock.test.mjs`
- Modify: `demo-video/capture/package.json`

- [ ] **Step 1: Write a failing narration-lock test**

The test parses `demo-video/script.md`, requires exactly 21 non-empty `---`-separated beats, exactly 332 whitespace-delimited words, and these truth-bearing strings:

```js
assert.match(fullText, /captured DreamDEX price binary/i);
assert.match(fullText, /separate curated reference/i);
assert.match(fullText, /After republish/i);
assert.doesNotMatch(fullText, /live DreamDEX|same venue|order submitted|provenance is complete/i);
```

It also injects a fake runner into `buildScratchNarration()` and asserts exactly 21 `say` calls, exactly 21 independent speech probes, exact `BEAT_WINDOWS`, two-frame headroom per beat, one ordered PCM concat, 3989 total frames, the voice-plan-compatible fields `canonicalNarrationSha256`, `scratchAudioSha256`, `speechDuration`, `paddedDuration:159.56`, 21 `id`/`textSha256`/`start`/`end` records plus frame metadata, and zero HTTP/fetch transport. Mutation tests reject one monolithic `say` call, a missing/reordered beat, a beat over budget, a timing/output SHA mismatch, a per-beat text-hash mismatch, non-finite/overlapping/regressing intervals, and a padded duration derived from the already padded WAV.

- [ ] **Step 2: Run the test and confirm RED**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node --test test/narration-lock.test.mjs
```

Expected: fail because the current script is not the accepted 332-word lock and `scratch-narration.mjs` is absent.

- [ ] **Step 3: Replace `demo-video/script.md` with the joint-lock narration**

Use exactly these 21 paragraphs, inserting a line containing `---` between every adjacent pair:

```text
Every event contract gives you a price. It does not tell you who could know first.

LevelField is DreamDEX’s pre-trade risk layer. It measures structural information asymmetry before a trader or agent takes a side.

Start with a captured DreamDEX price binary on Somnia Shannon. LevelField scores it three: low risk.

No participant controls the global reference price. The outcome is public, and disclosure nearly simultaneous.

Now change the event. This separate curated reference resolves on one person’s private decision.

The same engine returns ninety-five: high risk.

One person controls the outcome. No clear restriction stops an early knower from trading, so circuit breaker one sets a high-risk floor.

That three-to-ninety-five contrast is the product: who can know first, not which side will win.

It does not allege wrongdoing or detect live insider activity.

Under the interface, a model classifies five public dimensions against fixed anchors.

Evidence quotes must match the contract exactly. Code rejects instruction-like text aimed at the assessor.

Missing information defaults conservatively to level four.

Deterministic code then applies fixed weights, cross-dimension rules, and circuit breakers. The model never generates the score.

Here, an agent calls the real LevelField MCP server over standard input and output before acting.

The policy is visible: low or moderate risk can proceed; elevated or high risk is declined.

DreamDEX returns PROCEED at three. The separate individual-decision case returns DECLINE at ninety-five, with its reason.

After republish, each score will bind its band, five dimensions, method hash, timestamp, and immutable source on Somnia Shannon.

The verifier reads every field back and fails closed on anything missing or changed.

Across sixteen curated contracts, scores span three to ninety-five, with expected category ordering and a Spearman rho of point nine three.

Sixty-nine software and eight smart-contract tests pass. The official DreamDEX SDK independently cross-checks active-market discovery, read-only and without a private key.

We delivered eleven evidence-backed SDK and documentation findings. As DreamDEX grows, LevelField helps agents, venues, and traders know who can know before they do.
```

- [ ] **Step 4: Implement exact 21-beat offline scratch timing**

Never synthesize the 332 words as one `say` utterance: on this machine that path measures 159.465306 seconds and fails the old 159.36-second guard. Synthesize exactly one utterance per locked beat and pad each beat only to its matching picture slot. These are the immutable half-open beat windows and current Daniel@155 reference measurements:

| beat | output frames | slot frames / seconds | measured speech seconds |
|---:|---:|---:|---:|
| 1 | 0–139 | 139 / 5.56 | 5.354467 |
| 2 | 139–359 | 220 / 8.80 | 8.674286 |
| 3 | 359–546 | 187 / 7.48 | 7.255601 |
| 4 | 546–748 | 202 / 8.08 | 7.850295 |
| 5 | 748–914 | 166 / 6.64 | 6.433878 |
| 6 | 914–1002 | 88 / 3.52 | 3.295964 |
| 7 | 1002–1236 | 234 / 9.36 | 9.126576 |
| 8 | 1236–1401 | 165 / 6.60 | 6.393152 |
| 9 | 1401–1504 | 103 / 4.12 | 3.914739 |
| 10 | 1504–1656 | 152 / 6.08 | 5.969751 |
| 11 | 1656–1838 | 182 / 7.28 | 7.063084 |
| 12 | 1838–1938 | 100 / 4.00 | 3.774921 |
| 13 | 1938–2162 | 224 / 8.96 | 8.743855 |
| 14 | 2162–2337 | 175 / 7.00 | 6.784354 |
| 15 | 2337–2499 | 162 / 6.48 | 6.256508 |
| 16 | 2499–2714 | 215 / 8.60 | 8.360590 |
| 17 | 2714–2976 | 262 / 10.48 | 10.276372 |
| 18 | 2976–3115 | 139 / 5.56 | 5.336644 |
| 19 | 3115–3362 | 247 / 9.88 | 9.661723 |
| 20 | 3362–3673 | 311 / 12.44 | 12.201179 |
| 21 | 3673–3989 | 316 / 12.64 | 12.412245 |

The measured reference sum is 155.140184 seconds. Runtime measurements remain authoritative, but each beat must finish at least two video frames before its slot end: `speechDuration <= (slotFrames - 2) / 25`. A voice/OS drift that breaks that bound fails before picture render; it does not time-stretch, truncate, overlap, or silently change the rate.

Implement:

```js
export const BEAT_WINDOWS = Object.freeze([
  [0,139],[139,359],[359,546],[546,748],[748,914],[914,1002],[1002,1236],
  [1236,1401],[1401,1504],[1504,1656],[1656,1838],[1838,1938],[1938,2162],
  [2162,2337],[2337,2499],[2499,2714],[2714,2976],[2976,3115],[3115,3362],
  [3362,3673],[3673,3989],
]);

export async function buildScratchNarration({scriptPath, outputPath, timingPath, run = execFileAsync}) {
  const beats = (await readFile(scriptPath, "utf8")).split(/^---$/m).map((part) => part.trim()).filter(Boolean);
  if (beats.length !== 21) throw new Error("Scratch narration requires 21 beats");
  const segmentDir = path.join(path.dirname(outputPath), "segments");
  await mkdir(segmentDir, {recursive: true});
  const timing = [];
  for (const [index, text] of beats.entries()) {
    const [startFrame, endFrame] = BEAT_WINDOWS[index];
    const slotFrames = endFrame - startFrame;
    const stem = path.join(segmentDir, `beat-${String(index + 1).padStart(2, "0")}`);
    await run("/usr/bin/say", ["-v", "Daniel", "-r", "155", "-o", `${stem}.aiff`, text]);
    await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", `${stem}.aiff`, "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", `${stem}.speech.wav`]);
    const speechDurationSeconds = await probeDuration(`${stem}.speech.wav`);
    if (speechDurationSeconds > (slotFrames - 2) / 25) throw new Error(`Beat ${index + 1} exceeds its two-frame-safe slot`);
    await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", `${stem}.speech.wav`, "-af", `apad=whole_dur=${slotFrames / 25}`, "-t", String(slotFrames / 25), "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", `${stem}.slot.wav`]);
    timing.push({
      id: `beat-${String(index + 1).padStart(2, "0")}`,
      textSha256: sha256Text(text),
      start: startFrame / 25,
      end: startFrame / 25 + speechDurationSeconds,
      startFrame,
      endFrame,
      slotFrames,
      slotDurationSeconds: slotFrames / 25,
      speechDuration: speechDurationSeconds,
      speechEndFrame: startFrame + Math.ceil(speechDurationSeconds * 25),
      speechSha256: await sha256File(`${stem}.speech.wav`),
      slotSha256: await sha256File(`${stem}.slot.wav`),
    });
  }
  await concatPcmWavs(timing.map(({id}) => path.join(segmentDir, `${id}.slot.wav`)), outputPath, run);
  const canonicalNarration = beats.join("\n\n");
  const record = {
    schemaVersion: 1,
    canonicalNarrationSha256: sha256Text(canonicalNarration),
    scratchAudioSha256: await sha256File(outputPath),
    speechDuration: timing.at(-1).end,
    paddedDuration: 159.56,
    beats: timing,
    fps: 25,
    totalFrames: 3989,
    aggregateSpeechDuration: timing.reduce((sum, beat) => sum + beat.speechDuration, 0),
    scriptFileSha256: await sha256File(scriptPath),
  };
  await writeJsonAtomic(timingPath, record);
  return record;
}
```

`concatPcmWavs()` uses FFmpeg's concat demuxer with the 21 generated `*.slot.wav` files in numeric order and writes 48kHz stereo PCM s24le. It verifies exactly 7,658,880 PCM sample frames per channel/159.56 seconds after concat. `speechDuration` is the absolute end of beat 21 (approximately 159.332245 for the measured reference), while optional `aggregateSpeechDuration` is the sum of voiced segments (155.140184); neither is inferred from the padded WAV. Keep the unpadded per-beat WAV files under the ignored work directory so the final-voice plan can consume this JSON directly and derive provisional character timing inside each real beat speech interval.

Add to `demo-video/capture/package.json`:

```json
{
  "scratch:narration": "node scripts/scratch-narration.mjs"
}
```


- [ ] **Step 5: Run tests and scratch synthesis**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node --test test/narration-lock.test.mjs
npm run scratch:narration -- --run runs/2026-08-20T1530Z-preview --script ../script.md
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 \
  runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration.wav
jq '{canonicalNarrationSha256,scratchAudioSha256,speechDuration,paddedDuration,fps,totalFrames,beats:(.beats|length)}' \
  runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration-timing.json
```

Expected: 21 beat calls, every beat within its exact picture slot, timing JSON reports `25`, `3989`, `21`, `speechDuration` near the final spoken end 159.332245, optional aggregate speech near 155.140184, `paddedDuration` exactly 159.56 seconds, output WAV exactly 159.56 seconds, and ElevenLabs request count remains zero.

- [ ] **Step 6: Commit Task 4**

Run G0, then rerun `node --test demo-video/capture/test/narration-lock.test.mjs` with `ELEVENLABS_DISABLE_NETWORK=1` as the relevant capture test. Only after both return zero:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add demo-video/script.md demo-video/capture/scripts/scratch-narration.mjs \
  demo-video/capture/test/narration-lock.test.mjs demo-video/capture/package.json
git commit -m "feat(video): lock truthful offline narration timing" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
```

## Task 5: Define the restrained post manifest

**Files:**
- Create: `demo-video/capture/post-manifest.json`
- Create: `demo-video/capture/test/post-manifest.test.mjs`

- [ ] **Step 1: Write manifest tests before the manifest**

The test requires 12 camera moves, 7 callouts, exactly two short luminance transitions, integer half-open frames, maximum normal scale 1.18, hard ceiling 1.25, no overlapping contradictory provenance labels, no CSS/wall-clock animation fields, and source `picture-lock-work/clean-picture.mp4` only. Every camera move has an attack, a frozen hold, and an explicit cut-bound reset; it may not snap back while the same continuous source occurrence remains on screen.

```js
assert.equal(post.fps, 25);
assert.equal(post.frames, 3989);
assert.equal(post.cameraMoves.length, 12);
assert.equal(post.callouts.length, 7);
assert.deepEqual(post.transitions.map(({ startFrame, endFrame }) => [startFrame, endFrame]), [[2708, 2720], [2970, 2982]]);
assert.ok(post.cameraMoves.every((move) => Math.max(move.fromScale, move.toScale) <= 1.18));
assert.ok(post.cameraMoves.every((move) => move.fromScale === 1 && move.startFrame < move.endFrame && move.endFrame <= move.holdUntilFrame));
assert.deepEqual(post.cameraMoves.map(({id, holdUntilFrame}) => [id, holdUntilFrame]), [
  ["C01",359],["C02",748],["C03",1002],["C04",1401],["C05",1706],["C06",1838],
  ["C07",2038],["C08",2162],["C09",2714],["C10",2976],["C11",3362],["C12",3989],
]);
const fabricated = post.callouts.find((item) => item.id === "K04-fabricated");
assert.deepEqual([fabricated.startFrame, fabricated.endFrame], [1706, 1834]);
assert.ok(fabricated.lines.includes("Deliberately fabricated test input"));
const fabricatedVisible = mapActionToOutput(cleanEdit, finalActions, "pickup.instruction.input-visible");
assert.deepEqual(fabricatedVisible, [{startFrame:1706,endFrame:1751}]);
for (let frame = fabricatedVisible[0].startFrame; frame < fabricatedVisible[0].endFrame; frame++) {
  assert.ok(fabricated.startFrame <= frame && frame < fabricated.endFrame);
}
assert.ok(post.callouts.find((item) => item.id === "K05-no-order")?.lines.includes("Pre-action policy · no order submitted"));
assert.deepEqual(post.callouts.find((item) => item.id === "K03-scope")?.lines, ["Structural risk · not prediction", "No wrongdoing allegation · no live-insider detection"]);
```

The test decodes every S11b frame and combines the tracked DOM/action observation with OCR/token-region matching for the fabricated instruction text; every detected output frame must be inside `pickup.instruction.input-visible` and K04's half-open interval, and a one-frame K04 delay or early end fails. For every camera, unit-test evaluated transform values at `startFrame-1`, `startFrame`, `endFrame-1`, `endFrame`, `holdUntilFrame-1`, and `holdUntilFrame`: neutral before attack; exact `from*` at attack start; exact `to*` on the final attack frame and throughout hold; neutral only at `holdUntilFrame`, which must be a registered edit cut. The special C01/C02/C05 holds cross contiguous logical shot boundaries so the same source image never snaps back. Keep FFmpeg expression domains separate: generic filter `enable` expressions for callouts/transitions use `gte(n,start)*lt(n,end)`, while Task 7's `zoompan` x/y/zoom expressions use the filter's input-frame variable `in`. `between()` is forbidden because its inclusive end would add a frame.

- [ ] **Step 2: Run and confirm RED**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node --test test/post-manifest.test.mjs
```

Expected: fail because `post-manifest.json` is absent.

- [ ] **Step 3: Create exact camera, callout, and transition data**

Create `post-manifest.json` with:

```json
{
  "schemaVersion": 2,
  "fps": 25,
  "frames": 3989,
  "width": 1920,
  "height": 1080,
  "source": "picture-lock-work/clean-picture.mp4",
  "cameraMoves": [
    {"id":"C01","startFrame":15,"endFrame":130,"holdUntilFrame":359,"fromScale":1.00,"toScale":1.07,"fromCenter":[0.36,0.42],"toCenter":[0.36,0.42]},
    {"id":"C02","startFrame":415,"endFrame":535,"holdUntilFrame":748,"fromScale":1.00,"toScale":1.15,"fromCenter":[0.27,0.35],"toCenter":[0.27,0.35]},
    {"id":"C03","startFrame":815,"endFrame":995,"holdUntilFrame":1002,"fromScale":1.00,"toScale":1.14,"fromCenter":[0.27,0.36],"toCenter":[0.27,0.36]},
    {"id":"C04","startFrame":1248,"endFrame":1395,"holdUntilFrame":1401,"fromScale":1.00,"toScale":1.14,"fromCenter":[0.33,0.45],"toCenter":[0.68,0.45]},
    {"id":"C05","startFrame":1518,"endFrame":1645,"holdUntilFrame":1706,"fromScale":1.00,"toScale":1.13,"fromCenter":[0.35,0.38],"toCenter":[0.35,0.38]},
    {"id":"C06","startFrame":1720,"endFrame":1828,"holdUntilFrame":1838,"fromScale":1.00,"toScale":1.16,"fromCenter":[0.45,0.70],"toCenter":[0.45,0.70]},
    {"id":"C07","startFrame":1948,"endFrame":2028,"holdUntilFrame":2038,"fromScale":1.00,"toScale":1.15,"fromCenter":[0.34,0.66],"toCenter":[0.34,0.66]},
    {"id":"C08","startFrame":2050,"endFrame":2155,"holdUntilFrame":2162,"fromScale":1.00,"toScale":1.15,"fromCenter":[0.28,0.37],"toCenter":[0.28,0.37]},
    {"id":"C09","startFrame":2502,"endFrame":2705,"holdUntilFrame":2714,"fromScale":1.00,"toScale":1.16,"fromCenter":[0.42,0.52],"toCenter":[0.42,0.52]},
    {"id":"C10","startFrame":2725,"endFrame":2965,"holdUntilFrame":2976,"fromScale":1.00,"toScale":1.18,"fromCenter":[0.45,0.28],"toCenter":[0.45,0.28]},
    {"id":"C11","startFrame":3140,"endFrame":3350,"holdUntilFrame":3362,"fromScale":1.00,"toScale":1.16,"fromCenter":[0.45,0.45],"toCenter":[0.45,0.45]},
    {"id":"C12","startFrame":3735,"endFrame":3975,"holdUntilFrame":3989,"fromScale":1.00,"toScale":1.08,"fromCenter":[0.36,0.42],"toCenter":[0.36,0.42]}
  ],
  "callouts": [
    {"id":"K01-snapshot","startFrame":365,"endFrame":520,"lines":["Captured Shannon snapshot"],"tone":"neutral"},
    {"id":"K02-separate","startFrame":750,"endFrame":900,"lines":["Separate curated reference · not DreamDEX"],"tone":"neutral"},
    {"id":"K03-scope","startFrame":1404,"endFrame":1496,"lines":["Structural risk · not prediction","No wrongdoing allegation · no live-insider detection"],"tone":"neutral"},
    {"id":"K04-fabricated","startFrame":1706,"endFrame":1834,"lines":["Deliberately fabricated test input"],"tone":"editorial"},
    {"id":"K05-no-order","startFrame":2609,"endFrame":2708,"lines":["Pre-action policy · no order submitted"],"tone":"neutral"},
    {"id":"K06-provenance","startFrame":2720,"endFrame":2970,"phases":[{"startFrame":2720,"endFrame":2845,"lines":["Current · ScoreRegistry source verified"]},{"startFrame":2845,"endFrame":2970,"lines":["Future · provenance-complete republish"]}],"tone":"neutral"},
    {"id":"K07-fail-closed","startFrame":2978,"endFrame":3110,"lines":["Current · awaiting republish","Verifier policy · fail closed"],"tone":"neutral"}
  ],
  "transitions": [
    {"id":"T01-terminal-explorer","startFrame":2708,"endFrame":2720,"kind":"luminance-veil"},
    {"id":"T02-explorer-product","startFrame":2970,"endFrame":2982,"kind":"luminance-veil"}
  ]
}
```

All ranges are half-open. A camera interpolates from its `from*` keyframe at `startFrame` through its `to*` keyframe at `endFrame-1`, holds the exact terminal transform on `[endFrame, holdUntilFrame)`, and resets to the neutral full frame at the registered cut `holdUntilFrame`. Callouts and transition veils exist only on `[startFrame,endFrame)`. No post element changes the 3989-frame timeline.

- [ ] **Step 4: Run tests and commit**

Run `node --test test/post-manifest.test.mjs`, then execute G0 with that same capture test as the task-specific addition. Only after both return zero:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add demo-video/capture/post-manifest.json demo-video/capture/test/post-manifest.test.mjs
git commit -m "feat(video): lock restrained frame-driven post manifest" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
```

## Task 6: Build the independent Remotion light-post package

**Files:**
- Create: `demo-video/post/package.json`
- Create when the metadata-only gate succeeds: `demo-video/post/package-lock.json`
- Create: `demo-video/post/.gitignore`
- Create: `demo-video/post/tsconfig.json`
- Create: `demo-video/post/src/index.ts`
- Create: `demo-video/post/src/Root.tsx`
- Create: `demo-video/post/src/LevelFieldLightPost.tsx`
- Create: `demo-video/post/src/manifest.ts`
- Create: `demo-video/post/src/components/Camera.tsx`
- Create: `demo-video/post/src/components/Callout.tsx`
- Create: `demo-video/post/src/components/TransitionVeil.tsx`
- Create: `demo-video/post/scripts/license-gate.mjs`
- Create: `demo-video/post/scripts/remotion-license-owner-input.schema.json`
- Create: `demo-video/post/scripts/render.mjs`
- Create: `demo-video/post/test/manifest.test.mjs`
- Create: `demo-video/post/test/architecture.test.mjs`
- Create: `demo-video/post/test/license-gate.test.mjs`

- [ ] **Step 1: Write architecture and version tests**

Dependency-free tests require exact Remotion 4.0.514 and React 19.2.8 in `package.json`, forbid `animation:`, `transition:`, `setInterval`, `requestAnimationFrame`, standalone background-only scenes, and any source other than `clean-picture.mp4`. When `package-lock.json` exists they require every exact locked version; when the typed runtime reason is `metadata-lock-failed`, they require the lock to be absent and never import an installed package. They also require all transforms to derive from `useCurrentFrame()`. Create `demo-video/post/.gitignore` with exact entries `node_modules/`, `public/clean-picture.mp4`, `render-output/`, `smoke-output/`, `.tmp/`, and `*.mp4`; architecture tests run `git check-ignore` against representative clean-picture, full-render, smoke, crash-temp, and arbitrary post-package MP4 paths and fail if any is trackable.

- [ ] **Step 2: Run tests and confirm RED**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/post
node --test test/*.test.mjs
```

Expected: fail because the package is absent.

- [ ] **Step 3: Create the exact package and owner classification gate**

Create `package.json`:

```json
{
  "name": "@levelfield/demo-post",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "test": "node --test test/*.test.mjs",
    "typecheck": "tsc --noEmit",
    "smoke": "node scripts/render.mjs --smoke",
    "render": "node scripts/render.mjs"
  },
  "dependencies": {
    "@remotion/bundler": "4.0.514",
    "@remotion/renderer": "4.0.514",
    "remotion": "4.0.514",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "@types/react": "19.2.18",
    "@types/react-dom": "19.2.4",
    "typescript": "5.9.3"
  }
}
```

Before any package code is installed, attempt to generate the dependency lock with the workspace-pinned npm `11.4.2` in metadata-only mode and validate it by parsing JSON, not by trusting console output. `license-gate.mjs --record-unavailable` is dependency-free Node code; on an early failure it atomically creates an immutable discriminated `remotion-license-decision.json` with `status:"UNAVAILABLE"`, `ownerLicenseEligible:null`, the typed reason, command/output hash, and UTC time, plus a separate `remotion-runtime-status.json` with `runtimeAvailable:false`. It refuses to overwrite either record:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/post
WORK=../capture/runs/2026-08-20T1530Z-preview/picture-lock-work
LICENSE_DECISION="$WORK/remotion-license-decision.json"
RUNTIME_STATUS="$WORK/remotion-runtime-status.json"
mkdir -p "$WORK"
if (
  test "$(npm --version)" = 11.4.2 &&
  rm -rf node_modules &&
  npm install --package-lock-only --ignore-scripts --save-exact &&
  test ! -d node_modules &&
  node --input-type=module <<'NODE'
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
for (const [name, version] of Object.entries({
  "@remotion/bundler":"4.0.514", "@remotion/renderer":"4.0.514", remotion:"4.0.514",
  react:"19.2.8", "react-dom":"19.2.8", "@types/react":"19.2.18",
  "@types/react-dom":"19.2.4", typescript:"5.9.3",
})) assert.equal(lock.packages[`node_modules/${name}`]?.version, version, `${name} lock drift`);
NODE
); then
  PACKAGE_LOCK_SHA256="$(shasum -a 256 package-lock.json | awk '{print $1}')"
else
  rm -f package-lock.json
  node scripts/license-gate.mjs --record-unavailable \
    --reason metadata-lock-failed \
    --license-decision "$LICENSE_DECISION" \
    --runtime-status "$RUNTIME_STATUS"
fi
```

This first network boundary resolves registry metadata and writes `package-lock.json` only; it neither creates `node_modules` nor runs lifecycle scripts or downloads executable package code. A wrong npm version, metadata failure, missing lock entry, non-exact version, unexpected `node_modules`, or lock parse failure writes the immutable typed unavailable pair, leaves no lock to stage, and leaves the FFmpeg path unblocked. Tests inject each metadata failure and require Task 7's FFmpeg integration fixture to still render.

Before any owner classification, code install, bundle, or smoke render, fetch the license bytes from the version-pinned commit URL into the ignored work directory and verify the known bytes:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/post
WORK=../capture/runs/2026-08-20T1530Z-preview/picture-lock-work
LICENSE_DECISION="$WORK/remotion-license-decision.json"
RUNTIME_STATUS="$WORK/remotion-runtime-status.json"
if test ! -e "$LICENSE_DECISION"; then
  LICENSE_FILE="$WORK/remotion-license-v4.0.514.md"
  if curl --fail --location --proto '=https' --tlsv1.2 \
      https://raw.githubusercontent.com/remotion-dev/remotion/e9e612b2033803efb14b78c47ef7d5a482321e01/LICENSE.md \
      --output "$LICENSE_FILE" &&
    test "$(wc -c < "$LICENSE_FILE" | tr -d ' ')" = 2823 &&
    test "$(shasum -a 256 "$LICENSE_FILE" | awk '{print $1}')" = bd65083b940f61904f6ef298aade918a7cad72a3e35bc406e36fab365844b673; then
    : # continue to the owner-input instance below
  else
    node scripts/license-gate.mjs --record-unavailable \
      --reason license-fetch-or-hash-failed \
      --license-decision "$LICENSE_DECISION" \
      --runtime-status "$RUNTIME_STATUS"
  fi
fi
```

A retrieval, byte-count, TLS, or SHA failure records typed reason `license-fetch-or-hash-failed` exactly once and skips owner classification and package installation; it does not block Task 7's FFmpeg candidate. Tests force both a transport failure and a wrong-byte success response and require the immutable unavailable decision, derived runtime status, no install attempt, and a passing FFmpeg render.

`scripts/remotion-license-owner-input.schema.json` is a tracked validator contract, not owner evidence. Its complete schema is:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://levelfield.local/schemas/remotion-license-owner-input.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": ["schemaVersion","classifiedBy","classifiedAt","organizationTeamSize","licenseClass","licenseKeyMode","decisionText","ownerLicenseEligible"],
  "properties": {
    "schemaVersion": {"const": 1},
    "classifiedBy": {"const": "owner"},
    "classifiedAt": {"type":"string","format":"date-time","pattern":"Z$"},
    "organizationTeamSize": {"type":"integer","minimum":0},
    "licenseClass": {"type":"string","minLength":1},
    "licenseKeyMode": {"enum":["free-license","company-license","unavailable"]},
    "decisionText": {"type":"string","minLength":1},
    "ownerLicenseEligible": {"type":"boolean"}
  }
}
```

After reading the exact license bytes, the owner creates the separate ignored **data instance** `picture-lock-work/remotion-license-owner-input.json`. This command is the instance template: it has no schema keywords, takes every classification value from explicit owner input, JSON-escapes the decision, and atomically writes exactly the eight schema fields. No class, team size, key mode, decision, or availability value is inferred:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/post
WORK=../capture/runs/2026-08-20T1530Z-preview/picture-lock-work
LICENSE_DECISION="$WORK/remotion-license-decision.json"
if test -e "$LICENSE_DECISION"; then
  node scripts/license-gate.mjs --decision "$LICENSE_DECISION" --require-typed-unavailable
else
  : "${REMOTION_LICENSE_CLASS:?owner must set the actual license class}"
  : "${REMOTION_LICENSE_KEY_MODE:?owner must set free-license, company-license, or unavailable}"
  : "${REMOTION_ORGANIZATION_TEAM_SIZE:?owner must set the actual organization/team size}"
  : "${REMOTION_LICENSE_DECISION_TEXT:?owner must provide the complete decision text}"
  : "${REMOTION_OWNER_LICENSE_ELIGIBLE:?owner must set exactly true or false}"
  case "$REMOTION_ORGANIZATION_TEAM_SIZE" in ''|*[!0-9]*) exit 64;; esac
  case "$REMOTION_LICENSE_KEY_MODE" in free-license|company-license|unavailable) ;; *) exit 64;; esac
  case "$REMOTION_OWNER_LICENSE_ELIGIBLE" in true|false) ;; *) exit 64;; esac
  CLASSIFIED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  OWNER_INPUT="$WORK/remotion-license-owner-input.json"
  node --input-type=module - -- \
    "$OWNER_INPUT" "$CLASSIFIED_AT" "$REMOTION_ORGANIZATION_TEAM_SIZE" \
    "$REMOTION_LICENSE_CLASS" "$REMOTION_LICENSE_KEY_MODE" \
    "$REMOTION_LICENSE_DECISION_TEXT" "$REMOTION_OWNER_LICENSE_ELIGIBLE" <<'NODE'
import {renameSync, writeFileSync} from "node:fs";
const [, output, classifiedAt, teamSizeText, licenseClass, licenseKeyMode, decisionText, availableText] = process.argv.slice(2);
const instance = {
  schemaVersion: 1,
  classifiedBy: "owner",
  classifiedAt,
  organizationTeamSize: Number(teamSizeText),
  licenseClass,
  licenseKeyMode,
  decisionText,
  ownerLicenseEligible: availableText === "true",
};
const temporary = `${output}.tmp`;
writeFileSync(temporary, `${JSON.stringify(instance, null, 2)}\n`, {encoding: "utf8", mode: 0o600});
renameSync(temporary, output);
NODE
  node scripts/license-gate.mjs \
    --validate-owner-input "$OWNER_INPUT" \
    --owner-input-schema scripts/remotion-license-owner-input.schema.json
fi
```

Expected: validation prints one typed `owner-input-valid` result whose recomputed instance SHA is 64 lowercase hex and whose eight values equal the just-written file. A schema document mistakenly placed at `OWNER_INPUT`, a missing field, an extra field, a non-UTC time, or any inferred/defaulted value fails before license binding. Cross-field validation requires `ownerLicenseEligible:true` with key mode `free-license` or `company-license`, and requires `ownerLicenseEligible:false` with mode `unavailable`.

`license-gate.mjs --license-file ... --owner-input ... --owner-input-schema scripts/remotion-license-owner-input.schema.json --package-lock ... --output ...` reads the schema plus all three evidence inputs and writes `picture-lock-work/remotion-license-decision.json` once, atomically. The immutable derived record contains npm version `11.4.2`, the exact package version, tag commit, pinned source URL, license byte count/SHA, owner-input schema SHA, owner-input file SHA, full `decisionText` SHA, package-lock SHA, all validated owner fields including `licenseClass`, `licenseKeyMode`, and `ownerLicenseEligible`; none of those hashes is owner-entered. It validates the input against the whole schema, including `additionalProperties:false`, then independently checks `classifiedBy:"owner"`, UTC time, finite non-negative team size, non-empty license class and decision text, the key-mode/eligibility relationship, exact 4.0.514/React lock metadata, and the pinned 2823-byte license SHA. It never supplies a default class or assumes `individual`, and no later key/install/browser/test result may rewrite this owner decision. `test/license-gate.test.mjs` mutates each bound byte domain, adds an otherwise plausible ninth property and requires rejection via `additionalProperties:false`, and covers owner-selected free, company-key, and unavailable classes without encoding a default license choice. Because the gate vendors and re-hashes the actual inputs, its stale/source checks are evidence-backed rather than a bare attestation claim.

- [ ] **Step 4: Implement frame-driven components**

`Camera.tsx` selects the active attack/hold keyframe, uses Remotion `interpolate()` and `Easing.inOut(Easing.cubic)` only on `[startFrame,endFrame)`, freezes `toScale`/`toCenter` on `[endFrame,holdUntilFrame)`, and resets only at the declared cut. It applies `transformOrigin`, `scale`, and translation to one `OffthreadVideo`; transform tests cover every boundary frame to prevent a one-frame snap. `Callout.tsx` renders compact instrument-panel-neutral text over the real video with fixed LevelField gold/neutral tokens and half-open visibility. `TransitionVeil.tsx` uses frame interpolation only and never reaches opacity 1.

Core composition:

```tsx
export const LevelFieldLightPost: React.FC<Props> = ({manifest}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: "#080807", overflow: "hidden"}}>
      <Camera frame={frame} moves={manifest.cameraMoves}>
        <OffthreadVideo src={staticFile("clean-picture.mp4")} muted />
      </Camera>
      {manifest.callouts.map((callout) => <Callout key={callout.id} frame={frame} callout={callout} />)}
      {manifest.transitions.map((transition) => <TransitionVeil key={transition.id} frame={frame} transition={transition} />)}
    </AbsoluteFill>
  );
};
```

`Root.tsx` registers one composition only:

```tsx
<Composition id="LevelFieldLightPost" component={LevelFieldLightPost}
  durationInFrames={3989} fps={25} width={1920} height={1080} defaultProps={{manifest}} />
```

- [ ] **Step 5: Implement 10-second and 60-second smoke rendering**

`scripts/render.mjs --smoke` requires `--runtime-status` on every lock-producing call; it validates a qualified `true` status, resolves its repository-relative executable path, recomputes the executable SHA, and then passes that exact absolute path internally as `browserExecutable` to both `selectComposition()` and `renderMedia()` with `chromeMode:"headless-shell"`. Every `renderMedia()` call also receives an explicit `licenseKey`: exact public token `"free-license"` when the authenticated owner decision uses free mode, or the exact in-memory bytes read from the ignored owner company-key input when it uses company mode. The company-key file must be a regular non-symlink mode-0600 file inside `picture-lock-work`, and its SHA-256 must equal `runtimeStatus.licenseKeySha256`; runtime status/candidate/smoke artifacts record only repository-relative key-input path, mode, and SHA, never the value. It never accepts an omitted/null license key or runtime status and never calls a download helper. It copies the clean picture into `public/clean-picture.mp4`, bundles the project, and renders frames 0–249 and 2489–3988 to two temporary MP4s. The second range is exactly 60 seconds and its inclusive end stays inside the 0–3988 composition. It deletes the copied source in a `finally` block. Full render has the same required runtime-status-to-explicit-browser/license contract and writes a muted H.264 output under the capture run, not under source control. Tests monkey-patch the renderer API and fail if either browser argument drifts, if any `renderMedia()` call omits/changes `licenseKey`, if free mode does not use the official literal, if company mode does not re-hash the ignored input, if any persisted/logged bytes contain the company key, or if any code path invokes an implicit browser ensure/download after qualification.

- [ ] **Step 6: Classify first, then attempt the optional Remotion path**

For `licenseKeyMode:"company-license"`, the owner first writes the purchased key by a local secret-manager/editor flow to the ignored regular file `demo-video/capture/runs/2026-08-20T1530Z-preview/picture-lock-work/remotion-company-license-key.txt` with mode `0600`; the value is never placed in a shell argument, environment variable, plan, log, JSON, or git. Free mode creates no key file and uses Remotion's documented public token `free-license`. Unavailable mode creates neither.

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/post
WORK=../capture/runs/2026-08-20T1530Z-preview/picture-lock-work
LICENSE_DECISION="$WORK/remotion-license-decision.json"
RUNTIME_STATUS="$WORK/remotion-runtime-status.json"

if test ! -e "$LICENSE_DECISION"; then
  node scripts/license-gate.mjs \
    --license-file "$WORK/remotion-license-v4.0.514.md" \
    --owner-input "$WORK/remotion-license-owner-input.json" \
    --owner-input-schema scripts/remotion-license-owner-input.schema.json \
    --package-lock package-lock.json \
    --output "$LICENSE_DECISION"
fi

LICENSE_KEY_MODE="$(node scripts/license-gate.mjs --decision "$LICENSE_DECISION" --print-license-key-mode)"
LICENSE_KEY_ARGS=(--license-key-mode "$LICENSE_KEY_MODE")
case "$LICENSE_KEY_MODE" in
  free-license) ;;
  company-license)
    COMPANY_LICENSE_KEY_FILE="$WORK/remotion-company-license-key.txt"
    LICENSE_KEY_ARGS+=(--license-key-file "$COMPANY_LICENSE_KEY_FILE")
    ;;
  unavailable) ;;
  *) exit 1 ;;
esac

if test -e "$RUNTIME_STATUS"; then
  node scripts/license-gate.mjs --runtime-status "$RUNTIME_STATUS" --verify-runtime-status
elif test "$(node scripts/license-gate.mjs --decision "$LICENSE_DECISION" --print-owner-license-eligible)" != true || \
    test "$LICENSE_KEY_MODE" = unavailable; then
  node scripts/license-gate.mjs --record-runtime-unavailable \
    --decision "$LICENSE_DECISION" --runtime-status "$RUNTIME_STATUS" \
    --reason owner-ineligible-or-prerequisite-unavailable
else
  LOCK_SHA256_BEFORE="$(shasum -a 256 package-lock.json | awk '{print $1}')"
  if npm ci --ignore-scripts && \
    test "$(shasum -a 256 package-lock.json | awk '{print $1}')" = "$LOCK_SHA256_BEFORE"; then
    node scripts/license-gate.mjs --qualify-runtime \
      --decision "$LICENSE_DECISION" \
      --runtime-status "$RUNTIME_STATUS" \
      --browser-root node_modules/.remotion \
      "${LICENSE_KEY_ARGS[@]}" \
      --source "$WORK/clean-picture.mp4" \
      --manifest ../capture/post-manifest.json
  else
    node scripts/license-gate.mjs --record-runtime-unavailable \
      --decision "$LICENSE_DECISION" --runtime-status "$RUNTIME_STATUS" \
      --reason package-install-or-lock-drift
  fi
fi
```

Expected: the license decision is immutable. `remotion-runtime-status.json` separately binds its SHA and records `ownerLicenseEligible`, `licenseKeyMode`, `licenseKeyInputPath:null` plus SHA-256 of literal `free-license` in free mode, or repository-relative ignored company-key path plus its SHA-256 in company mode, then metadata, install, browser, tests, typecheck, bundle, and both smoke stages, with exact per-stage status/evidence hashes and final `runtimeAvailable`. The company key value is absent from every artifact; tests scan recursively for the fixture secret and fail on any occurrence. `npm ci --ignore-scripts` is the second network boundary and must preserve the lock bytes. During `--qualify-runtime`, the only browser network boundary is one `ensureBrowser({chromeMode:"headless-shell"})` call made from the fixed `demo-video/post` cwd, so Remotion 4.0.514 installs under the fixed ignored `demo-video/post/node_modules/.remotion` root. Qualification reads `node_modules/@remotion/renderer/dist/browser/get-chrome-download-url.js`, proves its single `TESTED_VERSION` literal is `149.0.7790.0`, records that source file's SHA, requires the returned executable to be inside the fixed root, and records its repository-relative path and SHA. It then runs tests, typecheck, bundle, and smoke with that exact executable and explicit license key passed to every `renderMedia()` call. The runtime status, each smoke result, and any later Remotion candidate result all bind the same tested-version source SHA, executable path/SHA, license-key mode/input SHA, chrome mode, download-boundary timestamp/source, and license-decision SHA. No implicit third browser lookup/download, system browser, pre-existing executable, or implicit/null license key is accepted.

Any install, browser, TESTED_VERSION, executable path/SHA, test, typecheck, bundle, or smoke failure atomically writes one derived `runtimeAvailable:false` runtime status with a typed stage reason, leaves the immutable owner decision untouched, and is not retried in G0 or Task 7. Metadata/license failures already produced the same runtime discriminator without requiring a lock or `node_modules`. Task 7 always continues with FFmpeg; only a runtime status whose every stage is evidence-bound `PASS` permits the optional Remotion candidate. Integration fixtures cover metadata failure, license-fetch/hash failure, install failure, browser mismatch, and smoke failure and require a successful FFmpeg candidate in every case.

The one-shot status writer has exactly two terminal operations at the fixed path: `--record-runtime-qualified --runtime-status "$RUNTIME_STATUS"` after every stage passes, or `--record-runtime-unavailable --runtime-status "$RUNTIME_STATUS" --reason <typed-reason>` after the first failed stage. `--qualify-runtime` owns those calls and maps failures to exactly `browser-ensure-failed`, `browser-tested-version-mismatch`, `browser-provenance-mismatch`, `post-tests-failed`, `typecheck-failed`, `bundle-failed`, or `smoke-failed`; the surrounding shell uses the already shown `owner-ineligible-or-prerequisite-unavailable` and `package-install-or-lock-drift` reasons. Both terminal operations use exclusive create plus atomic rename and return success after a validated unavailable record so FFmpeg proceeds; only inability to persist/verify the status is fatal. Once `RUNTIME_STATUS` exists, no code re-enters install, `ensureBrowser`, or status qualification. G0 may rerun tests/typecheck/smoke only for a previously qualified `true` status and must use its fixed explicit browser; a `false` status runs dependency-free verification only.

- [ ] **Step 7: Commit Task 6**

Run G0 including its exact availability-aware post branch. The `true` branch must use the already locked install and pass test/typecheck/smoke; the `false` branch must pass only the dependency-free contract tests and typed-unavailable verifier and must not run `npm ci`, typecheck, bundle, or smoke. Only after the selected branch returns zero:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
post_paths=(
  demo-video/post/.gitignore
  demo-video/post/package.json
  demo-video/post/tsconfig.json
  demo-video/post/src/index.ts
  demo-video/post/src/Root.tsx
  demo-video/post/src/LevelFieldLightPost.tsx
  demo-video/post/src/manifest.ts
  demo-video/post/src/components/Camera.tsx
  demo-video/post/src/components/Callout.tsx
  demo-video/post/src/components/TransitionVeil.tsx
  demo-video/post/scripts/license-gate.mjs
  demo-video/post/scripts/remotion-license-owner-input.schema.json
  demo-video/post/scripts/render.mjs
  demo-video/post/test/manifest.test.mjs
  demo-video/post/test/architecture.test.mjs
  demo-video/post/test/license-gate.test.mjs
)
if test -f demo-video/post/package-lock.json; then
  post_paths+=(demo-video/post/package-lock.json)
else
  node demo-video/post/scripts/license-gate.mjs \
    --runtime-status demo-video/capture/runs/2026-08-20T1530Z-preview/picture-lock-work/remotion-runtime-status.json \
    --require-typed-unavailable --require-reason metadata-lock-failed
fi
git add -- "${post_paths[@]}"
test "$(git diff --cached --name-only | LC_ALL=C sort)" = \
  "$(printf '%s\n' "${post_paths[@]}" | LC_ALL=C sort)"
test -z "$(git diff --cached --name-only -- demo-video/post | grep -E '\.(mp4|webm)$|public/clean-picture\.mp4|render-output/|smoke-output/|\.tmp/' || true)"
git commit -m "feat(video): add independent Remotion light-post layer" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
test -z "$(git status --porcelain=v1 --untracked-files=all)"
```

## Task 7: Render a delivery picture with a shared FFmpeg fallback

**Files:**
- Create: `demo-video/capture/scripts/post-picture.mjs`
- Create: `demo-video/capture/scripts/post-ffmpeg.mjs`
- Create: `demo-video/capture/test/post-picture.test.mjs`
- Modify: `demo-video/capture/package.json`

- [ ] **Step 1: Write renderer-selection and encode-argument tests**

Tests inject fake Remotion and FFmpeg runners. They assert the lock-producing `renderer=auto` path always produces the FFmpeg candidate and reads only the immutable `remotion-runtime-status.json` to decide whether to attempt Remotion; it never derives availability from the owner license decision. A Remotion candidate is legal only when the runtime status and every bound qualification stage are `PASS` and the subsequent full-render attempt succeeds. Missing/false/stale runtime status, metadata or license failure, owner ineligibility, install failure, bundling failure, TESTED_VERSION/browser/executable mismatch, or either smoke failure yields one valid FFmpeg candidate with `runtimeAvailable:false` and the matching typed reason. A failure during the later full Remotion render instead preserves the already qualified `runtimeAvailable:true` record byte-for-byte, emits the immutable failed full-render-attempt evidence described below, and yields the sole FFmpeg candidate with `runtimeAvailable:true` and no `fallbackReason`. The successful qualified fixture requires both FFmpeg and Remotion results to record `runtimeAvailable:true`; tests reject a mutated runtime status, a missing/forged attempt record, a failure record accompanied by a Remotion candidate, and `fallbackReason` on either true-runtime FFmpeg result. Single-renderer modes remain focused diagnostics. They also require the final delivery arguments:

```text
-map 0:v:0 -an -sn -dn -frames:v 3989
-fps_mode passthrough -enc_time_base 1:25 -video_track_timescale 25000
-c:v libx264 -preset slow -profile:v high -level:v 4.2
-b:v 16M -minrate 16M -maxrate 16M -bufsize 32M
-x264-params nal-hrd=cbr:force-cfr=1:filler=1:keyint=50:min-keyint=50:scenecut=0
-pix_fmt yuv420p -color_range tv -color_primaries bt709 -color_trc bt709 -colorspace bt709
-movflags +faststart
```

The argument test explicitly rejects output `-r`, `-fps_mode cfr`, a standalone `fps` conversion filter, `minterpolate`, `tpad`, or any frame duplication/drop option. It also imports `buildZoompan()` and asserts its output ends in `:d=1:fps=25:s=1920x1080`, uses `gte(in,start)*lt(in,end)` in every zoom/x/y camera expression, contains every camera `holdUntilFrame`, and contains no `gte(n,` in the `zoompan` expression. A separate overlay/callout argument test requires generic filter `enable=gte(n,start)*lt(n,end)` and rejects `in` in that domain. Run both generated filters through FFmpeg 8.0.1 on a short synthetic clip: `in` must parse in `zoompan`, whereas using `n` there produces `Undefined constant`; the generic `enable` expression must parse with `n`. Playwright fixtures set the fixed browser-root environment and inject the source-pack executable; they reject an unset/different root, default-cache access, implicit install/download, omitted `executablePath`, executable/source-descriptor/package-lock SHA drift, and symlink escape. Candidate-path tests require both renderer and the first 16 hex characters of the completed file SHA; a second renderer can never overwrite the first candidate.

- [ ] **Step 2: Run and confirm RED**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node --test test/post-picture.test.mjs
```

Expected: missing module failure.

- [ ] **Step 3: Implement the shared-manifest fallback**

`post-ffmpeg.mjs` reads the same camera/callout/transition data. `buildZoompan()` is unit-tested to emit the exact native tail `zoompan=...:d=1:fps=25:s=1920x1080`; its frame-number expressions implement the same attack/hold/reset keyframes and use the `zoompan`-domain expression `gte(in,start)*lt(in,end)`. Callout plates are rendered once as transparent 1920×1080 PNGs in a clean Playwright context using the explicit executable from Task 2's validated source-pack provenance. The process requires `PLAYWRIGHT_BROWSERS_PATH` to resolve exactly to the ignored repository root `demo-video/capture/.playwright-browsers`, joins the recorded relative executable path beneath it, rejects symlink escape, recomputes the executable/source-descriptor/package-lock SHA values, and launches with explicit `executablePath`; it forbids a default cache, channel, fallback lookup, or implicit download. Generic overlay `enable` expressions then use `gte(n,start)*lt(n,end)` for their declared half-open range. Transition veils use the same generic `n` domain with `fade`/`overlay` for `[2708,2720)` and `[2970,2982)` only. The fallback must never render a standalone plate, hide the real source, insert a frame, or reset a camera before `holdUntilFrame`.

- [ ] **Step 4: Implement `post-picture.mjs` and delivery normalization**

Each renderer output goes through one final FFmpeg normalization with the arguments above, first to a private temporary file and then atomically renamed after hashing. Write distinct, immutable candidates and records:

```text
runs/2026-08-20T1530Z-preview/picture-lock-work/candidates/post-candidate-remotion-${candidateSha256.slice(0,16)}.mp4
runs/2026-08-20T1530Z-preview/picture-lock-work/candidates/post-candidate-remotion-${candidateSha256.slice(0,16)}.json
runs/2026-08-20T1530Z-preview/picture-lock-work/candidates/post-candidate-ffmpeg-${candidateSha256.slice(0,16)}.mp4
runs/2026-08-20T1530Z-preview/picture-lock-work/candidates/post-candidate-ffmpeg-${candidateSha256.slice(0,16)}.json
```

Each candidate result records renderer, clean-picture SHA, post-manifest SHA, intermediate SHA, candidate SHA, packet-stream SHA, decoded-stream SHA, cadence-probe SHA, exact frame count, and complete media validation result. Every result binds both the immutable license-decision SHA and derived runtime-status SHA. The always-present FFmpeg result copies the runtime status's actual boolean `runtimeAvailable`: when false it must include the exact typed `fallbackReason`; when true it must omit `fallbackReason` entirely because FFmpeg is then the required baseline candidate, not a fallback. A false status without a reason or a true status with any reason fails. A Remotion result requires `runtimeAvailable:true`, both smoke hashes, `chromeMode:"headless-shell"`, the tested-version source path/SHA and value `149.0.7790.0`, the qualified executable's repository-relative path/SHA, and the exact `licenseKeyMode`/key-input SHA from runtime status without the key value; its render calls receive the browser and license key explicitly and may not call `ensureBrowser`.

Every qualified true-runtime full-render call also publishes one no-clobber content-addressed record at `picture-lock-work/remotion-full-render-attempts/<recordSha256>.json`. Its closed schema is `{schemaVersion:1,kind:"remotion-full-render-attempt",status:"PASS"|"FAILED",runtimeStatusSha256,licenseDecisionSha256,licenseKeyMode,licenseKeySha256,browserExecutableSha256,cleanPictureSha256,postManifestSha256,startedAt,endedAt,commandSha256,result}`. PASS `result` is exactly `{candidatePath,candidateSha256,candidateResultPath,candidateResultSha256}`. FAILED `result` is exactly `{errorName,errorMessageSha256,stderrSha256,exitCode}` and contains no raw error/key text. The record is written from the completed attempt, its filename stem must equal the SHA-256 of its exact bytes, and a small post-result pointer binds its path/SHA; no failure path rewrites `remotion-runtime-status.json`. Task 8 reviews one candidate when runtime is false, one FFmpeg candidate plus the validated FAILED attempt when runtime is true but full render failed, or both candidates plus the PASS attempt when full render succeeded. It writes a hash-bound `post-selection.json` and byte-copies—not re-encodes—the chosen candidate to `picture-lock-work/post-picture.mp4`; no candidate, attempt, or result is deleted or overwritten.

Add to `demo-video/capture/package.json`:

```json
{
  "post:picture": "node scripts/post-picture.mjs"
}
```

- [ ] **Step 5: Run tests and the availability-aware render path**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node --test test/post-picture.test.mjs
npm run post:picture -- --run runs/2026-08-20T1530Z-preview --renderer auto \
  --runtime-status runs/2026-08-20T1530Z-preview/picture-lock-work/remotion-runtime-status.json
```

Expected: one content-addressed FFmpeg candidate always exists; a second Remotion candidate exists only after a fully qualified runtime status and is rendered with its already hashed explicit browser. Every produced candidate has 3989 decoded frames, native 25/1 cadence, H.264 High, yuv420p, BT.709 limited range, 12–20 Mbps, and no audio. No stable `post-picture.mp4` exists until Task 8 selection; do not mix pictures.

- [ ] **Step 6: Commit Task 7**

Run G0, then rerun `node --test demo-video/capture/test/post-picture.test.mjs` as the relevant capture test. Only after both return zero:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add demo-video/capture/scripts/post-picture.mjs demo-video/capture/scripts/post-ffmpeg.mjs \
  demo-video/capture/test/post-picture.test.mjs demo-video/capture/package.json
git commit -m "feat(video): render normalized post picture with fallback" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
```

## Task 8: Bind selection, checkpoints, visible actions, privacy, and human review

**Files:**
- Create: `demo-video/capture/final-checkpoints.json`
- Create: `demo-video/capture/review-protocol.json`
- Create: `demo-video/capture/scripts/lib/checkpoint-gates.mjs`
- Create: `demo-video/capture/scripts/lib/privacy-gates.mjs`
- Create: `demo-video/capture/scripts/review-picture.mjs`
- Create: `demo-video/capture/test/checkpoint-gates.test.mjs`
- Create: `demo-video/capture/test/privacy-gates.test.mjs`
- Modify: `demo-video/capture/package.json`

- [ ] **Step 1: Write failing selection, checkpoint, review, and privacy tests**

Checkpoint tests require every cut boundary ±2 frames, every named checkpoint, every sequence assertion, a PNG SHA per extracted frame, source/action/fact mapping to the exact clean-edit and post-manifest hashes, and a manual review bound to the selected muted `post-picture.mp4` video-packet SHA plus narration-script SHA. Candidate selection is also manual and hash-bound: it names every produced immutable candidate, its result hash, both the immutable owner-license-decision and derived runtime-status records/hashes, the optional full-render-attempt path/SHA, protocol version, reviewer identity, UTC timestamp, notes, verdict, and selected candidate SHA. FFmpeg is always required. Remotion is required exactly when the validated true runtime has a PASS full-render attempt; a true runtime with a FAILED attempt requires sole FFmpeg plus the immutable failure record, while a false runtime requires sole FFmpeg plus its typed unavailable reason. A stale hash, missing/forged attempt, attempt/candidate contradiction, runtime-status mutation, inconsistent candidate count, `FAIL`, `UNREVIEWED`, or `N/A` blocks selection.

The required final gate IDs exactly include the downstream voice importer’s set—`media`, `cadence`, `color`, `bitrate`, `decode`, `blankFrames`, `loadingFrames`, `sourceHashes`, `actionWindows`, `facts`, `privacy`, `checkpoints`, `legibility720p`, `silentReview`, and `expertReview`—plus required `calloutOcclusion`. Every gate references a separate evidence JSON SHA plus `videoPacketSha256`, `reviewedPostPictureSha256`, `inputScriptSha256`, `postManifestSha256`, `checkpointsSha256`, and `reviewProtocolSha256`; the primary picture identity is the H.264 packet-payload hash, not a whole-file MP4 hash that changes when audio is muxed. A status string without matching evidence cannot pass. Human gates additionally require a non-empty reviewer identity, UTC timestamp, protocol version, observation notes, and `PASS`. The generator may create only `UNREVIEWED` stubs. Mutation tests reject a missing evidence file, evidence SHA mismatch, stale packet/post-picture/script/post/checkpoint hash, wrong protocol version, absent reviewer/timestamp/notes, and any `FAIL`, `UNREVIEWED`, or `N/A` verdict.

Privacy tests use two explicit profiles. `tracked-public` rejects `xi-api-key`, `Authorization:`, `.env`, `API_KEY=`, `TOKEN=`, mnemonic/seed/private-key context, paths matching `/Users/[A-Za-z0-9._-]+/`, browser history, personal notifications, and any absolute origin path in the tracked action logs or redacted evidence. `private-raw` still rejects every secret pattern but permits a local capture path; only the SHA-256 of that private raw log may enter a tracked `*.actions.json`. Both profiles allow the public registry address, public transaction hashes, market IDs, and the phrase `No order submitted`.

- [ ] **Step 2: Run tests and confirm RED**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node --test test/checkpoint-gates.test.mjs test/privacy-gates.test.mjs
```

Expected: missing module failure.

- [ ] **Step 3: Create the exact named checkpoint manifest**

`final-checkpoints.json` contains exactly this object; every frame is zero-based and inside the real 3989-frame picture:

```json
{
  "schemaVersion": 2,
  "pictureFrames": 3989,
  "checkpoints": [
    {"id":"hero-open","frame":25,"assertions":["real LevelField hero","no action label"]},
    {"id":"captured-snapshot","frame":385,"assertions":["captured snapshot callout","timestamped state"]},
    {"id":"dreamdex-three","frame":450,"assertions":["DreamDEX score 3","Low band"]},
    {"id":"public-outcome","frame":650,"assertions":["public-outcome explanation","real score-3 market"]},
    {"id":"real-comparison-a","frame":775,"assertions":["stable real 3-versus-95 comparison","comparison-clean source"]},
    {"id":"separate-curated","frame":835,"assertions":["separate curated reference callout","real curated detail"]},
    {"id":"curated-ninety-five","frame":950,"assertions":["score 95","High band"]},
    {"id":"cb1","frame":1040,"assertions":["CB-1 visible","curated source"]},
    {"id":"d1-evidence","frame":1185,"assertions":["D1 evidence quote visible","verbatim curated evidence"]},
    {"id":"real-comparison-b","frame":1280,"assertions":["stable real 3-versus-95 comparison","no landing carousel detour"]},
    {"id":"scope","frame":1450,"assertions":["real What this is not UI","K03 exact two-line scope disclaimer"]},
    {"id":"dimensions","frame":1560,"assertions":["five dimensions","real Methodology UI"]},
    {"id":"public-anchor","frame":1680,"assertions":["D1 public-anchor table","no runner label"]},
    {"id":"instruction-overlap-rejection","frame":1810,"assertions":["real instruction-overlap error","Not scored","not detected:false quote-not-found"]},
    {"id":"level-four","frame":1885,"assertions":["Conservative default","level four"]},
    {"id":"fixed-scoring","frame":1975,"assertions":["fixed scoring logic","circuit breakers"]},
    {"id":"assess-result","frame":2100,"assertions":["real Assess score 95","CB-1"]},
    {"id":"mcp-command","frame":2205,"assertions":["real MCP command","no runner label"]},
    {"id":"mcp-stdio","frame":2260,"assertions":["stdio transport","real terminal"]},
    {"id":"mcp-policy","frame":2400,"assertions":["pre-action policy","proceed/decline rule"]},
    {"id":"proceed-three","frame":2520,"assertions":["PROCEED","score 3"]},
    {"id":"decline-ninety-five","frame":2570,"assertions":["DECLINE","score 95"]},
    {"id":"no-order","frame":2650,"assertions":["combined result","No order submitted"]},
    {"id":"source-verified","frame":2750,"assertions":["ScoreRegistry","exact match","no loading state"]},
    {"id":"future-provenance","frame":2880,"assertions":["future provenance-complete label","fully loaded Explorer"]},
    {"id":"awaiting-republish","frame":3020,"assertions":["LEGACY PROVENANCE","awaiting republish","K07 fail-closed policy"]},
    {"id":"validation-command","frame":3150,"assertions":["real validation command","no runner label"]},
    {"id":"validation-result","frame":3230,"assertions":["n=16","range 3–95"]},
    {"id":"agreement","frame":3280,"assertions":["16/16 band agreement"]},
    {"id":"rho","frame":3330,"assertions":["rho 0.930"]},
    {"id":"web-tests-four","frame":3400,"assertions":["4 web tests visible","not mislabeled as 69"]},
    {"id":"core-tests-sixty-five","frame":3460,"assertions":["65 core software tests visible","not mislabeled as 69"]},
    {"id":"forge-tests","frame":3500,"assertions":["8 Forge tests"]},
    {"id":"sdk-command","frame":3575,"assertions":["SDK cross-check command","read-only"]},
    {"id":"sdk-result","frame":3640,"assertions":["SDK active-market discovery result","no private key"]},
    {"id":"sdk-close","frame":3700,"assertions":["SDK evidence close","no runner label"]},
    {"id":"hero-close","frame":3750,"assertions":["clean real hero","no label"]},
    {"id":"product-proof-close","frame":3850,"assertions":["clean real product proof","no label"]},
    {"id":"clean-end","frame":3975,"assertions":["clean real LevelField frame","no loading or label"]}
  ],
  "sequenceAssertions": [
    {"id":"software-total-69","frames":[3400,3460],"assertions":["first frame visibly proves 4 web tests","second frame visibly proves 65 core tests","hashed root test transcript proves 4 + 65 = 69","beat 20 may state 69 only as this composite"]}
  ]
}
```

No single S20 frame is permitted to claim that it visibly shows 69: S20a proves 4, S20b proves 65, and the sequence assertion plus cited test transcript proves the composite 69. Likewise, CB-1 and the D1 evidence quote use separate checkpoints because their registered source intervals do not overlap.

- [ ] **Step 4: Implement candidate selection, per-scene evidence, and the evidence ledger**

Create tracked `review-protocol.json` with `protocolVersion:"picture-lock-review-v1"`, the exact sixteen required gate IDs above, half-open frame semantics, 100% and 720p playback requirements, and these human procedures:

- `silentReview`: watch the selected 159.56-second picture muted, from frame 0 to 3988 at 100% size in one uninterrupted pass; record every static-feeling hold, jump, cursor/action mismatch, loading state, label, blank, and transition/camera snap.
- `expertReview`: watch the same picture with the locked scratch narration, consult the fact/action packet, and verify every narrated, visible, composite, and editorial claim against its registered evidence; specifically verify the 4→65→69 sequence, negative live-insider sentence, future-tense provenance, and real instruction-overlap rejection.
- `legibility720p`: watch an actual 1280×720 downscale at normal playback and inspect all checkpoints; tiny copy that only passes at 1080p fails.
- `calloutOcclusion`: inspect every callout start, midpoint, end-1, and the underlying fact region; any covered product value or control fails.

`review-picture.mjs` first extracts checkpoint/cut sheets for every immutable candidate. With two candidates a human compares both. With one FFmpeg candidate the human verifies either the bound typed runtime-unavailable evidence or, when runtime remains true, the immutable FAILED full-render-attempt/error hashes; it never invents a missing candidate or rewrites qualification. The reviewer writes `review/post-selection.json` containing the complete one-or-two candidate/result path/SHA list, license-decision SHA, runtime-status SHA, full-render-attempt path/SHA/status when present, selected candidate SHA, reviewer, UTC timestamp, protocol version/hash, observation notes, and `PASS`; the tool validates that record and only then byte-copies the selected candidate to a same-directory temporary file, fsyncs it, proves its SHA equals the selected candidate SHA, and atomically renames it to `picture-lock-work/post-picture.mp4`. It never re-encodes, deletes, or overwrites a candidate/attempt, and a pre-existing stable path is replaced only by this verified atomic rename.

For the selected picture, extract every named checkpoint, every sequence frame, every cut boundary at `-2,-1,0,+1,+2`, every callout boundary/midpoint, and for each of the 36 clean-edit shots its first five frames, last five frames, and every 25th frame. Browser scenes must match their tracked action-log `readyAssertions` and `loadingSelectorsAbsent`; terminal scenes must match their registered command/result state. No skeleton/loading state is accepted in final footage, and generic pixel motion is never treated as readiness evidence. This per-scene first/tail procedure is mandatory even when a whole-film sample looks clean.

Write and hash:

```text
runs/2026-08-20T1530Z-preview/picture-lock-work/review/post-selection.json
runs/2026-08-20T1530Z-preview/picture-lock-work/review/checkpoints/*.png
runs/2026-08-20T1530Z-preview/picture-lock-work/review/scene-edges/*.png
runs/2026-08-20T1530Z-preview/picture-lock-work/review/720p.mp4
runs/2026-08-20T1530Z-preview/picture-lock-work/review/evidence/*.json
runs/2026-08-20T1530Z-preview/picture-lock-work/review/review-ledger.json
```

The evidence directory has one file per required gate. Every file contains the input packet/post-picture/script/post/checkpoint/protocol SHAs, its own observed artifacts and PNG hashes, tool or human protocol version, UTC timestamp, and verdict; the ledger references the file path and computed SHA rather than copying a caller-controlled status. Each ledger gate uses the downstream-compatible shape `{id,status:"PASS",reviewedVideoPacketSha256,evidence:[...]}`, and `reviewedVideoPacketSha256` must equal the selected muted picture's H.264 packet-payload hash. Every evidence member has `sha256` and an `inputHashes` object; manual members add `kind:"manual"`, `reviewer`, `protocolVersion`, `reviewedAt`, and `verdict:"PASS"`, while automated members add `kind:"automated"`, `toolVersion`, `commandSha256`, and a non-null `measurement`. OCR and VMAF are optional diagnostics and may be absent; their absence never satisfies loading, legibility, or occlusion. The tool creates automated evidence only after its validator runs and may prepare human evidence only as `UNREVIEWED`; it has no code path that synthesizes a human `PASS`.

The reviewer—not the tool—then writes `review/final-review-input.json` with exactly these top-level keys and no extras:

```json
{
  "schemaVersion": 1,
  "reviewer": {"name": "non-empty human identity"},
  "reviewedAt": "ISO-8601 UTC ending Z",
  "protocolVersion": "picture-lock-review-v1",
  "inputHashes": {
    "videoPacketSha256": "64 lowercase hex computed from post-picture.mp4 H.264 packet payloads",
    "reviewedPostPictureSha256": "64 lowercase hex computed from the muted post-picture.mp4 file",
    "inputScriptSha256": "64 lowercase hex computed from script.md",
    "postManifestSha256": "64 lowercase hex computed from post-manifest.json",
    "checkpointsSha256": "64 lowercase hex computed from final-checkpoints.json",
    "reviewProtocolSha256": "64 lowercase hex computed from review-protocol.json"
  },
  "reviews": {
    "silentReview": {
      "verdict": "PASS",
      "startFrame": 0,
      "endFrameExclusive": 3989,
      "continuousPass": true,
      "checks": [
        {"id":"staticFeeling","verdict":"PASS","notes":"non-empty observed note"},
        {"id":"jumps","verdict":"PASS","notes":"non-empty observed note"},
        {"id":"cursorActionSync","verdict":"PASS","notes":"non-empty observed note"},
        {"id":"loadingOrSkeleton","verdict":"PASS","notes":"non-empty observed note"},
        {"id":"automationLabels","verdict":"PASS","notes":"non-empty observed note"},
        {"id":"blankFrames","verdict":"PASS","notes":"non-empty observed note"},
        {"id":"transitionCameraSnaps","verdict":"PASS","notes":"non-empty observed note"}
      ]
    },
    "expertReview": {
      "verdict": "PASS",
      "beatIds": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],
      "factIds": ["product.real_ui","product.pre_trade_layer","dreamdex.timestamped_snapshot","dreamdex.score_3","dreamdex.public_outcome","comparison.separate_sources","curated.reference","curated.score_95","curated.cb_1","curated.verbatim_evidence","curated.no_clear_restriction","product.scope_limit","methodology.five_dimensions","methodology.public_anchors","verification.instruction_overlap_rejected","verification.not_scored","methodology.conservative_default","methodology.deterministic_scoring","assess.score_95","assess.cb_1","mcp.pre_action_policy","mcp.no_order_submitted","somnia.registry_deployed","somnia.source_verified","provenance.not_complete","provenance.future_attestation_fields","provenance.legacy","provenance.fail_closed","validation.n_16","validation.range_3_95","validation.rho_0_930","agreement.band_16_16","tests.web_4","tests.software_65","tests.software_69","tests.contract_8","sdk.read_only_crosscheck","product.agents_venues_traders"],
      "checks": [
        {"id":"software-4-plus-65-equals-69","verdict":"PASS","notes":"non-empty observed note"},
        {"id":"negative-live-insider-sentence","verdict":"PASS","notes":"non-empty observed note"},
        {"id":"future-provenance-fields","verdict":"PASS","notes":"non-empty observed note"},
        {"id":"instruction-overlap-rejection","verdict":"PASS","notes":"non-empty observed note"}
      ]
    },
    "legibility720p": {
      "verdict": "PASS",
      "width": 1280,
      "height": 720,
      "checkpointIds": ["hero-open","captured-snapshot","dreamdex-three","public-outcome","real-comparison-a","separate-curated","curated-ninety-five","cb1","d1-evidence","real-comparison-b","scope","dimensions","public-anchor","instruction-overlap-rejection","level-four","fixed-scoring","assess-result","mcp-command","mcp-stdio","mcp-policy","proceed-three","decline-ninety-five","no-order","source-verified","future-provenance","awaiting-republish","validation-command","validation-result","agreement","rho","web-tests-four","core-tests-sixty-five","forge-tests","sdk-command","sdk-result","sdk-close","hero-close","product-proof-close","clean-end"],
      "checks": "exactly one {checkpointId,verdict:'PASS',notes:non-empty} object per checkpointId"
    },
    "calloutOcclusion": {
      "verdict": "PASS",
      "calloutIds": ["K01-snapshot","K02-separate","K03-scope","K04-fabricated","K05-no-order","K06-provenance","K07-fail-closed"],
      "checks": "exactly one {calloutId,sampleFrames:[start,floor((start+end-1)/2),end-1],verdict:'PASS',notes:non-empty} object per calloutId"
    }
  }
}
```

Quoted descriptive values above are schema constraints, not literal accepted values. `review-picture.mjs --accept-final-review` requires `additionalProperties:false` at every object level; recomputes every `inputHashes` value itself, including the selected muted file hash and its H.264 packet-payload hash; requires exact set equality for the 21 beats, every current fact ID, all 39 checkpoint IDs, seven callout IDs, seven silent checks, and four expert checks; verifies each callout's three sample frames from `post-manifest.json`; rejects an empty note or any verdict other than `PASS`; and writes the four manual evidence files plus the rebuilt sixteen-gate ledger atomically. It never derives a `PASS` from the prepared stub or from an unchecked status string. `--verify-final-review` re-hashes the accepted input, all evidence files, and the selected picture and independently re-runs the ledger validator.

Add the exact command to `demo-video/capture/package.json`; `checkpoint-gates.test.mjs` loads the package and asserts this exact value:

```json
{"scripts":{"review:picture":"node scripts/review-picture.mjs"}}
```

- [ ] **Step 5: Run tests, select a candidate, and perform all required reviews**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node --test test/checkpoint-gates.test.mjs test/privacy-gates.test.mjs
npm run review:picture -- --run runs/2026-08-20T1530Z-preview \
  --candidates runs/2026-08-20T1530Z-preview/picture-lock-work/candidates \
  --prepare-selection
# inspect every produced candidate sheet; for sole FFmpeg also inspect typed runtime-unavailable or immutable full-render-failure evidence
npm run review:picture -- --run runs/2026-08-20T1530Z-preview \
  --apply-selection runs/2026-08-20T1530Z-preview/picture-lock-work/review/post-selection.json
npm run review:picture -- --run runs/2026-08-20T1530Z-preview \
  --video runs/2026-08-20T1530Z-preview/picture-lock-work/post-picture.mp4 \
  --script ../script.md --prepare-final-review
# after the named human reviewer completes final-review-input.json from direct observation:
npm run review:picture -- --run runs/2026-08-20T1530Z-preview \
  --video runs/2026-08-20T1530Z-preview/picture-lock-work/post-picture.mp4 \
  --script ../script.md \
  --accept-final-review runs/2026-08-20T1530Z-preview/picture-lock-work/review/final-review-input.json
npm run review:picture -- --run runs/2026-08-20T1530Z-preview \
  --video runs/2026-08-20T1530Z-preview/picture-lock-work/post-picture.mp4 \
  --script ../script.md --verify-final-review
node --test test/checkpoint-gates.test.mjs test/privacy-gates.test.mjs
```

Expected: preparation initially blocks with `UNREVIEWED`; this task does not stop there. After direct inspection, `--accept-final-review`, `--verify-final-review`, and the rerun tests all pass with exactly sixteen evidence-bound `PASS` gates, so Task 9 receives no stub. `N/A` is never accepted. Any visible S21 join/label, loading Explorer frame, instruction false-negative, comparison carousel detour, or camera snap requires a new canonical pickup or manifest correction followed by a full hash/review refresh—never a still, slide, frozen frame, or unreviewed substitution.

- [ ] **Step 6: Commit Task 8**

Run G0, then rerun `node --test demo-video/capture/test/checkpoint-gates.test.mjs demo-video/capture/test/privacy-gates.test.mjs` as the relevant capture tests and re-run `review:picture --verify-final-review` against the selected hash. Only after every command returns zero:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add demo-video/capture/final-checkpoints.json demo-video/capture/review-protocol.json \
  demo-video/capture/scripts/lib/checkpoint-gates.mjs demo-video/capture/scripts/lib/privacy-gates.mjs \
  demo-video/capture/scripts/review-picture.mjs demo-video/capture/test/checkpoint-gates.test.mjs \
  demo-video/capture/test/privacy-gates.test.mjs demo-video/capture/package.json
git commit -m "test(video): bind picture lock to visual privacy and human review" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
```

## Task 9: Mux and verify the immutable offline picture-lock candidate

**Files:**
- Create: `demo-video/capture/scripts/verify-picture-lock.mjs`
- Create: `demo-video/capture/test/picture-lock.test.mjs`
- Create: `demo-video/capture/scripts/lib/immutable-artifact.mjs`
- Create: `demo-video/capture/test/immutable-artifact.test.mjs`
- Modify: `demo-video/.gitignore`
- Modify: `demo-video/capture/package.json`

- [ ] **Step 1: Write failing verifier tests**

Tests require:

- one dependency-free canonical artifact implementation with exact exports `stableJson(value)`, `publishImmutableJsonNoClobber({outputPath,value,validate,allowedRoot})`, and `recoverImmutableArtifactTemps({outputPath,validateBytes,allowedRoot,recoveryRoot})`;
- `stableJson()` recursively sorts plain-object keys lexicographically, preserves array order, emits compact JSON without a trailing newline, and rejects cycles, non-plain objects, accessors, sparse arrays, `undefined`, functions, symbols, bigint, non-finite numbers, and negative zero rather than relying on lossy `JSON.stringify` coercion;
- every published JSON byte domain is exactly UTF-8 `stableJson(value) + "\n"`; publication is same-directory temp `wx`/0600 → full write → file fsync → no-replace hard link → directory fsync → temp unlink → second directory fsync, and never opens or renames over the canonical path;
- recovery recognizes only its owned temp-name grammar, revalidates complete candidates, no-clobber publishes a sole valid orphan, and writes hash-bound recovery/quarantine evidence for partial, stale, conflicting, symlinked, or ambiguous temps; injected crashes at every boundary leave the canonical path absent or complete, never partial;
- exact selected-candidate/post-picture SHA equality and the complete 3989-frame media contract, including finite 12–20Mbps bitrate, codec/profile/level, pixel/color/range/SAR/DAR/field tags, one video stream only, no attachment/rotation side data, decoded cadence, and packet cadence;
- scratch narration WAV and timing JSON hashes with exact 159.56-second padded duration, plus final muxed narration normalized to approximately -18 LUFS and no higher than -2 dBTP;
- AAC-LC 48kHz stereo after mux;
- Fast Start (`moov` before `mdat`);
- zero decode errors, blank runs, visible loading checkpoints, or timestamp regressions;
- all required action/fact windows inside actual trims;
- all sixteen review gates—including the downstream-required fifteen IDs plus `calloutOcclusion`—`PASS`, each backed by a matching evidence-file SHA and the current `videoPacketSha256`, muted post-picture SHA, script/post/checkpoint/protocol hashes;
- current truth state `timestamped_snapshot`, `sameVenue:false`, `pre_action_policy`, `orderSubmitted:false`, real instruction-overlap rejection, composite software result 4+65=69, and legacy provenance in future tense;
- final MP4 named `levelfield-demo-picture-lock.mp4`, never `final`.
- candidate mode publishes only immutable `status:"candidate"` bytes under a content-addressed path and never writes `picture-lock.json` or the tracked evidence file;

Negative candidate tests cover a zero-frame file, VFR cadence, shifted first PTS, late final PTS-plus-duration, missing media field, `null`/`NaN`/`Infinity` bitrate, extra audio/subtitle/data/attachment stream in the muted picture, nonempty rotation side data, stale source/action/fact/post/review/script SHA, a gate evidence packet hash mismatch, human review `N/A`, a mux whose video packet or decoded-stream hash differs from the selected post picture, candidate overwrite/rename, and any candidate object labeled `picture-lock` or containing future `candidateSha256`/`factReview` fields. Task 9 tests neither import nor acceptance and imports no future mailbox helper.

- [ ] **Step 2: Run and confirm RED**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node --test test/immutable-artifact.test.mjs test/picture-lock.test.mjs
```

Expected: missing immutable-artifact and verifier modules.

- [ ] **Step 3: Implement mux and verification**

Create `scripts/lib/immutable-artifact.mjs` first with exactly these public signatures:

```js
export function stableJson(value) { /* validated recursive lexicographic-key compact JSON, no LF */ }
export async function publishImmutableJsonNoClobber({outputPath, value, validate, allowedRoot}) { /* canonical bytes + durable no-replace publish */ }
export async function recoverImmutableArtifactTemps({outputPath, validateBytes, allowedRoot, recoveryRoot}) { /* validate/recover or hash-journal every owned temp */ }
```

`publishImmutableJsonNoClobber()` resolves `allowedRoot` and the output parent with `realpath`, rejects escape/symlink destinations, validates before serialization, and renders `Buffer.from(stableJson(value) + "\n", "utf8")`. It creates an owned same-directory temp using `open(...,"wx",0o600)`, writes the whole buffer, fsyncs/closes, publishes with `link(temp,outputPath)`, fsyncs the parent, unlinks the temp, and fsyncs again. On `EEXIST`, it accepts only a regular non-symlink winner with byte-identical canonical bytes that passes `validate`; a different/partial winner is never overwritten. `recoverImmutableArtifactTemps()` scans only `.<basename>.immutable-<uuid>.tmp`; a sole complete valid temp may finish the same no-replace sequence, while every partial/stale/conflicting/ambiguous temp is preserved with a `wx`+fsynced record under `<recoveryRoot>/<sha256>/`. Tests inject temp-create, mid-write, file-fsync, link, both directory-fsync, cleanup, concurrent-winner, and recovery crashes and then require an absent-or-complete canonical file and no unaccounted owned temp.

`verify-picture-lock.mjs` first re-hashes the selected candidate, muted `post-picture.mp4`, its H.264 packet payloads, script, post manifest, checkpoints, review protocol, and every gate evidence file. It validates each gate against that `videoPacketSha256` by rerunning its evidence contract; it never binds a picture gate to the later audio-muxed whole-file SHA and never turns an upstream `status:"PASS"` into a pass by itself. Only then does it mux:

```text
ffmpeg -i post-picture.mp4 -i scratch/narration.wav
-map 0:v:0 -map 1:a:0 -map_metadata -1 -map_chapters -1 -sn -dn -c:v copy
-af loudnorm=I=-18:TP=-2:LRA=11,apad,atrim=end=159.56,asetpts=N/SR/TB
-c:a aac -b:a 192k -ar 48000 -ac 2
-movflags +faststart
demo-video/levelfield-demo-picture-lock.mp4
```

The picture and padded audio are independently proven to be exactly 159.56 seconds before mux, so no `-t` or `-shortest` truncation is used. After mux, compute the source and master H.264 packet payload hashes with `-map 0:v:0 -c copy -f hash -hash sha256 -` and decoded yuv420p hashes with `-map 0:v:0 -f rawvideo -pix_fmt yuv420p -f hash -hash sha256 -`; both pairs must be identical, proving the final mux copied rather than altered the picture stream. The sixteen upstream picture gates remain reviews of the muted post picture, carried forward by this identical packet hash—not recharacterized as reviews of the audio-muxed MP4.

Candidate mode renders `{schemaVersion:1,status:"candidate",commit,media,gates}` only through `stableJson()+LF`, hashes those exact bytes, runs temp recovery, and publishes through `publishImmutableJsonNoClobber()` at `picture-lock-work/picture-lock-candidates/<candidateSha256>.json`, where the filename equals the exact file SHA. It binds source pack, clean manifest/result, post manifest/candidate/selection/result/full-render-attempt, narration script/WAV/timing JSON, facts, actions, checkpoints, review protocol, every review evidence file, review ledger, cadence probes, and the Task 8 review HEAD by SHA-256. Top-level `commit` is that already reviewed Task 8 HEAD and stays fixed even if Task 9/10 documentation or packet generation runs at a later HEAD. `media` records the muted `post-picture.mp4` path/SHA, muxed `levelfield-demo-picture-lock.mp4` path/SHA, one shared `videoPacketSha256`, and the equal pre/post-mux decoded-video hashes; the two whole-file MP4 SHAs are expected to differ because the latter contains audio. Top-level `gates`—never `pictureGates`—is an array of exactly sixteen downstream-compatible `{id,status,reviewedVideoPacketSha256,evidence}` entries: all fifteen voice-required IDs plus `calloutOcclusion`. Every entry's `reviewedVideoPacketSha256` equals `media.videoPacketSha256`, and its evidence also binds the reviewed muted-post SHA.

Candidate mode creates neither `picture-lock-work/picture-lock.json` nor `demo-video/picture-lock-evidence.json` and never labels the candidate `picture-lock`, `final`, or `submission-master`. Repeating candidate mode with byte-identical inputs reuses the identical hash-named file; different existing bytes or any overwrite/rename attempt fails. Task 10's accept mode alone may no-clobber publish the accepted JSON plus its byte-identical tracked evidence copy after authenticating a candidate-bound Claude verdict whose 21 line items all pass. Add `levelfield-demo-picture-lock.mp4` and `levelfield-demo-final.mp4` to `demo-video/.gitignore`; the full masters remain local/upload artifacts rather than oversized git blobs.

Add to `demo-video/capture/package.json`:

```json
{
  "verify:picture-lock": "node scripts/verify-picture-lock.mjs"
}
```

- [ ] **Step 4: Run the full offline verifier**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node --test test/immutable-artifact.test.mjs test/picture-lock.test.mjs
CANDIDATE_PATH="$(node scripts/verify-picture-lock.mjs --candidate --print-candidate-path \
  --run runs/2026-08-20T1530Z-preview \
  --picture runs/2026-08-20T1530Z-preview/picture-lock-work/post-picture.mp4 \
  --audio runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration.wav \
  --output ../levelfield-demo-picture-lock.mp4)"
test -f "$CANDIDATE_PATH"
test "$(basename "$CANDIDATE_PATH" .json)" = "$(shasum -a 256 "$CANDIDATE_PATH" | awk '{print $1}')"
test "$(node -e 'process.stdout.write(JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8")).status)' "$CANDIDATE_PATH")" = candidate
test ! -e runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json
test ! -e ../picture-lock-evidence.json
```

Expected: candidate verification PASS; 159.56 seconds; exactly 3989 decoded video frames; H.264 High/BT.709 limited-range/25fps/12–20Mbps; AAC-LC 48kHz stereo; identical pre/post-mux packet and decoded hashes; all sixteen evidence-bound gates PASS; no blank/loading/secret/action/fact failures; no accepted-status artifact exists.

- [ ] **Step 5: Commit Task 9**

Run G0, then rerun `node --test demo-video/capture/test/immutable-artifact.test.mjs demo-video/capture/test/picture-lock.test.mjs` and the exact `--candidate --print-candidate-path` command above as the relevant capture gates. Only after every command returns zero:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add demo-video/capture/scripts/verify-picture-lock.mjs demo-video/capture/test/picture-lock.test.mjs \
  demo-video/capture/scripts/lib/immutable-artifact.mjs demo-video/capture/test/immutable-artifact.test.mjs \
  demo-video/capture/package.json demo-video/.gitignore
test "$(git diff --cached --name-only | LC_ALL=C sort)" = "$(printf '%s\n' \
  demo-video/.gitignore demo-video/capture/package.json \
  demo-video/capture/scripts/lib/immutable-artifact.mjs demo-video/capture/scripts/verify-picture-lock.mjs \
  demo-video/capture/test/immutable-artifact.test.mjs demo-video/capture/test/picture-lock.test.mjs | LC_ALL=C sort)"
git commit -m "feat(video): produce reviewed offline picture candidate" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
```

## Task 10: Request Claude’s line-by-line candidate verdict, accept, and document the lock

**Files:**
- Modify after Claude PASS: `demo-video/README.md`
- Modify after Claude PASS: `demo-video/capture/README.md`
- Create after Claude PASS: `demo-video/picture-lock-evidence.json`
- Create: `demo-video/capture/scripts/fact-review-packet.mjs`
- Create: `demo-video/capture/scripts/evidence-artifacts.mjs`
- Create: `demo-video/capture/scripts/lib/mailbox-evidence.mjs`
- Read: `demo-video/capture/scripts/lib/immutable-artifact.mjs`
- Read: `demo-video/capture/test/immutable-artifact.test.mjs`
- Create: `demo-video/capture/test/fact-review-packet.test.mjs`
- Create: `demo-video/capture/test/evidence-artifacts.test.mjs`
- Create: `demo-video/capture/test/mailbox-evidence.test.mjs`
- Create: `demo-video/capture/test/fixtures/native-fact-review-request.json`
- Create: `demo-video/capture/test/fixtures/native-picture-lock.json`
- Create: `demo-video/capture/test/fixtures/native-picture-lock-candidate.json`
- Create: `demo-video/capture/test/fixtures/build-native-contract-fixtures.mjs`
- Modify: `demo-video/capture/scripts/verify-picture-lock.mjs`
- Modify: `demo-video/capture/test/picture-lock.test.mjs`
- Modify: `docs/collab/inbox-claude.md`

- [ ] **Step 1: Write a fact-packet test**

The generated packet has 21 narration beats and cites exact supporting paths for every numerical claim:

```text
DreamDEX 3 -> data/scores/index.json plus data/scores/0x0000000000000000000000000000000000000000000000000000000000004746.json and demo-video/capture/scripts/browser-flows.mjs
curated 95/CB-1 -> data/scores/curated-celebrity-breakup.json and demo-footage/MANIFEST.md
beat 7 no-clear-restriction -> data/scores/curated-celebrity-breakup.json#/dimensions/2/levelLabel and #/dimensions/2/reasoning
beat 15 policy threshold -> scripts/agent-demo.ts#L98-L99 and #L118-L121
beat 17 future field set -> contracts/src/ScoreRegistry.sol#L15-L35, scripts/publish-scores.ts#L115-L144, scripts/github-provenance.ts#L21-L48, and contracts/README.md#L60-L80
16, range 3–95, rho 0.930 -> docs/validation.md
16/16 -> docs/agreement.md
69 software tests -> README.md plus hashed current outputs proving 4 web + 65 core = 69
8 contract tests -> contracts/README.md plus current forge test output
11 findings -> docs/submission.md and docs/sdk-feedback-report.md
```

The test rejects an uncited number, `same venue`, an affirmative order-submission claim, present-tense complete provenance, or an affirmative live-feed/live-detection claim. It must explicitly accept the locked negative sentence `It does not allege wrongdoing or detect live insider activity.` Do not use a blanket `/live/i` or `/order submitted/i` test: strip/parse the approved negated clauses first, then reject affirmative forms such as `LevelField detects live insider activity`, `uses a live DreamDEX feed`, or `an order was submitted`.

The shared literal `test/fixtures/native-fact-review-request.json` freezes the exact raw request keys, sibling `reviewRequestSource` envelope keys, and the three response binding fields (`reviewRequestId`, `ordinal`, `artifactSha256`) for the native writer and final-voice reader. `fact-review-packet.test.mjs` covers only the 21-line evidence packet. `mailbox-evidence.test.mjs` exercises the dependency-free generic request/reply protocol in temporary git repositories for both `replyKind` values; `evidence-artifacts.test.mjs` covers the fact-specific CLI, envelope assembly, and import integration using that shared module. Request fixtures require a lowercase RFC 4122 UUID v4 `reviewRequestId`, positive integer `ordinal`, exact `artifactSha256`, a Codex-attributed mailbox-only commit that introduced the request, and highest-ordinal/latest-for-artifact selection. Reply fixtures cover (a) a commit that introduces the targeted reply with exact Claude author/co-author attribution and (b) a path-only Codex commit whose introduced Claude entry contains the exact explicit handoff line defined below. Negative fixtures cover untracked mailboxes, missing/non-ancestor/invalid commits, reused UUIDs, duplicate ordinals, an older request selected after a newer request for the same artifact, request/reply ID or artifact mismatch, reply-kind heading/schema crossover, a target entry already present in the commit's parent, working reply bytes different from the recorded reply commit blob, absent/wrong attribution, a Codex reply commit without handoff, handoff outside the target entry, extra paths in a Codex handoff commit, and forged commit/blob values. A correction fixture commits request UUID A/ordinal 1, a valid committed `FAIL` reply (and separately a malformed reply), then a fresh UUID B/ordinal 2 request for the same artifact and a `PASS` reply to B; only B is importable, while all history remains append-only. A clean-clone fixture re-runs validation from committed bytes only and requires identical request, payload, and entry hashes.

- [ ] **Step 2: Implement and generate the review packet**

`fact-review-packet.mjs` writes a Markdown table under `picture-lock-work/fact-review-packet.md` with columns: beat, exact narration, exact evidence path and heading, candidate picture frame range, and truth-state note. It records the script SHA, immutable candidate JSON SHA, muxed picture MP4 SHA from that candidate, `reviewedCommit` copied from `candidate.commit` (the Task 8 review HEAD), and a separate informational `packetGeneratedAtCommit = git rev-parse HEAD`. The packet rejects `status:"picture-lock"`; this review stage accepts only a hash-named `status:"candidate"` whose basename equals its bytes. Later documentation or packet-generation commits never rewrite the reviewed commit identity.

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
CANDIDATE_PATH="$(node scripts/verify-picture-lock.mjs --candidate --print-candidate-path \
  --run runs/2026-08-20T1530Z-preview \
  --picture runs/2026-08-20T1530Z-preview/picture-lock-work/post-picture.mp4 \
  --audio runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration.wav \
  --output ../levelfield-demo-picture-lock.mp4)"
node scripts/fact-review-packet.mjs \
  --script ../script.md \
  --picture-lock-candidate "$CANDIDATE_PATH" \
  --facts final-facts.json \
  --output runs/2026-08-20T1530Z-preview/picture-lock-work/fact-review-packet.md
```

`scripts/lib/mailbox-evidence.mjs` is the single dependency-free owner of mailbox byte parsing, request-entry construction, request-commit verification, and reply-commit verification. It exports `appendReviewRequest({repoRoot,mailboxPath,requestKind,inputs,now})`, `verifyCommittedReviewRequest({repoRoot,mailboxPath,mailboxCommit,requestKind,artifactSha256})`, and the exact shared reply API below. `requestKind` is the closed internal enum `"fact" | "final-ack"`; longer operation names exist only in `evidence-artifacts.mjs`, whose exact adapters are `--append-fact-review-request` → `"fact"` and `--append-final-qa-review-request` → `"final-ack"`. No generic `--append-review-request` CLI exists. The shared fixture and unit tests use only the short enum. `inputs` is a closed discriminated object: fact accepts only `{pictureLockCandidatePath,scriptPath}`, while final-ack accepts only `{finalMp4Path,finalSrtPath,candidateLedgerPath,factVerdictPath,attemptChainPath}`. The `--append-final-qa-review-request` adapter therefore requires an explicit `--attempt-chain <immutable-path>`; it never guesses a mutable sibling, and missing, mismatched, symlinked, or hash-drifted attempt-chain inputs fail. The helper reads `reviewedCommit` from the immutable hash-named picture-lock candidate or final-master candidate ledger, hashes every named regular non-symlink file itself, generates the UUIDv4 internally, derives the next no-gap ordinal from committed mailbox history, and accepts injected `now` only in tests. Neither CLI may supply a request ID, ordinal, artifact hash, context hash, or request heading.

`evidence-artifacts.mjs` imports mailbox protocol exports only from `./lib/mailbox-evidence.mjs` and imports `stableJson`, `publishImmutableJsonNoClobber`, and `recoverImmutableArtifactTemps` only from `./lib/immutable-artifact.mjs`. It owns the fact/final-ack CLI plus local envelope assembly; every ignored JSON request/verdict envelope is first rebuilt as `stableJson(value) + "\n"`, recovered only through the shared owned-temp protocol, and then published through the shared no-clobber writer. Direct `writeFile`, overwrite rename, pretty JSON, and a second canonicalizer are forbidden. Request envelopes use immutable request-specific paths `picture-lock-work/fact-review-requests/<reviewRequestId>.json`; a correction request therefore creates a new UUID path rather than colliding with or replacing ordinal 1. `--verify-fact-review-request` accepts `--output-dir` and returns only the exact published/reused path on stdout when `--print-envelope-path` is present. `--resolve-fact-review-request-envelope --envelope-dir ... --picture-lock-candidate ... --print-envelope-path` scans only UUID-named regular non-symlink files, validates every envelope from its recorded detached request commit, ignores valid history for other candidate hashes, and returns the unique highest no-gap ordinal for the requested candidate; ties, gaps in that candidate's chain, invalid bytes, a stale commit, or a non-envelope file fail. `--import-claude-fact` publishes only an authenticated all-PASS current response at the one downstream-compatible path `picture-lock-work/final/claude-fact-verdict.json`; valid `FAIL` and malformed replies cause a nonzero exit before any verdict-envelope write, so correction requests never collide with that path, and no further request is legal after its PASS winner exists for the candidate. It also owns the native-only `--append-picture-lock-done` adapter and its exact closed completion payload from Step 8. `evidence-artifacts.test.mjs` invokes that adapter with authenticated fixture bytes, proves the actual request and verdict envelope SHA covers the shared canonical bytes, exercises exact-winner reuse plus orphan recovery and a FAIL→new-UUID→single-PASS correction without path collision, and rejects an early call, nonzero/missing ElevenLabs count, stale candidate/accepted/tracked/verdict hash, or duplicate current completion entry. The final-voice plan's sibling `scripts/lib/release-gates.mjs` imports the same shared exports from `./mailbox-evidence.mjs`. `fact-review-packet.mjs` remains independent and does not import either module, so there is no `fact-review-packet` ↔ `evidence-artifacts` cycle.

The shared header parser accepts only real UTC calendar values in `YYYY-MM-DDTHH:MMZ`, whole-second, or second-with-1–9-fractional-digits form, always with literal `Z`; offsets, impossible dates/times, another sender, BOM, or any CR byte fail. Sender tokens are byte- and case-exact: every request/claim header ends in `· from Codex`, while every reply header ends in `· from claude`; fixtures explicitly reject `from codex`, `from CODEX`, `from Claude`, and any Unicode lookalike. `appendReviewRequest()` prepends exactly one `from Codex` entry with one kind-derived tertiary heading, one fenced JSON object, and terminal `STATUS: NEEDS_REPLY`. The reply parser requires the corresponding `from claude` entry, one kind-derived tertiary heading, one fenced JSON object, the optional exact handoff line only in the permitted Codex-commit mode, and terminal `STATUS: DONE`; it rejects text after the status line.

A raw fact request payload has exactly `{schemaVersion:1,kind:"final-film-fact-review-request",reviewRequestId,ordinal,artifactKind:"picture-lock-candidate",artifactSha256,pictureLockCandidateSha256,scriptSha256,reviewedCommit,requestCreatedAt}` with `additionalProperties:false`; `artifactSha256 === pictureLockCandidateSha256`, the SHA equals the candidate basename and bytes, `candidate.status === "candidate"`, and `reviewedCommit === candidate.commit`. Its heading is exactly `### Final-film fact review request · <reviewRequestId>` and its envelope kind is `final-film-fact-review-request-envelope`. The final-ack request mapping is exact too: heading `### Final-master QA review request · <reviewRequestId>`, envelope kind `final-master-qa-review-request-envelope`, and raw payload `{schemaVersion:1,kind:"final-master-qa-review-request",reviewRequestId,ordinal,artifactKind:"final-master",artifactSha256,finalMp4Sha256,finalSrtSha256,candidateLedgerSha256,factVerdictSha256,reviewedCommit,attemptChainSha256,requestCreatedAt}` with `additionalProperties:false` and `artifactSha256 === finalMp4Sha256`. `candidateLedgerSha256` is recomputed from the immutable hash-named candidate ledger; a mutable conventional result path is rejected.

For each kind, `reviewRequestId` is a newly generated lowercase RFC 4122 UUID v4, never reused; ordinal starts at 1 and increases by exactly one for the same kind/artifact after each correction request. After the mailbox-only request commit, `verifyCommittedReviewRequest()` accepts the explicit commit, reads its `docs/collab/inbox-claude.md` blob in detached Git, proves Codex attribution, one-path diff, entry introduction, kind-derived exact request subheading/payload/hash, a no-gap ordinal chain, and that this is the highest ordinal/latest request for that artifact. It returns the exact request-envelope value; `evidence-artifacts.mjs` independently canonicalizes that value with `stableJson`, recovers only owned temp artifacts, and no-clobber publishes it through `publishImmutableJsonNoClobber()` to the ignored local path. The raw payload cannot contain its own commit/blob/entry hash, avoiding self-reference.

The exact `reviewRequestEnvelope` object passed to the shared reply helper is `{schemaVersion:1,kind:"final-film-fact-review-request-envelope",reviewRequestSource,payload}` with `additionalProperties:false` at every level. `reviewRequestSource` is exactly `{mailboxPath:"docs/collab/inbox-claude.md",requestMailboxCommit,requestMailboxBlobOid,entryHeader,entrySubheading,mailboxEntrySha256}`; `payload` is the exact raw request object above. The shared fixture freezes these names and forbids aliases such as `source`, `requestCommit`, or `artifactSha`.

`mailbox-evidence.mjs` exports the shared generic API `verifyTrackedMailboxReply({mailboxPath, mailboxCommit, reviewRequestEnvelope, replyKind})`. `replyKind` is exactly the enum `"fact" | "final-ack"`: `fact` maps to `### Final-film fact verdict · <reviewRequestId>` plus the closed 21-line payload shown in Step 5; `final-ack` maps to `### Final-master QA acknowledgment · <reviewRequestId>` plus closed raw payload `{schemaVersion:1,reviewedAt,status,reviewRequestId,ordinal,artifactSha256,finalMp4Sha256,finalSrtSha256,candidateLedgerSha256,reviewedCommit,attemptCount,factVerdictSha256}`. For final-ack, `status` is `PASS` or `FAIL`, `attemptCount` is exactly integer `1`, the three request identity fields repeat the authenticated request, `artifactSha256 === finalMp4Sha256`, and `finalSrtSha256`, `candidateLedgerSha256`, `factVerdictSha256`, and `reviewedCommit` repeat its immutable request/candidate inputs. Both response schemas use `additionalProperties:false` and forbid request/reply commit, blob, header, path, reviewer, `payloadSha256`, and `mailboxEntrySha256` fields. The function accepts only the kind-allowlisted `docs/collab/inbox-codex.md`, derives the sole legal response subheading and payload validator by `replyKind` rather than hard-coding the fact form, requires a 40-lowercase-hex reply commit, runs git without a shell, and verifies all of the following before parsing payload bytes:

1. `git ls-files --error-unmatch -- docs/collab/inbox-codex.md` succeeds;
2. `mailboxCommit^{commit}` exists and `git merge-base --is-ancestor mailboxCommit HEAD` succeeds;
3. `git rev-parse mailboxCommit:docs/collab/inbox-codex.md` returns the recorded blob OID, and that blob's raw bytes are byte-identical to the current working file (`git hash-object` equality plus direct `Buffer.equals`); no checkout/newline normalization is allowed;
4. the exact subheading selected by `replyKind` exists in the commit blob but not in its first-parent blob, proving this commit introduced the reply; the kind-selected payload schema passes, and the raw payload repeats the request's exact `reviewRequestId`, `ordinal`, and `artifactSha256`;
5. either the commit author or an exact trailer is `Claude Fable 5 <noreply@anthropic.com>` (`commitMode:"claude-owned"`), or the commit is Codex-attributed, changes only the mailbox path, and the target entry contains the same exact handoff line for both kinds immediately before `STATUS: DONE` (`commitMode:"codex-explicit-handoff"`): `HANDOFF: Codex may commit this exact verdict entry and no other uncommitted path.`

The exact return keys are `{mailboxCommit,mailboxBlobOid,commitMode,entryHeader,entrySubheading,status,payloadSha256,mailboxEntrySha256,payload}`. They are joined locally with the separately verified request envelope; request commit/blob/entry hashes are never trusted from Claude's raw payload. An unknown `replyKind`, a fact schema under the final-ack kind (or vice versa), a working-tree-only Claude reply, a reply to a superseded request, an attribution claim written inside raw JSON, or an arbitrary current `HEAD` is never accepted as committed evidence.

- [ ] **Step 3: Prove the shared mailbox layer GREEN, then write accept-mode RED tests**

Finish the dependency-free helper/importer before touching accept mode:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node --test test/immutable-artifact.test.mjs test/fact-review-packet.test.mjs \
  test/mailbox-evidence.test.mjs test/evidence-artifacts.test.mjs
```

Expected: all fact packet, short-enum request mapping, explicit final-ack attempt-chain, detached request commit, generic reply provenance, and actual canonical-envelope publication tests pass. `evidence-artifacts.test.mjs` imports the already-GREEN immutable library rather than mocking or copying it. Only after this GREEN boundary, extend `picture-lock.test.mjs` with candidate-before-review/accept-after-verdict and crash-recovery cases; do not add mailbox parsing to the verifier.

Create `test/fixtures/native-picture-lock.json` from the accepted upstream contract, not a downstream hand-shaped approximation. It has top-level `schemaVersion:1`, `status:"picture-lock"`, `candidateSha256`, a 40-hex `commit`, `media`, `gates`, and `factReview`; it deliberately has no `pictureGates` and no duplicate top-level `pictureSha256`/`videoPacketSha256`. `media` contains `reviewedPostPicturePath`, `reviewedPostPictureSha256`, `pictureLockMp4Path`, `pictureLockMp4Sha256`, `videoPacketSha256`, and `decodedVideoSha256`. The two whole-file MP4 hashes are distinct fixture values, while the single `videoPacketSha256` identifies the copied H.264 payload shared by both. `factReview` contains the exact candidate-bound request/verdict IDs, candidate SHA, envelope SHA, request/reply commit/blob/entry hashes, and reply commit mode, but no raw review prose. `gates` is an array of exactly these sixteen unique `{id,status:"PASS",reviewedVideoPacketSha256,evidence}` entries, in order:

```text
media cadence color bitrate decode blankFrames loadingFrames sourceHashes
actionWindows facts privacy checkpoints legibility720p silentReview expertReview calloutOcclusion
```

The native and voice plans share two checked-in picture fixtures plus the fact-request envelope, all generated by `test/fixtures/build-native-contract-fixtures.mjs`. There is no hand-entered candidate hash. The builder first serializes `native-picture-lock-candidate.json`, hashes those exact bytes, then inserts that actual SHA into both `native-picture-lock.json.candidateSha256`/`factReview.pictureLockCandidateSha256` and `native-fact-review-request.json.payload.artifactSha256`/`pictureLockCandidateSha256`. It uses this complete deterministic implementation:

```js
import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {
  publishImmutableJsonNoClobber,
  stableJson,
} from "../../scripts/lib/immutable-artifact.mjs";

const fixtureDir = dirname(fileURLToPath(import.meta.url));
const encode = (value) => Buffer.from(`${stableJson(value)}\n`, "utf8");
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const marker = (label) => sha256(Buffer.from(`levelfield-native-contract:${label}`, "utf8"));
const GATE_IDS = [
  "media", "cadence", "color", "bitrate", "decode", "blankFrames", "loadingFrames",
  "sourceHashes", "actionWindows", "facts", "privacy", "checkpoints", "legibility720p",
  "silentReview", "expertReview", "calloutOcclusion",
];
const MANUAL_IDS = new Set(["legibility720p", "silentReview", "expertReview", "calloutOcclusion"]);
const inputHashes = {
  videoPacketSha256: marker("video-packets"),
  reviewedPostPictureSha256: marker("muted-post-picture"),
  inputScriptSha256: marker("script"),
  postManifestSha256: marker("post-manifest"),
  checkpointsSha256: marker("checkpoints"),
  reviewProtocolSha256: marker("review-protocol"),
};
const media = {
  reviewedPostPicturePath: "picture-lock-work/post-picture.mp4",
  reviewedPostPictureSha256: inputHashes.reviewedPostPictureSha256,
  pictureLockMp4Path: "demo-video/levelfield-demo-picture-lock.mp4",
  pictureLockMp4Sha256: marker("muxed-picture-lock"),
  videoPacketSha256: inputHashes.videoPacketSha256,
  decodedVideoSha256: marker("decoded-video"),
};
const gates = GATE_IDS.map((id) => ({
  id,
  status: "PASS",
  reviewedVideoPacketSha256: media.videoPacketSha256,
  evidence: [MANUAL_IDS.has(id) ? {
    kind: "manual",
    sha256: marker(`evidence:${id}`),
    reviewer: "Native contract fixture reviewer",
    protocolVersion: "picture-lock-review-v1",
    reviewedAt: "2026-08-20T12:00:00Z",
    verdict: "PASS",
    inputHashes,
  } : {
    kind: "automated",
    sha256: marker(`evidence:${id}`),
    toolVersion: "picture-lock-review-v1",
    commandSha256: marker(`command:${id}`),
    measurement: {fixtureGateId: id},
    inputHashes,
  }],
}));
const candidate = {
  schemaVersion: 1,
  status: "candidate",
  commit: "1".repeat(40),
  media,
  gates,
};
const candidateBytes = encode(candidate);
const candidateSha256 = sha256(candidateBytes);
const reviewRequestId = "018f47a0-4a0b-4c3d-8e9f-0123456789ab";
const requestMailboxEntrySha256 = marker("fact-request-entry");
const rawRequest = {
  schemaVersion: 1,
  kind: "final-film-fact-review-request",
  reviewRequestId,
  ordinal: 1,
  artifactKind: "picture-lock-candidate",
  artifactSha256: candidateSha256,
  pictureLockCandidateSha256: candidateSha256,
  scriptSha256: inputHashes.inputScriptSha256,
  reviewedCommit: candidate.commit,
  requestCreatedAt: "2026-08-20T12:01:00Z",
};
const factRequestEnvelope = {
  schemaVersion: 1,
  kind: "final-film-fact-review-request-envelope",
  reviewRequestSource: {
    mailboxPath: "docs/collab/inbox-claude.md",
    requestMailboxCommit: "2".repeat(40),
    requestMailboxBlobOid: "3".repeat(40),
    entryHeader: "## 2026-08-20T12:01:00Z · from Codex",
    entrySubheading: `### Final-film fact review request · ${reviewRequestId}`,
    mailboxEntrySha256: requestMailboxEntrySha256,
  },
  payload: rawRequest,
};
const accepted = {
  schemaVersion: 1,
  status: "picture-lock",
  candidateSha256,
  commit: candidate.commit,
  media: candidate.media,
  gates: candidate.gates,
  factReview: {
    reviewRequestId,
    ordinal: 1,
    pictureLockCandidateSha256: candidateSha256,
    verdictEnvelopeSha256: marker("fact-verdict-envelope"),
    verdictPayloadSha256: marker("fact-verdict-payload"),
    requestMailboxCommit: factRequestEnvelope.reviewRequestSource.requestMailboxCommit,
    requestMailboxBlobOid: factRequestEnvelope.reviewRequestSource.requestMailboxBlobOid,
    requestMailboxEntrySha256,
    replyMailboxCommit: "4".repeat(40),
    replyMailboxBlobOid: "5".repeat(40),
    replyMailboxEntrySha256: marker("fact-reply-entry"),
    replyCommitMode: "claude-owned",
  },
};
const outputs = new Map([
  ["native-picture-lock-candidate.json", candidate],
  ["native-picture-lock.json", accepted],
  ["native-fact-review-request.json", factRequestEnvelope],
]);
for (const [name, value] of outputs) {
  const output = join(fixtureDir, name);
  const expected = encode(value);
  if (process.argv.includes("--write")) await publishImmutableJsonNoClobber({
    outputPath: output,
    value,
    allowedRoot: fixtureDir,
    validate: (actual) => {
      if (stableJson(actual) !== stableJson(value)) throw new Error(`${name} invalid fixture value`);
    },
  });
  else if (!Buffer.from(await readFile(output)).equals(expected)) throw new Error(`${name} fixture drift`);
}
```

Run the builder once with `--write` against initially absent paths, then every native/voice contract test runs it without `--write` as a drift check. The builder imports the native-owned canonical encoder/writer; it has no local `JSON.stringify`, pretty-print, overwrite, or alternate byte path. An existing exact fixture is reusable, while an existing different fixture blocks and requires an explicit reviewed schema migration rather than silent replacement. The accepted fixture is the exact closed shape `{schemaVersion:1,status:"picture-lock",candidateSha256,commit,media,gates,factReview}`; the companion is exactly `{schemaVersion:1,status:"candidate",commit,media,gates}`. `native-fact-review-request.json` is exactly the closed envelope `{schemaVersion:1,kind:"final-film-fact-review-request-envelope",reviewRequestSource,payload}`—not a wrapper with aliases—and tests derive the three response-binding values from its payload. The marker hashes model closed schema fields only; temporary-git integration fixtures independently generate and authenticate real request/reply commits, blobs, entries, payload, and verdict-envelope bytes.

Every non-empty evidence array uses the Task 8 automated/manual schema; each gate's `reviewedVideoPacketSha256` and every `evidence[*].inputHashes.videoPacketSha256` equal `media.videoPacketSha256`, while evidence also carries the current `reviewedPostPictureSha256`, script, post-manifest, checkpoint, and review-protocol hashes. Native `picture-lock.test.mjs` loads this fixture and validates both phases: candidate bytes are the same `commit`/`media`/`gates` with `status:"candidate"` and no `candidateSha256`/`factReview`; accepted bytes use the literal above and require `candidateSha256` to equal the immutable candidate file. The final-voice plan's `release-gates.test.mjs` later loads this same tracked accepted fixture and passes it through `importPictureLockGates()`.

Both suites copy the companion's exact bytes into a temporary `picture-lock-candidates/<candidateSha256>.json`, require that filename hash to equal those bytes and `status:"candidate"`, and prove its `commit`, `media`, and `gates` were preserved in the accepted object. They require the shared request envelope's payload `artifactSha256` and `pictureLockCandidateSha256` to equal the same computed candidate hash and its `reviewedCommit` to equal the candidate commit. Separate temporary-git cases then re-hash a real Claude envelope and rerun `verifyCommittedReviewRequest()` plus `verifyTrackedMailboxReply()` against actual recorded request/reply commits and entry hashes. The accepted JSON SHA is deliberately computed only after acceptance and appears in neither raw request nor raw verdict, avoiding a fixed point. Both suites reject missing/null/object `gates`, legacy `pictureGates`, duplicate/missing/extra IDs, empty evidence, a non-PASS gate status, stale `reviewedVideoPacketSha256`, stale evidence packet hash, top-level SHA aliases, candidate status on the accepted path, missing/stale fact-review binding, a mutated candidate/request/reply/envelope, an accepted SHA anticipated inside the verdict, or any attempt to compare the gates to `pictureLockMp4Sha256` instead. This shared literal is the cross-plan contract preventing the native writer and voice reader from drifting.

Run the new accept tests before implementation:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node test/fixtures/build-native-contract-fixtures.mjs --write
node test/fixtures/build-native-contract-fixtures.mjs
node --test test/picture-lock.test.mjs
```

Expected: candidate-mode cases remain GREEN and every accept case fails because `--accept`, `--verify-accepted`, and verdict-envelope delegation are not implemented yet. The test stubs import the already GREEN `verifyCommittedReviewRequest()`/`verifyTrackedMailboxReply()` exports rather than implementing a second parser.

Define the post-acceptance documentation change, but do not edit either README or describe the candidate as a lock before Step 8. After the authenticated 21-line Claude PASS and successful accept mode, document three separate artifacts:

- preview = old truthful prototype;
- picture lock = accepted native-25fps offline-voice master, with the accepted JSON/evidence SHA;
- final = absent until approved one-pass voice and final release gates.

At that point remove the old Rachel fallback, `--force`, 30fps, 21-cue, and direct presentation-TTS instructions from the capture README. State explicitly that this plan made zero ElevenLabs requests. Tests fail if pre-verdict candidate bytes, README prose, or a request packet claim accepted/picture-lock/final status.

- [ ] **Step 4: Implement accept mode and run every project and film gate**

Add `--accept` and `--verify-accepted` to `verify-picture-lock.mjs` now. Both modes import the shared mailbox functions from `./lib/mailbox-evidence.mjs` and the existing `stableJson`, `publishImmutableJsonNoClobber`, and `recoverImmutableArtifactTemps` exports from `./lib/immutable-artifact.mjs`; they never parse a mailbox, infer a reply subheading, trust provenance copied from JSON, or introduce another serializer/writer. `--accept` accepts only explicit `--candidate`, `--fact-verdict`, `--output`, and `--tracked-evidence` paths, reauthenticates both committed entries, applies the exact accepted contract from Step 3, and implements the no-clobber two-destination recovery state machine exercised there. It computes `stableJson(accepted) + "\n"` only after a 21-line all-PASS verdict, calls the shared recovery API for both allowed-root destinations, and publishes each through the shared writer; the expected-byte derivation is identical for fresh publication, exact-winner reuse, and one-sided crash repair. `--verify-accepted` is read-only and reruns that same derivation. No Task 9 candidate path calls these modes.

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
npm test
npx tsc --noEmit -p packages/scoring/tsconfig.json
python3 - <<'PY'
from pathlib import Path
import shutil
shutil.rmtree(Path('apps/web/.next'), ignore_errors=True)
PY
npm run build -w @levelfield/web
npx tsx scripts/verify-classifications.ts
(cd contracts && forge test)

cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
ELEVENLABS_DISABLE_NETWORK=1 npm test
node --test test/immutable-artifact.test.mjs test/picture-lock.test.mjs \
  test/fact-review-packet.test.mjs test/mailbox-evidence.test.mjs test/evidence-artifacts.test.mjs
CANDIDATE_PATH="$(node scripts/verify-picture-lock.mjs --candidate --print-candidate-path \
  --run runs/2026-08-20T1530Z-preview \
  --picture runs/2026-08-20T1530Z-preview/picture-lock-work/post-picture.mp4 \
  --audio runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration.wav \
  --output ../levelfield-demo-picture-lock.mp4)"
node scripts/verify-picture-lock.mjs --verify-candidate --candidate "$CANDIDATE_PATH"
test ! -e runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json
test ! -e ../picture-lock-evidence.json

cd /Users/qinjiaji/Desktop/GitProject/levelfield
POST_RUNTIME_STATUS=demo-video/capture/runs/2026-08-20T1530Z-preview/picture-lock-work/remotion-runtime-status.json
(cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/post && node --test test/architecture.test.mjs test/license-gate.test.mjs test/manifest.test.mjs)
RUNTIME_AVAILABLE="$(node demo-video/post/scripts/license-gate.mjs \
  --runtime-status "$POST_RUNTIME_STATUS" --print-runtime-available)"
case "$RUNTIME_AVAILABLE" in
  true)
    node demo-video/post/scripts/license-gate.mjs \
      --runtime-status "$POST_RUNTIME_STATUS" --require-qualified-runtime
    (cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/post && npm test && npm run typecheck && node scripts/render.mjs --smoke \
      --runtime-status ../capture/runs/2026-08-20T1530Z-preview/picture-lock-work/remotion-runtime-status.json \
      --source ../capture/runs/2026-08-20T1530Z-preview/picture-lock-work/clean-picture.mp4 \
      --manifest ../capture/post-manifest.json)
    ;;
  false)
    node demo-video/post/scripts/license-gate.mjs \
      --runtime-status "$POST_RUNTIME_STATUS" --require-typed-unavailable
    ;;
  *) exit 1 ;;
esac
git diff --check
```

Expected: 69 software tests as the evidence-bound 4-web + 65-core composite, scoring typecheck, 30-page clean web build, 16/16 quote verification, 8 Forge tests, capture/post tests, candidate mode, and all fixture-based accept/recovery modes pass; the only real review target is still the immutable `status:"candidate"` path, no real accepted JSON/evidence exists yet, and ElevenLabs network calls remain zero.

- [ ] **Step 5: Prepare the immutable fact-review request**

Prepare—but do not append until the documentation/tool commit in Step 6 is complete—a newest-first request entry for `docs/collab/inbox-claude.md` containing:

- muxed picture-lock MP4 SHA from the candidate, immutable candidate JSON path/SHA, and the already locked `candidate.commit`, plus the separately labeled packet-generation commit;
- script SHA and exact 21-beat review packet path;
- request for Claude’s line-by-line verdict against `docs/submission.md`, `docs/validation.md`, and `docs/agreement.md`;
- explicit confirmation of zero ElevenLabs calls;
- the already consumed mandatory `snapshotDecision.decision`, `generatedAt`, `refreshRequestMailboxCommit`, `refreshCommit`, request/ack entry hashes, and evidence SHA from the locked pickup manifest, labeled as provenance only. Task 10 never initiates a timestamp refresh because the recording-day request, committed Claude acknowledgment, READY manifest binding, and capture were completed in Task 2;
- one immutable raw request payload under exact subheading `### Final-film fact review request · <reviewRequestId>`.

The request entry's top-level header is exactly `## <ISO-8601 UTC ending Z> · from Codex`; it contains one fenced `json` payload and its final non-empty line is exactly `STATUS: NEEDS_REPLY`. Its raw payload uses the exact shared contract:

```json
{
  "schemaVersion": 1,
  "kind": "final-film-fact-review-request",
  "reviewRequestId": "new lowercase RFC 4122 UUID v4",
  "ordinal": 1,
  "artifactKind": "picture-lock-candidate",
  "artifactSha256": "64-lowercase-hex SHA-256 of the immutable hash-named candidate JSON",
  "pictureLockCandidateSha256": "same 64-lowercase-hex value and candidate basename",
  "scriptSha256": "64-lowercase-hex SHA-256 of demo-video/script.md",
  "reviewedCommit": "candidate.commit",
  "requestCreatedAt": "actual ISO-8601 UTC ending Z"
}
```

Descriptions above are schema slots; the committed request contains actual values. The first request uses ordinal 1. After a committed `FAIL` response or a malformed response, Codex leaves both entries intact, generates a fresh UUID, increments the highest ordinal for that same `artifactSha256` by exactly one, and commits a new mailbox-only request. The request payload never contains `requestMailboxCommit`, blob OID, or entry SHA; those are computed after commit in the local envelope.

The request tells Claude to append one AGENTS-compliant response entry to `docs/collab/inbox-codex.md`. Its top-level header matches exactly `## <ISO-8601 UTC ending Z> · from claude`; inside that entry, the target-derived subheading is exactly `### Final-film fact verdict · <reviewRequestId>`, where the suffix is the UUID from the latest committed request, followed by one fenced `json` payload, and the entry’s final non-empty line is exactly `STATUS: DONE`. All hash/time/array values below are the actual reviewed values, never template strings.

The preferred provenance path is for Claude to run the repository gates, stage only `docs/collab/inbox-codex.md`, verify the staged path set is exactly that one path, and commit the reply itself with Claude's own exact author identity or `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` trailer. If Claude leaves the reply for Codex to commit instead, the target entry must include the exact line `HANDOFF: Codex may commit this exact verdict entry and no other uncommitted path.` immediately before `STATUS: DONE`; this line is outside the JSON fence but inside the hashed entry. Codex then re-runs required gates, stages only that mailbox, verifies the one-path staged set, and commits with Codex attribution. No other uncommitted file may enter either commit, and the reply is imported immediately from that commit before another mailbox append changes the working bytes.

Raw business payload:

```json
{
  "schemaVersion": 1,
  "reviewRequestId": "exact UUID from the committed request",
  "ordinal": 1,
  "artifactSha256": "exact request artifactSha256",
  "reviewedAt": "ISO-8601 UTC",
  "status": "PASS",
  "reviewedCommit": "40-hex commit",
  "scriptSha256": "64-lowercase-hex",
  "pictureLockCandidateSha256": "64-lowercase-hex of immutable candidate JSON bytes",
  "lineItems": [
    {
      "lineNumber": 1,
      "narrationTextSha256": "64-lowercase-hex",
      "status": "PASS",
      "claimsChecked": ["non-empty exact claim descriptions"],
      "evidence": ["non-empty repository path plus locator"]
    }
  ]
}
```

The raw Claude payload is forbidden from containing `reviewer`, request/reply mailbox commits or blob OIDs, `mailboxEntrySha256`, `payloadSha256`, `mailboxPath`, `commitMode`, `entryHeader`, or `entrySubheading`; this removes SHA/commit self-reference and keeps mailbox provenance out of reviewer-authored business data. It must repeat exactly the validated request's `reviewRequestId`, `ordinal`, and `artifactSha256`; these are the only request-provenance fields in the raw response. The closed review schema permits top-level `status:"PASS"|"FAIL"` and exactly 21 unique ordered line items numbered 1 through 21, each with `status:"PASS"|"FAIL"`, a narration hash recomputed from the canonical paragraph, and non-empty `claimsChecked`/`evidence` arrays. Top-level `PASS` requires all 21 line statuses to be `PASS`; top-level `FAIL` requires at least one `FAIL`. The helper may authenticate and record a valid FAIL for correction history, but the importer/accept path accepts only the all-PASS form. `pictureLockCandidateSha256` hashes the exact immutable hash-named candidate JSON, not the MP4, equals both `artifactSha256` and the candidate basename, and is the only picture JSON accepted at this stage; `scriptSha256` hashes the current script file; `reviewedCommit` must equal `candidate.commit`, never the importer HEAD or packet-generation HEAD. A request or verdict targeting a fixed `picture-lock.json`, an accepted-status object, or only the MP4 SHA fails.

The final-voice importer locates exactly one matching `from claude` entry/subheading and writes a local envelope only after validating the payload:

```json
{
  "schemaVersion": 1,
  "kind": "claude-fact-verdict-envelope",
  "reviewer": "Claude Fable 5",
  "source": {
    "mailboxPath": "docs/collab/inbox-codex.md",
    "mailboxCommit": "40-lowercase-hex commit whose mailbox blob equals working bytes",
    "mailboxBlobOid": "40-lowercase-hex git blob OID at mailboxCommit",
    "commitMode": "claude-owned or codex-explicit-handoff",
    "entryHeader": "the exact validated AGENTS entry header",
    "entrySubheading": "### Final-film fact verdict · the exact validated payload.reviewRequestId",
    "status": "DONE",
    "payloadSha256": "SHA-256 of exact raw payload bytes",
    "mailboxEntrySha256": "SHA-256 of exact raw entry bytes"
  },
  "reviewRequestSource": {
    "mailboxPath": "docs/collab/inbox-claude.md",
    "requestMailboxCommit": "explicit validated 40-lowercase-hex request commit",
    "requestMailboxBlobOid": "40-lowercase-hex request mailbox blob OID",
    "entryHeader": "the exact validated Codex request entry header",
    "entrySubheading": "### Final-film fact review request · the exact validated reviewRequestId",
    "mailboxEntrySha256": "SHA-256 of exact raw request entry bytes"
  },
  "payload": {
    "schemaVersion": 1,
    "reviewRequestId": "the exact raw request/response UUID",
    "ordinal": "the exact positive integer request ordinal",
    "artifactSha256": "the exact request artifact SHA",
    "reviewedAt": "the raw payload value",
    "status": "PASS",
    "reviewedCommit": "the raw payload value",
    "scriptSha256": "the raw payload value",
    "pictureLockCandidateSha256": "the raw payload value",
    "lineItems": "the exact validated 21-item raw payload array"
  }
}
```

The importer requires explicit `--request-mailbox-commit <40-hex>` and `--mailbox-commit <40-hex>` arguments. It first reconstructs and validates the latest-for-artifact request envelope from the request commit blob, then calls `verifyTrackedMailboxReply({... , replyKind:"fact"})` for that request ID before searching or hashing reply entries. It records both returned commit/blob provenances verbatim in the local envelope; there is no fallback to a working request, latest path commit, current HEAD, or artifact-only target. It serializes that envelope only as `stableJson(value) + "\n"`, calls shared temp recovery, and no-clobber publishes it; an exact existing winner is reused and any byte drift blocks. `payloadSha256` covers the exact UTF-8 bytes after the reply's opening JSON-fence line terminator through the byte immediately before the closing fence, including any final payload LF. Each request/reply `mailboxEntrySha256` covers the exact UTF-8 bytes from the first `#` of its `## ...` header through the LF after its terminal `STATUS` line, or through EOF when no final LF exists; inter-entry blank lines are excluded. No mailbox payload/entry hash domain receives newline, whitespace, Unicode, or JSON normalization, and the parser rejects a UTF-8 BOM or any CR byte; only the derived local envelope uses the shared canonical JSON domain. The envelope’s reviewer label is derived locally only after the parser authenticates committed `from claude` bytes, valid commit attribution/handoff, and both exact entry hashes; the raw payload is never rejected for lacking or varying a hard-coded model display name.

The importer searches for exactly one verdict subheading whose suffix equals the latest committed request's `reviewRequestId`; historical request/verdict-family entries for other UUIDs remain legal and ignored. Zero or multiple matches for the current request, a request/response UUID, ordinal, or artifact mismatch, an older ordinal selected after a correction request, another sender, non-UTC entry time, text after `STATUS: DONE`, prose-only evidence, fewer than 21 items, a stale hash/locked commit, `N/A`, or any line status other than `PASS` is not importable. Tests construct two historical requests/verdicts plus one current UUID and require only the current target to import; a duplicate current suffix fails. The failure-to-correction fixture proves ordinal 1 cannot permanently poison ordinal 2 for the same candidate hash. A separate fixture deliberately makes `git rev-parse HEAD` differ from `candidate.commit` and still imports `PASS` only when `payload.reviewedCommit === candidate.commit`; substituting current HEAD fails. Candidate-before-review and accept-after-verdict tests prove the accepted paths are absent through request/import setup and that only the authenticated current PASS envelope enables acceptance. Additional tests reproduce both request and reply commit/blob/entry hashes in a clean clone, mutate one working reply mailbox byte to force failure, and prove that uncommitted or wrongly attributed requests/replies never produce an envelope.

After Claude's commit—or Codex's one-path commit under the exact handoff—the downstream import flow is:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
CANDIDATE_PATH="$(node scripts/verify-picture-lock.mjs --candidate --print-candidate-path \
  --run runs/2026-08-20T1530Z-preview \
  --picture runs/2026-08-20T1530Z-preview/picture-lock-work/post-picture.mp4 \
  --audio runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration.wav \
  --output ../levelfield-demo-picture-lock.mp4)"
REQUEST_ENVELOPE_PATH="$(node scripts/evidence-artifacts.mjs --resolve-fact-review-request-envelope \
  --envelope-dir runs/2026-08-20T1530Z-preview/picture-lock-work/fact-review-requests \
  --picture-lock-candidate "$CANDIDATE_PATH" \
  --print-envelope-path)"
FACT_REQUEST_MAILBOX_COMMIT="$(node -e \
  'const e=JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8")); process.stdout.write(e.reviewRequestSource.requestMailboxCommit)' \
  "$REQUEST_ENVELOPE_PATH")"
cd /Users/qinjiaji/Desktop/GitProject/levelfield
FACT_MAILBOX_COMMIT="$(git log -1 --format=%H -- docs/collab/inbox-codex.md)"
test "${#FACT_REQUEST_MAILBOX_COMMIT}" = 40
test "${#FACT_MAILBOX_COMMIT}" = 40
git ls-files --error-unmatch -- docs/collab/inbox-claude.md
git ls-files --error-unmatch -- docs/collab/inbox-codex.md
test "$(git hash-object docs/collab/inbox-codex.md)" = \
  "$(git rev-parse "$FACT_MAILBOX_COMMIT:docs/collab/inbox-codex.md")"
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
VERDICT_PATH=runs/2026-08-20T1530Z-preview/picture-lock-work/final/claude-fact-verdict.json
node scripts/evidence-artifacts.mjs --import-claude-fact \
  --request-mailbox ../../docs/collab/inbox-claude.md \
  --request-mailbox-commit "$FACT_REQUEST_MAILBOX_COMMIT" \
  --request-envelope "$REQUEST_ENVELOPE_PATH" \
  --mailbox ../../docs/collab/inbox-codex.md \
  --mailbox-commit "$FACT_MAILBOX_COMMIT" \
  --script ../script.md \
  --picture-lock-candidate "$CANDIDATE_PATH" \
  --output "$VERDICT_PATH"
test -f "$VERDICT_PATH"
test "$(node -e 'process.stdout.write(JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8")).payload.reviewRequestId)' "$VERDICT_PATH")" = \
  "$(node -e 'process.stdout.write(JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8")).payload.reviewRequestId)' "$REQUEST_ENVELOPE_PATH")"
```

The displayed reply `git log` lookup is an operator convenience for capturing the just-created explicit reply value; the request commit comes only from the already validated request envelope. The importer itself performs neither lookup and accepts only both supplied commits after all provenance checks above.

- [ ] **Step 6: Commit shared mailbox, review, and accept machinery**

Run G0, then rerun `node --test demo-video/capture/test/immutable-artifact.test.mjs demo-video/capture/test/picture-lock.test.mjs demo-video/capture/test/fact-review-packet.test.mjs demo-video/capture/test/mailbox-evidence.test.mjs demo-video/capture/test/evidence-artifacts.test.mjs` as the relevant capture tests. This proves the Task 9 immutable module is still the sole byte writer actually consumed by `evidence-artifacts.mjs` and accept mode; it is already committed and therefore must remain unstaged here. Re-read `docs/collab/inbox-codex.md` after them. Do not append the request and do not edit either README yet; commit only the shared mailbox protocol, fact-specific packet/request/import machinery, and the tested accept-mode extension so the subsequent request points to immutable committed code:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add demo-video/capture/scripts/fact-review-packet.mjs demo-video/capture/scripts/evidence-artifacts.mjs \
  demo-video/capture/scripts/verify-picture-lock.mjs \
  demo-video/capture/scripts/lib/mailbox-evidence.mjs \
  demo-video/capture/test/fact-review-packet.test.mjs demo-video/capture/test/mailbox-evidence.test.mjs \
  demo-video/capture/test/evidence-artifacts.test.mjs demo-video/capture/test/picture-lock.test.mjs \
  demo-video/capture/test/fixtures/native-fact-review-request.json \
  demo-video/capture/test/fixtures/native-picture-lock.json \
  demo-video/capture/test/fixtures/native-picture-lock-candidate.json \
  demo-video/capture/test/fixtures/build-native-contract-fixtures.mjs
test "$(git diff --cached --name-only | LC_ALL=C sort)" = "$(printf '%s\n' \
  demo-video/capture/scripts/fact-review-packet.mjs demo-video/capture/scripts/evidence-artifacts.mjs \
  demo-video/capture/scripts/verify-picture-lock.mjs \
  demo-video/capture/scripts/lib/mailbox-evidence.mjs \
  demo-video/capture/test/fact-review-packet.test.mjs demo-video/capture/test/mailbox-evidence.test.mjs \
  demo-video/capture/test/evidence-artifacts.test.mjs demo-video/capture/test/picture-lock.test.mjs \
  demo-video/capture/test/fixtures/native-fact-review-request.json \
  demo-video/capture/test/fixtures/native-picture-lock.json \
  demo-video/capture/test/fixtures/native-picture-lock-candidate.json \
  demo-video/capture/test/fixtures/build-native-contract-fixtures.mjs | LC_ALL=C sort)"
git commit -m "feat(video): prepare independent candidate fact review" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
```

- [ ] **Step 7: Append and commit the immutable review request, then verify its envelope**

Generate the request from the just-committed tool, append it newest-first to `docs/collab/inbox-claude.md`, run G0 plus the exact five-file Task 9/10 test command below, and re-read `docs/collab/inbox-codex.md`. Stage exactly the one request mailbox path and commit it with Codex attribution. Then, without changing either mailbox, pass that explicit commit to the detached verifier and no-clobber publish the ignored local request envelope through the shared immutable writer:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
CANDIDATE_PATH="$(node scripts/verify-picture-lock.mjs --candidate --print-candidate-path \
  --run runs/2026-08-20T1530Z-preview \
  --picture runs/2026-08-20T1530Z-preview/picture-lock-work/post-picture.mp4 \
  --audio runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration.wav \
  --output ../levelfield-demo-picture-lock.mp4)"
node scripts/evidence-artifacts.mjs --append-fact-review-request \
  --mailbox ../../docs/collab/inbox-claude.md \
  --picture-lock-candidate "$CANDIDATE_PATH" \
  --script ../script.md \
  --packet runs/2026-08-20T1530Z-preview/picture-lock-work/fact-review-packet.md

cd /Users/qinjiaji/Desktop/GitProject/levelfield
# Execute the complete G0 block above, then run the relevant capture tests exactly:
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node --test test/immutable-artifact.test.mjs test/picture-lock.test.mjs \
  test/fact-review-packet.test.mjs test/mailbox-evidence.test.mjs test/evidence-artifacts.test.mjs
cd /Users/qinjiaji/Desktop/GitProject/levelfield
cat docs/collab/inbox-codex.md
git add -- docs/collab/inbox-claude.md
test "$(git diff --cached --name-only)" = docs/collab/inbox-claude.md
git commit -m "chore(video): request independent picture fact review" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
REQUEST_MAILBOX_COMMIT="$(git rev-parse HEAD)"
test "$(git diff-tree --no-commit-id --name-only -r "$REQUEST_MAILBOX_COMMIT")" = docs/collab/inbox-claude.md
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
REQUEST_ENVELOPE_PATH="$(node scripts/evidence-artifacts.mjs --verify-fact-review-request \
  --mailbox ../../docs/collab/inbox-claude.md \
  --request-mailbox-commit "$REQUEST_MAILBOX_COMMIT" \
  --picture-lock-candidate "$CANDIDATE_PATH" \
  --output-dir runs/2026-08-20T1530Z-preview/picture-lock-work/fact-review-requests \
  --print-envelope-path)"
test -f "$REQUEST_ENVELOPE_PATH"
test "$(basename "$REQUEST_ENVELOPE_PATH" .json)" = \
  "$(node -e 'process.stdout.write(JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8")).payload.reviewRequestId)' "$REQUEST_ENVELOPE_PATH")"
```

Expected: the UUID-named envelope proves the Codex-attributed mailbox-only commit/blob/entry, the current highest ordinal for this artifact, and exact request payload. Claude reviews only that UUID. A committed `FAIL` or malformed response triggers Step 7 again with a fresh UUID and ordinal + 1; it writes another immutable request-envelope path and never edits or deletes the prior request/response/envelope.

- [ ] **Step 8: Import PASS, accept without clobbering the candidate, document, and close the claim**

After Claude's attributed reply commit (or the exact one-path handoff commit), execute the import flow above. The import command only writes the ignored local verdict envelope; it does not create either accepted path. Reconstruct `CANDIDATE_PATH` from the same deterministic candidate command rather than a prior shell, then run accept mode exactly once:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
CANDIDATE_PATH="$(node scripts/verify-picture-lock.mjs --candidate --print-candidate-path \
  --run runs/2026-08-20T1530Z-preview \
  --picture runs/2026-08-20T1530Z-preview/picture-lock-work/post-picture.mp4 \
  --audio runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration.wav \
  --output ../levelfield-demo-picture-lock.mp4)"
VERDICT_PATH=runs/2026-08-20T1530Z-preview/picture-lock-work/final/claude-fact-verdict.json
ACCEPTED_PATH=runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json
TRACKED_EVIDENCE=../picture-lock-evidence.json

test "$(node -e 'process.stdout.write(JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8")).status)' "$CANDIDATE_PATH")" = candidate
test -f "$VERDICT_PATH"
node scripts/verify-picture-lock.mjs --accept \
  --candidate "$CANDIDATE_PATH" \
  --fact-verdict "$VERDICT_PATH" \
  --output "$ACCEPTED_PATH" \
  --tracked-evidence "$TRACKED_EVIDENCE"
node scripts/verify-picture-lock.mjs --verify-accepted \
  --picture-lock "$ACCEPTED_PATH" \
  --candidate "$CANDIDATE_PATH" \
  --fact-verdict "$VERDICT_PATH" \
  --tracked-evidence "$TRACKED_EVIDENCE"
test "$(node -e 'process.stdout.write(JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8")).status)' "$ACCEPTED_PATH")" = picture-lock
test "$(node -e 'process.stdout.write(JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8")).candidateSha256)' "$ACCEPTED_PATH")" = \
  "$(shasum -a 256 "$CANDIDATE_PATH" | awk '{print $1}')"
cmp "$ACCEPTED_PATH" "$TRACKED_EVIDENCE"
```

`--accept` authenticates the request and reply again from the commits recorded in the verdict envelope, requires exactly 21 ordered `PASS` line items, recomputes the candidate, script, payload, envelope, request-entry, and reply-entry hashes, and requires the raw payload's `pictureLockCandidateSha256`, `artifactSha256`, and `reviewedCommit` to match the immutable candidate. It preserves candidate bytes/inode, reruns all automated picture gates, and computes canonical `{schemaVersion:1,status:"picture-lock",candidateSha256,commit,media,gates,factReview}` before touching either destination. Both destinations receive the exact same `stableJson(value) + "\n"` bytes through `recoverImmutableArtifactTemps()` and `publishImmutableJsonNoClobber()`; publication uses the Task 9 temp-write/file-fsync/no-replace-hard-link/directory-fsync/temp-cleanup/directory-fsync protocol and never overwrite-renames. If neither destination exists, it creates both; if a crash leaves exactly one, retry first proves the surviving bytes equal the freshly computed winner and creates only the missing counterpart; if both exist and match, retry is a no-op. Any mismatching existing byte fails without replacing either file. `factReview` records the candidate/request/reply/envelope/payload hashes shown in the shared fixture, but neither accepted file contains its own SHA. Tests snapshot candidate bytes before/after, reject acceptance before import, reject `FAIL`, malformed, superseded, stale-commit, wrong-candidate, or 20-item envelopes, inject a crash after accepted publish but before tracked publish and require exact retry recovery, reject the inverse/mismatch cases, and prove the accepted SHA is computed only after the verdict.

Only now edit `demo-video/README.md` and `demo-video/capture/README.md` with the three honest artifact states from Step 3. Run G0, then rerun all Task 9/10 tests and accepted verification. Re-read `docs/collab/inbox-codex.md`, stage only the two README files plus the byte-identical tracked accepted evidence, and commit them:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
# Execute G0, then:
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
CANDIDATE_PATH="$(node scripts/verify-picture-lock.mjs --candidate --print-candidate-path \
  --run runs/2026-08-20T1530Z-preview \
  --picture runs/2026-08-20T1530Z-preview/picture-lock-work/post-picture.mp4 \
  --audio runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration.wav \
  --output ../levelfield-demo-picture-lock.mp4)"
VERDICT_PATH=runs/2026-08-20T1530Z-preview/picture-lock-work/final/claude-fact-verdict.json
node --test test/immutable-artifact.test.mjs test/picture-lock.test.mjs \
  test/fact-review-packet.test.mjs test/mailbox-evidence.test.mjs test/evidence-artifacts.test.mjs
node scripts/verify-picture-lock.mjs --verify-accepted \
  --picture-lock runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json \
  --candidate "$CANDIDATE_PATH" \
  --fact-verdict "$VERDICT_PATH" \
  --tracked-evidence ../picture-lock-evidence.json
cd /Users/qinjiaji/Desktop/GitProject/levelfield
cat docs/collab/inbox-codex.md
git add -- demo-video/README.md demo-video/capture/README.md demo-video/picture-lock-evidence.json
test "$(git diff --cached --name-only | LC_ALL=C sort)" = "$(printf '%s\n' \
  demo-video/README.md demo-video/capture/README.md demo-video/picture-lock-evidence.json | LC_ALL=C sort)"
git commit -m "docs(video): accept reviewed offline picture lock" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
```

Finally use the fact adapter to prepend one Codex entry to `docs/collab/inbox-claude.md`. It derives the accepted request UUID/ordinal and request/reply commits from the revalidated verdict envelope and emits exactly one fenced payload `{schemaVersion:1,kind:"native-picture-lock-complete",reviewRequestId,ordinal,requestMailboxCommit,replyMailboxCommit,candidateSha256,pictureLockSha256,trackedEvidenceSha256,elevenLabsRequests:0,completedAt}` under header `## <current ISO-8601 UTC ending Z> · from Codex`; its final non-empty line is exactly `STATUS: DONE`. The adapter recomputes every hash and rejects any nonzero/missing ElevenLabs count or accepted/tracked byte mismatch.

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
CANDIDATE_PATH="$(node scripts/verify-picture-lock.mjs --candidate --print-candidate-path \
  --run runs/2026-08-20T1530Z-preview \
  --picture runs/2026-08-20T1530Z-preview/picture-lock-work/post-picture.mp4 \
  --audio runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration.wav \
  --output ../levelfield-demo-picture-lock.mp4)"
VERDICT_PATH=runs/2026-08-20T1530Z-preview/picture-lock-work/final/claude-fact-verdict.json
node scripts/evidence-artifacts.mjs --append-picture-lock-done \
  --mailbox ../../docs/collab/inbox-claude.md \
  --candidate "$CANDIDATE_PATH" \
  --picture-lock runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json \
  --tracked-evidence ../picture-lock-evidence.json \
  --fact-verdict "$VERDICT_PATH" \
  --elevenlabs-requests 0
cd /Users/qinjiaji/Desktop/GitProject/levelfield
# Execute G0, then rerun the exact five-file Task 9/10 test command:
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
export PLAYWRIGHT_BROWSERS_PATH=/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/.playwright-browsers
node --test test/immutable-artifact.test.mjs test/picture-lock.test.mjs \
  test/fact-review-packet.test.mjs test/mailbox-evidence.test.mjs test/evidence-artifacts.test.mjs
cd /Users/qinjiaji/Desktop/GitProject/levelfield
cat docs/collab/inbox-codex.md
git add -- docs/collab/inbox-claude.md
test "$(git diff --cached --name-only)" = docs/collab/inbox-claude.md
git commit -m "chore(video): close accepted picture-lock review" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
test -z "$(git status --porcelain=v1 --untracked-files=all)"
```

This DONE entry closes rather than rewrites the live claim, and no request/verdict/candidate/accepted artifact is deleted.

## Completion condition

This plan is complete only when the immutable candidate still hashes to its original path, Claude's candidate-bound 21-line verdict reproduces from both recorded mailbox commits, accept mode has produced the separate no-clobber `status:"picture-lock"` JSON and byte-identical tracked evidence, the offline picture-lock MP4/evidence chain passes every gate, and the DONE entry is committed. It deliberately stops before reading or using the ElevenLabs credential, before accepting a voice ID, and before naming any artifact `final`.
