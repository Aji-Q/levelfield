import type { CSSProperties } from "react";
import type { ChapterStepProps } from "../../registry/types";
import "./ProofAndGrowth.css";

const curatedScores = [3, 19, 21, 26, 45, 49, 54, 55, 65, 68, 73, 78, 80, 95, 95, 95];

const testRows = [
  { value: "69", label: "software tests", detail: "unit + integration" },
  { value: "8", label: "smart-contract tests", detail: "Forge" },
];

const audienceGroups = [
  { name: "Agents", detail: "pre-trade policy input" },
  { name: "Venues", detail: "market-design context" },
  { name: "Traders", detail: "decision context" },
];

function pointStyle(score: number, index: number): CSSProperties {
  return {
    "--pag-score": `${score}%`,
    "--pag-lane": index % 4,
    "--pag-order": index,
  } as CSSProperties;
}

function tabStyle(index: number): CSSProperties {
  return {
    "--pag-tab": index,
    "--pag-angle": `${index * (360 / 11) - 62}deg`,
  } as CSSProperties;
}

export default function ProofAndGrowth({ step }: ChapterStepProps) {
  if (step === 0) {
    return (
      <section
        className="pag-scene pag-validation"
        aria-label="Validation across sixteen curated contracts from scores three to ninety-five with Spearman rho point nine three"
      >
        <div className="pag-validation-halo" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>

        <div className="pag-validation-copy">
          <p className="pag-kicker">Curated-set evidence</p>
          <h2>
            A measured range,
            <em>not a prediction.</em>
          </h2>
          <p className="pag-validation-note">
            Internal-consistency evidence from a curated contract set.
          </p>
        </div>

        <div className="pag-evidence-readout" aria-label="Validation statistics">
          <div className="pag-evidence-stat pag-evidence-range">
            <span className="pag-stat-label">Range</span>
            <strong className="hero-num">3–95</strong>
            <span className="pag-stat-detail">risk score</span>
          </div>
          <div className="pag-evidence-stat">
            <span className="pag-stat-label">Sample</span>
            <strong className="hero-num">n=16</strong>
            <span className="pag-stat-detail">curated contracts</span>
          </div>
          <div className="pag-evidence-stat pag-evidence-rho">
            <span className="pag-stat-label">Spearman rho</span>
            <strong className="hero-num">.930</strong>
            <span className="pag-stat-detail">expected-order association</span>
          </div>
        </div>

        <div className="pag-spectrum" aria-label="Sixteen observed score marks arranged across the zero to one hundred score axis">
          <div className="pag-spectrum-topline">
            <span>16 scored contracts</span>
            <span>curated internal check</span>
          </div>
          <div className="pag-spectrum-track" aria-hidden="true">
            <span className="pag-spectrum-range" />
            {curatedScores.map((score, index) => (
              <span className="pag-score-point" key={`${score}-${index}`} style={pointStyle(score, index)} />
            ))}
            <span className="pag-spectrum-bound pag-spectrum-low">03</span>
            <span className="pag-spectrum-bound pag-spectrum-high">95</span>
          </div>
          <div className="pag-spectrum-axis" aria-hidden="true">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>
      </section>
    );
  }

  if (step === 1) {
    return (
      <section
        className="pag-scene pag-proof-stack"
        aria-label="Sixty-nine software tests, eight smart-contract tests, and a read-only official DreamDEX SDK cross-check"
      >
        <div className="pag-proof-arc" aria-hidden="true" />
        <div className="pag-proof-heading">
          <p className="pag-kicker">Verification stack</p>
          <h2>
            The number is only useful
            <em>when the path can be checked.</em>
          </h2>
        </div>

        <div className="pag-test-grid" aria-label="Passing test counts">
          {testRows.map((test, index) => (
            <article className="pag-test-card card" key={test.label} style={{ "--pag-test-order": index } as CSSProperties}>
              <div className="pag-test-rail" aria-hidden="true">
                <span />
              </div>
              <div>
                <strong className="hero-num">{test.value}</strong>
                <span className="pag-test-label">{test.label}</span>
                <span className="pag-test-detail">{test.detail}</span>
              </div>
              <span className="pag-test-status">pass</span>
            </article>
          ))}
        </div>

        <div className="pag-sdk-proof" aria-label="Official DreamDEX SDK independently cross-checks active-market discovery read-only without a private key">
          <div className="pag-sdk-caption">
            <span>Official DreamDEX SDK</span>
            <strong>Independent discovery cross-check</strong>
          </div>
          <div className="pag-sdk-route" aria-hidden="true">
            <div className="pag-sdk-node pag-sdk-sdk">SDK</div>
            <span className="pag-sdk-link pag-sdk-link-one"><i /></span>
            <div className="pag-sdk-node pag-sdk-market">active-market<br />discovery</div>
            <span className="pag-sdk-link pag-sdk-link-two"><i /></span>
            <div className="pag-sdk-node pag-sdk-match">cross-check</div>
          </div>
          <div className="pag-readonly-strip">
            <span className="pag-readonly-mark" aria-hidden="true" />
            <span>read-only</span>
            <i />
            <span>no private key</span>
          </div>
        </div>
      </section>
    );
  }

  if (step === 2) {
    return (
      <section
        className="pag-scene pag-closing"
        aria-label="Eleven evidence-backed SDK and documentation findings support LevelField for agents, venues, and traders"
      >
        <div className="pag-closing-field" aria-hidden="true">
          <span className="pag-closing-ring pag-closing-ring-one" />
          <span className="pag-closing-ring pag-closing-ring-two" />
          <span className="pag-closing-ring pag-closing-ring-three" />
          {Array.from({ length: 11 }, (_, index) => (
            <span className="pag-evidence-tab" key={index} style={tabStyle(index)} />
          ))}
        </div>

        <div className="pag-findings">
          <p className="pag-kicker">Feedback delivered</p>
          <div className="pag-findings-lockup">
            <strong className="hero-num">11</strong>
            <div>
              <span>evidence-backed findings</span>
              <small>SDK + documentation</small>
            </div>
          </div>
        </div>

        <div className="pag-closing-copy">
          <h2>
            Know who can know
            <em>before they do.</em>
          </h2>
          <p>As DreamDEX grows, structural risk becomes a pre-trade question.</p>
        </div>

        <div className="pag-audience-grid" aria-label="LevelField audiences">
          {audienceGroups.map((group, index) => (
            <div className="pag-audience" key={group.name} style={{ "--pag-audience-order": index } as CSSProperties}>
              <span className="pag-audience-line" aria-hidden="true"><i /></span>
              <strong>{group.name}</strong>
              <small>{group.detail}</small>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return null;
}
