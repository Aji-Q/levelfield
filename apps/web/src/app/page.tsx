import Link from "next/link";
import { BandWord } from "@/components/BandWord";
import { readScoreIndex } from "@/lib/scores";
import { formatExpiryUtc, formatRelativeToNow, windowLabel } from "@/lib/format";
import type { ScoreIndexEntry } from "@/lib/types";

export default function MarketsPage() {
  const index = readScoreIndex();
  const live = index.markets
    .filter((m) => m.source === "dreamdex_testnet")
    .sort((a, b) => b.overallScore - a.overallScore);
  const curated = index.markets
    .filter((m) => m.source === "curated")
    .sort((a, b) => b.overallScore - a.overallScore);

  const liveExample = live[0];
  const celebrityExample = curated.find((m) => m.marketId === "curated-celebrity-breakup");

  return (
    <>
      <p className="lede">
        LevelField assesses the structural information-asymmetry risk of prediction-market
        event contracts — before you bet, from the contract text alone, with no trading data.
      </p>

      <p className="landing-frame">
        DreamDEX&apos;s current price binaries score 3/100 — the structurally safest category
        this instrument can produce, and a correct null result rather than a limitation. The
        curated section below is the risk map for the categories a venue like DreamDEX would
        need to evaluate before listing next.
      </p>

      {liveExample && celebrityExample && (
        <div className="comparison-row">
          <ComparisonCard entry={liveExample} />
          <ComparisonCard entry={celebrityExample} />
        </div>
      )}

      <h2>Live — DreamDEX Shannon testnet</h2>
      <p className="section-note">Scored from typed on-chain market fields, no LLM involved.</p>
      <MarketList entries={live} emptyText="No live markets scored yet." />

      <h2>Curated risk spectrum</h2>
      <p className="section-note">
        Reference contracts spanning the full risk range, classified via the open LevelField
        protocol.
      </p>
      <MarketList entries={curated} emptyText="No curated markets scored yet." />
    </>
  );
}

function ComparisonCard({ entry }: { entry: ScoreIndexEntry }) {
  return (
    <Link href={`/market/${encodeURIComponent(entry.marketId)}`} className="comparison-card">
      <div className="comparison-card-score">
        <strong>{entry.overallScore}</strong>
        <BandWord band={entry.band} />
      </div>
      <div className="comparison-card-question">{entry.question}</div>
    </Link>
  );
}

function MarketList({ entries, emptyText }: { entries: ScoreIndexEntry[]; emptyText: string }) {
  if (entries.length === 0) {
    return <p className="empty-state">{emptyText}</p>;
  }
  return (
    <ul className="market-list">
      {entries.map((m) => (
        <li key={m.marketId}>
          <Link href={`/market/${encodeURIComponent(m.marketId)}`} className="market-row">
            <div className="market-row-top">
              <span className="market-question">{m.question}</span>
              <span className="market-score-line">
                <strong>{m.overallScore}</strong> · <BandWord band={m.band} />
              </span>
            </div>
            <div className="market-summary">{m.summary}</div>
            {m.source === "dreamdex_testnet" && m.expiry && (
              <div className="market-onchain-facts">
                <span>{m.clobStatus}</span>
                <span>
                  {formatExpiryUtc(m.expiry)} · {formatRelativeToNow(m.expiry)}
                </span>
                {windowLabel(m.intervalSec) && <span>{windowLabel(m.intervalSec)}</span>}
              </div>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
