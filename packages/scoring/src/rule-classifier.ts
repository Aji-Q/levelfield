// Stage A, live track: deterministic classification for DreamDEX price binaries.
// Per official DreamDEX guidance (Gotcha #13), decisions key off typed fields
// (marketType/asset/venueId/context) — never off parsing question wording, which has
// changed shape several times. Anything that doesn't provably fit the plain price-binary
// shape falls through to the LLM protocol (see docs/design/no-api.md), never a guessed score.

import { DREAMDEX_TESTNET_VENUE } from "./dreamdex.js";
import type { DreamDexMarketRow } from "./dreamdex.js";
import type { DimensionId, Level, NormalizedContract, RunClassification, StageARun } from "./types.js";

// Per-market deep links (prd.oracle.somnia.host/questions/{oracleQuestionId}) are
// deliberately NOT used: live sampling found the indexer's oracleQuestionId pointing at
// unrelated questions 3/3 times (docs/research-dreamdex.md §4). Link the explorer root only.
const ORACLE_EXPLORER_ROOT = "https://prd.oracle.somnia.host/explore";

export function tryRuleClassify(row: DreamDexMarketRow, contract: NormalizedContract): StageARun | null {
  if (row.marketType !== "BINARY") return null;
  if (row.asset !== "BTC" && row.asset !== "ETH") return null;
  if ((row.venueId ?? "").toLowerCase() !== DREAMDEX_TESTNET_VENUE.toLowerCase()) return null;

  // context is the only free-text field besides question; "0x" is the empty value
  // observed on testnet. Anything else means unknown extra content we can't structurally
  // account for, so we decline rather than guess.
  const context = row.context?.trim() ?? "";
  if (context.length > 0 && context !== "0x") return null;

  const evidenceQuote = contract.question; // verbatim substring of renderContractData's QUESTION line

  const dim = (dimension: DimensionId, level: Level, levelLabel: string, reasoning: string): RunClassification => ({
    dimension,
    level,
    levelLabel,
    evidenceQuote,
    reasoning,
    confidence: "high",
    insufficientInfo: false,
  });

  const dimensions: Record<DimensionId, RunClassification> = {
    D1: dim(
      "D1",
      1,
      "natural_process",
      "The outcome is the exchange market price of a major crypto asset, a process no identifiable party controls.",
    ),
    D2: dim(
      "D2",
      1,
      "none",
      "The settlement price becomes known to everyone at the moment it exists; there is no early-knowledge window.",
    ),
    D3: dim(
      "D3",
      1,
      "prohibited_enforced",
      "With no early-knowledge window (D2 = none), there is no insider position for any constraint to apply to.",
    ),
    D4: dim(
      "D4",
      1,
      "fixed_schedule",
      `The market settles on a fixed window expiry via on-chain oracle publication, auditable at the Somnia oracle hub (${ORACLE_EXPLORER_ROOT}).`,
    ),
    D5: dim(
      "D5",
      2,
      "prohibitively_costly",
      "Moving the global market price of a major crypto asset enough to flip the strike dwarfs any plausible bet size.",
    ),
  };

  return { dimensions, instructionLikeContentDetected: false };
}
