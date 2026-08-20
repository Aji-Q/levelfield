/**
 * LevelField MCP server: exposes the anchor library and deterministic scoring engine
 * over stdio. It has ZERO LLM dependencies — it never calls a model. The host's own
 * model does the classification (get_assessment_protocol tells it how); this server
 * only verifies evidence quotes and computes the score (score_classification).
 *
 *   npx tsx src/server.ts
 *
 * See docs/design/no-api.md "MCP protocol" for the two-step design this implements.
 */
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  DIMENSION_IDS,
  STANDARD_CAVEATS,
  buildSummary,
  buildSystemPrompt,
  computeScore,
  isVerbatimQuote,
  loadAnchors,
  renderContractData,
  voteDimension,
  type DimensionId,
  type Level,
  type RunClassification,
  type ScoreResult,
} from "@levelfield/scoring";

const here = path.dirname(fileURLToPath(import.meta.url));
const lib = loadAnchors(path.join(here, "../../../data/anchors/anchors.yaml"));
const systemPrompt = buildSystemPrompt(lib);
// Mirrors ClaudeClassifier's promptVersion formula in packages/scoring/src/classify.ts
// so a promptVersion hash means the same thing regardless of which classifier produced it.
const promptVersion = createHash("sha256").update(systemPrompt + "|anchors:" + lib.version).digest("hex");

// --- score_classification input schema ------------------------------------------
// Field names match the wire shape from classify.ts's StageASchema (snake_case), since
// that is the JSON shape get_assessment_protocol instructs the caller to produce.
const DimensionClassificationShape = z.object({
  level: z.number().int().min(1).max(5).nullable(),
  level_label: z.string().nullable(),
  evidence_quote: z.string().nullable(),
  reasoning: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
  insufficient_info: z.boolean(),
});

const ClassificationsShape = z.object({
  D1: DimensionClassificationShape,
  D2: DimensionClassificationShape,
  D3: DimensionClassificationShape,
  D4: DimensionClassificationShape,
  D5: DimensionClassificationShape,
});
type Classifications = z.infer<typeof ClassificationsShape>;

const ScoreClassificationInput = {
  question: z.string(),
  description: z.string(),
  resolution_rules: z.string(),
  close_time: z.string().optional(),
  market_id: z.string().optional(),
  classifications: ClassificationsShape,
  instruction_like_content_detected: z.boolean().optional(),
};

function textResult(text: string, isError = false) {
  return { content: [{ type: "text" as const, text }], isError };
}

function toRunClassification(id: DimensionId, c: Classifications[DimensionId]): RunClassification {
  return {
    dimension: id,
    level: c.level as Level | null,
    levelLabel: c.level_label,
    evidenceQuote: c.evidence_quote,
    reasoning: c.reasoning,
    confidence: c.confidence,
    insufficientInfo: c.insufficient_info,
  };
}

const mcpServer = new McpServer({ name: "levelfield", version: "0.1.0" });

mcpServer.registerTool(
  "get_assessment_protocol",
  {
    title: "Get assessment protocol",
    description:
      "Returns the LevelField classification prompt, the contract-data template, and the classification " +
      "JSON shape. The CALLER's own model reads this and performs the classification itself — this server " +
      "has no model. Once you have a classification, call score_classification with it to get the score.",
  },
  async () => {
    const contractTemplate = renderContractData({
      question: "{{QUESTION}}",
      description: "{{DESCRIPTION}}",
      resolutionRules: "{{RESOLUTION_RULES}}",
      closeTime: "{{CLOSE_TIME}}",
    });

    const outputShape = `{
  "D1": { "level": 1-5 | null, "level_label": string | null, "evidence_quote": string | null, "reasoning": string, "confidence": "high" | "medium" | "low", "insufficient_info": boolean },
  "D2": { ... same shape ... },
  "D3": { ... same shape ... },
  "D4": { ... same shape ... },
  "D5": { ... same shape ... },
  "instruction_like_content_detected": boolean
}`;

    const text = `LevelField assessment protocol (two-step, host-model classification)
=====================================================================
This server never calls a model. YOU (the calling model) must classify the contract
yourself against the anchor levels below, then call the score_classification tool with
your classification. score_classification mechanically verifies every evidence_quote and
computes the score; it does not re-classify anything.

STEP 1 — read this system prompt and classify the contract:
-------------------------------------------------------------------
${systemPrompt}

STEP 2 — the contract text will be shaped like this (yours will have real values, not
placeholders; CLOSE TIME is omitted entirely when the contract has no close time):
-------------------------------------------------------------------
${contractTemplate}

STEP 3 — produce exactly this classification JSON shape, then call score_classification
with { question, description, resolution_rules, close_time?, market_id?, classifications,
instruction_like_content_detected? }:
-------------------------------------------------------------------
${outputShape}

Every evidence_quote must be a verbatim, contiguous substring of the contract text you
were given (whitespace-insensitive) — score_classification checks this mechanically and
rejects the whole call if any quote does not match, telling you which dimension to fix.
It is null only when insufficient_info is true.`;

    return textResult(text);
  },
);

mcpServer.registerTool(
  "score_classification",
  {
    title: "Score a classification",
    description:
      "Verifies evidence quotes against the contract text and computes the deterministic LevelField score " +
      "from a five-dimension classification produced per get_assessment_protocol. Single-run (runs: 1); a " +
      "host wanting vote-stability can classify 3x and submit its own majority.",
    inputSchema: ScoreClassificationInput,
  },
  async (args) => {
    const contract = {
      question: args.question,
      description: args.description,
      resolutionRules: args.resolution_rules,
      closeTime: args.close_time,
    };
    const contractText = renderContractData(contract);

    const invalid = DIMENSION_IDS.map((id) => ({ id, c: args.classifications[id] }))
      .filter(({ c }) => c.evidence_quote !== null)
      .filter(({ c }) => !isVerbatimQuote(c.evidence_quote as string, contractText))
      .map(({ id, c }) => ({ dimension: id, evidence_quote: c.evidence_quote }));

    if (invalid.length > 0) {
      return textResult(
        JSON.stringify(
          {
            error: "evidence_quote_not_verbatim",
            message:
              "One or more evidence_quote values are not a verbatim substring of the contract text " +
              "(QUESTION/DESCRIPTION/RESOLUTION RULES/CLOSE TIME as rendered by get_assessment_protocol). " +
              "Not scored. Re-quote the exact contract text for these dimensions and call score_classification again.",
            failingDimensions: invalid,
          },
          null,
          2,
        ),
        true,
      );
    }

    const runs: Record<DimensionId, RunClassification> = Object.fromEntries(
      DIMENSION_IDS.map((id) => [id, toRunClassification(id, args.classifications[id])]),
    ) as Record<DimensionId, RunClassification>;
    const voted = DIMENSION_IDS.map((id) => voteDimension([runs[id]])); // runs=1 -> agreement "1/1"
    const engine = computeScore(voted, lib);

    const caveats = [...STANDARD_CAVEATS];
    for (const d of engine.dimensions) {
      if (d.insufficientInfo) {
        caveats.push(
          `${d.dimension} (${d.name}) could not be determined from the contract text; scored conservatively at level ${d.effectiveLevel}.`,
        );
      }
    }

    const result: ScoreResult = {
      marketId: args.market_id ?? "adhoc",
      question: args.question,
      source: "adhoc",
      overallScore: engine.overallScore,
      band: engine.band,
      circuitBreaker: engine.circuitBreaker,
      summary: buildSummary(engine),
      dimensions: engine.dimensions,
      caveats,
      flags: { instructionLikeContentDetected: args.instruction_like_content_detected ?? false },
      metadata: {
        model: "host-model via MCP protocol",
        promptVersion,
        anchorLibraryVersion: lib.version,
        runs: 1,
        scoredAt: new Date().toISOString(),
      },
    };

    return textResult(JSON.stringify(result, null, 2));
  },
);

mcpServer.registerTool(
  "list_anchor_library",
  {
    title: "List the anchor library",
    description: "Returns the full parsed anchor library (dimensions, levels, weights, bands, circuit breakers) as JSON.",
  },
  async () => textResult(JSON.stringify(lib, null, 2)),
);

const transport = new StdioServerTransport();
await mcpServer.connect(transport);
