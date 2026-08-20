import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const captureRoot = path.resolve(here, "..");
const authenticKinds = new Set(["browser", "terminal", "explorer", "title-overlay"]);
const titleKinds = new Set(["title-overlay", "transition", "motion-graphic"]);
const allowedKinds = new Set([...authenticKinds, "transition", "motion-graphic"]);
const videoExtensions = new Set([".webm", ".mov", ".mp4", ".mkv"]);

function finitePositive(value) {
  return Number.isFinite(value) && value > 0;
}

export function analyzeTimeline(manifest) {
  const totalDuration = manifest.timeline.reduce((sum, clip) => sum + clip.outputDuration, 0);
  const authenticDuration = manifest.timeline
    .filter((clip) => authenticKinds.has(clip.kind))
    .reduce((sum, clip) => sum + clip.outputDuration, 0);
  const titleTransitionDuration = manifest.timeline
    .filter((clip) => titleKinds.has(clip.kind))
    .reduce((sum, clip) => sum + clip.outputDuration, 0);
  return {
    totalDuration,
    authenticDuration,
    authenticCoverage: totalDuration > 0 ? authenticDuration / totalDuration : 0,
    titleTransitionDuration,
  };
}

export function validateEditManifest(manifest) {
  if (!manifest || manifest.version !== 1 || !Array.isArray(manifest.timeline) || !manifest.timeline.length) {
    throw new Error("Edit manifest must be version 1 with a non-empty timeline");
  }
  if (!finitePositive(manifest.targetDuration) || manifest.targetDuration < 120 || manifest.targetDuration > 180) {
    throw new Error("Target duration must be between 120 and 180 seconds");
  }
  if (!manifest.audio?.segments || !manifest.audio?.root || !finitePositive(manifest.audio?.trailSeconds)) {
    throw new Error("Edit manifest requires audio segments, root, and positive trailSeconds");
  }

  const ids = new Set();
  for (const clip of manifest.timeline) {
    if (!clip.id || ids.has(clip.id)) throw new Error(`Missing or duplicate clip id: ${clip.id ?? "<empty>"}`);
    ids.add(clip.id);
    if (!allowedKinds.has(clip.kind)) throw new Error(`Unsupported clip kind for ${clip.id}: ${clip.kind}`);
    const normalizedSource = String(clip.source ?? "").replaceAll("\\", "/");
    if (!videoExtensions.has(path.extname(normalizedSource).toLowerCase())) {
      throw new Error(`${clip.id} must use a recorded video source, not ${clip.source}`);
    }
    if (/(^|\/)presentation(\/|$)/i.test(normalizedSource)) {
      throw new Error(`${clip.id} may not use the storyboard presentation renderer`);
    }
    if (!Number.isFinite(clip.sourceIn) || clip.sourceIn < 0 || !finitePositive(clip.sourceOut) || clip.sourceOut <= clip.sourceIn) {
      throw new Error(`${clip.id} has invalid source in/out points`);
    }
    if (!finitePositive(clip.outputDuration)) throw new Error(`${clip.id} has invalid outputDuration`);
    if (!Array.isArray(clip.requiredActions) || !clip.requiredActions.length) {
      throw new Error(`${clip.id} must declare requiredActions`);
    }
    if (!Array.isArray(clip.factIds) || !clip.factIds.length) {
      throw new Error(`${clip.id} must declare factIds`);
    }
    buildClipFilter(clip);
  }

  const analysis = analyzeTimeline(manifest);
  if (Math.abs(analysis.totalDuration - manifest.targetDuration) > 0.05) {
    throw new Error(`Timeline is ${analysis.totalDuration.toFixed(3)}s, expected ${manifest.targetDuration.toFixed(3)}s`);
  }
  if (analysis.authenticCoverage < 0.85) {
    throw new Error(`Authentic recorded coverage must be at least 85%; got ${(analysis.authenticCoverage * 100).toFixed(1)}%`);
  }
  if (analysis.titleTransitionDuration > 10) {
    throw new Error(`Title and transition time must not exceed 10 seconds; got ${analysis.titleTransitionDuration.toFixed(2)}s`);
  }
  return analysis;
}

export function buildClipFilter(clip) {
  const sourceDuration = clip.sourceOut - clip.sourceIn;
  const factor = clip.outputDuration / sourceDuration;
  if (factor < 0.75 || factor > 1.35) {
    throw new Error(`${clip.id ?? "clip"} retiming factor ${factor.toFixed(3)} is outside 0.75–1.35`);
  }
  return [
    `trim=start=${clip.sourceIn}:end=${clip.sourceOut}`,
    "setpts=PTS-STARTPTS",
    `setpts=${factor.toFixed(9)}*PTS`,
    "scale=1920:1080:force_original_aspect_ratio=decrease:flags=lanczos",
    "pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x080807",
    "fps=25,scale=in_range=tv:out_range=tv,format=yuv420p",
    "setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709",
    "format=yuv420p",
    "settb=1/90000",
  ].join(",");
}

function run(command, args, options = {}) {
  execFileSync(command, args, { stdio: "inherit", ...options });
}

function probeDuration(file) {
  const value = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file],
    { encoding: "utf8" },
  ).trim();
  const duration = Number(value);
  if (!finitePositive(duration)) throw new Error(`Could not read a positive duration from ${file}`);
  return duration;
}

async function sha256(file) {
  const hash = createHash("sha256");
  hash.update(await fs.readFile(file));
  return hash.digest("hex");
}

function ffconcatPath(file) {
  return String(file).replaceAll("'", "'\\''");
}

async function buildNarration(manifest, workDir) {
  const segmentsPath = path.resolve(captureRoot, manifest.audio.segments);
  const audioRoot = path.resolve(captureRoot, manifest.audio.root);
  const segments = JSON.parse(await fs.readFile(segmentsPath, "utf8"));
  if (!Array.isArray(segments) || !segments.length) throw new Error("Narration segment list is empty");

  const inputs = [];
  const filters = [];
  const labels = [];
  for (const [index, segment] of segments.entries()) {
    const audioFile = path.resolve(audioRoot, segment.audio);
    await fs.access(audioFile);
    inputs.push("-i", audioFile);
    filters.push(
      `[${index}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,` +
      `apad=pad_dur=${manifest.audio.trailSeconds}[s${index}]`,
    );
    labels.push(`[s${index}]`);
  }
  filters.push(`${labels.join("")}concat=n=${segments.length}:v=0:a=1,loudnorm=I=-16:TP=-1:LRA=11[aout]`);
  const output = path.join(workDir, "narration.wav");
  run("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error",
    ...inputs,
    "-filter_complex", filters.join(";"),
    "-map", "[aout]", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", output,
  ]);
  return { output, duration: probeDuration(output), segments };
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith("--")) continue;
    const key = argv[index].slice(2);
    const next = argv[index + 1];
    args[key] = next && !next.startsWith("--") ? argv[++index] : true;
  }
  return args;
}

export async function compose({ manifestPath, runDir, outputPath }) {
  const manifestFile = path.resolve(captureRoot, manifestPath ?? "edit-manifest.json");
  const runPath = path.resolve(captureRoot, runDir);
  const output = path.resolve(captureRoot, outputPath ?? "../levelfield-demo-preview.mp4");
  const manifest = JSON.parse(await fs.readFile(manifestFile, "utf8"));
  const analysis = validateEditManifest(manifest);

  const workDir = path.join(runPath, "edit-work");
  await fs.rm(workDir, { recursive: true, force: true });
  await fs.mkdir(path.join(workDir, "normalized"), { recursive: true });

  const normalized = [];
  for (const [index, clip] of manifest.timeline.entries()) {
    const input = path.resolve(runPath, clip.source);
    await fs.access(input);
    const available = probeDuration(input);
    if (clip.sourceOut > available + 0.08) {
      throw new Error(`${clip.id} requests ${clip.sourceOut}s but source is ${available.toFixed(3)}s`);
    }
    const segment = path.join(workDir, "normalized", `${String(index + 1).padStart(2, "0")}-${clip.id}.mp4`);
    run("ffmpeg", [
      "-y", "-hide_banner", "-loglevel", "error", "-i", input,
      "-an", "-vf", buildClipFilter(clip),
      "-t", clip.outputDuration.toFixed(6),
      "-r", "25", "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-maxrate", "20M", "-bufsize", "40M",
      "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
      "-g", "60", "-keyint_min", "60", "-sc_threshold", "0", "-pix_fmt", "yuv420p",
      segment,
    ]);
    normalized.push(segment);
  }

  const concatFile = path.join(workDir, "timeline.ffconcat");
  await fs.writeFile(
    concatFile,
    `ffconcat version 1.0\n${normalized.map((file) => `file '${ffconcatPath(file)}'`).join("\n")}\n`,
  );
  const picture = path.join(workDir, "picture.mp4");
  run("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", concatFile,
    "-an", "-c:v", "copy", picture,
  ]);

  const narration = await buildNarration(manifest, workDir);
  if (Math.abs(narration.duration - manifest.targetDuration) > 0.15) {
    throw new Error(`Narration is ${narration.duration.toFixed(3)}s, edit target is ${manifest.targetDuration.toFixed(3)}s`);
  }
  await fs.mkdir(path.dirname(output), { recursive: true });
  run("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error", "-i", picture, "-i", narration.output,
    "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
    "-ar", "48000", "-ac", "2", "-movflags", "+faststart", "-t", manifest.targetDuration.toFixed(6), output,
  ]);

  const result = {
    generatedAt: new Date().toISOString(),
    runDir: path.relative(captureRoot, runPath),
    manifest: path.relative(captureRoot, manifestFile),
    output: path.relative(captureRoot, output),
    duration: probeDuration(output),
    authenticCoverage: analysis.authenticCoverage,
    titleTransitionDuration: analysis.titleTransitionDuration,
    outputSha256: await sha256(output),
    sourceClips: await Promise.all(manifest.timeline.map(async (clip) => ({
      id: clip.id,
      kind: clip.kind,
      source: clip.source,
      sha256: await sha256(path.resolve(runPath, clip.source)),
      requiredActions: clip.requiredActions,
      factIds: clip.factIds,
    }))),
  };
  await fs.writeFile(path.join(runPath, "edit-result.json"), `${JSON.stringify(result, null, 2)}\n`);
  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.run) throw new Error("Usage: node scripts/compose.mjs --run runs/RUN_ID [--manifest edit-manifest.json] [--output ../levelfield-demo-preview.mp4]");
  const result = await compose({ manifestPath: args.manifest, runDir: args.run, outputPath: args.output });
  console.log(`Wrote ${result.output}`);
  console.log(`Duration ${result.duration.toFixed(2)}s · authentic capture ${(result.authenticCoverage * 100).toFixed(1)}%`);
  console.log(`SHA-256 ${result.outputSha256}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
