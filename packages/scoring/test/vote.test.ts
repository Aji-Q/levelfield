import { describe, expect, it } from "vitest";
import { voteDimension } from "../src/vote.js";
import type { Confidence, Level, RunClassification } from "../src/types.js";

function run(level: Level | null, confidence: Confidence = "high"): RunClassification {
  return {
    dimension: "D1",
    level,
    levelLabel: level === null ? null : `l${level}`,
    evidenceQuote: level === null ? null : "quote",
    reasoning: "r",
    confidence,
    insufficientInfo: level === null,
  };
}

describe("voteDimension", () => {
  it("unanimous keeps confidence and reports 3/3", () => {
    const v = voteDimension([run(4), run(4), run(4)]);
    expect(v.level).toBe(4);
    expect(v.agreement).toBe("3/3");
    expect(v.confidence).toBe("high");
  });

  it("2/3 majority wins but downgrades confidence", () => {
    const v = voteDimension([run(4), run(4), run(3)]);
    expect(v.level).toBe(4);
    expect(v.agreement).toBe("2/3");
    expect(v.confidence).toBe("medium");
  });

  it("three-way split resolves to the riskiest level at low confidence", () => {
    const v = voteDimension([run(2), run(3), run(4)]);
    expect(v.level).toBe(4);
    expect(v.agreement).toBe("1/3");
    expect(v.confidence).toBe("low");
  });

  it("null (insufficient info) counts as level 4 in a split", () => {
    const v = voteDimension([run(2), run(3), run(null)]);
    expect(v.level).toBeNull();
    expect(v.insufficientInfo).toBe(true);
    expect(v.confidence).toBe("low");
  });

  it("a split between 5 and null picks 5", () => {
    const v = voteDimension([run(5), run(3), run(null)]);
    expect(v.level).toBe(5);
  });

  it("null majority stays insufficient info", () => {
    const v = voteDimension([run(null), run(null), run(3)]);
    expect(v.level).toBeNull();
    expect(v.insufficientInfo).toBe(true);
    expect(v.agreement).toBe("2/3");
  });

  it("low confidence cannot be downgraded further", () => {
    const v = voteDimension([run(4, "low"), run(4, "low"), run(3, "low")]);
    expect(v.confidence).toBe("low");
  });
});
