import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const captureRoot = path.resolve(here, "..");

export function formatSrtTimestamp(seconds) {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const secs = Math.floor((totalMs % 60_000) / 1000);
  const milliseconds = totalMs % 1000;
  return [hours, minutes, secs].map((value) => String(value).padStart(2, "0")).join(":") +
    `,${String(milliseconds).padStart(3, "0")}`;
}

export function validateCues(cues, totalDuration) {
  if (!Array.isArray(cues) || !cues.length) throw new Error("Caption cues are empty");
  let previousEnd = -1;
  for (const [index, cue] of cues.entries()) {
    if (!cue.text?.trim() || !Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.start < 0 || cue.end <= cue.start) {
      throw new Error(`Caption ${index + 1} is invalid`);
    }
    if (cue.start < previousEnd - 0.001) throw new Error(`Caption ${index + 1} overlaps the previous cue`);
    if (cue.end > totalDuration + 0.001) throw new Error(`Caption ${index + 1} exceeds the video duration`);
    previousEnd = cue.end;
  }
  return true;
}

export function buildSrt(cues) {
  return `${cues.map((cue, index) => [
    String(index + 1),
    `${formatSrtTimestamp(cue.start)} --> ${formatSrtTimestamp(cue.end)}`,
    cue.text.trim(),
  ].join("\n")).join("\n\n")}\n`;
}

function probeDuration(file) {
  const output = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file],
    { encoding: "utf8" },
  ).trim();
  const duration = Number(output);
  if (!Number.isFinite(duration) || duration <= 0) throw new Error(`Invalid audio duration for ${file}`);
  return duration;
}

export async function buildCues({ segmentsFile, audioRoot, trailSeconds = 0.2 }) {
  const segments = JSON.parse(await fs.readFile(segmentsFile, "utf8"));
  if (!Array.isArray(segments) || !segments.length) throw new Error("Narration segments are empty");
  const cues = [];
  let cursor = 0;
  for (const segment of segments) {
    const duration = probeDuration(path.resolve(audioRoot, segment.audio));
    cues.push({
      chapter: segment.chapter,
      step: segment.step,
      text: segment.text,
      audio: segment.audio,
      start: cursor,
      end: cursor + duration,
      duration,
      trailSeconds,
    });
    cursor += duration + trailSeconds;
  }
  validateCues(cues, cursor);
  return { cues, totalDuration: cursor };
}

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith("--")) continue;
    const key = argv[index].slice(2);
    values[key] = argv[index + 1] && !argv[index + 1].startsWith("--") ? argv[++index] : true;
  }
  return values;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const segmentsFile = path.resolve(captureRoot, args.segments ?? "../presentation/audio-segments.json");
  const audioRoot = path.resolve(captureRoot, args["audio-root"] ?? "../presentation/public/audio");
  const output = path.resolve(captureRoot, args.output ?? "../levelfield-demo.en.srt");
  const timingOutput = path.resolve(captureRoot, args.timing ?? "../timing-manifest.json");
  const trailSeconds = Number(args.trail ?? 0.2);
  const { cues, totalDuration } = await buildCues({ segmentsFile, audioRoot, trailSeconds });
  await fs.writeFile(output, buildSrt(cues));
  await fs.writeFile(timingOutput, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalDuration,
    segments: cues,
  }, null, 2)}\n`);
  console.log(`Wrote ${path.relative(captureRoot, output)} and ${path.relative(captureRoot, timingOutput)}`);
  console.log(`${cues.length} cues · ${totalDuration.toFixed(3)}s`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
