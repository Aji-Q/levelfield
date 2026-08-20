import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  parseSrt,
  readActions,
  validateNoBlankFrameRuns,
  validateMediaProbe,
  validateRequiredActions,
  validateTruthFacts,
} from "../scripts/verify-final.mjs";

const goodProbe = {
  streams: [
    { codec_type: "video", codec_name: "h264", width: 1920, height: 1080, pix_fmt: "yuv420p", avg_frame_rate: "30/1" },
    { codec_type: "audio", codec_name: "aac", sample_rate: "48000", channels: 2 },
  ],
  format: { duration: "173.563" },
};

test("accepts submission media properties", () => {
  assert.doesNotThrow(() => validateMediaProbe(goodProbe));
});

test("rejects slide-sized, silent, or overlong output", () => {
  const wrongSize = structuredClone(goodProbe);
  wrongSize.streams[0].width = 1280;
  assert.throws(() => validateMediaProbe(wrongSize), /1920/);

  const noAudio = structuredClone(goodProbe);
  noAudio.streams.pop();
  assert.throws(() => validateMediaProbe(noAudio), /AAC/);

  const overlong = structuredClone(goodProbe);
  overlong.format.duration = "180.01";
  assert.throws(() => validateMediaProbe(overlong), /120.*180/);
});

test("rejects visible blank flashes while tolerating one boundary frame", () => {
  const normal = { time: 0, yMin: 5, yMax: 245 };
  const white = (time) => ({ time, yMin: 235, yMax: 235 });
  const black = (time) => ({ time, yMin: 16, yMax: 16 });

  assert.doesNotThrow(() => validateNoBlankFrameRuns([normal, white(0.1), normal]));
  assert.throws(
    () => validateNoBlankFrameRuns([normal, white(0.1), white(0.2), normal]),
    /blank-frame run/i,
  );
  assert.throws(
    () => validateNoBlankFrameRuns([normal, black(0.1), black(0.2), normal]),
    /blank-frame run/i,
  );
});

test("parses monotonic SRT cues", () => {
  const cues = parseSrt("1\n00:00:00,000 --> 00:00:02,000\nHello\n\n2\n00:00:02,200 --> 00:00:04,000\nWorld\n");
  assert.equal(cues.length, 2);
  assert.equal(cues[1].start, 2.2);
});

test("requires every timeline action to exist in the capture log", () => {
  const timeline = [
    { id: "web", requiredActions: ["home.scroll", "market.click"] },
    { id: "terminal", requiredActions: ["demo-agent.execute"] },
  ];
  assert.doesNotThrow(() => validateRequiredActions(timeline, [
    { id: "home.scroll" }, { id: "market.click" }, { id: "demo-agent.execute" },
  ]));
  assert.throws(() => validateRequiredActions(timeline, [{ id: "home.scroll" }]), /market\.click/);
});

test("uses the prepared normalized action log without double-counting raw rows", async () => {
  const run = await fs.mkdtemp(path.join(os.tmpdir(), "levelfield-actions-"));
  await fs.mkdir(path.join(run, "terminal"));
  await fs.writeFile(path.join(run, "actions.json"), JSON.stringify({ actions: [{ id: "normalized.one" }] }));
  await fs.writeFile(path.join(run, "terminal", "actions.raw.json"), JSON.stringify([
    { id: "normalized.one" },
    { id: "raw.two" },
  ]));
  const result = await readActions(run);
  assert.deepEqual(result.actions, [{ id: "normalized.one" }]);
  assert.deepEqual(result.files, [path.join(run, "actions.json")]);
  await fs.rm(run, { recursive: true, force: true });
});

test("enforces snapshot, distinct-source, no-order, and provenance truth", () => {
  const facts = {
    dreamdex: { presentation: "timestamped_snapshot", generatedAt: "2026-08-20T02:25:38.554Z" },
    comparison: { score3Source: "dreamdex_snapshot", score95Source: "curated_reference", sameVenue: false },
    mcp: { role: "pre_action_policy", orderSubmitted: false },
    provenance: { state: "legacy", currentUriComplete: false, narrationMode: "future_tense" },
  };
  assert.doesNotThrow(() => validateTruthFacts(facts));
  const falseLive = structuredClone(facts);
  falseLive.dreamdex.presentation = "live";
  assert.throws(() => validateTruthFacts(falseLive), /timestamped snapshot/i);
  const fakeComplete = structuredClone(facts);
  fakeComplete.provenance.narrationMode = "complete";
  assert.throws(() => validateTruthFacts(fakeComplete), /legacy provenance/i);
});
