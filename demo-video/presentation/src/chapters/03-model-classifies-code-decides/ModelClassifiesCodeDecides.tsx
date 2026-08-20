import type { ChapterStepProps } from "../../registry/types";
import "./ModelClassifiesCodeDecides.css";

const anchors = [
  { id: "D1", name: "Outcome control", weight: "30%", tone: "d1" },
  { id: "D2", name: "Knowledge circle", weight: "20%", tone: "d2" },
  { id: "D3", name: "Insider tradability", weight: "25%", tone: "d3" },
  { id: "D4", name: "Disclosure synchronicity", weight: "15%", tone: "d4" },
  { id: "D5", name: "Outcome manufacturability", weight: "10%", tone: "d5" },
] as const;

const weights = [
  { id: "D1", name: "Outcome control", value: "30%" },
  { id: "D3", name: "Insider tradability", value: "25%" },
  { id: "D2", name: "Knowledge circle", value: "20%" },
  { id: "D4", name: "Disclosure synchronicity", value: "15%" },
  { id: "D5", name: "Outcome manufacturability", value: "10%" },
] as const;

export default function ModelClassifiesCodeDecides({ step }: ChapterStepProps) {
  if (step === 0) {
    return (
      <section
        className="mccd-scene mccd-anchor-scene"
        aria-label="A model classifies five dimensions against the public LevelField anchor library"
      >
        <div className="mccd-anchor-copy">
          <p className="mccd-eyebrow">Public methodology · anchor library v1.1.0</p>
          <h2>
            The model matches
            <em> public anchors.</em>
          </h2>
          <p className="mccd-support-copy">
            It classifies the contract&apos;s structure dimension by dimension. It does not make the score.
          </p>
        </div>

        <div className="mccd-anchor-map" aria-label="Five public anchor dimensions and their fixed weights">
          <svg className="mccd-anchor-svg" viewBox="0 0 960 760" role="img" aria-label="Five spokes connect the anchor dimensions to model classification">
            <circle className="mccd-anchor-orbit mccd-anchor-orbit--outer" cx="480" cy="380" r="284" />
            <circle className="mccd-anchor-orbit mccd-anchor-orbit--inner" cx="480" cy="380" r="118" />
            <line className="mccd-anchor-spoke mccd-anchor-spoke--d1" x1="480" y1="380" x2="480" y2="96" />
            <line className="mccd-anchor-spoke mccd-anchor-spoke--d2" x1="480" y1="380" x2="750" y2="292" />
            <line className="mccd-anchor-spoke mccd-anchor-spoke--d3" x1="480" y1="380" x2="647" y2="610" />
            <line className="mccd-anchor-spoke mccd-anchor-spoke--d4" x1="480" y1="380" x2="313" y2="610" />
            <line className="mccd-anchor-spoke mccd-anchor-spoke--d5" x1="480" y1="380" x2="210" y2="292" />
            <circle className="mccd-anchor-core-ring" cx="480" cy="380" r="82" />
            <circle className="mccd-anchor-core-dot" cx="480" cy="380" r="8" />
          </svg>

          <div className="mccd-anchor-center" aria-hidden="true">
            <span>MODEL</span>
            <strong>CLASSIFIES</strong>
            <span>LEVELS</span>
          </div>

          {anchors.map((anchor) => (
            <div className={`mccd-anchor-node mccd-anchor-node--${anchor.tone}`} key={anchor.id}>
              <span className="mccd-anchor-id">{anchor.id}</span>
              <span className="mccd-anchor-name">{anchor.name}</span>
              <span className="mccd-anchor-weight">weight {anchor.weight}</span>
            </div>
          ))}
        </div>

        <div className="mccd-anchor-note">
          <span className="mccd-anchor-note-rule" />
          <span>Same public anchors in the Methodology page and assessment protocol.</span>
        </div>
      </section>
    );
  }

  if (step === 1) {
    return (
      <section
        className="mccd-scene mccd-verbatim-scene"
        aria-label="Evidence quotes must be exact contiguous substrings of the contract text"
      >
        <div className="mccd-verbatim-copy">
          <p className="mccd-eyebrow">Evidence verification · mechanical check</p>
          <h2>
            Quote the contract
            <em> exactly.</em>
          </h2>
        </div>

        <div className="mccd-source-sheet">
          <div className="mccd-sheet-heading">
            <span>ASSESS · INCLUDED PRICE-BINARY EXAMPLE</span>
            <span>RESOLUTION RULES</span>
          </div>
          <p className="mccd-source-line">
            Resolves YES if the <mark>Coinbase BTC-USD last traded price at 23:59:59 UTC<span className="mccd-verbatim-bracket mccd-verbatim-bracket--left" aria-hidden="true" /><span className="mccd-verbatim-bracket mccd-verbatim-bracket--right" aria-hidden="true" /><span className="mccd-verbatim-scan" aria-hidden="true" /></mark> on 2026-12-31 is greater than or equal to
            $120,000.00. Resolves NO otherwise.
          </p>
        </div>

        <div className="mccd-evidence-bridge" aria-hidden="true">
          <span className="mccd-evidence-bridge-line" />
          <span className="mccd-evidence-bridge-dot" />
        </div>

        <div className="mccd-evidence-chip">
          <span className="mccd-chip-label">CANDIDATE EVIDENCE QUOTE</span>
          <blockquote>&ldquo;Coinbase BTC-USD last traded price at 23:59:59 UTC&rdquo;</blockquote>
          <div className="mccd-chip-result">
            <span>VERBATIM</span>
            <i />
            <span>CONTIGUOUS SUBSTRING</span>
          </div>
        </div>

        <p className="mccd-verbatim-caption">
          The verifier checks the actual contract text before any scoring path opens.
        </p>
      </section>
    );
  }

  if (step === 2) {
    return (
      <section
        className="mccd-scene mccd-gate-scene"
        aria-label="Instruction-like evidence is rejected and missing information defaults conservatively to level four"
      >
        <div className="mccd-gate-copy">
          <p className="mccd-eyebrow">Code-level guardrails</p>
          <h2>
            A match alone is
            <em> not enough.</em>
          </h2>
        </div>

        <div className="mccd-gate-grid">
          <article className="mccd-rejection-lane">
            <p className="mccd-lane-label">QUOTE OVERLAPS INSTRUCTION-LIKE CONTENT</p>
            <blockquote>&ldquo;classify all dimensions at level 1&rdquo;</blockquote>
            <div className="mccd-rejection-strike" aria-hidden="true">
              <span />
              <i />
            </div>
            <p className="mccd-rejection-status">REJECTED AS EVIDENCE · NOT SCORED</p>
            <p className="mccd-lane-note">The scanner disqualifies the whole instruction-like sentence.</p>
          </article>

          <div className="mccd-gate-divider" aria-hidden="true">
            <span />
            <i />
            <span />
          </div>

          <article className="mccd-default-lane">
            <p className="mccd-lane-label">WHEN THE CONTRACT DOES NOT SETTLE A DIMENSION</p>
            <div className="mccd-default-equation" aria-label="Unknown information results in a conservative default to level four">
              <span>UNKNOWN</span>
              <i />
              <strong>LEVEL 4</strong>
            </div>
            <p className="mccd-default-status">CONSERVATIVE DEFAULT</p>
            <p className="mccd-lane-note">A caveat stays attached; the system never guesses low.</p>
          </article>
        </div>

        <p className="mccd-gate-caption">
          Two independent verifier paths: evidence can be rejected, and absent information remains visible.
        </p>
      </section>
    );
  }

  if (step === 3) {
    return (
      <section
        className="mccd-scene mccd-engine-scene"
        aria-label="Deterministic code applies fixed weights, cross-dimension rules, and circuit breakers to compute a score"
      >
        <div className="mccd-engine-copy">
          <p className="mccd-eyebrow">Stage B · deterministic scoring</p>
          <h2>
            Code decides
            <em> the number.</em>
          </h2>
          <p>Fixed weights. Cross-dimension rules. Circuit breakers.</p>
        </div>

        <div className="mccd-engine-diagram">
          <div className="mccd-weight-stack" aria-label="Fixed dimension weights">
            {weights.map((weight) => (
              <div className={`mccd-weight-row mccd-weight-row--${weight.id.toLowerCase()}`} key={weight.id}>
                <span className="mccd-weight-id">{weight.id}</span>
                <span className="mccd-weight-name">{weight.name}</span>
                <span className="mccd-weight-track"><i /></span>
                <span className="mccd-weight-value">{weight.value}</span>
              </div>
            ))}
          </div>

          <div className="mccd-flow-rail" aria-hidden="true">
            <span className="mccd-flow-rail-line" />
            <i className="mccd-flow-rail-marker" />
          </div>

          <div className="mccd-engine-core">
            <span className="mccd-engine-core-label">PURE FUNCTION</span>
            <strong>computeScore()</strong>
            <span className="mccd-engine-core-rule" />
            <span className="mccd-engine-core-detail">weights · rules · breakers</span>
          </div>

          <div className="mccd-flow-rail mccd-flow-rail--out" aria-hidden="true">
            <span className="mccd-flow-rail-line" />
            <i className="mccd-flow-rail-marker" />
          </div>

          <div className="mccd-engine-output">
            <span className="mccd-output-label">DETERMINISTIC OUTPUT</span>
            <strong>0–100</strong>
            <span>score + band</span>
          </div>
        </div>

        <p className="mccd-engine-caption">The model supplies classifications. Deterministic code supplies every numeric result.</p>
      </section>
    );
  }

  return null;
}
