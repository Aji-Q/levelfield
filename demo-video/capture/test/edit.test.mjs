import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeTimeline,
  buildClipFilter,
  validateEditManifest,
} from "../scripts/compose.mjs";

const baseManifest = {
  version: 1,
  targetDuration: 150,
  audio: {
    segments: "../presentation/audio-segments.json",
    root: "../presentation/public/audio",
    trailSeconds: 0.2,
  },
  timeline: [
    {
      id: "real-browser",
      kind: "browser",
      source: "browser/home.webm",
      sourceIn: 1,
      sourceOut: 140,
      outputDuration: 140,
      requiredActions: ["home.scroll", "market.click"],
      factIds: ["snapshot.timestamp"],
    },
    {
      id: "title-over-real-browser",
      kind: "title-overlay",
      source: "browser/closing.webm",
      sourceIn: 0,
      sourceOut: 10,
      outputDuration: 10,
      requiredActions: ["closing.hover"],
      factIds: ["sources.distinct"],
    },
  ],
};

test("accepts a capture-led timeline and reports authentic coverage", () => {
  assert.doesNotThrow(() => validateEditManifest(baseManifest));
  const analysis = analyzeTimeline(baseManifest);
  assert.equal(analysis.totalDuration, 150);
  assert.equal(analysis.authenticDuration, 150);
  assert.equal(analysis.authenticCoverage, 1);
  assert.equal(analysis.titleTransitionDuration, 10);
});

test("rejects screenshots and the storyboard presentation renderer", () => {
  for (const source of ["frames/01.png", "../presentation/scene.webm", "still.jpeg"]) {
    const manifest = structuredClone(baseManifest);
    manifest.timeline[0].source = source;
    assert.throws(() => validateEditManifest(manifest), /recorded video|presentation/i);
  }
});

test("rejects low authentic coverage and excessive title time", () => {
  const manifest = structuredClone(baseManifest);
  manifest.timeline[0].kind = "motion-graphic";
  assert.throws(() => validateEditManifest(manifest), /85%/);

  const titleHeavy = structuredClone(baseManifest);
  titleHeavy.timeline[1].outputDuration = 10.1;
  titleHeavy.timeline[1].sourceOut = 10.1;
  titleHeavy.targetDuration = 150.1;
  assert.throws(() => validateEditManifest(titleHeavy), /10 seconds/);
});

test("clip filter preserves real footage and rejects implausible retiming", () => {
  assert.match(
    buildClipFilter({ sourceIn: 2, sourceOut: 12, outputDuration: 10 }),
    /trim=start=2:end=12/,
  );

  assert.throws(
    () => buildClipFilter({ sourceIn: 0, sourceOut: 5, outputDuration: 10 }),
    /retiming factor/i,
  );
});
