import Image from "next/image";
import Link from "next/link";
import { BandWord } from "@/components/BandWord";
import { ExpiryState } from "@/components/ExpiryState";
import { Meter } from "@/components/Meter";
import { getOnchainProvenanceStatus, readOnchainSnapshot, readScoreIndex } from "@/lib/scores";
import { formatExpiryUtc, formatTimestampUtc, windowLabel } from "@/lib/format";
import type { ScoreIndexEntry } from "@/lib/types";

export default function MarketsPage() {
  const index = readScoreIndex();
  const onchain = readOnchainSnapshot();
  const provenance = getOnchainProvenanceStatus(onchain, index);
  const live = index.markets
    .filter((m) => m.source === "dreamdex_testnet")
    .sort((a, b) => b.overallScore - a.overallScore);
  const curated = index.markets
    .filter((m) => m.source === "curated")
    .sort((a, b) => b.overallScore - a.overallScore);

  const liveExample = live[0];
  const individualExample = curated.find((m) => m.marketId === "curated-celebrity-breakup");
  const curatedScores = curated.map((entry) => entry.overallScore);
  const scoreRange = curatedScores.length
    ? `${Math.min(...curatedScores)}–${Math.max(...curatedScores)}`
    : "—";

  return (
    <div className="landing-page">
      <section className="hero" aria-labelledby="hero-title">
        <Image
          className="hero-image"
          src="/brand/levelfield-risk-field.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 760px) 100vw, 1120px"
        />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow"><span aria-hidden="true" /> Pre-trade structural risk</p>
          <h1 id="hero-title">Know who can know <br />before you do.</h1>
          <p className="hero-lede">
            LevelField reveals information asymmetry inside an event contract before you trade —
            with quoted evidence, deterministic scoring, and public on-chain attestations.
          </p>
          <div className="hero-actions">
            <Link className="button button--primary" href="/assess">Assess a contract</Link>
            <Link className="button button--quiet" href="#dreamdex-snapshot">Explore evidence</Link>
          </div>
          <ul className="trust-list" aria-label="LevelField guarantees">
            <li>No model-generated numbers</li>
            <li>Every quote verified</li>
            <li>No API key required</li>
          </ul>
        </div>
        <div className="hero-caption" aria-hidden="true">
          <span>FIELD / 01</span>
          <span>ASYMMETRY MAP</span>
        </div>
      </section>

      <section className="proof-rail" aria-label="Validation summary">
        <Proof value="5" label="structural dimensions" />
        <Proof value={scoreRange} label="curated score range" />
        <Proof value="0.93" label="validation Spearman ρ" />
        <Proof
          value={
            provenance.state === "complete"
              ? `${provenance.indexedMatchCount}/${provenance.indexedCount}`
              : provenance.state === "legacy"
                ? "awaiting"
                : "—"
          }
          label={
            provenance.state === "complete"
              ? "verified current attestations"
              : provenance.state === "legacy"
                ? "provenance republish"
                : "on-chain provenance"
          }
        />
      </section>

      <section className="narrative-section" aria-labelledby="spectrum-title">
        <div className="section-heading section-heading--split">
          <div>
            <p className="eyebrow">The core insight</p>
            <h2 id="spectrum-title">Same instrument. Very different field.</h2>
          </div>
          <p>
            DreamDEX price binaries are the correct low-risk baseline. The curated spectrum maps
            what venues and agents need to inspect as event contracts expand into human decisions.
          </p>
        </div>

        {liveExample && individualExample && (
          <div className="comparison-row">
            <ComparisonCard entry={liveExample} label="Market data" index="01" />
            <div className="comparison-bridge" aria-hidden="true">
              <span>structural asymmetry</span>
              <i />
            </div>
            <ComparisonCard entry={individualExample} label="Individual will" index="02" />
          </div>
        )}
      </section>

      <section className="process-section" aria-labelledby="process-title">
        <div className="section-heading">
          <p className="eyebrow">Open protocol</p>
          <h2 id="process-title">Evidence in. Deterministic score out.</h2>
        </div>
        <ol className="process-grid">
          <li>
            <span className="process-index">01</span>
            <h3>Classify the structure</h3>
            <p>Match five dimensions against a fixed, public anchor library.</p>
          </li>
          <li>
            <span className="process-index">02</span>
            <h3>Verify every claim</h3>
            <p>Reject hallucinated quotes and instruction-like evidence before scoring.</p>
          </li>
          <li>
            <span className="process-index">03</span>
            <h3>Score and attest</h3>
            <p>Compute in code, apply circuit breakers, then publish the result on Somnia.</p>
          </li>
        </ol>
      </section>

      <section id="dreamdex-snapshot" className="market-section" aria-labelledby="dreamdex-title">
        <div className="section-heading section-heading--split">
          <div>
            <p className="eyebrow">DreamDEX · Shannon testnet</p>
            <h2 id="dreamdex-title">Market snapshot</h2>
          </div>
          <div className="snapshot-note">
            <strong>{live.length} windows captured</strong>
            <span>Generated {formatTimestampUtc(index.generatedAt)}</span>
            <span>Expiry is live-updated in your browser; this cache is never presented as a live feed.</span>
          </div>
        </div>
        <MarketList entries={live} emptyText="No DreamDEX markets have been captured yet." />
      </section>

      <section className="market-section" aria-labelledby="curated-title">
        <div className="section-heading section-heading--split">
          <div>
            <p className="eyebrow">Reference set</p>
            <h2 id="curated-title">Curated risk spectrum</h2>
          </div>
          <p>
            {curated.length} auditable contracts spanning market data, public outcomes,
            institutional decisions, and individual will.
          </p>
        </div>
        <MarketList entries={curated} emptyText="No curated markets have been scored yet." />
      </section>

      <section className="closing-panel">
        <div>
          <p className="eyebrow">Bring your own contract</p>
          <h2>Test the field before taking a side.</h2>
        </div>
        <div>
          <p>
            Run the same open protocol with any capable model. Verification and scoring happen
            locally in your browser.
          </p>
          <Link className="text-link" href="/assess">Open the assessment workspace <span>↗</span></Link>
        </div>
      </section>
    </div>
  );
}

function Proof({ value, label }: { value: string; label: string }) {
  return (
    <div className="proof-item">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function ComparisonCard({
  entry,
  label,
  index,
}: {
  entry: ScoreIndexEntry;
  label: string;
  index: string;
}) {
  return (
    <Link href={`/market/${encodeURIComponent(entry.marketId)}`} className="comparison-card">
      <div className="comparison-card-meta">
        <span>{index} / {label}</span>
        <span>View evidence ↗</span>
      </div>
      <div className="comparison-card-score">
        <strong>{entry.overallScore}</strong>
        <span className="score-denominator">/100</span>
        <BandWord band={entry.band} />
      </div>
      <Meter score={entry.overallScore} compact />
      <div className="comparison-card-question">{entry.question}</div>
    </Link>
  );
}

function MarketList({ entries, emptyText }: { entries: ScoreIndexEntry[]; emptyText: string }) {
  if (entries.length === 0) return <p className="empty-state">{emptyText}</p>;

  return (
    <ul className="market-list">
      {entries.map((market, index) => (
        <li key={market.marketId}>
          <Link href={`/market/${encodeURIComponent(market.marketId)}`} className="market-row">
            <div className="market-row-index">{String(index + 1).padStart(2, "0")}</div>
            <div className="market-row-content">
              <div className="market-row-top">
                <span className="market-question">{market.question}</span>
                <span className="market-score-line">
                  <strong>{market.overallScore}</strong> · <BandWord band={market.band} />
                </span>
              </div>
              <div className="market-summary">{market.summary}</div>
              {market.source === "dreamdex_testnet" && market.expiry && (
                <div className="market-onchain-facts">
                  <span>{market.clobStatus ?? "status unknown"} at capture</span>
                  <span><time dateTime={market.expiry}>{formatExpiryUtc(market.expiry)}</time></span>
                  <ExpiryState expiry={market.expiry} />
                  {windowLabel(market.intervalSec) && <span>{windowLabel(market.intervalSec)}</span>}
                </div>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
