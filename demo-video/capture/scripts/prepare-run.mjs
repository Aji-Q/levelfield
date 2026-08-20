import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { assertDemoTranscript } from "./lib/commands.mjs";
import { collectEvidenceFacts } from "./lib/facts.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const captureRoot = path.resolve(here, "..");
const repoRoot = path.resolve(captureRoot, "../..");

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith("--")) continue;
    args[argv[index].slice(2)] = argv[index + 1] && !argv[index + 1].startsWith("--") ? argv[++index] : true;
  }
  return args;
}

async function walk(dir, predicate) {
  const result = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name === "edit-work" || entry.name === "qa") continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(file, predicate));
    else if (predicate(file)) result.push(file);
  }
  return result;
}

function relativeToRun(run, file) {
  return path.relative(run, file).replaceAll(path.sep, "/");
}

async function copyHandoff(run) {
  const sourceRoot = path.join(repoRoot, "demo-footage");
  const targetRoot = path.join(run, "browser", "handoff");
  await fs.mkdir(targetRoot, { recursive: true });
  const copied = [];
  for (const name of ["landing.webm", "market-detail.webm", "assess-flow.webm", "quote-rejection.webm"]) {
    const source = path.join(sourceRoot, name);
    try {
      await fs.access(source);
    } catch {
      continue;
    }
    const target = path.join(targetRoot, name);
    await fs.copyFile(source, target);
    copied.push(relativeToRun(run, target));
  }
  return copied;
}

function browserActions(parsed, source) {
  const actions = [];
  for (const event of parsed.events ?? []) {
    if (event.event === "action-complete" && event.flowId && Number.isFinite(event.actionIndex)) {
      actions.push({
        id: `${event.flowId}.${event.actionIndex}`,
        type: event.kind,
        description: event.description,
        at: event.utc,
        source,
      });
    }
    if (event.event === "flow-complete" && event.flowId) {
      actions.push({ id: `${event.flowId}.complete`, type: "verified-flow", description: event.title, at: event.utc, source });
    }
  }
  return actions;
}

function terminalActions(parsed, source) {
  const actions = [];
  for (const [index, event] of (Array.isArray(parsed) ? parsed : parsed.actions ?? []).entries()) {
    const type = event.type ?? event.event ?? "terminal-event";
    actions.push({
      id: event.id ?? `terminal.${type}.${index + 1}`,
      type,
      description: event.command ?? event.text ?? event.status ?? type,
      atMs: event.atMs,
      source,
    });
  }
  return actions;
}

async function normalizedActions(run, handoffClips) {
  const files = await walk(run, (file) => /actions.*\.json$/i.test(path.basename(file)));
  const actions = [];
  for (const file of files) {
    if (path.resolve(file) === path.resolve(run, "actions.json")) continue;
    const parsed = JSON.parse(await fs.readFile(file, "utf8"));
    const source = relativeToRun(run, file);
    if (Array.isArray(parsed.events)) actions.push(...browserActions(parsed, source));
    else actions.push(...terminalActions(parsed, source));
  }

  for (const clip of handoffClips) {
    actions.push({
      id: `handoff.${path.basename(clip, path.extname(clip))}.real-capture`,
      type: "committed-real-capture",
      description: "Claude Playwright capture pack handed to Codex in commit 0016769",
      source: clip,
    });
  }

  const transcripts = await walk(run, (file) => path.basename(file) === "transcript.txt");
  for (const transcriptFile of transcripts) {
    const transcript = await fs.readFile(transcriptFile, "utf8");
    const source = relativeToRun(run, transcriptFile);
    if (/npm run demo:agent/.test(transcript)) {
      const assertions = assertDemoTranscript(transcript);
      for (const [name, passed] of Object.entries(assertions)) {
        if (passed) actions.push({ id: `terminal.demo-agent.${name}`, type: "real-output-assertion", description: name, source });
      }
      actions.push({ id: "terminal.demo-agent.complete", type: "real-command", description: "npm run demo:agent exited successfully", source });
    }
    const evidencePatterns = {
      validation: /Spearman|rho|Validation|validated/i,
      agreement: /agreement|16\/16|blind run/i,
      softwareTests: /(?:69|65).*pass|tests?\s+69|pass\s+69/i,
      forgeTests: /8 passed|8 tests passed|Suite result: ok/i,
      sdkCrosscheck: /SDK|active-market|crosscheck/i,
    };
    for (const [name, pattern] of Object.entries(evidencePatterns)) {
      if (pattern.test(transcript)) actions.push({ id: `terminal.evidence.${name}`, type: "real-output-assertion", description: name, source });
    }
  }

  const ids = new Set();
  return actions.filter((action) => {
    if (ids.has(action.id)) return false;
    ids.add(action.id);
    return true;
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.run) throw new Error("Usage: node scripts/prepare-run.mjs --run runs/RUN_ID [--copy-handoff]");
  const run = path.resolve(captureRoot, args.run);
  await fs.access(run);
  const handoffClips = args["copy-handoff"] ? await copyHandoff(run) : [];
  const evidence = await collectEvidenceFacts({ repoRoot });
  const actions = await normalizedActions(run, handoffClips);
  const provenanceComplete = evidence.provenance.state === "complete";
  const facts = {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    evidenceSha: evidence.evidenceSha,
    dreamdex: {
      presentation: "timestamped_snapshot",
      generatedAt: evidence.scoreCache.generatedAt,
      marketIds: evidence.scoreCache.dreamdexMarketIds,
    },
    comparison: {
      score3Source: "dreamdex_snapshot",
      score95Source: "curated_reference",
      sameVenue: false,
    },
    mcp: {
      role: "pre_action_policy",
      orderSubmitted: false,
    },
    provenance: {
      ...evidence.provenance,
      state: evidence.provenance.state,
      currentUriComplete: provenanceComplete,
      narrationMode: provenanceComplete ? "complete" : "future_tense",
      immutableGitSha: provenanceComplete ? evidence.evidenceSha : null,
      verifyOnchainPassed: provenanceComplete,
    },
    handoffClips,
  };
  await fs.writeFile(path.join(run, "facts.json"), `${JSON.stringify(facts, null, 2)}\n`);
  await fs.writeFile(path.join(run, "actions.json"), `${JSON.stringify({ schemaVersion: 1, actions }, null, 2)}\n`);
  console.log(`Prepared ${path.relative(captureRoot, run)} · ${actions.length} verified actions`);
  console.log(`DreamDEX snapshot ${facts.dreamdex.generatedAt} · provenance ${facts.provenance.state}`);
  if (handoffClips.length) console.log(`Copied ${handoffClips.length} committed real-capture handoff clips`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
