#!/usr/bin/env node
/**
 * Records one continuous, real-browser LevelField product walkthrough.
 *
 * Usage:
 *   node demo-video/capture/scripts/capture-browser.mjs \
 *     --base-url http://127.0.0.1:3000 \
 *     --output-dir /tmp/levelfield-capture
 *
 * The runner deliberately fails when a required selector or assertion changes. It records
 * actual navigation, scrolling, clicking, pasting, and browser-local verification; the
 * only overlay is a cursor/click pulse so user actions remain visible in the WebM.
 */

import { access, mkdir, readdir, rename, stat, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  CAPTURE_VIEWPORT,
  buildBrowserFlows,
  validateBrowserFlows,
} from "./browser-flows.mjs";

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const DEFAULT_TIMEOUT_MS = 15_000;
const CURSOR_INIT_SCRIPT = String.raw`
(() => {
  const ensureCursor = () => {
    if (window.__levelFieldCaptureCursor) return;
    const style = document.createElement("style");
    style.id = "lf-capture-cursor-style";
    style.textContent = [
      "#lf-capture-cursor { position: fixed; z-index: 2147483647; width: 22px; height: 22px; margin: -11px 0 0 -11px; border: 2px solid rgba(255,255,255,.96); border-radius: 50%; background: rgba(16,24,35,.48); box-shadow: 0 0 0 2px rgba(16,24,35,.42), 0 8px 22px rgba(0,0,0,.38); pointer-events: none; transition: left .12s linear, top .12s linear; }",
      "#lf-capture-cursor.lf-pulse::after { content: \"\"; position: absolute; inset: -12px; border: 2px solid rgba(255,255,255,.85); border-radius: 50%; animation: lf-capture-pulse .52s ease-out forwards; }",
      "#lf-capture-cursor-label { position: fixed; z-index: 2147483647; transform: translate(16px, 14px); font: 600 12px/1.1 ui-sans-serif, system-ui, sans-serif; letter-spacing: .02em; color: #fff; background: rgba(10,16,26,.80); border: 1px solid rgba(255,255,255,.28); border-radius: 999px; padding: 5px 8px; pointer-events: none; opacity: 0; transition: opacity .12s linear; }",
      "@keyframes lf-capture-pulse { from { opacity: .9; transform: scale(.3); } to { opacity: 0; transform: scale(1.25); } }",
    ].join("\n");
    const cursor = document.createElement("div");
    cursor.id = "lf-capture-cursor";
    const label = document.createElement("div");
    label.id = "lf-capture-cursor-label";
    document.documentElement.append(style, cursor, label);
    window.__levelFieldCaptureCursor = ({ x, y, label: labelText, pulse }) => {
      cursor.style.left = x + "px";
      cursor.style.top = y + "px";
      label.style.left = x + "px";
      label.style.top = y + "px";
      label.textContent = labelText || "";
      label.style.opacity = labelText ? "1" : "0";
      if (pulse) {
        cursor.classList.remove("lf-pulse");
        void cursor.offsetWidth;
        cursor.classList.add("lf-pulse");
      }
    };
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureCursor, { once: true });
  } else {
    ensureCursor();
  }
})();
`;

function usage() {
  return `Usage: node demo-video/capture/scripts/capture-browser.mjs [options]

Options:
  --base-url URL       LevelField web base URL (default: ${DEFAULT_BASE_URL})
  --output-dir DIR     Directory for the continuous .webm and UTC action log
  --name NAME          Output basename (default: levelfield-browser-demo)
  --flow IDS           Record all flows (default) or a comma-separated flow subset
  --chrome-path PATH   Prefer this system Chrome executable
  --headed             Run visibly instead of headless capture
  --slow-mo MS         Playwright action delay in milliseconds
  --timeout MS         Selector/action timeout in milliseconds
  --help               Show this message

Playwright resolution:
  The script tries a local playwright module, PLAYWRIGHT_MODULE_PATH, then the npm npx cache.
  Launch falls back from bundled Chromium to installed Google Chrome (channel/path).
`;
}

function parseArgs(argv) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const config = {
    baseUrl: process.env.LEVELFIELD_BASE_URL ?? DEFAULT_BASE_URL,
    outputDir: join(tmpdir(), `levelfield-capture-${timestamp}`),
    name: "levelfield-browser-demo",
    flowIds: "all",
    chromePath: process.env.LEVELFIELD_CHROME_PATH,
    headless: true,
    slowMo: 0,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = () => {
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) throw new Error(`${arg} requires a value.`);
      index += 1;
      return next;
    };

    if (arg === "--base-url") config.baseUrl = value();
    else if (arg === "--output-dir") config.outputDir = value();
    else if (arg === "--name") config.name = value();
    else if (arg === "--flow") config.flowIds = value();
    else if (arg === "--chrome-path") config.chromePath = value();
    else if (arg === "--headed") config.headless = false;
    else if (arg === "--slow-mo") config.slowMo = Number(value());
    else if (arg === "--timeout") config.timeoutMs = Number(value());
    else if (arg === "--help") return { ...config, help: true };
    else throw new Error(`Unknown option: ${arg}`);
  }

  new URL(config.baseUrl);
  if (!Number.isFinite(config.slowMo) || config.slowMo < 0) throw new Error("--slow-mo must be a non-negative number.");
  if (!Number.isFinite(config.timeoutMs) || config.timeoutMs <= 0) throw new Error("--timeout must be a positive number.");
  return { ...config, outputDir: resolve(config.outputDir) };
}

function utcNow() {
  return new Date().toISOString();
}

function selectFlows(flows, flowIds) {
  if (flowIds === "all") return flows;
  const ids = flowIds.split(",").map((id) => id.trim()).filter(Boolean);
  if (ids.length === 0) throw new Error("--flow must name at least one flow ID or all.");
  const byId = new Map(flows.map((flow) => [flow.id, flow]));
  const selected = ids.map((id) => {
    const flow = byId.get(id);
    if (!flow) throw new Error(`Unknown flow ID: ${id}. Available: ${flows.map((entry) => entry.id).join(", ")}`);
    return flow;
  });
  if (new Set(ids).size !== ids.length) throw new Error("--flow cannot repeat a flow ID.");
  return selected;
}

function describeLocator(locator) {
  if (locator.type === "css") return `${locator.name} (${locator.selector})`;
  if (locator.type === "dimension") return `dimension containing ${JSON.stringify(locator.contains)}`;
  return `${locator.type}:${JSON.stringify(locator.name)}`;
}

async function exists(path) {
  try {
    await access(path, fsConstants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function entryForModulePath(modulePath) {
  const fullPath = resolve(modulePath);
  const details = await stat(fullPath);
  return details.isDirectory() ? join(fullPath, "index.js") : fullPath;
}

async function cachedPlaywrightEntries() {
  const cacheRoot = join(homedir(), ".npm", "_npx");
  try {
    const cacheEntries = await readdir(cacheRoot, { withFileTypes: true });
    const paths = [];
    for (const entry of cacheEntries) {
      if (!entry.isDirectory()) continue;
      const candidate = join(cacheRoot, entry.name, "node_modules", "playwright", "index.js");
      try {
        await access(candidate, fsConstants.R_OK);
        paths.push(candidate);
      } catch {
        // This npm ephemeral workspace simply does not contain Playwright.
      }
    }
    return paths.sort().reverse();
  } catch {
    return [];
  }
}

async function loadPlaywright(log) {
  const candidates = ["playwright"];
  if (process.env.PLAYWRIGHT_MODULE_PATH) candidates.push(process.env.PLAYWRIGHT_MODULE_PATH);
  candidates.push(...(await cachedPlaywrightEntries()));

  const errors = [];
  for (const candidate of candidates) {
    try {
      const specifier = isAbsolute(candidate) || candidate.startsWith(".")
        ? pathToFileURL(await entryForModulePath(candidate)).href
        : candidate;
      const module = await import(specifier);
      // npm's cached Playwright package is CommonJS. Dynamic ESM import exposes its
      // public browser object as `default`, while a local ESM installation exports it
      // as named bindings. Accept both shapes without changing the capture contract.
      const playwright = module.chromium ? module : module.default;
      if (!playwright?.chromium) throw new Error("module does not export chromium");
      log("playwright-loaded", { candidate });
      return playwright;
    } catch (error) {
      errors.push(`${candidate}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(
    `Unable to load Playwright. Set PLAYWRIGHT_MODULE_PATH to the playwright package directory or run through a local Playwright installation. Attempts:\n${errors.join("\n")}`,
  );
}

async function launchBrowser(chromium, config, log) {
  const common = { headless: config.headless, slowMo: config.slowMo };
  const attempts = [];

  if (config.chromePath) {
    attempts.push({ label: "requested system Chrome", options: { ...common, executablePath: config.chromePath } });
  }
  attempts.push({ label: "bundled Chromium", options: common });
  attempts.push({ label: "system Chrome channel", options: { ...common, channel: "chrome" } });

  const macChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (await exists(macChrome)) {
    attempts.push({ label: "macOS Google Chrome executable", options: { ...common, executablePath: macChrome } });
  }

  const errors = [];
  for (const attempt of attempts) {
    try {
      log("browser-launch-attempt", { launcher: attempt.label });
      const browser = await chromium.launch(attempt.options);
      log("browser-launched", { launcher: attempt.label });
      return browser;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${attempt.label}: ${message}`);
      log("browser-launch-failed", { launcher: attempt.label, message });
    }
  }
  throw new Error(`No Playwright browser could launch.\n${errors.join("\n")}`);
}

function resolveLocator(page, spec) {
  switch (spec.type) {
    case "navLink":
      return page
        .getByRole("navigation", { name: "Primary navigation", exact: true })
        .getByRole("link", { name: spec.name, exact: true });
    case "role":
      return page.getByRole(spec.role, { name: spec.name, exact: true });
    case "text":
      return page.getByText(spec.name, { exact: true });
    case "label":
      return page.getByLabel(spec.name, { exact: true });
    case "css":
      return page.locator(spec.selector);
    case "dimension":
      return page.locator("details.dimension").filter({ hasText: spec.contains }).locator("summary");
    case "dimensionBody":
      return page.locator("details.dimension").filter({ hasText: spec.contains }).locator(".dimension-body");
    default:
      throw new Error(`Unsupported locator type: ${spec.type}`);
  }
}

async function requireLocator(page, spec, { timeoutMs, visible, scrollIntoView, flowId, actionIndex }) {
  const locator = resolveLocator(page, spec);
  const count = await locator.count();
  const prefix = `[${flowId} action ${actionIndex}] ${describeLocator(spec)}`;
  if (count !== 1) {
    throw new Error(`${prefix}: selector drift — expected exactly one match, found ${count}; URL ${page.url()}`);
  }
  if (scrollIntoView) await locator.scrollIntoViewIfNeeded({ timeout: timeoutMs });
  if (visible) {
    try {
      await locator.waitFor({ state: "visible", timeout: timeoutMs });
    } catch (error) {
      throw new Error(`${prefix}: assertion drift — expected visible element at ${page.url()}; ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return locator;
}

async function setCursor(page, x, y, label, pulse = false) {
  await page.evaluate(
    ({ cursorX, cursorY, cursorLabel, cursorPulse }) => {
      window.__levelFieldCaptureCursor?.({
        x: cursorX,
        y: cursorY,
        label: cursorLabel,
        pulse: cursorPulse,
      });
    },
    { cursorX: x, cursorY: y, cursorLabel: label, cursorPulse: pulse },
  );
}

async function pulseLocator(page, locator, label) {
  const box = await locator.boundingBox();
  if (!box) throw new Error(`Cannot pulse ${label}: element has no visible bounding box.`);
  const x = Math.round(box.x + Math.min(28, Math.max(12, box.width / 2)));
  const y = Math.round(box.y + Math.min(20, Math.max(12, box.height / 2)));
  await page.mouse.move(x, y, { steps: 12 });
  await setCursor(page, x, y, label, true);
  await page.waitForTimeout(360);
}

async function smoothScroll(page, deltaY, durationMs) {
  const steps = Math.max(6, Math.round(durationMs / 80));
  const increment = deltaY / steps;
  await page.mouse.move(CAPTURE_VIEWPORT.width - 74, CAPTURE_VIEWPORT.height - 94, { steps: 8 });
  await setCursor(page, CAPTURE_VIEWPORT.width - 74, CAPTURE_VIEWPORT.height - 94, "scroll");
  for (let step = 0; step < steps; step += 1) {
    await page.mouse.wheel(0, increment);
    await page.waitForTimeout(Math.max(16, Math.round(durationMs / steps)));
  }
}

async function smoothScrollToLocator(page, locator, durationMs) {
  const targetY = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return Math.max(0, window.scrollY + rect.top - window.innerHeight * 0.26);
  });
  const currentY = await page.evaluate(() => window.scrollY);
  await smoothScroll(page, targetY - currentY, durationMs);
}

async function performAction(page, action, context) {
  const { flowId, actionIndex, timeoutMs, log } = context;
  const detail = { flowId, actionIndex, kind: action.kind, description: action.description, url: page.url() };
  log("action-start", detail);

  switch (action.kind) {
    case "goto":
      await page.goto(action.url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
      await page.waitForTimeout(900);
      break;
    case "hold":
      await page.waitForTimeout(action.ms);
      break;
    case "scroll":
      await smoothScroll(page, action.deltaY, action.durationMs);
      break;
    case "scrollTo": {
      const locator = await requireLocator(page, action.locator, {
        timeoutMs,
        visible: false,
        scrollIntoView: false,
        flowId,
        actionIndex,
      });
      await smoothScrollToLocator(page, locator, 1_850);
      await locator.waitFor({ state: "visible", timeout: timeoutMs });
      break;
    }
    case "click": {
      const locator = await requireLocator(page, action.locator, {
        timeoutMs,
        visible: true,
        scrollIntoView: true,
        flowId,
        actionIndex,
      });
      await pulseLocator(page, locator, action.description);
      await locator.click({ timeout: timeoutMs });
      await page.waitForTimeout(700);
      break;
    }
    case "fill": {
      const locator = await requireLocator(page, action.locator, {
        timeoutMs,
        visible: true,
        scrollIntoView: true,
        flowId,
        actionIndex,
      });
      await pulseLocator(page, locator, "paste");
      await locator.click({ timeout: timeoutMs });
      await locator.fill(action.value, { timeout: timeoutMs });
      await page.waitForTimeout(650);
      break;
    }
    case "hover": {
      const locator = await requireLocator(page, action.locator, {
        timeoutMs,
        visible: true,
        scrollIntoView: true,
        flowId,
        actionIndex,
      });
      await pulseLocator(page, locator, action.description);
      await locator.hover({ timeout: timeoutMs });
      await page.waitForTimeout(action.durationMs);
      break;
    }
    case "assert":
      await requireLocator(page, action.locator, {
        timeoutMs,
        visible: true,
        scrollIntoView: false,
        flowId,
        actionIndex,
      });
      break;
    default:
      throw new Error(`Unsupported action kind: ${action.kind}`);
  }

  log("action-complete", { ...detail, url: page.url() });
}

async function writeLog(logPath, payload) {
  await writeFile(logPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export async function main(argv = process.argv.slice(2)) {
  const config = parseArgs(argv);
  if (config.help) {
    process.stdout.write(usage());
    return;
  }

  const flows = buildBrowserFlows(config.baseUrl);
  validateBrowserFlows(flows);
  const selectedFlows = selectFlows(flows, config.flowIds);
  await mkdir(config.outputDir, { recursive: true });

  const eventLog = [];
  const logPath = join(config.outputDir, `${config.name}.actions.utc.json`);
  const log = (event, details = {}) => {
    eventLog.push({ utc: utcNow(), event, ...details });
  };
  const logState = async (status, extra = {}) => {
    await writeLog(logPath, {
      status,
      startedAtUtc: eventLog[0]?.utc ?? utcNow(),
      endedAtUtc: status === "recorded" || status === "failed" ? utcNow() : null,
      baseUrl: config.baseUrl,
      timezoneId: "UTC",
      viewport: CAPTURE_VIEWPORT,
      events: eventLog,
      ...extra,
    });
  };

  log("capture-start", {
    baseUrl: config.baseUrl,
    outputDir: config.outputDir,
    timezoneId: "UTC",
    flowIds: selectedFlows.map((flow) => flow.id),
  });
  await logState("recording");

  let browser;
  let context;
  let page;
  let video;
  try {
    const { chromium } = await loadPlaywright(log);
    browser = await launchBrowser(chromium, config, log);
    context = await browser.newContext({
      viewport: CAPTURE_VIEWPORT,
      screen: CAPTURE_VIEWPORT,
      deviceScaleFactor: 1,
      locale: "en-US",
      timezoneId: "UTC",
      recordVideo: { dir: config.outputDir, size: CAPTURE_VIEWPORT },
    });
    await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: new URL(config.baseUrl).origin });
    page = await context.newPage();
    page.setDefaultTimeout(config.timeoutMs);
    await page.addInitScript({ content: CURSOR_INIT_SCRIPT });
    video = page.video();
    log("context-created", { viewport: CAPTURE_VIEWPORT, timezoneId: "UTC" });

    const firstFlow = selectedFlows[0];
    const firstAction = firstFlow.actions[0];
    const firstActionNavigatesToStart = firstAction.kind === "goto" && firstAction.url === firstFlow.startUrl;
    if (!firstActionNavigatesToStart) {
      log("capture-bootstrap", { flowId: firstFlow.id, url: firstFlow.startUrl });
      await page.goto(firstFlow.startUrl, { waitUntil: "domcontentloaded", timeout: config.timeoutMs });
      await page.waitForTimeout(900);
    }

    for (const flow of selectedFlows) {
      const startedAt = Date.now();
      log("flow-start", { flowId: flow.id, title: flow.title, url: page.url() });
      for (let actionIndex = 0; actionIndex < flow.actions.length; actionIndex += 1) {
        await performAction(page, flow.actions[actionIndex], {
          flowId: flow.id,
          actionIndex: actionIndex + 1,
          timeoutMs: config.timeoutMs,
          log,
        });
        await logState("recording");
      }
      const durationMs = Date.now() - startedAt;
      if (durationMs < flow.minimumSourceDurationMs) {
        throw new Error(
          `[${flow.id}] recorded source duration ${durationMs}ms is below its required ${flow.minimumSourceDurationMs}ms. ` +
          "Increase real holds, hovers, or smooth scrolling in browser-flows.mjs.",
        );
      }
      log("flow-complete", { flowId: flow.id, title: flow.title, durationMs, url: page.url() });
      await logState("recording");
    }

    await context.close();
    context = undefined;
    const rawVideoPath = await video.path();
    const finalVideoPath = join(config.outputDir, `${config.name}.webm`);
    if (resolve(rawVideoPath) !== resolve(finalVideoPath)) await rename(rawVideoPath, finalVideoPath);
    await browser.close();
    browser = undefined;

    log("capture-complete", { videoPath: finalVideoPath });
    await logState("recorded", { videoPath: finalVideoPath });
    process.stdout.write(`Recorded continuous WebM: ${finalVideoPath}\nUTC action log: ${logPath}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    log("capture-failed", { message });
    try {
      if (context) await context.close();
    } catch {
      // Preserve the primary selector/assertion failure in the action log.
    }
    try {
      if (browser) await browser.close();
    } catch {
      // Preserve the primary selector/assertion failure in the action log.
    }
    await logState("failed", { error: message });
    throw error;
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath && fileURLToPath(import.meta.url) === invokedPath) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
