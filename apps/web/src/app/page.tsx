import Link from "next/link";
import { BandWord } from "@/components/BandWord";
import { readScoreIndex } from "@/lib/scores";
import type { ScoreIndexEntry } from "@/lib/types";

export default function MarketsPage() {
  const index = readScoreIndex();
  const live = index.markets
    .filter((m) => m.source === "dreamdex_testnet")
    .sort((a, b) => b.overallScore - a.overallScore);
  const curated = index.markets
    .filter((m) => m.source === "curated")
    .sort((a, b) => b.overallScore - a.overallScore);

  return (
    <>
      <p className="lede">
        LevelField assesses the structural information-asymmetry risk of prediction-market
        event contracts — before you bet, from the contract text alone, with no trading data.
      </p>

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
          </Link>
        </li>
      ))}
    </ul>
  );
}
