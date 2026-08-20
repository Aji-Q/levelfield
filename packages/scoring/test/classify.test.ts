import Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it, vi } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadAnchors } from "../src/anchors.js";
import { ClaudeClassifier } from "../src/classify.js";
import { DIMENSION_IDS, type DimensionId, type NormalizedContract } from "../src/types.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const lib = loadAnchors(path.join(here, "../../../data/anchors/anchors.yaml"));

const contract: NormalizedContract = {
  marketId: "classifier-recovery-test",
  question: "Will the committee publish a decision?",
  description: "A routine public-decision market used only for classifier recovery testing.",
  resolutionRules: "Resolves YES if the committee publishes a decision before the close time.",
  source: "adhoc",
};

function parsedOutput(): Record<DimensionId, object> & { instruction_like_content_detected: boolean } {
  const dimensions = Object.fromEntries(
    DIMENSION_IDS.map((id) => [
      id,
      {
        level: 2,
        level_label: "public_process",
        // D1 deliberately fails verbatim-quote verification. The other dimensions
        // are valid, so the recovery assertion proves the targeted normalization.
        evidence_quote: id === "D1" ? "not present in the contract" : contract.question,
        reasoning: "Fixture classification.",
        confidence: "high",
        insufficient_info: false,
      },
    ]),
  ) as Record<DimensionId, object>;

  return { ...dimensions, instruction_like_content_detected: false };
}

describe("ClaudeClassifier recovery", () => {
  it("clears levelLabel with the other insufficient-info fields after retries are exhausted", async () => {
    const parse = vi.fn().mockResolvedValue({ parsed_output: parsedOutput() });
    const fakeClient = { messages: { parse } } as unknown as Anthropic;
    const classifier = new ClaudeClassifier(lib, { client: fakeClient, maxAttempts: 1 });

    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    try {
      const result = await classifier.classify(contract);

      expect(parse).toHaveBeenCalledTimes(2); // failed attempt + recovery read
      expect(result.dimensions.D1).toMatchObject({
        level: null,
        levelLabel: null,
        evidenceQuote: null,
        insufficientInfo: true,
        confidence: "low",
      });
      expect(result.dimensions.D2).toMatchObject({
        level: 2,
        levelLabel: "public_process",
        evidenceQuote: contract.question,
        insufficientInfo: false,
      });
    } finally {
      warn.mockRestore();
    }
  });
});
