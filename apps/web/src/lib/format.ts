import type { Band, CircuitBreaker } from "./types";

// Monochrome gray -> amber scale, per the design language: no red/green, the
// band word is always printed next to the number so color is never load-bearing.
export const BAND_LABEL: Record<Band, string> = {
  low: "low",
  moderate: "moderate",
  elevated: "elevated",
  high: "high",
};

export function weightPct(weight: number): string {
  return `${Math.round(weight * 100)}%`;
}

export const CIRCUIT_BREAKER_EXPLANATION: Record<Exclude<CircuitBreaker, null>, string> = {
  "CB-1":
    "CB-1: this market's outcome is decided by one person not clearly barred from trading it, so the score is floored (80/90/95 by how weak that bar is) regardless of the other dimensions.",
  "CB-2":
    "CB-2: this market's outcome could be manufactured unilaterally by a party able to trade it, so the score is floored (75/85/90) regardless of the other dimensions.",
};

// Per-market deep links (questions/{oracleQuestionId}) are deliberately not used: the
// indexer's oracleQuestionId pointed at unrelated questions 3/3 times in live sampling
// (docs/research-dreamdex.md §4, FEEDBACK.md #6). Root link only until that's fixed.
export const ORACLE_EXPLORER_ROOT = "https://prd.oracle.somnia.host/explore";
export const DREAMDEX_EVENT_CONTRACTS_URL = "https://app.dreamdex.io/event-contracts";

// "individual_will" -> "Individual will": internal enum labels are never shown raw
// Caller is expected to keep the raw label available
// in a title attribute alongside this.
export function humanizeLevelLabel(label: string): string {
  const spaced = label.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Truncated-middle display for on-chain ids; caller puts the full id in a title attribute.
export function truncateMiddle(id: string, front = 10, back = 8): string {
  if (id.length <= front + back + 1) return id;
  return `${id.slice(0, front)}…${id.slice(-back)}`;
}

// "2026-08-20T03:00:00.000Z" -> "2026-08-20 03:00 UTC". Plain slicing (not a Date
// re-format) so the result is identical on server and client regardless of local timezone.
export function formatExpiryUtc(expiry: string): string {
  return `${expiry.slice(0, 10)} ${expiry.slice(11, 16)} UTC`;
}

export function formatTimestampUtc(timestamp: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(timestamp)) return timestamp;
  return `${timestamp.slice(0, 10)} ${timestamp.slice(11, 16)} UTC`;
}

// Relative time to an ISO expiry, e.g. "in 34 min" / "in 4 h" / "expired". `now` is
// injectable for tests; defaults to the render-time clock (server or client).
export function formatRelativeToNow(expiry: string, now: number = Date.now()): string {
  const diffMs = new Date(expiry).getTime() - now;
  if (diffMs <= 0) return "expired";
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 60) return `in ${diffMin} min`;
  const diffHr = Math.round(diffMs / 3_600_000);
  if (diffHr < 48) return `in ${diffHr} h`;
  return `in ${Math.round(diffMs / 86_400_000)} d`;
}

// intervalSec (900, 3600, ...) -> "15-minute window" / "1-hour window". Derived from the
// typed indexer field, never inferred from question text (
// the index previously lacked intervalSec entirely).
export function windowLabel(intervalSec: string | null | undefined): string | null {
  if (intervalSec === null || intervalSec === undefined) return null;
  const sec = Number(intervalSec);
  if (!Number.isFinite(sec) || sec <= 0) return null;
  if (sec % 3600 === 0) return `${sec / 3600}-hour window`;
  if (sec % 60 === 0) return `${sec / 60}-minute window`;
  return `${sec}-second window`;
}
