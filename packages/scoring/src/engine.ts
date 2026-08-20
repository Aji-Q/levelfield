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
  // Deterministic corrections and breaker details, surfaced as caveats downstream.
  notes: string[];
}

// Graduated circuit-breaker floors. A single hard threshold at D3>=4 put a 20-23 point
// cliff on the single most subjective call in the library (policy_only vs ambiguous);
// grading the floor by D3 keeps the ordering while removing the cliff.
const CB1_FLOORS: Partial<Record<Level, number>> = { 3: 80, 4: 90, 5: 95 };
const CB2_FLOORS: Partial<Record<Level, number>> = { 3: 75, 4: 85, 5: 90 };

export function computeScore(voted: VotedDimension[], lib: AnchorLibrary): EngineOutput {
  if (voted.length !== 5) {
    throw new Error(`Expected 5 voted dimensions, got ${voted.length}`);
  }

  const dimensions: ScoredDimension[] = voted.map((v) => {
    const anchor = lib.dimensions.find((d) => d.id === v.dimension);
    if (!anchor) throw new Error(`Unknown dimension ${v.dimension} — not in anchor library`);
    // `insufficientInfo` is the semantic source of truth, not merely display
    // metadata. Boundary validators reject contradictory input, but the engine
    // still enforces the conservative fallback defensively for every caller.
    const effectiveLevel: Level = v.insufficientInfo || v.level === null ? CONSERVATIVE_DEFAULT_LEVEL : v.level;
    return { ...v, name: anchor.name, weight: WEIGHTS[v.dimension], effectiveLevel };
  });

  const notes: string[] = [];
  const dim = (id: DimensionId): ScoredDimension => {
    const d = dimensions.find((x) => x.dimension === id);
    if (!d) throw new Error(`Missing dimension ${id}`);
    return d;
  };
  const setLevel = (id: DimensionId, l: Level, why: string) => {
    const d = dim(id);
    if (d.effectiveLevel !== l) {
      notes.push(`${id} adjusted from level ${d.effectiveLevel} to ${l}: ${why}`);
      d.effectiveLevel = l;
    }
  };

  // Cross-dimension rules, enforced in code (not just in the classifier prompt):
  // R1 — a discretionary act's outcome is known to its decider before execution, so an
  //      individual-will market cannot have an empty knowledge circle.
  if (dim("D1").effectiveLevel === 5 && dim("D2").effectiveLevel === 1) {
    setLevel("D2", 3, "the person who decides the outcome knows it before it is executed (anchor guidance, D2)");
  }
  // R2 — with no early-knowledge window AND no realistic way to manufacture the outcome,
  //      there is no insider to constrain. When the outcome IS manufacturable (D5 >= 3),
  //      a party can hold foreknowledge without any disclosure lag, so D3 stands.
  if (dim("D2").effectiveLevel === 1 && dim("D5").effectiveLevel <= 2) {
    setLevel("D3", 1, "no early-knowledge window and no realistic manufacturer — no insider to constrain (anchor guidance, D3)");
  }

  const raw = dimensions.reduce((s, d) => s + d.weight * ((d.effectiveLevel - 1) / 4), 0);
  let overallScore = Math.round(raw * 100);
  let circuitBreaker: EngineOutput["circuitBreaker"] = null;

  const level = (id: DimensionId): Level => dim(id).effectiveLevel;

  // CB-1: a person decides the outcome and is not clearly barred from trading it.
  const cb1Floor = level("D1") === 5 ? CB1_FLOORS[level("D3")] : undefined;
  // CB-2: the outcome can be manufactured unilaterally by a party not clearly barred
  // from trading — or by one who needs no disclosure lag at all (D2=1 with D5=5).
  const cb2Floor =
    level("D5") === 5 ? (CB2_FLOORS[level("D3")] ?? (level("D2") === 1 ? 85 : undefined)) : undefined;

  if (cb1Floor !== undefined) {
    overallScore = Math.max(overallScore, cb1Floor);
    circuitBreaker = "CB-1";
    notes.push(`CB-1 floor ${cb1Floor} applied (D1 at level 5, D3 at level ${level("D3")})`);
  } else if (cb2Floor !== undefined) {
    overallScore = Math.max(overallScore, cb2Floor);
    circuitBreaker = "CB-2";
    notes.push(`CB-2 floor ${cb2Floor} applied (D5 at level 5, D3 at level ${level("D3")}, D2 at level ${level("D2")})`);
  }

  return { overallScore, band: bandFor(overallScore), circuitBreaker, dimensions, notes };
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
    // A low overall score can still carry one dimension the classifier read as elevated
    // (e.g. a lightly-weighted amplifier dimension at level 5) — the generic sentence below
    // would then contradict the dimension list a reader sees right underneath it
    // (docs/review-2026-08-20.md §1.5). Name the highest-contribution such dimension instead.
    const elevated = [...out.dimensions]
      .filter((d) => d.effectiveLevel >= 4)
      .sort((a, b) => b.weight * (b.effectiveLevel - 1) - a.weight * (a.effectiveLevel - 1));
    if (elevated.length > 0) {
      return `Overall structural risk is low, though ${elevated[0].name} is elevated — see the dimension detail.`;
    }
    return "No structural early-knowledge advantage is apparent: the outcome is produced and disclosed in ways no participant controls.";
  }
  const risky = [...out.dimensions]
    .filter((d) => d.effectiveLevel >= 3)
    .sort((a, b) => b.weight * (b.effectiveLevel - 1) - a.weight * (a.effectiveLevel - 1));
  const top = risky[0];
  const sentence = top && DRIVER_SENTENCES[top.dimension][top.effectiveLevel];
  return sentence ?? "Some structural properties of this event permit early knowledge by others.";
}
