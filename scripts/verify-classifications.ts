/**
 * Asserts every reference classification's evidenceQuote is a verbatim substring
 * of the rendered contract text. Run after touching data/classifications/.
 *   npx tsx scripts/verify-classifications.ts
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isVerbatimQuote, renderContractData, type NormalizedContract } from "@levelfield/scoring";

const here = path.dirname(fileURLToPath(import.meta.url));
const curatedDir = path.join(here, "../data/curated");
const classDir = path.join(here, "../data/classifications");

let failures = 0;
for (const f of readdirSync(classDir).filter((f) => f.endsWith(".json"))) {
  const cls = JSON.parse(readFileSync(path.join(classDir, f), "utf8"));
  const curatedFile = path.join(curatedDir, f.replace(/^curated-/, "").replace(/\.json$/, "") + ".json");
  const contract = JSON.parse(readFileSync(curatedFile, "utf8")) as NormalizedContract;
  const text = renderContractData(contract);
  for (const [dim, d] of Object.entries(cls.dimensions) as [string, { evidenceQuote: string | null }][]) {
    if (d.evidenceQuote === null) continue;
    if (!isVerbatimQuote(d.evidenceQuote, text)) {
      failures++;
      console.error(`FAIL ${f} ${dim}: quote not found verbatim: "${d.evidenceQuote}"`);
    }
  }
  console.log(`ok   ${f}`);
}
if (failures > 0) {
  console.error(`\n${failures} quote(s) failed verification`);
  process.exit(1);
}
console.log("\nAll evidence quotes verified verbatim.");
