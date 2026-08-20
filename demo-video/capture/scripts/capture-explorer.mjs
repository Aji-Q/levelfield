#!/usr/bin/env node
// Captures the real Somnia Shannon explorer source-verification view as WebM.
// It uses a fresh Playwright context and a fixed ScoreRegistry address only.

import { createRequire } from "node:module";
import { access, mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

import { CAPTURE_COPY, EXPLORER_EXPECTATIONS } from "./lib/commands.mjs";
import { installVisibleCursor, moveVisibleCursor } from "./lib/cursor.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");
const captureRoot = path.resolve(here, "..");
const DEFAULT_OUTPUT_DIR = path.join(captureRoot, "runs");
const SOURCE_URL = "https://shannon-explorer.somnia.network/address/0xb8e11dea346f2c961880879606a269db3165bbc7";
const VIEWPORT = Object.freeze({ width: 1920, height: 1080 });
const EXPLORER_TIMEOUT_MS = 90_000;
const MINIMUM_SOURCE_SECONDS = 20;
const OUTPUT_FILE = "explorer-source.webm";

function usage() {
  return `Usage: node demo-video/capture/scripts/capture-explorer.mjs [--output-dir DIR] [--headed]

Records the fixed public ScoreRegistry explorer page in a new, clean browser
context. Assertions require the exact source-verification text, ScoreRegistry,
and the checksummed registry address. Recording copy: "${CAPTURE_COPY.sourceVerified}"`;
}

export function parseExplorerCaptureArgs(argv) {
  const config = {
    outputDir: DEFAULT_OUTPUT_DIR,
    headless: true,
    sourceUrl: SOURCE_URL,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help") return { ...config, help: true };
    if (arg === "--headed") {
      config.headless = false;
      continue;
    }
    if (arg === "--output-dir") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error("--output-dir requires a directory.");
      config.outputDir = path.resolve(value);
      index += 1;
      continue;
    }
    throw new Error(`Unknown option: ${arg}`);
  }
  return { ...config, outputDir: path.resolve(config.outputDir) };
}

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const candidates = [
    path.join(repoRoot, "demo-video", "capture", "node_modules", "playwright"),
    path.join(repoRoot, "demo-video", "presentation", "node_modules", "playwright"),
    "playwright",
  ];
  const failures = [];
  for (const candidate of candidates) {
    try {
      const module = require(candidate);
      const playwright = module?.chromium ? module : module?.default;
      if (!playwright?.chromium) throw new Error("does not export chromium");
      return playwright;
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }
  throw new Error(`Playwright is required for explorer capture: ${failures.join(" | ")}`);
}

async function executable(pathname) {
  try {
    await access(pathname, fsConstants.X_OK);
    return pathname;
  } catch {
    return null;
  }
}

async function cachedChromiumExecutable() {
  const cacheRoot = path.join(homedir(), "Library", "Caches", "ms-playwright");
  try {
    const entries = await readdir(cacheRoot, { withFileTypes: true });
    const folders = entries
      .filter((entry) => entry.isDirectory() && entry.name.startsWith("chromium-"))
      .map((entry) => entry.name)
      .sort()
      .reverse();
    for (const folder of folders) {
      const candidate = path.join(
        cacheRoot,
        folder,
        "chrome-mac-arm64",
        "Google Chrome for Testing.app",
        "Contents",
        "MacOS",
        "Google Chrome for Testing",
      );
      const available = await executable(candidate);
      if (available) return available;
    }
  } catch {
    // The normal bundled and Chrome-channel attempts remain available.
  }
  return null;
}

async function launchCleanBrowser(chromium, headless) {
  const common = { headless };
  const attempts = [];
  const cached = await cachedChromiumExecutable();
  if (cached) attempts.push({ label: "cached Chromium", options: { ...common, executablePath: cached } });
  attempts.push({ label: "bundled Chromium", options: common });
  attempts.push({ label: "Chrome channel", options: { ...common, channel: "chrome" } });

  const errors = [];
  for (const attempt of attempts) {
    try {
      return await chromium.launch(attempt.options);
    } catch (error) {
      errors.push(`${attempt.label}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw new Error(`No browser could launch for explorer capture. ${errors.join(" | ")}`);
}

async function durationSeconds(videoPath) {
  const output = await new Promise((resolve, reject) => {
    const child = spawn("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      videoPath,
    ], {
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += String(chunk); });
    child.stderr.on("data", (chunk) => { stderr += String(chunk); });
    child.once("error", reject);
    child.once("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe failed for explorer WebM: ${stderr.trim() || `exit ${code}`}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
  const seconds = Number(output);
  if (!Number.isFinite(seconds)) throw new Error("ffprobe did not return an explorer video duration.");
  return seconds;
}

async function bodyContainsExactEvidence(page) {
  return page.evaluate((required) => required.every((text) => document.body.innerText.includes(text)), EXPLORER_EXPECTATIONS.requiredText);
}

async function showActualExplorerEvidence(page) {
  const verified = page.getByText(EXPLORER_EXPECTATIONS.verifiedExactText, { exact: true });
  const registry = page.getByText("ScoreRegistry", { exact: true });
  const address = page.getByText("0xb8e11dea346F2c961880879606A269db3165BBc7", { exact: true });

  await registry.scrollIntoViewIfNeeded();
  await page.waitForTimeout(3_500);
  await verified.scrollIntoViewIfNeeded();
  await page.waitForTimeout(6_500);
  await address.scrollIntoViewIfNeeded();
  await page.waitForTimeout(4_000);

  // This scroll exposes only real Explorer source/navigation content; it adds no
  // labels or reconstructed text to the page.
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(3_000);
  await verified.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2_500);
}

async function openVerifiedContract(page, sourceUrl) {
  await page.goto(sourceUrl, { waitUntil: "domcontentloaded", timeout: EXPLORER_TIMEOUT_MS });
  const contractControl = page.getByText("Contract", { exact: true }).first();
  await contractControl.waitFor({ state: "visible", timeout: EXPLORER_TIMEOUT_MS });
  const box = await contractControl.boundingBox();
  if (!box) throw new Error("Explorer Contract control has no visible bounding box.");
  const cursor = { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2) };
  await page.mouse.move(cursor.x, cursor.y, { steps: 14 });
  await moveVisibleCursor(page, { ...cursor, click: true });
  await page.waitForTimeout(450);
  await contractControl.click();
  await page.getByText(EXPLORER_EXPECTATIONS.verifiedExactText, { exact: true })
    .waitFor({ state: "visible", timeout: EXPLORER_TIMEOUT_MS });
  await page.getByText("ScoreRegistry", { exact: true })
    .waitFor({ state: "visible", timeout: EXPLORER_TIMEOUT_MS });
  await page.getByText("0xb8e11dea346F2c961880879606A269db3165BBc7", { exact: true })
    .waitFor({ state: "visible", timeout: EXPLORER_TIMEOUT_MS });

  if (!await bodyContainsExactEvidence(page)) {
    throw new Error("Explorer did not render the exact ScoreRegistry source-verification evidence.");
  }
}

export async function captureExplorer(config = parseExplorerCaptureArgs(process.argv.slice(2))) {
  if (config.help) return { usage: usage() };

  await mkdir(config.outputDir, { recursive: true });
  const rawVideoDirectory = path.join(config.outputDir, ".explorer-source-raw");
  const destination = path.join(config.outputDir, OUTPUT_FILE);
  await rm(rawVideoDirectory, { recursive: true, force: true });
  await rm(destination, { force: true });
  await mkdir(rawVideoDirectory, { recursive: true });

  let browser;
  let context;
  let video;
  try {
    const playwright = loadPlaywright();
    browser = await launchCleanBrowser(playwright.chromium, config.headless);
    context = await browser.newContext({
      viewport: VIEWPORT,
      screen: VIEWPORT,
      recordVideo: { dir: rawVideoDirectory, size: VIEWPORT },
      colorScheme: "light",
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    await installVisibleCursor(page);
    video = page.video();
    const recordStartedAt = Date.now();

    await openVerifiedContract(page, config.sourceUrl);
    await showActualExplorerEvidence(page);

    const remainingMs = Math.max(0, MINIMUM_SOURCE_SECONDS * 1_000 + 300 - (Date.now() - recordStartedAt));
    if (remainingMs > 0) await page.waitForTimeout(remainingMs);

    await context.close();
    context = null;
    const rawVideo = await video.path();
    await rename(rawVideo, destination);
    const duration = await durationSeconds(destination);
    if (duration < MINIMUM_SOURCE_SECONDS) {
      throw new Error(`Explorer source capture is ${duration.toFixed(2)}s; minimum is ${MINIMUM_SOURCE_SECONDS}s.`);
    }
    await writeFile(path.join(config.outputDir, "explorer-source.actions.json"), `${JSON.stringify({
      schemaVersion: 1,
      status: "recorded",
      sourceUrl: config.sourceUrl,
      capturedAt: new Date().toISOString(),
      actions: [
        { id: "explorer.open-registry", type: "navigate", target: "fixed ScoreRegistry address" },
        { id: "explorer.click-contract-tab", type: "click", target: "Contract" },
        { id: "explorer.assert-source-verified", type: "assert", target: EXPLORER_EXPECTATIONS.verifiedExactText },
        { id: "explorer.assert-registry", type: "assert", target: "ScoreRegistry" },
      ],
      truthLabel: "Source verified; current score provenance remains separately gated.",
    }, null, 2)}\n`);
    return {
      outputFile: OUTPUT_FILE,
      durationSeconds: duration,
      sourceVerified: CAPTURE_COPY.sourceVerified,
      requiredText: EXPLORER_EXPECTATIONS.requiredText,
    };
  } finally {
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    await rm(rawVideoDirectory, { recursive: true, force: true });
  }
}

async function main() {
  const config = parseExplorerCaptureArgs(process.argv.slice(2));
  if (config.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  const result = await captureExplorer(config);
  process.stdout.write(`Captured explorer source: ${result.outputFile} (${result.durationSeconds.toFixed(2)}s). ${result.sourceVerified}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`Explorer capture failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
