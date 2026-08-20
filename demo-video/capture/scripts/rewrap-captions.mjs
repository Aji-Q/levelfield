// Re-wraps and re-times demo-video/levelfield-demo.en.srt to satisfy the locked caption spec:
// <=2 lines/cue, <=42 chars/line (CPL), <=17 chars/sec (CPS), <=7.0s/cue, split points only at
// semantic boundaries (sentence enders > clause boundaries > word boundaries), never mid-word.
// Cues are only ever SPLIT into more sequential cues with proportionally re-timed windows -
// wording is never rewritten, merged, or dropped. Does NOT touch narration audio, timing-
// manifest.json, or any file besides levelfield-demo.en.srt.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const srtPath = path.resolve(here, "../../levelfield-demo.en.srt");

export const MAX_CPL = 42;
export const MAX_LINES = 2;
export const MAX_CPS = 17;
export const MAX_DURATION_MS = 7000;

// Split-point tiers in priority order: sentence enders, then clause boundaries, then any word
// boundary. Regular hyphens ("-") are deliberately excluded so compound words (e.g.
// "ninety-five") never get cut.
const SPLIT_TIERS = [/[.!?]/g, /[,;:—]/g, /\s/g];

// Greedy word-wrap: packs words onto a line while it stays <=MAX_CPL, never splitting a word.
// wrapLines("a ".repeat(21) + "bb") -> lines of increasing length, last word forced to line 2.
export function wrapLines(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= MAX_CPL) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Finds the character offset nearest the midpoint of `text` at the highest-priority boundary
// tier that has a usable candidate (one that leaves non-empty text on both sides). Returns null
// when the text cannot be split further (e.g. a single unbreakable word).
export function findSplitIndex(text) {
  const mid = text.length / 2;
  for (const tier of SPLIT_TIERS) {
    let best = null;
    let bestDist = Infinity;
    for (const match of text.matchAll(tier)) {
      const at = match.index + 1;
      if (at <= 0 || at >= text.length) continue;
      if (!text.slice(0, at).trim() || !text.slice(at).trim()) continue;
      const dist = Math.abs(at - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = at;
      }
    }
    if (best !== null) return best;
  }
  return null;
}

function fitsSpec(text, startMs, endMs) {
  const lines = wrapLines(text);
  const durationMs = endMs - startMs;
  const fitsCpl = lines.length <= MAX_LINES && lines.every((line) => line.length <= MAX_CPL);
  const fitsDuration = durationMs <= MAX_DURATION_MS;
  const fitsCps = text.length * 1000 <= MAX_CPS * durationMs;
  return fitsCpl && fitsDuration && fitsCps;
}

// Recursively resolves one cue's text/time window into N sequential {text, startMs, endMs}
// pieces that each satisfy the CPL/lines/duration/CPS spec. Every split reallocates the time
// window proportionally to each side's character share (integer-ms arithmetic keeps pieces
// exactly contiguous - no gaps or overlaps - and composes correctly across recursive splits,
// since a leaf's time share always ends up proportional to its char share of the whole window).
// Text is only ever sliced and trimmed, never rewritten: rejoining all leaves with single spaces
// reproduces the input exactly.
export function resolveCue(text, startMs, endMs) {
  if (fitsSpec(text, startMs, endMs)) {
    return [{ text, startMs, endMs }];
  }
  const splitAt = findSplitIndex(text);
  if (splitAt === null) {
    // Unbreakable text (e.g. a single word) - best effort, reported as a violation upstream.
    return [{ text, startMs, endMs }];
  }
  const left = text.slice(0, splitAt).trim();
  const right = text.slice(splitAt).trim();
  const totalChars = left.length + right.length;
  const boundaryMs = startMs + Math.round((endMs - startMs) * (left.length / totalChars));
  return [...resolveCue(left, startMs, boundaryMs), ...resolveCue(right, boundaryMs, endMs)];
}

export function rewrapCues(cues) {
  const result = [];
  for (const cue of cues) result.push(...resolveCue(cue.text, cue.startMs, cue.endMs));
  return result;
}

export function parseTimestamp(str) {
  const m = str.trim().match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/);
  if (!m) throw new Error(`Invalid SRT timestamp "${str}"`);
  const [, hh, mm, ss, ms] = m;
  return ((Number(hh) * 60 + Number(mm)) * 60 + Number(ss)) * 1000 + Number(ms);
}

export function formatTimestamp(ms) {
  const clamped = Math.max(0, Math.round(ms));
  const hours = Math.floor(clamped / 3_600_000);
  const minutes = Math.floor((clamped % 3_600_000) / 60_000);
  const secs = Math.floor((clamped % 60_000) / 1000);
  const millis = clamped % 1000;
  return `${[hours, minutes, secs].map((v) => String(v).padStart(2, "0")).join(":")},${String(millis).padStart(3, "0")}`;
}

export function parseSrt(content) {
  const blocks = content.replace(/\r\n/g, "\n").trim().split(/\n\s*\n+/);
  return blocks.map((block) => {
    const lines = block.split("\n");
    const [startStr, endStr] = lines[1].split("-->").map((s) => s.trim());
    const text = lines.slice(2).join(" ").replace(/\s+/g, " ").trim();
    return { startMs: parseTimestamp(startStr), endMs: parseTimestamp(endStr), text };
  });
}

export function buildSrt(cues) {
  return `${cues
    .map((cue, index) => {
      const lines = wrapLines(cue.text);
      return `${index + 1}\n${formatTimestamp(cue.startMs)} --> ${formatTimestamp(cue.endMs)}\n${lines.join("\n")}`;
    })
    .join("\n\n")}\n`;
}

// Stats + spec-violation report shared by the before/after CLI output. `wrap: false` measures
// each cue's *current* physical-line layout (one line = cue.text, unwrapped) - what the BEFORE
// report needs, since the source file's cues are not yet line-wrapped. `wrap: true` (default)
// measures what buildSrt will actually render - what the AFTER report and pass/fail check need.
export function analyze(cues, { wrap = true } = {}) {
  let maxCpl = 0;
  let maxLines = 0;
  let maxCps = 0;
  let maxDuration = 0;
  const violations = [];
  cues.forEach((cue, i) => {
    const lines = wrap ? wrapLines(cue.text) : [cue.text];
    const durationS = (cue.endMs - cue.startMs) / 1000;
    const cps = cue.text.length / durationS;
    maxCpl = Math.max(maxCpl, ...lines.map((line) => line.length));
    maxLines = Math.max(maxLines, lines.length);
    maxCps = Math.max(maxCps, cps);
    maxDuration = Math.max(maxDuration, durationS);
    const problems = [];
    if (lines.length > MAX_LINES) problems.push(`lines=${lines.length}`);
    const overCpl = Math.max(0, ...lines.map((line) => line.length - MAX_CPL));
    if (overCpl > 0) problems.push(`cpl=${Math.max(...lines.map((line) => line.length))}`);
    if (durationS * 1000 > MAX_DURATION_MS + 1e-6) problems.push(`duration=${durationS.toFixed(3)}s`);
    if (cps > MAX_CPS + 1e-6) problems.push(`cps=${cps.toFixed(2)}`);
    if (problems.length) violations.push({ index: i + 1, problems });
  });
  return { count: cues.length, maxCpl, maxLines, maxCps, maxDuration, violations };
}

function printReport(label, stats) {
  console.log(
    `${label}  cues=${stats.count}  maxCPL=${stats.maxCpl}  maxLines=${stats.maxLines}  ` +
      `maxCPS=${stats.maxCps.toFixed(2)}  maxDuration=${stats.maxDuration.toFixed(3)}s`,
  );
}

function main() {
  const original = fs.readFileSync(srtPath, "utf8");
  const beforeCues = parseSrt(original);
  const before = analyze(beforeCues, { wrap: false });
  printReport("BEFORE", before);

  const afterCues = rewrapCues(beforeCues);
  const after = analyze(afterCues);
  printReport("AFTER ", after);

  fs.writeFileSync(srtPath, buildSrt(afterCues));
  console.log(`Wrote ${path.relative(process.cwd(), srtPath)}`);

  if (after.violations.length) {
    console.error("VIOLATIONS:");
    for (const v of after.violations) console.error(`  cue ${v.index}: ${v.problems.join(", ")}`);
    process.exitCode = 1;
  } else {
    console.log("All cues satisfy the caption spec.");
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
