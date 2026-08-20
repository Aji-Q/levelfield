import { MaskReveal } from "../../components/MaskReveal";
import type { ChapterStepProps } from "../../registry/types";
import "./PriceDoesNotTell.css";

const dimensions = [
  "Outcome control",
  "Early knowledge",
  "Tradability",
  "Disclosure",
  "Manufacturability",
];

// `data/scores/index.json` generatedAt: 2026-08-20T02:25:38.554Z.
// This is deliberately a fixed preview timestamp, not a freshness claim.
const previewSnapshotGeneratedAt = "2026-08-20 · 02:25:38 UTC";

export default function PriceDoesNotTell({ step }: ChapterStepProps) {
  if (step === 0) {
    return (
      <section className="pdt-scene pdt-hook" aria-label="A market price does not reveal who can know first">
        <img
          className="pdt-field-image"
          src="/assets/levelfield-risk-field.webp"
          alt="Layered topographic field surrounding a brass measuring instrument"
        />
        <div className="pdt-field-shade" />
        <div className="pdt-scan-line" aria-hidden="true">
          <span />
        </div>
        <div className="pdt-hook-copy">
          <div className="pdt-eyebrow">Event contract intelligence</div>
          <h1>
            <MaskReveal show duration={1050}>
              <span>Every contract has a price.</span>
            </MaskReveal>
          </h1>
          <div className="pdt-question">
            <span className="pdt-question-rule" />
            <MaskReveal show delay={620} duration={1050}>
              <span>Who could know first?</span>
            </MaskReveal>
          </div>
        </div>
        <div className="pdt-hook-index" aria-hidden="true">
          <span>PRICE</span>
          <span className="pdt-index-gap" />
          <span>INFORMATION FIELD</span>
        </div>
      </section>
    );
  }

  if (step === 1) {
    return (
      <section className="pdt-scene pdt-instrument" aria-label="LevelField measures structural information asymmetry before a decision">
        <div className="pdt-brand-lockup">
          <img src="/assets/level-glyph.svg" alt="" />
          <span>LevelField</span>
        </div>

        <div className="pdt-instrument-copy">
          <div className="pdt-eyebrow">Pre-trade structural risk</div>
          <h2>
            <MaskReveal show duration={950}>
              <span>Measure the field</span>
            </MaskReveal>
            <MaskReveal show delay={440} duration={950}>
              <em>before taking a side.</em>
            </MaskReveal>
          </h2>
          <p>
            Verified inputs. Deterministic scoring.
          </p>
        </div>

        <div className="pdt-dimension-rail" aria-label="Five structural dimensions">
          {dimensions.map((dimension, index) => (
            <div className="pdt-dimension" key={dimension} style={{ "--pdt-i": index } as React.CSSProperties}>
              <span className="pdt-dimension-num">0{index + 1}</span>
              <span className="pdt-dimension-tick" />
              <span className="pdt-dimension-name">{dimension}</span>
            </div>
          ))}
        </div>

        <div className="pdt-audience-line" aria-hidden="true">
          <span>TRADER</span>
          <span className="pdt-audience-track"><i /></span>
          <span>LEVELFIELD</span>
          <span className="pdt-audience-track"><i /></span>
          <span>AGENT</span>
        </div>
      </section>
    );
  }

  if (step === 2) {
    return (
    <section className="pdt-scene pdt-baseline" aria-label="A DreamDEX price binary receives a low structural-risk score of three out of one hundred">
      <div className="pdt-baseline-meta">
        <div className="pdt-eyebrow pdt-preview-snapshot">
          <span>Current preview snapshot</span>
          <span>Generated {previewSnapshotGeneratedAt}</span>
        </div>
        <div className="pdt-baseline-path">
          <span>DreamDEX</span>
          <i />
          <span>Somnia Shannon</span>
          <i />
          <span>Price binary</span>
        </div>
        <h2>
          A public price event starts at
          <em>low structural risk.</em>
        </h2>
        <div className="pdt-score-lockup">
          <span className="hero-num">3</span>
          <span className="pdt-score-denom">/100</span>
          <span className="pdt-band">LOW</span>
        </div>
        <div className="pdt-score-track" aria-hidden="true">
          <span className="pdt-score-fill" />
          <i />
        </div>
      </div>

      <div className="pdt-capture-frame">
        <img
          src="/assets/market-low-card.png"
          alt="LevelField interface showing a DreamDEX market-data reference case scored three out of one hundred, low"
        />
        <div className="pdt-capture-registration">
          <span>REAL UI</span>
          <span>SNAPSHOT</span>
        </div>
      </div>
    </section>
    );
  }

  return null;
}
