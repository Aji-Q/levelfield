import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  CAPTURE_ALIASES,
  CAPTURE_COPY,
  EXPLORER_EXPECTATIONS,
  TERMINAL_DEMO_COMMAND,
  getCaptureAlias,
  assertDemoTranscript,
  buildSafeStageEnvironment,
  sanitizeArtifactText,
} from "../scripts/lib/commands.mjs";
import { assertEvidenceCommand, createTerminalStageServer } from "../scripts/terminal-stage-server.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
import { parseTerminalCaptureArgs } from "../scripts/capture-terminal.mjs";
import { parseExplorerCaptureArgs } from "../scripts/capture-explorer.mjs";

test("terminal capture command is fixed to the real demo agent with no shell interpolation", () => {
  assert.deepEqual(TERMINAL_DEMO_COMMAND, {
    executable: "npm",
    args: ["run", "demo:agent"],
    display: "npm run demo:agent",
    shell: false,
  });
});

test("capture aliases are an allowlist: MCP policy and evidence commands have fixed argv and minimum source durations", () => {
  const policy = getCaptureAlias("mcp-policy");
  assert.equal(policy.minimumDurationSeconds, 25);
  assert.deepEqual(policy.commands, [
    { id: "agent-demo", executable: "npm", args: ["run", "demo:agent"], cwd: "repo", display: "npm run demo:agent", shell: false },
  ]);

  const evidence = getCaptureAlias("evidence");
  assert.equal(evidence.minimumDurationSeconds, 25);
  assert.deepEqual(evidence.commands.map(({ id, executable, args, cwd, shell }) => ({ id, executable, args, cwd, shell })), [
    { id: "validate", executable: "npm", args: ["run", "validate"], cwd: "repo", shell: false },
    { id: "agreement", executable: "npx", args: ["tsx", "scripts/agreement.ts"], cwd: "repo", shell: false },
    { id: "npm-test", executable: "npm", args: ["test"], cwd: "repo", shell: false },
    { id: "forge-test", executable: "forge", args: ["test", "-vv"], cwd: "contracts", shell: false },
    { id: "sdk-crosscheck", executable: "npm", args: ["run", "sdk:crosscheck"], cwd: "repo", shell: false },
  ]);
  assert.equal(getCaptureAlias("anything-else"), null);
  assert.deepEqual(Object.keys(CAPTURE_ALIASES), ["mcp-policy", "evidence"]);
});

test("recorder CLIs accept only the fixed terminal aliases and fixed explorer source", () => {
  assert.equal(parseTerminalCaptureArgs(["evidence", "--output-dir", "runs/test"]).alias, "evidence");
  assert.throws(() => parseTerminalCaptureArgs(["echo", "hello"]), /Unknown capture alias/);
  assert.throws(() => parseTerminalCaptureArgs(["mcp-policy", "evidence"]), /exactly one fixed capture alias/);

  const explorer = parseExplorerCaptureArgs(["--output-dir", "runs/test"]);
  assert.equal(explorer.sourceUrl, "https://shannon-explorer.somnia.network/address/0xb8e11dea346f2c961880879606a269db3165bbc7");
  assert.throws(() => parseExplorerCaptureArgs(["--url", "https://example.test"]), /Unknown option/);
});

test("terminal capture transcript requires the real MCP and decision evidence", () => {
  const transcript = [
    "Connected to the LevelField MCP server over stdio",
    "DreamDEX score snapshot",
    "score:     3/100 (low)  [from cache]",
    "decision:  PROCEED (3/100 low)",
    "score:     95/100 (high)  [from cache]",
    "decision:  DECLINE (95/100 high, CB-1: reason)",
  ].join("\n");

  assert.deepEqual(assertDemoTranscript(transcript), {
    stdio: true,
    snapshot: true,
    score3: true,
    score95: true,
    proceed: true,
    decline: true,
    cb1: true,
  });
  assert.throws(() => assertDemoTranscript("Connected to the LevelField MCP server over stdio"), /Missing required demo evidence/);
});

test("stage environment excludes arbitrary inherited values and artifact text hides paths and secrets", () => {
  const env = buildSafeStageEnvironment({
    PATH: "/safe/bin",
    SECRET_TOKEN: "top-secret",
    HOME: "/Users/example",
    AWS_SECRET_ACCESS_KEY: "also-secret",
  });
  assert.deepEqual(env, {
    PATH: "/safe/bin",
    CI: "1",
    FORCE_COLOR: "0",
    NO_COLOR: "1",
    npm_config_update_notifier: "false",
  });

  const sanitized = sanitizeArtifactText(
    "cwd=/Users/example/repo temp=/tmp/levelfield-stage win=C:\\Users\\example\\stage token=top-secret key=also-secret run npm run demo:agent",
    ["top-secret", "also-secret"],
  );
  assert.match(sanitized, /\[redacted-path\]/);
  assert.doesNotMatch(sanitized, /top-secret|also-secret|\/Users\/example|\/tmp\/levelfield-stage|C:\\Users\\example\\stage/);
});

test("capture copy calls the agent result an assessment and explorer language only source verified", () => {
  assert.equal(CAPTURE_COPY.noOrderSubmitted, "No order submitted — assessment only.");
  assert.equal(CAPTURE_COPY.sourceVerified, "Source verified.");
  assert.equal(EXPLORER_EXPECTATIONS.verifiedExactText, "Contract source code verified (exact match)");
  assert.deepEqual(EXPLORER_EXPECTATIONS.requiredText, [
    "ScoreRegistry",
    "0xb8e11dea346F2c961880879606A269db3165BBc7",
    "Contract source code verified (exact match)",
  ]);
  assert.doesNotMatch(CAPTURE_COPY.sourceVerified, /complete|provenance/i);
});

test("npm evidence recognizes the real split workspace totals", () => {
  const transcript = [
    "Tests  65 passed (65)",
    "Tests  4 passed (4)",
  ].join("\n");
  assert.doesNotThrow(() => assertEvidenceCommand("npm-test", transcript));
  assert.throws(() => assertEvidenceCommand("npm-test", "69/69 tests"), /Missing required npm-test evidence/);
});

async function waitForRun(baseUrl, id, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const response = await fetch(`${baseUrl}/api/run/${id}`);
    const result = await response.json();
    if (result.status === "passed" || result.status === "failed") return result;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Timed out waiting for staged terminal run");
}

test("localhost-only stage visibly types only the fixed command and persists sanitized real-demo evidence", async (t) => {
  const outputDir = await mkdtemp(path.join(os.tmpdir(), "levelfield-terminal-stage-"));
  const stage = await createTerminalStageServer({
    repoRoot,
    outputDir,
    sourceEnv: { PATH: process.env.PATH ?? "", CAPTURE_TEST_SECRET: "do-not-leak" },
  });
  await stage.listen();
  t.after(async () => {
    await stage.close();
    await rm(outputDir, { recursive: true, force: true });
  });

  assert.match(stage.url, /^http:\/\/127\.0\.0\.1:\d+$/);
  const page = await fetch(`${stage.url}/`);
  const markup = await page.text();
  assert.match(markup, /No order submitted — assessment only\./);
  assert.doesNotMatch(markup, /\/Users\//);

  const session = await (await fetch(`${stage.url}/api/session`, { method: "POST" })).json();
  assert.equal(session.command, "npm run demo:agent");

  const rejected = await fetch(`${stage.url}/api/action/${session.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "typed-char", char: ";" }),
  });
  assert.equal(rejected.status, 409);

  for (const char of TERMINAL_DEMO_COMMAND.display) {
    const response = await fetch(`${stage.url}/api/action/${session.id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "typed-char", char }),
    });
    assert.equal(response.status, 204);
  }
  const completeTyping = await fetch(`${stage.url}/api/action/${session.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "typing-complete" }),
  });
  assert.equal(completeTyping.status, 204);

  const start = await fetch(`${stage.url}/api/run/${session.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ command: "echo arbitrary shell input is ignored" }),
  });
  assert.equal(start.status, 202);

  const result = await waitForRun(stage.url, session.id);
  assert.equal(result.status, "passed");
  assert.equal(result.exitCode, 0);
  assert.equal(result.command, "npm run demo:agent");
  assert.deepEqual(result.assertions, {
    stdio: true,
    snapshot: true,
    score3: true,
    score95: true,
    proceed: true,
    decline: true,
    cb1: true,
  });

  const [runDirectory] = await readdir(outputDir);
  const transcript = await readFile(path.join(outputDir, runDirectory, "transcript.txt"), "utf8");
  const actionLog = await readFile(path.join(outputDir, runDirectory, "actions.json"), "utf8");
  const hashLog = JSON.parse(await readFile(path.join(outputDir, runDirectory, "hashes.json"), "utf8"));
  assert.match(transcript, /Connected to the LevelField MCP server over stdio/);
  assert.match(transcript, /PROCEED \(3\/100 low\)/);
  assert.match(transcript, /DECLINE \(95\/100 high, CB-1:/);
  const artifacts = `${transcript}\n${actionLog}`;
  assert.doesNotMatch(artifacts, /do-not-leak|\/Users\//);
  assert.equal(artifacts.includes(repoRoot), false);
  assert.match(hashLog.transcriptSha256, /^[a-f0-9]{64}$/);
  assert.match(hashLog.actionsSha256, /^[a-f0-9]{64}$/);
});

test("localhost stage accepts only named capture aliases and stages the evidence sequence from its first fixed command", async (t) => {
  const outputDir = await mkdtemp(path.join(os.tmpdir(), "levelfield-terminal-alias-"));
  const stage = await createTerminalStageServer({ repoRoot: process.cwd(), outputDir, sourceEnv: { PATH: process.env.PATH ?? "" } });
  await stage.listen();
  t.after(async () => {
    await stage.close();
    await rm(outputDir, { recursive: true, force: true });
  });

  const unknown = await fetch(`${stage.url}/api/session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ alias: "arbitrary-shell-command" }),
  });
  assert.equal(unknown.status, 400);

  const evidence = await (await fetch(`${stage.url}/api/session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ alias: "evidence" }),
  })).json();
  assert.deepEqual(evidence, {
    id: evidence.id,
    alias: "evidence",
    command: "npm run validate",
    commandIndex: 0,
    commandCount: 5,
  });
  assert.match(evidence.id, /^[0-9a-f-]{36}$/);
});
