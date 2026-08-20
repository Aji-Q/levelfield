import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { analyzeTimeline, validateEditManifest } from "./compose.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const captureRoot = path.resolve(here, "..");

function frameRate(value) {
  const [numerator, denominator = "1"] = String(value).split("/").map(Number);
  return numerator / denominator;
}

export function validateMediaProbe(probe) {
  const video = probe?.streams?.find((stream) => stream.codec_type === "video");
  const audio = probe?.streams?.find((stream) => stream.codec_type === "audio");
  const duration = Number(probe?.format?.duration);
  if (!video || video.codec_name !== "h264") throw new Error("Final video must contain H.264 video");
  if (video.width !== 1920 || video.height !== 1080) throw new Error("Final video must be 1920×1080");
  if (Math.abs(frameRate(video.avg_frame_rate ?? video.r_frame_rate) - 30) > 0.02) {
    throw new Error("Final video must be 30 fps");
  }
  if (video.pix_fmt !== "yuv420p") throw new Error("Final video must use yuv420p");
  if (!audio || audio.codec_name !== "aac") throw new Error("Final video must contain AAC audio");
  if (Number(audio.sample_rate) !== 48_000 || audio.channels !== 2) throw new Error("Final audio must be 48 kHz stereo");
  if (!Number.isFinite(duration) || duration < 120 || duration > 180) {
    throw new Error("Final duration must be between 120 and 180 seconds");
  }
  return { duration, video, audio };
}

export function validateNoBlankFrameRuns(samples, maximumConsecutive = 2) {
  let consecutive = 0;
  let maximum = 0;
  let runStart = null;
  let maximumStart = null;
  for (const sample of samples) {
    const blank = sample.yMin >= 230 || sample.yMax <= 25;
    if (blank) {
      if (consecutive === 0) runStart = sample.time;
      consecutive += 1;
      if (consecutive > maximum) {
        maximum = consecutive;
        maximumStart = runStart;
      }
    } else {
      consecutive = 0;
      runStart = null;
    }
  }
  if (maximum >= maximumConsecutive) {
    throw new Error(
      `Visible blank-frame run starts near ${Number(maximumStart ?? 0).toFixed(2)}s ` +
      `(${maximum} consecutive 10 fps samples)`,
    );
  }
  return { maximumConsecutive: maximum, maximumSeconds: maximum / 10 };
}

function srtSeconds(timestamp) {
  const match = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/.exec(timestamp.trim());
  if (!match) throw new Error(`Invalid SRT timestamp ${timestamp}`);
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) + Number(match[4]) / 1000;
}

export function parseSrt(text) {
  const blocks = text.trim().split(/\r?\n\r?\n+/);
  let previousEnd = -1;
  return blocks.map((block, index) => {
    const lines = block.split(/\r?\n/);
    const timing = lines[1]?.match(/^(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})$/);
    if (Number(lines[0]) !== index + 1 || !timing || !lines.slice(2).join(" ").trim()) {
      throw new Error(`Invalid SRT cue ${index + 1}`);
    }
    const cue = { index: index + 1, start: srtSeconds(timing[1]), end: srtSeconds(timing[2]), text: lines.slice(2).join("\n") };
    if (cue.end <= cue.start || cue.start < previousEnd - 0.001) throw new Error(`SRT cue ${index + 1} overlaps or has invalid duration`);
    previousEnd = cue.end;
    return cue;
  });
}

export function validateRequiredActions(timeline, actions) {
  const present = new Set(actions.map((action) => action.id));
  for (const clip of timeline) {
    for (const id of clip.requiredActions) {
      if (!present.has(id)) throw new Error(`Required action ${id} for ${clip.id} is absent from the real capture log`);
    }
  }
  return true;
}

export function validateTruthFacts(facts) {
  if (facts?.dreamdex?.presentation !== "timestamped_snapshot" || !/^\d{4}-\d{2}-\d{2}T/.test(facts?.dreamdex?.generatedAt ?? "")) {
    throw new Error("DreamDEX footage must be labeled as a timestamped snapshot with generatedAt");
  }
  if (facts?.comparison?.score3Source !== "dreamdex_snapshot" || facts?.comparison?.score95Source !== "curated_reference" || facts?.comparison?.sameVenue !== false) {
    throw new Error("The 3 and 95 examples must retain distinct DreamDEX snapshot and curated reference sources");
  }
  if (facts?.mcp?.role !== "pre_action_policy" || facts?.mcp?.orderSubmitted !== false) {
    throw new Error("MCP footage must be a pre-action policy with no order submitted");
  }
  if (facts?.provenance?.state === "legacy" && facts?.provenance?.narrationMode !== "future_tense") {
    throw new Error("Legacy provenance may only be narrated in future tense, never as complete");
  }
  if (facts?.provenance?.state === "complete") {
    if (!facts.provenance.currentUriComplete || !/^[0-9a-f]{40}$/i.test(facts.provenance.immutableGitSha ?? "")) {
      throw new Error("Complete provenance requires current immutable-SHA URIs");
    }
    if (facts.provenance.verifyOnchainPassed !== true) throw new Error("Complete provenance requires fail-closed read-back success");
  }
  return true;
}

async function walkJson(dir) {
  const found = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name === "edit-work") continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...await walkJson(file));
    else if (/^(actions|action-log).*\.json$/i.test(entry.name)) found.push(file);
  }
  return found;
}

export async function readActions(runDir) {
  const normalizedFile = path.join(runDir, "actions.json");
  try {
    const parsed = JSON.parse(await fs.readFile(normalizedFile, "utf8"));
    const actions = Array.isArray(parsed) ? parsed : parsed.actions;
    if (!Array.isArray(actions)) throw new Error("Prepared actions.json has no actions array");
    return { files: [normalizedFile], actions };
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const files = await walkJson(runDir);
  const actions = [];
  for (const file of files) {
    const parsed = JSON.parse(await fs.readFile(file, "utf8"));
    if (Array.isArray(parsed)) actions.push(...parsed);
    else if (Array.isArray(parsed.actions)) actions.push(...parsed.actions);
  }
  return { files, actions };
}

function probe(file) {
  return JSON.parse(execFileSync(
    "ffprobe",
    ["-v", "error", "-show_streams", "-show_format", "-of", "json", file],
    { encoding: "utf8" },
  ));
}

function measureLoudness(file) {
  const process = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-nostats", "-i", file, "-map", "0:a:0", "-af", "loudnorm=I=-16:TP=-1:LRA=11:print_format=json", "-f", "null", "-"],
    { encoding: "utf8" },
  );
  const output = `${process.stdout ?? ""}\n${process.stderr ?? ""}`;
  const blocks = [...output.matchAll(/\{[\s\S]*?"input_i"[\s\S]*?\}/g)];
  if (!blocks.length) throw new Error("Could not parse loudness analysis");
  const parsed = JSON.parse(blocks.at(-1)[0]);
  const integrated = Number(parsed.input_i);
  const truePeak = Number(parsed.input_tp);
  if (integrated < -17.5 || integrated > -14.5) throw new Error(`Integrated loudness ${integrated} LUFS is outside preview target`);
  if (truePeak > -0.5) throw new Error(`True peak ${truePeak} dBTP is too high`);
  return { integratedLufs: integrated, truePeakDbtp: truePeak, loudnessRange: Number(parsed.input_lra) };
}

function measureBlankFrames(file) {
  const process = spawnSync(
    "ffmpeg",
    [
      "-hide_banner", "-loglevel", "error", "-i", file,
      "-vf", "fps=10,signalstats,metadata=print:file=-", "-an", "-f", "null", "-",
    ],
    { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
  );
  if (process.status !== 0) {
    throw new Error(`Blank-frame analysis failed: ${(process.stderr ?? "").trim() || `exit ${process.status}`}`);
  }
  const samples = [];
  let current = null;
  for (const line of String(process.stdout ?? "").split(/\r?\n/)) {
    if (line.startsWith("frame:")) {
      if (current && Number.isFinite(current.time) && Number.isFinite(current.yMin) && Number.isFinite(current.yMax)) {
        samples.push(current);
      }
      const time = line.match(/pts_time:([\d.]+)/)?.[1];
      current = { time: Number(time), yMin: Number.NaN, yMax: Number.NaN };
    } else if (current && line.startsWith("lavfi.signalstats.YMIN=")) {
      current.yMin = Number(line.slice(line.indexOf("=") + 1));
    } else if (current && line.startsWith("lavfi.signalstats.YMAX=")) {
      current.yMax = Number(line.slice(line.indexOf("=") + 1));
    }
  }
  if (current && Number.isFinite(current.time) && Number.isFinite(current.yMin) && Number.isFinite(current.yMax)) {
    samples.push(current);
  }
  if (!samples.length) throw new Error("Blank-frame analysis returned no video samples");
  return { samples: samples.length, ...validateNoBlankFrameRuns(samples) };
}

async function sha256(file) {
  const hash = createHash("sha256");
  hash.update(await fs.readFile(file));
  return hash.digest("hex");
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith("--")) continue;
    const key = argv[index].slice(2);
    args[key] = argv[index + 1] && !argv[index + 1].startsWith("--") ? argv[++index] : true;
  }
  return args;
}

export async function verifyFinal({ runDir, manifestPath, videoPath, srtPath }) {
  const run = path.resolve(captureRoot, runDir);
  const manifestFile = path.resolve(captureRoot, manifestPath ?? "edit-manifest.json");
  const video = path.resolve(captureRoot, videoPath ?? "../levelfield-demo-preview.mp4");
  const srt = path.resolve(captureRoot, srtPath ?? "../levelfield-demo.en.srt");
  const manifest = JSON.parse(await fs.readFile(manifestFile, "utf8"));
  const timeline = validateEditManifest(manifest);
  const media = validateMediaProbe(probe(video));
  if (Math.abs(media.duration - manifest.targetDuration) > 0.15) throw new Error("Encoded duration drift exceeds 150 ms");

  const cues = parseSrt(await fs.readFile(srt, "utf8"));
  if (cues.length !== 21) throw new Error(`Expected 21 English subtitle cues; got ${cues.length}`);
  if (cues.at(-1).end > media.duration + 0.05) throw new Error("Final subtitle exceeds the encoded video duration");

  const factsFile = path.join(run, "facts.json");
  const facts = JSON.parse(await fs.readFile(factsFile, "utf8"));
  validateTruthFacts(facts);
  const actionLog = await readActions(run);
  validateRequiredActions(manifest.timeline, actionLog.actions);
  const loudness = measureLoudness(video);
  const blankFrames = measureBlankFrames(video);

  const editResult = JSON.parse(await fs.readFile(path.join(run, "edit-result.json"), "utf8"));
  const videoHash = await sha256(video);
  if (editResult.outputSha256 !== videoHash) throw new Error("Final video SHA-256 no longer matches edit-result.json");

  const result = {
    verifiedAt: new Date().toISOString(),
    passed: true,
    media: {
      duration: media.duration,
      codec: media.video.codec_name,
      resolution: `${media.video.width}x${media.video.height}`,
      frameRate: frameRate(media.video.avg_frame_rate),
      pixelFormat: media.video.pix_fmt,
      audioCodec: media.audio.codec_name,
      sampleRate: Number(media.audio.sample_rate),
      channels: media.audio.channels,
      ...loudness,
      blankFrameSamples: blankFrames.samples,
      maximumBlankRunSeconds: blankFrames.maximumSeconds,
    },
    timeline,
    subtitles: { cues: cues.length, finalEnd: cues.at(-1).end },
    actions: { count: actionLog.actions.length, files: actionLog.files.map((file) => path.relative(run, file)) },
    truth: facts,
    sha256: videoHash,
  };
  await fs.writeFile(path.join(run, "verify-result.json"), `${JSON.stringify(result, null, 2)}\n`);
  await fs.writeFile(path.join(captureRoot, "evidence-manifest.json"), `${JSON.stringify({
    schemaVersion: 1,
    acceptedAt: result.verifiedAt,
    runId: path.basename(run),
    video: {
      path: path.relative(path.resolve(captureRoot, ".."), video),
      sha256: videoHash,
      ...result.media,
    },
    subtitles: {
      path: path.relative(path.resolve(captureRoot, ".."), srt),
      sha256: await sha256(srt),
      ...result.subtitles,
    },
    timeline: result.timeline,
    facts,
    sourceClips: editResult.sourceClips,
    actionLog: {
      count: actionLog.actions.length,
      sha256: createHash("sha256").update(JSON.stringify(actionLog.actions)).digest("hex"),
      requiredIds: manifest.timeline.flatMap((clip) => clip.requiredActions),
    },
  }, null, 2)}\n`);
  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.run) throw new Error("Usage: node scripts/verify-final.mjs --run runs/RUN_ID [--video ../levelfield-demo-preview.mp4]");
  const result = await verifyFinal({ runDir: args.run, manifestPath: args.manifest, videoPath: args.video, srtPath: args.srt });
  console.log(`PASS · ${result.media.duration.toFixed(2)}s · ${result.media.resolution}/${result.media.frameRate}fps · ${result.media.integratedLufs} LUFS`);
  console.log(`Authentic capture ${(result.timeline.authenticCoverage * 100).toFixed(1)}% · ${result.actions.count} logged real actions`);
  console.log(`SHA-256 ${result.sha256}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
