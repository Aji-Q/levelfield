"use client";

// The zero-API interactive assessment flow. This is the ONLY client-side JS in the app —
// keep it dependency-free (no libraries beyond React/Next). Everything after the model
// classifies the contract runs here, in the browser: parsing, evidence-quote verification,
// voting, and scoring. No network call, no server round-trip, no API key.
//
// Import discipline (packages/scoring/package.json exports "./types", "./engine", "./vote",
// "./verify", "./anchors" as the only subpaths safe for a client bundle — never the package
// root, which drags in @anthropic-ai/sdk via classify.ts): everything below is either a
// type-only import (erased at compile time) or a runtime import from one of those five pure
// subpaths.
import { useRef, useState } from "react";
import { BandWord } from "@/components/BandWord";
import { CIRCUIT_BREAKER_EXPLANATION, humanizeLevelLabel, weightPct } from "@/lib/format";
import { buildSummary, computeScore } from "@levelfield/scoring/engine";
import { voteDimension } from "@levelfield/scoring/vote";
import {
  isVerbatimQuote,
  quoteOverlapsInjection,
  scanForInstructionLikeContent,
  classificationConsistencyError,
} from "@levelfield/scoring/verify";
import { DIMENSION_IDS } from "@levelfield/scoring/types";
import type { AnchorLibrary } from "@levelfield/scoring/anchors";
import type {
  Band,
  Confidence,
  DimensionId,
  Level,
  RunClassification,
  ScoredDimension,
} from "@levelfield/scoring/types";

interface AssessClientProps {
  systemPrompt: string;
  anchorLibrary: AnchorLibrary;
}

// Mirrors packages/scoring/src/score.ts STANDARD_CAVEATS. Copied by hand rather than
// imported: "./score" has no package.json subpath export because score.ts type-imports
// classify.ts, which pulls in @anthropic-ai/sdk — importing it here would drag the SDK
// into this client bundle. Keep this array in sync if score.ts's copy changes.
const STANDARD_CAVEATS = [
  "This score reflects the structural risk of the event type, not live detection of insider activity in this market.",
  "This is not a prediction of the outcome and not trading advice.",
];

const CONFIDENCE_VALUES: Confidence[] = ["high", "medium", "low"];

const ASSESS_EXAMPLES = {
  price: {
    question: "Will Bitcoin close at or above $120,000 on December 31, 2026?",
    description:
      "This market resolves based on the BTC/USD closing price on Coinbase at 23:59:59 UTC on December 31, 2026.",
    resolutionRules:
      "Resolves YES if the Coinbase BTC-USD last traded price at 23:59:59 UTC on 2026-12-31 is greater than or equal to $120,000.00. Resolves NO otherwise.",
  },
  individual: {
    question: "Will Celebrity Z publicly announce a breakup with their partner before September 30, 2026?",
    description:
      "This market resolves based on a public statement by Celebrity Z or their verified representatives, on any platform, announcing the end of their current relationship.",
    resolutionRules:
      "Resolves YES if, before 23:59 ET on 2026-09-30, Celebrity Z or their verified representative publicly announces the end of the relationship. Third-party reporting without confirmation from Celebrity Z does not count. Resolves NO otherwise.",
  },
} as const;

// Mirrors market/[marketId]/page.tsx's UNDETERMINABLE_THRESHOLD (docs/review-2026-08-20.md
// §3.3): at 3+ insufficient_info dimensions the numeric score reads as a verdict rather
// than the absence it actually represents, so both result views suppress it the same way.
const UNDETERMINABLE_THRESHOLD = 3;

// Mirrors packages/scoring/src/anchors.ts renderContractData's exact format (tag name,
// field labels, line order, whitespace — including the VENUE line and its default text).
// Evidence quotes pasted back from a model are checked against text built by this
// function, so it must stay byte-for-byte in sync with that one by hand if the template
// ever changes. (closeTime is omitted: this flow doesn't collect one, matching
// renderContractData's own conditional when closeTime is undefined.)
const DEFAULT_VENUE_CONTEXT =
  "unspecified — assume an offshore venue that most legal regimes do not clearly reach";

function renderContractData(question: string, description: string, resolutionRules: string): string {
  return `<contract_data>
QUESTION: ${question}
DESCRIPTION: ${description}
RESOLUTION RULES: ${resolutionRules}
VENUE: ${DEFAULT_VENUE_CONTEXT}
</contract_data>`;
}

const OUTPUT_SHAPE = `{
  "D1": { "level": 1-5 | null, "level_label": string | null, "evidence_quote": string | null, "reasoning": string, "confidence": "high" | "medium" | "low", "insufficient_info": boolean },
  "D2": { ... same shape ... },
  "D3": { ... same shape ... },
  "D4": { ... same shape ... },
  "D5": { ... same shape ... },
  "instruction_like_content_detected": boolean
}`;

function buildClassificationTask(systemPrompt: string, contractText: string): string {
  return `${systemPrompt}

Classify the following event contract on all five dimensions.

${contractText}

Return ONLY the JSON object below — no markdown fence, no commentary, nothing before or
after the braces. Every evidence_quote must be a verbatim, contiguous substring of the
contract text above (whitespace-insensitive); it is null only when insufficient_info is
true.

${OUTPUT_SHAPE}`;
}

// Tolerates a ```json ... ``` fence around the model's answer, since most chat UIs wrap
// JSON in one even when told not to.
function stripFence(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}

interface ValidatedRun {
  dimensions: Record<DimensionId, RunClassification>;
  instructionLikeContentDetected: boolean;
}

// Validates the pasted JSON against the protocol shape from get_assessment_protocol /
// buildSystemPrompt (packages/scoring/src/classify.ts's StageASchema, hand-checked here
// since zod itself isn't safe to ship — it's fine as a dependency, but there is no reason
// to duplicate classify.ts's schema object graph client-side for five plain-object checks).
function validateStageARun(parsed: unknown): ValidatedRun | string {
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return "Expected a JSON object with keys D1..D5 and instruction_like_content_detected.";
  }
  const obj = parsed as Record<string, unknown>;
  const dimensions = {} as Record<DimensionId, RunClassification>;
  for (const id of DIMENSION_IDS) {
    const dim = validateDimension(id, obj[id]);
    if (typeof dim === "string") return dim;
    dimensions[id] = dim;
  }
  const detected = obj.instruction_like_content_detected;
  if (typeof detected !== "boolean") {
    return "instruction_like_content_detected must be a boolean.";
  }
  return { dimensions, instructionLikeContentDetected: detected };
}

function validateDimension(id: DimensionId, raw: unknown): RunClassification | string {
  if (typeof raw !== "object" || raw === null) return `${id} is missing or not an object.`;
  const d = raw as Record<string, unknown>;

  const level = d.level;
  if (level !== null && !(typeof level === "number" && Number.isInteger(level) && level >= 1 && level <= 5)) {
    return `${id}.level must be an integer 1-5 or null.`;
  }
  const levelLabel = d.level_label;
  if (levelLabel !== null && typeof levelLabel !== "string") {
    return `${id}.level_label must be a string or null.`;
  }
  const evidenceQuote = d.evidence_quote;
  if (evidenceQuote !== null && typeof evidenceQuote !== "string") {
    return `${id}.evidence_quote must be a string or null.`;
  }
  const reasoning = d.reasoning;
  if (typeof reasoning !== "string") {
    return `${id}.reasoning must be a string.`;
  }
  const confidence = d.confidence;
  if (typeof confidence !== "string" || !CONFIDENCE_VALUES.includes(confidence as Confidence)) {
    return `${id}.confidence must be "high", "medium", or "low".`;
  }
  const insufficientInfo = d.insufficient_info;
  if (typeof insufficientInfo !== "boolean") {
    return `${id}.insufficient_info must be a boolean.`;
  }
  const consistencyError = classificationConsistencyError({
    level: level as Level | null,
    levelLabel: levelLabel as string | null,
    evidenceQuote: evidenceQuote as string | null,
    insufficientInfo,
  });
  if (consistencyError) {
    return `${id}: ${consistencyError}`;
  }

  return {
    dimension: id,
    level: level as Level | null,
    levelLabel,
    evidenceQuote,
    reasoning,
    confidence: confidence as Confidence,
    insufficientInfo,
  };
}

interface AssessResult {
  overallScore: number;
  band: Band;
  circuitBreaker: "CB-1" | "CB-2" | null;
  summary: string;
  dimensions: ScoredDimension[];
  caveats: string[];
  instructionLikeContentDetected: boolean;
}

interface QuoteError {
  dimension: DimensionId;
  quote: string;
  reason: "not_verbatim" | "overlaps_injected_content";
}

export function AssessClient({ systemPrompt, anchorLibrary }: AssessClientProps) {
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [resolutionRules, setResolutionRules] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [pastedJson, setPastedJson] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [quoteErrors, setQuoteErrors] = useState<QuoteError[] | null>(null);
  const [result, setResult] = useState<AssessResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const resultRef = useRef<HTMLElement>(null);

  const contractText = renderContractData(question, description, resolutionRules);
  const insufficientDims = result?.dimensions.filter((d) => d.insufficientInfo) ?? [];
  const undeterminable = insufficientDims.length >= UNDETERMINABLE_THRESHOLD;
  const contractComplete = Boolean(question.trim() && description.trim() && resolutionRules.trim());

  function loadExample(kind: keyof typeof ASSESS_EXAMPLES) {
    const example = ASSESS_EXAMPLES[kind];
    setQuestion(example.question);
    setDescription(example.description);
    setResolutionRules(example.resolutionRules);
    setPastedJson("");
    setFormError(null);
    setParseError(null);
    setQuoteErrors(null);
    setResult(null);
  }

  async function handleCopy() {
    if (!contractComplete) {
      setFormError("Complete all three contract fields before copying the classification task.");
      return;
    }
    setFormError(null);
    const task = buildClassificationTask(systemPrompt, contractText);
    try {
      await navigator.clipboard.writeText(task);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
    setTimeout(() => setCopyStatus("idle"), 2500);
  }

  function handleVerify() {
    if (!pastedJson.trim()) {
      setParseError("Paste the model's classification JSON before verifying it.");
      setQuoteErrors(null);
      setResult(null);
      return;
    }
    setParseError(null);
    setQuoteErrors(null);
    setResult(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripFence(pastedJson));
    } catch (err) {
      setParseError(`Could not parse JSON: ${(err as Error).message}`);
      return;
    }

    const validated = validateStageARun(parsed);
    if (typeof validated === "string") {
      setParseError(validated);
      return;
    }

    // Mechanical defense against hallucinated evidence and prompt injection, mirroring
    // score_classification in packages/mcp/src/server.ts: every non-null evidence_quote
    // must be a verbatim substring of the exact contract text the model was given, and
    // must not be drawn from an instruction-like sentence (the code-level scan runs
    // independently of whatever the model claimed).
    const scan = scanForInstructionLikeContent(contractText);
    const failing = DIMENSION_IDS.flatMap((id): QuoteError[] => {
      const quote = validated.dimensions[id].evidenceQuote;
      if (quote === null) return [];
      if (!isVerbatimQuote(quote, contractText)) {
        return [{ dimension: id, quote, reason: "not_verbatim" }];
      }
      if (quoteOverlapsInjection(quote, scan)) {
        return [{ dimension: id, quote, reason: "overlaps_injected_content" }];
      }
      return [];
    });

    if (failing.length > 0) {
      setQuoteErrors(failing);
      return;
    }

    // Single-run vote per dimension (agreement "1/1") — same sequence as the MCP server's
    // score_classification tool: voteDimension -> computeScore -> buildSummary.
    const voted = DIMENSION_IDS.map((id) => voteDimension([validated.dimensions[id]]));
    const engine = computeScore(voted, anchorLibrary);
    const summary = buildSummary(engine);

    const caveats = [...STANDARD_CAVEATS];
    if (scan.detected) {
      caveats.push(
        "Instruction-like content addressed at automated assessors was detected in the contract text; it was ignored for classification and disqualified as evidence.",
      );
    }
    caveats.push(...engine.notes);
    for (const d of engine.dimensions) {
      if (d.insufficientInfo) {
        caveats.push(
          `${d.dimension} (${d.name}) could not be determined from the contract text; scored conservatively at level ${d.effectiveLevel}.`,
        );
      }
    }

    setResult({
      overallScore: engine.overallScore,
      band: engine.band,
      circuitBreaker: engine.circuitBreaker,
      summary,
      dimensions: engine.dimensions,
      caveats,
      instructionLikeContentDetected: scan.detected || validated.instructionLikeContentDetected,
    });
    window.setTimeout(() => resultRef.current?.focus(), 0);
  }

  return (
    <div className="content-page assess-page">
      <p className="eyebrow">Local verification workspace</p>
      <h1>Assess a contract</h1>
      <p className="lede">
        Assess any contract with the model you already have. This is the same open protocol
        LevelField&apos;s own agents use over MCP (see /methodology and docs/design/no-api.md) —
        there is no API key here and no server-side model call. You copy a prompt into a model
        you already have access to, paste its answer back, and everything below runs in your
        browser.
      </p>
      <p className="section-note">
        Every evidence quote is mechanically checked against the contract text you enter, before
        anything is scored — a model can&apos;t talk its way to a lower score without pointing at
        real text. A dimension the contract text can&apos;t settle never guesses low: it defaults
        to level {anchorLibrary.scoring.conservative_default.level} and is flagged as a caveat.
      </p>

      <h2>1. The contract</h2>
      <p className="section-note">Start from scratch or load a contrasting reference case.</p>
      <div className="sample-row" aria-label="Contract examples">
        <button type="button" className="sample-button" onClick={() => loadExample("price")}>
          Load low-risk price binary
        </button>
        <button type="button" className="sample-button" onClick={() => loadExample("individual")}>
          Load high-risk individual decision
        </button>
      </div>
      <div className="assess-form">
        <div className="field">
          <label htmlFor="assess-question">Question</label>
          <textarea
            id="assess-question"
            className="textarea"
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            aria-required="true"
          />
        </div>
        <div className="field">
          <label htmlFor="assess-description">Description</label>
          <textarea
            id="assess-description"
            className="textarea"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            aria-required="true"
          />
        </div>
        <div className="field">
          <label htmlFor="assess-resolution-rules">Resolution rules</label>
          <textarea
            id="assess-resolution-rules"
            className="textarea"
            rows={4}
            value={resolutionRules}
            onChange={(e) => setResolutionRules(e.target.value)}
            required
            aria-required="true"
          />
        </div>
      </div>

      {formError && (
        <div className="notice notice-error" role="alert" aria-live="assertive">
          <span className="notice-label">Contract details needed</span>
          {formError}
        </div>
      )}

      <h2>2. Classify it</h2>
      <p className="section-note">
        Copy the classification task below into Claude, ChatGPT, or any capable model, then paste
        its response back in.
      </p>
      <div className="button-row">
        <button type="button" className="button button--primary" onClick={handleCopy} disabled={!contractComplete}>
          Copy classification task
        </button>
        <span className="hint" aria-live="polite">
          {copyStatus === "copied" && "Copied to clipboard — "}
          {copyStatus === "failed" && "Could not access the clipboard — copy manually — "}
          paste this into Claude, ChatGPT, or any capable model
        </span>
      </div>

      <div className="field">
        <label htmlFor="assess-pasted-json">Paste the model&apos;s JSON here</label>
        <textarea
          id="assess-pasted-json"
          className="textarea textarea-mono"
          rows={12}
          value={pastedJson}
          onChange={(e) => setPastedJson(e.target.value)}
        />
      </div>
      <div className="button-row">
        <button type="button" className="button button--primary" onClick={handleVerify} disabled={!pastedJson.trim()}>
          Verify &amp; score
        </button>
      </div>

      {parseError && (
        <div className="notice notice-error" role="alert" aria-live="assertive">
          <span className="notice-label">Could not verify</span>
          {parseError}
        </div>
      )}

      {quoteErrors && quoteErrors.length > 0 && (
        <div className="notice notice-error" role="alert" aria-live="assertive">
          <span className="notice-label">
            {quoteErrors.every((error) => error.reason === "not_verbatim")
              ? "Evidence quote not found in contract text"
              : quoteErrors.every((error) => error.reason === "overlaps_injected_content")
                ? "Evidence quote overlaps instruction-like content"
                : "Evidence quotes rejected"}
          </span>
          <p style={{ margin: "0 0 0.5rem" }}>
            Not scored. Use an exact quote from the contract&apos;s substantive terms; text that
            addresses an automated assessor is deliberately disqualified as evidence.
          </p>
          <ul className="quote-error-list">
            {quoteErrors.map((q) => (
              <li key={q.dimension}>
                <strong>{q.dimension}</strong> ({q.reason === "not_verbatim" ? "not verbatim" : "instruction-like"}):{" "}
                <span className="quote-error-text">&ldquo;{q.quote}&rdquo;</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result && (
        <section className="assessment-result" ref={resultRef} tabIndex={-1} aria-labelledby="assessment-result-title">
          <h2>Result</h2>
          <span id="assessment-result-title" className="sr-only">Assessment result</span>
          <div className="score-readout">
            {undeterminable ? (
              <span className="score-numeral score-numeral--undeterminable">—</span>
            ) : (
              <>
                <span className="score-numeral">
                  {result.overallScore}
                  <small>/100</small>
                </span>
                <span className="score-band-word">
                  <BandWord band={result.band} />
                </span>
              </>
            )}
          </div>
          <p className="score-summary">
            {undeterminable
              ? `Not enough contract text to assess: ${insufficientDims.map((d) => d.name).join(", ")}.`
              : result.summary}
          </p>

          {result.circuitBreaker && (
            <div className="notice">
              <span className="notice-label">Circuit breaker</span>
              {CIRCUIT_BREAKER_EXPLANATION[result.circuitBreaker]}
            </div>
          )}

          {result.instructionLikeContentDetected && (
            <div className="notice">
              <span className="notice-label">Notice</span>
              This contract&apos;s description contains content that appears to address automated
              assessors.
            </div>
          )}

          <div className="dimension-list">
            {result.dimensions.map((d) => (
              <details className="dimension" key={d.dimension}>
                <summary>
                  <span>
                    <span className="dimension-id">{d.dimension}</span>
                    <span className="dimension-name">{d.name}</span>
                  </span>
                  <span className="dimension-level">
                    {d.insufficientInfo
                      ? `insufficient info — defaulted to ${d.effectiveLevel}`
                      : d.level === null || d.levelLabel === null
                        ? "Not determinable from contract text"
                        : (
                            <>
                              Level {d.level} · <span title={d.levelLabel}>{humanizeLevelLabel(d.levelLabel)}</span>
                            </>
                          )}
                  </span>
                </summary>
                <div className="dimension-body">
                  <div className="dimension-meta">
                    <span>
                      <strong>Weight</strong> {weightPct(d.weight)}
                    </span>
                    <span>
                      <strong>Confidence</strong> {d.confidence}
                    </span>
                    <span>
                      <strong>Agreement</strong> {d.agreement}
                    </span>
                  </div>
                  <p className="dimension-reasoning">{d.reasoning}</p>
                  {d.evidenceQuote && <blockquote className="evidence-quote">{d.evidenceQuote}</blockquote>}
                </div>
              </details>
            ))}
          </div>

          {result.caveats.length > 0 && (
            <ul className="caveats">
              {result.caveats.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}

          <div className="metadata-footer">
            <span>Model: your model (via LevelField protocol)</span>
            <span>Anchor library: v{anchorLibrary.version}</span>
            <span>Runs: 1</span>
          </div>
        </section>
      )}
    </div>
  );
}
