# Capture-led LevelField demo video implementation plan

> **Goal:** Replace the rejected frame-by-frame storyboard render with a reproducible,
> 2–3 minute English product demo made primarily from recorded LevelField interactions.

> **Implemented result:** 173.563 seconds, 14 real browser/terminal/explorer clips,
> 100% authentic picture coverage, zero standalone slides, and 34 capture-pipeline tests.

## Non-negotiable gates

- The final-source timeline contains at least 85% recorded browser, terminal, or explorer
  video and no screenshots or output from `presentation/scripts/render-video.mjs`.
- The viewer sees real navigation, scrolling, clicking, paste/typing, command execution,
  and LevelField responses.
- DreamDEX is always a timestamped snapshot; the 3 score is DreamDEX and the 95 score
  is a separate curated reference; the MCP labels are policy decisions, not orders.
- Until immutable-SHA republishing succeeds, the explorer clip proves verified contract
  source only and the product keeps its visible `Legacy provenance` state.
- Export: 1920×1080, 30 fps, H.264/AAC, 120–180 seconds, about -16 LUFS and <= -1 dBTP.

## Task 1: Establish the capture package and executable contract

**Files**

- Add `demo-video/capture/package.json` and `package-lock.json`.
- Add `demo-video/capture/.gitignore`.
- Add `demo-video/capture/README.md`.
- Add `demo-video/capture/capture-manifest.json`.
- Add `demo-video/capture/fixtures/assess-reference.json` and
  `demo-video/capture/fixtures/assess-injection.json` from committed classifications.

**Tests first**

- Add `demo-video/capture/test/manifest.test.mjs`.
- Assert every timeline clip has an allowed kind, source-video extension, truth labels,
  required action IDs, positive duration, and total authentic coverage >=85%.
- Assert title/transition duration <=10 seconds and reject PNG/JPEG/presentation sources.

**Verify**

```bash
cd demo-video/capture
npm install
npm test
```

## Task 2: Build shared evidence and recording utilities

**Files**

- Add `demo-video/capture/scripts/lib/files.mjs` for SHA-256, JSON, run directories.
- Add `demo-video/capture/scripts/lib/actions.mjs` for monotonic action logging.
- Add `demo-video/capture/scripts/lib/cursor.mjs` for an injected visible cursor/click pulse.
- Add `demo-video/capture/scripts/lib/facts.mjs` for HEAD, score-cache timestamp, market
  IDs, provenance status, and immutable-URI checks.

**Tests first**

- Add `demo-video/capture/test/evidence.test.mjs` for stable transcript/file hashes,
  immutable GitHub URI detection, placeholder rejection, and facts serialization.

**Verify**

```bash
cd demo-video/capture && npm test
```

## Task 3: Record continuous real browser interactions

**Files**

- Add `demo-video/capture/scripts/capture-browser.mjs`.
- Add `demo-video/capture/scripts/browser-flows.mjs`.

**Behavior**

- Use Playwright `recordVideo` at 1920×1080 with UTC/en-US and system Chrome fallback.
- Record continuous WebM clips for:
  1. homepage scroll, visible snapshot timestamp, DreamDEX score-3 click;
  2. market evidence expansion, curated score-95 click, CB-1 and caveats;
  3. Methodology navigation and five-dimension/scoring scroll;
  4. Assess preset, prepared protocol-compatible JSON paste, verify, 95/CB-1 result;
  5. injected/missing evidence rejection.
- Log each real action and required visible assertion; fail if selectors/results drift.
- Do not capture Next development overlays: default to a production server URL.

**Verify**

```bash
cd demo-video/capture
npm run capture:browser -- --base-url http://127.0.0.1:3000
```

## Task 4: Record a real terminal/MCP policy flow

**Files**

- Add `demo-video/capture/scripts/terminal-stage-server.mjs`.
- Add `demo-video/capture/scripts/capture-terminal.mjs`.
- Add `demo-video/capture/scripts/lib/commands.mjs`.

**Behavior**

- A localhost-only browser terminal visibly types a fixed allowlisted command, executes
  it in the repository, and streams its real stdout/stderr.
- Essential command: `npm run demo:agent`; require visible stdio connection, snapshot
  timestamp, `PROCEED`, `DECLINE`, `3/100`, `95/100`, and CB-1.
- Store command, UTC, exit code, transcript, and SHA-256; render no `.env`, wallet,
  token, hostname, or personal absolute path.
- Label the result `Example pre-action policy — no order submitted`.

**Tests first**

- Add `demo-video/capture/test/commands.test.mjs` for allowlist enforcement, output
  redaction, transcript checks, and rejection of arbitrary shell input.

**Verify**

```bash
cd demo-video/capture
npm test
npm run capture:terminal -- mcp-policy --output-dir runs/RUN_ID/terminal
```

## Task 5: Record the public Somnia explorer truthfully

**Files**

- Add `demo-video/capture/scripts/capture-explorer.mjs`.

**Behavior**

- Open the public Shannon registry URL in a clean Playwright context.
- Click `Contract`; require `Contract source code verified (exact match)`,
  `ScoreRegistry`, and the deployed address.
- Record source verification only while current score provenance is legacy.
- When Claude reports immutable-SHA republishing, require a successful local
  `verify:onchain` evidence record before allowing provenance-complete narration.

**Verify**

```bash
cd demo-video/capture && npm run capture:explorer -- --output-dir runs/RUN_ID/explorer
```

## Task 6: Compose the capture-led preview and rebuild captions

**Files**

- Add `demo-video/capture/edit-manifest.json`.
- Add `demo-video/capture/scripts/compose.mjs`.
- Add `demo-video/capture/scripts/captions.mjs`.
- Add/update the capture-led English narration and SRT only as required by actual shots.

**Behavior**

- Normalize raw clips to 1080p30/yuv420p, cut and concatenate recorded interaction,
  add only brief lower-thirds/spotlights/zooms, and mix the current offline narration.
- Keep the real product or terminal visible beneath every title except a <=3-second open.
- Use a two-pass loudness target near -16 LUFS, true peak <=-1 dBTP.
- Replace `demo-video/levelfield-demo-preview.mp4` only after verification succeeds.
- Produce `demo-video/levelfield-demo-final.mp4` only after ElevenLabs credentials and
  approved voice ID exist and the entire QA pipeline is rerun.

**Verify**

```bash
cd demo-video/capture
npm run compose:preview -- --run RUN_ID
npm run captions
```

## Task 7: Add machine and visual QA

**Files**

- Add `demo-video/capture/scripts/verify-final.mjs`.
- Add `demo-video/capture/scripts/contact-sheet.mjs`.
- Generate `demo-video/capture/evidence-manifest.json` and
  `demo-video/capture/qa/README.md` for the accepted run.

**Checks**

- ffprobe codec/resolution/fps/duration/audio.
- loudnorm readback, blank-frame scan, SRT monotonicity and end-time bound; perform
  silence/motion review during the independent visual pass.
- authentic coverage, interaction action IDs, command exit/hash, required assertions,
  source labels, snapshot timestamp, and provenance truth state.
- reject images, presentation-render sources, duplicate/frozen scene-card behavior.
- Generate a 21-frame contact sheet and perform an independent reviewer pass.

**Verify**

```bash
cd demo-video/capture
npm run verify:final -- --run RUN_ID
npm run contact-sheet -- --run RUN_ID
```

## Task 8: Repository gates, handoff, and final pickups

1. Run all capture tests and accepted-run QA.
2. Run the AGENTS gates:

```bash
npm test
npx tsc --noEmit -p packages/scoring/tsconfig.json
rm -rf apps/web/.next && npm run build -w @levelfield/web
npx tsx scripts/verify-classifications.ts
```

3. Independently review the complete MP4 at desktop and mobile playback sizes.
4. Re-read `docs/collab/inbox-codex.md` immediately before commit.
5. Commit only Codex-owned files with `OpenAI Codex <noreply@openai.com>` attribution.
6. Write a newest-first DONE entry to `docs/collab/inbox-claude.md` with exact runtime,
   interaction coverage, codecs, checksums, QA results, and pending external pickups.
7. After Claude supplies a public repository/immutable SHA republish or a recording-day
   DreamDEX refresh, replace only the corresponding shots and rerun every gate.
