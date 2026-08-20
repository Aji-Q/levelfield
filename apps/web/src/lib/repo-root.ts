// Locates the monorepo root from wherever this app's process happens to run.
// `npm run dev -w @levelfield/web` from the repo root sets cwd to apps/web;
// running `next dev`/`next build` directly from apps/web does too. Either way
// we walk up looking for the one file that unambiguously marks the repo root:
// the anchor library, which every worker treats as the single source of truth.

import { existsSync } from "node:fs";
import path from "node:path";

const MARKER = path.join("data", "anchors", "anchors.yaml");
const MAX_LEVELS_UP = 8;

export function findRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < MAX_LEVELS_UP; i++) {
    if (existsSync(path.join(dir, MARKER))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    `Could not locate the levelfield repo root (looked for ${MARKER} walking up from ${process.cwd()}). ` +
      "Run this app from within the levelfield repo, e.g. `npm run dev -w @levelfield/web` from the repo root.",
  );
}
