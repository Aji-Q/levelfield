import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createActionLogger, writeActionLog } from "../scripts/lib/actions.mjs";
import { installVisibleCursor, moveVisibleCursor, CURSOR_OVERLAY_ID } from "../scripts/lib/cursor.mjs";
import { createRunDirectory, readJson, sha256File, writeJson } from "../scripts/lib/files.mjs";
import {
  collectEvidenceFacts,
  getProvenanceStatus,
  isImmutableGitHubUri,
  serializeFacts,
} from "../scripts/lib/facts.mjs";

async function tempDir(prefix) {
  return mkdtemp(path.join(os.tmpdir(), prefix));
}

function immutableUri(marketId) {
  return `https://github.com/acme/levelfield/blob/${"a".repeat(40)}/data/scores/${marketId}.json`;
}

test("files utilities produce stable hashes, JSON, and a bounded capture run directory", async (t) => {
  const root = await tempDir("levelfield-capture-files-");
  t.after(() => rm(root, { recursive: true, force: true }));

  const sample = path.join(root, "sample.txt");
  await writeFile(sample, "LevelField\n", "utf8");
  assert.equal(
    await sha256File(sample),
    "9e7dd224d46efa76f9cda56d546b1e6da09a3b05255bb2789fccabcb9d545373",
  );

  const jsonPath = path.join(root, "facts.json");
  await writeJson(jsonPath, { stable: true, count: 2 });
  assert.deepEqual(await readJson(jsonPath), { stable: true, count: 2 });

  const run = await createRunDirectory(path.join(root, "runs"), "20260820T120000Z-capture");
  assert.equal(run.id, "20260820T120000Z-capture");
  assert.match(run.root, /runs\/20260820T120000Z-capture$/);
  assert.ok(run.browser.endsWith("/browser"));
  assert.ok(run.terminal.endsWith("/terminal"));
  assert.ok(run.explorer.endsWith("/explorer"));
  await assert.rejects(
    () => createRunDirectory(path.join(root, "runs"), "../outside"),
    /safe capture run id/i,
  );
});

test("action logger records unique monotonic visible actions and serializes a reproducible transcript", async (t) => {
  const wallTimes = ["2026-08-20T12:00:00.000Z", "2026-08-20T12:00:00.001Z"];
  const monoTimes = [10, 4];
  const logger = createActionLogger({
    now: () => wallTimes.shift(),
    monotonicNow: () => monoTimes.shift(),
  });

  logger.record({ id: "landing.scroll", type: "scroll", target: "#dreamdex-snapshot" });
  logger.record({ id: "landing.click", type: "click", target: "DreamDEX market" });
  assert.deepEqual(logger.toJSON(), {
    schemaVersion: 1,
    actions: [
      {
        id: "landing.scroll",
        sequence: 1,
        type: "scroll",
        target: "#dreamdex-snapshot",
        at: "2026-08-20T12:00:00.000Z",
        elapsedMs: 0,
      },
      {
        id: "landing.click",
        sequence: 2,
        type: "click",
        target: "DreamDEX market",
        at: "2026-08-20T12:00:00.001Z",
        elapsedMs: 0,
      },
    ],
  });
  assert.throws(
    () => logger.record({ id: "landing.click", type: "click", target: "duplicate" }),
    /duplicate action id/i,
  );

  const protectedFields = createActionLogger({
    now: () => "2026-08-20T12:01:00.000Z",
    monotonicNow: () => 42,
  });
  const protectedAction = protectedFields.record({
    id: "landing.protected",
    type: "assert",
    target: "Score readout",
    sequence: 999,
    elapsedMs: 999,
    at: "2020-01-01T00:00:00.000Z",
  });
  assert.deepEqual(protectedAction, {
    id: "landing.protected",
    sequence: 1,
    type: "assert",
    target: "Score readout",
    at: "2026-08-20T12:01:00.000Z",
    elapsedMs: 0,
  });

  const root = await tempDir("levelfield-capture-actions-");
  t.after(() => rm(root, { recursive: true, force: true }));
  const logPath = path.join(root, "actions.json");
  await writeActionLog(logPath, logger);
  assert.deepEqual(JSON.parse(await readFile(logPath, "utf8")), logger.toJSON());
});

test("cursor helpers install a visible overlay and send move/click state through Playwright", async () => {
  const initScripts = [];
  const evaluations = [];
  const page = {
    addInitScript: async (script) => initScripts.push(script),
    evaluate: async (fn, payload) => evaluations.push({ fn: String(fn), payload }),
  };

  await installVisibleCursor(page);
  await moveVisibleCursor(page, { x: 960, y: 540, click: true });

  assert.equal(initScripts.length, 1);
  assert.match(initScripts[0].content, new RegExp(CURSOR_OVERLAY_ID));
  assert.deepEqual(evaluations[0].payload, { x: 960, y: 540, click: true });
  assert.match(evaluations[0].fn, /__levelFieldCaptureCursor/);
});

test("immutable GitHub provenance rejects placeholders and facts preserve snapshot/provenance truth", async (t) => {
  const dreamdexId = "dreamdex-btc";
  const curatedId = "curated-reference";
  assert.equal(isImmutableGitHubUri(immutableUri(dreamdexId)), true);
  assert.equal(isImmutableGitHubUri(`https://github.com/owner/repo/blob/${"a".repeat(40)}/score.json`), false);
  assert.equal(isImmutableGitHubUri("https://github.com/acme/levelfield/blob/main/score.json"), false);
  assert.equal(isImmutableGitHubUri("https://example.com/placeholder"), false);

  const index = {
    generatedAt: "2026-08-20T12:00:00.000Z",
    markets: [
      { marketId: dreamdexId, source: "dreamdex_testnet", overallScore: 3, band: "low" },
      { marketId: curatedId, source: "curated", overallScore: 95, band: "high" },
    ],
  };
  const onchain = {
    registryAddress: "0xb8e11dea346f2c961880879606a269db3165bbc7",
    chainId: 50312,
    verifiedAt: "2026-08-20T12:01:00.000Z",
    markets: {
      [dreamdexId]: { matchesCache: true, uri: immutableUri(dreamdexId) },
      [curatedId]: { matchesCache: true, uri: immutableUri(curatedId) },
    },
  };
  assert.deepEqual(getProvenanceStatus(index, onchain), {
    state: "complete",
    indexedCount: 2,
    indexedAttestationCount: 2,
    indexedMatchCount: 2,
    missingAttestationCount: 0,
    invalidUriCount: 0,
    unmatchedCount: 0,
  });

  const root = await tempDir("levelfield-capture-facts-");
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeJson(path.join(root, "data", "scores", "index.json"), index);
  await writeJson(path.join(root, "data", "scores", "onchain.json"), onchain);
  const facts = await collectEvidenceFacts({
    repoRoot: root,
    head: "b".repeat(40),
    capturedAt: "2026-08-20T12:02:00.000Z",
  });

  assert.equal(facts.evidenceSha, "b".repeat(40));
  assert.equal(facts.scoreCache.label, "timestamped_snapshot");
  assert.deepEqual(facts.scoreCache.dreamdexMarketIds, [dreamdexId]);
  assert.deepEqual(facts.scoreCache.curatedMarketIds, [curatedId]);
  assert.equal(facts.provenance.state, "complete");
  assert.deepEqual(JSON.parse(serializeFacts(facts)), facts);
  assert.match(serializeFacts(facts), /\n$/);
});
