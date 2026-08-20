// Stage B: the deterministic scoring engine. Pure functions, no IO, no model.
// Every number in a LevelField score comes from this file and nowhere else.

import type { Band, DimensionId, Level, ScoredDimension, VotedDimension } from "./types.js";
import type { AnchorLibrary } from "./anchors.js";

export const WEIGHTS: Record<DimensionId, number> = {
  D1: 0.3, // Outcome Control — decisive
  D3: 0.25, // Insider Tradability — decisive
  D2: 0.2, // Knowledge Circle
  D4: 0.15, // Disclosure Synchronicity
  D5: 0.1, // Outcome Manufacturability — amplifier
};

export const CONSERVATIVE_DEFAULT_LEVEL: Level = 4;

export function bandFor(score: number): Band {
  if (score < 25) return "low";
  if (score < 50) return "moderate";
  if (score < 75) return "elevated";
  return "high";
}

export interface EngineOutput {
  overallScore: number;
  band: Band;
  circuitBreaker: "CB-1" | "CB-2" | null;
  dimensions: ScoredDimension[];
}

export function computeScore(voted: VotedDimension[], lib: AnchorLibrary): EngineOutput {
  if (voted.length !== 5) {
    throw new Error(`Expected 5 voted dimensions, got ${voted.length}`);
  }

  const dimensions: ScoredDimension[] = voted.map((v) => {
    const anchor = lib.dimensions.find((d) => d.id === v.dimension);
    if (!anchor) throw new Error(`Unknown dimension ${v.dimension} — not in anchor library`);
    const effectiveLevel: Level = v.level ?? CONSERVATIVE_DEFAULT_LEVEL;
    return { ...v, name: anchor.name, weight: WEIGHTS[v.dimension], effectiveLevel };
  });

  const raw = dimensions.reduce((s, d) => s + d.weight * ((d.effectiveLevel - 1) / 4), 0);
  let overallScore = Math.round(raw * 100);
  let circuitBreaker: EngineOutput["circuitBreaker"] = null;

  const level = (id: DimensionId): Level => {
    const d = dimensions.find((x) => x.dimension === id);
    if (!d) throw new Error(`Missing dimension ${id}`);
    return d.effectiveLevel;
  };

  // CB-1: a person decides the outcome and is free to trade it. Beats any averaging.
  if (level("D1") === 5 && level("D3") >= 4) {
    overallScore = Math.max(overallScore, 90);
    circuitBreaker = "CB-1";
  }
  // CB-2: the outcome can be manufactured unilaterally by someone free to trade it.
  else if (level("D5") === 5 && level("D3") >= 4) {
    overallScore = Math.max(overallScore, 85);
    circuitBreaker = "CB-2";
  }

  return { overallScore, band: bandFor(overallScore), circuitBreaker, dimensions };
}

// Deterministic one-line summary: pick the highest-contribution risky dimension
// and describe it in plain language. No LLM involved, so identical labels always
// produce the identical sentence.
const DRIVER_SENTENCES: Record<DimensionId, Partial<Record<Level, string>>> = {
  D1: {
    3: "The outcome is decided by collective public behavior.",
    4: "The outcome is produced by an institutional decision, which widens the circle of people who know it early.",
    5: "The outcome is decided by a single person's discretionary choice.",
  },
  D2: {
    3: "A handful of people know the outcome before you do, with no formal controls.",
    4: "Dozens of people know the outcome before it is public.",
    5: "A large, unbounded group knows the outcome before it is public.",
  },
  D3: {
    3: "Nothing but workplace policy stops the people who know from trading on it.",
    4: "It is unclear that any rule stops the people who know from trading on it.",
    5: "Nothing stops the people who know the outcome from trading on it themselves.",
  },
  D4: {
    3: "The outcome is disclosed whenever the discloser chooses.",
    4: "The outcome leaks out through media rather than a single official release.",
    5: "The party with a stake in the outcome also controls when it becomes public.",
  },
  D5: {
    3: "The outcome could be deliberately brought about by coordinated parties.",
    4: "A small group could deliberately produce this outcome.",
    5: "One party could produce this outcome unilaterally, at trivial cost.",
  },
};

export function buildSummary(out: EngineOutput): string {
  if (out.circuitBreaker === "CB-1") {
    return "The outcome is decided by a single person who faces no effective restriction on trading it.";
  }
  if (out.circuitBreaker === "CB-2") {
    return "Someone free to trade this market could unilaterally cause the outcome.";
  }
  if (out.band === "low") {
    return "No structural early-knowledge advantage is apparent: the outcome is produced and disclosed in ways no participant controls.";
  }
  const risky = [...out.dimensions]
    .filter((d) => d.effectiveLevel >= 3)
    .sort((a, b) => b.weight * (b.effectiveLevel - 1) - a.weight * (a.effectiveLevel - 1));
  const top = risky[0];
  const sentence = top && DRIVER_SENTENCES[top.dimension][top.effectiveLevel];
  return sentence ?? "Some structural properties of this event permit early knowledge by others.";
}
