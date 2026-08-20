// Stage A: LLM classification of a contract against the anchor library.
// The model outputs enum levels + verbatim evidence quotes; it never outputs scores.
// Evidence quotes are mechanically verified to be substrings of the contract text —
// this one check defends against both hallucinated evidence and prompt injection.

import { createHash } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { AnchorLibrary } from "./anchors.js";
import { buildSystemPrompt, renderContractData } from "./anchors.js";
import type { DimensionId, Level, NormalizedContract, RunClassification, StageARun } from "./types.js";
import { DIMENSION_IDS } from "./types.js";

const DimSchema = z.object({
  level: z.number().int().min(1).max(5).nullable(),
  level_label: z.string().nullable(),
  evidence_quote: z
    .string()
    .nullable()
    .describe("Verbatim contiguous quote from the contract text; null only if insufficient_info"),
  reasoning: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
  insufficient_info: z.boolean(),
});

const StageASchema = z.object({
  D1: DimSchema,
  D2: DimSchema,
  D3: DimSchema,
  D4: DimSchema,
  D5: DimSchema,
  instruction_like_content_detected: z.boolean(),
});

// Whitespace-insensitive substring check: models legitimately collapse newlines
// when quoting, so both sides are normalized before matching.
export function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

export function isVerbatimQuote(quote: string, contractText: string): boolean {
  return normalizeWhitespace(contractText).includes(normalizeWhitespace(quote));
}

export interface Classifier {
  readonly model: string;
  readonly promptVersion: string;
  classify(contract: NormalizedContract): Promise<StageARun>;
}

export class ClaudeClassifier implements Classifier {
  readonly model: string;
  readonly promptVersion: string;
  private readonly client: Anthropic;
  private readonly systemPrompt: string;
  private readonly maxAttempts: number;

  constructor(lib: AnchorLibrary, opts: { model?: string; client?: Anthropic; maxAttempts?: number } = {}) {
    this.model = opts.model ?? process.env.SCORING_MODEL ?? "claude-opus-5";
    this.client = opts.client ?? new Anthropic();
    this.systemPrompt = buildSystemPrompt(lib);
    this.promptVersion = sha256Hex(this.systemPrompt + "|anchors:" + lib.version);
    this.maxAttempts = opts.maxAttempts ?? 3;
  }

  async classify(contract: NormalizedContract): Promise<StageARun> {
    const contractText = renderContractData(contract);

    let lastInvalid: DimensionId[] = [];
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      const response = await this.client.messages.parse({
        model: this.model,
        max_tokens: 16000,
        system: this.systemPrompt,
        messages: [
          {
            role: "user",
            content: `Classify the following event contract on all five dimensions.\n\n${contractText}`,
          },
        ],
        output_config: { format: zodOutputFormat(StageASchema) },
      });

      const parsed = response.parsed_output;
      if (!parsed) continue; // schema parse failed — retry

      const run = toStageARun(parsed);
      lastInvalid = invalidQuotes(run, contractText);
      if (lastInvalid.length === 0) return run;
      // Some quote failed verbatim verification — retry the whole run.
    }

    // Retries exhausted: keep the run but demote unverifiable dimensions to the
    // conservative insufficient-info path rather than trusting unverified evidence.
    console.warn(
      `[classify] quote verification failed after ${this.maxAttempts} attempts for ${contract.marketId}: ${lastInvalid.join(", ")} — demoting to insufficient_info`,
    );
    const response = await this.client.messages.parse({
      model: this.model,
      max_tokens: 16000,
      system: this.systemPrompt,
      messages: [
        { role: "user", content: `Classify the following event contract on all five dimensions.\n\n${contractText}` },
      ],
      output_config: { format: zodOutputFormat(StageASchema) },
    });
    const parsed = response.parsed_output;
    if (!parsed) throw new Error(`Stage A produced no parseable output for ${contract.marketId}`);
    const run = toStageARun(parsed);
    for (const id of invalidQuotes(run, contractText)) {
      run.dimensions[id] = {
        ...run.dimensions[id],
        level: null,
        evidenceQuote: null,
        insufficientInfo: true,
        confidence: "low",
      };
    }
    return run;
  }
}

function toStageARun(parsed: z.infer<typeof StageASchema>): StageARun {
  const dimensions = Object.fromEntries(
    DIMENSION_IDS.map((id) => {
      const d = parsed[id];
      const r: RunClassification = {
        dimension: id,
        level: (d.level as Level | null) ?? null,
        levelLabel: d.level_label,
        evidenceQuote: d.evidence_quote,
        reasoning: d.reasoning,
        confidence: d.confidence,
        insufficientInfo: d.insufficient_info,
      };
      return [id, r];
    }),
  ) as Record<DimensionId, RunClassification>;
  return { dimensions, instructionLikeContentDetected: parsed.instruction_like_content_detected };
}

function invalidQuotes(run: StageARun, contractText: string): DimensionId[] {
  return DIMENSION_IDS.filter((id) => {
    const d = run.dimensions[id];
    if (d.insufficientInfo || d.evidenceQuote === null) return false;
    return !isVerbatimQuote(d.evidenceQuote, contractText);
  });
}

function sha256Hex(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

// Deterministic classifier for tests and the tracer's --mock mode.
// Fixtures map marketId -> per-dimension levels.
export class MockClassifier implements Classifier {
  readonly model = "mock";
  readonly promptVersion = "mock";
  constructor(
    private readonly fixtures: Record<
      string,
      { levels: Record<DimensionId, Level>; injection?: boolean }
    >,
  ) {}

  async classify(contract: NormalizedContract): Promise<StageARun> {
    const fixture = this.fixtures[contract.marketId];
    if (!fixture) throw new Error(`MockClassifier: no fixture for ${contract.marketId}`);
    const dimensions = Object.fromEntries(
      DIMENSION_IDS.map((id) => [
        id,
        {
          dimension: id,
          level: fixture.levels[id],
          levelLabel: `mock_level_${fixture.levels[id]}`,
          evidenceQuote: contract.question,
          reasoning: `Mock classification for ${id}.`,
          confidence: "high",
          insufficientInfo: false,
        } satisfies RunClassification,
      ]),
    ) as Record<DimensionId, RunClassification>;
    return { dimensions, instructionLikeContentDetected: fixture.injection ?? false };
  }
}
