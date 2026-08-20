// DreamDEX Shannon testnet indexer fetcher: raw GraphQL rows -> NormalizedContract.
// This module never reads row.question for classification decisions — see
// rule-classifier.ts, which per official DreamDEX guidance (Gotcha #13) keys off
// typed fields (marketType/asset/venueId/context) instead of parsing question text.

import type { NormalizedContract } from "./types.js";

export const DEFAULT_INDEXER_URL = "https://dev.smk.somnia.host/v1/graphql";
export const DREAMDEX_TESTNET_VENUE = "0x679795a0195a1b76cdebb7c51d74e058aee92919b8c3389af86ef24535e8a28c";

// Explorer root only — per-market oracleQuestionId deep links proved unreliable
// (3/3 sampled ids pointed at unrelated questions; docs/research-dreamdex.md §4).
const ORACLE_EXPLORER_ROOT = "https://prd.oracle.somnia.host/explore";

export interface DreamDexMarketRow {
  marketId: string;
  question: string | null;
  context: string | null; // observed "0x" (empty) on testnet
  marketType: string; // "BINARY" for event contracts
  asset: string | null; // "BTC" | "ETH" on current venue
  strike: string | null;
  intervalSec: string | null;
  tradingStart: string | null;
  expiry: string | null; // unix seconds, stringified numeric
  clobStatus: string | null; // "Trading" | "Locked" | "Finalized" | ...
  venueId: string | null;
  oracleQuestionId: string | null;
}

const MARKET_FIELDS =
  "marketId question context marketType asset strike intervalSec tradingStart expiry clobStatus venueId oracleQuestionId";

export async function fetchMarkets(
  opts?: { indexerUrl?: string; venueId?: string; limit?: number; statuses?: string[] },
): Promise<DreamDexMarketRow[]> {
  const indexerUrl = opts?.indexerUrl ?? process.env.INDEXER_URL ?? DEFAULT_INDEXER_URL;
  const venueId = opts?.venueId ?? DREAMDEX_TESTNET_VENUE;
  const statuses = opts?.statuses ?? ["Trading"];
  const limit = opts?.limit ?? 500;

  const statusList = statuses.map((s) => JSON.stringify(s)).join(", ");
  const query = `{
    Market(
      limit: ${limit}
      order_by: { createdAtTimestamp: desc }
      where: {
        marketType: { _eq: "BINARY" }
        venueId: { _eq: ${JSON.stringify(venueId)} }
        clobStatus: { _in: [${statusList}] }
      }
    ) {
      ${MARKET_FIELDS}
    }
  }`;

  const actionableHint = "The indexer URL is known-unstable — set INDEXER_URL to override it.";

  let res: Response;
  try {
    res = await fetch(indexerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
  } catch (err) {
    throw new Error(`Failed to reach DreamDEX indexer at ${indexerUrl}: ${(err as Error).message}. ${actionableHint}`);
  }

  if (!res.ok) {
    throw new Error(`DreamDEX indexer HTTP ${res.status} at ${indexerUrl}. ${actionableHint}`);
  }

  const body = (await res.json()) as { data?: { Market: DreamDexMarketRow[] }; errors?: unknown[] };
  if (body.errors?.length) {
    throw new Error(`DreamDEX indexer GraphQL errors: ${JSON.stringify(body.errors)}. ${actionableHint}`);
  }
  if (!body.data) {
    throw new Error(`DreamDEX indexer at ${indexerUrl} returned no data. ${actionableHint}`);
  }
  return body.data.Market;
}

export function toNormalizedContract(row: DreamDexMarketRow): NormalizedContract {
  const question =
    row.question && row.question.trim().length > 0
      ? row.question
      : `${row.asset ?? "the asset"} at or above ${row.strike ?? "the strike"} at expiry`;

  const description =
    `This is a DreamDEX on-chain price binary${row.asset ? ` on ${row.asset}` : ""}, settled by the Somnia oracle hub. ` +
    `Settlement questions are publicly auditable at ${ORACLE_EXPLORER_ROOT}.`;

  const resolutionRules =
    "Settlement is determined by the Somnia oracle hub's multi-source price feed sampled at the market window's " +
    "expiry; if the market is voided, all positions redeem at 0.5.";

  const closeTime = row.expiry ? new Date(Number(row.expiry) * 1000).toISOString() : undefined;

  return {
    marketId: row.marketId,
    question,
    description,
    resolutionRules,
    closeTime,
    source: "dreamdex_testnet",
  };
}
