import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const SAFE_RUN_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function assertSafeRunId(runId) {
  if (typeof runId !== "string" || !SAFE_RUN_ID.test(runId)) {
    throw new Error(`Expected a safe capture run id, received ${JSON.stringify(runId)}.`);
  }
  return runId;
}

export async function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export function serializeJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, serializeJson(value), "utf8");
  await rename(temporaryPath, filePath);
}

export async function createRunDirectory(runsRoot, runId) {
  assertSafeRunId(runId);
  const safeRunsRoot = path.resolve(runsRoot);
  const root = path.resolve(safeRunsRoot, runId);
  if (!root.startsWith(`${safeRunsRoot}${path.sep}`)) {
    throw new Error(`Capture run id resolves outside runs root: ${JSON.stringify(runId)}.`);
  }

  const directories = {
    id: runId,
    root,
    browser: path.join(root, "browser"),
    terminal: path.join(root, "terminal"),
    explorer: path.join(root, "explorer"),
    graphics: path.join(root, "graphics"),
  };
  await Promise.all(Object.values(directories).filter((value) => value !== runId).map((dir) => mkdir(dir, { recursive: true })));
  return directories;
}
