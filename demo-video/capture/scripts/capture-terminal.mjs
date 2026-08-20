#!/usr/bin/env node
// Captures a real localhost-only LevelField terminal session as WebM.
// Usage: node demo-video/capture/scripts/capture-terminal.mjs <mcp-policy|evidence>

import { createRequire } from "node:module";
import { access, mkdir, readdir, rename, rm } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

import { getCaptureAlias } from "./lib/commands.mjs";
import { createTerminalStageServer } from "./terminal-stage-server.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");
const captureRoot = path.resolve(here, "..");
const DEFAULT_OUTPUT_DIR = path.join(captureRoot, "runs");
const VIEWPORT = Object.freeze({ width: 1920, height: 1080 });
const TYPE_DELAY_MS = 52;
const TERMINAL_TIMEOUT_MS = 240_000;

function usage() {
  return `Usage: node demo-video/capture/scripts/capture-terminal.mjs <mcp-policy|evidence> [--output-dir DIR] [--headed]

Aliases:
  mcp-policy  Record real \`npm run demo:agent\` stdout; output mcp-policy.webm.
  evidence    Record the fixed validation/test/Forge/SDK sequence; output evidence-cli.webm.

The stage listens on 127.0.0.1 only. No command string, shell, secrets, or
filesystem path is accepted by the recording page.`;
}

export function parseTerminalCaptureArgs(argv) {
  const config = {
    alias: "mcp-policy",
    outputDir: DEFAULT_OUTPUT_DIR,
    headless: true,
  };
  let aliasProvided = false;

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
    if (arg.startsWith("--")) throw new Error(`Unknown option: ${arg}`);
    if (aliasProvided) throw new Error("Provide exactly one fixed capture alias.");
    if (!getCaptureAlias(arg)) throw new Error(`Unknown capture alias: ${arg}`);
    config.alias = arg;
    aliasProvided = true;
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
  throw new Error(`Playwright is required for the terminal capture (tried local capture and presentation installs): ${failures.join(" | ")}`);
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
    // Fall through to the normal Playwright launch strategies.
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
  throw new Error(`No browser could launch for the terminal capture. ${errors.join(" | ")}`);
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
        reject(new Error(`ffprobe failed for captured WebM: ${stderr.trim() || `exit ${code}`}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
  const seconds = Number(output);
  if (!Number.isFinite(seconds)) throw new Error("ffprobe did not return a video duration.");
  return seconds;
}

async function typeFixedCommand(page, command) {
  await page.locator("#terminal").click();
  await page.keyboard.type(command, { delay: TYPE_DELAY_MS });
}

async function waitForUiCommand(page, command) {
  await page.waitForFunction(
    (expected) => window.__levelfieldCaptureCommand === expected,
    command,
    { timeout: TERMINAL_TIMEOUT_MS },
  );
}

async function readRun(stageUrl, runId) {
  const response = await fetch(`${stageUrl}/api/run/${runId}`);
  if (!response.ok) throw new Error(`Unable to read local capture result (${response.status}).`);
  return response.json();
}

async function holdActualOutput(page, needles, holdMs) {
  const visible = await page.evaluate((requiredNeedles) => {
    const outputs = [...document.querySelectorAll(".history-output")];
    const target = outputs.find((element) => requiredNeedles.every((needle) => element.textContent.includes(needle)));
    if (!target) return false;
    document.querySelectorAll(".history-output.capture-focus").forEach((element) => element.classList.remove("capture-focus"));
    target.classList.add("capture-focus");
    target.scrollIntoView({ block: "center", behavior: "smooth" });
    return true;
  }, needles);
  if (!visible) throw new Error(`Required real terminal output was not visible: ${needles.join(" + ")}`);
  await page.waitForTimeout(holdMs);
}

async function scrollActualTerminal(page, deltaY, holdMs) {
  await page.locator("#screen").hover();
  await page.mouse.wheel(0, deltaY);
  await page.waitForTimeout(holdMs);
}

async function holdAliasEvidence(page, alias) {
  if (alias.id === "mcp-policy") {
    await holdActualOutput(page, ["Connected to the LevelField MCP server over stdio"], 2_600);
    await holdActualOutput(page, ["DreamDEX score snapshot", "3/100", "PROCEED"], 3_400);
    await scrollActualTerminal(page, -360, 1_700);
    await holdActualOutput(page, ["95/100", "DECLINE", "CB-1:"], 3_800);
    await scrollActualTerminal(page, 420, 1_600);
    return;
  }

  await holdActualOutput(page, ["Validated 16/16 curated contracts", "Spearman rho = 0.930 (n=16)"], 2_500);
  await holdActualOutput(page, ["Contracts: 16; band agreement (voted vs reference): 16/16"], 2_400);
  await holdActualOutput(page, ["Tests  65 passed (65)", "Tests  4 passed (4)"], 2_500);
  await holdActualOutput(page, ["8 passed"], 2_500);
  await holdActualOutput(page, ["LevelField SDK cross-check", "read-only"], 2_800);
  await scrollActualTerminal(page, -440, 1_500);
}

function assertFinishedRun(result, alias) {
  if (result.status !== "passed") throw new Error(`Fixed ${alias.id} capture failed: ${result.assertionError ?? "unknown error"}`);
  if (alias.id === "mcp-policy") {
    const required = ["stdio", "snapshot", "score3", "score95", "proceed", "decline", "cb1"];
    const missing = required.filter((key) => result.assertions?.[key] !== true);
    if (missing.length > 0) throw new Error(`Terminal assertions failed: ${missing.join(", ")}`);
    return;
  }
  const missing = alias.commands.map((command) => command.id).filter((id) => result.assertions?.[id] !== true);
  if (missing.length > 0) throw new Error(`Evidence command assertions failed: ${missing.join(", ")}`);
}

export async function captureTerminal(config = parseTerminalCaptureArgs(process.argv.slice(2))) {
  if (config.help) return { usage: usage() };
  const alias = getCaptureAlias(config.alias);
  if (!alias) throw new Error("Only the checked-in mcp-policy and evidence aliases can be recorded.");

  await mkdir(config.outputDir, { recursive: true });
  const rawVideoDirectory = path.join(config.outputDir, `.${alias.id}-raw`);
  const evidenceDirectory = path.join(config.outputDir, `${alias.id}-evidence`);
  const destination = path.join(config.outputDir, alias.outputFile);
  await rm(rawVideoDirectory, { recursive: true, force: true });
  await rm(destination, { force: true });
  await mkdir(rawVideoDirectory, { recursive: true });

  const stage = await createTerminalStageServer({ repoRoot, outputDir: evidenceDirectory });
  let browser;
  let context;
  let page;
  let video;
  let duration = null;

  try {
    const stageUrl = await stage.listen();
    const playwright = loadPlaywright();
    browser = await launchCleanBrowser(playwright.chromium, config.headless);
    context = await browser.newContext({
      viewport: VIEWPORT,
      screen: VIEWPORT,
      recordVideo: { dir: rawVideoDirectory, size: VIEWPORT },
      colorScheme: "dark",
      reducedMotion: "no-preference",
    });
    page = await context.newPage();
    video = page.video();
    const recordStartedAt = Date.now();

    await page.goto(`${stageUrl}/?alias=${encodeURIComponent(alias.id)}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.__levelfieldCaptureRunId), { timeout: TERMINAL_TIMEOUT_MS });

    for (let index = 0; index < alias.commands.length; index += 1) {
      const command = alias.commands[index];
      await waitForUiCommand(page, command.display);
      await typeFixedCommand(page, command.display);
      if (index + 1 < alias.commands.length) {
        await page.waitForFunction(
          (nextCommand) => window.__levelfieldCaptureCommand === nextCommand
            && document.documentElement.dataset.runState === "type fixed command",
          alias.commands[index + 1].display,
          { timeout: TERMINAL_TIMEOUT_MS },
        );
      }
    }

    await page.waitForFunction(
      () => document.documentElement.dataset.runState === "passed"
        || document.documentElement.dataset.runState === "failed",
      { timeout: TERMINAL_TIMEOUT_MS },
    );

    const runId = await page.evaluate(() => window.__levelfieldCaptureRunId);
    const result = await readRun(stageUrl, runId);
    assertFinishedRun(result, alias);
    await holdAliasEvidence(page, alias);

    const remainingMs = Math.max(0, alias.minimumDurationSeconds * 1_000 + 300 - (Date.now() - recordStartedAt));
    if (remainingMs > 0) await page.waitForTimeout(remainingMs);

    await context.close();
    context = null;
    const rawVideo = await video.path();
    await rename(rawVideo, destination);
    duration = await durationSeconds(destination);
    if (duration < alias.minimumDurationSeconds) {
      throw new Error(`Captured ${alias.id} source is ${duration.toFixed(2)}s; minimum is ${alias.minimumDurationSeconds}s.`);
    }

    return {
      alias: alias.id,
      outputFile: alias.outputFile,
      durationSeconds: duration,
      assertions: result.assertions,
      artifactNames: result.artifactNames,
    };
  } finally {
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    await stage.close();
    await rm(rawVideoDirectory, { recursive: true, force: true });
  }
}

async function main() {
  const config = parseTerminalCaptureArgs(process.argv.slice(2));
  if (config.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  const result = await captureTerminal(config);
  process.stdout.write(`Captured ${result.alias}: ${result.outputFile} (${result.durationSeconds.toFixed(2)}s)\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`Terminal capture failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
