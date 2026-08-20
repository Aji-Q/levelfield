# LevelField hackathon deck

- `levelfield-hackathon-deck.pptx` — seven-slide 16:9 submission deck.
- `brief.txt` — concise narrative and fact guardrails.
- `build.mjs` — reproducible source for the PPTX. It uses the Codex workspace
  `@oai/artifact-tool` runtime and reads project assets from the repository root.

Every slide contains speaker notes with a `[Sources]` block. The deck separates
the DreamDEX Shannon score snapshot from the curated 95-point reference, calls
the MCP flow a pre-action policy gate rather than order execution, and marks
source-bound attestation republishing as pending.

Before submission, refresh the DreamDEX snapshot, republish and verify current
provenance against an immutable public commit, then regenerate any slide whose
status changed.

In a Codex workspace, rebuild with the bundled dependency path returned by
`load_workspace_dependencies`:

```bash
CODEX_WORKSPACE_NODE_MODULES="/path/to/workspace/node/node_modules" \
  node demo-deck/build.mjs
```
