import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const captureRoot = path.resolve(here, "..");

function duration(file) {
  return Number(execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file],
    { encoding: "utf8" },
  ).trim());
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith("--")) continue;
    args[argv[index].slice(2)] = argv[index + 1] && !argv[index + 1].startsWith("--") ? argv[++index] : true;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.run) throw new Error("Usage: node scripts/contact-sheet.mjs --run runs/RUN_ID [--video ../levelfield-demo-preview.mp4]");
  const run = path.resolve(captureRoot, args.run);
  const video = path.resolve(captureRoot, args.video ?? "../levelfield-demo-preview.mp4");
  const qaDir = path.join(run, "qa");
  await fs.mkdir(qaDir, { recursive: true });
  const output = path.join(qaDir, "contact-sheet.jpg");
  const seconds = duration(video);
  if (!Number.isFinite(seconds) || seconds <= 0) throw new Error("Video has no readable duration");
  const rate = 21 / seconds;
  execFileSync("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error", "-i", video,
    "-vf", `fps=${rate.toFixed(9)},scale=480:270:flags=lanczos,tile=7x3:padding=4:margin=4:color=0x080807`,
    "-frames:v", "1", "-q:v", "2", output,
  ], { stdio: "inherit" });
  console.log(`Wrote ${path.relative(captureRoot, output)} · 21 samples across ${seconds.toFixed(2)}s`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
