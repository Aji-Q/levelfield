#!/usr/bin/env node

/**
 * Local-only terminal capture stage.
 *
 * The page is intentionally not a shell emulator. It accepts keystrokes only
 * when they match the next character of the one fixed demo command, then
 * starts that command without a shell. The displayed output is streamed from
 * the real process and persisted as sanitized capture evidence.
 */

import { createHash, randomUUID } from "node:crypto";
import { spawn as spawnChild } from "node:child_process";
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CAPTURE_COPY,
  assertDemoTranscript,
  buildSafeStageEnvironment,
  getCaptureAlias,
  sanitizeArtifactText,
} from "./lib/commands.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = path.resolve(here, "../../..");
const DEFAULT_OUTPUT_DIR = path.join(DEFAULT_REPO_ROOT, "output", "demo-video-capture", "terminal");
const LOCAL_HOST = "127.0.0.1";
const MAX_JSON_BYTES = 512;
const DEFAULT_ALIAS = "mcp-policy";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function htmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function json(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  res.end(JSON.stringify(body));
}

function empty(res, status) {
  res.writeHead(status, {
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  res.end();
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_JSON_BYTES) throw new Error("Request body exceeds local stage limit.");
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("Expected a small JSON object.");
  }
}

function secretValuesFrom(environment) {
  return Object.entries(environment)
    .filter(([name, value]) => /(?:secret|token|password|credential|authorization|private|api[_-]?key)/i.test(name) && typeof value === "string")
    .map(([, value]) => value);
}

export function assertEvidenceCommand(commandId, transcript) {
  const requirements = {
    validate: [/Validated 16\/16 curated contracts/, /Spearman rho = 0\.930 \(n=16\)/],
    agreement: [/Contracts: 16; band agreement \(voted vs reference\): 16\/16/],
    "npm-test": [/Tests\s+65 passed \(65\)/, /Tests\s+4 passed \(4\)/],
    "forge-test": [/8 passed/],
    "sdk-crosscheck": [/LevelField SDK cross-check/, /read-only/],
  };
  const missing = (requirements[commandId] ?? []).filter((pattern) => !pattern.test(transcript));
  if (missing.length > 0) {
    throw new Error(`Missing required ${commandId} evidence: ${missing.map(String).join(", ")}`);
  }
  return true;
}

function shouldCopyForEvidence(source, root) {
  const relative = path.relative(root, source);
  if (!relative) return true;
  const parts = relative.split(path.sep);
  const base = parts.at(-1) ?? "";
  if (parts.includes("node_modules") || parts.includes(".git") || parts.includes("output") || parts.includes(".next") || parts.includes(".render-work")) {
    return false;
  }
  if (base === ".env" || base.startsWith(".env.")) return false;
  return true;
}

async function createEvidenceWorkspace(repoRoot) {
  const workspace = await mkdtemp(path.join(os.tmpdir(), "levelfield-evidence-stage-"));
  await cp(repoRoot, workspace, {
    recursive: true,
    filter: (source) => shouldCopyForEvidence(source, repoRoot),
  });
  await symlink(path.join(repoRoot, "node_modules"), path.join(workspace, "node_modules"), "dir");
  return workspace;
}

function stageDocument() {
  const noOrder = JSON.stringify(CAPTURE_COPY.noOrderSubmitted);
  const defaultAlias = JSON.stringify(DEFAULT_ALIAS);
  return `<!doctype html>
<html lang="en" data-run-state="ready">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>LevelField terminal capture</title>
  <style>
    :root { color-scheme: dark; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    * { box-sizing: border-box; }
    body { margin: 0; min-width: 100vw; min-height: 100vh; background: #0a0f13; color: #e8eee9; }
    main { min-height: 100vh; display: grid; place-items: center; padding: 56px; background: radial-gradient(circle at 78% 12%, #173229 0, transparent 28%), #0a0f13; }
    .stage { width: min(1680px, 100%); }
    .eyebrow { display:flex; justify-content:space-between; margin:0 0 16px; color:#9aafa1; font-size:16px; letter-spacing:.12em; text-transform:uppercase; }
    .terminal { border: 1px solid #4c6655; border-radius: 14px; overflow: hidden; background:#07100d; box-shadow:0 28px 76px rgba(0,0,0,.45); outline:none; }
    .bar { display:flex; align-items:center; gap:10px; min-height:56px; padding:0 22px; border-bottom:1px solid #314b3b; color:#bdd2c1; background:#102018; font-size:16px; }
    .dot { width:10px; height:10px; border-radius:50%; background:#b38e4e; box-shadow:20px 0 #567a67, 40px 0 #416151; margin-right:34px; }
    .bar strong { color:#f0f5ef; font-weight:600; }
    .bar span:last-child { margin-left:auto; color:#8fa495; }
    .screen { height:760px; overflow:auto; padding:32px 38px 36px; font-size:21px; line-height:1.48; white-space:pre-wrap; scrollbar-color:#567a67 #07100d; }
    .command-line { color:#f5f6ec; min-height:32px; }
    .prompt { color:#dbb96f; margin-right:13px; }
    .caret { display:inline-block; width:11px; height:23px; vertical-align:-3px; margin-left:2px; background:#dbb96f; animation:blink .9s steps(1) infinite; }
    .history-output { display:block; margin:16px 0 0; font:inherit; color:#d8e4da; white-space:pre-wrap; }
    .capture-focus { position:relative; color:#fff8d2; background:rgba(179,142,78,.16); outline:1px solid rgba(219,185,111,.65); outline-offset:4px; border-radius:4px; }
    .annotation { margin-top:16px; display:flex; justify-content:space-between; gap:24px; color:#e7ddbf; font-size:18px; }
    .annotation strong { font-weight:700; }
    .annotation span { color:#9aafa1; text-align:right; }
    .status { color:#a9c5af; }
    @keyframes blink { 50% { opacity:0; } }
  </style>
</head>
<body>
  <main>
    <section class="stage" aria-label="Real LevelField terminal capture">
      <p class="eyebrow"><span>LevelField / local capture stage</span><span id="state" class="status">ready</span></p>
      <div id="terminal" class="terminal" tabindex="0" role="application" aria-label="Type the fixed LevelField demo command">
        <div class="bar"><i class="dot" aria-hidden="true"></i><strong>pre-trade assessment / real stdio transcript</strong><span>localhost only</span></div>
        <div class="screen" id="screen" aria-live="polite"><div id="terminal-content"></div></div>
      </div>
      <p class="annotation"><strong>${htmlEscape(CAPTURE_COPY.noOrderSubmitted)}</strong><span>Cached DreamDEX snapshot · curated comparison is separate</span></p>
    </section>
  <script>
    (() => {
      const noOrderSubmitted = ${noOrder};
      const defaultAlias = ${defaultAlias};
      const terminal = document.getElementById("terminal");
      const content = document.getElementById("terminal-content");
      const state = document.getElementById("state");
      const screen = document.getElementById("screen");
      let session = null;
      let command = "";
      let cursor = 0;
      let queue = Promise.resolve();
      let stream = null;
      let typed = null;
      let output = null;

      const post = async (url, body = undefined) => {
        const response = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
        if (!response.ok) throw new Error("Local stage request failed: " + response.status);
        const text = await response.text();
        return text ? JSON.parse(text) : null;
      };
      const setState = (value) => {
        document.documentElement.dataset.runState = value;
        state.textContent = value;
      };
      const newCommandLine = (nextCommand) => {
        command = nextCommand;
        cursor = 0;
        const line = document.createElement("div");
        line.className = "command-line";
        const prompt = document.createElement("span");
        prompt.className = "prompt";
        prompt.textContent = "$";
        typed = document.createElement("span");
        const caret = document.createElement("i");
        caret.className = "caret";
        caret.setAttribute("aria-hidden", "true");
        line.append(prompt, typed, caret);
        content.append(line);
        output = document.createElement("pre");
        output.className = "history-output";
        content.append(output);
        window.__levelfieldCaptureCommand = command;
        screen.scrollTop = screen.scrollHeight;
      };
      const append = (text) => {
        if (!output) return;
        output.textContent += text;
        screen.scrollTop = screen.scrollHeight;
      };
      const connectEvents = () => {
        stream = new EventSource("/api/events/" + session.id);
        stream.addEventListener("capture", (event) => {
          const data = JSON.parse(event.data);
          if (data.type === "snapshot" && data.output) append(data.output);
          if (data.type === "output") append(data.text);
          if (data.type === "status") setState(data.status);
          if (data.type === "next-command") { setState("type fixed command"); newCommandLine(data.command); terminal.focus(); }
          if (data.type === "error") { append("\\n[stage] " + data.message + "\\n"); setState("failed"); }
        });
      };
      const start = async () => {
        await post("/api/action/" + session.id, { type: "typing-complete" });
        connectEvents();
        setState("running");
        await post("/api/run/" + session.id, {});
      };
      const acceptKey = async (key) => {
        if (cursor >= command.length || key !== command[cursor]) return;
        await post("/api/action/" + session.id, { type: "typed-char", char: key });
        typed.textContent += key;
        cursor += 1;
        if (cursor === command.length) await start();
      };
      terminal.addEventListener("keydown", (event) => {
        if (!session || event.metaKey || event.ctrlKey || event.altKey || event.key.length !== 1) return;
        event.preventDefault();
        queue = queue.then(() => acceptKey(event.key)).catch((error) => {
          append("\\n[stage] " + error.message + "\\n");
          setState("failed");
        });
      });
      (async () => {
        try {
          const requestedAlias = new URLSearchParams(location.search).get("alias") || defaultAlias;
          session = await post("/api/session", { alias: requestedAlias });
          window.__levelfieldCaptureRunId = session.id;
          window.__levelfieldCaptureAlias = session.alias;
          newCommandLine(session.command);
          terminal.focus();
          setState("type fixed command");
        } catch (error) {
          append("[stage] " + error.message + "\\n");
          setState("failed");
        }
      })();
      window.__levelfieldCaptureCopy = noOrderSubmitted;
    })();
  </script>
</body>
</html>`;
}

function requestPath(url) {
  return new URL(url, "http://localhost").pathname;
}

export async function createTerminalStageServer({
  repoRoot = DEFAULT_REPO_ROOT,
  outputDir = DEFAULT_OUTPUT_DIR,
  sourceEnv = process.env,
  spawnImpl = spawnChild,
} = {}) {
  const runs = new Map();
  const secrets = secretValuesFrom(sourceEnv);
  let server;

  function elapsed(run) {
    return Date.now() - run.createdAt;
  }

  function addAction(run, type, details = {}) {
    const action = { atMs: elapsed(run), type };
    for (const [key, value] of Object.entries(details)) {
      action[key] = typeof value === "string" ? sanitizeArtifactText(value, secrets) : value;
    }
    run.actions.push(action);
  }

  function sendCaptureEvent(run, payload) {
    const encoded = `event: capture\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const response of run.clients) response.write(encoded);
  }

  function currentCommand(run) {
    return run.aliasConfig.commands[run.commandIndex] ?? null;
  }

  function publicRun(run) {
    const command = currentCommand(run);
    return {
      id: run.id,
      alias: run.aliasConfig.id,
      status: run.status,
      command: command?.display ?? null,
      commandIndex: run.commandIndex,
      commandCount: run.aliasConfig.commands.length,
      typedCharacters: run.typingIndex,
      exitCode: run.exitCode,
      assertions: run.assertions,
      artifactNames: run.artifactNames,
    };
  }

  function appendOutput(run, stream, chunk) {
    const commandRun = run.activeCommand;
    if (!commandRun) return;
    const key = stream === "stderr" ? "stderrBuffer" : "stdoutBuffer";
    commandRun[key] += Buffer.from(chunk).toString("utf8");
    const parts = commandRun[key].split(/\r?\n/);
    commandRun[key] = parts.pop() ?? "";
    for (const line of parts) {
      const safeLine = sanitizeArtifactText(line, secrets);
      const text = `${safeLine}\n`;
      commandRun.transcript += text;
      run.output += text;
      run.transcript += text;
      addAction(run, "output", { command: commandRun.command.id, stream, text });
      sendCaptureEvent(run, { type: "output", text });
    }
  }

  function flushOutput(run) {
    const commandRun = run.activeCommand;
    if (!commandRun) return;
    for (const [stream, key] of [["stdout", "stdoutBuffer"], ["stderr", "stderrBuffer"]]) {
      if (!commandRun[key]) continue;
      const safeLine = sanitizeArtifactText(commandRun[key], secrets);
      const text = `${safeLine}\n`;
      commandRun.transcript += text;
      run.output += text;
      run.transcript += text;
      addAction(run, "output", { command: commandRun.command.id, stream, text });
      sendCaptureEvent(run, { type: "output", text });
      commandRun[key] = "";
    }
  }

  async function artifactDirectory(run) {
    if (run.artifactDirectory) return run.artifactDirectory;
    const safeStamp = new Date(run.createdAt).toISOString().replaceAll(":", "-").replaceAll(".", "-");
    run.artifactDirectory = path.join(outputDir, `run-${safeStamp}-${run.id.slice(0, 8)}`);
    await mkdir(run.artifactDirectory, { recursive: true });
    return run.artifactDirectory;
  }

  async function persistCommand(run, commandRun) {
    const directory = await artifactDirectory(run);
    const commandDirectory = path.join(directory, "commands");
    await mkdir(commandDirectory, { recursive: true });
    const exitLog = `${JSON.stringify({
      id: commandRun.command.id,
      command: commandRun.command.display,
      status: commandRun.status,
      exitCode: commandRun.exitCode,
      signal: commandRun.signal,
      assertionError: commandRun.assertionError,
    }, null, 2)}\n`;
    const hashes = `${JSON.stringify({
      algorithm: "sha256",
      transcriptSha256: sha256(commandRun.transcript),
      exitSha256: sha256(exitLog),
    }, null, 2)}\n`;
    await Promise.all([
      writeFile(path.join(commandDirectory, `${commandRun.command.id}-transcript.txt`), commandRun.transcript, "utf8"),
      writeFile(path.join(commandDirectory, `${commandRun.command.id}-exit.json`), exitLog, "utf8"),
      writeFile(path.join(commandDirectory, `${commandRun.command.id}-hashes.json`), hashes, "utf8"),
    ]);
  }

  async function persist(run) {
    const directory = await artifactDirectory(run);
    const actionLog = `${JSON.stringify(run.actions, null, 2)}\n`;
    const exitLog = `${JSON.stringify({
      alias: run.aliasConfig.id,
      status: run.status,
      exitCode: run.exitCode,
      signal: run.signal,
      assertionError: run.assertionError,
    }, null, 2)}\n`;
    const hashes = `${JSON.stringify({
      algorithm: "sha256",
      transcriptSha256: sha256(run.transcript),
      actionsSha256: sha256(actionLog),
      exitSha256: sha256(exitLog),
    }, null, 2)}\n`;

    await Promise.all([
      writeFile(path.join(directory, "transcript.txt"), run.transcript, "utf8"),
      writeFile(path.join(directory, "actions.json"), actionLog, "utf8"),
      writeFile(path.join(directory, "exit.json"), exitLog, "utf8"),
      writeFile(path.join(directory, "hashes.json"), hashes, "utf8"),
    ]);
    run.artifactNames = ["transcript.txt", "actions.json", "exit.json", "hashes.json", "commands/"];
  }

  async function finish(run, { exitCode = null, signal = null, error = null } = {}) {
    const commandRun = run.activeCommand;
    if (!commandRun || commandRun.finished) return;
    commandRun.finished = true;
    flushOutput(run);
    commandRun.exitCode = exitCode;
    commandRun.signal = signal;
    if (error) commandRun.processError = sanitizeArtifactText(error.message ?? String(error), secrets);

    if (exitCode === 0 && !error) {
      try {
        commandRun.assertions = run.aliasConfig.id === "mcp-policy"
          ? assertDemoTranscript(commandRun.transcript)
          : assertEvidenceCommand(commandRun.command.id, commandRun.transcript);
        commandRun.status = "passed";
      } catch (assertionError) {
        commandRun.assertionError = sanitizeArtifactText(assertionError.message, secrets);
        commandRun.status = "failed";
      }
    } else {
      commandRun.status = "failed";
      commandRun.assertionError = commandRun.processError ?? `Fixed command exited with ${exitCode ?? "no exit code"}.`;
    }
    addAction(run, "command-finished", {
      command: commandRun.command.id,
      status: commandRun.status,
      exitCode,
      signal,
      assertionError: commandRun.assertionError ?? "",
    });

    try {
      await persistCommand(run, commandRun);
    } catch (persistError) {
      commandRun.status = "failed";
      commandRun.assertionError = sanitizeArtifactText(persistError.message, secrets);
      addAction(run, "artifact-write-failed", { command: commandRun.command.id, message: commandRun.assertionError });
    }

    const hasNext = commandRun.status === "passed" && run.commandIndex + 1 < run.aliasConfig.commands.length;
    if (hasNext) {
      run.commandIndex += 1;
      run.typingIndex = 0;
      run.typingComplete = false;
      run.child = null;
      run.activeCommand = null;
      run.status = "typing";
      const next = currentCommand(run);
      addAction(run, "next-command", { command: next.id });
      sendCaptureEvent(run, { type: "next-command", command: next.display, commandIndex: run.commandIndex });
      return;
    }

    run.exitCode = exitCode;
    run.signal = signal;
    run.assertions = run.aliasConfig.id === "mcp-policy"
      ? commandRun.assertions
      : Object.fromEntries(run.commandRuns.map((entry) => [entry.command.id, entry.assertions === true]));
    run.status = commandRun.status === "passed" ? "passed" : "failed";
    run.assertionError = commandRun.assertionError;
    run.finished = true;
    addAction(run, "finished", { status: run.status, exitCode, signal, assertionError: run.assertionError ?? "" });

    try {
      await persist(run);
    } catch (persistError) {
      run.status = "failed";
      run.assertionError = sanitizeArtifactText(persistError.message, secrets);
      addAction(run, "artifact-write-failed", { message: run.assertionError });
    }
    if (run.workspace) {
      await rm(run.workspace, { recursive: true, force: true });
      run.workspace = null;
    }
    sendCaptureEvent(run, { type: "status", status: run.status });
    if (run.status === "failed") sendCaptureEvent(run, { type: "error", message: run.assertionError });
  }

  function newRun(aliasConfig) {
    const run = {
      id: randomUUID(),
      aliasConfig,
      createdAt: Date.now(),
      status: "typing",
      commandIndex: 0,
      typingIndex: 0,
      typingComplete: false,
      output: "",
      transcript: "",
      actions: [],
      clients: new Set(),
      exitCode: null,
      signal: null,
      assertions: null,
      assertionError: null,
      artifactNames: [],
      child: null,
      activeCommand: null,
      commandRuns: [],
      workspace: null,
      artifactDirectory: null,
      finished: false,
    };
    addAction(run, "session-created", { alias: aliasConfig.id, command: currentCommand(run).display });
    runs.set(run.id, run);
    return run;
  }

  function findRun(id) {
    return runs.get(id) ?? null;
  }

  async function beginRun(run) {
    const command = currentCommand(run);
    if (!command || run.status !== "typing" || !run.typingComplete || run.typingIndex !== command.display.length) {
      return { error: "The fixed command must be visibly typed before it can run." };
    }
    if (run.aliasConfig.id === "evidence" && !run.workspace) {
      try {
        run.workspace = await createEvidenceWorkspace(repoRoot);
        addAction(run, "evidence-workspace-created");
      } catch (error) {
        return { error: sanitizeArtifactText(error.message ?? String(error), secrets) };
      }
    }
    const baseCwd = run.workspace ?? repoRoot;
    const cwd = command.cwd === "contracts" ? path.join(baseCwd, "contracts") : baseCwd;
    const commandRun = {
      command,
      transcript: `$ ${command.display}\n`,
      stdoutBuffer: "",
      stderrBuffer: "",
      exitCode: null,
      signal: null,
      assertions: null,
      assertionError: null,
      status: "running",
      finished: false,
    };
    run.transcript += commandRun.transcript;
    run.commandRuns.push(commandRun);
    run.activeCommand = commandRun;
    run.status = "running";
    addAction(run, "fixed-command-started", {
      command: command.id,
      executable: command.executable,
      args: command.args.join(" "),
      shell: false,
    });
    sendCaptureEvent(run, { type: "status", status: run.status });

    try {
      const child = spawnImpl(command.executable, command.args, {
        cwd,
        env: buildSafeStageEnvironment(sourceEnv),
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
      });
      run.child = child;
      child.stdout.on("data", (chunk) => appendOutput(run, "stdout", chunk));
      child.stderr.on("data", (chunk) => appendOutput(run, "stderr", chunk));
      child.once("error", (error) => { void finish(run, { error }); });
      child.once("close", (exitCode, signal) => { void finish(run, { exitCode, signal }); });
    } catch (error) {
      void finish(run, { error });
    }
    return { run };
  }

  async function handler(req, res) {
    const pathname = requestPath(req.url ?? "/");
    if (req.method === "GET" && pathname === "/") {
      res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "content-security-policy": "default-src 'self'; connect-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'",
        "x-content-type-options": "nosniff",
      });
      res.end(stageDocument());
      return;
    }

    if (req.method === "POST" && pathname === "/api/session") {
      let body;
      try { body = await readJson(req); } catch (error) { json(res, 400, { error: error.message }); return; }
      const alias = getCaptureAlias(body.alias ?? DEFAULT_ALIAS);
      if (!alias) {
        json(res, 400, { error: "Unknown capture alias. The local stage has no command input." });
        return;
      }
      const run = newRun(alias);
      json(res, 201, {
        id: run.id,
        alias: alias.id,
        command: currentCommand(run).display,
        commandIndex: run.commandIndex,
        commandCount: alias.commands.length,
      });
      return;
    }

    const actionMatch = pathname.match(/^\/api\/action\/([0-9a-f-]+)$/i);
    if (req.method === "POST" && actionMatch) {
      const run = findRun(actionMatch[1]);
      if (!run) { json(res, 404, { error: "Unknown local capture session." }); return; }
      let body;
      try { body = await readJson(req); } catch (error) { json(res, 400, { error: error.message }); return; }
      if (run.status !== "typing") { json(res, 409, { error: "This session no longer accepts input." }); return; }
      const command = currentCommand(run);
      if (!command) { json(res, 409, { error: "There is no remaining fixed command." }); return; }
      if (body.type === "typed-char") {
        const expected = command.display[run.typingIndex];
        if (typeof body.char !== "string" || body.char !== expected) {
          json(res, 409, { error: "Only the next character of the fixed demo command is accepted." });
          return;
        }
        run.typingIndex += 1;
        addAction(run, "typed-char", { char: body.char, index: run.typingIndex - 1 });
        empty(res, 204);
        return;
      }
      if (body.type === "typing-complete" && run.typingIndex === command.display.length) {
        run.typingComplete = true;
        addAction(run, "typing-complete");
        empty(res, 204);
        return;
      }
      json(res, 409, { error: "Only fixed command typing actions are accepted." });
      return;
    }

    const runMatch = pathname.match(/^\/api\/run\/([0-9a-f-]+)$/i);
    if (req.method === "POST" && runMatch) {
      const run = findRun(runMatch[1]);
      if (!run) { json(res, 404, { error: "Unknown local capture session." }); return; }
      try { await readJson(req); } catch (error) { json(res, 400, { error: error.message }); return; }
      const result = await beginRun(run);
      if (result.error) { json(res, 409, { error: result.error }); return; }
      json(res, 202, publicRun(run));
      return;
    }

    if (req.method === "GET" && runMatch) {
      const run = findRun(runMatch[1]);
      if (!run) { json(res, 404, { error: "Unknown local capture session." }); return; }
      json(res, 200, publicRun(run));
      return;
    }

    const eventMatch = pathname.match(/^\/api\/events\/([0-9a-f-]+)$/i);
    if (req.method === "GET" && eventMatch) {
      const run = findRun(eventMatch[1]);
      if (!run) { json(res, 404, { error: "Unknown local capture session." }); return; }
      res.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
        "x-content-type-options": "nosniff",
      });
      run.clients.add(res);
      res.write(`event: capture\ndata: ${JSON.stringify({ type: "snapshot", output: run.output, status: run.status })}\n\n`);
      req.on("close", () => run.clients.delete(res));
      return;
    }

    json(res, 404, { error: "Local capture route not found." });
  }

  server = http.createServer((req, res) => { void handler(req, res); });

  return {
    get url() {
      const address = server.address();
      if (!address || typeof address === "string") return null;
      return `http://${LOCAL_HOST}:${address.port}`;
    },
    async listen(port = 0) {
      await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen({ host: LOCAL_HOST, port }, () => {
          server.off("error", reject);
          resolve();
        });
      });
      return this.url;
    },
    async close() {
      for (const run of runs.values()) {
        if (run.child && !run.finished) run.child.kill("SIGTERM");
        for (const client of run.clients) client.end();
        run.clients.clear();
      }
      if (!server.listening) return;
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    },
  };
}

async function main() {
  const stage = await createTerminalStageServer();
  const url = await stage.listen();
  process.stdout.write(`Local terminal capture stage: ${url}\n`);
  const stop = async () => {
    await stage.close();
    process.exit(0);
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  void main();
}
