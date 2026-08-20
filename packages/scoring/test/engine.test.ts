import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadAnchors } from "../src/anchors.js";
import { WEIGHTS, bandFor, buildSummary, computeScore } from "../src/engine.js";
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

  it("does not accept a low level when insufficientInfo is true", () => {
    const input = voted({ D1: 1, D2: 1, D3: 1, D4: 1, D5: 1 });
    input[1] = { ...input[1], insufficientInfo: true }; // malformed boundary input

    const out = computeScore(input, lib);
    const d2 = out.dimensions.find((d) => d.dimension === "D2");
    expect(d2?.effectiveLevel).toBe(4);
    expect(out.overallScore).toBe(15); // D2 is still conservatively defaulted
  });
});

describe("graduated circuit-breaker floors", () => {
  it("CB-1 grades by D3: 3 -> 80, 4 -> 90, 5 -> 95", () => {
    expect(computeScore(voted({ D1: 5, D2: 3, D3: 3, D4: 1, D5: 1 }), lib).overallScore).toBe(80);
    expect(computeScore(voted({ D1: 5, D2: 3, D3: 4, D4: 1, D5: 1 }), lib).overallScore).toBe(90);
    expect(computeScore(voted({ D1: 5, D2: 3, D3: 5, D4: 1, D5: 1 }), lib).overallScore).toBe(95);
  });

  it("CB-1 does not fire below D3 level 3", () => {
    const out = computeScore(voted({ D1: 5, D2: 3, D3: 2, D4: 1, D5: 1 }), lib);
    expect(out.circuitBreaker).toBeNull();
  });

  it("CB-2 grades by D3 and reports the floor in notes", () => {
    const out = computeScore(voted({ D1: 4, D2: 3, D3: 3, D4: 1, D5: 5 }), lib);
    expect(out.overallScore).toBe(75);
    expect(out.circuitBreaker).toBe("CB-2");
    expect(out.notes.some((n) => n.includes("CB-2 floor 75"))).toBe(true);
  });

  it("CB-2 alternative trigger: a manufacturer needs no disclosure lag (D2=1, D5=5)", () => {
    const out = computeScore(voted({ D1: 3, D2: 1, D3: 1, D4: 1, D5: 5 }), lib);
    expect(out.circuitBreaker).toBe("CB-2");
    expect(out.overallScore).toBe(85);
  });
});

describe("buildSummary", () => {
  it("low band with an elevated dimension names it instead of the generic sentence", () => {
    // D1 D3 D4 D5 all level 1, D2 level 5: raw = 0.2 * 1 = 0.2 -> 20 (low), no circuit
    // breaker (CB-1 needs D1=5, CB-2 needs D5=5) — the generic low-band sentence would
    // contradict a reader looking at D2's own accordion row.
    const out = computeScore(voted({ D1: 1, D2: 5, D3: 1, D4: 1, D5: 1 }), lib);
    expect(out.band).toBe("low");
    expect(out.circuitBreaker).toBeNull();
    expect(buildSummary(out)).toBe(
      "Overall structural risk is low, though Knowledge Circle is elevated — see the dimension detail.",
    );
  });

  it("low band with no elevated dimension keeps the generic sentence", () => {
    const out = computeScore(voted({ D1: 2, D2: 2, D3: 2, D4: 1, D5: 1 }), lib);
    expect(out.band).toBe("low");
    expect(buildSummary(out)).toBe(
      "No structural early-knowledge advantage is apparent: the outcome is produced and disclosed in ways no participant controls.",
    );
  });
});

describe("cross-dimension rules enforced in code", () => {
  it("R1: individual-will outcomes cannot have an empty knowledge circle", () => {
    const out = computeScore(voted({ D1: 5, D2: 1, D3: 5, D4: 5, D5: 5 }), lib);
    const d2 = out.dimensions.find((d) => d.dimension === "D2");
    expect(d2?.effectiveLevel).toBe(3);
    expect(out.notes.some((n) => n.startsWith("D2 adjusted"))).toBe(true);
    // CB-1 survives the D2=1 reading — the silent breaker-disable path is closed.
    expect(out.circuitBreaker).toBe("CB-1");
    expect(out.overallScore).toBeGreaterThanOrEqual(95);
  });

  it("R2: D3 collapses to 1 only when nothing is manufacturable (D5 <= 2)", () => {
    const forced = computeScore(voted({ D1: 1, D2: 1, D3: 3, D4: 1, D5: 2 }), lib);
    expect(forced.dimensions.find((d) => d.dimension === "D3")?.effectiveLevel).toBe(1);
    expect(forced.notes.some((n) => n.startsWith("D3 adjusted"))).toBe(true);

    const stands = computeScore(voted({ D1: 3, D2: 1, D3: 3, D4: 1, D5: 3 }), lib);
    expect(stands.dimensions.find((d) => d.dimension === "D3")?.effectiveLevel).toBe(3);
  });
});
