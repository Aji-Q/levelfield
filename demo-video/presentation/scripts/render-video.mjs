import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const demoDir = path.resolve(root, "..");
const workDir = path.join(demoDir, ".render-work");
const frameDir = path.join(workDir, "frames");
const segmentsPath = path.join(root, "audio-segments.json");
const masterAudio = path.join(workDir, "narration-master.wav");
const frameList = path.join(workDir, "frames.ffconcat");
const output = path.resolve(process.env.VIDEO_OUTPUT || path.join(demoDir, "levelfield-demo-preview.mp4"));
const port = Number(process.env.PRESENTATION_PORT || 4180);
const trailSeconds = 0.2;

function run(command, args, options = {}) {
  execFileSync(command, args, { stdio: "inherit", ...options });
}

function probe(file) {
  const value = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file],
    { encoding: "utf8" },
  ).trim();
  const duration = Number(value);
  if (!Number.isFinite(duration) || duration <= 0) throw new Error(`Invalid duration for ${file}: ${value}`);
  return duration;
}

async function chromiumExecutable() {
  if (process.env.CHROMIUM_EXECUTABLE) return process.env.CHROMIUM_EXECUTABLE;
  const cache = path.join(os.homedir(), "Library", "Caches", "ms-playwright");
  const entries = (await fs.readdir(cache, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("chromium-"))
    .map((entry) => entry.name)
    .sort()
    .reverse();
  for (const entry of entries) {
    const candidate = path.join(cache, entry, "chrome-mac-arm64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing");
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try the next cached browser.
    }
  }
  return undefined;
}

async function waitForServer(url, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Presentation server did not become ready at ${url}`);
}

async function buildMasterAudio(segments) {
  const inputs = [];
  const filters = [];
  const labels = [];
  let total = 0;

  segments.forEach((segment, index) => {
    const audioPath = path.join(root, "public", "audio", segment.audio);
    inputs.push("-i", audioPath);
    total += probe(audioPath) + trailSeconds;
    filters.push(
      `[${index}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,apad=pad_dur=${trailSeconds}[s${index}]`,
    );
    labels.push(`[s${index}]`);
  });

  filters.push(`${labels.join("")}concat=n=${segments.length}:v=0:a=1,loudnorm=I=-16:TP=-1:LRA=11[aout]`);
  run("ffmpeg", [
    "-y", "-loglevel", "error",
    ...inputs,
    "-filter_complex", filters.join(";"),
    "-map", "[aout]",
    "-ar", "48000",
    "-ac", "2",
    "-c:a", "pcm_s16le",
    masterAudio,
  ]);
  return total;
}

async function main() {
  const segments = JSON.parse(await fs.readFile(segmentsPath, "utf8"));
  if (!Array.isArray(segments) || segments.length === 0) throw new Error("Run `npm run extract-narrations` first");

  await fs.rm(workDir, { recursive: true, force: true });
  await fs.mkdir(frameDir, { recursive: true });
  await buildMasterAudio(segments);

  const url = `http://127.0.0.1:${port}/?auto=1&render=1`;
  const server = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, BROWSER: "none" },
  });
  let serverOutput = "";
  server.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
  server.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

  let browser;
  try {
    await waitForServer(url);
    const executablePath = await chromiumExecutable();
    browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.removeItem("levelfield-demo-cursor-v1"));
    await page.reload({ waitUntil: "networkidle" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => img.complete ? Promise.resolve() : new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      })));
    });
    await page.locator(".render-calibration").waitFor({ state: "visible" });
    await page.evaluate(() => window.dispatchEvent(new Event("levelfield-render-start")));
    await page.locator(".render-calibration").waitFor({ state: "detached" });

    // Capture one browser-rendered key frame per narration beat. Playwright
    // fast-forwards finite CSS animations for the screenshot, which keeps the
    // film deterministic across headless audio sinks, machine sleep, and CI.
    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      const state = await page.locator(".scene").evaluate((node) => ({
        chapter: node.getAttribute("data-chapter"),
        step: node.getAttribute("data-step"),
      }));
      const expected = { chapter: segment.chapter, step: String(segment.step - 1) };
      if (state.chapter !== expected.chapter || state.step !== expected.step) {
        throw new Error(`Frame ${index + 1} is ${JSON.stringify(state)}, expected ${JSON.stringify(expected)}`);
      }
      await page.evaluate(async () => {
        await Promise.all([...document.images].map((img) => img.complete ? Promise.resolve() : new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        })));
      });
      await page.waitForTimeout(50);
      await page.screenshot({
        path: path.join(frameDir, `${String(index + 1).padStart(2, "0")}.png`),
        animations: "disabled",
      });
      if (index < segments.length - 1) {
        const nextSegment = segments[index + 1];
        await page.keyboard.press("ArrowRight");
        await page.waitForFunction(
          ([chapter, step]) => {
            const scene = document.querySelector(".scene");
            return scene?.getAttribute("data-chapter") === chapter &&
              scene?.getAttribute("data-step") === step;
          },
          [nextSegment.chapter, String(nextSegment.step - 1)],
        );
      }
    }
    if (consoleErrors.length) throw new Error(`Browser console errors: ${consoleErrors.join(" | ")}`);

    await context.close();
    await browser.close();
    browser = undefined;

    const audioDuration = probe(masterAudio);
    const concatLines = ["ffconcat version 1.0"];
    segments.forEach((segment, index) => {
      const framePath = path.join(frameDir, `${String(index + 1).padStart(2, "0")}.png`);
      const audioPath = path.join(root, "public", "audio", segment.audio);
      concatLines.push(`file '${framePath}'`);
      concatLines.push(`duration ${(probe(audioPath) + trailSeconds).toFixed(6)}`);
    });
    concatLines.push(`file '${path.join(frameDir, `${String(segments.length).padStart(2, "0")}.png`)}'`);
    await fs.writeFile(frameList, `${concatLines.join("\n")}\n`);

    run("ffmpeg", [
      "-y", "-loglevel", "error",
      "-f", "concat",
      "-safe", "0",
      "-i", frameList,
      "-i", masterAudio,
      "-map", "0:v:0",
      "-map", "1:a:0",
      "-vf", "scale=1920:1080:flags=lanczos,fps=30,format=yuv420p",
      "-c:v", "libx264",
      "-preset", "medium",
      "-crf", "18",
      "-c:a", "aac",
      "-b:a", "192k",
      "-movflags", "+faststart",
      "-t", audioDuration.toFixed(3),
      output,
    ]);
    console.log(`Wrote ${output}`);
    console.log(`Duration ${probe(output).toFixed(2)}s · 1920×1080 · narration normalized to -16 LUFS`);
    console.log(`${segments.length} browser-rendered scenes aligned to ffprobe audio durations`);
  } finally {
    if (browser) await browser.close().catch(() => {});
    server.kill("SIGTERM");
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (server.exitCode == null) server.kill("SIGKILL");
    if (serverOutput && process.env.DEBUG_PRESENTATION_SERVER) process.stderr.write(serverOutput);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
