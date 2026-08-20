import Link from "next/link";
import { notFound } from "next/navigation";
import { BandWord } from "@/components/BandWord";
import { readScoreIndex, readScoreResult } from "@/lib/scores";
import { CIRCUIT_BREAKER_EXPLANATION, ORACLE_EXPLORER_ROOT, weightPct } from "@/lib/format";

export function generateStaticParams() {
  const index = readScoreIndex();
  return index.markets.map((m) => ({ marketId: m.marketId }));
}

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ marketId: string }>;
}) {
  const { marketId } = await params;
  const result = readScoreResult(marketId);
  if (!result) notFound();

  // Live-market metadata (oracleQuestionId, etc.) lives on the index entry,
  // not on the per-market ScoreResult — see docs/design/no-api.md.
  const indexEntry = readScoreIndex().markets.find((m) => m.marketId === marketId);

  return (
    <>
      <div className="score-header">
        <Link href="/" className="breadcrumb">
          ← All markets
        </Link>
        <h1>{result.question}</h1>
        <div className="score-readout">
          <span className="score-numeral">
            {result.overallScore}
            <small>/100</small>
          </span>
          <span className="score-band-word">
            <BandWord band={result.band} />
          </span>
        </div>
        <p className="score-summary">{result.summary}</p>
      </div>

      {result.circuitBreaker && (
        <div className="notice">
          <span className="notice-label">Circuit breaker</span>
          {CIRCUIT_BREAKER_EXPLANATION[result.circuitBreaker]}
        </div>
      )}

      {result.flags.instructionLikeContentDetected && (
        <div className="notice">
          <span className="notice-label">Notice</span>
          This contract&apos;s description contains content that appears to address automated
          assessors.
        </div>
      )}

      {result.source === "dreamdex_testnet" && (
        <a className="oracle-link" href={ORACLE_EXPLORER_ROOT} target="_blank" rel="noopener noreferrer">
          Settlement questions are publicly auditable on the Somnia oracle explorer ↗
        </a>
      )}

      <div className="dimension-list">
        {result.dimensions.map((d) => (
          <details className="dimension" key={d.dimension}>
            <summary>
              <span>
                <span className="dimension-id">{d.dimension}</span>
                <span className="dimension-name">{d.name}</span>
              </span>
              <span className="dimension-level">
                {d.insufficientInfo
                  ? `insufficient info — defaulted to ${d.effectiveLevel}`
                  : `Level ${d.level} · ${d.levelLabel}`}
              </span>
            </summary>
            <div className="dimension-body">
              <div className="dimension-meta">
                <span>
                  <strong>Weight</strong> {weightPct(d.weight)}
                </span>
                <span>
                  <strong>Confidence</strong> {d.confidence}
                </span>
                <span>
                  <strong>Agreement</strong> {d.agreement}
                </span>
              </div>
              <p className="dimension-reasoning">{d.reasoning}</p>
              {d.evidenceQuote && <blockquote className="evidence-quote">{d.evidenceQuote}</blockquote>}
            </div>
          </details>
        ))}
      </div>

      {result.caveats.length > 0 && (
        <ul className="caveats">
          {result.caveats.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      )}

      <div className="metadata-footer">
        <span>Model: {result.metadata.model}</span>
        <span>Anchor library: v{result.metadata.anchorLibraryVersion}</span>
        <span>Runs: {result.metadata.runs}</span>
        <span>Scored: {result.metadata.scoredAt}</span>
      </div>
    </>
  );
}
