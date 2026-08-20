import assert from "node:assert/strict";
import test from "node:test";

import { buildSrt, formatSrtTimestamp, validateCues } from "../scripts/captions.mjs";

test("formats SRT timestamps without rollover errors", () => {
  assert.equal(formatSrtTimestamp(0), "00:00:00,000");
  assert.equal(formatSrtTimestamp(61.9996), "00:01:02,000");
  assert.equal(formatSrtTimestamp(173.562), "00:02:53,562");
});

test("builds monotonic captions inside the video duration", () => {
  const cues = [
    { text: "First real action.", start: 0, end: 2.5 },
    { text: "Second real response.", start: 2.7, end: 5 },
  ];
  assert.doesNotThrow(() => validateCues(cues, 5));
  assert.match(buildSrt(cues), /1\n00:00:00,000 --> 00:00:02,500\nFirst real action\./);
});

test("rejects overlapping or out-of-bounds captions", () => {
  assert.throws(
    () => validateCues([{ text: "A", start: 0, end: 2 }, { text: "B", start: 1.9, end: 3 }], 3),
    /overlap/i,
  );
  assert.throws(() => validateCues([{ text: "A", start: 0, end: 3.1 }], 3), /duration/i);
});
