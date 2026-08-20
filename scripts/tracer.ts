/**
 * Tracer bullet: one contract through the full pipeline, JSON to stdout.
 *
 *   npx tsx scripts/tracer.ts data/curated/celebrity-breakup.json          # live (needs ANTHROPIC_API_KEY)
 *   npx tsx scripts/tracer.ts data/curated/celebrity-breakup.json --mock   # deterministic, no key needed
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ClaudeClassifier,
  MockClassifier,
  loadAnchors,
  scoreContract,
  type Classifier,
  type NormalizedContract,
} from "@levelfield/scoring";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const mock = args.includes("--mock");
const file = args.find((a) => !a.startsWith("--")) ?? "data/curated/celebrity-breakup.json";

const lib = loadAnchors(path.join(here, "../data/anchors/anchors.yaml"));
const contract = JSON.parse(readFileSync(path.resolve(file), "utf8")) as NormalizedContract & {
  expected?: { levels: Record<string, number>; injectionFlag?: boolean };
};

let classifier: Classifier;
if (mock) {
  if (!contract.expected) throw new Error(`--mock needs an "expected" block in ${file}`);
  classifier = new MockClassifier({
    [contract.marketId]: {
      levels: contract.expected.levels as never,
      injection: contract.expected.injectionFlag ?? false,
    },
  });
} else {
  classifier = new ClaudeClassifier(lib);
}

console.error(`Scoring ${contract.marketId} with ${classifier.model} (3 runs)...`);
const result = await scoreContract(contract, lib, classifier);
console.log(JSON.stringify(result, null, 2));
