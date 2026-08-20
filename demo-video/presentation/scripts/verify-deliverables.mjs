import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const presentation = path.resolve(here, "..");
const demoVideo = path.resolve(presentation, "..");
const repo = path.resolve(demoVideo, "..");
const video = path.join(demoVideo, "levelfield-demo-preview.mp4");

const normalize = (value) => value.replace(/\s+/g, " ").trim();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const script = (await fs.readFile(path.join(demoVideo, "script.md"), "utf8"))
  .split(/\n\s*---\s*\n/)
  .map(normalize)
  .filter(Boolean);
const segments = JSON.parse(
  await fs.readFile(path.join(presentation, "audio-segments.json"), "utf8"),
);
const timing = JSON.parse(
  await fs.readFile(path.join(demoVideo, "timing-manifest.json"), "utf8"),
);
const srt = (await fs.readFile(path.join(demoVideo, "levelfield-demo.en.srt"), "utf8"))
  .trim()
  .split(/\n\s*\n/)
  .map((block) => normalize(block.split("\n").slice(2).join(" ")));

assert(script.length === 21, `Expected 21 script beats, found ${script.length}`);
assert(segments.length === script.length, "audio-segments.json count does not match script.md");
assert(timing.segments.length === script.length, "timing-manifest.json count does not match script.md");
assert(srt.length === script.length, "SRT cue count does not match script.md");

for (let index = 0; index < script.length; index += 1) {
  const expected = script[index];
  assert(normalize(segments[index].text) === expected, `Narration mismatch at beat ${index + 1}`);
  assert(normalize(timing.segments[index].text) === expected, `Timing text mismatch at beat ${index + 1}`);
  assert(srt[index] === expected, `Subtitle mismatch at beat ${index + 1}`);
}

const media = JSON.parse(
  execFileSync(
    "ffprobe",
    [
      "-v", "error",
      "-show_entries", "format=duration:stream=codec_name,codec_type,width,height,r_frame_rate",
      "-of", "json",
      video,
    ],
    { encoding: "utf8" },
  ),
);
const duration = Number(media.format.duration);
const videoStream = media.streams.find((stream) => stream.codec_type === "video");
const audioStream = media.streams.find((stream) => stream.codec_type === "audio");
assert(duration >= 120 && duration < 180, `Video duration must be 2–3 minutes, found ${duration}s`);
assert(videoStream?.codec_name === "h264", `Expected H.264, found ${videoStream?.codec_name}`);
assert(videoStream?.width === 1920 && videoStream?.height === 1080, "Expected 1920×1080 video");
assert(videoStream?.r_frame_rate === "30/1", `Expected 30 fps, found ${videoStream?.r_frame_rate}`);
assert(audioStream?.codec_name === "aac", `Expected AAC, found ${audioStream?.codec_name}`);

const deck = path.join(repo, "demo-deck", "levelfield-hackathon-deck.pptx");
const deckStat = await fs.stat(deck);
assert(deckStat.size > 100_000, "Deck PPTX is missing or unexpectedly small");

console.log(
  `Verified 21 narration/subtitle beats · ${duration.toFixed(2)}s H.264/AAC 1080p30 · deck ${(deckStat.size / 1_048_576).toFixed(2)} MiB`,
);
