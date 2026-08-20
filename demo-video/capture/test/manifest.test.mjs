import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const here = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.resolve(here, "..", "capture-manifest.json");
const editManifestPath = path.resolve(here, "..", "edit-manifest.json");
const ALLOWED_KINDS = new Set(["browser", "terminal", "explorer", "title", "transition"]);
const VIDEO_EXTENSION = /\.(?:webm|mp4|mov)$/i;
const FORBIDDEN_SOURCE = /(?:\.(?:png|jpe?g|gif|webp|avif)$|presentation\/|render-video\.mjs)/i;

function readManifest() {
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertTimeline(manifest) {
  assert.equal(manifest.schemaVersion, 1, "manifest schemaVersion must be 1");
  assert.equal(manifest.mode, "capture-led", "manifest must declare a capture-led mode");
  assert.ok(Array.isArray(manifest.timeline?.clips), "manifest must contain timeline clips");
  assert.ok(manifest.timeline.clips.length > 0, "timeline must contain at least one clip");

  const ids = new Set();
  let totalSeconds = 0;
  let recordedSeconds = 0;
  let graphicSeconds = 0;

  for (const clip of manifest.timeline.clips) {
    assert.equal(typeof clip.id, "string", "every clip needs a string id");
    assert.ok(clip.id.length > 0, "clip ids must not be empty");
    assert.ok(!ids.has(clip.id), `duplicate clip id: ${clip.id}`);
    ids.add(clip.id);
    assert.ok(ALLOWED_KINDS.has(clip.kind), `unsupported clip kind: ${clip.kind}`);
    assert.equal(typeof clip.source, "string", `${clip.id} needs a source video`);
    assert.ok(VIDEO_EXTENSION.test(clip.source), `${clip.id} source must be a video file`);
    assert.ok(!FORBIDDEN_SOURCE.test(clip.source), `${clip.id} source uses a forbidden rendered/image asset`);
    assert.ok(Number.isFinite(clip.durationSeconds) && clip.durationSeconds > 0, `${clip.id} needs a positive duration`);
    assert.ok(Array.isArray(clip.requiredActionIds), `${clip.id} must declare action IDs`);
    assert.ok(Array.isArray(clip.truthLabels), `${clip.id} must declare truth labels`);
    assert.ok(clip.truthLabels.length > 0, `${clip.id} needs at least one truth label`);
    if (["browser", "terminal", "explorer"].includes(clip.kind)) {
      assert.ok(clip.requiredActionIds.length > 0, `${clip.id} recorded clip needs visible actions`);
    }

    totalSeconds += clip.durationSeconds;
    if (["browser", "terminal", "explorer"].includes(clip.kind)) recordedSeconds += clip.durationSeconds;
    if (["title", "transition"].includes(clip.kind)) graphicSeconds += clip.durationSeconds;
  }

  assert.ok(totalSeconds >= 120 && totalSeconds <= 180, `timeline must be 2–3 minutes, got ${totalSeconds}s`);
  assert.ok(recordedSeconds / totalSeconds >= 0.85, "recorded browser/terminal/explorer coverage must be at least 85%");
  assert.ok(graphicSeconds <= 10, `title/transition budget is 10 seconds, got ${graphicSeconds}s`);

  assert.equal(manifest.truthContract?.dreamdex?.label, "timestamped_snapshot");
  assert.equal(manifest.truthContract?.curatedReference?.label, "separate_curated_reference");
  assert.equal(manifest.truthContract?.mcp?.label, "pre_action_policy_not_order");
  assert.equal(manifest.truthContract?.provenance?.currentState, "legacy_source_verified");
}

test("capture manifest is a 2–3 minute capture-led timeline with recorded interaction coverage", () => {
  assertTimeline(readManifest());
});

test("capture contract mirrors the accepted edit instead of a stale storyboard plan", () => {
  const contract = readManifest();
  const edit = JSON.parse(readFileSync(editManifestPath, "utf8"));
  assert.equal(contract.canonicalEditManifest, "edit-manifest.json");
  assert.equal(contract.timeline.targetDurationSeconds, edit.targetDuration);
  assert.deepEqual(
    contract.timeline.clips.map((clip) => ({
      id: clip.id,
      kind: clip.kind,
      source: clip.source.replace(/^runs\/RUN_ID\//, ""),
      duration: clip.durationSeconds,
      actions: clip.requiredActionIds,
      facts: clip.truthLabels,
    })),
    edit.timeline.map((clip) => ({
      id: clip.id,
      kind: clip.kind,
      source: clip.source,
      duration: clip.outputDuration,
      actions: clip.requiredActions,
      facts: clip.factIds,
    })),
  );
});

test("capture manifest rejects screenshot and legacy presentation sources", () => {
  const png = clone(readManifest());
  png.timeline.clips[0].source = "runs/RUN_ID/browser/landing.png";
  assert.throws(() => assertTimeline(png), /forbidden rendered\/image asset|source must be a video/i);

  const presentation = clone(readManifest());
  presentation.timeline.clips[0].source = "presentation/scripts/render-video.mjs";
  assert.throws(() => assertTimeline(presentation), /source must be a video/i);
});
