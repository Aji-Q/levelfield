import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderContractData, loadAnchors } from "../src/anchors.js";
import { isVerbatimQuote } from "../src/classify.js";
import { computeScore } from "../src/engine.js";
import { DREAMDEX_TESTNET_VENUE, toNormalizedContract, type DreamDexMarketRow } from "../src/dreamdex.js";
import { tryRuleClassify } from "../src/rule-classifier.js";
import { DIMENSION_IDS } from "../src/types.js";
import { voteDimension } from "../src/vote.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const lib = loadAnchors(path.join(here, "../../../data/anchors/anchors.yaml"));

function btcRow(overrides: Partial<DreamDexMarketRow> = {}): DreamDexMarketRow {
  return {
    marketId: "live-btc-1",
    question: "BTC at or above 65000 at expiry",
    context: "0x",
    marketType: "BINARY",
    asset: "BTC",
    strike: "65000",
    intervalSec: "3600",
    tradingStart: "1700000000",
    expiry: "1700003600",
    clobStatus: "Trading",
    venueId: DREAMDEX_TESTNET_VENUE,
    oracleQuestionId: "12345",
    ...overrides,
  };
}

describe("tryRuleClassify gate", () => {
  it("rejects a market on the wrong venue", () => {
    const row = btcRow({ venueId: "0xnotdreamdex" });
    expect(tryRuleClassify(row, toNormalizedContract(row))).toBeNull();
  });

  it("rejects a non-BTC/ETH asset", () => {
    const row = btcRow({ asset: "SOL" });
    expect(tryRuleClassify(row, toNormalizedContract(row))).toBeNull();
  });

  it("rejects non-empty context beyond '0x'", () => {
    const row = btcRow({ context: "0xsomeunknownpayload" });
    expect(tryRuleClassify(row, toNormalizedContract(row))).toBeNull();
  });

  it("rejects a non-BINARY market type", () => {
    const row = btcRow({ marketType: "SCALAR" });
    expect(tryRuleClassify(row, toNormalizedContract(row))).toBeNull();
  });

  it("accepts the DreamDEX venue case-insensitively", () => {
    const row = btcRow({ venueId: DREAMDEX_TESTNET_VENUE.toUpperCase() });
    expect(tryRuleClassify(row, toNormalizedContract(row))).not.toBeNull();
  });
});

describe("tryRuleClassify success", () => {
  const row = btcRow();
  const contract = toNormalizedContract(row);
  const run = tryRuleClassify(row, contract);

  it("produces the exact anchor levels and labels", () => {
    expect(run).not.toBeNull();
    expect(run!.dimensions.D1.level).toBe(1);
    expect(run!.dimensions.D1.levelLabel).toBe("natural_process");
    expect(run!.dimensions.D2.level).toBe(1);
    expect(run!.dimensions.D2.levelLabel).toBe("none");
    expect(run!.dimensions.D3.level).toBe(1);
    expect(run!.dimensions.D3.levelLabel).toBe("prohibited_enforced");
    expect(run!.dimensions.D4.level).toBe(1);
    expect(run!.dimensions.D4.levelLabel).toBe("fixed_schedule");
    expect(run!.dimensions.D5.level).toBe(2);
    expect(run!.dimensions.D5.levelLabel).toBe("prohibitively_costly");
    for (const id of DIMENSION_IDS) {
      expect(run!.dimensions[id].confidence).toBe("high");
      expect(run!.dimensions[id].insufficientInfo).toBe(false);
    }
    expect(run!.instructionLikeContentDetected).toBe(false);
  });

  it("every evidence quote is a verbatim substring of the rendered contract text", () => {
    const contractText = renderContractData(contract);
    for (const id of DIMENSION_IDS) {
      const quote = run!.dimensions[id].evidenceQuote;
      expect(quote).not.toBeNull();
      expect(isVerbatimQuote(quote as string, contractText)).toBe(true);
    }
  });
});

describe("rule-classified run through computeScore", () => {
  it("yields overallScore 3, band low, no circuit breaker", () => {
    const row = btcRow();
    const contract = toNormalizedContract(row);
    const run = tryRuleClassify(row, contract)!;
    const voted = DIMENSION_IDS.map((id) => voteDimension([run.dimensions[id]]));
    const out = computeScore(voted, lib);
    expect(out.overallScore).toBe(3);
    expect(out.band).toBe("low");
    expect(out.circuitBreaker).toBeNull();
  });
});
