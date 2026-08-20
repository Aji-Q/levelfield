import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadAnchors } from "../src/anchors.js";
import { WEIGHTS, bandFor, computeScore } from "../src/engine.js";
import type { DimensionId, Level, VotedDimension } from "../src/types.js";
import { DIMENSION_IDS } from "../src/types.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const lib = loadAnchors(path.join(here, "../../../data/anchors/anchors.yaml"));

function voted(levels: Record<DimensionId, Level | null>): VotedDimension[] {
  return DIMENSION_IDS.map((id) => ({
    dimension: id,
    level: levels[id],
    levelLabel: levels[id] === null ? null : `l${levels[id]}`,
    evidenceQuote: levels[id] === null ? null : "quote",
    reasoning: "r",
    confidence: "high",
    insufficientInfo: levels[id] === null,
    agreement: "3/3",
  }));
}

describe("weights", () => {
  it("sum to 1.0", () => {
    const sum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 9);
  });
});

describe("bands", () => {
  it("boundary values", () => {
    expect(bandFor(0)).toBe("low");
    expect(bandFor(24)).toBe("low");
    expect(bandFor(25)).toBe("moderate");
    expect(bandFor(49)).toBe("moderate");
    expect(bandFor(50)).toBe("elevated");
    expect(bandFor(74)).toBe("elevated");
    expect(bandFor(75)).toBe("high");
    expect(bandFor(100)).toBe("high");
  });
});

describe("computeScore", () => {
  it("all level 1 scores 0", () => {
    const out = computeScore(voted({ D1: 1, D2: 1, D3: 1, D4: 1, D5: 1 }), lib);
    expect(out.overallScore).toBe(0);
    expect(out.band).toBe("low");
    expect(out.circuitBreaker).toBeNull();
  });

  it("all level 5 scores 100 and trips CB-1", () => {
    const out = computeScore(voted({ D1: 5, D2: 5, D3: 5, D4: 5, D5: 5 }), lib);
    expect(out.overallScore).toBe(100);
    expect(out.circuitBreaker).toBe("CB-1");
  });

  it("CPI-style contract scores low", () => {
    const out = computeScore(voted({ D1: 2, D2: 2, D3: 2, D4: 1, D5: 1 }), lib);
    expect(out.overallScore).toBe(19);
    expect(out.band).toBe("low");
  });

  it("FOMC-style contract scores moderate", () => {
    const out = computeScore(voted({ D1: 4, D2: 4, D3: 2, D4: 1, D5: 3 }), lib);
    expect(out.overallScore).toBe(49);
    expect(out.band).toBe("moderate");
  });

  it("military-style contract scores high without a circuit breaker", () => {
    const out = computeScore(voted({ D1: 4, D2: 5, D3: 4, D4: 4, D5: 3 }), lib);
    expect(out.overallScore).toBe(78);
    expect(out.band).toBe("high");
    expect(out.circuitBreaker).toBeNull();
  });

  it("CB-1 floors an otherwise diluted score at 90", () => {
    // D1=5, D3=4, everything else clean: weighted average alone would be 49.
    const out = computeScore(voted({ D1: 5, D2: 1, D3: 4, D4: 1, D5: 1 }), lib);
    expect(out.overallScore).toBe(90);
    expect(out.band).toBe("high");
    expect(out.circuitBreaker).toBe("CB-1");
  });

  it("CB-2 floors manufacturable+tradable at 85", () => {
    const out = computeScore(voted({ D1: 4, D2: 1, D3: 4, D4: 1, D5: 5 }), lib);
    expect(out.overallScore).toBe(85);
    expect(out.circuitBreaker).toBe("CB-2");
  });

  it("CB-1 takes precedence over CB-2", () => {
    const out = computeScore(voted({ D1: 5, D2: 1, D3: 5, D4: 1, D5: 5 }), lib);
    expect(out.circuitBreaker).toBe("CB-1");
  });

  it("insufficient info defaults conservatively to level 4", () => {
    const out = computeScore(voted({ D1: 1, D2: null, D3: 1, D4: 1, D5: 1 }), lib);
    const d2 = out.dimensions.find((d) => d.dimension === "D2");
    expect(d2?.effectiveLevel).toBe(4);
    expect(out.overallScore).toBe(15); // 0.2 * 0.75 * 100
  });
});
