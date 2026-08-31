// LevelField hackathon deck v2 — dark editorial brand, real product screenshots.
//   cd demo-deck/gen && node deck.cjs   -> ../levelfield-deck.pptx
// All numbers herein are the audited ones (see docs/review/fable-review-2026-08-20.md).
const pptxgen = require("pptxgenjs");
const path = require("path");

const A = (f) => path.join(__dirname, "..", "assets-v2", f);

// ---- palette (site design system) ----
const BG = "0C0B09";
const PANEL = "15130F";
const BORDER = "2A2721";
const INK = "F2EDE3";
const DIM = "A89F8D";
const FAINT = "6B6353";
const GOLD = "C9973F";
const GOLD2 = "E0B25C";
const SAGE = "9DB89D";

const SERIF = "Georgia";
const SANS = "Arial";
const MONO = "Courier New";

const W = 10, H = 5.625;

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "LevelField";
pres.title = "LevelField — Somnia × DreamDEX Event Contracts Hackathon";

let pageNo = 0;

function newSlide() {
  const s = pres.addSlide();
  s.background = { color: BG };
  pageNo += 1;
  return s;
}

// The brand glyph: level pill + bubble. scale=1 -> 0.62in wide.
function glyph(s, x, y, scale = 1, centered = false) {
  const w = 0.62 * scale, h = 0.28 * scale;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: h / 2,
    fill: { color: BG }, line: { color: GOLD, width: 1.6 * scale },
  });
  const r = 0.11 * scale;
  const cx = centered ? x + w / 2 - r / 2 : x + w * 0.52;
  s.addShape(pres.shapes.OVAL, {
    x: cx, y: y + h / 2 - r / 2, w: r, h: r, fill: { color: GOLD2 }, line: { type: "none" },
  });
}

function footer(s, label) {
  s.addText(`LEVELFIELD · ${label}`, {
    x: 0.55, y: H - 0.34, w: 6, h: 0.22, fontFace: MONO, fontSize: 8.5, color: FAINT, charSpacing: 2, margin: 0,
  });
  s.addText(String(pageNo).padStart(2, "0"), {
    x: W - 1.0, y: H - 0.34, w: 0.5, h: 0.22, fontFace: MONO, fontSize: 8.5, color: FAINT, align: "right", margin: 0,
  });
}

function title(s, text, opts = {}) {
  glyph(s, 0.55, 0.42, 0.75);
  s.addText(text, {
    x: 1.15, y: 0.3, w: opts.w ?? 8.3, h: 0.55, fontFace: SERIF, fontSize: 23, color: INK, margin: 0, valign: "middle",
  });
}

// Bordered panel with a 16:9 image inside.
function shotPanel(s, img, x, y, w, opts = {}) {
  const h = opts.h ?? (w * 9) / 16;
  s.addShape(pres.shapes.RECTANGLE, {
    x: x - 0.03, y: y - 0.03, w: w + 0.06, h: h + 0.06,
    fill: { color: PANEL }, line: { color: opts.border ?? BORDER, width: 1 },
  });
  s.addImage({ path: img, x, y, w, h, sizing: { type: "cover", w, h } });
  if (opts.caption) {
    s.addText(opts.caption, {
      x, y: y + h + 0.07, w, h: 0.24, fontFace: MONO, fontSize: 8.5, color: FAINT, margin: 0,
    });
  }
  return h;
}

function chip(s, text, x, y, w, opts = {}) {
  const h = opts.h ?? 0.34;
  s.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color: opts.fill ?? PANEL }, line: { color: opts.line ?? GOLD, width: 1 },
  });
  s.addText(text, {
    x, y, w, h, align: "center", valign: "middle", fontFace: MONO,
    fontSize: opts.fontSize ?? 10, color: opts.color ?? GOLD2, margin: 0,
  });
  return h;
}

function rows(s, items, x, y, w, opts = {}) {
  let cy = y;
  for (const [head, body] of items) {
    s.addShape(pres.shapes.RECTANGLE, { x, y: cy + 0.055, w: 0.09, h: 0.09, fill: { color: GOLD }, line: { type: "none" } });
    s.addText(head, { x: x + 0.22, y: cy - 0.03, w: w - 0.22, h: 0.26, fontFace: SANS, fontSize: 12.5, bold: true, color: INK, margin: 0 });
    s.addText(body, { x: x + 0.22, y: cy + 0.22, w: w - 0.22, h: opts.bodyH ?? 0.52, fontFace: SANS, fontSize: 10.5, color: DIM, margin: 0 });
    cy += opts.step ?? 0.86;
  }
}

// ============================== S1 · TITLE ==============================
{
  const s = newSlide();
  s.addImage({ path: A("risk-field.png"), x: 5.1, y: 0, w: 4.9, h: H, sizing: { type: "cover", w: 4.9, h: H } });
  s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 0, w: 4.9, h: H, fill: { color: BG, transparency: 45 }, line: { type: "none" } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 5.35, h: H, fill: { color: BG }, line: { type: "none" } });

  glyph(s, 0.55, 0.95, 1.35);
  s.addText("LevelField", { x: 0.5, y: 1.35, w: 4.6, h: 0.9, fontFace: SERIF, fontSize: 46, color: INK, margin: 0 });
  s.addText("Know who can know — before you do.", {
    x: 0.55, y: 2.35, w: 4.7, h: 0.45, fontFace: SERIF, italic: true, fontSize: 17, color: GOLD2, margin: 0,
  });
  s.addText(
    "Structural information-asymmetry risk for event contracts — scored from contract text alone, verified by code, attested on-chain.",
    { x: 0.55, y: 3.0, w: 4.55, h: 0.8, fontFace: SANS, fontSize: 11, color: DIM, margin: 0 },
  );
  s.addText("SOMNIA × DREAMDEX · EVENT CONTRACTS HACKATHON · 2026", {
    x: 0.55, y: 4.18, w: 4.5, h: 0.25, fontFace: MONO, fontSize: 9, color: GOLD, charSpacing: 1.5, margin: 0,
  });
  s.addText([
    { text: "Live  ", options: { color: FAINT } },
    { text: "levelfield.vercel.app", options: { color: DIM, breakLine: true } },
    { text: "Registry  ", options: { color: FAINT } },
    { text: "0xb8e11dea…3165bbc7 · Somnia Shannon · source-verified", options: { color: DIM } },
  ], { x: 0.55, y: 4.62, w: 4.6, h: 0.6, fontFace: MONO, fontSize: 8.5, margin: 0 });
}

// ============================== S2 · PROBLEM ==============================
{
  const s = newSlide();
  title(s, "The field is not level");
  s.addText([
    { text: "A price tells you what the crowd believes. ", options: { color: INK } },
    { text: "It doesn't tell you who could already know.", options: { color: GOLD2 } },
  ], { x: 0.55, y: 1.15, w: 4.9, h: 1.5, fontFace: SERIF, fontSize: 21, margin: 0 });

  rows(s, [
    ["Someone makes the outcome", "Many events resolve on a person's or institution's decision — not on a market average nobody controls."],
    ["A circle knows it early", "Between decision and disclosure there is a window where insiders simply know."],
    ["Nothing visible stops them", "Whether early knowers can trade is a property of the contract's structure — invisible at the price."],
  ], 0.55, 2.62, 4.7, { step: 0.82 });

  shotPanel(s, A("site-home.png"), 5.75, 1.35, 3.7, { caption: "levelfield — live product (deployed)" });
  s.addText("Every existing tool tracks insiders after the fact. Nothing warns before the trade.", {
    x: 5.75, y: 4.05, w: 3.7, h: 0.6, fontFace: SANS, fontSize: 10.5, italic: true, color: DIM, margin: 0,
  });
  footer(s, "PROBLEM");
}

// ============================== S3 · THE CONTRAST ==============================
{
  const s = newSlide();
  title(s, "Change nothing but the event");
  const y = 1.25, w = 4.1;
  shotPanel(s, A("site-market-3.png"), 0.55, y, w, { caption: "DreamDEX BTC price binary · timestamped snapshot" });
  shotPanel(s, A("site-market-95.png"), 5.35, y, w, { caption: "curated reference contract · individual decision" });

  s.addText([
    { text: "3", options: { fontFace: SERIF, fontSize: 54, color: SAGE } },
    { text: "  /100 low", options: { fontFace: MONO, fontSize: 13, color: FAINT } },
  ], { x: 0.55, y: 3.95, w, h: 1.0, margin: 0 });
  s.addText([
    { text: "95", options: { fontFace: SERIF, fontSize: 54, color: GOLD2 } },
    { text: "  /100 high", options: { fontFace: MONO, fontSize: 13, color: FAINT } },
  ], { x: 5.35, y: 3.95, w, h: 1.0, align: "right", margin: 0 });

  s.addText("SAME ENGINE · SAME RULES", {
    x: 3.0, y: 4.2, w: 4.0, h: 0.3, align: "center", fontFace: MONO, fontSize: 9.5, color: GOLD, charSpacing: 2, margin: 0,
  });
  footer(s, "THE CONTRAST");
}

// ============================== S4 · STAGE A ==============================
{
  const s = newSlide();
  title(s, "Stage A — a model classifies, against public anchors");
  const dims = [
    ["D1", "Outcome Control", "30%"],
    ["D3", "Insider Tradability", "25%"],
    ["D2", "Knowledge Circle", "20%"],
    ["D4", "Disclosure Synchronicity", "15%"],
    ["D5", "Outcome Manufacturability", "10%"],
  ];
  let cy = 1.3;
  for (const [id, name, wt] of dims) {
    s.addText(id, { x: 0.55, y: cy, w: 0.45, h: 0.28, fontFace: MONO, fontSize: 11, color: GOLD, margin: 0 });
    s.addText(name, { x: 1.0, y: cy, w: 2.9, h: 0.28, fontFace: SANS, fontSize: 11.5, color: INK, margin: 0 });
    s.addText(wt, { x: 3.9, y: cy, w: 0.6, h: 0.28, fontFace: MONO, fontSize: 11, color: DIM, align: "right", margin: 0 });
    cy += 0.4;
  }
  s.addText(
    "Five dimensions, five anchored levels each — a fixed, public library (data/anchors), not a prompt. Any capable model can classify; none is required at runtime.",
    { x: 0.55, y: 3.5, w: 3.95, h: 1.0, fontFace: SANS, fontSize: 10.5, color: DIM, margin: 0 },
  );
  chip(s, "evidence quotes = verbatim substrings · machine-checked", 0.55, 4.55, 3.95, { fontSize: 8 });

  shotPanel(s, A("dimbars.png"), 5.0, 1.35, 4.45, { caption: "the anchor library, as shipped in the product film" });
  footer(s, "STAGE A · CLASSIFY");
}

// ============================== S5 · STAGE B ==============================
{
  const s = newSlide();
  title(s, "Stage B — deterministic code writes the number");
  shotPanel(s, A("engine.png"), 0.55, 1.3, 5.5, { caption: "fixed weights · graduated circuit-breaker floors" });

  const rx = 6.5, rw = 3.0;
  s.addText("No model output is ever the score. Levels go in; audited code applies weights, cross-dimension rules and circuit breakers.", {
    x: rx, y: 1.3, w: rw, h: 1.0, fontFace: SANS, fontSize: 11, color: DIM, margin: 0,
  });
  chip(s, "CB-1  one person controls + can trade → floor 80/90/95", rx, 2.45, rw, { fontSize: 8.5, h: 0.4 });
  chip(s, "CB-2  cheaply manufacturable outcomes → floor 75–90", rx, 2.95, rw, { fontSize: 8.5, h: 0.4 });
  chip(s, "unknown information → level 4, never a guess low", rx, 3.45, rw, { fontSize: 8.5, h: 0.4, line: BORDER, color: DIM });
  s.addText("score = round(100 · Σ wd · (leveld − 1) / 4)", {
    x: rx, y: 4.1, w: rw, h: 0.3, fontFace: MONO, fontSize: 8, color: GOLD2, margin: 0,
  });
  s.addText([
    { text: "bands  low <25 ≤ moderate <50", options: { breakLine: true } },
    { text: "       ≤ elevated <75 ≤ high" },
  ], { x: rx, y: 4.42, w: rw, h: 0.5, fontFace: MONO, fontSize: 8.5, color: FAINT, margin: 0 });
  footer(s, "STAGE B · SCORE");
}

// ============================== S6 · INJECTION DEFENSE ==============================
{
  const s = newSlide();
  title(s, "Attack text can never become evidence");
  rows(s, [
    ["Code scans, not the model", "A code-level scanner detects instruction-like text addressed at automated assessors — independent of any model's judgment."],
    ["Whole sentences are tainted", "Any evidence quote overlapping a tainted sentence is rejected outright; fabricated quotes fail the verbatim check."],
    ["A complicit model still can't hide it", "Even if the calling model obeys the attacker, the server-side flag and caveats are forced onto the result."],
  ], 0.55, 1.35, 4.35, { step: 1.06, bodyH: 0.72 });
  s.addText("Try it live: the curated injection-test contract ships in the product.", {
    x: 0.55, y: 4.65, w: 4.3, h: 0.3, fontFace: SANS, fontSize: 10, italic: true, color: DIM, margin: 0 },
  );
  shotPanel(s, A("rejection-crop.png"), 5.2, 1.75, 4.25, { h: 4.25 * 720 / 1920, caption: "real rejection: the fake quote is named, nothing is scored" });
  footer(s, "INJECTION DEFENSE");
}

// ============================== S7 · AGENT-NATIVE ==============================
{
  const s = newSlide();
  title(s, "Agent-native: ask before you act");
  shotPanel(s, A("mcp-terminal.png"), 0.55, 1.3, 5.5, { caption: "real MCP server over stdio · assessment only, no order submitted" });

  const rx = 6.5, rw = 3.0;
  s.addText("Any trading agent calls the LevelField MCP server pre-trade. The policy fits in one line:", {
    x: rx, y: 1.3, w: rw, h: 0.85, fontFace: SANS, fontSize: 11, color: DIM, margin: 0,
  });
  chip(s, "low / moderate → PROCEED", rx, 2.3, rw, { h: 0.4, line: SAGE, color: SAGE });
  chip(s, "elevated / high → DECLINE", rx, 2.8, rw, { h: 0.4 });
  s.addText("The DreamDEX binary returns PROCEED at 3. The individual-decision case returns DECLINE at 95 — with the evidence attached.", {
    x: rx, y: 3.45, w: rw, h: 1.1, fontFace: SANS, fontSize: 10.5, color: DIM, margin: 0,
  });
  s.addText("open protocol · zero LLM deps · no API key", {
    x: rx, y: 4.55, w: rw, h: 0.3, fontFace: MONO, fontSize: 8.5, color: GOLD, margin: 0,
  });
  footer(s, "MCP · AGENTS");
}

// ============================== S8 · ON-CHAIN ==============================
{
  const s = newSlide();
  title(s, "Scores that outlive the website");
  shotPanel(s, A("explorer.png"), 0.55, 1.3, 5.5, { caption: "ScoreRegistry on Somnia Shannon · real publishBatch txs · source-verified" });

  const rx = 6.5, rw = 3.0;
  s.addText("Each score is published as an on-chain attestation any contract or agent can read without our site:", {
    x: rx, y: 1.3, w: rw, h: 0.85, fontFace: SANS, fontSize: 11, color: DIM, margin: 0,
  });
  s.addText([
    { text: "score · band · dims[5]", options: { breakLine: true } },
    { text: "methodHash  ", options: { color: GOLD2 } },
    { text: "(pins the anchor-library version)", options: { color: FAINT, breakLine: true } },
    { text: "scoredAt · sourceUri  ", options: { color: INK } },
    { text: "(immutable commit, pinned at submission)", options: { color: FAINT } },
  ], { x: rx, y: 2.25, w: rw, h: 1.3, fontFace: MONO, fontSize: 9.5, color: INK, margin: 0 });
  s.addText("A verifier reads every field back and fails closed on anything missing or changed.", {
    x: rx, y: 3.7, w: rw, h: 0.7, fontFace: SANS, fontSize: 10.5, color: DIM, margin: 0,
  });
  s.addText("0xb8e11dea…3165bbc7", { x: rx, y: 4.55, w: rw, h: 0.3, fontFace: MONO, fontSize: 9, color: GOLD, margin: 0 });
  footer(s, "ON-CHAIN");
}

// ============================== S9 · VALIDATION ==============================
{
  const s = newSlide();
  title(s, "Numbers a judge can re-run");

  const stats = [
    ["ρ = 0.930", "Spearman, category risk order, n = 16"],
    ["16 / 16", "blind-run majority band = reference (3 runs)"],
    ["70 + 8", "software tests + smart-contract tests, all green"],
  ];
  let sx = 0.55;
  for (const [big, small] of stats) {
    s.addShape(pres.shapes.RECTANGLE, { x: sx, y: 1.3, w: 2.9, h: 1.5, fill: { color: PANEL }, line: { color: BORDER, width: 1 } });
    s.addText(big, { x: sx + 0.2, y: 1.45, w: 2.5, h: 0.7, fontFace: SERIF, fontSize: 30, color: GOLD2, margin: 0 });
    s.addText(small, { x: sx + 0.2, y: 2.2, w: 2.5, h: 0.5, fontFace: SANS, fontSize: 9.5, color: DIM, margin: 0 });
    sx += 3.05;
  }

  s.addText("CATEGORY MEDIANS, STRICTLY ORDERED", {
    x: 0.55, y: 3.15, w: 5, h: 0.25, fontFace: MONO, fontSize: 8.5, color: FAINT, charSpacing: 1.5, margin: 0,
  });
  const meds = [["market data · low", "3", SAGE], ["statistical · low", "19", SAGE], ["public · low", "23.5", SAGE], ["institutional · elev.", "60", GOLD], ["individual · high", "95", GOLD2]];
  let mx = 0.55;
  for (const [label, val, col] of meds) {
    s.addShape(pres.shapes.RECTANGLE, { x: mx, y: 3.45, w: 1.62, h: 0.72, fill: { color: PANEL }, line: { color: BORDER, width: 1 } });
    s.addText(val, { x: mx, y: 3.5, w: 1.62, h: 0.4, align: "center", fontFace: SERIF, fontSize: 17, color: col, margin: 0 });
    s.addText(label, { x: mx, y: 3.9, w: 1.62, h: 0.24, align: "center", fontFace: MONO, fontSize: 7.5, color: FAINT, margin: 0 });
    mx += 1.71;
  }

  s.addText("npm test · npm run validate · npm run agreement · official SDK cross-check 8/8 · read-only, no key", {
    x: 0.55, y: 4.5, w: 8.9, h: 0.3, fontFace: MONO, fontSize: 8.5, color: DIM, margin: 0,
  });
  s.addText("Honest limits: 16-contract curated corpus; agreement stats published per dimension; no outcome prediction claimed.", {
    x: 0.55, y: 4.82, w: 8.9, h: 0.3, fontFace: SANS, fontSize: 9, italic: true, color: FAINT, margin: 0,
  });
  footer(s, "VALIDATION");
}

// ============================== S10 · ECOSYSTEM + CLOSE ==============================
{
  const s = newSlide();
  title(s, "Built to grow the venue it audits");
  rows(s, [
    ["Traders", "“Feels rigged” becomes a readable, auditable number — the trust barrier for new event categories drops."],
    ["Agents", "A pre-trade MCP policy hook: DreamDEX is agent-first, and LevelField is the risk check an agent calls before acting."],
    ["The venue", "A listing-time instrument for what comes after price binaries — score the category before it ships."],
  ], 0.55, 1.3, 4.55, { step: 0.92 });
  s.addText("+ 11 evidence-backed SDK & documentation findings, delivered as the optional feedback report.", {
    x: 0.55, y: 4.2, w: 4.4, h: 0.6, fontFace: SANS, fontSize: 10, color: GOLD2, margin: 0,
  });

  const rx = 5.65, rw = 3.8;
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: 1.3, w: rw, h: 2.5, fill: { color: PANEL }, line: { color: BORDER, width: 1 } });
  s.addText([
    { text: "LIVE SITE", options: { color: FAINT, breakLine: true } },
    { text: "levelfield.vercel.app", options: { color: INK, breakLine: true } },
    { text: "", options: { breakLine: true } },
    { text: "SCOREREGISTRY · SOMNIA SHANNON", options: { color: FAINT, breakLine: true } },
    { text: "0xb8e11dea…3165bbc7 (source-verified)", options: { color: INK, breakLine: true } },
    { text: "", options: { breakLine: true } },
    { text: "DEMO VIDEO", options: { color: FAINT, breakLine: true } },
    { text: "2:55 · real captures · burned captions", options: { color: INK, breakLine: true } },
    { text: "", options: { breakLine: true } },
    { text: "GITHUB", options: { color: FAINT, breakLine: true } },
    { text: "public repo + immutable SHA at submission", options: { color: INK } },
  ], { x: rx + 0.25, y: 1.5, w: rw - 0.5, h: 2.2, fontFace: MONO, fontSize: 9, margin: 0 });

  glyph(s, rx, 4.05, 0.9);
  s.addText("Know who can know — before you do.", {
    x: rx, y: 4.45, w: 3.85, h: 0.35, fontFace: SERIF, italic: true, fontSize: 14, color: GOLD2, margin: 0,
  });
  footer(s, "ECOSYSTEM");
}

pres.writeFile({ fileName: path.join(__dirname, "..", "levelfield-deck.pptx") }).then(() => console.log("deck written"));
