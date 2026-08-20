// Integration: curated contracts through the full pipeline with a mock Stage A.
// This is the same harness the real validation run (§9 of the plan) will use,
// with MockClassifier swapped for ClaudeClassifier.

import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadAnchors } from "../src/anchors.js";
import { MockClassifier, isVerbatimQuote, normalizeWhitespace } from "../src/classify.js";
import { scoreContract } from "../src/score.js";
import type { DimensionId, Level, NormalizedContract } from "../src/types.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const lib = loadAnchors(path.join(here, "../../../data/anchors/anchors.yaml"));
const curatedDir = path.join(here, "../../../data/curated");

interface CuratedFile extends NormalizedContract {
  expected: {
    levels: Record<DimensionId, Level>;
    band: string;
    circuitBreaker?: string;
    injectionFlag?: boolean;
  };
}

const curated: CuratedFile[] = readdirSync(curatedDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(path.join(curatedDir, f), "utf8")));

const mock = new MockClassifier(
  Object.fromEntries(
    curated.map((c) => [
      c.marketId,
      { levels: c.expected.levels, injection: c.expected.injectionFlag ?? false },
    ]),
  ),
);

describe("curated contracts end-to-end (mock Stage A)", () => {
  for (const c of curated) {
    it(`${c.marketId} lands in band "${c.expected.band}"`, async () => {
      const result = await scoreContract(c, lib, mock);
      expect(result.band).toBe(c.expected.band);
      expect(result.circuitBreaker).toBe(c.expected.circuitBreaker ?? null);
      expect(result.flags.instructionLikeContentDetected).toBe(c.expected.injectionFlag ?? false);
      expect(result.metadata.runs).toBe(3);
    });
  }

  it("risk ordering matches the ACDC gradient", async () => {
    const byId = new Map<string, number>();
    for (const c of curated) {
      const r = await scoreContract(c, lib, mock);
      byId.set(c.marketId, r.overallScore);
    }
    const s = (id: string) => byId.get(id)!;
    // statistical release < public vote < institutional decision < individual will
    expect(s("curated-cpi-above-3")).toBeLessThan(s("curated-fed-rate-cut"));
    expect(s("curated-election-winner")).toBeLessThan(s("curated-fed-rate-cut"));
    expect(s("curated-fed-rate-cut")).toBeLessThan(s("curated-military-strike"));
    expect(s("curated-military-strike")).toBeLessThan(s("curated-celebrity-breakup"));
  });
});

describe("verbatim quote validation", () => {
  it("accepts quotes with collapsed whitespace", () => {
    expect(isVerbatimQuote("hello   world", "say\nhello world today")).toBe(true);
  });
  it("rejects paraphrases", () => {
    expect(isVerbatimQuote("hello there world", "say hello world today")).toBe(false);
  });
  it("normalizeWhitespace collapses all runs", () => {
    expect(normalizeWhitespace("  a\n\tb   c ")).toBe("a b c");
  });
});
