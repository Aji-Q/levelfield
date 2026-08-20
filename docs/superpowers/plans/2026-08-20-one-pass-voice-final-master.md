# LevelField One-pass Voice and Final Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the independently approved native-25fps picture lock into the final English submission master with semantic captions and exactly one owner-approved ElevenLabs `with-timestamps` generation, while making accidental paid retries, fallback voices, stale approvals, and unverified release claims mechanically impossible.

**Architecture:** Build and review full-text semantic captions entirely offline, then run one read-only provider capability GET and bind that dated response into an immutable narration request lock. A fail-closed one-pass client accepts evidence-bound picture/caption/fact gates plus an owner approval bound to one explicit voice, complete request body, capability artifact, cost authorization, and generation nonce; it performs at most one full-script POST for that lock, validates the timed response, and atomically caches it by content hash. A separate finalizer maps the provider’s raw character alignment to subtitle cues, normalizes/muxes audio without changing decoded picture frames, and emits a release ledger that binds every media, caption, privacy, fact, review, and project gate.

**Tech Stack:** Node.js 24 ESM, `node:test`, native `fetch` with injected transport, FFmpeg/ffprobe 8.0.1, ElevenLabs Text-to-Speech with timestamps API, SHA-256 content-addressed storage, English SRT, H.264 High/BT.709/AAC-LC.

---

## Primary implementation references

- ElevenLabs full-text speech with timestamps: <https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps>
- ElevenLabs model metadata: <https://elevenlabs.io/docs/api-reference/models/list>
- ElevenLabs voice retrieval: <https://elevenlabs.io/docs/api-reference/voices/get>
- ElevenLabs history listing for ambiguous-attempt recovery: <https://elevenlabs.io/docs/api-reference/history/list>
- ElevenLabs history item retrieval: <https://elevenlabs.io/docs/api-reference/history/get>
- ElevenLabs history audio retrieval: <https://elevenlabs.io/docs/api-reference/history/get-audio>
- ElevenLabs API-key restrictions and quotas: <https://elevenlabs.io/docs/api-reference/authentication>
- FFmpeg `fps_mode`, stream mapping, and timestamp behavior: <https://ffmpeg.org/ffmpeg.html>
- ffprobe frame counting and per-frame fields: <https://ffmpeg.org/ffprobe-all.html>
- FFmpeg two-pass `loudnorm`: <https://ffmpeg.org/ffmpeg-filters.html#loudnorm>
- YouTube’s official upload encoding guidance: <https://support.google.com/youtube/answer/1722171?hl=en>

## Entry conditions and hard stop rules

Begin this plan only after all of the following exist and pass:

```text
demo-video/levelfield-demo-picture-lock.mp4
demo-video/capture/runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json
demo-video/capture/runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock-candidates/<picture-lock.json.candidateSha256>.json
demo-video/capture/runs/2026-08-20T1530Z-preview/picture-lock-work/review/review-ledger.json
demo-video/capture/runs/2026-08-20T1530Z-preview/picture-lock-work/fact-review-packet.md
demo-video/capture/runs/2026-08-20T1530Z-preview/picture-lock-work/final/claude-fact-verdict.json
demo-video/capture/runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration-timing.json
```

The accepted picture lock must expose evidence-bound `silentReview` and `expertReview` PASS entries plus top-level `candidateSha256` and closed `factReview` provenance. If the upstream plan has not produced its immutable hash-named candidate, committed candidate-bound request, Claude 21-line PASS envelope, and separately published `status:"picture-lock"` acceptance file, stop and finish the native plan—this plan never invents them. Claude’s raw request/verdict covers the immutable picture-lock **candidate** and script hashes; it cannot contain or predict the later accepted `picture-lock.json` file hash. Voice preflight independently binds both phases by re-hashing the accepted file, locating and re-hashing its candidate, and replaying request/reply provenance. The owner must first select one concrete `ELEVENLABS_VOICE_ID`, and later approve the exact request-lock hash, exact character count/model, explicitly unknown estimated spend, and a finite maximum-credit ceiling; the local API key in `/Users/qinjiaji/Desktop/JAY.docx` is not an approval to spend credits and is not read during development or tests.

Zero paid calls are permitted in Tasks 1–6. After every offline picture/fact/caption/review gate is green, Task 7 permits one explicitly invoked, read-only capability phase using only provider GET endpoints; that GET cannot create an attempt marker or call text-to-speech. Task 7 then contains the sole allowed generation command. No script exposes `--force`, split generation, retry, redirect follow, fallback voice, partial continuation, or a default voice. A timeout or broken response is `ambiguous`, not permission to call again; any later generation needs a new lock, generation authorization, and owner approval and is honestly counted as a separate paid attempt.

### File map

```text
demo-video/capture/package.json
demo-video/capture/.gitignore
demo-video/capture/README.md
demo-video/capture/scripts/captions.mjs
demo-video/capture/scripts/finalize-master.mjs
demo-video/capture/scripts/verify-final-master.mjs
demo-video/capture/scripts/elevenlabs-final.mjs
demo-video/capture/scripts/elevenlabs-capability.mjs
demo-video/capture/scripts/elevenlabs-history-recover.mjs
demo-video/capture/scripts/run-elevenlabs-with-owner-key.py
demo-video/capture/scripts/mandatory-plan-precommit.sh
demo-video/capture/scripts/evidence-artifacts.mjs
demo-video/capture/scripts/fact-review-packet.mjs
demo-video/capture/scripts/lib/caption-layout.mjs
demo-video/capture/scripts/lib/narration.mjs
demo-video/capture/scripts/lib/alignment.mjs
demo-video/capture/scripts/lib/mailbox-evidence.mjs
demo-video/capture/scripts/lib/release-gates.mjs
demo-video/capture/scripts/lib/elevenlabs-lock.mjs
demo-video/capture/scripts/lib/elevenlabs-response.mjs
demo-video/capture/scripts/lib/immutable-artifact.mjs
demo-video/capture/qa/README.md
demo-video/capture/test/caption-layout.test.mjs
demo-video/capture/test/captions.test.mjs
demo-video/capture/test/alignment.test.mjs
demo-video/capture/test/release-gates.test.mjs
demo-video/capture/test/elevenlabs-lock.test.mjs
demo-video/capture/test/elevenlabs-response.test.mjs
demo-video/capture/test/elevenlabs-client.test.mjs
demo-video/capture/test/elevenlabs-capability.test.mjs
demo-video/capture/test/elevenlabs-history-recover.test.mjs
demo-video/capture/test/test_key_launcher.py
demo-video/capture/test/evidence-artifacts.test.mjs
demo-video/capture/test/mailbox-evidence.test.mjs
demo-video/capture/test/immutable-artifact.test.mjs
demo-video/capture/test/final-master.test.mjs
demo-video/capture/test/legacy-paid-path.test.mjs
demo-video/capture/test/verify-final-master.test.mjs
demo-video/capture/test/fixtures/native-picture-lock.json
demo-video/capture/test/fixtures/native-picture-lock-candidate.json
demo-video/capture/test/fixtures/native-fact-review-request.json
demo-video/capture/test/fixtures/elevenlabs-with-timestamps.json
demo-video/capture/test/fixtures/elevenlabs-history-item.json
demo-video/presentation/scripts/synthesize-audio.sh
demo-video/presentation/scripts/tts-providers/elevenlabs.sh
demo-video/presentation/scripts/tts-providers/README.md
demo-video/README.md
demo-video/production-plan.md
demo-video/final-evidence.json
docs/collab/inbox-claude.md
```

Generated credential/approval/attempt/cache artifacts remain gitignored under `demo-video/capture/runs/2026-08-20T1530Z-preview/picture-lock-work/final/` and `demo-video/capture/tts-cache/`. The final local/upload artifacts are:

```text
demo-video/levelfield-demo-final.mp4
demo-video/levelfield-demo-final.en.srt
```

The 12–20Mbps MP4 is intentionally ignored by git because it exceeds GitHub’s ordinary per-file limit. Git tracks the SRT and redacted `demo-video/final-evidence.json` containing the exact MP4 SHA-256. The owner first uploads that local master only as a private/unlisted staging asset for transcode QA; public visibility or submission occurs only after the accepted-artifact commit in Task 9.

## Mandatory collaboration claim and precommit protocol

Before editing any implementation file, re-read `docs/collab/inbox-codex.md`, then prepend one AGENTS-compliant entry to `docs/collab/inbox-claude.md` with header `## <current UTC> · from Codex`, a complete path list from this plan’s file map, an explicit expiry exactly two hours later, and final line `STATUS: CLAIMING`. If work is still active near expiry, prepend a renewed claim **before** the prior two-hour claim expires; do not delete or rewrite the earlier entry. A conflicting live claim blocks work on the overlapping path. When this plan finishes, prepend a `STATUS: DONE` entry releasing the same paths. The initial claim and every renewal are collaboration records only—not evidence that any quality gate passed.

As the first implementation action after the claim, create executable `demo-video/capture/scripts/mandatory-plan-precommit.sh` with this exact fail-fast body. This is the single named precommit block used by every commit step below:

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git -C "$(dirname "$0")/../../.." rev-parse --show-toplevel)"
cd "$ROOT"

git diff --check
npm test
npx tsc --noEmit -p packages/scoring/tsconfig.json
python3 - <<'PY'
from pathlib import Path
import shutil
shutil.rmtree(Path("apps/web/.next"), ignore_errors=True)
PY
npm run build -w @levelfield/web
npx tsx scripts/verify-classifications.ts
(cd contracts && forge test)
(cd demo-video/capture && ELEVENLABS_DISABLE_NETWORK=1 npm test)
if [[ -f demo-video/capture/test/test_key_launcher.py ]]; then
  (cd demo-video/capture && python3 -m unittest -v test/test_key_launcher.py)
fi
POST_RUNTIME_STATUS=demo-video/capture/runs/2026-08-20T1530Z-preview/picture-lock-work/remotion-runtime-status.json
(cd demo-video/post && node --test test/architecture.test.mjs test/license-gate.test.mjs test/manifest.test.mjs)
if [[ -f "$POST_RUNTIME_STATUS" ]]; then
  RUNTIME_AVAILABLE="$(node demo-video/post/scripts/license-gate.mjs \
    --runtime-status "$POST_RUNTIME_STATUS" --print-runtime-available)"
  case "$RUNTIME_AVAILABLE" in
    true)
      test -d demo-video/post/node_modules
      node demo-video/post/scripts/license-gate.mjs \
        --runtime-status "$POST_RUNTIME_STATUS" --require-qualified-runtime
      (cd demo-video/post && npm test && npm run typecheck)
      ;;
    false)
      node demo-video/post/scripts/license-gate.mjs \
        --runtime-status "$POST_RUNTIME_STATUS" --require-typed-unavailable
      ;;
    *) exit 1 ;;
  esac
fi
# AGENTS requires a fresh visible inbox read after all gates and immediately before staging.
cat docs/collab/inbox-codex.md
git diff --check
```

The script must be a regular non-symlink executable tracked in the first task commit. It performs no provider request and inherits `ELEVENLABS_DISABLE_NETWORK=1` for all capture tests. The three dependency-free post contract tests always run. When `remotion-runtime-status.json` exists, `--print-runtime-available` validates its binding before branching: only `true` may pass `--require-qualified-runtime` and run post `npm test`/typecheck with the locked installation; verified `false` runs the typed-unavailable assertion and never requires `node_modules`. A not-yet-created runtime status also runs only dependency-free fallback checks, so it cannot deadlock the mandatory FFmpeg route. Every `git commit` in this plan is immediately preceded by an explicit absolute-path invocation of this block after the task’s focused tests; a focused suite alone never authorizes a commit. Any inbox conflict, root test/typecheck/clean-web-build/classification failure, Forge failure, capture/post failure, or diff-check failure stops before staging/committing. Re-run the entire block after any fix; do not rely on output from an earlier task.

## Task 0: Commit the initial mailbox-only claim

- [ ] **Step 1: Publish the live two-hour claim before implementation edits**

Start from a clean tree. Re-read `docs/collab/inbox-codex.md`, then prepend the claim described above. Run the complete G0 inline because the reusable script is not created until Task 1; after the gates, re-read the inbox again, stage exactly the one mailbox path, commit it immediately, and prove the tree is clean:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
test -z "$(git status --porcelain)"
cat docs/collab/inbox-codex.md
# Prepend the exact AGENTS entry now: `## <UTC> · from Codex`, full file-map scope,
# `Expires: <UTC exactly two hours later>`, and final `STATUS: CLAIMING`.
git diff --check
npm test
npx tsc --noEmit -p packages/scoring/tsconfig.json
python3 - <<'PY'
from pathlib import Path
import shutil
shutil.rmtree(Path("apps/web/.next"), ignore_errors=True)
PY
npm run build -w @levelfield/web
npx tsx scripts/verify-classifications.ts
(cd contracts && forge test)
(cd demo-video/capture && ELEVENLABS_DISABLE_NETWORK=1 npm test)
if [[ -f demo-video/capture/test/test_key_launcher.py ]]; then
  (cd demo-video/capture && python3 -m unittest -v test/test_key_launcher.py)
fi
POST_RUNTIME_STATUS=demo-video/capture/runs/2026-08-20T1530Z-preview/picture-lock-work/remotion-runtime-status.json
(cd demo-video/post && node --test test/architecture.test.mjs test/license-gate.test.mjs test/manifest.test.mjs)
if [[ -f "$POST_RUNTIME_STATUS" ]]; then
  RUNTIME_AVAILABLE="$(node demo-video/post/scripts/license-gate.mjs \
    --runtime-status "$POST_RUNTIME_STATUS" --print-runtime-available)"
  case "$RUNTIME_AVAILABLE" in
    true)
      test -d demo-video/post/node_modules
      node demo-video/post/scripts/license-gate.mjs \
        --runtime-status "$POST_RUNTIME_STATUS" --require-qualified-runtime
      (cd demo-video/post && npm test && npm run typecheck)
      ;;
    false)
      node demo-video/post/scripts/license-gate.mjs \
        --runtime-status "$POST_RUNTIME_STATUS" --require-typed-unavailable
      ;;
    *) exit 1 ;;
  esac
fi
cat docs/collab/inbox-codex.md
git diff --check
git add docs/collab/inbox-claude.md
test "$(git diff --cached --name-only)" = "docs/collab/inbox-claude.md"
git diff --cached --check
git commit -m "chore(collab): claim one-pass voice implementation" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
test -z "$(git status --porcelain)"
```

Every two-hour renewal may occur with unrelated dirty-but-unstaged implementation work. Stop editing, run the complete G0 against those current bytes, require an empty index with `git diff --cached --quiet`, prepend one new claim with a fresh two-hour expiry, run `git diff --check -- docs/collab/inbox-claude.md`, stage only that mailbox, require `git diff --cached --name-only` to equal exactly `docs/collab/inbox-claude.md`, and commit the renewal by path. Leave all unrelated unstaged bytes untouched and verify the index is empty after the commit; the worktree need not be clean. If the current unit is already complete, committing that tested unit before renewal is also valid. The original or renewed `CLAIMING` bytes are never left uncommitted for a later task. Subsequent task commits may contain only the new mailbox `FYI`/`DONE` diff created in that task; they must not carry a pending claim or renewal.

## Task 1: Implement semantic caption layout

**Files:**
- Create: `demo-video/capture/scripts/lib/caption-layout.mjs`
- Create: `demo-video/capture/scripts/lib/narration.mjs`
- Create: `demo-video/capture/test/caption-layout.test.mjs`
- Create: `demo-video/capture/scripts/mandatory-plan-precommit.sh`
- Modify: `demo-video/capture/scripts/captions.mjs`
- Modify: `demo-video/capture/test/captions.test.mjs`

- [ ] **Step 1: Write failing layout tests**

Create tests for the exact release rules: at most two physical lines, at most 42 Unicode graphemes per line, at most 17 visible characters per second, at most 7 seconds per cue, monotonic non-overlap, and exact text round-trip. Use the locked narration and explicit edge cases:

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalCaptionText,
  graphemeLength,
  quantizeCueTimesToSrtMilliseconds,
  splitSemanticText,
  validateCaptionStyle,
  wrapCueLines,
} from "../scripts/lib/caption-layout.mjs";

test("prefers semantic punctuation and preserves canonical text", () => {
  const text = "The policy is visible: low or moderate risk can proceed; elevated or high risk is declined.";
  const chunks = splitSemanticText(text, { maxCharacters: 72 });
  assert.deepEqual(chunks, [
    "The policy is visible: low or moderate risk can proceed;",
    "elevated or high risk is declined.",
  ]);
  assert.equal(canonicalCaptionText(chunks.map((chunk) => ({ text: chunk }))), text);
});

test("never splits protected product and evidence tokens", () => {
  const address = "0xb8e11dea346f2c961880879606a269db3165bbc7";
  const wrapped = wrapCueLines(`LevelField DreamDEX rho 0.930 ${address}`, { maxCpl: 42, maxLines: 2 });
  assert.ok(wrapped.every((line) => graphemeLength(line) <= 42));
  assert.match(wrapped.join(" "), /LevelField/);
  assert.match(wrapped.join(" "), /DreamDEX/);
  assert.match(wrapped.join(" "), /0\.930/);
  assert.ok(wrapped.includes(address));
});

test("rejects a cue that violates time or layout", () => {
  assert.throws(() => validateCaptionStyle([{ start: 0, end: 8, text: "Too long." }]), /7 seconds/);
  assert.throws(() => validateCaptionStyle([{ start: 0, end: 1, text: "This cue has far more than seventeen visible characters." }]), /17 CPS/);
  assert.throws(() => validateCaptionStyle([{ start: 0, end: 4, text: "one\ntwo\nthree" }]), /two lines/);
});

test("validates the serialized millisecond timeline, not hidden floats", () => {
  const quantized = quantizeCueTimesToSrtMilliseconds([
    { start: 0.0004, end: 1.0004, text: "First cue." },
    { start: 1.00049, end: 2.0004, text: "Second cue." },
  ]);
  assert.deepEqual(quantized.map(({ startMs, endMs }) => [startMs, endMs]), [[0, 1000], [1000, 2000]]);
  assert.doesNotThrow(() => validateCaptionStyle(quantized));
});
```

Add a full-script fixture containing all 21 approved paragraphs and pass the **single complete canonical text** to the splitter. Prove: normalized cue text equals normalized canonical narration byte-for-byte apart from whitespace; no word or punctuation is added, deleted, or reordered; a paragraph boundary is a preferred breakpoint but not a mandatory cue boundary; every chosen chunk has a feasible two-line wrap; and a protected grapheme token longer than 42 characters fails instead of being truncated. The fixture must be extracted by the same script parser used by request-lock creation—do not retype a second narration copy in the test.

- [ ] **Step 2: Run the new test and confirm RED**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
node --test test/caption-layout.test.mjs
```

Expected: `ERR_MODULE_NOT_FOUND` for `caption-layout.mjs`.

- [ ] **Step 3: Implement deterministic semantic splitting**

Implement `Intl.Segmenter("en", {granularity:"grapheme"})` counting and tokenize without splitting URLs, `0x[0-9a-f]+`, decimals, `LevelField`, `DreamDEX`, `PROCEED`, `DECLINE`, `ScoreRegistry`, `CB-1`, or hyphenated number ranges. Candidate break scores are:

```js
const BREAK_SCORE = Object.freeze({
  sentence: 0,
  semicolon: 1,
  colon: 2,
  dash: 3,
  comma: 4,
  conjunction: 6,
  whitespace: 9,
});
```

Use one dynamic-programming pass over all legal breakpoints in the complete canonical narration, including paragraph boundaries as scored candidates rather than hard subtitle boundaries. For every candidate span call `wrapCueLines()` during feasibility evaluation. The cost is `semanticPenalty * 1000 + lineImbalance ** 2 + orphanPenalty`; reject a span that cannot fit in two 42-grapheme lines, and reject the whole layout when no legal path exists rather than truncating it.

Public API:

```js
export function graphemeLength(text);
export function splitSemanticText(text, { maxCharacters = 84 } = {});
export function wrapCueLines(text, { maxCpl = 42, maxLines = 2 } = {});
export function visibleCharacterCount(text);
export function validateCaptionStyle(cues, { maxLines = 2, maxCpl = 42, maxCps = 17, maxDuration = 7 } = {});
export function quantizeCueTimesToSrtMilliseconds(cues); // set startMs/endMs and canonical start/end=startMs/endMs/1000; fail on zero/negative duration or post-quantization overlap
export function canonicalCaptionText(cues);
export { normalizeNarrationText } from "./narration.mjs";
```

`narration.mjs` owns the one canonical parser used by captions, fact review, request locking, and final verification:

```js
export function normalizeNarrationText(text); // NFC-normalize, trim, and collapse whitespace only
export function parseCanonicalNarrationBeats(markdown); // extract exactly the 21 narration paragraphs or throw
export function canonicalNarration(beats); // trim each parsed beat and join with exactly "\n\n"
```

- [ ] **Step 4: Refactor caption serialization without changing legacy callers**

Keep `formatSrtTimestamp()` and `buildSrt()`. Replace the one-segment/one-cue assumption with:

```js
export function buildSemanticCues({ canonicalText, alignment, totalDuration }) {
  const chunks = splitSemanticText(canonicalText).map((text) => ({ text }));
  const cues = mapSemanticChunksToAlignment(chunks, alignment, { maxDuration: 7, maxCps: 17 });
  const wrapped = cues.map((cue) => ({ ...cue, text: wrapCueLines(cue.text).join("\n") }));
  const quantized = quantizeCueTimesToSrtMilliseconds(wrapped);
  validateCues(quantized, totalDuration);
  validateCaptionStyle(quantized);
  if (normalizeNarrationText(canonicalCaptionText(quantized)) !== normalizeNarrationText(canonicalText)) throw new Error("Caption text does not round-trip to the complete narration");
  return quantized;
}
```

`buildSrt()` must serialize `startMs`/`endMs` directly and never re-round the original floating-point seconds. The alignment function is implemented in Task 2; temporarily inject it into `buildSemanticCues()` so Task 1 unit tests remain pure.

For CPL/CPS, strip no narration characters and count Unicode graphemes after replacing a physical line break with one space; inter-word spaces count. Duration is exactly `(endMs-startMs)/1000`. This conservative definition is shared by generator, SRT parser, preflight, and final verifier so a cue cannot pass under two different character-count conventions.

- [ ] **Step 5: Run focused tests and commit**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
node --test test/caption-layout.test.mjs test/captions.test.mjs
chmod 0755 /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/scripts/mandatory-plan-precommit.sh
/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/scripts/mandatory-plan-precommit.sh
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add demo-video/capture/scripts/lib/caption-layout.mjs demo-video/capture/test/caption-layout.test.mjs \
  demo-video/capture/scripts/lib/narration.mjs demo-video/capture/scripts/captions.mjs demo-video/capture/test/captions.test.mjs \
  demo-video/capture/scripts/mandatory-plan-precommit.sh
git commit -m "feat(video): add semantic two-line caption layout" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
```

## Task 2: Validate and map raw character alignment

**Files:**
- Create: `demo-video/capture/scripts/lib/alignment.mjs`
- Create: `demo-video/capture/test/alignment.test.mjs`
- Modify: `demo-video/capture/scripts/captions.mjs`
- Modify: `demo-video/capture/package.json`

- [ ] **Step 1: Write raw-alignment and provisional-alignment tests**

Tests require arrays of equal length, finite non-negative monotonic times, `start <= end`, exact `characters.join("")`, and raw `alignment` rather than `normalized_alignment`. Include a fixture where normalized text changes `LevelField`; the raw alignment must be selected.

```js
const alignment = {
  characters: ["L", "e", "v", "e", "l", "F", "i", "e", "l", "d"],
  character_start_times_seconds: [0,.08,.16,.24,.32,.40,.48,.56,.64,.72],
  character_end_times_seconds: [.08,.16,.24,.32,.40,.48,.56,.64,.72,.80],
};
assert.doesNotThrow(() => validateCharacterAlignment(alignment, "LevelField"));
```

Add a negative alignment whose starts remain monotonic while one end regresses; it must fail. Test cue mapping with punctuation, spaces, a 7-second split, a 17-CPS boundary, an impossible one-token CPS case that has no further legal split, and a final tail that ends no later than the 159.56-second picture. Test the exact scratch-timing schema, narration/timing hash mismatch, padded-versus-unpadded duration confusion, missing beat timing, a beat interval outside `speechDuration`, and all 21 beats mapped to the complete canonical narration.

- [ ] **Step 2: Run and confirm RED**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
node --test test/alignment.test.mjs
```

Expected: missing module failure.

- [ ] **Step 3: Implement alignment validation and mapping**

Create these exports:

```js
export function validateCharacterAlignment(alignment, expectedText) {
  const chars = alignment?.characters;
  const starts = alignment?.character_start_times_seconds;
  const ends = alignment?.character_end_times_seconds;
  if (!Array.isArray(chars) || !Array.isArray(starts) || !Array.isArray(ends) || chars.length !== starts.length || chars.length !== ends.length) {
    throw new Error("Alignment arrays must exist and have equal length");
  }
  if (chars.join("") !== expectedText) throw new Error("Alignment text differs from the locked request text");
  let previousStart = -1;
  let previousEnd = -1;
  for (let index = 0; index < chars.length; index += 1) {
    const start = Number(starts[index]);
    const end = Number(ends[index]);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || start < previousStart || end < previousEnd) {
      throw new Error(`Invalid character timing at index ${index}`);
    }
    previousStart = start;
    previousEnd = end;
  }
  return true;
}
```

`validateScratchTiming(timing, { canonicalText, beats, scratchAudioProbe })` requires this exact upstream JSON contract:

```json
{
  "schemaVersion": 1,
  "canonicalNarrationSha256": "64-lowercase-hex",
  "scratchAudioSha256": "64-lowercase-hex",
  "speechDuration": 146.24,
  "paddedDuration": 159.56,
  "beats": [
    { "id": "beat-01", "textSha256": "64-lowercase-hex", "start": 0.0, "end": 6.42 }
  ]
}
```

It requires exactly 21 ordered, finite, non-overlapping beat intervals, exact per-beat text hashes, `lastBeat.end <= speechDuration <= paddedDuration`, `paddedDuration === 159.56`, the scratch WAV hash to match the probed file, and measured WAV duration within 20ms of `paddedDuration`. Extra upstream diagnostic frame/speech fields are allowed but cannot rename, replace, or weaken these required fields. `createProvisionalAlignment(canonicalText, timing)` distributes each beat’s exact code points by visible-grapheme weight inside that beat’s interval; the two newline separators between beats receive zero-width timings at the boundary. It never allocates text across the padded tail and is only for zero-network caption QA.

`mapSemanticChunksToAlignment()` finds exact character offsets in order, derives cue windows from the first/last spoken characters, and recursively splits at the highest-scoring legal semantic breakpoint when duration or CPS fails. Every recursive branch has a base case: if a non-empty chunk still exceeds 7 seconds or 17 CPS and has no legal, two-line-feasible split, throw `Caption chunk cannot satisfy timing limits`; never return an over-limit leaf and never change the text.

- [ ] **Step 4: Wire scratch and ElevenLabs modes**

`captions.mjs` accepts:

```text
--mode scratch --audio scratch/narration.wav --scratch-timing scratch/narration-timing.json
--mode elevenlabs --request-lock picture-lock-work/final/narration-request-lock.json --cache-root tts-cache
```

Scratch mode creates provisional alignment from the locked text and the verified unpadded `speechDuration` plus all 21 beat windows in `narration-timing.json`; it does not infer speech duration from the padded WAV. ElevenLabs mode reads only the response’s raw `alignment` object. Both write a derived caption timing JSON alongside SRT and include script, canonical narration, source timing/alignment, and SRT SHA-256. Add `"captions:locked": "node scripts/captions.mjs"` to `package.json` in this step so the next command exists.

- [ ] **Step 5: Run tests and generate the offline caption candidate**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
node --test test/alignment.test.mjs test/caption-layout.test.mjs test/captions.test.mjs
npm run captions:locked -- \
  --mode scratch \
  --script ../script.md \
  --audio runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration.wav \
  --scratch-timing runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration-timing.json \
  --output runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch.en.srt \
  --timing runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch-caption-timing.json
```

Expected: every cue passes 2-line/42-CPL/17-CPS/7-second rules **after SRT millisecond quantization**, and the normalized cue text round-trips to the single complete 21-paragraph canonical narration.

- [ ] **Step 6: Commit Task 2**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/scripts/mandatory-plan-precommit.sh
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add demo-video/capture/scripts/lib/alignment.mjs demo-video/capture/test/alignment.test.mjs \
  demo-video/capture/scripts/captions.mjs demo-video/capture/package.json
git commit -m "feat(video): map locked narration to validated captions" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
```

## Task 3: Define release gates and Claude’s fact verdict schema

**Files:**
- Create: `demo-video/capture/scripts/lib/release-gates.mjs`
- Create: `demo-video/capture/test/release-gates.test.mjs`
- Modify: `demo-video/capture/scripts/evidence-artifacts.mjs` (reuse the generic request/reply binder created by the prerequisite native plan; extend owner/final-ack modes)
- Modify: `demo-video/capture/test/evidence-artifacts.test.mjs`
- Read: `demo-video/capture/scripts/lib/immutable-artifact.mjs` (created by the prerequisite native picture-lock plan; single stable-JSON/no-clobber implementation)
- Read: `demo-video/capture/test/immutable-artifact.test.mjs` (created by the prerequisite native picture-lock plan; reuse its exact-byte/crash fixtures)
- Read: `demo-video/capture/scripts/fact-review-packet.mjs` (created by the prerequisite native picture-lock plan; packet generation only)
- Read: `demo-video/capture/scripts/lib/mailbox-evidence.mjs` (created by the prerequisite native picture-lock plan; single dependency-free mailbox request/reply/provenance implementation)
- Read: `demo-video/capture/test/mailbox-evidence.test.mjs` (created by the prerequisite native picture-lock plan; extend only through shared fixtures, never duplicate its parser)
- Read: `demo-video/capture/test/fixtures/native-picture-lock.json` (created by the prerequisite native picture-lock plan)
- Read: `demo-video/capture/test/fixtures/native-picture-lock-candidate.json` (created by the prerequisite native picture-lock plan; exact bytes named by the accepted fixture SHA)
- Read: `demo-video/capture/test/fixtures/native-fact-review-request.json` (created by the prerequisite native picture-lock plan; consume its exact request/source/response-binding literals)

- [ ] **Step 1: Write failing release-gate tests**

Required gates are:

```js
export const REQUIRED_PICTURE_GATES = [
  "media", "cadence", "color", "bitrate", "decode", "blankFrames", "loadingFrames",
  "sourceHashes", "actionWindows", "facts", "privacy", "checkpoints", "legibility720p",
  "silentReview", "expertReview"
];

export const REQUIRED_NATIVE_PICTURE_LOCK_GATES = [
  ...REQUIRED_PICTURE_GATES,
  "calloutOcclusion"
];

export const REQUIRED_PRE_CAPABILITY_GATES = [
  "scriptHash", "scratchTiming", "captionLayout", "captionRoundTrip", "captionOcclusion",
  "claudeFactReview", "ownerVoiceSelection"
];

export const REQUIRED_PAID_REQUEST_GATES = [
  ...REQUIRED_PRE_CAPABILITY_GATES,
  "providerCapability", "requestLock", "ownerVoiceApproval", "keyRestrictionAttestation"
];
```

Load `native-picture-lock.json` and companion `native-picture-lock-candidate.json` as the **same checked-in literal fixtures** created and consumed by the prerequisite native picture-lock plan, not as hand-shaped voice adapters or second copies. The accepted fixture’s exact top level is `{schemaVersion:1,status:"picture-lock",candidateSha256,commit,media,gates,factReview}` with no extra hash aliases. The companion’s exact bytes hash to accepted `candidateSha256` and have closed shape `{schemaVersion:1,status:"candidate",commit,media,gates}` with no `candidateSha256` or `factReview`; tests copy those unchanged bytes to `picture-lock-work/picture-lock-candidates/<candidateSha256>.json` and require byte-for-byte deep equality of candidate/accepted `commit`, `media`, and `gates`. Fixture generation is deterministic and writes the candidate first, computes its real SHA, then writes the accepted fixture and candidate-bound fact fixture; a magic placeholder candidate SHA is forbidden. `factReview` is closed `{reviewRequestId,ordinal,pictureLockCandidateSha256,verdictEnvelopeSha256,verdictPayloadSha256,requestMailboxCommit,requestMailboxBlobOid,requestMailboxEntrySha256,replyMailboxCommit,replyMailboxBlobOid,replyMailboxEntrySha256,replyCommitMode}`; its candidate SHA equals top-level `candidateSha256`, and every envelope/request/reply field must replay from committed provenance rather than being trusted as a summary.

`media` contains `reviewedPostPicturePath`, `reviewedPostPictureSha256`, `pictureLockMp4Path`, `pictureLockMp4Sha256`, `videoPacketSha256`, and `decodedVideoSha256`. The two whole-file MP4 hashes are deliberately different fixture values, while the one H.264 `videoPacketSha256` is shared. `gates` contains, in `REQUIRED_NATIVE_PICTURE_LOCK_GATES` order, exactly the fifteen downstream IDs plus `calloutOcclusion`; each entry is `{id,status:"PASS",reviewedVideoPacketSha256,evidence}`, every `reviewedVideoPacketSha256` equals `media.videoPacketSha256`, and every evidence member’s `inputHashes` contains that same `videoPacketSha256` plus the native key `inputScriptSha256`. The voice test maps its independently computed `inputHashes.scriptSha256` to expected evidence key `inputScriptSha256`; it never expects or silently aliases an upstream `scriptSha256` field. This does **not** claim that a review of the muted post-picture had the same whole-file hash as the later audio-muxed picture-lock container. The contract test must parse the accepted literal, assert `Array.isArray(fixture.gates)`, assert all accepted/candidate/media/fact hashes are lowercase 64-hex, call `importPictureLockGates()` with the accepted path plus derived candidate path, and validate all sixteen entries using the literal `inputScriptSha256`. Candidate status at the accepted path, accepted status at the candidate path, missing/wrong `candidateSha256`, a filename/content mismatch, candidate/accepted `commit`/`media`/`gates` drift, missing/extra/stale `factReview`, deleting `gates`, setting it to an object/null, renaming it to `pictureGates`, flattening either media hash, duplicating/omitting/adding/reordering an ID, replacing `inputScriptSha256` with `scriptSha256`, omitting `calloutOcclusion`, or changing any declared gate to a non-PASS status must fail rather than yield `undefined` or silently skip an upstream gate. The same extra-ID and reordered-array mutations are also passed through `evaluatePreCapabilityGates()` to prove the production preflight reaches this exact two-phase length/index/provenance contract rather than merely iterating a required subset.

Tests prove `FAIL`, `UNREVIEWED`, `UNMEASURED`, or `N/A` blocks any required gate. Only explicitly optional `ocr` and `vmaf` may be `N/A`. A bare `{id,status:"PASS"}`, an empty evidence array, a manual verdict without reviewer/protocol/timestamp/input hashes, and an automated result without measurement/tool/command/input hashes all fail. Hash changes in picture, script, scratch timing/SRT, review ledger, capability artifact, or fact verdict invalidate the gate set.

The caption-occlusion fixture is a manual review record bound to both the exact picture MP4 and scratch SRT SHA-256. Its tests require all designated key-UI checkpoints, `reviewer`, ISO timestamp, `protocolVersion`, `status:"PASS"`, and per-checkpoint `verdict:"PASS"`; absent, `N/A`, or a stale hash is a hard stop. The same evidence rules apply to the upstream `silentReview` and `expertReview`; their absence must never be converted to a local PASS.

The native-owned `immutable-artifact.test.mjs` defines the one writer used by every pre-paid immutable artifact—at minimum native request/fact envelopes plus voice selection, provider capability, narration request lock, and owner approval. Voice integration tests import that same module and exact-byte fixtures; they do not copy its serializer or publication state machine. For each voice kind, inject failures during temp creation, mid-write, file fsync, no-clobber publication, first directory fsync, temp cleanup, and second directory fsync; then restart and prove either the exact complete artifact is recovered or a hash-journaled temp is quarantined before a fresh publish. Test partial JSON, valid complete orphan, stale capability orphan, symlink, wrong mode/root, conflicting canonical file, identical/concurrent winner, and two simultaneous publishers. A canonical path must never expose partial bytes, be overwritten, or become unusable merely because a temp write crashed. A cross-plan test passes the shared request/candidate literal through native and voice callers and requires identical canonical bytes and SHA-256; an existing winner is reused only after exact byte/hash/schema validation.

- [ ] **Step 2: Run and confirm RED**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
node --test test/immutable-artifact.test.mjs test/release-gates.test.mjs test/evidence-artifacts.test.mjs
```

Expected: the native shared primitive tests remain green, while the new voice release-gate/binder integration assertions fail until implemented.

- [ ] **Step 3: Implement gate collection and verdict validation**

Import the native-owned shared immutable-artifact API unchanged:

```js
export function stableJson(value) { /* lexicographic object keys; exact JSON scalars */ }
export async function publishImmutableJsonNoClobber({ outputPath, value, validate, allowedRoot });
export async function recoverImmutableArtifactTemps({ outputPath, validateBytes, allowedRoot, recoveryRoot });
```

`publishImmutableJsonNoClobber()` first validates the value, renders `Buffer.from(stableJson(value) + "\n", "utf8")`, creates a same-directory owned temp with `open(...,"wx",0o600)`, writes the full buffer, fsyncs the file, and closes it. It publishes with same-filesystem `link(temp, outputPath)` (or an equivalently tested no-replace primitive), fsyncs the directory, unlinks the temp, and fsyncs the directory again. It never opens the canonical output for writing and never uses overwriting rename. On `EEXIST`, it accepts only a regular non-symlink canonical winner whose exact bytes and artifact-specific validation match the intended value; otherwise it journals the conflicting temp and fails.

`recoverImmutableArtifactTemps()` runs before any artifact creation. It recognizes only the exact owned temp-name pattern for that canonical basename. With no canonical output, a complete temp that passes the artifact-specific schema/input/freshness validator is no-clobber published without repeating a capability GET or generating a new nonce; a partial, stale, malformed, wrong-input, or ambiguous temp is moved through a `wx`+fsynced record into sibling `artifact-recovery/<artifact-kind>/<sha256>/`, after which a fresh artifact may be built. With a canonical output, an identical/compatible temp is journaled as a recovered concurrent loser and a conflict is quarantined/blocking. No temp is silently deleted, symlink followed, credential/header serialized, or file moved across filesystems. Integration tests for all five artifact wrappers inject a mid-write crash and assert their fixed canonical paths remain absent-or-complete.

`release-gates.mjs`, `evidence-artifacts.mjs`, capability, lock, approval, attempt-chain, candidate, and accepted-ledger writers all import `stableJson`, `publishImmutableJsonNoClobber`, and `recoverImmutableArtifactTemps` from that one native-owned file. No voice module defines a second canonical serializer, changes newline policy, or wraps an existing winner with newly rendered bytes before comparison.

Release-gate public API:

```js
import { join } from "node:path";
import { verifyTrackedMailboxReply } from "./mailbox-evidence.mjs";

export function collectGateResults(entries) {
  return Object.fromEntries(entries.map((entry) => [entry.id, entry]));
}

export function importPictureLockGates({ pictureLock, candidate, pictureLockSha256, pictureLockCandidateSha256 }) {
  const acceptedKeys = ["candidateSha256", "commit", "factReview", "gates", "media", "schemaVersion", "status"];
  const candidateKeys = ["commit", "gates", "media", "schemaVersion", "status"];
  const factReviewKeys = [
    "ordinal", "pictureLockCandidateSha256", "replyCommitMode", "replyMailboxBlobOid",
    "replyMailboxCommit", "replyMailboxEntrySha256", "requestMailboxBlobOid",
    "requestMailboxCommit", "requestMailboxEntrySha256", "reviewRequestId",
    "verdictEnvelopeSha256", "verdictPayloadSha256",
  ];
  if (pictureLock?.schemaVersion !== 1 || pictureLock?.status !== "picture-lock" || !Array.isArray(pictureLock?.gates) ||
      Object.keys(pictureLock).sort().join("\0") !== acceptedKeys.join("\0")) {
    throw new Error("picture-lock.json.gates must be the native gate array");
  }
  if (!/^[0-9a-f]{64}$/.test(pictureLockSha256 ?? "") || !/^[0-9a-f]{64}$/.test(pictureLockCandidateSha256 ?? "") || pictureLock.candidateSha256 !== pictureLockCandidateSha256) {
    throw new Error("Accepted picture lock does not bind the computed candidate/file hashes");
  }
  if (candidate?.schemaVersion !== 1 || candidate?.status !== "candidate" ||
      Object.keys(candidate).sort().join("\0") !== candidateKeys.join("\0")) {
    throw new Error("Hash-named picture-lock candidate has the wrong closed phase schema");
  }
  if (candidate.commit !== pictureLock.commit || stableJson(candidate.media) !== stableJson(pictureLock.media) || stableJson(candidate.gates) !== stableJson(pictureLock.gates)) {
    throw new Error("Accepted picture lock does not preserve its immutable candidate");
  }
  if (Object.keys(pictureLock?.factReview ?? {}).sort().join("\0") !== factReviewKeys.join("\0") ||
      pictureLock.factReview.pictureLockCandidateSha256 !== pictureLockCandidateSha256) {
    throw new Error("Accepted picture lock fact review targets another candidate");
  }
  const factReview = pictureLock.factReview;
  for (const name of ["pictureLockCandidateSha256", "verdictEnvelopeSha256", "verdictPayloadSha256", "requestMailboxEntrySha256", "replyMailboxEntrySha256"]) {
    if (!/^[0-9a-f]{64}$/.test(factReview[name] ?? "")) throw new Error(`Accepted factReview has malformed ${name}`);
  }
  for (const name of ["requestMailboxCommit", "requestMailboxBlobOid", "replyMailboxCommit", "replyMailboxBlobOid"]) {
    if (!/^[0-9a-f]{40}$/.test(factReview[name] ?? "")) throw new Error(`Accepted factReview has malformed ${name}`);
  }
  if (!/^[0-9a-f]{40}$/.test(candidate.commit ?? "") || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(factReview.reviewRequestId ?? "") ||
      !Number.isInteger(factReview.ordinal) || factReview.ordinal < 1 || !["claude-owned", "codex-explicit-handoff"].includes(factReview.replyCommitMode)) {
    throw new Error("Accepted factReview identity/provenance is malformed");
  }
  if (Object.hasOwn(pictureLock, "pictureSha256") || Object.hasOwn(pictureLock, "videoPacketSha256")) {
    throw new Error("picture-lock media hashes must not be flattened");
  }
  if (!/^[0-9a-f]{64}$/.test(pictureLock?.media?.pictureLockMp4Sha256 ?? "") || !/^[0-9a-f]{64}$/.test(pictureLock?.media?.videoPacketSha256 ?? "")) {
    throw new Error("picture-lock.json.media hashes are missing or malformed");
  }
  if (pictureLock.gates.some((entry) => !entry || typeof entry.id !== "string")) {
    throw new Error("picture-lock.json.gates has a malformed entry");
  }
  const results = collectGateResults(pictureLock.gates);
  if (Object.keys(results).length !== pictureLock.gates.length) {
    throw new Error("picture-lock.json.gates contains a duplicate id");
  }
  if (pictureLock.gates.map(({ id }) => id).join("\0") !== REQUIRED_NATIVE_PICTURE_LOCK_GATES.join("\0")) {
    throw new Error("picture-lock.json.gates does not have the exact native ID order");
  }
  return results;
}

export function validateEvidenceBoundGate(entry, expectedInputHashes) {
  if (entry?.status !== "PASS" || !Array.isArray(entry.evidence) || entry.evidence.length === 0) throw new Error(`Required gate ${entry?.id ?? "unknown"} lacks PASS evidence`);
  if (expectedInputHashes.reviewedVideoPacketSha256 && entry.reviewedVideoPacketSha256 !== expectedInputHashes.reviewedVideoPacketSha256) throw new Error(`Gate ${entry.id} was reviewed against another video packet stream`);
  for (const evidence of entry.evidence) {
    if (!/^[0-9a-f]{64}$/.test(evidence.sha256 ?? "")) throw new Error(`Gate ${entry.id} has unhashed evidence`);
    for (const [name, expected] of Object.entries(expectedInputHashes)) {
      if (name === "reviewedVideoPacketSha256") continue;
      if (evidence.inputHashes?.[name] !== expected) throw new Error(`Gate ${entry.id} is stale for ${name}`);
    }
    if (evidence.kind === "manual") {
      if (!evidence.reviewer || !evidence.protocolVersion || !Number.isFinite(Date.parse(evidence.reviewedAt)) || evidence.verdict !== "PASS") throw new Error(`Gate ${entry.id} has incomplete manual evidence`);
    } else if (evidence.kind === "automated") {
      if (!evidence.toolVersion || !/^[0-9a-f]{64}$/.test(evidence.commandSha256 ?? "") || evidence.measurement == null) throw new Error(`Gate ${entry.id} has incomplete measurement evidence`);
    } else {
      throw new Error(`Gate ${entry.id} has unknown evidence kind`);
    }
  }
  return true;
}

export function assertRequiredGatesPassed(results, requiredIds, expectedInputHashesByGate) {
  for (const id of requiredIds) {
    if (results[id]?.id !== id) throw new Error(`Required gate ${id} is missing`);
    const expected = expectedInputHashesByGate[id];
    if (!expected || Object.keys(expected).length === 0) throw new Error(`Required gate ${id} has no declared input binding`);
    validateEvidenceBoundGate(results[id], expected);
  }
  return true;
}

export async function validateMailboxEnvelope(envelope, { mailboxPath, mailboxCommit, reviewRequestEnvelope, replyKind, kind }) {
  if (envelope?.schemaVersion !== 1 || envelope?.kind !== kind || envelope?.reviewer !== "Claude Fable 5") throw new Error("Mailbox envelope schema/kind/reviewer mismatch");
  if (!/^[0-9a-f]{40}$/.test(mailboxCommit ?? "") || envelope?.source?.mailboxCommit !== mailboxCommit) throw new Error("Mailbox commit mismatch");
  const verified = await verifyTrackedMailboxReply({ mailboxPath, mailboxCommit, reviewRequestEnvelope, replyKind });
  const expectedSource = {
    mailboxPath: "docs/collab/inbox-codex.md",
    mailboxCommit: verified.mailboxCommit,
    mailboxBlobOid: verified.mailboxBlobOid,
    commitMode: verified.commitMode,
    entryHeader: verified.entryHeader,
    entrySubheading: verified.entrySubheading,
    status: verified.status,
    payloadSha256: verified.payloadSha256,
    mailboxEntrySha256: verified.mailboxEntrySha256,
  };
  if (stableJson(envelope.source) !== stableJson(expectedSource)) throw new Error("Mailbox reply provenance mismatch");
  if (stableJson(envelope.payload) !== stableJson(verified.payload)) throw new Error("Mailbox envelope payload differs from verified reply payload");
  return verified.payload;
}

export async function validateHistoricalMailboxEnvelope(envelope, { repoRoot, mailboxRepositoryPath, mailboxCommit, reviewRequestEnvelope, replyKind, kind }) {
  const payload = await withDetachedCleanWorktreeAtCommit(repoRoot, mailboxCommit, (verificationRepoRoot) =>
    validateMailboxEnvelope(envelope, { mailboxPath: join(verificationRepoRoot, mailboxRepositoryPath), mailboxCommit, reviewRequestEnvelope, replyKind, kind }));
  await validateCurrentAppendOnlyTarget({
    repoRoot, mailboxPath: mailboxRepositoryPath, ancestorCommit: mailboxCommit,
    requiredSubheading: envelope.source.entrySubheading,
    payloadSha256: envelope.source.payloadSha256,
    mailboxEntrySha256: envelope.source.mailboxEntrySha256,
  });
  return payload;
}

export async function validateClaudeFactVerdict(verdict, { repoRoot, mailboxPath, historical = false, reviewRequestEnvelope, scriptSha256, pictureLockCandidateSha256, acceptedPictureLockSha256, acceptedFactReview, verdictEnvelopeSha256, reviewedCommit, narrationLineSha256s, mailboxCommit }) {
  const reviewRequest = reviewRequestEnvelope.payload;
  if (!/^[0-9a-f]{64}$/.test(acceptedPictureLockSha256 ?? "") || !/^[0-9a-f]{64}$/.test(verdictEnvelopeSha256 ?? "")) throw new Error("Accepted picture-lock/verdict envelope hash is malformed");
  if (reviewRequest.artifactKind !== "picture-lock-candidate" || reviewRequest.artifactSha256 !== pictureLockCandidateSha256 || reviewRequest.pictureLockCandidateSha256 !== pictureLockCandidateSha256) throw new Error("Fact request targets another picture-lock candidate");
  const validateEnvelope = historical ? validateHistoricalMailboxEnvelope : validateMailboxEnvelope;
  const replyOptions = historical
    ? { repoRoot, mailboxRepositoryPath: mailboxPath, mailboxCommit, reviewRequestEnvelope, replyKind: "fact", kind: "claude-fact-verdict-envelope" }
    : { mailboxPath: join(repoRoot, mailboxPath), mailboxCommit, reviewRequestEnvelope, replyKind: "fact", kind: "claude-fact-verdict-envelope" };
  const payload = await validateEnvelope(verdict, replyOptions);
  const expectedRequestBinding = reviewRequestEnvelope.reviewRequestSource;
  if (stableJson(verdict.reviewRequestSource) !== stableJson(expectedRequestBinding)) throw new Error("Fact envelope request provenance mismatch");
  if (payload.reviewRequestId !== reviewRequest.reviewRequestId || payload.ordinal !== reviewRequest.ordinal || payload.artifactSha256 !== reviewRequest.artifactSha256) throw new Error("Fact payload does not bind the committed request");
  if (payload.schemaVersion !== 1 || payload.status !== "PASS") throw new Error("Claude fact review has not passed");
  if (payload.scriptSha256 !== scriptSha256 || payload.pictureLockCandidateSha256 !== pictureLockCandidateSha256 || payload.reviewedCommit !== reviewedCommit) {
    throw new Error("Claude fact review hashes do not match the locked inputs");
  }
  const expectedAcceptedFactReview = {
    reviewRequestId: payload.reviewRequestId,
    ordinal: payload.ordinal,
    pictureLockCandidateSha256,
    verdictEnvelopeSha256,
    verdictPayloadSha256: verdict.source.payloadSha256,
    requestMailboxCommit: verdict.reviewRequestSource.requestMailboxCommit,
    requestMailboxBlobOid: verdict.reviewRequestSource.requestMailboxBlobOid,
    requestMailboxEntrySha256: verdict.reviewRequestSource.mailboxEntrySha256,
    replyMailboxCommit: verdict.source.mailboxCommit,
    replyMailboxBlobOid: verdict.source.mailboxBlobOid,
    replyMailboxEntrySha256: verdict.source.mailboxEntrySha256,
    replyCommitMode: verdict.source.commitMode,
  };
  if (stableJson(acceptedFactReview) !== stableJson(expectedAcceptedFactReview)) throw new Error("Accepted picture-lock factReview provenance does not replay");
  if (!Number.isFinite(Date.parse(payload.reviewedAt ?? ""))) throw new Error("Claude review time is malformed");
  if (!Array.isArray(payload.lineItems) || payload.lineItems.length !== 21 || payload.lineItems.some((item, index) =>
    item.lineNumber !== index + 1 || item.status !== "PASS" || item.narrationTextSha256 !== narrationLineSha256s[index] ||
    !Array.isArray(item.claimsChecked) || item.claimsChecked.length === 0 || !Array.isArray(item.evidence) || item.evidence.length === 0
  )) {
    throw new Error("Claude fact review must pass all 21 narration lines");
  }
  return payload;
}
```

`verifyTrackedMailboxReply()`'s shared internal entry extractor first requires UTF-8 without BOM and repository-standard LF line endings (reject CR bytes), then enforces the protocol byte-for-byte: the entry starts with exactly `## <ISO-8601 UTC ending Z> · from claude`, contains the request-derived unique tertiary subheading exactly once, and its last non-empty line is exactly `STATUS: DONE`. It rejects zero/multiple matching entries for that request ID, another sender, non-UTC time, or text after STATUS. `payloadBytes` are the exact UTF-8 bytes after the opening JSON fence LF through the byte immediately before the closing fence, including any final payload LF. `entryBytes` are the exact UTF-8 bytes from the first `#` of the `##` entry header through the LF immediately after `STATUS: DONE` (or EOF if no final LF), excluding inter-entry blank lines. No newline, whitespace, or Unicode normalization occurs in either hash domain. Voice code consumes the returned hashes and never implements a second extractor.

`withDetachedCleanWorktreeAtCommit()` uses fixed-argv/no-shell `git worktree add --detach <private-mkdtemp> <40-hex>` and always runs `git worktree remove --force` plus private-directory cleanup in `finally`; inside that worktree, the shared `mailbox-evidence.mjs` verifier sees `HEAD === mailboxCommit` and working bytes equal the historical blob. `validateCurrentAppendOnlyTarget()` separately requires the current mailbox to be tracked and byte-clean against current `HEAD`, requires `mailboxCommit` to remain an ancestor of current `HEAD`, parses the current committed mailbox bytes, selects exactly one occurrence of the same target-qualified subheading, and compares its exact payload/entry SHA-256 domains to the envelope. It does **not** compare the whole current mailbox to the historical blob, so unrelated correctly formed newer entries are legal. Tests inject worktree-add/callback/remove failures, prove cleanup, reject a modified/duplicated/deleted current target or dirty current mailbox, and accept two unrelated newer entries.

The shared helper owns the request-ID-to-heading mapping and AGENTS request/reply parser; voice code must not define a second `factVerdictSubheading()`/`finalAckSubheading()` or pass a target-subheading parameter. Request headers are case-sensitive `## <time> · from Codex`; reply headers are case-sensitive `## <time> · from claude`. Its header parser accepts the mailbox’s minute precision (`YYYY-MM-DDTHH:MMZ`), second precision, or seconds with 1–9 fractional digits, always with literal `Z`; it separately rejects impossible calendar/time values, offsets, missing `Z`, another sender, and case drift such as `from codex`, `from CODEX`, or `from Claude`. Fixtures cover both exact sender forms at all three accepted precisions plus case/malformed/offset negatives. The raw Claude JSON payload is forbidden from containing `reviewer`, `mailboxEntrySha256`, `payloadSha256`, response `mailboxPath`, response `mailboxCommit`, response `mailboxBlobOid`, `commitMode`, `entryHeader`, or `entrySubheading`; this removes response-envelope self-reference and keeps sender identity in the protocol header. The importer first authenticates a separately committed immutable review request, then lets `verifyTrackedMailboxReply()` derive the exact reply subheading from that request’s UUIDv4 `reviewRequestId`, never from an unverified CLI heading or artifact SHA alone. It derives the fixed local reviewer identity from the validated `from claude` header and creates `{schemaVersion:1,kind,reviewer:"Claude Fable 5",reviewRequestSource:{mailboxPath:"docs/collab/inbox-claude.md",requestMailboxCommit,requestMailboxBlobOid,entryHeader,entrySubheading,mailboxEntrySha256},source:{mailboxPath,mailboxCommit,mailboxBlobOid,commitMode,entryHeader,entrySubheading,status:"DONE",payloadSha256,mailboxEntrySha256},payload}` only after hashing both immutable committed entries. `source.mailboxCommit`, `source.mailboxBlobOid`, and `source.commitMode` are copied verbatim from the freshly returned reply provenance object, never from raw JSON. Tests mutate every byte-domain boundary (opening/closing fence, final newline, STATUS, adjacent blank lines) and prove deterministic hashes without a fixed-point field.

The request entry lives in `docs/collab/inbox-claude.md`, has header `## <ISO UTC Z> · from Codex`, one tertiary request-ID subheading, one fenced JSON object, and final line `STATUS: NEEDS_REPLY`. The shared native fact-request literal at `demo-video/capture/test/fixtures/native-fact-review-request.json` is exactly `### Final-film fact review request · <reviewRequestId>` plus payload `{schemaVersion:1,kind:"final-film-fact-review-request",reviewRequestId,ordinal,artifactKind:"picture-lock-candidate",artifactSha256,pictureLockCandidateSha256,scriptSha256,reviewedCommit,requestCreatedAt}` with `artifactSha256 === pictureLockCandidateSha256`, where that SHA is both the immutable candidate bytes and basename and `reviewedCommit === candidate.commit`; the accepted picture-lock SHA is deliberately absent. The same fixture also supplies the exact `reviewRequestSource` and expected response-binding keys. Its closed envelope shape is `{schemaVersion:1,kind:"final-film-fact-review-request-envelope",reviewRequestSource:{mailboxPath:"docs/collab/inbox-claude.md",requestMailboxCommit,requestMailboxBlobOid,entryHeader,entrySubheading,mailboxEntrySha256},payload:<exact raw request>}`. The analogous final request is exactly `### Final-master QA review request · <reviewRequestId>` plus payload `{schemaVersion:1,kind:"final-master-qa-review-request",reviewRequestId,ordinal,artifactKind:"final-master",artifactSha256,finalMp4Sha256,finalSrtSha256,candidateLedgerSha256,factVerdictSha256,reviewedCommit,attemptChainSha256,requestCreatedAt}` with `artifactSha256 === finalMp4Sha256`; `candidateLedgerSha256` and `attemptChainSha256` are recomputed from their explicit immutable content-addressed files, never from mutable conventional filenames. It is wrapped by the same closed envelope pattern with kind `final-master-qa-review-request-envelope`. `reviewRequestId` is generated once with `crypto.randomUUID()` and cannot be supplied by CLI; `ordinal` starts at 1 and increases by exactly one for the same internal `requestKind`/`artifactSha256`; all context fields are recomputed from actual bytes. Internal `requestKind` is the closed enum `"fact" | "final-ack"`; the long raw `kind` strings are payload values only. Fixed CLI modes `--append-fact-review-request` and `--append-final-qa-review-request` map once to those short enum values before the shared API. `verifyCommittedReviewRequest()` requires an explicit 40-hex request commit, obtains its blob OID from Git, requires that commit to introduce exactly one new request ID, requires exact Codex attribution and a mailbox-only diff, replays the no-gap ordinal chain for the same kind/artifact, and requires the selected request to be the latest ordinal at that request commit. At first post-commit verification the current request mailbox may equal that blob; every later preflight/execute/accept verification runs the provenance check in a detached clean worktree at the historical request commit, then separately requires current `HEAD` to descend from it and the exact request entry bytes/ID to remain unique and unchanged while permitting unrelated newer entries. It returns the exact request envelope above. Missing/forged provenance, ID reuse across kinds/artifacts, duplicate request/reply subheading, skipped/repeated ordinal, stale context, request target already present in the parent, a modified current target, or a non-mailbox path in the request commit fails. Voice tests parse that file unchanged and deep-compare its raw request, `reviewRequestSource`, and response-binding literals rather than maintaining a differently named adapter.

A Claude reply payload must repeat exact `reviewRequestId`, `ordinal`, and `artifactSha256`; the importer compares all three with the separately authenticated request commit/blob/entry before evaluating business fields, and stores that request provenance only in the local envelope. A valid `FAIL` reply or an invalid/malformed reply remains append-only evidence and never becomes PASS. To ask again, Codex creates and immediately commits a **new** request with ordinal +1 and a fresh request ID for the same kind/artifact; Claude replies under the new request-qualified subheading. The importer accepts only the latest requested ordinal for that kind/artifact and exactly one reply for that request ID, so old FAIL/malformed history cannot poison a corrected response and a late response to a superseded ordinal cannot pass. Fact and final-ack fixtures each cover `(ordinal 1 FAIL -> committed ordinal 2 request -> ordinal 2 PASS)` and `(ordinal 1 malformed -> committed ordinal 2 request -> ordinal 2 PASS)`, plus late-old-response and duplicate-current-request negatives.

The shared fact fixture’s expected reply binding uses `pictureLockCandidateSha256`, never accepted `pictureLockSha256`. Tests explicitly reject a request or reply with `artifactKind:"picture-lock"`, a `pictureLockSha256` raw field, an accepted-file SHA substituted for `artifactSha256`, candidate SHA/filename/content drift, an accepted object substituted for the candidate, or an accepted `factReview` summary that differs by any request/reply/envelope/payload provenance byte. A positive test computes the accepted file SHA only after assembling its verified `factReview` and proves that changing only accepted-container bytes cannot retroactively change the candidate-bound request/verdict.

Implement the binding maps as constants, not caller-supplied JSON. Recompute the actual input picture-lock MP4’s whole-file SHA-256 and H.264 packet-payload SHA-256 independently. Require `pictureLock.media.pictureLockMp4Sha256` and `pictureLock.media.videoPacketSha256` to match those respective values. Every upstream picture gate binds its top-level `reviewedVideoPacketSha256`, every evidence member’s `inputHashes.videoPacketSha256`, and every evidence member’s `inputHashes.inputScriptSha256`; `expectedPictureBindings()` maps the actual local `inputHashes.scriptSha256` to that last native field name. `silentReview`, `expertReview`, `legibility720p`, `calloutOcclusion`, `checkpoints`, `privacy`, and `actionWindows` additionally bind their source review/manifest SHA named by the picture-lock schema. Never require a muted post-picture whole-file SHA to equal the later audio-muxed picture-lock MP4 SHA. Tests reject a wrong/missing gate/evidence packet hash or the wrong script-key spelling even when all other evidence matches. A positive test loads the shared literal unchanged and passes using `scriptSha256 = "12".repeat(32)` mapped to `inputScriptSha256`; a positive remux fixture changes only MP4 container/audio metadata, has a different whole-file SHA but an identical copied H.264 packet hash, and preserves the visual gates once the new whole-file SHA is separately locked. Changing one video packet fails.

| gate | required current-file bindings |
|---|---|
| `scriptHash` | `scriptSha256` |
| `scratchTiming` | `scriptSha256`, `scratchAudioSha256`, `scratchTimingSha256` |
| `captionLayout`, `captionRoundTrip` | `scriptSha256`, `scratchTimingSha256`, `scratchCaptionTimingSha256`, `scratchCaptionSha256` |
| `captionOcclusion` | `pictureSha256`, `scratchCaptionTimingSha256`, `scratchCaptionSha256`, `scratchCaptionReviewSha256` |
| `claudeFactReview` | `scriptSha256`, accepted `pictureLockSha256`, `pictureLockCandidateSha256`, `pictureLockFactReviewSha256`, `factVerdictSha256`, `factReviewRequestCommit`, `factReviewRequestBlobOid`, `factReviewRequestEntrySha256`, `claudeMailboxCommit`, `claudeMailboxBlobOid`, `claudeMailboxCommitMode`, `claudeMailboxEntrySha256` |
| `ownerVoiceSelection` | `scriptSha256`, accepted `pictureLockSha256`, `pictureLockCandidateSha256`, `voiceSelectionSha256` |

Paid-request gates add: `providerCapability` binds the capability and voice-selection hashes; `requestLock` binds every input hash plus the canonical lock hash; `ownerVoiceApproval` and `keyRestrictionAttestation` bind approval, capability, and lock hashes. Tests iterate every required field, deleting or mutating it one at a time, and assert the gate fails.

`expectedPreCapabilityBindings()` constructs the `claudeFactReview` row only after all three local values exist: recomputed accepted-file `pictureLockSha256`, recomputed hash-named `pictureLockCandidateSha256`, and recomputed canonical `pictureLockFactReviewSha256`. It then adds the authenticated request/reply provenance hashes from the replayed envelope. `buildMeasuredPreCapabilityGates()` may emit PASS only when `validateClaudeFactVerdict()` returned and those exact values equal the accepted object, candidate, request, reply, and local envelope; it never reads an accepted SHA from Claude’s payload. Mutating only accepted container bytes invalidates the accepted-file binding while leaving the historical candidate verdict valid; mutating candidate/request/reply bytes invalidates both acceptance replay and the gate.

`pictureLockSha256` is a local downstream hash of the exact accepted `picture-lock.json` bytes; it is never placed in the candidate-bound raw fact request or verdict. `pictureLockCandidateSha256` is recomputed from the explicit hash-named candidate path and must equal its basename, accepted `pictureLock.candidateSha256`, the raw request/verdict candidate field, and accepted `factReview.pictureLockCandidateSha256`. `pictureLockFactReviewSha256` is `sha256(Buffer.from(stableJson(pictureLock.factReview), "utf8"))` with no trailing newline. The caller constructs the expected fact object only from actual accepted/candidate/script/envelope bytes:

```js
const factReviewRequestEnvelope = await verifyCommittedReviewRequest({
  repoRoot,
  mailboxPath: "docs/collab/inbox-claude.md",
  mailboxCommit: explicitFactReviewRequestCommit,
  requestKind: "fact",
  artifactSha256: inputHashes.pictureLockCandidateSha256,
});
const expectedFactInputs = Object.freeze({
  repoRoot,
  mailboxPath: "docs/collab/inbox-codex.md",
  historical: true,
  reviewRequestEnvelope: factReviewRequestEnvelope,
  scriptSha256: inputHashes.scriptSha256,
  pictureLockCandidateSha256: inputHashes.pictureLockCandidateSha256,
  acceptedPictureLockSha256: inputHashes.pictureLockSha256,
  acceptedFactReview: pictureLock.factReview,
  verdictEnvelopeSha256: inputHashes.factVerdictSha256,
  reviewedCommit: pictureLockCandidate.commit,
  narrationLineSha256s: canonicalBeats.map(sha256Text),
  mailboxCommit: factVerdict.source.mailboxCommit,
});
await validateClaudeFactVerdict(factVerdict, expectedFactInputs);
```

The local envelope source stores the mailbox commit, Git blob OID, verified commit mode, exact entry header/subheading, and both byte-domain hashes; its raw payload stores the reviewed code commit. The commit is read from the envelope only as the immutable Git object locator, then independently authenticated; every business-data expectation still comes from actual local inputs. Never source expected fact values from fields inside the object being reviewed, accept caller-declared expected values, or synthesize a PASS before Claude’s committed message exists.

`mailbox-evidence.mjs` exposes the native-owned protocol API unchanged:

```js
export async function appendReviewRequest({ repoRoot, mailboxPath, requestKind, inputs, now });
export async function verifyCommittedReviewRequest({ repoRoot, mailboxPath, mailboxCommit, requestKind, artifactSha256 });
export async function verifyTrackedMailboxReply({ mailboxPath, mailboxCommit, reviewRequestEnvelope, replyKind });
```

`evidence-artifacts.mjs` is a zero-network, fixed-mode binder/CLI adapter with these voice-specific exports:

```js
export async function importClaudeFactVerdict({ mailboxPath, mailboxCommit, requestMailboxPath, requestMailboxCommit, scriptPath, pictureLockPath, pictureLockCandidatePath, outputPath });
export async function bindOwnerVoiceSelection({ decisionInputPath, scriptPath, pictureLockPath, pictureLockCandidatePath, outputPath });
export async function bindScratchCaptionReview({ reviewInputPath, picturePath, pictureLockPath, srtPath, captionTimingPath, outputPath });
export async function bindOwnerVoiceApproval({ decisionInputPath, lockPath, providerCapabilityPath, voiceSelectionPath, outputPath });
export async function importClaudeFinalAck({ mailboxPath, mailboxCommit, requestMailboxPath, requestMailboxCommit, candidateLedgerPath, videoPath, srtPath, factVerdictPath, attemptChainPath, attemptRoot, outputPath });
```

All inputs are regular non-symlink files inside the repository; every binder output goes through `recoverImmutableArtifactTemps()` and `publishImmutableJsonNoClobber()` at mode `0600`, never a direct canonical `wx` write. Both `evidence-artifacts.mjs` and `release-gates.mjs` import—not re-specify—the dependency-free protocol from `scripts/lib/mailbox-evidence.mjs`; `evidence-artifacts.mjs` uses `./lib/mailbox-evidence.mjs`, while `release-gates.mjs` uses `./mailbox-evidence.mjs`. That module, created by the prerequisite native plan, is the sole owner of request parsing/provenance and the three exact exports above; neither consumer imports the other, and neither imports `fact-review-packet.mjs`, preventing a CLI/library cycle. Both `requestKind` and `replyKind` are exactly `"fact"` or `"final-ack"`; the helper alone maps them to the long raw kind, request-ID-qualified heading, and closed schema. The CLI adapter recomputes actual artifact/context inputs and passes the closed short `requestKind` plus inputs to `appendReviewRequest()`; fact inputs are exactly `{pictureLockCandidatePath,scriptPath}` and final-ack inputs are exactly `{finalMp4Path,finalSrtPath,candidateLedgerPath,factVerdictPath,attemptChainPath}`. The shared helper scans the committed request chain, generates a fresh UUIDv4 internally, assigns the next exact ordinal, and atomically prepends one request entry without accepting an ID/ordinal/hash from CLI. It does not claim the request is usable until the mailbox-only commit is supplied as `mailboxCommit` to `verifyCommittedReviewRequest()`. The fact importer re-hashes the accepted picture-lock file and its explicitly supplied hash-named candidate, verifies accepted/candidate equality and accepted `factReview`, authenticates the committed candidate request and reply, recomputes all 21 line hashes, and validates/reuses the same local envelope already produced by native acceptance; it never creates a new request or substitutes the accepted SHA for the candidate SHA. The selection binder requires a local input object containing the complete owner decision text, hashes that text, emits only the redacted selection schema bound to both accepted and candidate SHAs, and never invents `capabilityLookupApproved`. The caption binder requires the reviewer-authored complete checkpoint array, derives file hashes, checks cue/key-region coverage, and emits the bound review; a top-level boolean is insufficient. The approval binder requires the owner-authored complete approval message, exact lock-derived values, capability/cost fields, credential-source hash, and key-restriction object; it hashes the message, omits the full prose, calls both approval validators, and emits schema v2. The final-ack importer recomputes final MP4/SRT/fact/candidate-ledger hashes and the explicitly supplied immutable attempt-chain SHA, requires the latter to equal the candidate ledger and authenticated request, and calls the same helper with `replyKind:"final-ack"`. Neither importer accepts `--subheading`, `--reply-kind`, a caller-provided request ID/ordinal, or an inferred attempt-chain sibling; fixed CLI mode selects the enum, and an envelope carrying a non-derived subheading/request binding is rejected. Tests use temporary Git repositories and the exact native shared literal fixture, cover historical request/reply chains, correction after FAIL/malformed, duplicate-current ambiguity, stale/coverage/cost/scope/nonce/final-ack attempt-count cases, missing/wrong explicit attempt-chain files, and assert no output on failure.

Claude must commit its own `docs/collab/inbox-codex.md` reply, or explicitly hand off the exact reply bytes for a separate commit, before either importer runs. `--mailbox-commit` is a required explicit 40-hex commit, never runtime `HEAD` or “latest commit touching the file.” The shared `mailbox-evidence.mjs` verifier is the single provenance contract: it requires the mailbox to be tracked, the commit to exist and be an ancestor, the commit blob OID/raw bytes to equal the working file at import time, the target reply to be introduced in that commit, and either exact Claude author/co-author attribution (`commitMode:"claude-owned"`) or an exact one-path Codex commit whose target entry contains `HANDOFF: Codex may commit this exact verdict entry and no other uncommitted path.` immediately before `STATUS: DONE` (`commitMode:"codex-explicit-handoff"`). The envelope records all three returned provenance fields. Reject an untracked path, nonexistent/non-ancestor commit, missing/forged blob OID or commit mode, dirty/stale working copy, blob/working mismatch, wrong attribution, absent/misplaced handoff, extra-path handoff commit, target already present in the first parent, symlink, or provenance supplied inside raw payload.

Append-only history means the final-ack commit will contain later bytes than the earlier fact commit. Final acceptance therefore re-runs the same native verifier for **both** envelopes: for the historical fact commit it invokes the helper inside a disposable detached clean worktree at that exact commit (so the helper’s working-bytes equality remains true), and for the latest final acknowledgment it invokes the helper in the current clean worktree. It independently compares each freshly returned blob OID and commit mode to that envelope, validates each against its own committed blob, requires the fact commit to be an ancestor of the final-ack commit, and requires current working mailbox bytes to equal the latest final-ack blob. It never requires one working file to equal both historical blobs or trusts recorded provenance without revalidation. `demo-video/final-evidence.json` records `{mailboxCommit,mailboxBlobOid,commitMode}` for both fact and final-ack sources, so a clean clone can reproduce each envelope from Git alone. Fixtures cover stale/untracked/missing blobs, forged/missing source fields, wrong attribution, absent or misplaced handoff, an extra-path handoff commit, target present in the parent, dirty working bytes, non-ancestor commits, a changed historical entry, and clean-clone reconstruction of both commits. These fixtures and the helper are shared with the native plan; the voice plan must not maintain a divergent provenance literal or validator.

- [ ] **Step 4: Run tests and commit**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
node --test test/immutable-artifact.test.mjs test/release-gates.test.mjs test/evidence-artifacts.test.mjs
/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/scripts/mandatory-plan-precommit.sh
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add demo-video/capture/scripts/lib/release-gates.mjs demo-video/capture/test/release-gates.test.mjs \
  demo-video/capture/scripts/evidence-artifacts.mjs demo-video/capture/test/evidence-artifacts.test.mjs
git commit -m "test(video): require fact and release gates before voice" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
```

## Task 4: Bind current provider capability into an immutable narration request lock

**Files:**
- Create: `demo-video/capture/scripts/elevenlabs-capability.mjs`
- Create: `demo-video/capture/test/elevenlabs-capability.test.mjs`
- Create: `demo-video/capture/scripts/lib/elevenlabs-lock.mjs`
- Create: `demo-video/capture/test/elevenlabs-lock.test.mjs`
- Modify: `demo-video/capture/.gitignore`

- [ ] **Step 1: Write current-capability and lock validation tests**

Use injected fake GET responses for `/v1/models` and `/v1/voices/{voice_id}`. Assert zero POSTs, reject redirects, and require a unique selected model whose current object says `can_do_text_to_speech:true` and exposes a finite positive `maximum_text_length_per_request`; require the requested voice GET to return that exact ID and list the selected model ID in its documented `high_quality_base_model_ids`. If that field is absent, malformed, or does not contain the model, fail closed rather than assuming compatibility. The redacted capability artifact records selected fields, response-body hashes, `checkedAt`, and `expiresAt`, but no key, headers, or raw response body. Tests reject a missing/duplicate model, missing/false capability, invalid/absent maximum length, mismatched voice, absent/mismatched supported-model list, stale artifact, response-hash mutation, and an undocumented output format. Rate-looking response fields still produce `billingFormula:null`/`estimatedCredits:"unknown"`; numeric estimate injection and an owner approval that omits explicit unknown-spend acknowledgment both fail.

Lock tests require no default voice and bind every byte that can affect the paid request:

```js
const generation = {
  voiceId: "voice_test_7H2mQ9L4",
  modelId: "eleven_multilingual_v2",
  outputFormat: "mp3_44100_128",
  enableLogging: true,
  seed: 20260820,
  applyTextNormalization: "auto",
  pronunciationDictionaryLocators: [],
  voiceSettings: {
    stability: 0.58,
    similarity_boost: 0.75,
    style: 0,
    speed: 1,
    use_speaker_boost: false
  }
};
```

Mutate creation time, accepted picture-lock SHA, immutable picture-lock-candidate SHA, accepted `factReview` SHA, picture whole-file hash, picture video-packet hash, review ledger, script, complete request text, voice, model, provider-capability hash/expiry/maximum, endpoint path, query, normalization, dictionary list/version/order, output format, seed, every voice setting, fact-verdict/mailbox commit/mailbox-entry hash, scratch audio/narration-timing/caption-timing/SRT/review hashes, voice-selection hash, generation authorization ID/ordinal, and predecessor-attempt hash; each mutation must change the canonical lock hash or fail validation. Mutating the separate owner approval must fail `validateOwnerApproval()`; it does **not** alter the already-hashed base lock. Missing/placeholder voice, over-limit text, stale capability, stale candidate/request/reply provenance, stale fact/caption evidence, or a lock text that is self-consistent but differs from the currently parsed script all fail before a POST transport exists.

- [ ] **Step 2: Run and confirm RED**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
ELEVENLABS_DISABLE_NETWORK=1 node --test test/elevenlabs-capability.test.mjs test/elevenlabs-lock.test.mjs
```

Expected: both implementation modules are missing.

- [ ] **Step 3: Implement a read-only, fail-closed capability snapshot**

`fetchCurrentCapability({ apiKey, voiceId, modelId, getJson, now })` is implemented now but is operationally invoked only after Task 7’s offline gates. It permits exactly these two GETs, with `redirect:"error"` and no retry: `https://api.elevenlabs.io/v1/models` and `https://api.elevenlabs.io/v1/voices/${encodeURIComponent(voiceId)}`. It rejects any method other than GET and any host/path not on that allowlist. It returns:

```js
{
  schemaVersion: 1,
  provider: "elevenlabs",
  modelId,
  voiceId,
  canDoTextToSpeech: true,
  voiceSupportedModelIds,
  maximumTextLengthPerRequest,
  billingFormula: null,
  documentedOutputFormats: ["mp3_44100_128"],
  modelsResponseSha256,
  voiceResponseSha256,
  checkedAt: now.toISOString(),
  expiresAt: new Date(now.valueOf() + 24 * 60 * 60 * 1000).toISOString()
}
```

`maximumTextLengthPerRequest` comes from the current selected model response—never from a hard-coded 10,000. `voiceSupportedModelIds` is the exact validated `high_quality_base_model_ids` array from the voice response and must include `modelId` both when written and when revalidated. Do not infer credits from a rate-looking field. Unless the current official response/documentation supplies a complete versioned billing formula covering this exact model, request type, text normalization, rounding, and output, record `billingFormula:null` and `estimatedCredits:"unknown"`; this plan assumes that conservative branch. There is no undefined or heuristic `estimateCredits()` function. If a future implementation supports a documented complete formula, it must add the formula/version fields plus independent boundary/rounding fixtures before numeric estimates are permitted. `validateProviderCapability()` recomputes the artifact hash from the exact file, checks both timestamps against the injected current time, exact voice/model/output format, supported-model membership, and request-character count. The CLI prints only model/voice IDs, limit, expiry, response hashes, and `estimatedCredits:"unknown"`.

Before issuing either GET, the capability CLI runs `recoverImmutableArtifactTemps()` for its fixed output. A complete, still-fresh, input-bound capability temp is published and reused with zero GETs; a stale/partial temp is journaled before the ordinary two-GET phase. The resulting redacted capability is published only through `publishImmutableJsonNoClobber()`. Tests crash after GET completion at every temp/publish boundary and prove restart performs zero duplicate GETs when a valid full temp exists, never exposes partial canonical JSON, and never serializes a key/header.

- [ ] **Step 4: Implement canonical request and lock hashing**

Import the single native-owned `stableJson()` implementation from `scripts/lib/immutable-artifact.mjs`; do not define a second canonical serializer. The request text is exactly the 21 script paragraphs joined with two newline characters; do not replace `LevelField` or `DreamDEX`, and do not add hidden pronunciation aliases.

```js
export function createNarrationRequestLock(input) {
  if (!input.voiceId || /placeholder|default|rachel/i.test(input.voiceId)) throw new Error("An explicit owner-selected voice ID is required");
  validateProviderCapability(input.providerCapability, input);
  const requestText = canonicalNarration(input.beats);
  const modelCharacterLimit = input.providerCapability.maximumTextLengthPerRequest;
  if ([...requestText].length > modelCharacterLimit) throw new Error("Locked narration exceeds the current model request limit");
  if (!/^[0-9a-f-]{20,}$/i.test(input.generationAuthorizationId ?? "")) throw new Error("A unique generation authorization ID is required");
  if (input.generationOrdinal !== 1 || input.supersedesAttemptSha256 !== null) throw new Error("The initial plan permits generation ordinal 1 only");
  return {
    schemaVersion: 2,
    createdAt: input.now.toISOString(),
    endpoint: {
      method: "POST",
      origin: "https://api.elevenlabs.io",
      path: `/v1/text-to-speech/${encodeURIComponent(input.voiceId)}/with-timestamps`,
      query: { enable_logging: "true", output_format: input.outputFormat },
    },
    pictureLockSha256: input.pictureLockSha256,
    pictureLockCandidateSha256: input.pictureLockCandidateSha256,
    pictureLockFactReviewSha256: input.pictureLockFactReviewSha256,
    pictureSha256: input.pictureSha256,
    pictureVideoPacketSha256: input.videoPacketSha256,
    reviewLedgerSha256: input.reviewLedgerSha256,
    scriptSha256: input.scriptSha256,
    factVerdictSha256: input.factVerdictSha256,
    factReviewRequestId: input.factVerdict.payload.reviewRequestId,
    factReviewRequestOrdinal: input.factVerdict.payload.ordinal,
    factReviewRequestCommit: input.factVerdict.reviewRequestSource.requestMailboxCommit,
    factReviewRequestBlobOid: input.factVerdict.reviewRequestSource.requestMailboxBlobOid,
    factReviewRequestEntrySha256: input.factVerdict.reviewRequestSource.mailboxEntrySha256,
    claudeMailboxCommit: input.factVerdict.source.mailboxCommit,
    claudeMailboxBlobOid: input.factVerdict.source.mailboxBlobOid,
    claudeMailboxCommitMode: input.factVerdict.source.commitMode,
    claudeMailboxEntrySha256: input.claudeMailboxEntrySha256,
    scratchAudioSha256: input.scratchAudioSha256,
    scratchTimingSha256: input.scratchTimingSha256,
    scratchCaptionTimingSha256: input.scratchCaptionTimingSha256,
    scratchCaptionSha256: input.scratchCaptionSha256,
    scratchCaptionReviewSha256: input.scratchCaptionReviewSha256,
    voiceSelectionSha256: input.voiceSelectionSha256,
    providerCapabilitySha256: input.providerCapabilitySha256,
    providerCapabilityCheckedAt: input.providerCapability.checkedAt,
    providerCapabilityExpiresAt: input.providerCapability.expiresAt,
    requestText,
    requestTextSha256: sha256Text(requestText),
    voiceId: input.voiceId,
    modelId: input.modelId,
    modelCharacterLimit,
    outputFormat: input.outputFormat,
    enableLogging: true,
    seed: 20260820,
    applyTextNormalization: "auto",
    pronunciationDictionaryLocators: [],
    voiceSettings: { stability: 0.58, similarity_boost: 0.75, style: 0, speed: 1, use_speaker_boost: false },
    requestCharacters: [...requestText].length,
    estimatedCredits: "unknown",
    generationAuthorizationId: input.generationAuthorizationId,
    generationOrdinal: 1,
    supersedesAttemptSha256: null,
  };
}
```

Import `canonicalNarration()` and `parseCanonicalNarrationBeats()` from Task 1’s `lib/narration.mjs`; Task 4 must not create a second parser or normalization policy.

`validateNarrationRequestLockAgainstInputs(lock, inputs, now)` hashes actual files, independently computes the input picture MP4 packet-payload hash, validates `pictureLock.media.pictureLockMp4Sha256`/`videoPacketSha256`, validates the current capability artifact and freshness, and calls `canonicalNarration(inputs.beats)` where `inputs.beats` were parsed from the actual script file. It requires both `lock.requestText === canonicalNarration(inputs.beats)` and its SHA-256, `lock.pictureSha256` equal to the actual picture-lock MP4 whole-file hash, `lock.pictureVideoPacketSha256` equal to the independently computed/copied H.264 packet hash, exact immutable endpoint/query/body-related fields, all other exact input hashes—including the fact envelope’s freshly verified mailbox commit/blob/mode—and `requestCharacters <= modelCharacterLimit`. A matching self-hash alone is never sufficient. `buildTimedSpeechRequest(lock)` is the sole request builder and returns exactly:

```js
{
  url: new URL(`${lock.endpoint.origin}${lock.endpoint.path}?${new URLSearchParams(lock.endpoint.query)}`),
  body: {
    text: lock.requestText,
    model_id: lock.modelId,
    voice_settings: lock.voiceSettings,
    pronunciation_dictionary_locators: lock.pronunciationDictionaryLocators,
    seed: lock.seed,
    apply_text_normalization: lock.applyTextNormalization,
  }
}
```

The `--create-lock` CLI accepts every explicit file argument shown in Task 7, recomputes them, obtains `generationAuthorizationId` from `crypto.randomUUID()` and `createdAt` from an injectable clock, fixes ordinal 1/predecessor null, then uses `recoverImmutableArtifactTemps()` and `publishImmutableJsonNoClobber()` for the lock. It never writes the canonical path directly or overwrites an approved/partially reviewed lock. A complete orphan temp recovers the same nonce/time; a partial temp is journaled before a new nonce may be generated. Tests inject a fixed UUID/time, prove two production UUIDs differ, inject every atomic-publish crash point, and prove no nonce/time can be supplied or overridden through CLI arguments.

To avoid a 24-hour capability expiry leaving the fixed no-clobber paths occupied, implement `abandonExpiredUnconsumedGenerationBundle({ now, capabilityPath, lockPath, approvalPath, attemptRoot, cacheRoot, archiveRoot })`. It succeeds only when the bound capability is expired and there is **no** event for the lock authorization, no matching result/cache directory, and no paid-start evidence anywhere. A mkdir-only empty canonical attempt directory must first pass Task 6’s strict empty-directory repair; any nonempty directory or event blocks archival. The archiver creates and fsyncs `archiveRoot/<bundleSha>.tmp/000-abandon-intent.json` containing reason and exact hashes, then same-filesystem renames each existing capability/lock/approval artifact into that directory, verifies every archived hash, and atomically renames the directory to `archiveRoot/<bundleSha>/` before fsyncing the parent. It never deletes evidence. If interrupted, all create/capability/approval commands remain blocked until `--resume-abandonment` follows the durable journal and completes idempotently. An expired capability with no lock is archived the same way using its artifact SHA as `bundleSha`.

Task 6 exposes only zero-network direct CLI modes `--abandon-expired-unconsumed-lock` and `--resume-abandonment`; do not add npm aliases. Task 4 unit tests inject a clock and crash at every intent/rename/fsync step; require successful resume, reject unexpired or symlinked inputs, hash mismatch, any attempt event/cache, partial archive without a valid journal, and reuse of an old approval. Only after the archive is complete may the ordinary fixed paths receive a fresh capability, a freshly generated authorization ID/lock, and a new owner approval.

The lock does not contain credentials or a self-referential approval. The separate approval schema is exact:

```js
{
  schemaVersion: 2,
  approvedBy: "owner",
  approvedAt: "ISO-8601 timestamp",
  requestLockSha256: "hashCanonicalJson(lock)",
  generationAuthorizationId: lock.generationAuthorizationId,
  generationOrdinal: lock.generationOrdinal,
  voiceId: lock.voiceId,
  modelId: lock.modelId,
  outputFormat: lock.outputFormat,
  requestCharacters: lock.requestCharacters,
  estimatedCredits: lock.estimatedCredits,
  estimateUnknownAcknowledged: lock.estimatedCredits === "unknown",
  maximumAuthorizedCredits: 10000,
  providerCapabilitySha256: lock.providerCapabilitySha256,
  providerCapabilityExpiresAt: lock.providerCapabilityExpiresAt,
  credentialDocumentSha256: "owner-designated document SHA-256",
  keyRestrictionAttested: true,
  keyRestrictions: {
    allowedOperations: [
      "GET /v1/models",
      "GET /v1/voices/{voice_id}",
      "POST /v1/text-to-speech/{voice_id}/with-timestamps",
      "GET /v1/history",
      "GET /v1/history/{history_item_id}",
      "GET /v1/history/{history_item_id}/audio"
    ],
    creditQuotaAtMost: 10000,
    ipAllowlistEnabled: true
  },
  decisionTextSha256: "SHA-256 of the complete owner approval message"
}
```

The numeric `10000` above is an example fixture in tests; production values come only from the owner’s message. Under this plan `estimatedCredits` is exactly `"unknown"`, so the owner must explicitly acknowledge unknown spend while approving the exact character count, model, request-lock hash, and one finite positive maximum-credit ceiling; `keyRestrictions.creditQuotaAtMost` must be finite, positive, and no greater than that ceiling. A numeric estimate is rejected unless the separately versioned official-formula implementation and tests described above exist. `validateOwnerApproval(approval, lock, requestLockSha256, voiceSelection)` requires exact equality for every lock-derived field, exact credential-source hash from the bound owner voice-selection record, the exact allowed-operation set with no extras, non-placeholder ISO/message hashes, and timestamp order `voiceSelection.selectedAt <= capability.checkedAt <= lock.createdAt <= approval.approvedAt <= capability.expiresAt`. Any mismatch fails; no permissive additional generation is implied.

`validateKeyRestrictionAttestation(approval, lock)` separately requires `keyRestrictionAttested === true`, finite positive ceilings/quotas, exact allowed-operation-set equality, and IP allowlisting attested. It requires `lock.estimatedCredits === "unknown"`, `estimateUnknownAcknowledged === true`, the owner’s finite ceiling, and a restricted-key quota no greater than that ceiling. Reject all other estimate/ceiling/quota types—including `null`, numeric strings, `NaN`, and infinity—so JavaScript coercion cannot create a PASS.

- [ ] **Step 5: Add generated paths to `.gitignore`**

```gitignore
tts-cache/
runs/*/picture-lock-work/final/provider-capability.json
runs/*/picture-lock-work/final/*-input.json
runs/*/picture-lock-work/final/owner-voice-selection.json
runs/*/picture-lock-work/final/owner-voice-approval.json
runs/*/picture-lock-work/final/attempts/
runs/*/picture-lock-work/final/attempt-chains/
runs/*/picture-lock-work/final/elevenlabs-secret-source.json
runs/*/picture-lock-work/final/review/
runs/*/picture-lock-work/final/releases/
runs/*/picture-lock-work/final/abandoned/
runs/*/picture-lock-work/final/artifact-recovery/
```

- [ ] **Step 6: Run tests and commit**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
ELEVENLABS_DISABLE_NETWORK=1 node --test test/elevenlabs-capability.test.mjs test/elevenlabs-lock.test.mjs
/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/scripts/mandatory-plan-precommit.sh
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add demo-video/capture/scripts/elevenlabs-capability.mjs demo-video/capture/test/elevenlabs-capability.test.mjs \
  demo-video/capture/scripts/lib/elevenlabs-lock.mjs demo-video/capture/test/elevenlabs-lock.test.mjs \
  demo-video/capture/.gitignore
git commit -m "feat(video): bind current capability into one-pass request lock" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
```

## Task 5: Validate the timed response and atomic cache

**Files:**
- Create: `demo-video/capture/scripts/lib/elevenlabs-response.mjs`
- Create: `demo-video/capture/test/elevenlabs-response.test.mjs`
- Create: `demo-video/capture/test/fixtures/elevenlabs-with-timestamps.json`

- [ ] **Step 1: Create a tiny valid offline fixture and failing tests**

The fixture contains a short base64 MP3 generated locally with FFmpeg plus:

```json
{
  "alignment": {
    "characters": ["H","i","."],
    "character_start_times_seconds": [0,0.1,0.2],
    "character_end_times_seconds": [0.1,0.2,0.3]
  }
}
```

Tests inject an audio probe and cover malformed/non-canonical base64 (including valid `TQ==` versus rejected `TQ===`, unpadded, whitespace, and URL-safe variants), missing raw alignment, mismatched text, unequal arrays, regressing start or end time, MP3 codec/sample-rate mismatch, non-finite duration, decode error, audio shorter than the last character, malformed/missing sanitized response-evidence hash, and strict validation before cache reuse. Publication tests inject failure at every stage: staging write/probe/fsync, reservation-temp write/fsync/no-clobber link/directory fsync, canonical `mkdir`, each no-replace data-file link, final `READY` link, canonical/results fsync, reservation unlink, and final reservation-directory fsync. They cover an existing empty canonical directory with no matching reservation (hard fail and byte-for-byte untouched), an existing partial/corrupt cache, a valid completed winner, two simultaneous publishers for one lock, crash recovery before and after every durable boundary, an orphan reservation temp, a durable reservation with live/dead owner, and a crash after `READY` but before reservation cleanup. No test or implementation relies on POSIX directory `rename()` returning `EEXIST`: on conforming systems it may replace an existing empty destination directory. Offline fixtures inject only `{actualCharacterCost:"unknown",responseEvidenceSha256}` or a bounded test integer; none contains a real API key or raw response header. The injected probe captures its child environment and proves `ELEVENLABS_API_KEY` plus every `/key|token|secret|authorization/i` variable is absent.

- [ ] **Step 2: Run and confirm RED**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
ELEVENLABS_DISABLE_NETWORK=1 node --test test/elevenlabs-response.test.mjs
```

Expected: missing module failure.

- [ ] **Step 3: Implement strict response validation**

Public API:

```js
export function validateTimedResponse(response, lock) {
  if (typeof response?.audio_base64 !== "string" || !response.audio_base64.length) throw new Error("Timed response has no audio");
  validateCharacterAlignment(response.alignment, lock.requestText);
  return response.alignment;
}

export async function commitTimedResultAtomically({ response, responseEvidence, lock, cacheRoot, probeAudio, processLiveness = defaultProcessLiveness }) {
  const lockSha256 = hashCanonicalJson(lock);
  const resultsRoot = path.join(cacheRoot, "results");
  const temporaryRoot = path.join(cacheRoot, "tmp");
  const reservationsRoot = path.join(resultsRoot, ".reservations");
  const finalDir = path.join(resultsRoot, lockSha256);
  const temporaryDir = path.join(temporaryRoot, `${lockSha256}.${process.pid}.${randomUUID()}`);
  await mkdir(resultsRoot, { recursive: true, mode: 0o700 });
  await mkdir(temporaryRoot, { recursive: true, mode: 0o700 });
  await mkdir(reservationsRoot, { recursive: true, mode: 0o700 });
  await recoverReservedCachePublication({ resultsRoot, reservationsRoot, temporaryRoot, lock, probeAudio, processLiveness });
  if (await pathExistsNoFollow(finalDir)) return validateCachedTimedResult(finalDir, lock, probeAudio);
  await mkdir(temporaryDir, { recursive: false, mode: 0o700 });
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(response.audio_base64)) throw new Error("Audio is not canonical RFC 4648 base64");
  const audio = Buffer.from(response.audio_base64, "base64");
  if (!audio.length || audio.toString("base64") !== response.audio_base64) throw new Error("Audio base64 does not round-trip canonically");
  await writeFile(path.join(temporaryDir, "narration.mp3"), audio, { flag: "wx" });
  await writeJson(path.join(temporaryDir, "alignment.json"), response.alignment);
  const probe = await probeAudio(path.join(temporaryDir, "narration.mp3"), { env: sanitizedChildEnv() });
  const finalCharacterEnd = response.alignment.character_end_times_seconds.at(-1);
  if (probe.codecName !== "mp3" || probe.sampleRate !== 44100 || !Number.isFinite(probe.duration) || probe.duration <= 0 || probe.decodeErrors !== 0) throw new Error("Cached audio does not match locked MP3 format");
  if (probe.duration + 0.02 < finalCharacterEnd) throw new Error("Audio ends before character alignment");
  validateSanitizedResponseEvidence(responseEvidence, lock);
  await writeJson(path.join(temporaryDir, "result.json"), { schemaVersion: 1, lockSha256, outputFormat: lock.outputFormat, requestTextSha256: lock.requestTextSha256, audioSha256: await sha256File(path.join(temporaryDir, "narration.mp3")), alignmentSha256: await sha256File(path.join(temporaryDir, "alignment.json")), httpStatus: responseEvidence.httpStatus, responseBodySha256: responseEvidence.responseBodySha256, actualCharacterCost: responseEvidence.actualCharacterCost, responseEvidenceSha256: responseEvidence.responseEvidenceSha256, probe });
  const ready = await buildReadyMarker(temporaryDir, lockSha256);
  await writeJson(path.join(temporaryDir, "READY"), ready);
  await fsyncTree(temporaryDir);

  const reservation = await acquireCacheReservationNoReplace({
    reservationsRoot, lockSha256, temporaryDir,
    readySha256: await sha256File(path.join(temporaryDir, "READY")),
  }); // complete temp -> fsync -> hard-link to <lockSha256>.json -> fsync directory
  if (!reservation.acquired) {
    await waitForReservedWinnerOrFailClosed({ reservation, finalDir, lock, probeAudio });
    await journalAndRemoveConcurrentLoser(temporaryDir);
    return validateCachedTimedResult(finalDir, lock, probeAudio);
  }

  if (await pathExistsNoFollow(finalDir)) {
    const winner = await validateCachedTimedResult(finalDir, lock, probeAudio); // empty/partial/corrupt throws; never overwrite it
    await journalAndRemoveConcurrentLoser(temporaryDir);
    await completeAndReleaseCacheReservation({ reservation });
    return winner;
  }

  // mkdir and every link are no-replace operations. READY is linked last and is the
  // sole logical visibility marker; directory rename is deliberately never used.
  await mkdir(finalDir, { recursive: false, mode: 0o700 });
  await fsyncDirectory(resultsRoot);
  for (const name of ["narration.mp3", "alignment.json", "result.json"]) {
    await link(path.join(temporaryDir, name), path.join(finalDir, name));
  }
  await fsyncTree(finalDir);
  await link(path.join(temporaryDir, "READY"), path.join(finalDir, "READY"));
  await fsyncDirectory(finalDir);
  await fsyncDirectory(resultsRoot);
  const validated = await validateCachedTimedResult(finalDir, lock, probeAudio);
  await completeAndReleaseCacheReservation({ reservation, temporaryDir });
  return validated;
}
```

`validateCachedTimedResult(finalDir, lock, probeAudio)` runs before every reuse. It requires the canonical directory `tts-cache/results/<lockSha256>` (no caller override), an exact `READY` marker whose manifest hashes the other three files, exact `result.json` schema/lock/text/output-format values, recomputed audio/alignment hashes, a valid sanitized `actualCharacterCost`/`responseEvidenceSha256` pair, raw alignment validation, MP3/44.1kHz/decode/duration checks, and absence of symlinks or extra credential/header files. An empty or partial pre-existing directory without the exact durable matching reservation is a hard stop, not a cache miss and never a rename target. A canonical directory without `READY` is not reusable; it is recoverable only through `recoverReservedCachePublication()` when the immutable reservation names the exact staging basename/hash and injected process-liveness proves the recorded publisher is dead. Recovery resumes only missing no-replace links, publishes `READY` last, fsyncs the canonical directory/results root, strictly revalidates, journals recovery, then removes/fsyncs the reservation. A live competing reservation is only waited on for a bounded interval; timeout is an ambiguous publication hard stop and never permits another POST. A valid `READY` winner is strictly revalidated before the loser journals/removes its staging tree. Crash after `READY` but before reservation removal validates the winner and safely completes cleanup. Orphan reservation temps, reservations with malformed/dead-unprovable identity, and canonical data not exactly bound to the reservation are quarantined/blocking rather than deleted or overwritten. Every reservation publish/release and canonical creation/link is no-clobber plus file/directory fsync; directory-renaming publication via `fs.rename` is forbidden and a source scan test enforces that invariant.

Production `probeAudio()` and every later FFmpeg/ffprobe child use a fixed allowlist environment such as `PATH`, `HOME`, `TMPDIR`, `LANG`, and locale variables. They never receive `process.env` wholesale. The network client deletes `process.env.ELEVENLABS_API_KEY` immediately after taking its one in-memory copy, so cache/probe code cannot inherit it.

- [ ] **Step 4: Run tests and commit**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
ELEVENLABS_DISABLE_NETWORK=1 node --test test/elevenlabs-response.test.mjs
/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/scripts/mandatory-plan-precommit.sh
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add demo-video/capture/scripts/lib/elevenlabs-response.mjs \
  demo-video/capture/test/elevenlabs-response.test.mjs \
  demo-video/capture/test/fixtures/elevenlabs-with-timestamps.json
git commit -m "feat(video): validate and atomically cache timed voice" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
```

## Task 6: Build the fail-closed one-pass client

**Files:**
- Create: `demo-video/capture/scripts/elevenlabs-final.mjs`
- Create: `demo-video/capture/scripts/elevenlabs-history-recover.mjs`
- Create: `demo-video/capture/test/elevenlabs-client.test.mjs`
- Create: `demo-video/capture/test/elevenlabs-history-recover.test.mjs`
- Create: `demo-video/capture/test/fixtures/elevenlabs-history-item.json`
- Modify: `demo-video/capture/package.json`

- [ ] **Step 1: Write the transport-call-count test matrix**

Every test uses explicit fake GET/POST transports and `ELEVENLABS_DISABLE_NETWORK=1`; `globalThis.fetch` is a throwing sentinel. Assert logical transport calls are:

| condition | capability GET count | TTS POST count |
|---|---:|---:|
| no voice ID or incomplete picture/fact/caption/manual gate | 0 | 0 |
| pre-capability gates pass in ordinary offline preflight | 0 | 0 |
| explicit fake capability mode after all local gates | exactly 2 | 0 |
| stale/tampered capability or text above fetched maximum | 0 | 0 |
| owner approval missing/mismatched/over cost ceiling | 0 | 0 |
| `--force`, redirect, retry, partial, segment, or voice override | 0 | 0 |
| any event exists for the generation authorization without valid cache | 0 | 0 |
| valid cache exists with no exact matching `000-started` event | 0 | 0; hard fail |
| valid cache plus exact nonterminal started chain revalidates | 0 | 0; append one `succeeded-from-cache` terminal |
| valid cache plus an already valid matching success terminal | 0 | 0; idempotent return |
| valid cache with tampered/wrong-authorization attempt chain | 0 | 0; hard fail |
| fake 500, timeout, socket reset, malformed JSON, invalid timed body | 0 | exactly 1 |
| valid timed response | 0 | exactly 1 |

Tests scan stdout, stderr, capability/attempt records, lock, child-process environments, and cache metadata to prove the fake API key, `xi-api-key`, and unrelated fake secret environment variables never appear. They also run `--execute` and capability CLI mode under `ELEVENLABS_DISABLE_NETWORK=1` with no injected test transport and prove each exits before resolving `fetch`, creating a **started** event, or touching the network; the sole exception is that `--execute` may complete the zero-network reconciliation of an already validated cache and already durable matching started chain described in Step 4.

- [ ] **Step 2: Run and confirm RED**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
ELEVENLABS_DISABLE_NETWORK=1 node --test test/elevenlabs-client.test.mjs
```

Expected: missing client module.

- [ ] **Step 3: Implement preflight-only default behavior**

`main()` defaults to `--preflight`; `--execute` is the only TTS-POST-capable mode. Its `--abandon-expired-unconsumed-lock` and `--resume-abandonment` modes call Task 4’s journaled zero-network archiver and cannot resolve a transport. The separate capability CLI permits only `--check-current-capability` and only GETs the two allowlisted endpoints from Task 4. Reject unknown arguments and these names explicitly in both CLIs: `--force`, `--retry`, `--follow`, `--partial`, `--segment`, `--voice`, `--endpoint`, `--cache-root`, and `--attempt-path`.

```js
function measuredGate(id, check, evidence) {
  try {
    check();
    return { id, status: "PASS", evidence };
  } catch (error) {
    return { id, status: "FAIL", evidence, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function evaluatePreCapabilityGates(inputs) {
  const { pictureLock, pictureLockCandidate, reviewLedger, factVerdict, scratchAudioProbe, scratchTiming, scratchCaptionTiming, scratchCues, scratchCaptionReview, voiceSelection, inputHashes } = inputs;
  const pictureGates = importPictureLockGates({
    pictureLock,
    candidate: pictureLockCandidate,
    pictureLockSha256: inputHashes.pictureLockSha256,
    pictureLockCandidateSha256: inputHashes.pictureLockCandidateSha256,
  });
  assertRequiredGatesPassed(pictureGates, REQUIRED_NATIVE_PICTURE_LOCK_GATES, expectedPictureBindings(inputHashes, reviewLedger));
  const factReviewRequestEnvelope = await verifyCommittedReviewRequest({
    repoRoot: inputs.repoRoot,
    mailboxPath: "docs/collab/inbox-claude.md",
    mailboxCommit: inputs.factReviewRequestCommit,
    requestKind: "fact",
    artifactSha256: inputHashes.pictureLockCandidateSha256,
  });
  const expectedFactInputs = {
    repoRoot: inputs.repoRoot,
    mailboxPath: "docs/collab/inbox-codex.md",
    historical: true,
    reviewRequestEnvelope: factReviewRequestEnvelope,
    scriptSha256: inputHashes.scriptSha256,
    pictureLockCandidateSha256: inputHashes.pictureLockCandidateSha256,
    acceptedPictureLockSha256: inputHashes.pictureLockSha256,
    acceptedFactReview: pictureLock.factReview,
    verdictEnvelopeSha256: inputHashes.factVerdictSha256,
    reviewedCommit: pictureLockCandidate.commit,
    narrationLineSha256s: inputs.beats.map(sha256Text),
    mailboxCommit: factVerdict.source.mailboxCommit,
  };
  const validatedFactPayload = await validateClaudeFactVerdict(factVerdict, expectedFactInputs);
  const gates = collectGateResults(buildMeasuredPreCapabilityGates({
    pictureLock, pictureLockCandidate, reviewLedger, factVerdict, validatedFactPayload, expectedFactInputs, scratchAudioProbe, scratchTiming,
    scratchCaptionTiming, scratchCues, scratchCaptionReview, voiceSelection, inputHashes,
  }));
  assertRequiredGatesPassed(gates, REQUIRED_PRE_CAPABILITY_GATES, expectedPreCapabilityBindings(inputHashes));
  return gates;
}

export async function preflightOnePass(inputs) {
  const localGates = await evaluatePreCapabilityGates(inputs);
  const { lock, approval, providerCapability, inputHashes, pictureLock, factVerdict } = inputs;
  const lockSha256 = hashCanonicalJson(lock);
  validateNarrationRequestLockAgainstInputs(lock, { ...inputHashes, beats: inputs.beats, providerCapability }, inputs.now);
  const paidGates = collectGateResults([
    ...Object.values(localGates),
    measuredGate("providerCapability", () => validateProviderCapability(providerCapability, lock, inputs.now), automatedEvidence("providerCapability", inputHashes, { providerCapabilitySha256: inputHashes.providerCapabilitySha256 })),
    measuredGate("requestLock", () => validateNarrationRequestLockAgainstInputs(lock, { ...inputHashes, beats: inputs.beats, providerCapability }, inputs.now), automatedEvidence("requestLock", inputHashes, { requestLockSha256: lockSha256 })),
    measuredGate("ownerVoiceApproval", () => validateOwnerApproval(approval, lock, lockSha256, inputs.voiceSelection), manualEvidenceFromApproval(approval, inputHashes, lockSha256)),
    measuredGate("keyRestrictionAttestation", () => validateKeyRestrictionAttestation(approval, lock), manualEvidenceFromApproval(approval, inputHashes, lockSha256)),
  ]);
  assertRequiredGatesPassed(paidGates, REQUIRED_PAID_REQUEST_GATES, expectedPaidBindings(inputHashes, lockSha256));
  return {
    lockSha256,
    requestCharacters: [...lock.requestText].length,
    ready: true,
    paidGates,
  };
}
```

`evaluatePreCapabilityGates()` first awaits the real Claude fact validator and passes only its authenticated payload to `buildMeasuredPreCapabilityGates()`; the builder cannot convert an unawaited Promise or caller-supplied boolean into PASS. The builder performs real validators for the exact scratch narration-timing JSON, derived caption-timing JSON, quantized SRT, complete text round-trip, caption-occlusion record, and explicit owner voice-selection record; `measuredGate()` may mark PASS only after its validator returns and must emit the evidence schema from Task 3. `automatedEvidence()` and `manualEvidenceFromApproval()` always return a non-empty evidence **array**, never a bare object. It never maps a missing check, `N/A`, or an upstream status string to PASS. The CLI computes `inputHashes` itself with `sha256File()` from the explicitly supplied accepted picture-lock JSON, hash-named picture-lock candidate, picture MP4, review ledger, script, fact-verdict envelope, scratch audio, narration-timing JSON, caption-timing JSON, scratch SRT, caption-review record, voice-selection record, provider-capability artifact, request lock, and approval; it derives `pictureLockFactReviewSha256` only by canonicalizing the accepted object’s closed `factReview`. It separately computes the picture MP4 H.264 packet-payload hash with the fixed sanitized FFmpeg hash command and verifies accepted/candidate equality, the candidate filename/content hash, `pictureLock.media.pictureLockMp4Sha256`, `pictureLock.media.videoPacketSha256`, and every gate’s `reviewedVideoPacketSha256`. Before every local-gates, capability, lock, preflight, execute, candidate, and accept decision it re-runs the imported native candidate/request/reply provenance verifier in detached clean worktrees at the recorded historical commits, rereads those exact Git blobs, and compares the freshly returned blob/commit modes plus byte-domain hashes to the accepted `factReview` and local envelope. It separately requires current `HEAD` to descend from those commits, current working mailbox bytes to equal the current committed blob, and the same target entries to remain exact and unique; unrelated newer mailbox entries are permitted. The initial native fact import alone may require the current whole mailbox to equal the fact-commit blob. Final acceptance uses the same historical/current split for the fact envelope and direct latest-commit validation for the acknowledgment. No file/heading surrogate hash, target selection from runtime HEAD, caller-supplied provenance object, or caller-supplied subheading is accepted. It parses `inputs.beats` from the supplied script and never accepts precomputed hashes from caller-controlled JSON. Both local and final preflight write no attempt event and perform no fetch.

- [ ] **Step 4: Implement exactly one POST**

Before resolving a credential or POST transport, `executeOnePass()` runs the immutable local/input checks and derives both the canonical cache directory and canonical attempt directory from the lock; neither path is caller-overridable. Startup order is fixed: recover/journal owned attempt-event temps, inspect/reconcile a cache if present, repair only a proven empty pre-start directory if no cache exists, and only then consider paid preflight. If the cache directory exists, it calls this zero-network recovery API instead of returning merely because cache validation passed:

```js
export async function reconcileValidatedCacheWithStartedAttempt({
  lock, approval, providerCapability, actualInputs, attemptRoot, cacheRoot, probeAudio, now,
}) {
  const lockSha256 = hashCanonicalJson(lock);
  const cache = await validateCachedTimedResult(canonicalCacheDir(cacheRoot, lockSha256), lock, probeAudio);
  const chain = await readAndValidateAttemptChain(canonicalAttemptDir(attemptRoot, lock.generationAuthorizationId));
  const started = requireExactStartedEvent(chain, {
    generationAuthorizationId: lock.generationAuthorizationId,
    generationOrdinal: lock.generationOrdinal,
    requestLockSha256: lockSha256,
    approvalSha256: actualInputs.inputHashes.approvalSha256,
    providerCapabilitySha256: lock.providerCapabilitySha256,
  });
  validateNarrationRequestLockAgainstInputs(lock, { ...actualInputs, providerCapability }, new Date(started.startedAt));
  validateOwnerApprovalAtPaidStart(approval, lock, lockSha256, actualInputs.voiceSelection, started.startedAt);
  const terminal = findTerminalEvent(chain);
  if (terminal) return requireTerminalBoundToCache(terminal, cache, started, chain);
  return publishSucceededFromCacheNoClobber({ chain, started, cache, lock, approval, now });
}
```

`readAndValidateAttemptChain()` accepts only regular non-symlink JSON event files with known names/states, requires `000-started.json` first, recomputes every event SHA, and validates each `previousEventSha256`; an unexpected file, gap, duplicate, malformed event, or wrong authorization/ordinal/lock/approval/capability hash is a hard stop. Reconciliation validates all current immutable input hashes, but evaluates provider freshness and approval ordering at the durable `startedAt`, not wall-clock recovery time, so a crash may be closed after capability expiry without authorizing a new request. A valid cache without the exact matching started event is provenance-invalid and fails without creating any event. A missing or invalid cache with any existing event also fails and never falls through to POST.

When the exact chain has no terminal event, reconciliation publishes to the single canonical success slot `020-succeeded.json` with `state:"succeeded-from-cache"`, exact generation authorization/ordinal, lock/approval/capability hashes, recomputed `result.json`/audio/alignment hashes, `previousEventSha256`, and `reconciledAt`. Direct success uses the same slot with `state:"succeeded"`; this prevents two terminal success files. Both call the atomic no-clobber publisher below. On a concurrent winner, either path rereads the entire chain and succeeds only if the winning terminal is itself valid and bound to the same cache; any partial, conflicting, or stale winner is preserved and hard-fails. Repeated reconciliation is idempotent and never creates another terminal or POST.

```js
export async function publishAttemptEventNoClobber({ attemptDir, fileName, event }) {
  const bytes = Buffer.from(`${stableJson(event)}\n`, "utf8");
  const temp = path.join(attemptDir, `.event-${fileName}-${process.pid}-${randomUUID()}.tmp`);
  const handle = await open(temp, "wx", 0o600);
  try {
    await handle.writeFile(bytes);
    await handle.sync();
  } finally {
    await handle.close();
  }
  try {
    await link(temp, path.join(attemptDir, fileName)); // same-directory atomic no-clobber publish
    await fsyncDirectory(attemptDir);
    await unlink(temp);
    await fsyncDirectory(attemptDir);
    return { publishedByCaller: true };
  } catch (error) {
    if (error?.code !== "EEXIST") throw error; // leave the fsynced temp for journaled startup recovery
    const compatibleWinner = await validateConcurrentPublishedEvent(attemptDir, fileName, event);
    if (!compatibleWinner) throw new Error("Conflicting attempt-event winner"); // leave temp for quarantine
    await journalConcurrentLoserTemp({ attemptDir, fileName, temp, event });
    return { publishedByCaller: false };
  }
}
```

No attempt event is ever written directly at its canonical name. The same-directory temporary file is complete and file-fsynced before `link()` publishes the canonical name without overwrite; directory fsync makes that link durable. Only the process receiving `publishedByCaller:true` for `000-started.json`, followed by the directory fsync, may advance to the POST. An `EEXIST` loser validates the canonical winner and must not POST. Platforms lacking hard-link support must use an equivalently tested no-replace primitive; ordinary overwriting `rename()` is forbidden.

On startup, `recoverOrphanAttemptEventTemps()` scans only exact owned temp-name patterns without following symlinks. If the matching canonical event exists, it validates both; a compatible concurrent loser or identical orphan is moved through a hash-bound journal to `attemptRoot/.event-recovery/<generationAuthorizationId>/`, while a conflicting temp is quarantined there with a blocking verdict. If canonical `000-started.json` is absent, the invariant above proves the POST boundary was never crossed; a complete or partial `000` temp is likewise moved through a `wx`+fsynced journal with original SHA/size/reason, then the empty canonical attempt directory may be repaired and preflight restarted. If a `010`/`020` temp exists after a durable started event, it is **never silently deleted**: a complete chain-valid temp may be no-clobber published and fsynced; a partial/conflicting temp is journaled and quarantined, leaving the started attempt ambiguous until strict cache reconciliation or GET-only history resolves it. Tests inject crashes mid-write, after temp fsync, after no-clobber publish, and before/after each directory fsync for `000`, `010`, and `020`, and verify orphan recovery, quarantine hashes, no overwrite, no second POST, and no unaccounted temp in the final verifier.

Treat a canonical attempt directory containing no entries as the pre-start crash case, not as a paid attempt. `repairEmptyAttemptDirectoryBeforeStart()` may remove it with `rmdir` only after `lstat`, repository-root containment, non-symlink, mode/owner, and a second empty-directory check; it fsyncs the attempt root afterward. Concurrent `ENOTEMPTY` makes it reread the chain rather than delete. It never removes a directory containing even one byte or unknown entry. The final verifier accepts no leftover empty attempt directory; a successfully repaired one is not counted as a paid start. A complete readable `000-started.json`, including one that survived a crash before its file/directory fsync returned, is conservatively consumed and classified as `ambiguous-in-flight` when it has no successor.

Inject crashes after attempt-directory creation, during/after started-temp write, after started-temp fsync, after started no-clobber publish, after started directory fsync, after the POST returns, during each `010`/`020` publish phase, after cache reservation publication, after canonical `mkdir`, after each data link, after the final cache `READY` link, after cache result-directory fsync, during reservation cleanup, and before/after terminal publication. The mkdir-only and safely journaled unpublished-`000` cases must repair and later make exactly one POST; every surviving canonical started event must prevent another POST. A post-`READY` crash must leave exactly one POST, a strictly valid cache, and only the matching started chain; a second run with `ELEVENLABS_DISABLE_NETWORK=1`, no key, and a throwing transport must reconcile the reservation then publish `state:"succeeded-from-cache"`; a third run must be a no-write idempotent return. Also test a valid cache created before any attempt, wrong-authorization/tampered started fields, broken previous-event hashes, a mutated cache/result/audio/alignment/READY hash, an existing empty canonical directory, a terminal bound to another cache, a nonempty/unknown attempt directory, partial orphan temps/reservations, and two concurrent reconcilers. Every invalid case makes zero calls and writes no canonical event; concurrency yields exactly one valid `020-succeeded.json`, and the loser validates and reuses the winner.

Only when no cache exists and the attempt path is absent or was proven empty and safely repaired does `executeOnePass()` perform final paid preflight, recheck `approval.approvedAt <= now <= lock.providerCapabilityExpiresAt`, then read the credential and create the canonical attempt directory `picture-lock-work/final/attempts/<generationAuthorizationId>/` with mode `0700`. It builds the bound `state:"started"` event and publishes `000-started.json` through `publishAttemptEventNoClobber()`; only the caller that wins publication and completes directory fsync may continue. The existence of **any** canonical event in this directory permanently consumes that generation authorization. Only after the durable start event succeeds does it build the request exclusively through `buildTimedSpeechRequest(lock)`:

```js
const { url, body } = buildTimedSpeechRequest(lock);
const { payload: response, responseEvidence } = await postJson(url, body, {
  "content-type": "application/json",
  "xi-api-key": apiKey,
}, { redirect: "error", signal: AbortSignal.timeout(120_000) });
await commitTimedResultAtomically({ response, responseEvidence, lock, cacheRoot, probeAudio });
```

`postJson` is called once and only once. It has no loop, retry library, redirect follow, fallback endpoint, or body reconstruction. A definite HTTP non-2xx atomically publishes `010-rejected-terminal.json`; the authorization is consumed and the command stops. A timeout/socket reset publishes `010-ambiguous-transport.json`. Any HTTP 2xx parse, response validation, audio validation, or cache-commit failure publishes `010-consumed-invalid-or-ambiguous.json`. Only a validated, fsynced cache may publish the canonical `020-succeeded.json`, with direct `state:"succeeded"` or reconciled `state:"succeeded-from-cache"`. Published events are immutable and chained by previous-event SHA; there is no in-place status rewrite whose crash could erase the durable pre-POST state.

After—and only after—a valid terminal `succeeded`, `succeeded-from-cache`, or unique-history `recovered` chain exists, call `publishAttemptChainLedger({attemptDir,attemptRecoveryDir,lock,approval,cacheDir,attemptChainRoot})`. It rereads and validates the complete event chain and every resolved recovery-journal record, then renders closed deterministic JSON `{schemaVersion:1,status:"terminal-success",generationAuthorizationId,generationOrdinal:1,requestLockSha256,approvalSha256,providerCapabilitySha256,cacheReadySha256,attemptCount:1,events,recoveryJournals}`. Each ordered event/journal member contains only repository-relative path, exact file SHA-256, state/kind, and previous-event binding; no timestamp is added beyond values already present in the immutable source events. Publish it through `publishImmutableJsonNoClobber()` at `picture-lock-work/final/attempt-chains/<attemptChainSha256>.json`, where the basename is its exact bytes hash. A direct success, cache reconciliation, or history recovery that reaches the same terminal evidence validates/reuses the same content-addressed ledger. Missing/extra event files, an unresolved quarantine, more than one durable start, wrong cache/lock/approval hashes, a mutable conventional attempt-chain path, or filename/content mismatch fails. Unit tests cover direct/reconciled/history terminal ledgers, missing/wrong source hashes, concurrent publication, crash recovery, and two unrelated historical hash-named ledgers beside the one exact returned path; they prove consumers never scan for “latest” and no attempt-chain ledger can exist before terminal success.

The transport never persists raw response headers. It computes `responseBodySha256` from the exact response bytes before JSON parsing. If the response has the provider’s `character-cost` header, parse it only as canonical base-10 ASCII digits into a non-negative safe integer, require it not to exceed both the approval ceiling and attested key quota, and record only the sanitized `{httpStatus,responseBodySha256,actualCharacterCost}` plus `responseEvidenceSha256 = sha256(stableJson({httpStatus,responseBodySha256,actualCharacterCost}))` in terminal/cache metadata. If the header is absent, record `actualCharacterCost:"unknown"` and hash that sanitized evidence object. A signed/decimal/exponential/duplicate/non-finite/out-of-range value is never coerced: atomically publish `010-cost-evidence-invalid-terminal.json` with only the sanitized response/body evidence, block history acceptance and final release, and do not use it to justify another call. `validateCachedTimedResult()` recomputes the evidence hash from those stored nonsecret fields in addition to recomputing audio/alignment hashes. Tests enumerate boundary values, missing header, duplicate values, over-ceiling cost, and fake sensitive headers, proving only the sanitized fields and evidence hash reach disk/stdout.

The client copies `ELEVENLABS_API_KEY` into one local variable, reads the nonsecret `ELEVENLABS_KEY_SOURCE_SHA256`, immediately deletes both from `process.env`, and requires the source hash to equal both the bound selection and owner approval **before** creating an attempt event. It creates the request header at the last possible moment and drops the key reference immediately after the one call. It never logs URLs with credentials (none are permitted), request headers, raw environment, or response headers. With `ELEVENLABS_DISABLE_NETWORK=1`, CLI `--execute` may run only local validation and the cache/started-chain reconciliation above; if reconciliation does not resolve an existing cache, it hard-fails before reading the key, resolving a transport, or creating a started event. Pure state-machine tests call `executeOnePass()` with an injected in-memory fake transport while `globalThis.fetch` is replaced by a throwing sentinel; the fake spy may record one logical POST, but an actual socket path remains mechanically unavailable.

- [ ] **Step 5: Implement read-only history recovery**

`elevenlabs-history-recover.mjs` requires explicit `--lock`, `--approval`, and `--voice-selection` files; it recomputes the selection file hash, validates it against the lock, and requires exact selection/approval equality for voice, model, credential-document SHA, and relevant decision bindings. It never infers a mutable sibling selection file. Only then does it accept a strictly validated attempt chain ending in explicit `ambiguous-transport`, `consumed-invalid-or-ambiguous`, or a bare durable `started` derived as `ambiguous-in-flight`; it rejects an empty directory, invalid chain, definite rejection, `cost-evidence-invalid-terminal`, or any success terminal. It performs only allowlisted GET requests to paginated ElevenLabs history, the selected history item, and its audio endpoint. Bound pagination by the attempt start/end window and a fixed maximum page count. Match a **unique** item on exact voice ID, model ID, complete text bytes/hash, output format, source `TTS`, creation window, and every safely comparable request field. Missing/mismatched selection, selection hash, credential SHA, voice, or model exits before reading the key or resolving GET transport. Never choose “closest” or first match.

`matchHistoryItemToLock(item, lock, attempt)` does not deep-equal a provider history object or a settings object against the request body. Instead, a versioned field adapter projects only documented provider response fields and compares each returned lock-known field with exact type/value semantics: complete text bytes, voice/model IDs, output format, source, timestamps/window, seed, normalization mode, pronunciation dictionary locator IDs/versions/order, and each of `stability`, `similarity_boost`, `style`, `speed`, and `use_speaker_boost`. An unknown key inside the provider’s request/settings projection, duplicate/conflicting representation, numeric-string coercion, or returned value that differs from the lock rejects that item. Provider response metadata outside the documented request projection is not treated as a request setting and is neither copied into the lock nor used for equality.

The adapter also returns `missingCriticalFields`. A history item missing any request-affecting field such as `speed`, seed, normalization, or dictionary locators cannot be called an exact request match merely because the visible fields agree. It may remain eligible only when a provider-issued request ID/reference is present in both the durable attempt chain and the history response and matches exactly; otherwise the result remains ambiguous even if text/voice/model/output/source/window leave one candidate. Text/voice/model/output/source/window are always required and request IDs only strengthen, never replace, them. Fixtures cover extra provider metadata, every known setting mismatch, unknown/conflicting setting keys, a missing `speed` with no bound request reference (ambiguous), the same omission with an exact bound provider reference (eligible), and two otherwise matching candidates (ambiguous).

Keep the two official response shapes explicit through `extractRawAlignment(payload, source)`: a direct with-timestamps POST reads only top-level `payload.alignment` and ignores top-level `payload.normalized_alignment`; a history item reads only `payload.alignments.alignment` and ignores `payload.alignments.normalized_alignment`. Never look for top-level history `alignment`, never use a normalized fallback, and reject missing/array/malformed wrappers. Add `test/fixtures/elevenlabs-history-item.json` with the documented `alignments: { alignment, normalized_alignment }` shape plus negative fixtures for normalized-only, swapped, and POST-shaped history data. Both extracted raw objects must pass the same `validateCharacterAlignment()` against exact locked text.

Retrieve the item and audio, validate audio, and commit through the same content-addressed cache function. For a fully valid timed result, contend through `publishAttemptEventNoClobber()` on the same canonical `020-succeeded.json` slot with `state:"recovered"`; on a concurrent winner, reread and validate a matching `succeeded`, `succeeded-from-cache`, or `recovered` outcome rather than writing a second terminal. Recovery does not create or conceal a second paid attempt. If raw history alignment is absent, atomically publish the distinct terminal `020-recovered-audio-only.json` and block final captions; because there is no strictly valid timed cache, ordinary execute/reconciliation then hard-fails on the consumed attempt. Zero/multiple matches, pagination truncation, or any field mismatch remains ambiguous. The recovery tool’s URL/method allowlist excludes every text-to-speech endpoint and tests assert GET-only behavior.

There is no retry command. Implement and test the offline-only API `createSupersedingGenerationLock({ previousLock, consumedAttemptEvents, freshProviderCapability, actualInputs, newGenerationAuthorizationId })`. It first requires a terminal/ambiguous, fully hash-chained predecessor; reruns all actual-input/canonical-text checks; requires a fresh capability GET artifact; clones no approval; sets a new random authorization ID, `generationOrdinal = previousLock.generationOrdinal + 1`, and `supersedesAttemptSha256 = hashCanonicalAttemptChain(consumedAttemptEvents)`; then writes a new `wx` lock path. `validateNarrationRequestLockAgainstInputs()` permits ordinal 1 only with predecessor null and ordinal >1 only with a valid predecessor-chain hash. Tests reject reuse of the authorization ID, missing/nonterminal/tampered predecessor, stale capability, skipped ordinal, mutated text, inherited approval, and overwrite of either lock.

Expose this constructor only as direct offline CLI mode `node scripts/elevenlabs-final.mjs --create-superseding-lock` with the same complete actual-input paths, `--previous-lock`, `--previous-attempt-dir`, fresh `--provider-capability`, and a new output path; do not add an npm alias. Creating it spends no credits and grants no transport permission. A later paid call still requires a new exact owner approval schema from Task 4. Old events/cache are never deleted, and the release ledger reports all paid starts; if a second call occurs it may no longer claim the original “exactly one paid attempt” goal unless the owner explicitly revises that acceptance condition.

- [ ] **Step 6: Add only safe npm commands**

Add:

```json
{
  "test": "ELEVENLABS_DISABLE_NETWORK=1 node --test test/*.test.mjs",
  "tts:lock": "node scripts/elevenlabs-final.mjs --create-lock",
  "tts:local-gates": "node scripts/elevenlabs-final.mjs --local-gates",
  "tts:preflight": "node scripts/elevenlabs-final.mjs --preflight"
}
```

Do not add an npm script for capability network access, history recovery, or `--execute`; this prevents CI, `npm test`, or a casual package command from touching provider state or spending credits.

- [ ] **Step 7: Run all offline tests and commit**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
ELEVENLABS_DISABLE_NETWORK=1 node --test test/elevenlabs-client.test.mjs test/elevenlabs-history-recover.test.mjs
ELEVENLABS_DISABLE_NETWORK=1 npm test
/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/scripts/mandatory-plan-precommit.sh
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add demo-video/capture/scripts/elevenlabs-final.mjs demo-video/capture/scripts/elevenlabs-history-recover.mjs \
  demo-video/capture/test/elevenlabs-client.test.mjs demo-video/capture/test/elevenlabs-history-recover.test.mjs \
  demo-video/capture/test/fixtures/elevenlabs-history-item.json demo-video/capture/package.json
git commit -m "feat(video): add single-attempt timed voice client" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
```

## Task 7: Disable legacy paid paths, take a current capability snapshot, and open the owner gate

**Files:**
- Modify: `demo-video/presentation/scripts/synthesize-audio.sh`
- Modify: `demo-video/presentation/scripts/tts-providers/elevenlabs.sh`
- Modify: `demo-video/presentation/scripts/tts-providers/README.md`
- Modify: `demo-video/capture/qa/README.md`
- Create: `demo-video/capture/scripts/run-elevenlabs-with-owner-key.py`
- Create: `demo-video/capture/test/test_key_launcher.py`
- Create: `demo-video/capture/test/legacy-paid-path.test.mjs`
- Modify: `demo-video/production-plan.md`
- Modify: `docs/collab/inbox-claude.md`

- [ ] **Step 1: Write failing legacy-path and key-launcher tests**

Execute the presentation runner with `PRESENTATION_TTS=elevenlabs` and a fake key. Assert exit 1, zero fake HTTP calls, and stderr pointing to `demo-video/capture/scripts/elevenlabs-final.mjs`. Scan both legacy scripts and both legacy instruction files—`presentation/scripts/tts-providers/README.md` and `capture/qa/README.md`—and reject `21m00Tcm4TlvDq8ikWAM`, `Rachel`, direct ElevenLabs `curl`/POST/key export, `--retry`, `--retry-all-errors`, ElevenLabs use of `--force`, and any instruction to regenerate or synthesize 21 segments.

Create a synthetic DOCX fixture plus synthetic bound selection/approval files in the test temporary directory—never open the owner document. Import the Python launcher and verify SHA mismatch, selection/approval source-hash disagreement, forbidden CLI/env SHA override, zero/multiple/non-64-hex OOXML text runs, symlink source, and unexpected ZIP members fail. Execute a fake child for each allowlisted mode and assert the child receives only `PATH`, `HOME`, `TMPDIR`, `LANG`/`LC_*` when present, `ELEVENLABS_API_KEY`, `ELEVENLABS_KEY_SOURCE_SHA256`, and the mode-specific argv. History mode tests require an explicit `--voice-selection`, recompute its hash, and reject a missing/mutable-sibling/mismatched selection or approval/selection credential/voice/model disagreement before key read/GET. Prove the key is absent from stdout/stderr/argv/files and that arbitrary executable, unknown mode/flag, shell metacharacters, or output-path escape is rejected.

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
ELEVENLABS_DISABLE_NETWORK=1 node --test test/legacy-paid-path.test.mjs
python3 -m unittest -v test/test_key_launcher.py
```

Expected: missing/still-enabled implementation failures; no provider socket is opened.

- [ ] **Step 2: Disable paid generation in the presentation runner**

The next two `bash` fences are non-executable file-content excerpts, not operation blocks. Every executable operation fence in this plan starts with an explicit repository or capture-directory `cd` (the precommit script instead resolves and enters `ROOT` itself).

At the start of `synthesize-audio.sh`, after provider parsing and before sourcing any provider:

```bash
if [[ "$PROVIDER" == "elevenlabs" ]]; then
  echo "ElevenLabs final narration is one-pass only. Use demo-video/capture/scripts/elevenlabs-final.mjs after picture, fact, caption, and owner approval locks." >&2
  exit 1
fi
```

Replace `tts-providers/elevenlabs.sh` with a hard-fail compatibility stub:

```bash
tts_check() { echo "ElevenLabs is disabled in the segmented presentation pipeline." >&2; return 1; }
tts_synthesize() { echo "Segmented ElevenLabs synthesis is disabled." >&2; return 1; }
```

Rewrite both legacy READMEs so they contain no default voice, key-export example, provider POST/curl command, segment regeneration recipe, or claim that the 21-beat pipeline may call ElevenLabs. They must hard-fail that route and point only to `demo-video/capture/scripts/run-elevenlabs-with-owner-key.py` plus this plan’s offline gates → current capability GET → immutable lock/approval → sole full-text execution sequence. Documentation examples must not expose an `execute` npm alias or a command that bypasses the owner launcher.

- [ ] **Step 3: Implement a fixed-purpose, minimal-environment credential launcher**

`run-elevenlabs-with-owner-key.py` fixes the credential path in code, rejects symlinks, verifies its hash before unzip, requires exactly one non-empty OOXML `<w:t>` run matching the credential format, and supports only these children:

```python
MODE_COMMANDS = {
    "capability": ("scripts/elevenlabs-capability.mjs", "--check-current-capability"),
    "execute": ("scripts/elevenlabs-final.mjs", "--execute"),
    "history": ("scripts/elevenlabs-history-recover.mjs", "--recover"),
}
SAFE_ENV_KEYS = ("PATH", "HOME", "TMPDIR", "LANG", "LC_ALL", "LC_CTYPE")
```

Each mode has an exact option-name allowlist. Inputs must resolve beneath the LevelField repository and equal one of the named file roles in that mode; outputs must resolve beneath `demo-video/capture/runs/2026-08-20T1530Z-preview/picture-lock-work/final/` or the canonical cache root. Reject symlinks and any path outside those roots; the fixed read-only credential document is the sole external-path exception. Capability and execute require both explicit `--picture-lock` and `--picture-lock-candidate`; the launcher and Node validator re-hash both, derive the candidate basename from the accepted JSON, and replay accepted `factReview`. Capability/execute/history all require explicit `--fact-review-request-mailbox` and `--fact-review-request-commit`; the launcher permits the request mailbox only at repository path `docs/collab/inbox-claude.md`, and the Node validator reauthenticates that historical committed request instead of inferring a mutable sibling. Capability mode reads the expected document SHA only from the already-bound `owner-voice-selection.json`; execute/history read it only from the exact owner approval and require equality with the explicitly supplied selection record. History’s allowlist requires `--voice-selection` and forbids resolving a sibling path from `--lock` or `--approval`. A CLI/env SHA override is forbidden. Use `os.umask(0o077)`, resolve `node` from the allowlisted PATH, form `child_env` only from `SAFE_ENV_KEYS`, add the key and verified credential-source SHA, clear the Python string/reference after forming the env where practical, and call `os.execve()` directly—never a shell and never copy the ambient environment wholesale. The Node entrypoint copies the key once, deletes both key variables from `process.env` before any subprocess or file write, never serializes them, and constructs the single header only inside its allowlisted provider transport. Before using the key, the owner attests it is endpoint-scoped to the needed model/voice reads, TTS, and history reads, with a credit quota no greater than the approved ceiling and IP allowlisting where available, per the official authentication reference.

- [ ] **Step 4: Create and review the complete offline caption candidate**

First revalidate/reuse the native fact envelope and create the two voice-stage evidence objects at their exact paths; none may be generated from a boolean CLI flag:

1. Revalidate the **completed native handoff**, not a new voice-stage fact review. Parse accepted `picture-lock.json`, derive `picture-lock-candidates/<candidateSha256>.json`, and require that filename and exact bytes hash to `candidateSha256`; then require accepted/candidate `commit`, `media`, and `gates` to be identical. Resolve `FACT_REVIEW_REQUEST_COMMIT` and `FACT_MAILBOX_COMMIT` from the accepted `factReview` plus the native handoff and run `verifyCommittedReviewRequest()` against `docs/collab/inbox-claude.md`, internal `requestKind:"fact"`, and the recomputed candidate SHA. Its raw request must be exactly `{schemaVersion:1,kind:"final-film-fact-review-request",reviewRequestId,ordinal,artifactKind:"picture-lock-candidate",artifactSha256,pictureLockCandidateSha256,scriptSha256,reviewedCommit,requestCreatedAt}` with `artifactSha256 === pictureLockCandidateSha256` and `reviewedCommit === candidate.commit`. The already committed Claude reply must use `### Final-film fact verdict · <reviewRequestId>` and closed raw payload `{schemaVersion:1,reviewedAt,status:"PASS",reviewRequestId,ordinal,artifactSha256,reviewedCommit,scriptSha256,pictureLockCandidateSha256,lineItems}`; it cannot contain or predict the accepted JSON SHA. Re-run `verifyTrackedMailboxReply({...,replyKind:"fact"})`, all 21 unique ordered PASS line hashes, both request/reply byte-domain hashes, and every accepted `factReview` provenance field. The local `claude-fact-verdict.json` must be byte-identical to the native-produced envelope or be validated/reused by the no-clobber writer; voice never synthesizes a second envelope. A missing/FAIL/malformed/stale candidate request, reply, envelope, or accepted `factReview` means the native prerequisite is incomplete. Correction happens there with the native fixed CLI `--append-fact-review-request --picture-lock-candidate <hash-named-candidate> --script <script>`; it creates and commits ordinal +1 under a fresh request ID before native accept is rerun. Voice does not issue a correction request against accepted `picture-lock.json`.
2. From the owner’s explicit selection message, write `runs/2026-08-20T1530Z-preview/picture-lock-work/final/owner-voice-selection.json` with exact schema `{schemaVersion:1,selectedBy:"owner",selectedAt,voiceId,modelId:"eleven_multilingual_v2",capabilityLookupApproved:true,decisionTextSha256,credentialDocumentSha256,pictureLockSha256,pictureLockCandidateSha256,scriptSha256}`. `pictureLockSha256` hashes the later accepted JSON and `pictureLockCandidateSha256` hashes the immutable candidate; the binder recomputes both and replays `factReview`. `voiceId` must be concrete and non-placeholder; `decisionTextSha256` hashes the complete owner message, and `credentialDocumentSha256` is the owner-provided nonsecret hash of the designated credential container. This authorizes only the two read-only capability GETs, not generation or credits.
3. Overlay `scratch.en.srt` on the exact picture and watch every caption plus every named key-UI checkpoint. Write `runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch-caption-review.json` with exact schema `{schemaVersion:1,reviewer,reviewedAt,protocolVersion:"caption-occlusion-v1",status:"PASS",pictureSha256,scratchSrtSha256,captionTimingSha256,checkpoints}`. `checkpoints` must have exactly the IDs from the picture-lock checkpoint manifest, each as `{id,timeMs,keyUiRegion,cueIndexes,verdict:"PASS",notes}`; every cue index and key region must be covered at least once. The validator recomputes the three file hashes and set equality. A generated empty list, unreviewed cue, `N/A`, or blanket status without per-checkpoint evidence fails.

Claude supplies the actual UTC timestamp in the required level-two entry header and uses the exact committed-request-ID-qualified unique level-three subheading derived above. The owner authors `final/owner-voice-selection-input.json` with the full decision text and selection fields; the caption reviewer authors `final/scratch-caption-review-input.json` with identity/time/protocol and all checkpoint observations. Revalidate/reuse the fact envelope and bind the two new objects with these commands:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
: "${FACT_REVIEW_REQUEST_COMMIT:?set to the committed current fact-review request}"
: "${FACT_MAILBOX_COMMIT:?set to Claude reply commit from explicit handoff}"
PICTURE_LOCK=runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json
PICTURE_LOCK_CANDIDATE_SHA256="$(node -e 'const fs=require("node:fs");const p=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(p.status!=="picture-lock"||!/^([0-9a-f]{64})$/.test(p.candidateSha256))process.exit(1);process.stdout.write(p.candidateSha256)' "$PICTURE_LOCK")"
PICTURE_LOCK_CANDIDATE="runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock-candidates/${PICTURE_LOCK_CANDIDATE_SHA256}.json"
test "$(shasum -a 256 "$PICTURE_LOCK_CANDIDATE" | awk '{print $1}')" = "$PICTURE_LOCK_CANDIDATE_SHA256"
node scripts/evidence-artifacts.mjs --import-claude-fact \
  --mailbox ../../docs/collab/inbox-codex.md \
  --mailbox-commit "$FACT_MAILBOX_COMMIT" \
  --request-mailbox ../../docs/collab/inbox-claude.md \
  --request-mailbox-commit "$FACT_REVIEW_REQUEST_COMMIT" \
  --script ../script.md \
  --picture-lock "$PICTURE_LOCK" \
  --picture-lock-candidate "$PICTURE_LOCK_CANDIDATE" \
  --output runs/2026-08-20T1530Z-preview/picture-lock-work/final/claude-fact-verdict.json
node scripts/evidence-artifacts.mjs --bind-owner-voice-selection \
  --decision-input runs/2026-08-20T1530Z-preview/picture-lock-work/final/owner-voice-selection-input.json \
  --script ../script.md \
  --picture-lock "$PICTURE_LOCK" \
  --picture-lock-candidate "$PICTURE_LOCK_CANDIDATE" \
  --output runs/2026-08-20T1530Z-preview/picture-lock-work/final/owner-voice-selection.json
node scripts/evidence-artifacts.mjs --bind-scratch-caption-review \
  --review-input runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch-caption-review-input.json \
  --picture ../levelfield-demo-picture-lock.mp4 \
  --picture-lock runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json \
  --srt runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch.en.srt \
  --caption-timing runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch-caption-timing.json \
  --output runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch-caption-review.json
```

Expected: one pre-existing fact envelope validated/reused plus two new complete `0600` artifacts published through the shared no-clobber writer; stdout is limited to path and SHA-256, and the full owner decision text is not copied to the redacted selection object. Re-running validates and reuses an identical winner, rejects a conflict, and recovers/quarantines any owned temp before doing new work.

If candidate/request/reply replay fails, return to the native plan before continuing. Its correction adapter is the only legal fact-request writer and maps `--append-fact-review-request` to internal `requestKind:"fact"`; it requires explicit `--picture-lock-candidate <hash-named-candidate>` and `--script <script>`, hard-fails unless the immediately preceding ordinal has one committed `FAIL` or parser-invalid reply, and commits only `docs/collab/inbox-claude.md`. After the corrected candidate-bound PASS, native accept publishes a newly derived accepted object. This voice plan then restarts Step 4 with that accepted object and never appends a fact request itself.

Add parser/importer/validator fixtures to `release-gates.test.mjs`: 20/22/duplicate/out-of-order fact lines, stale narration hash, stale mailbox-entry hash, owner selection without GET-only language, and missing cue/checkpoint coverage must all fail. Then run the full zero-network gate with every source path explicit:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
PICTURE_LOCK_CANDIDATE_SHA256="$(node -e 'const fs=require("node:fs");const p=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(p.status!=="picture-lock"||!/^([0-9a-f]{64})$/.test(p.candidateSha256))process.exit(1);process.stdout.write(p.candidateSha256)' runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json)"
PICTURE_LOCK_CANDIDATE="runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock-candidates/${PICTURE_LOCK_CANDIDATE_SHA256}.json"
test "$(shasum -a 256 "$PICTURE_LOCK_CANDIDATE" | awk '{print $1}')" = "$PICTURE_LOCK_CANDIDATE_SHA256"
ELEVENLABS_DISABLE_NETWORK=1 npm run tts:local-gates -- \
  --picture ../levelfield-demo-picture-lock.mp4 \
  --picture-lock runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json \
  --picture-lock-candidate "$PICTURE_LOCK_CANDIDATE" \
  --review-ledger runs/2026-08-20T1530Z-preview/picture-lock-work/review/review-ledger.json \
  --script ../script.md \
  --fact-verdict runs/2026-08-20T1530Z-preview/picture-lock-work/final/claude-fact-verdict.json \
  --claude-mailbox ../../docs/collab/inbox-codex.md \
  --fact-review-request-mailbox ../../docs/collab/inbox-claude.md \
  --fact-review-request-commit "$FACT_REVIEW_REQUEST_COMMIT" \
  --scratch-audio runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration.wav \
  --scratch-timing runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration-timing.json \
  --scratch-caption-timing runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch-caption-timing.json \
  --scratch-captions runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch.en.srt \
  --scratch-caption-review runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch-caption-review.json \
  --voice-selection runs/2026-08-20T1530Z-preview/picture-lock-work/final/owner-voice-selection.json
```

Expected: every required picture gate including silent/expert review and every pre-capability caption/fact/occlusion gate reports evidence-bound PASS; no `N/A`, synthetic PASS, provider GET/POST, attempt directory, or credential read occurs.

- [ ] **Step 5: Perform exactly one explicit current-capability phase**

Only after Step 4 passes, invoke the fixed launcher in `capability` mode. The capability CLI recomputes every Step 4 hash and validator, requires the launcher-provided credential-source SHA to equal the bound selection, deletes both credential environment variables, recovers any complete no-clobber temp, then permits exactly the two GETs from Task 4 only if no recoverable capability exists and publishes the redacted artifact atomically with mode `0600`:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
PICTURE_LOCK_CANDIDATE_SHA256="$(node -e 'const fs=require("node:fs");const p=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(p.status!=="picture-lock"||!/^([0-9a-f]{64})$/.test(p.candidateSha256))process.exit(1);process.stdout.write(p.candidateSha256)' runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json)"
PICTURE_LOCK_CANDIDATE="runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock-candidates/${PICTURE_LOCK_CANDIDATE_SHA256}.json"
test "$(shasum -a 256 "$PICTURE_LOCK_CANDIDATE" | awk '{print $1}')" = "$PICTURE_LOCK_CANDIDATE_SHA256"
python3 scripts/run-elevenlabs-with-owner-key.py capability \
  --picture ../levelfield-demo-picture-lock.mp4 \
  --picture-lock runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json \
  --picture-lock-candidate "$PICTURE_LOCK_CANDIDATE" \
  --review-ledger runs/2026-08-20T1530Z-preview/picture-lock-work/review/review-ledger.json \
  --script ../script.md \
  --fact-verdict runs/2026-08-20T1530Z-preview/picture-lock-work/final/claude-fact-verdict.json \
  --claude-mailbox ../../docs/collab/inbox-codex.md \
  --fact-review-request-mailbox ../../docs/collab/inbox-claude.md \
  --fact-review-request-commit "$FACT_REVIEW_REQUEST_COMMIT" \
  --scratch-audio runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration.wav \
  --scratch-timing runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration-timing.json \
  --scratch-caption-timing runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch-caption-timing.json \
  --scratch-captions runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch.en.srt \
  --scratch-caption-review runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch-caption-review.json \
  --voice-selection runs/2026-08-20T1530Z-preview/picture-lock-work/final/owner-voice-selection.json \
  --model-id eleven_multilingual_v2 \
  --output runs/2026-08-20T1530Z-preview/picture-lock-work/final/provider-capability.json
```

Expected: two GETs, zero POSTs/attempt events, an unexpired current maximum request length that fits the complete narration, exact selected voice/model, response-body hashes, and `estimatedCredits:"unknown"` because no complete official billing formula was established. If the artifact expires before execution, first archive the provably unconsumed bundle:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
ELEVENLABS_DISABLE_NETWORK=1 node scripts/elevenlabs-final.mjs --abandon-expired-unconsumed-lock \
  --provider-capability runs/2026-08-20T1530Z-preview/picture-lock-work/final/provider-capability.json \
  --lock runs/2026-08-20T1530Z-preview/picture-lock-work/final/narration-request-lock.json \
  --approval runs/2026-08-20T1530Z-preview/picture-lock-work/final/owner-voice-approval.json \
  --attempt-root runs/2026-08-20T1530Z-preview/picture-lock-work/final/attempts \
  --archive-root runs/2026-08-20T1530Z-preview/picture-lock-work/final/abandoned
```

Missing lock/approval files are allowed only when they were never created; any attempt/cache blocks archival. On success, **reuse** the still-valid fact envelope, voice-selection envelope, scratch timing/SRT, and caption-occlusion review from Step 4 without replacing their no-clobber canonical paths. Rerun only Step 5’s capability GET, then Step 6’s new generation authorization/lock, new owner approval, and final preflight. Never mutate or delete an expired artifact. If interrupted, rerun the same paths after replacing the mode flag with `--resume-abandonment` before any new capability/lock/approval creation.

- [ ] **Step 6: Create the request lock, obtain exact owner approval, and run final offline preflight**

Create the schema-v2 lock with all actual inputs (the CLI generates a cryptographically random generation authorization ID and ordinal 1), then print only its SHA, redacted settings, character count/limit, capability expiry/hash, and `estimatedCredits:"unknown"`:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
PICTURE_LOCK_CANDIDATE_SHA256="$(node -e 'const fs=require("node:fs");const p=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(p.status!=="picture-lock"||!/^([0-9a-f]{64})$/.test(p.candidateSha256))process.exit(1);process.stdout.write(p.candidateSha256)' runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json)"
PICTURE_LOCK_CANDIDATE="runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock-candidates/${PICTURE_LOCK_CANDIDATE_SHA256}.json"
test "$(shasum -a 256 "$PICTURE_LOCK_CANDIDATE" | awk '{print $1}')" = "$PICTURE_LOCK_CANDIDATE_SHA256"
ELEVENLABS_DISABLE_NETWORK=1 npm run tts:lock -- \
  --picture ../levelfield-demo-picture-lock.mp4 \
  --picture-lock runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json \
  --picture-lock-candidate "$PICTURE_LOCK_CANDIDATE" \
  --review-ledger runs/2026-08-20T1530Z-preview/picture-lock-work/review/review-ledger.json \
  --script ../script.md \
  --fact-verdict runs/2026-08-20T1530Z-preview/picture-lock-work/final/claude-fact-verdict.json \
  --claude-mailbox ../../docs/collab/inbox-codex.md \
  --fact-review-request-mailbox ../../docs/collab/inbox-claude.md \
  --fact-review-request-commit "$FACT_REVIEW_REQUEST_COMMIT" \
  --scratch-audio runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration.wav \
  --scratch-timing runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration-timing.json \
  --scratch-caption-timing runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch-caption-timing.json \
  --scratch-captions runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch.en.srt \
  --scratch-caption-review runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch-caption-review.json \
  --voice-selection runs/2026-08-20T1530Z-preview/picture-lock-work/final/owner-voice-selection.json \
  --provider-capability runs/2026-08-20T1530Z-preview/picture-lock-work/final/provider-capability.json \
  --output runs/2026-08-20T1530Z-preview/picture-lock-work/final/narration-request-lock.json
```

Present those exact values plus the credential-source hash and key-restriction/credit-ceiling attestation to the owner. The owner authors `final/owner-voice-approval-input.json` with the complete approval message and every Task 4 field; bind it without reading the credential document:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
ELEVENLABS_DISABLE_NETWORK=1 node scripts/evidence-artifacts.mjs --bind-owner-voice-approval \
  --decision-input runs/2026-08-20T1530Z-preview/picture-lock-work/final/owner-voice-approval-input.json \
  --lock runs/2026-08-20T1530Z-preview/picture-lock-work/final/narration-request-lock.json \
  --provider-capability runs/2026-08-20T1530Z-preview/picture-lock-work/final/provider-capability.json \
  --voice-selection runs/2026-08-20T1530Z-preview/picture-lock-work/final/owner-voice-selection.json \
  --output runs/2026-08-20T1530Z-preview/picture-lock-work/final/owner-voice-approval.json
```

Expected: a `0600`, schema-v2 approval bound to the exact generation nonce/ordinal, capability expiry/hash, request body settings, exact characters/model, explicit unknown-spend acknowledgment, finite ceiling, credential-source hash, and restricted-key attestation; stdout contains only path/hash. Only then run final preflight with every input explicit:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
PICTURE_LOCK_CANDIDATE_SHA256="$(node -e 'const fs=require("node:fs");const p=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(p.status!=="picture-lock"||!/^([0-9a-f]{64})$/.test(p.candidateSha256))process.exit(1);process.stdout.write(p.candidateSha256)' runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json)"
PICTURE_LOCK_CANDIDATE="runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock-candidates/${PICTURE_LOCK_CANDIDATE_SHA256}.json"
test "$(shasum -a 256 "$PICTURE_LOCK_CANDIDATE" | awk '{print $1}')" = "$PICTURE_LOCK_CANDIDATE_SHA256"
ELEVENLABS_DISABLE_NETWORK=1 npm run tts:preflight -- \
  --picture ../levelfield-demo-picture-lock.mp4 \
  --picture-lock runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json \
  --picture-lock-candidate "$PICTURE_LOCK_CANDIDATE" \
  --review-ledger runs/2026-08-20T1530Z-preview/picture-lock-work/review/review-ledger.json \
  --script ../script.md \
  --fact-verdict runs/2026-08-20T1530Z-preview/picture-lock-work/final/claude-fact-verdict.json \
  --claude-mailbox ../../docs/collab/inbox-codex.md \
  --fact-review-request-mailbox ../../docs/collab/inbox-claude.md \
  --fact-review-request-commit "$FACT_REVIEW_REQUEST_COMMIT" \
  --scratch-audio runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration.wav \
  --scratch-timing runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration-timing.json \
  --scratch-caption-timing runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch-caption-timing.json \
  --scratch-captions runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch.en.srt \
  --scratch-caption-review runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch-caption-review.json \
  --voice-selection runs/2026-08-20T1530Z-preview/picture-lock-work/final/owner-voice-selection.json \
  --provider-capability runs/2026-08-20T1530Z-preview/picture-lock-work/final/provider-capability.json \
  --lock runs/2026-08-20T1530Z-preview/picture-lock-work/final/narration-request-lock.json \
  --approval runs/2026-08-20T1530Z-preview/picture-lock-work/final/owner-voice-approval.json
```

Expected: `READY`, exact lock/authorization/capability hashes, current character limit, authorized credit ceiling, zero network calls, and zero attempt events. The command fails if any explicit path is omitted; it never infers a mutable sibling file.

- [ ] **Step 7: Re-read the inbox, record readiness, and commit safe-path changes before spending**

Read `docs/collab/inbox-codex.md`. Add a newest-first FYI to Claude containing picture, script, review-ledger, fact-verdict, scratch-timing/SRT/occlusion-review, capability, request-lock, and owner-approval hashes; state that the next command is the sole paid POST and that chain/submission files remain untouched. Run offline tests, then commit implementation changes as directed by the executor; do not include credentials, ignored gate artifacts, attempts, or cache.

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
ELEVENLABS_DISABLE_NETWORK=1 npm test
python3 -m unittest -v test/test_key_launcher.py
git diff --check
```

Expected: all tests pass, the fake transport observes zero real sockets, the synthetic credential never appears in captured output/artifacts, and no attempt directory exists.

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/scripts/mandatory-plan-precommit.sh
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add demo-video/presentation/scripts/synthesize-audio.sh demo-video/presentation/scripts/tts-providers/elevenlabs.sh \
  demo-video/presentation/scripts/tts-providers/README.md demo-video/capture/qa/README.md \
  demo-video/capture/scripts/run-elevenlabs-with-owner-key.py demo-video/capture/test/test_key_launcher.py \
  demo-video/capture/test/legacy-paid-path.test.mjs demo-video/production-plan.md docs/collab/inbox-claude.md
git commit -m "fix(video): retire legacy paid voice paths and lock credential launch" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
```

- [ ] **Step 8: Execute the sole paid generation only after the owner gate**

Run the fixed launcher once with the same complete explicit input set from final preflight plus `--lock` and `--approval`:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
PICTURE_LOCK_CANDIDATE_SHA256="$(node -e 'const fs=require("node:fs");const p=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(p.status!=="picture-lock"||!/^([0-9a-f]{64})$/.test(p.candidateSha256))process.exit(1);process.stdout.write(p.candidateSha256)' runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json)"
PICTURE_LOCK_CANDIDATE="runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock-candidates/${PICTURE_LOCK_CANDIDATE_SHA256}.json"
test "$(shasum -a 256 "$PICTURE_LOCK_CANDIDATE" | awk '{print $1}')" = "$PICTURE_LOCK_CANDIDATE_SHA256"
ATTEMPT_CHAIN="$(python3 scripts/run-elevenlabs-with-owner-key.py execute \
  --picture ../levelfield-demo-picture-lock.mp4 \
  --picture-lock runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json \
  --picture-lock-candidate "$PICTURE_LOCK_CANDIDATE" \
  --review-ledger runs/2026-08-20T1530Z-preview/picture-lock-work/review/review-ledger.json \
  --script ../script.md \
  --fact-verdict runs/2026-08-20T1530Z-preview/picture-lock-work/final/claude-fact-verdict.json \
  --claude-mailbox ../../docs/collab/inbox-codex.md \
  --fact-review-request-mailbox ../../docs/collab/inbox-claude.md \
  --fact-review-request-commit "$FACT_REVIEW_REQUEST_COMMIT" \
  --scratch-audio runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration.wav \
  --scratch-timing runs/2026-08-20T1530Z-preview/picture-lock-work/scratch/narration-timing.json \
  --scratch-caption-timing runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch-caption-timing.json \
  --scratch-captions runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch.en.srt \
  --scratch-caption-review runs/2026-08-20T1530Z-preview/picture-lock-work/final/scratch-caption-review.json \
  --voice-selection runs/2026-08-20T1530Z-preview/picture-lock-work/final/owner-voice-selection.json \
  --provider-capability runs/2026-08-20T1530Z-preview/picture-lock-work/final/provider-capability.json \
  --lock runs/2026-08-20T1530Z-preview/picture-lock-work/final/narration-request-lock.json \
  --approval runs/2026-08-20T1530Z-preview/picture-lock-work/final/owner-voice-approval.json)"
ATTEMPT_CHAIN_SHA256="$(shasum -a 256 "$ATTEMPT_CHAIN" | awk '{print $1}')"
test "$ATTEMPT_CHAIN" = "runs/2026-08-20T1530Z-preview/picture-lock-work/final/attempt-chains/${ATTEMPT_CHAIN_SHA256}.json"
```

Expected: one `with-timestamps` POST, one canonical content-addressed cache directory, validated MP3/raw alignment/result metadata, one hash-chained attempt directory ending in `succeeded`, and one immutable `final/attempt-chains/<attemptChainSha256>.json`; stdout contains only that capture-root-relative attempt-chain path; all diagnostics use stderr. Preserve it as `ATTEMPT_CHAIN`. If the process crashed after its validated cache fsync but before that terminal event, rerunning the same command performs only the zero-network reconciliation, ends in `succeeded-from-cache`, and publishes/prints the corresponding content-addressed chain ledger; it never POSTs again. If no valid cache exists and the outcome is ambiguous, stop immediately and invoke only the launcher’s GET-only `history` mode against that exact attempt/lock; never run the paid path again with the same authorization.

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
ATTEMPT_CHAIN="$(python3 scripts/run-elevenlabs-with-owner-key.py history \
  --lock runs/2026-08-20T1530Z-preview/picture-lock-work/final/narration-request-lock.json \
  --fact-review-request-mailbox ../../docs/collab/inbox-claude.md \
  --fact-review-request-commit "$FACT_REVIEW_REQUEST_COMMIT" \
  --voice-selection runs/2026-08-20T1530Z-preview/picture-lock-work/final/owner-voice-selection.json \
  --approval runs/2026-08-20T1530Z-preview/picture-lock-work/final/owner-voice-approval.json)"
ATTEMPT_CHAIN_SHA256="$(shasum -a 256 "$ATTEMPT_CHAIN" | awk '{print $1}')"
test "$ATTEMPT_CHAIN" = "runs/2026-08-20T1530Z-preview/picture-lock-work/final/attempt-chains/${ATTEMPT_CHAIN_SHA256}.json"
```

History mode derives the canonical attempt directory and cache path from the validated lock; neither is overrideable. Expected: GET-only unique-match recovery that publishes/prints the immutable content-addressed attempt-chain ledger, or a still-ambiguous terminal report, never a TTS POST. Only the former yields the `ATTEMPT_CHAIN` required by Task 9.

## Task 8: Build aligned captions and the final mux

**Files:**
- Create: `demo-video/capture/scripts/finalize-master.mjs`
- Create: `demo-video/capture/test/final-master.test.mjs`
- Modify: `demo-video/capture/package.json`

- [ ] **Step 1: Write a fake-cache finalization test**

Use the timed-response fixture and a 25fps synthetic picture. Assert finalization:

- does not invoke a TTS transport;
- maps raw alignment to semantic SRT;
- preserves the exact picture frame count and video packet-data SHA at stream-copy level;
- resamples decoded MP3 to 48kHz stereo, performs measured two-pass normalization over the full 159.56-second padded program, encodes AAC-LC 192kbps, then re-decodes and measures final AAC at -18.0 ±0.5 LUFS with true peak <= -2.0dBTP;
- writes MP4 and SRT atomically;
- fails if narration exceeds 159.56 seconds, caption text differs, or any cue exceeds style limits.

- [ ] **Step 2: Run and confirm RED**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
ELEVENLABS_DISABLE_NETWORK=1 node --test test/final-master.test.mjs
```

Expected: missing finalizer module.

- [ ] **Step 3: Implement finalization from cached data only**

`finalize-master.mjs` accepts the canonical lock-SHA cache, picture lock, and output paths. Before muxing it revalidates the cache and regenerates the full-text captions from raw alignment, including millisecond quantization and post-quantization style/round-trip checks. For loudness, both passes operate on the identical full-duration program chain `aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=159.56,atrim=duration=159.56`; the first pass appends `loudnorm=I=-18:TP=-2.3:LRA=11:print_format=json`. Parse every measured field as finite and fail if FFmpeg omitted one. The second pass appends:

```js
const normalizationFilter = [
  "loudnorm=I=-18:TP=-2.3:LRA=11",
  `measured_I=${analysis.input_i}`,
  `measured_TP=${analysis.input_tp}`,
  `measured_LRA=${analysis.input_lra}`,
  `measured_thresh=${analysis.input_thresh}`,
  `offset=${analysis.target_offset}`,
  "linear=true",
  "print_format=summary",
].join(":");
```

Prepend the same resample/stereo/pad/trim chain to `normalizationFilter`. Verify the documented linear-mode preconditions from the first-pass measurements; if FFmpeg would fall back to dynamic mode, fail and require an explicitly reviewed normalization setting rather than silently changing modes. After AAC mux, decode the MP4 audio and run `ebur128=peak=true`; require finite integrated loudness in `[-18.5,-17.5]` LUFS, true peak `<= -2.0` dBFS/dBTP as reported by the filter, zero decode errors, exactly 48kHz stereo AAC-LC, and no spoken-alignment tail beyond the picture duration. The post-encode measurement is the release gate; target settings alone are never a PASS.

It then muxes with these stream and container settings:

```text
ffmpeg -i demo-video/levelfield-demo-picture-lock.mp4 -i cacheAudioPath
-map 0:v:0 -map 1:a:0
-c:v copy
-af normalizationFilter
-c:a aac -profile:a aac_low -b:a 192k -ar 48000 -ac 2
-movflags +faststart -t 159.56
demo-video/levelfield-demo-final.mp4
```

Do not reuse the scratch audio track from the picture-lock MP4: map only video from it. Write the final aligned captions to `demo-video/levelfield-demo-final.en.srt`. Write `finalize-result.json` with picture, cache, alignment, audio, SRT, MP4, and command hashes.

Before and after mux, compute the video packet-data digest with the same command and require equality:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
ffmpeg -v error -i INPUT.mp4 -map 0:v:0 -c:v copy -f hash -hash sha256 -
```

Also require `ffprobe -count_frames` to report `nb_read_frames=3989`. Do not compare whole-file MP4 SHA values—the audio/container necessarily changes.

Add to `demo-video/capture/package.json`:

```json
{
  "finalize:master": "node scripts/finalize-master.mjs"
}
```

- [ ] **Step 4: Run the finalizer**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
ELEVENLABS_DISABLE_NETWORK=1 npm run finalize:master -- \
  --run runs/2026-08-20T1530Z-preview \
  --picture-lock ../levelfield-demo-picture-lock.mp4 \
  --request-lock runs/2026-08-20T1530Z-preview/picture-lock-work/final/narration-request-lock.json \
  --output ../levelfield-demo-final.mp4 \
  --srt ../levelfield-demo-final.en.srt
```

Expected: final MP4 duration 159.56 seconds, exact 3989 picture frames, AAC-LC 48kHz stereo, semantic SRT passing all rules.

- [ ] **Step 5: Commit Task 8 implementation, not yet the final artifact**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/scripts/mandatory-plan-precommit.sh
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add demo-video/capture/scripts/finalize-master.mjs demo-video/capture/test/final-master.test.mjs demo-video/capture/package.json
git commit -m "feat(video): finalize locked picture from timed voice cache" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
```

## Task 9: Verify, independently review, and accept one submission SHA

**Files:**
- Create: `demo-video/capture/scripts/verify-final-master.mjs`
- Create: `demo-video/capture/test/verify-final-master.test.mjs`
- Modify: `demo-video/capture/package.json`
- Modify: `demo-video/capture/README.md`
- Modify: `demo-video/README.md`
- Create: `demo-video/final-evidence.json`
- Modify: `docs/collab/inbox-claude.md`

- [ ] **Step 1: Write the final release-verifier tests**

The verifier must fail closed unless all of these pass:

1. MP4 with exactly one H.264 High video and one AAC-LC audio stream, no subtitle/data/attachment streams; 1920×1080, yuv420p, progressive, SAR 1:1, and no rotation/display transform.
2. `r_frame_rate` and `avg_frame_rate` both 25/1; exactly 3989 decoded frames; every decoded presentation timestamp advances one 40ms frame; decode-order DTS is monotonic.
3. BT.709 primaries, transfer, and matrix.
4. finite measured 12–20Mbps video packet bitrate and a parsed `moov` atom before `mdat` (Fast Start).
5. AAC-LC, 48kHz stereo, finite nominal/packet audio bitrate consistent with the 192kbps encode, final decoded integrated loudness in `[-18.5,-17.5]` LUFS, true peak <= -2.0dBTP, and zero audio/video decode errors.
6. 120–180 seconds and exactly frame-aligned picture duration.
7. 0 blank/loading defects; action/privacy/checkpoint/legibility gates and pre-TTS silent/expert reviews remain bound through the unchanged video packet digest.
8. Caption monotonicity and exact complete-text round-trip after SRT millisecond parsing, <=2 lines, <=42 CPL, <=17 CPS, <=7 seconds, last cue inside spoken audio/video, plus final caption-occlusion review bound to the final MP4/SRT hashes.
9. Complete raw-source -> clean -> post -> picture lock/review ledger -> scratch timing/SRT/occlusion -> fact verdict -> provider capability -> request lock/approval -> attempt events -> cached audio/alignment -> final MP4/SRT hash chain, with `selection <= capability check <= lock creation <= approval <= paid start <= capability expiry`; every immutable-artifact recovery journal is hashed and no unresolved/blocking `artifact-recovery` quarantine exists.
10. Claude’s 21/21 verdict, owner voice/cost/key-restriction approval, privacy, pre-TTS silent/expert review, final expert 1x review, audio-only review, final 720p-with-captions review, and a private/unlisted staging-host transcode review; public visibility is forbidden before the accepted-artifact commit.
11. Truth state remains snapshot/separate-reference/no-order/current-source-verified/future-provenance.
12. Exactly one durable paid `started` event across all generation authorizations, ending in cache-bound `succeeded`, crash-reconciled `succeeded-from-cache`, or unique-history `recovered`; no superseding authorization/second POST, invalid cache, valid cache without its exact matching started chain, unaccounted attempt directory/event temp, conflicting terminal event, blocking event-recovery or immutable-artifact-recovery quarantine, or incomplete abandonment journal. Journaled unpublished-`000` recovery records and benign, fully resolved immutable concurrent-loser journals remain in the evidence chain but count as zero paid starts; any post-start `010`/`020` quarantine or unresolved partial/conflicting pre-paid artifact quarantine must be resolved or acceptance fails. Archived expired bundles must prove zero attempts/caches and remain in the hash chain.

Tests include negative fixtures for missing/null/`N/A`/`NaN`/infinite bitrate, zero or missing `nb_read_frames`, 24/25 and VFR timestamps, regressing packet DTS with valid presentation timestamps, reordered packet PTS with valid DTS (must pass), decoded final B-frames with no frame-level DTS (must pass), stale review hashes, pre-quantization-only captions, quantization-created overlap/CPS failure, loudness exactly inside/outside each boundary, dynamic `loudnorm` fallback, AAC decode failure, altered video packet digest, missing/ambiguous history alignment, invalid cache, valid cache without a matching started event, tampered reconciliation bindings, orphan/partial event temps, blocking event-recovery quarantine, unresolved partial/conflicting `artifact-recovery` journals, two success terminals, a second authorization or paid start, a missing/symlinked/wrong/content-drifted explicit hash-named attempt-chain ledger, and staging-review visibility that is public/listed or lacks an exact private/unlisted attestation. A fully journaled unpublished-`000` pre-start crash with no canonical started event is the positive zero-paid-start recovery fixture; a separately hashed benign immutable concurrent-loser journal whose canonical winner revalidates is also positive.

Add a two-phase acceptance test: `--candidate` with no human artifacts may emit only `status:"candidate"` plus missing-evidence IDs under `final/releases/candidate/<candidateLedgerSha256>.json`; its `reviewedCommit` must be the explicit commit that first contains the final verifier implementation, tests, and package command—not a picture-lock commit, request commit, or ambient later `HEAD`. Tests reject a nonexistent/non-ancestor commit, a commit whose three tracked blobs differ from the executing implementation, a dirty tracked verifier, and a runtime `HEAD` other than the supplied commit during candidate creation. Passing `--accept` without any one of the six review paths or Claude acknowledgment must exit nonzero, create no accepted ledger, and leave the candidate bytes/hash intact. Only fixtures with all seven exact schemas/hashes/check coverage may atomically publish a **new** `status:"accepted_submission_master"` ledger under `final/releases/accepted/<acceptedLedgerSha256>.json`, with `candidateLedgerSha256` pointing at the unchanged candidate. The accept path never rewrites, renames, or replaces a candidate. Unknown review flags and the same artifact reused for two review types fail. A clean-rerun fixture invokes candidate twice and accept twice with byte-identical inputs: each second invocation validates/reuses the same hash-named file, produces no extra ledger or temp, keeps the candidate inode bytes unchanged, and leaves `demo-video/final-evidence.json` byte-identical to the accepted ledger.

- [ ] **Step 2: Run and confirm RED**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
ELEVENLABS_DISABLE_NETWORK=1 node --test test/verify-final-master.test.mjs
```

Expected: missing verifier module.

- [ ] **Step 3: Implement the final release ledger**

`verify-final-master.mjs` has two immutable-output modes. `--candidate --verifier-implementation-commit <40-hex> --candidate-root <.../final/releases/candidate> --print-ledger-path` performs all automated gates but never infers manual PASS, builds deterministic canonical JSON with `status:"candidate"` plus missing evidence IDs, computes its SHA-256, and publishes it no-clobber at `<candidate-root>/<sha256>.json`; diagnostics go to stderr and stdout contains only the repository-relative ledger path. Candidate creation requires current `HEAD` to equal the explicit verifier implementation commit, requires the tracked worktree/index to be clean, and authenticates that commit’s blobs for `verify-final-master.mjs`, its test, and `package.json`. It writes that exact commit as `candidate.reviewedCommit`; the upstream picture-review commit remains separately named `pictureReviewedCommit`. It also requires explicit `--picture-lock-json`, `--picture-lock-candidate`, `--attempt-chain`, and canonical `--attempt-root` inputs: the first two replay native candidate/request/reply acceptance; the attempt-chain file must be `final/attempt-chains/<sha256>.json` and hash to its basename; and the verifier must reconstruct it exactly from the supplied canonical attempt root plus cache evidence before writing `candidate.attemptChainSha256`. It does **not** create or modify `demo-video/final-evidence.json`. Candidate content excludes invocation time, absolute paths, and other run-variant metadata, so identical evidence produces identical bytes/path. A later explicit `--accept --verifier-implementation-commit <same-40-hex> --candidate-ledger <hash-named candidate> --accepted-root <.../final/releases/accepted> --tracked-output ../final-evidence.json` requires the CLI value to equal `candidate.reviewedCommit`, requires the filename hash to equal the candidate bytes, reauthenticates the historical verifier blobs at that commit without substituting later `HEAD`, reruns every automated check against the same explicit accepted picture-lock/candidate/attempt-chain/media/evidence, and requires every manual-review and Claude-acknowledgment path. It then publishes a separate canonical `status:"accepted_submission_master"` ledger at `<accepted-root>/<acceptedLedgerSha256>.json`; that ledger contains the exact `candidateLedgerSha256`, preserves the candidate `reviewedCommit`, and is copied byte-for-byte to the tracked output using identical-content/no-clobber semantics. It never opens the candidate for writing. Both modes record exact final MP4/SRT SHA plus fields `pictureLockSha256`, `pictureLockCandidateSha256`, `pictureLockFactReviewSha256`, and `attemptChainSha256`, reviewed commit, capability/approval/cache hashes, a hash of each evidence file and recovery journal, reply provenance as separate `factMailboxSource`/`finalAckMailboxSource` objects with exact `{mailboxCommit,mailboxBlobOid,commitMode}`, and immutable request provenance as `factReviewRequestSource`/`finalQaReviewRequestSource` objects with exact `{requestMailboxCommit,requestMailboxBlobOid,mailboxEntrySha256}` plus the verified request ID/ordinal/artifact SHA from each reply payload. Neither mode substitutes runtime `HEAD`, stores credential material, local personal paths, request headers, or raw environment values. Temp write/fsync/no-clobber-publish/directory-fsync and crash recovery use the Task 3 immutable-artifact primitive for both roots and the tracked accepted copy.

Media evidence comes from these exact machine-readable probes (executed with the sanitized child environment from Task 5):

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
ffprobe -v error -show_entries \
  format=format_name,duration:stream=index,codec_type,codec_name,profile,sample_rate,channels,channel_layout,bit_rate:stream_side_data=rotation \
  -of json demo-video/levelfield-demo-final.mp4
ffprobe -v error -select_streams v:0 -count_frames \
  -show_entries stream=codec_name,profile,width,height,pix_fmt,field_order,sample_aspect_ratio,r_frame_rate,avg_frame_rate,time_base,duration_ts,nb_read_frames,color_space,color_transfer,color_primaries \
  -of json demo-video/levelfield-demo-final.mp4
ffprobe -v error -select_streams v:0 -show_frames \
  -show_entries frame=best_effort_timestamp_time,duration_time -of json demo-video/levelfield-demo-final.mp4
ffprobe -v error -select_streams v:0 -show_packets \
  -show_entries packet=dts_time,duration_time,size -of json demo-video/levelfield-demo-final.mp4
ffprobe -v error -select_streams a:0 -show_packets \
  -show_entries packet=duration_time,size -of json demo-video/levelfield-demo-final.mp4
ffmpeg -v error -i demo-video/levelfield-demo-final.mp4 -map 0:v:0 -c:v copy -f hash -hash sha256 -
ffmpeg -nostats -i demo-video/levelfield-demo-final.mp4 -map 0:a:0 \
  -af ebur128=peak=true -f null -
ffmpeg -v error -i demo-video/levelfield-demo-final.mp4 -map 0:v:0 -map 0:a:0 -f null -
```

First require exactly the two expected streams, MP4-family format, no rotation/display-matrix transform, finite format duration, AAC-LC/48kHz/2-channel metadata, and finite audio packet bitrate `8 * sum(audioPacket.size) / 159.56` within an explicitly tested 176–208kbps acceptance band for the 192kbps encoder target. Parse stream rationals as integer numerator/denominator pairs and ffprobe `*_time` decimal strings with an exact decimal/rational parser, not JavaScript division of unchecked strings. Reject absent/`N/A`/non-finite values. Require `nb_read_frames === 3989`; require decoded `best_effort_timestamp_time` to start at 0 and advance by 0.040 seconds, every frame `duration_time` to be 0.040 seconds within half one stream time-base tick, and final presentation time plus duration to equal 159.56 seconds. On FFmpeg 8.0.1, use only those two decoded-frame fields; duration and DTS at packet level come from the separate packet probe. Require packet `dts_time` strictly increasing; **do not** require packet PTS monotonic because H.264 B-frames may reorder it. Compute video bitrate as `8 * sum(videoPacket.size) / 159.56`, require a finite result in `[12_000_000,20_000_000]`, and never allow missing ffprobe `bit_rate` to turn into `NaN` PASS. Parse MP4 atom sizes (including 64-bit extended sizes) and require `moov` precedes `mdat`. Compare the video packet-data hash to the picture lock and finalizer records.

Parse the final decoded EBU R128 summary, reject missing/NaN/infinite values, and enforce the stated loudness and peak thresholds. This independent post-AAC measurement—not requested encoder settings or first-pass `loudnorm` JSON—is the PASS evidence. Parse the final SRT back to integer milliseconds, recompute every duration/CPS/layout/overlap check on those integers, and bind both the parsed cue-list hash and file hash.

Manual review JSON uses the Task 3 evidence schema and includes exact `finalMp4Sha256`, `finalSrtSha256`, `videoPacketSha256`, `reviewer`, `reviewedAt`, `protocolVersion`, and per-checkpoint verdicts. `final-caption-review.json` must cover each designated key-UI region at every overlapping cue; `audio-only-review.json` covers pronunciation of product/numeric/address tokens, pacing, clicks/clipping, and pauses. Missing, `N/A`, stale, self-attested automation, or a review of another encode blocks acceptance.

Add to `demo-video/capture/package.json`:

```json
{
  "verify:final-master": "node scripts/verify-final-master.mjs"
}
```

- [ ] **Step 4: Run the complete G0 and commit the verifier implementation**

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
ELEVENLABS_DISABLE_NETWORK=1 node --test test/verify-final-master.test.mjs
/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/scripts/mandatory-plan-precommit.sh
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add demo-video/capture/scripts/verify-final-master.mjs \
  demo-video/capture/test/verify-final-master.test.mjs demo-video/capture/package.json
test "$(git diff --cached --name-only | LC_ALL=C sort)" = "$(printf '%s\n' \
  demo-video/capture/package.json \
  demo-video/capture/scripts/verify-final-master.mjs \
  demo-video/capture/test/verify-final-master.test.mjs | LC_ALL=C sort)"
git diff --cached --check
git commit -m "feat(video): add immutable final-master verifier" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
VERIFIER_IMPLEMENTATION_COMMIT="$(git rev-parse HEAD)"
test "${#VERIFIER_IMPLEMENTATION_COMMIT}" -eq 40
git diff --cached --quiet
git diff --quiet
```

Expected: the focused verifier suite and the full mandatory G0 pass, and the three implementation paths are committed alone. Preserve `VERIFIER_IMPLEMENTATION_COMMIT`; it is the sole legal `candidate.reviewedCommit`. No candidate or human/Claude review request exists before this commit.

- [ ] **Step 5: Generate the immutable candidate from that exact commit**

First prove the committed verifier is still the checked-out tracked implementation, then run the candidate and conditional post-runtime smoke path. Generated/ignored media and evidence may exist, but the tracked index/worktree must remain clean:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
: "${VERIFIER_IMPLEMENTATION_COMMIT:?set from the dedicated verifier commit}"
: "${FACT_REVIEW_REQUEST_COMMIT:?set from the native fact-review request commit}"
: "${ATTEMPT_CHAIN:?set to the exact content-addressed path printed by the terminal generation/recovery command}"
PICTURE_LOCK_CANDIDATE_SHA256="$(node -e 'const fs=require("node:fs");const p=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(p.status!=="picture-lock"||!/^([0-9a-f]{64})$/.test(p.candidateSha256))process.exit(1);process.stdout.write(p.candidateSha256)' runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json)"
PICTURE_LOCK_CANDIDATE="runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock-candidates/${PICTURE_LOCK_CANDIDATE_SHA256}.json"
test "$(shasum -a 256 "$PICTURE_LOCK_CANDIDATE" | awk '{print $1}')" = "$PICTURE_LOCK_CANDIDATE_SHA256"
ATTEMPT_CHAIN_SHA256="$(shasum -a 256 "$ATTEMPT_CHAIN" | awk '{print $1}')"
test "$ATTEMPT_CHAIN" = "runs/2026-08-20T1530Z-preview/picture-lock-work/final/attempt-chains/${ATTEMPT_CHAIN_SHA256}.json"
test "$(git rev-parse HEAD)" = "$VERIFIER_IMPLEMENTATION_COMMIT"
git diff --cached --quiet
git diff --quiet
CANDIDATE_LEDGER="$(ELEVENLABS_DISABLE_NETWORK=1 npm run --silent verify:final-master -- \
  --candidate \
  --verifier-implementation-commit "$VERIFIER_IMPLEMENTATION_COMMIT" \
  --candidate-root runs/2026-08-20T1530Z-preview/picture-lock-work/final/releases/candidate \
  --print-ledger-path \
  --run runs/2026-08-20T1530Z-preview \
  --picture-lock-json runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json \
  --picture-lock-candidate "$PICTURE_LOCK_CANDIDATE" \
  --attempt-chain "$ATTEMPT_CHAIN" \
  --attempt-root runs/2026-08-20T1530Z-preview/picture-lock-work/final/attempts \
  --video ../levelfield-demo-final.mp4 \
  --srt ../levelfield-demo-final.en.srt \
  --claude-mailbox ../../docs/collab/inbox-codex.md \
  --fact-review-request-mailbox ../../docs/collab/inbox-claude.md \
  --fact-review-request-commit "$FACT_REVIEW_REQUEST_COMMIT")"
CANDIDATE_LEDGER_SHA256="$(shasum -a 256 "$CANDIDATE_LEDGER" | awk '{print $1}')"
test "$CANDIDATE_LEDGER" = \
  "runs/2026-08-20T1530Z-preview/picture-lock-work/final/releases/candidate/${CANDIDATE_LEDGER_SHA256}.json"
node -e 'const fs=require("node:fs"); const [p,c]=process.argv.slice(1); const x=JSON.parse(fs.readFileSync(p,"utf8")); if(x.status!=="candidate"||x.reviewedCommit!==c) process.exit(1)' \
  "$CANDIDATE_LEDGER" "$VERIFIER_IMPLEMENTATION_COMMIT"

cd /Users/qinjiaji/Desktop/GitProject/levelfield
POST_RUNTIME_STATUS=demo-video/capture/runs/2026-08-20T1530Z-preview/picture-lock-work/remotion-runtime-status.json
(cd demo-video/post && node --test test/architecture.test.mjs test/license-gate.test.mjs test/manifest.test.mjs)
if [[ -f "$POST_RUNTIME_STATUS" ]]; then
  RUNTIME_AVAILABLE="$(node demo-video/post/scripts/license-gate.mjs \
    --runtime-status "$POST_RUNTIME_STATUS" --print-runtime-available)"
  case "$RUNTIME_AVAILABLE" in
    true)
      test -d demo-video/post/node_modules
      node demo-video/post/scripts/license-gate.mjs \
        --runtime-status "$POST_RUNTIME_STATUS" --require-qualified-runtime
      (cd demo-video/post && npm test && npm run typecheck && node scripts/render.mjs --smoke \
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
git diff --check
```

Expected: the exact committed verifier generates the candidate with zero network use; the hash-named ledger remains immutable `candidate` evidence, records `reviewedCommit === VERIFIER_IMPLEMENTATION_COMMIT`, `attemptChainSha256 === ATTEMPT_CHAIN_SHA256`, and the accepted/candidate picture-lock provenance, and lists every still-missing manual artifact without marking it PASS. Preserve `VERIFIER_IMPLEMENTATION_COMMIT`, `CANDIDATE_LEDGER`, `CANDIDATE_LEDGER_SHA256`, and `ATTEMPT_CHAIN` for every remaining step; rediscovery is allowed only by reading the authenticated candidate’s exact `attemptChainSha256`, constructing `final/attempt-chains/<sha>.json`, and re-hashing that file, never by choosing a mutable “latest” file.

- [ ] **Step 6: Perform the human-visible review matrix**

Review the exact candidate SHA in these modes and record evidence bound to it:

- full-resolution 1x expert watch;
- first-time silent watch for visible action/response and no slide-like pacing;
- audio-only watch for pronunciation, pacing, clicks, clipping, and awkward pauses;
- 720p playback with captions for score/decision/test/explorer legibility and cue-by-cue key-UI occlusion;
- all checkpoint/boundary frames at original resolution;
- staging-host transcode watch after the owner uploads the candidate to the chosen host with visibility explicitly `private` or `unlisted`; do not publish or list it publicly yet.

Write the six artifacts at these exact paths:

```text
runs/2026-08-20T1530Z-preview/picture-lock-work/final/review/final-caption-review.json
runs/2026-08-20T1530Z-preview/picture-lock-work/final/review/audio-only-review.json
runs/2026-08-20T1530Z-preview/picture-lock-work/final/review/final-expert-review.json
runs/2026-08-20T1530Z-preview/picture-lock-work/final/review/final-silent-review.json
runs/2026-08-20T1530Z-preview/picture-lock-work/final/review/final-720p-review.json
runs/2026-08-20T1530Z-preview/picture-lock-work/final/review/post-upload-review.json
```

The first five use exact common schema `{schemaVersion:1,reviewType,reviewer,reviewedAt,protocolVersion,status:"PASS",candidateLedgerSha256,finalMp4Sha256,finalSrtSha256,videoPacketSha256,checks}` with non-empty typed `checks`; `candidateLedgerSha256` must equal the independently recomputed hash-named candidate, and `reviewType` must respectively be `caption-occlusion`, `audio-only`, `expert-1x`, `silent-first-time`, and `captioned-720p`. Caption review additionally lists every cue index and overlapping key-UI region; audio review lists every protected pronunciation token; expert/silent/720p reviews list every locked checkpoint. The staging-upload schema is `{schemaVersion:1,reviewType:"post-upload-staging-transcode",reviewer,reviewedAt,protocolVersion,status:"PASS",candidateLedgerSha256,sourceMp4Sha256,sourceSrtSha256,host,remoteVideoId,visibility,publiclyListed:false,playbackProfiles,checks}` where `visibility` is exactly `"private"` or `"unlisted"`, `playbackProfiles` is non-empty, and every profile has resolution, codec, playback time, and `verdict:"PASS"`. It forbids a public URL, `visibility:"public"`, searchable/listed discovery, or any assertion that publication already occurred. Hashes are recomputed; missing/empty/duplicate checks, `N/A`, stale candidate/media SHA, unparseable time, public visibility, or unknown review type fails.

Any issue before Task 7 would have blocked the paid call. A post-call issue must first be solved without another generation: caption line breaks, audio normalization, mux, or platform encoding may be regenerated from the cached timed response. A voice-content defect requires a new owner decision; no second call is automatic.

- [ ] **Step 7: Request Claude’s final independent QA acknowledgment**

Require `CANDIDATE_LEDGER` to be the immutable `candidate/<CANDIDATE_LEDGER_SHA256>.json` produced above and revalidate its filename/content hash and all locked inputs; do not read a conventional `final-release.json` or derive a new commit from runtime `HEAD`. Re-read `docs/collab/inbox-codex.md`. Generate one immutable request from the actual final MP4 plus explicit SRT/candidate-ledger/fact-verdict contexts; the helper generates UUID/ordinal/supersession itself and prepends the exact AGENTS entry to `docs/collab/inbox-claude.md`. Run G0 and commit that request immediately as a mailbox-only commit before Claude reviews it:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
: "${VERIFIER_IMPLEMENTATION_COMMIT:?set from the dedicated verifier commit}"
: "${CANDIDATE_LEDGER:?set to the hash-named candidate path}"
node -e 'const fs=require("node:fs"); const [p,c]=process.argv.slice(1); const x=JSON.parse(fs.readFileSync(p,"utf8")); if(x.status!=="candidate"||x.reviewedCommit!==c) process.exit(1)' \
  "$CANDIDATE_LEDGER" "$VERIFIER_IMPLEMENTATION_COMMIT"
PICTURE_LOCK=runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json
PICTURE_LOCK_SHA256="$(shasum -a 256 "$PICTURE_LOCK" | awk '{print $1}')"
PICTURE_LOCK_CANDIDATE_SHA256="$(node -e 'const fs=require("node:fs");const c=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(!/^([0-9a-f]{64})$/.test(c.pictureLockSha256??"")||!/^([0-9a-f]{64})$/.test(c.pictureLockCandidateSha256??""))process.exit(1);if(c.pictureLockSha256!==process.argv[2])process.exit(1);process.stdout.write(c.pictureLockCandidateSha256)' "$CANDIDATE_LEDGER" "$PICTURE_LOCK_SHA256")"
PICTURE_LOCK_CANDIDATE="runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock-candidates/${PICTURE_LOCK_CANDIDATE_SHA256}.json"
test "$(shasum -a 256 "$PICTURE_LOCK_CANDIDATE" | awk '{print $1}')" = "$PICTURE_LOCK_CANDIDATE_SHA256"
node -e 'const fs=require("node:fs");const [p,s]=process.argv.slice(1);const x=JSON.parse(fs.readFileSync(p,"utf8"));if(x.status!=="picture-lock"||x.candidateSha256!==s)process.exit(1)' "$PICTURE_LOCK" "$PICTURE_LOCK_CANDIDATE_SHA256"
ATTEMPT_CHAIN_SHA256="$(node -e 'const fs=require("node:fs");const c=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(!/^([0-9a-f]{64})$/.test(c.attemptChainSha256??""))process.exit(1);process.stdout.write(c.attemptChainSha256)' "$CANDIDATE_LEDGER")"
ATTEMPT_CHAIN="runs/2026-08-20T1530Z-preview/picture-lock-work/final/attempt-chains/${ATTEMPT_CHAIN_SHA256}.json"
test "$(shasum -a 256 "$ATTEMPT_CHAIN" | awk '{print $1}')" = "$ATTEMPT_CHAIN_SHA256"
git diff --cached --quiet
node scripts/evidence-artifacts.mjs --append-final-qa-review-request \
  --video ../levelfield-demo-final.mp4 \
  --srt ../levelfield-demo-final.en.srt \
  --candidate-ledger "$CANDIDATE_LEDGER" \
  --fact-verdict runs/2026-08-20T1530Z-preview/picture-lock-work/final/claude-fact-verdict.json \
  --attempt-chain "$ATTEMPT_CHAIN" \
  --mailbox ../../docs/collab/inbox-claude.md
/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/scripts/mandatory-plan-precommit.sh
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add docs/collab/inbox-claude.md
test "$(git diff --cached --name-only)" = "docs/collab/inbox-claude.md"
git diff --cached --check
git commit -m "docs(collab): request final-master QA" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
FINAL_QA_REQUEST_COMMIT="$(git rev-parse HEAD)"
```

The adapter maps only fixed mode `--append-final-qa-review-request` to internal `requestKind:"final-ack"`; no caller-selectable kind flag is exposed. The committed request’s closed payload contains exact `finalSrtSha256`, `candidateLedgerSha256`, `factVerdictSha256`, `reviewedCommit`, and `attemptChainSha256` fields; `reviewedCommit` must equal the candidate’s authenticated `VERIFIER_IMPLEMENTATION_COMMIT`. The helper requires the candidate filename to equal its recomputed content hash, requires `status:"candidate"`, derives `ATTEMPT_CHAIN` from candidate `attemptChainSha256`, requires the explicit file path/basename/bytes to match, and recomputes every nested input hash/count. Missing `--attempt-chain`, an inferred sibling, a symlink, a SHA mismatch, or a candidate/request chain mismatch fails before mailbox mutation. The request asks for independent verification that spoken numbers and chain/provenance wording still match the accepted fact verdict; it does not ask Claude to publish the file or send a chain transaction.

Require Claude’s reply in one AGENTS-compliant entry headed `## <ISO-8601 UTC ending Z> · from claude`, containing ``### Final-master QA acknowledgment · <exact committed reviewRequestId>``, one JSON fence, and final line `STATUS: DONE`. Its raw payload schema is `{schemaVersion:1,reviewedAt,status:"PASS",reviewRequestId,ordinal,artifactSha256,finalMp4Sha256,finalSrtSha256,candidateLedgerSha256,reviewedCommit,attemptCount:1,factVerdictSha256}`; the three request identity fields exactly repeat the authenticated final-QA request, `artifactSha256 === finalMp4Sha256`, `candidateLedgerSha256` exactly repeats the authenticated request value, and it contains none of the request-commit or response-envelope provenance/hash fields. `reviewedCommit` must be copied from the candidate ledger. Claude commits the reply itself with exact attribution, or places `HANDOFF: Codex may commit this exact verdict entry and no other uncommitted path.` immediately before `STATUS: DONE` and lets Codex make a mailbox-only commit; it then provides `FINAL_ACK_MAILBOX_COMMIT`. Historical request/reply pairs for other IDs remain append-only and do not create ambiguity. Import it into the local envelope through:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
: "${FINAL_QA_REQUEST_COMMIT:?set to the committed current final-QA request}"
: "${FINAL_ACK_MAILBOX_COMMIT:?set to Claude final-ack commit from explicit handoff}"
: "${CANDIDATE_LEDGER:?set to the hash-named candidate path}"
PICTURE_LOCK=runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json
PICTURE_LOCK_SHA256="$(shasum -a 256 "$PICTURE_LOCK" | awk '{print $1}')"
PICTURE_LOCK_CANDIDATE_SHA256="$(node -e 'const fs=require("node:fs");const c=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(!/^([0-9a-f]{64})$/.test(c.pictureLockSha256??"")||!/^([0-9a-f]{64})$/.test(c.pictureLockCandidateSha256??""))process.exit(1);if(c.pictureLockSha256!==process.argv[2])process.exit(1);process.stdout.write(c.pictureLockCandidateSha256)' "$CANDIDATE_LEDGER" "$PICTURE_LOCK_SHA256")"
PICTURE_LOCK_CANDIDATE="runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock-candidates/${PICTURE_LOCK_CANDIDATE_SHA256}.json"
test "$(shasum -a 256 "$PICTURE_LOCK_CANDIDATE" | awk '{print $1}')" = "$PICTURE_LOCK_CANDIDATE_SHA256"
node -e 'const fs=require("node:fs");const [p,s]=process.argv.slice(1);const x=JSON.parse(fs.readFileSync(p,"utf8"));if(x.status!=="picture-lock"||x.candidateSha256!==s)process.exit(1)' "$PICTURE_LOCK" "$PICTURE_LOCK_CANDIDATE_SHA256"
ATTEMPT_CHAIN_SHA256="$(node -e 'const fs=require("node:fs");const c=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(!/^([0-9a-f]{64})$/.test(c.attemptChainSha256??""))process.exit(1);process.stdout.write(c.attemptChainSha256)' "$CANDIDATE_LEDGER")"
ATTEMPT_CHAIN="runs/2026-08-20T1530Z-preview/picture-lock-work/final/attempt-chains/${ATTEMPT_CHAIN_SHA256}.json"
test "$(shasum -a 256 "$ATTEMPT_CHAIN" | awk '{print $1}')" = "$ATTEMPT_CHAIN_SHA256"
node scripts/evidence-artifacts.mjs --import-claude-final-ack \
  --mailbox ../../docs/collab/inbox-codex.md \
  --mailbox-commit "$FINAL_ACK_MAILBOX_COMMIT" \
  --request-mailbox ../../docs/collab/inbox-claude.md \
  --request-mailbox-commit "$FINAL_QA_REQUEST_COMMIT" \
  --candidate-ledger "$CANDIDATE_LEDGER" \
  --video ../levelfield-demo-final.mp4 \
  --srt ../levelfield-demo-final.en.srt \
  --fact-verdict runs/2026-08-20T1530Z-preview/picture-lock-work/final/claude-fact-verdict.json \
  --attempt-chain "$ATTEMPT_CHAIN" \
  --attempt-root runs/2026-08-20T1530Z-preview/picture-lock-work/final/attempts \
  --output runs/2026-08-20T1530Z-preview/picture-lock-work/final/review/claude-final-ack.json
```

The imported schema is `{schemaVersion:1,kind:"claude-final-ack-envelope",reviewer:"Claude Fable 5",reviewRequestSource:{mailboxPath:"docs/collab/inbox-claude.md",requestMailboxCommit,requestMailboxBlobOid,entryHeader,entrySubheading,mailboxEntrySha256},source:{mailboxPath,mailboxCommit,mailboxBlobOid,commitMode,entryHeader,entrySubheading,status:"DONE",payloadSha256,mailboxEntrySha256},payload}` using the same exact request/reply provenance keys, enum values, and hash domains as the fact envelope in Task 3. The importer authenticates the explicit request commit/blob/entry/ordinal chain, reads the explicit content-addressed candidate ledger, requires its filename hash to equal its bytes and `status:"candidate"`, requires the explicit `--attempt-chain` path to be exactly the content-addressed path derived from `candidate.attemptChainSha256`, independently reconstructs it from `--attempt-root`, and recomputes final MP4/SRT/fact/attempt hashes. It requires request `attemptChainSha256`, candidate `attemptChainSha256`, and explicit file SHA to be identical, and requires payload `candidateLedgerSha256` and `reviewedCommit` to equal the request/ledger; it never calls `git rev-parse HEAD`. It calls `verifyTrackedMailboxReply()` with the authenticated final request envelope and fixed `replyKind:"final-ack"`, verifies current response mailbox bytes equal the explicit committed blob at first import, copies both freshly returned provenance records, and recomputes both envelope hashes. The accept verifier re-runs the shared helper for the latest acknowledgment and in detached clean worktrees for the historical fact reply plus both request commits, compares every returned blob OID/commit mode/request entry hash to its envelope and candidate ledger, preserves the same reviewed commit, and rejects a supplied/non-derived subheading, duplicate current-request reply, stale/superseded request, stale/untracked mailbox commit, missing/forged provenance field, wrong attribution, absent/misplaced handoff, extra-path reply/request commit, dirty working mailbox, self-referential raw payload, changed candidate SHA/commit, missing/wrong attempt-chain path or hash, different attempt count, or prose-only acknowledgment. Tests include historical request-qualified acknowledgments plus one current unique request, stale payload/candidate/request commit, deliberately different runtime HEAD that must not affect validation, every deleted/forged request or response source field, both valid reply commit modes, all attribution/handoff negatives, clean-clone reproduction, both correction flows, missing/mismatched `--candidate-ledger`, missing/mismatched `--attempt-chain`, in-place-candidate-write detection, and clean reruns.

If the current final acknowledgment is committed `FAIL` or malformed, rerun the same fixed `--append-final-qa-review-request` command with the same explicit `--attempt-chain`. It maps to internal `requestKind:"final-ack"` and must produce ordinal +1 with a fresh ID for the same artifact; run G0, commit only `docs/collab/inbox-claude.md`, set `FINAL_QA_REQUEST_COMMIT` to that new commit, and wait for the newly qualified reply. Never add a second response under the old request ID.

- [ ] **Step 8: Accept, update docs, and commit the accepted master**

Only after Claude’s acknowledgment and all manual reviews are present, rerun the verifier in accept mode with every path explicit:

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture
: "${VERIFIER_IMPLEMENTATION_COMMIT:?set from the dedicated verifier commit}"
: "${CANDIDATE_LEDGER:?set to the hash-named candidate path}"
: "${FACT_REVIEW_REQUEST_COMMIT:?set from the native fact-review request commit}"
: "${FINAL_QA_REQUEST_COMMIT:?set to the committed current final-QA request}"
: "${FINAL_ACK_MAILBOX_COMMIT:?set to Claude final-ack commit}"
PICTURE_LOCK=runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock.json
PICTURE_LOCK_SHA256="$(shasum -a 256 "$PICTURE_LOCK" | awk '{print $1}')"
PICTURE_LOCK_CANDIDATE_SHA256="$(node -e 'const fs=require("node:fs");const c=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(!/^([0-9a-f]{64})$/.test(c.pictureLockSha256??"")||!/^([0-9a-f]{64})$/.test(c.pictureLockCandidateSha256??""))process.exit(1);if(c.pictureLockSha256!==process.argv[2])process.exit(1);process.stdout.write(c.pictureLockCandidateSha256)' "$CANDIDATE_LEDGER" "$PICTURE_LOCK_SHA256")"
PICTURE_LOCK_CANDIDATE="runs/2026-08-20T1530Z-preview/picture-lock-work/picture-lock-candidates/${PICTURE_LOCK_CANDIDATE_SHA256}.json"
test "$(shasum -a 256 "$PICTURE_LOCK_CANDIDATE" | awk '{print $1}')" = "$PICTURE_LOCK_CANDIDATE_SHA256"
node -e 'const fs=require("node:fs");const [p,s]=process.argv.slice(1);const x=JSON.parse(fs.readFileSync(p,"utf8"));if(x.status!=="picture-lock"||x.candidateSha256!==s)process.exit(1)' "$PICTURE_LOCK" "$PICTURE_LOCK_CANDIDATE_SHA256"
ATTEMPT_CHAIN_SHA256="$(node -e 'const fs=require("node:fs");const c=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(!/^([0-9a-f]{64})$/.test(c.attemptChainSha256??""))process.exit(1);process.stdout.write(c.attemptChainSha256)' "$CANDIDATE_LEDGER")"
ATTEMPT_CHAIN="runs/2026-08-20T1530Z-preview/picture-lock-work/final/attempt-chains/${ATTEMPT_CHAIN_SHA256}.json"
test "$(shasum -a 256 "$ATTEMPT_CHAIN" | awk '{print $1}')" = "$ATTEMPT_CHAIN_SHA256"
ELEVENLABS_DISABLE_NETWORK=1 npm run verify:final-master -- \
  --accept \
  --run runs/2026-08-20T1530Z-preview \
  --verifier-implementation-commit "$VERIFIER_IMPLEMENTATION_COMMIT" \
  --candidate-ledger "$CANDIDATE_LEDGER" \
  --accepted-root runs/2026-08-20T1530Z-preview/picture-lock-work/final/releases/accepted \
  --tracked-output ../final-evidence.json \
  --picture-lock-json "$PICTURE_LOCK" \
  --picture-lock-candidate "$PICTURE_LOCK_CANDIDATE" \
  --attempt-chain "$ATTEMPT_CHAIN" \
  --attempt-root runs/2026-08-20T1530Z-preview/picture-lock-work/final/attempts \
  --video ../levelfield-demo-final.mp4 \
  --srt ../levelfield-demo-final.en.srt \
  --final-caption-review runs/2026-08-20T1530Z-preview/picture-lock-work/final/review/final-caption-review.json \
  --audio-only-review runs/2026-08-20T1530Z-preview/picture-lock-work/final/review/audio-only-review.json \
  --expert-review runs/2026-08-20T1530Z-preview/picture-lock-work/final/review/final-expert-review.json \
  --silent-review runs/2026-08-20T1530Z-preview/picture-lock-work/final/review/final-silent-review.json \
  --review-720p runs/2026-08-20T1530Z-preview/picture-lock-work/final/review/final-720p-review.json \
  --post-upload-review runs/2026-08-20T1530Z-preview/picture-lock-work/final/review/post-upload-review.json \
  --claude-mailbox ../../docs/collab/inbox-codex.md \
  --fact-review-request-mailbox ../../docs/collab/inbox-claude.md \
  --fact-review-request-commit "$FACT_REVIEW_REQUEST_COMMIT" \
  --final-qa-request-mailbox ../../docs/collab/inbox-claude.md \
  --final-qa-request-commit "$FINAL_QA_REQUEST_COMMIT" \
  --claude-ack-mailbox-commit "$FINAL_ACK_MAILBOX_COMMIT" \
  --claude-ack runs/2026-08-20T1530Z-preview/picture-lock-work/final/review/claude-final-ack.json
```

Expected: every automated gate reruns PASS, every artifact hash/schema/check coverage passes, the candidate SHA remains byte-identical, and a new hash-named accepted ledger plus byte-identical tracked `final-evidence.json` mark the same exact MP4/SRT `accepted_submission_master`. Re-running the same command validates/reuses those exact outputs without mutation. Then commit:

Immediately before the final G0 invocation, prepend one newest-first AGENTS entry to `docs/collab/inbox-claude.md` that names the accepted final MP4/SRT/evidence hashes, releases the full Task 0 claim scope, and ends with `STATUS: DONE`. This is the only mailbox diff included in the final task commit; no pending CLAIMING renewal may be present.

```bash
cd /Users/qinjiaji/Desktop/GitProject/levelfield
/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/capture/scripts/mandatory-plan-precommit.sh
cd /Users/qinjiaji/Desktop/GitProject/levelfield
git add demo-video/levelfield-demo-final.en.srt demo-video/final-evidence.json \
  demo-video/README.md demo-video/capture/README.md docs/collab/inbox-claude.md
test "$(git diff --cached --name-only | LC_ALL=C sort)" = "$(printf '%s\n' \
  demo-video/README.md demo-video/capture/README.md demo-video/final-evidence.json \
  demo-video/levelfield-demo-final.en.srt docs/collab/inbox-claude.md | LC_ALL=C sort)"
git diff --cached --check
git commit -m "feat(video): lock one-pass narrated submission master" \
  -m "Co-Authored-By: OpenAI Codex <noreply@openai.com>"
```

- [ ] **Step 9: Publish only the already accepted staging asset**

Public publication is an owner operation strictly after the accepted-artifact commit above exists. Before changing host visibility, verify the committed `demo-video/final-evidence.json` is `accepted_submission_master`, its `candidateLedgerSha256` equals the staging review, its final MP4/SRT hashes still match local bytes, and its staging `remoteVideoId` is the exact asset reviewed under `private`/`unlisted` visibility. Then—and only then—the owner may change that same asset to public or submit its link. Do not upload a replacement, trigger a new encode, or edit the accepted/candidate ledger to predict publication. If the host changes the asset ID or playback transcodes when visibility changes, revert to private/unlisted and create a new candidate/review/acceptance chain; the prior accepted evidence does not cover different playback bytes. Publication status/URL is an operational receipt outside the pre-publication acceptance ledger and never retroactively fabricates a PASS.

The final docs state the exact SHA and never call the stale DreamDEX snapshot live, the 3/95 examples the same venue, the MCP transcript an order, or legacy provenance complete.

## Completion condition

This plan is complete only when there is exactly one durable paid start across all generation authorizations, that attempt ends in a strictly validated cache success (`succeeded`, crash-reconciled `succeeded-from-cache`, or unique GET-only history `recovered`), the final MP4/SRT and full evidence chain pass every automated and manual gate (including private/unlisted staging playback), Claude independently acknowledges the same fact state, the accepted-artifact commit exists, and one exact SHA is marked `accepted_submission_master`. Public visibility may be enabled only afterward under Step 9. A separately owner-approved second generation remains technically possible but makes this exact-one completion condition false until the owner explicitly replaces the acceptance goal. The API key remains only in the credential launcher and provider client’s local process memory and never appears in child environments, logs, manifests, screenshots, argv, git history, or shell history.
