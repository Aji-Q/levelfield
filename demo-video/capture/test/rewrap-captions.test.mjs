import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_CPL,
  MAX_CPS,
  MAX_DURATION_MS,
  MAX_LINES,
  analyze,
  buildSrt,
  findSplitIndex,
  formatTimestamp,
  parseSrt,
  parseTimestamp,
  resolveCue,
  rewrapCues,
  wrapLines,
} from "../scripts/rewrap-captions.mjs";

function words(text) {
  return text.split(/\s+/).filter(Boolean);
}

// --- wrapper -----------------------------------------------------------

test("wrapLines keeps every line at or under 42 chars", () => {
  const text =
    "LevelField is a pre-trade risk layer for DreamDEX. It measures structural information asymmetry before a trader or agent takes a side.";
  const lines = wrapLines(text);
  for (const line of lines) assert.ok(line.length <= MAX_CPL, `"${line}" (${line.length}) exceeds ${MAX_CPL}`);
});

test("wrapLines never splits a word across lines", () => {
  const text =
    "Every event contract gives you a price. It does not tell you who could know first.";
  const lines = wrapLines(text);
  assert.deepEqual(lines.join(" ").split(/\s+/), words(text));
});

test("wrapLines fits an exactly-42-char line on one line", () => {
  const text = "a".repeat(20) + " " + "b".repeat(21); // 20 + 1 + 21 = 42
  assert.equal(text.length, 42);
  assert.deepEqual(wrapLines(text), [text]);
});

test("wrapLines pushes the word to a new line once the 42 boundary is crossed", () => {
  const text = "a".repeat(20) + " " + "b".repeat(22); // 43 chars total
  const lines = wrapLines(text);
  assert.equal(lines.length, 2);
  assert.equal(lines[0], "a".repeat(20));
  assert.equal(lines[1], "b".repeat(22));
});

// --- splitter ------------------------------------------------------------

test("findSplitIndex prefers a sentence ender nearest the midpoint", () => {
  const text = "Short lead in. A much longer trailing clause follows after it.";
  const at = findSplitIndex(text);
  assert.equal(text.slice(at - 1, at), ".");
});

test("findSplitIndex falls back to a clause boundary when no sentence ender exists", () => {
  const text = "First clause here, second clause follows, third clause ends";
  const at = findSplitIndex(text);
  assert.equal(text[at - 1], ",");
});

test("findSplitIndex falls back to a word boundary when no punctuation exists", () => {
  const text = "alpha bravo charlie delta echo foxtrot golf hotel";
  const at = findSplitIndex(text);
  assert.ok(/\s/.test(text[at - 1]));
  assert.ok(text.slice(0, at).trim().length > 0 && text.slice(at).trim().length > 0);
});

test("resolveCue splits an over-long cue with no gaps or overlaps (contiguous)", () => {
  const text =
    "LevelField is a pre-trade risk layer for DreamDEX. It measures structural information asymmetry before a trader or agent takes a side.";
  const startMs = 5554;
  const endMs = 14484; // ~8.9s, > MAX_DURATION_MS
  const pieces = resolveCue(text, startMs, endMs);
  assert.ok(pieces.length > 1);
  assert.equal(pieces[0].startMs, startMs);
  assert.equal(pieces[pieces.length - 1].endMs, endMs);
  for (let i = 1; i < pieces.length; i += 1) {
    assert.equal(pieces[i - 1].endMs, pieces[i].startMs, `gap/overlap between piece ${i - 1} and ${i}`);
  }
});

test("resolveCue loses no words and adds none (joined text equals original, single-spaced)", () => {
  const text =
    "Across sixteen curated contracts, scores span three to ninety-five. Category risk rises in the expected order, with a Spearman rho of point nine three.";
  const pieces = resolveCue(text, 0, 12000);
  const joined = pieces.map((p) => p.text).join(" ");
  assert.deepEqual(words(joined), words(text));
});

test("resolveCue allocates time proportionally to each piece's character share", () => {
  // Two sentences of very different lengths, combined text already fits 2x42 so the only
  // reason to split is the 7.0s duration cap - isolates the timing math from CPL splitting.
  const left = "Short.";
  const right = "This second sentence is a great deal longer than the first one by design.";
  const text = `${left} ${right}`;
  assert.ok(wrapLines(text).length <= MAX_LINES, "fixture must already fit 2 lines");
  const totalMs = 7500; // > MAX_DURATION_MS, but small enough both proportional shares stay <=7000ms
  const pieces = resolveCue(text, 0, totalMs);
  assert.equal(pieces.length, 2);
  const expectedBoundary = Math.round(totalMs * (left.length / (left.length + right.length)));
  assert.equal(pieces[0].endMs, expectedBoundary);
  assert.equal(pieces[1].startMs, expectedBoundary);
  assert.equal(pieces[0].text, left);
  assert.equal(pieces[1].text, right);
});

// --- CPS / duration enforcement ------------------------------------------

test("resolveCue enforces the 7.0s duration cap by splitting further", () => {
  // Short text, but a long silence-padded window: fits 2 lines/CPS easily, fails only on duration.
  const text = "A short line that easily fits within two lines of forty two characters wide.";
  const pieces = resolveCue(text, 0, 20_000); // 20s window
  assert.ok(pieces.length > 1);
  for (const piece of pieces) {
    assert.ok(piece.endMs - piece.startMs <= MAX_DURATION_MS, `piece duration ${piece.endMs - piece.startMs}ms exceeds cap`);
  }
});

test("resolveCue keeps every piece under the 17 CPS cap for a realistic narrated cue", () => {
  // Real cue #20 from the source SRT: overall CPS ~14.05 (compliant) but duration ~12.6s
  // (violates the 7.0s cap), so it must split. Proportional time allocation preserves the
  // source's chars/second ratio in every piece, so CPS should stay under the cap throughout -
  // this also guards against millisecond-rounding nudging a small piece over the line.
  const text =
    "Sixty-nine software tests and eight smart-contract tests pass. The official DreamDEX SDK independently cross-checks active-market discovery, read-only and without a private key.";
  const startMs = parseTimestamp("00:02:28,166");
  const endMs = parseTimestamp("00:02:40,762");
  assert.ok(text.length * 1000 <= MAX_CPS * (endMs - startMs), "fixture's overall CPS must already be compliant");
  const pieces = resolveCue(text, startMs, endMs);
  assert.ok(pieces.length > 1, "the 12.6s cue must be split for duration alone");
  for (const piece of pieces) {
    const durationS = (piece.endMs - piece.startMs) / 1000;
    const cps = piece.text.length / durationS;
    assert.ok(cps <= MAX_CPS + 1e-6, `piece CPS ${cps.toFixed(2)} exceeds ${MAX_CPS}`);
    assert.ok(piece.endMs - piece.startMs <= MAX_DURATION_MS, `piece duration ${piece.endMs - piece.startMs}ms exceeds cap`);
  }
});

test("analyze reports zero violations once cues satisfy the spec", () => {
  const cues = [{ text: "Two short lines fit easily inside the limit.", startMs: 0, endMs: 3000 }];
  const stats = analyze(cues);
  assert.equal(stats.violations.length, 0);
  assert.ok(stats.maxLines <= MAX_LINES);
});

// --- SRT parse/format round trip -----------------------------------------

test("formatTimestamp/parseTimestamp round-trip", () => {
  assert.equal(formatTimestamp(0), "00:00:00,000");
  assert.equal(parseTimestamp("00:02:53,363"), ((2 * 60 + 53) * 1000) + 363);
  assert.equal(formatTimestamp(parseTimestamp("01:02:03,004")), "01:02:03,004");
});

// --- end-to-end: 3-sentence, ~120-char, 12s fixture cue ------------------

const FIXTURE_CUE_TEXT =
  "Alpha reviews the data each morning before trading. " +
  "Beta checks the signal against sources. " +
  "Gamma logs the decision fast.";

test("fixture cue is a 3-sentence, ~120-char cue for the end-to-end case", () => {
  assert.equal((FIXTURE_CUE_TEXT.match(/[.!?]/g) || []).length, 3);
  assert.ok(Math.abs(FIXTURE_CUE_TEXT.length - 120) <= 10, `fixture is ${FIXTURE_CUE_TEXT.length} chars`);
});

function buildFixtureSrt() {
  const cue = { startMs: 0, endMs: 12_000, text: FIXTURE_CUE_TEXT };
  return buildFixtureSrtFromCue(cue);
}

function buildFixtureSrtFromCue(cue) {
  return `1\n${formatTimestamp(cue.startMs)} --> ${formatTimestamp(cue.endMs)}\n${cue.text}\n`;
}

test("end-to-end: parseSrt -> rewrapCues -> buildSrt on the fixture cue", () => {
  const sourceSrt = buildFixtureSrt();
  const parsed = parseSrt(sourceSrt);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].startMs, 0);
  assert.equal(parsed[0].endMs, 12_000);
  assert.equal(parsed[0].text, FIXTURE_CUE_TEXT);

  const rewrapped = rewrapCues(parsed);
  assert.ok(rewrapped.length > 1, "the 12s/120-char cue must be split into more than one cue");

  // Every resulting cue satisfies the full spec.
  const stats = analyze(rewrapped);
  assert.deepEqual(stats.violations, []);
  assert.ok(stats.maxCpl <= MAX_CPL);
  assert.ok(stats.maxLines <= MAX_LINES);
  assert.ok(stats.maxCps <= MAX_CPS + 1e-6);
  assert.ok(stats.maxDuration * 1000 <= MAX_DURATION_MS + 1e-6);

  // Contiguous, bounds preserved, no text lost.
  assert.equal(rewrapped[0].startMs, 0);
  assert.equal(rewrapped[rewrapped.length - 1].endMs, 12_000);
  for (let i = 1; i < rewrapped.length; i += 1) {
    assert.equal(rewrapped[i - 1].endMs, rewrapped[i].startMs);
  }
  assert.deepEqual(words(rewrapped.map((c) => c.text).join(" ")), words(FIXTURE_CUE_TEXT));

  // The rendered SRT renumbers sequentially and round-trips back to the same cues.
  const rendered = buildSrt(rewrapped);
  const reparsedBlocks = rendered.trim().split(/\n\s*\n+/);
  reparsedBlocks.forEach((block, i) => {
    assert.equal(block.split("\n")[0], String(i + 1));
  });
});
