import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const artifactToolSpecifier = process.env.CODEX_WORKSPACE_NODE_MODULES
  ? pathToFileURL(
      path.join(
        process.env.CODEX_WORKSPACE_NODE_MODULES,
        "@oai/artifact-tool/dist/artifact_tool.mjs",
      ),
    ).href
  : "@oai/artifact-tool";
const { Presentation, PresentationFile } = await import(artifactToolSpecifier);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP = path.join(ROOT, "demo-deck/.tmp");
const OUT = path.join(ROOT, "demo-deck/levelfield-hackathon-deck.pptx");
const W = 1280;
const H = 720;

const C = {
  shell: "#0A0A08",
  bg: "#0F0F0C",
  bg2: "#171610",
  bg3: "#211F18",
  text: "#EEEAE1",
  text2: "#D8D2C6",
  muted: "#8C8579",
  faint: "#544F47",
  rule: "#343128",
  brass: "#D0A24C",
};

async function bytes(rel) {
  const b = await fs.readFile(path.join(ROOT, rel));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

function text(slide, value, position, style = {}, name) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name,
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = value;
  shape.text.style = {
    fontSize: 20,
    color: C.text,
    verticalAlignment: "top",
    autoFit: "shrinkText",
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
    ...style,
  };
  return shape;
}

function rect(slide, position, fill = C.bg2, lineFill = "none", lineWidth = 0, name) {
  return slide.shapes.add({
    geometry: "rect",
    name,
    position,
    fill,
    line: { style: "solid", fill: lineFill, width: lineWidth },
  });
}

function rule(slide, left, top, width, fill = C.rule, height = 1) {
  return rect(slide, { left, top, width, height }, fill);
}

function chrome(slide, n, section) {
  text(slide, section.toUpperCase(), { left: 72, top: 32, width: 520, height: 22 }, {
    fontSize: 11, bold: true, color: C.brass,
  });
  text(slide, String(n).padStart(2, "0"), { left: 1190, top: 32, width: 28, height: 22 }, {
    fontSize: 11, bold: true, color: C.muted, alignment: "right",
  });
  rule(slide, 72, 60, 1136, C.rule, 1);
}

function notes(slide, talk, sources) {
  slide.speakerNotes.textFrame.setText(`${talk}\n\n[Sources]\n${sources.map((s) => `- ${s}`).join("\n")}`);
  slide.speakerNotes.setVisible(true);
}

async function addImage(slide, rel, position, alt, options = {}) {
  const ext = path.extname(rel).toLowerCase();
  const contentType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  return slide.images.add({
    blob: await bytes(rel),
    contentType,
    alt,
    fit: options.fit ?? "cover",
    crop: options.crop,
    position,
  });
}

const p = Presentation.create({ slideSize: { width: W, height: H } });

// 01 — Opening
{
  const s = p.slides.add();
  s.background.fill = C.bg;
  await addImage(s, "apps/web/public/brand/levelfield-risk-field.webp", { left: 600, top: 0, width: 680, height: 720 }, "LevelField brass measuring instrument over a topographic information field", { fit: "cover", crop: { left: 0.08, top: 0, right: 0.02, bottom: 0 } });
  rect(s, { left: 0, top: 0, width: 652, height: 720 }, C.bg);
  rule(s, 72, 64, 178, C.brass, 2);
  text(s, "SOMNIA × DREAMDEX", { left: 72, top: 88, width: 360, height: 30 }, { fontSize: 13, bold: true, color: C.brass }, "event-label");
  text(s, "Know who may know\nbefore you do.", { left: 72, top: 170, width: 560, height: 220 }, { fontSize: 66, color: C.text }, "title");
  text(s, "Pre-trade structural information-asymmetry assessment\nfor DreamDEX event contracts.", { left: 76, top: 430, width: 475, height: 96 }, { fontSize: 23, color: C.text2 }, "subtitle");
  text(s, "LevelField", { left: 76, top: 634, width: 260, height: 36 }, { fontSize: 24, bold: true, color: C.text }, "brand");
  notes(s,
    "Open on the risk the price cannot show. LevelField assesses the structure of who may know first before a trader or agent takes a side. It does not predict YES or allege wrongdoing.",
    [
      "README.md",
      "docs/design/brand-spec.md",
      "apps/web/public/brand/levelfield-risk-field.webp",
    ],
  );
}

// 02 — Price insufficiency
{
  const s = p.slides.add();
  s.background.fill = C.bg;
  chrome(s, 2, "The missing field");
  text(s, "A market price does not reveal\nwho may know first.", { left: 72, top: 94, width: 780, height: 110 }, { fontSize: 45, color: C.text }, "title");
  text(s, "Price expresses belief. It does not describe the event’s information structure.", { left: 76, top: 212, width: 700, height: 54 }, { fontSize: 20, color: C.text2 }, "subtitle");

  rect(s, { left: 72, top: 306, width: 1136, height: 338 }, C.bg2, C.rule, 1);
  await addImage(s, "output/playwright/home-desktop.png", { left: 73, top: 307, width: 640, height: 336 }, "Real LevelField homepage capture showing the product hero and the structural-risk comparison", { fit: "cover", crop: { left: 0, top: 0, right: 0, bottom: 0.65 } });
  rect(s, { left: 713, top: 307, width: 495, height: 336 }, C.bg2);
  text(s, "PRICE", { left: 762, top: 350, width: 170, height: 34 }, { fontSize: 16, bold: true, color: C.muted }, "price-label");
  text(s, "belief", { left: 760, top: 390, width: 220, height: 80 }, { fontSize: 56, color: C.text }, "belief");
  rule(s, 760, 488, 392, C.rule, 1);
  text(s, "INFORMATION FIELD", { left: 760, top: 512, width: 260, height: 34 }, { fontSize: 16, bold: true, color: C.brass }, "field-label");
  text(s, "who might know first", { left: 760, top: 552, width: 392, height: 50 }, { fontSize: 27, color: C.text2 }, "field-copy");
  notes(s,
    "This is the core product tension. A price aggregates belief about an outcome; it does not show whether an outcome is public, privately controlled, or disclosed unevenly.",
    [
      "demo-video/article.md",
      "README.md",
      "output/playwright/home-desktop.png",
    ],
  );
}

// 03 — 3 versus 95
{
  const s = p.slides.add();
  s.background.fill = C.bg;
  chrome(s, 3, "Concrete contrast");
  text(s, "The same scoring engine separates 3 from 95.", { left: 72, top: 92, width: 1050, height: 64 }, { fontSize: 43, color: C.text }, "title");
  text(s, "It measures information structure—not the probability of YES.", { left: 76, top: 164, width: 700, height: 38 }, { fontSize: 20, color: C.text2 }, "subtitle");

  rect(s, { left: 72, top: 242, width: 1136, height: 390 }, C.shell, C.rule, 1);
  await addImage(s, "demo-video/presentation/public/assets/home-3-vs-95.png", { left: 86, top: 254, width: 1108, height: 366 }, "Real LevelField comparison capture with a DreamDEX snapshot scored 3 and a curated individual-decision reference scored 95", { fit: "cover", crop: { left: 0.07, top: 0.20, right: 0.04, bottom: 0.36 } });
  text(s, "DREAMDEX SHANNON SNAPSHOT", { left: 90, top: 646, width: 330, height: 20 }, { fontSize: 11, bold: true, color: C.muted }, "low-caption");
  text(s, "CURATED REFERENCE CONTRACT", { left: 862, top: 646, width: 330, height: 20 }, { fontSize: 11, bold: true, color: C.muted, alignment: "right" }, "high-caption");
  notes(s,
    "The low case is a DreamDEX Shannon price-binary snapshot; the high case is a curated reference contract, not the same venue. The same deterministic engine yields 3 versus 95. CB-1 applies to the individual-decision case because one person controls the outcome and no clear restriction prevents early trading.",
    [
      "data/scores/index.json",
      "data/scores/curated-celebrity-breakup.json",
      "data/curated/celebrity-breakup.json",
      "demo-video/presentation/public/assets/home-3-vs-95.png",
      "Command: npm run score:all (refresh before final capture)",
    ],
  );
}

// 04 — Trust model
{
  const s = p.slides.add();
  s.background.fill = C.bg;
  chrome(s, 4, "Trust model");
  text(s, "Model classifies. Code decides.", { left: 72, top: 92, width: 900, height: 60 }, { fontSize: 46, color: C.text }, "title");
  text(s, "Public anchors  →  verified quotes  →  deterministic score", { left: 76, top: 166, width: 760, height: 38 }, { fontSize: 20, bold: true, color: C.brass }, "flow");

  rect(s, { left: 72, top: 245, width: 575, height: 405 }, C.shell, C.rule, 1);
  await addImage(s, "output/playwright/assess-result.png", { left: 73, top: 246, width: 573, height: 403 }, "Real LevelField assess workspace capture with a deterministic 3 out of 100 result", { fit: "cover", crop: { left: 0.02, top: 0.47, right: 0.02, bottom: 0.07 } });

  text(s, "01", { left: 704, top: 258, width: 40, height: 32 }, { fontSize: 14, bold: true, color: C.brass }, "d1");
  text(s, "Verbatim evidence", { left: 754, top: 254, width: 430, height: 40 }, { fontSize: 26, color: C.text }, "evidence");
  text(s, "Every non-empty quote must occur in the contract text.", { left: 754, top: 300, width: 420, height: 52 }, { fontSize: 18, color: C.text2 }, "evidence-body");
  rule(s, 704, 374, 470, C.rule, 1);
  text(s, "02", { left: 704, top: 402, width: 40, height: 32 }, { fontSize: 14, bold: true, color: C.brass }, "d2");
  text(s, "Instruction-like overlap rejected", { left: 754, top: 398, width: 430, height: 42 }, { fontSize: 24, color: C.text }, "reject");
  text(s, "Targeted scanner—not a claim of universal prompt-injection immunity.", { left: 754, top: 448, width: 420, height: 54 }, { fontSize: 18, color: C.text2 }, "reject-body");
  rule(s, 704, 522, 470, C.rule, 1);
  text(s, "03", { left: 704, top: 550, width: 40, height: 32 }, { fontSize: 14, bold: true, color: C.brass }, "d3");
  text(s, "Missing information → Level 4", { left: 754, top: 546, width: 430, height: 42 }, { fontSize: 24, color: C.text }, "missing");
  text(s, "The model never generates the numeric score.", { left: 754, top: 596, width: 420, height: 34 }, { fontSize: 18, bold: true, color: C.brass }, "code-boundary");
  notes(s,
    "The public anchor library defines five structural dimensions. A model classifies evidence, but code verifies quotes, rejects overlap with targeted instruction-like text, applies conservative defaults, and computes every number through fixed weights, cross-dimension rules, and circuit breakers.",
    [
      "packages/scoring/src/verify.ts",
      "packages/scoring/src/engine.ts",
      "packages/mcp/src/server.ts",
      "data/curated/injection-test.json",
      "output/playwright/assess-result.png",
    ],
  );
}

// 05 — Agent policy
{
  const s = p.slides.add();
  s.background.fill = C.bg;
  chrome(s, 5, "Agent policy");
  text(s, "A transparent policy turns a score into a decision.", { left: 72, top: 92, width: 1040, height: 62 }, { fontSize: 43, color: C.text }, "title");
  text(s, "Real LevelField MCP call over stdio · pre-action gate · no order submitted", { left: 76, top: 164, width: 900, height: 34 }, { fontSize: 18, color: C.muted }, "subtitle");

  rect(s, { left: 72, top: 238, width: 1136, height: 392 }, C.shell, C.rule, 1);
  text(s, "$ npm run demo:agent", { left: 100, top: 266, width: 430, height: 34 }, { fontSize: 17, bold: true, color: C.brass }, "command");
  text(s, "Connected to the LevelField MCP server over stdio", { left: 100, top: 312, width: 620, height: 32 }, { fontSize: 17, color: C.text2 }, "connected");
  rule(s, 100, 366, 1080, C.rule, 1);

  text(s, "3", { left: 110, top: 402, width: 110, height: 106 }, { fontSize: 82, color: C.text }, "low-score");
  text(s, "/100  LOW", { left: 218, top: 456, width: 140, height: 34 }, { fontSize: 16, bold: true, color: C.muted }, "low-band");
  text(s, "PROCEED", { left: 390, top: 424, width: 230, height: 62 }, { fontSize: 36, bold: true, color: C.brass }, "proceed");

  rule(s, 640, 397, 1, C.rule, 190);
  text(s, "95", { left: 682, top: 402, width: 150, height: 106 }, { fontSize: 82, color: C.text }, "high-score");
  text(s, "/100  HIGH · CB-1", { left: 822, top: 456, width: 180, height: 34 }, { fontSize: 16, bold: true, color: C.muted }, "high-band");
  text(s, "DECLINE", { left: 1004, top: 424, width: 178, height: 62 }, { fontSize: 34, bold: true, color: C.text }, "decline");
  text(s, "Reason attached: one person decides the outcome and faces no effective trading restriction.", { left: 682, top: 528, width: 500, height: 62 }, { fontSize: 17, color: C.text2 }, "reason");
  notes(s,
    "This is a reproducible MCP stdio demo with a fixed, visible policy. Low or moderate may proceed; elevated or high is declined. It is a policy gate before action, not DreamDEX order execution or autonomous trading integration.",
    [
      "scripts/agent-demo.ts",
      "data/scores/index.json",
      "Command: npm run demo:agent",
    ],
  );
}

// 06 — Bounded proof and chain state
{
  const s = p.slides.add();
  s.background.fill = C.bg;
  chrome(s, 6, "Bounded evidence");
  text(s, "The evidence is repeatable—and bounded.", { left: 72, top: 92, width: 930, height: 62 }, { fontSize: 44, color: C.text }, "title");
  text(s, "Internal consistency on a curated set; not proof of live insider-activity prediction.", { left: 76, top: 164, width: 920, height: 34 }, { fontSize: 18, color: C.muted }, "subtitle");

  const xs = [72, 420, 768];
  const metrics = [
    ["0.930", "SPEARMAN ρ", "n = 16 curated contracts"],
    ["16 / 16", "BAND MATCH", "three blind classifier runs"],
    ["69 + 8", "TESTS PASSED", "software + smart-contract tests"],
  ];
  metrics.forEach((m, i) => {
    if (i > 0) rule(s, xs[i] - 28, 258, 1, C.rule, 220);
    text(s, m[0], { left: xs[i], top: 246, width: 310, height: 90 }, { fontSize: i === 0 ? 70 : 62, color: C.text }, `metric-${i}`);
    text(s, m[1], { left: xs[i] + 2, top: 350, width: 280, height: 30 }, { fontSize: 14, bold: true, color: C.brass }, `metric-label-${i}`);
    text(s, m[2], { left: xs[i] + 2, top: 393, width: 280, height: 52 }, { fontSize: 17, color: C.text2 }, `metric-body-${i}`);
  });

  rect(s, { left: 72, top: 516, width: 1136, height: 132 }, C.bg2, C.rule, 1);
  text(s, "SOMNIA SHANNON", { left: 100, top: 544, width: 220, height: 24 }, { fontSize: 13, bold: true, color: C.brass }, "chain");
  text(s, "ScoreRegistry deployed", { left: 100, top: 578, width: 310, height: 34 }, { fontSize: 24, color: C.text }, "registry-state");
  text(s, "0xb8e11d…5bbc7", { left: 442, top: 580, width: 250, height: 28 }, { fontSize: 16, color: C.muted }, "address");
  rule(s, 716, 540, 1, C.rule, 82);
  text(s, "CURRENT SOURCE-BOUND ATTESTATIONS", { left: 750, top: 544, width: 360, height: 24 }, { fontSize: 12, bold: true, color: C.muted }, "provenance-label");
  text(s, "Republish pending", { left: 750, top: 580, width: 360, height: 34 }, { fontSize: 24, bold: true, color: C.text }, "provenance-state");
  notes(s,
    "The validation set contains sixteen manually labeled curated cases and reaches Spearman rho .930. Three blind classifier runs match the reference bands on all sixteen. Sixty-nine software tests and eight Forge tests pass. The registry contract is deployed on Shannon, but the current source-bound provenance records remain pending republish; do not describe them as fully verified yet.",
    [
      "docs/validation.md",
      "docs/agreement.md",
      "data/scores/onchain.json",
      "contracts/README.md",
      "Commands: npm run validate; npx tsx scripts/agreement.ts; npm test; cd contracts && forge test",
      "https://shannon-explorer.somnia.network/address/0xb8e11dea346f2c961880879606a269db3165bbc7",
    ],
  );
}

// 07 — Close
{
  const s = p.slides.add();
  s.background.fill = C.bg;
  await addImage(s, "apps/web/public/brand/levelfield-risk-field.webp", { left: 648, top: 0, width: 632, height: 720 }, "LevelField brass measuring instrument over a topographic information field", { fit: "cover", crop: { left: 0.15, top: 0, right: 0, bottom: 0 } });
  rect(s, { left: 0, top: 0, width: 704, height: 720 }, C.bg);
  rule(s, 72, 70, 158, C.brass, 2);
  text(s, "MAKE STRUCTURAL RISK VISIBLE", { left: 72, top: 94, width: 500, height: 28 }, { fontSize: 13, bold: true, color: C.brass }, "close-kicker");
  text(s, "Know who may know\nbefore you do.", { left: 72, top: 178, width: 590, height: 190 }, { fontSize: 64, color: C.text }, "close-title");
  text(s, "For agents, venues, and traders.", { left: 76, top: 410, width: 470, height: 42 }, { fontSize: 25, color: C.text2 }, "close-subtitle");
  text(s, "DreamDEX snapshots  ·  MCP policy checks  ·  Somnia registry", { left: 76, top: 490, width: 550, height: 62 }, { fontSize: 18, color: C.muted }, "close-proof");
  text(s, "LevelField", { left: 76, top: 632, width: 250, height: 34 }, { fontSize: 24, bold: true, color: C.text }, "close-brand");
  notes(s,
    "Close by returning to the promise: make structural information risk visible before a decision. The current DreamDEX integration covers typed BTC and ETH price binaries; broader category coverage is a product direction, not a completed claim. Add public GitHub and deployment links only after they exist.",
    [
      "README.md",
      "demo-video/article.md",
      "docs/hackathon-readiness-2026-08-20.md",
      "apps/web/public/brand/levelfield-risk-field.webp",
    ],
  );
}

await fs.mkdir(path.join(TMP, "rendered"), { recursive: true });
for (const [i, slide] of p.slides.items.entries()) {
  const stem = `slide-${String(i + 1).padStart(2, "0")}`;
  const png = await p.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(path.join(TMP, "rendered", `${stem}.png`), new Uint8Array(await png.arrayBuffer()));
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(path.join(TMP, "rendered", `${stem}.layout.json`), await layout.text());
}
const montage = await p.export({ format: "webp", montage: true, scale: 1 });
await fs.writeFile(path.join(TMP, "rendered", "montage.webp"), new Uint8Array(await montage.arrayBuffer()));
const pptx = await PresentationFile.exportPptx(p);
await pptx.save(OUT);
console.log(`Wrote ${OUT}`);
