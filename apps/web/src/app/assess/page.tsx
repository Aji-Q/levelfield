// Server component wrapper for the zero-API interactive assessment flow (docs/design/no-api.md,
// "MCP protocol" — this page is that protocol's human-facing twin). It does the one thing the
// client isn't allowed to do — load data/anchors/anchors.yaml off disk and render the Stage A
// system prompt from it — then hands the client only serializable props: strings and JSON.
// packages/scoring/src/anchors.ts uses node:fs (loadAnchors), so it must never be imported from
// AssessClient ("use client"); see packages/scoring/package.json's subpath exports.
import path from "node:path";
import { buildSystemPrompt, loadAnchors } from "@levelfield/scoring/anchors";
import { findRepoRoot } from "@/lib/repo-root";
import { AssessClient } from "./AssessClient";

export default function AssessPage() {
  const anchorLibrary = loadAnchors(path.join(findRepoRoot(), "data", "anchors", "anchors.yaml"));
  const systemPrompt = buildSystemPrompt(anchorLibrary);

  return (
    <AssessClient
      systemPrompt={systemPrompt}
      anchorLibrary={anchorLibrary}
      anchorVersion={anchorLibrary.version}
    />
  );
}
