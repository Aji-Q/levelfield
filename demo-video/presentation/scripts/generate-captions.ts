import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const segmentsPath = path.join(root, "audio-segments.json");
const outputPath = path.resolve(root, "..", "levelfield-demo.en.srt");
const manifestPath = path.resolve(root, "..", "timing-manifest.json");
const trailSeconds = 0.2;

interface Segment {
  chapter: string;
  step: number;
  text: string;
  audio: string;
}

function durationOf(file: string): number {
  const raw = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file],
    { encoding: "utf8" },
  ).trim();
  const duration = Number(raw);
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Invalid audio duration for ${file}: ${JSON.stringify(raw)}`);
  }
  return duration;
}

function timestamp(seconds: number): string {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const secs = Math.floor((totalMs % 60_000) / 1000);
  const millis = totalMs % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
}

function wrap(text: string, limit = 58): string {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (line && `${line} ${word}`.length > limit) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  if (lines.length <= 2) return lines.join("\n");
  const midpoint = Math.ceil(words.length / 2);
  return `${words.slice(0, midpoint).join(" ")}\n${words.slice(midpoint).join(" ")}`;
}

async function main() {
  const segments = JSON.parse(await readFile(segmentsPath, "utf8")) as Segment[];
  if (!Array.isArray(segments) || segments.length === 0) throw new Error("audio-segments.json is empty");

  let cursor = 0;
  const captions: string[] = [];
  const timing = segments.map((segment, index) => {
    const audioPath = path.join(root, "public", "audio", segment.audio);
    const duration = durationOf(audioPath);
    const start = cursor;
    const end = start + duration;
    captions.push(`${index + 1}\n${timestamp(start)} --> ${timestamp(end)}\n${wrap(segment.text)}\n`);
    cursor = end + trailSeconds;
    return { ...segment, start, end, duration, trailSeconds };
  });

  await writeFile(outputPath, captions.join("\n"), "utf8");
  await writeFile(
    manifestPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), totalDuration: cursor, segments: timing }, null, 2) + "\n",
    "utf8",
  );
  console.log(`Wrote ${outputPath}`);
  console.log(`Wrote ${manifestPath} (${timing.length} segments, ${cursor.toFixed(2)}s including trails)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
