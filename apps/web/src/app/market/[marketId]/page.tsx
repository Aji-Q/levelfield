import Link from "next/link";
import { notFound } from "next/navigation";
import { BandWord } from "@/components/BandWord";
import { ExpiryState } from "@/components/ExpiryState";
import { Meter } from "@/components/Meter";
import {
  getOnchainProvenanceStatus,
  isValidProvenanceUri,
  readOnchainSnapshot,
  readScoreIndex,
  readScoreResult,
} from "@/lib/scores";
import {
  CIRCUIT_BREAKER_EXPLANATION,
  DREAMDEX_EVENT_CONTRACTS_URL,
  ORACLE_EXPLORER_ROOT,
  formatExpiryUtc,
  humanizeLevelLabel,
  truncateMiddle,
  weightPct,
  windowLabel,
} from "@/lib/format";

// Review §3.3: an opaque contract (many dimensions insufficient_info) rendered a
// numeric score that read as a verdict rather than an absence. At this threshold the
// text-derived signal is thin enough that the number is more misleading than useful.
const UNDETERMINABLE_THRESHOLD = 3;

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
  const scoreIndex = readScoreIndex();
  const indexEntry = scoreIndex.markets.find((m) => m.marketId === marketId);

  const insufficientDims = result.dimensions.filter((d) => d.insufficientInfo);
  const undeterminable = insufficientDims.length >= UNDETERMINABLE_THRESHOLD;

  const onchain = readOnchainSnapshot();
  const attestation = onchain?.markets[marketId] ?? null;
  const provenance = getOnchainProvenanceStatus(onchain, scoreIndex);
  const attestedSourceUri = attestation && isValidProvenanceUri(attestation.uri) ? attestation.uri : null;

  return (
    <article className="content-page market-detail-page">
      <div className="score-header">
        <Link href="/" className="breadcrumb">
          ← All markets
        </Link>
        <h1>{result.question}</h1>
        <div className="score-readout">
          {undeterminable ? (
            <span className="score-numeral score-numeral--undeterminable">—</span>
          ) : (
            <>
              <span className="score-numeral">
                {result.overallScore}
                <small>/100</small>
              </span>
              <span className="score-band-word">
                <BandWord band={result.band} />
              </span>
            </>
          )}
        </div>
        {!undeterminable && <Meter score={result.overallScore} />}
        <p className="score-summary">
          {undeterminable
            ? `Not enough contract text to assess: ${insufficientDims.map((d) => d.name).join(", ")}.`
            : result.summary}
        </p>
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
        <div className="onchain-facts">
          <span className="onchain-facts-label">On-chain</span>
          <dl className="onchain-facts-grid">
            <div>
              <dt>Market ID</dt>
              <dd title={result.marketId}>{truncateMiddle(result.marketId)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{indexEntry?.clobStatus ?? "unknown"}</dd>
            </div>
            <div>
              <dt>Expiry</dt>
              <dd>
                {indexEntry?.expiry
                  ? (
                      <>
                        <time dateTime={indexEntry.expiry}>{formatExpiryUtc(indexEntry.expiry)}</time>
                        {" · "}<ExpiryState expiry={indexEntry.expiry} />
                      </>
                    )
                  : "unknown"}
              </dd>
            </div>
            <div>
              <dt>Window</dt>
              <dd>{windowLabel(indexEntry?.intervalSec) ?? "unknown"}</dd>
            </div>
          </dl>
          <div className="onchain-actions">
            <a className="oracle-link" href={DREAMDEX_EVENT_CONTRACTS_URL} target="_blank" rel="noopener noreferrer">
              Open DreamDEX event contracts ↗
            </a>
            <a className="oracle-link" href={ORACLE_EXPLORER_ROOT} target="_blank" rel="noopener noreferrer">
              Audit settlement questions on Somnia ↗
            </a>
          </div>
        </div>
      )}

      {onchain && attestation && attestedSourceUri && provenance.state === "complete" && (
        <div className="onchain-facts">
          <span className="onchain-facts-label">On-chain attestation</span>
          <dl className="onchain-facts-grid">
            <div>
              <dt>Registry</dt>
              <dd title={onchain.registryAddress}>
                <a
                  className="oracle-link"
                  href={`${onchain.explorerBase}/address/${onchain.registryAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {truncateMiddle(onchain.registryAddress)} ↗
                </a>
              </dd>
            </div>
            <div>
              <dt>Attested score</dt>
              <dd>
                {attestation.score} · {attestation.band}
                {attestation.matchesCache ? " — matches this page" : " — DIFFERS from this page (republish pending)"}
              </dd>
            </div>
            <div>
              <dt>Method hash</dt>
              <dd title={attestation.methodHash}>{truncateMiddle(attestation.methodHash)}</dd>
            </div>
            <div>
              <dt>Read back</dt>
              <dd>{onchain.verifiedAt}</dd>
            </div>
            <div>
              <dt>Source record</dt>
              <dd>
                <a className="oracle-link" href={attestedSourceUri} target="_blank" rel="noopener noreferrer">
                  Open attested score ↗
                </a>
              </dd>
            </div>
          </dl>
          <p className="section-note">
            This score is published on Somnia Shannon (chain {onchain.chainId}) as a public good: any
            contract or agent can read it from the registry without this site. The method hash pins it
            to the exact anchor-library version that produced it.
          </p>
        </div>
      )}

      {onchain && attestation && provenance.state === "legacy" && (
        <div className="onchain-facts onchain-facts--legacy" role="status">
          <span className="onchain-facts-label">Legacy provenance</span>
          <p className="section-note">
            This cached registry snapshot predates source-URI verification. It is awaiting republish
            with a valid source record before LevelField treats it as current provenance.
          </p>
          <a
            className="oracle-link"
            href={`${onchain.explorerBase}/address/${onchain.registryAddress}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View the Somnia registry ↗
          </a>
        </div>
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
                  : d.level === null || d.levelLabel === null
                    ? "Not determinable from contract text"
                    : (
                        <>
                          Level {d.level} · <span title={d.levelLabel}>{humanizeLevelLabel(d.levelLabel)}</span>
                        </>
                      )}
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
    </article>
  );
}
