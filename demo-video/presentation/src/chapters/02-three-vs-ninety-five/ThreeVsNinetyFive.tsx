import type { ChapterStepProps } from "../../registry/types";
import "./ThreeVsNinetyFive.css";

export default function ThreeVsNinetyFive({ step }: ChapterStepProps) {
  if (step === 0) {
    return (
      <section
        className="tvn-scene tvn-low-scene"
        aria-label="A DreamDEX Somnia Shannon snapshot has a score of three because the reference price has no participant-controlled outcome"
      >
        <div className="tvn-low-field" aria-hidden="true">
          <span className="tvn-low-orbit tvn-low-orbit-a" />
          <span className="tvn-low-orbit tvn-low-orbit-b" />
          <span className="tvn-low-orbit tvn-low-orbit-c" />
          <span className="tvn-low-signal" />
          <span className="tvn-low-signal tvn-low-signal-b" />
          <span className="tvn-low-node tvn-low-node-a" />
          <span className="tvn-low-node tvn-low-node-b" />
          <span className="tvn-low-node tvn-low-node-c" />
        </div>

        <div className="tvn-low-copy">
          <p className="tvn-kicker">DreamDEX · Somnia Shannon snapshot</p>
          <h1 className="tvn-low-title">
            No single
            <em>control point.</em>
          </h1>
          <p className="tvn-low-summary">
            The global reference price becomes public as the outcome exists.
          </p>
        </div>

        <div className="tvn-low-score-block">
          <div className="tvn-low-score-line">
            <span className="tvn-low-score">3</span>
            <span className="tvn-low-denom">/100</span>
            <span className="tvn-low-band">LOW</span>
          </div>
          <div className="tvn-low-track" aria-hidden="true">
            <span className="tvn-low-track-fill" />
            <i />
          </div>
          <p className="tvn-low-score-caption">Structural information risk</p>
        </div>

        <div className="tvn-low-specimen">
          <div className="tvn-low-specimen-head">
            <span>CAPTURED SCORE JSON</span>
            <span>dreamdex_testnet</span>
          </div>
          <p className="tvn-low-question">BTC closes at or above its opening price</p>
          <div className="tvn-low-evidence-grid">
            <div className="tvn-low-evidence-row">
              <span>D1</span>
              <b>Natural process</b>
              <i>1</i>
            </div>
            <div className="tvn-low-evidence-row">
              <span>D2</span>
              <b>No early window</b>
              <i>1</i>
            </div>
            <div className="tvn-low-evidence-row">
              <span>D4</span>
              <b>Fixed schedule</b>
              <i>1</i>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (step === 1) {
    return (
      <section
        className="tvn-scene tvn-switch-scene"
        aria-label="The event input changes from a DreamDEX snapshot to a curated individual-decision reference"
      >
        <div className="tvn-switch-heading">
          <p className="tvn-kicker">Input swap · the scoring method stays fixed</p>
          <h1 className="tvn-switch-title">
            Change the <em>event.</em>
          </h1>
        </div>

        <div className="tvn-switch-rail" aria-hidden="true">
          <span className="tvn-switch-rail-fill" />
          <span className="tvn-switch-rail-mark tvn-switch-rail-mark-a" />
          <span className="tvn-switch-rail-mark tvn-switch-rail-mark-b" />
          <span className="tvn-switch-rail-mark tvn-switch-rail-mark-c" />
        </div>

        <article className="tvn-switch-card tvn-switch-card-low">
          <div className="tvn-switch-card-label">
            <span>INPUT A</span>
            <span>3 / LOW</span>
          </div>
          <h2>DreamDEX Shannon snapshot</h2>
          <p>Global price reference</p>
          <div className="tvn-switch-card-foot">Recorded market-data input</div>
        </article>

        <div className="tvn-switch-lens" aria-hidden="true">
          <span className="tvn-switch-lens-ring tvn-switch-lens-ring-a" />
          <span className="tvn-switch-lens-ring tvn-switch-lens-ring-b" />
          <span className="tvn-switch-lens-core" />
          <span className="tvn-switch-lens-arrow" />
        </div>

        <article className="tvn-switch-card tvn-switch-card-high">
          <div className="tvn-switch-card-label">
            <span>INPUT B</span>
            <span>CURATED REFERENCE</span>
          </div>
          <h2>Individual decision</h2>
          <p>One person's private decision sets the event condition.</p>
          <div className="tvn-switch-card-foot">Reference classification data</div>
        </article>

        <p className="tvn-switch-engine">ONE DETERMINISTIC SCORING ENGINE</p>
      </section>
    );
  }

  if (step === 2) {
    return (
      <section
        className="tvn-scene tvn-high-scene"
        aria-label="The curated individual-decision reference scores ninety-five out of one hundred, high risk"
      >
        <div className="tvn-high-grid" aria-hidden="true" />
        <div className="tvn-high-copy">
          <p className="tvn-kicker">Curated reference · individual decision</p>
          <h1 className="tvn-high-title">
            Same engine.
            <em>Different field.</em>
          </h1>
          <p className="tvn-high-summary">
            The reference classification returns a high structural-risk band.
          </p>
        </div>

        <div className="tvn-high-meter" aria-label="Score 95 out of 100, high">
          <div className="tvn-high-dial" aria-hidden="true">
            <span className="tvn-high-dial-ring tvn-high-dial-ring-a" />
            <span className="tvn-high-dial-ring tvn-high-dial-ring-b" />
            <span className="tvn-high-dial-ticks" />
            <span className="tvn-high-needle" />
            <span className="tvn-high-dial-cap" />
          </div>
          <div className="tvn-high-score-readout">
            <span className="tvn-high-score">95</span>
            <span className="tvn-high-denom">/100</span>
            <span className="tvn-high-band">HIGH</span>
          </div>
        </div>

        <div className="tvn-high-record">
          <div className="tvn-high-record-head">
            <span>curated-celebrity-breakup.json</span>
            <span>REFERENCE SCORE</span>
          </div>
          <p className="tvn-high-question">
            Will Celebrity Z publicly announce a breakup with their partner before September 30, 2026?
          </p>
          <div className="tvn-high-record-rule" />
          <p className="tvn-high-record-summary">
            One person controls the outcome; the score record applies CB-1.
          </p>
        </div>
      </section>
    );
  }

  if (step === 3) {
    return (
      <section
        className="tvn-scene tvn-circuit-scene"
        aria-label="The curated reference triggers Circuit Breaker 1 because individual outcome control and unconstrained tradability are both level five"
      >
        <div className="tvn-circuit-copy">
          <p className="tvn-kicker">Curated reference · score record evidence</p>
          <h1 className="tvn-circuit-title">
            Two signals
            <em>set the floor.</em>
          </h1>
          <p className="tvn-circuit-summary">
            The rule reacts to event structure—not a claim about any person&apos;s conduct.
          </p>
        </div>

        <div className="tvn-circuit-assembly" aria-label="Circuit breaker path">
          <article className="tvn-circuit-input tvn-circuit-input-a">
            <div className="tvn-circuit-input-head">
              <span>D1 · OUTCOME CONTROL</span>
              <strong>5</strong>
            </div>
            <p>Individual will</p>
            <blockquote>“a public statement by Celebrity Z or their verified representatives”</blockquote>
          </article>

          <div className="tvn-circuit-wire tvn-circuit-wire-a" aria-hidden="true">
            <span />
          </div>

          <article className="tvn-circuit-input tvn-circuit-input-b">
            <div className="tvn-circuit-input-head">
              <span>D3 · TRADABILITY</span>
              <strong>5</strong>
            </div>
            <p>No clear restriction in the reference terms</p>
            <blockquote>“Celebrity Z or their verified representative publicly announces”</blockquote>
          </article>

          <div className="tvn-circuit-wire tvn-circuit-wire-b" aria-hidden="true">
            <span />
          </div>

          <div className="tvn-circuit-breaker">
            <span className="tvn-circuit-breaker-label">CIRCUIT BREAKER</span>
            <strong>CB-1</strong>
            <span className="tvn-circuit-breaker-floor">HIGH-RISK FLOOR</span>
            <b>95</b>
          </div>
        </div>
      </section>
    );
  }

  if (step === 4) {
    return (
      <section
        className="tvn-scene tvn-contrast-scene"
        aria-label="The difference between a DreamDEX Shannon snapshot scoring three and a curated reference scoring ninety-five demonstrates structural risk rather than outcome prediction"
      >
        <div className="tvn-contrast-copy">
          <p className="tvn-kicker">The product contrast</p>
          <h1 className="tvn-contrast-title">
            Who could
            <em>know first?</em>
          </h1>
          <p className="tvn-contrast-summary">
            Structural risk explains the information field. It does not choose a side.
          </p>
        </div>

        <figure className="tvn-contrast-capture">
          <img
            src="/assets/home-3-vs-95.png"
            alt="Recorded LevelField comparison showing a DreamDEX price-binary snapshot scored three and a curated individual-decision reference scored ninety-five"
          />
          <figcaption>
            <span>CAPTURED PRODUCT COMPARISON</span>
            <span>SNAPSHOT + CURATED REFERENCE</span>
          </figcaption>
        </figure>

        <div className="tvn-contrast-scale" aria-hidden="true">
          <span className="tvn-contrast-scale-low">3 · DreamDEX Shannon snapshot</span>
          <span className="tvn-contrast-scale-rule" />
          <span className="tvn-contrast-scale-high">95 · Curated reference</span>
        </div>

        <div className="tvn-contrast-boundary">
          <span>STRUCTURAL RISK</span>
          <i />
          <span>NOT AN OUTCOME FORECAST</span>
        </div>
      </section>
    );
  }

  if (step === 5) {
    return (
      <section
        className="tvn-scene tvn-boundary-scene"
        aria-label="LevelField does not allege wrongdoing or detect live insider activity"
      >
        <div className="tvn-boundary-aperture" aria-hidden="true">
          <span className="tvn-boundary-shutter tvn-boundary-shutter-a" />
          <span className="tvn-boundary-shutter tvn-boundary-shutter-b" />
          <span className="tvn-boundary-ring tvn-boundary-ring-a" />
          <span className="tvn-boundary-ring tvn-boundary-ring-b" />
          <span className="tvn-boundary-ring tvn-boundary-ring-c" />
        </div>

        <div className="tvn-boundary-copy">
          <p className="tvn-kicker">Scope boundary</p>
          <h1 className="tvn-boundary-title">
            A structural reading.
            <em>Not an allegation.</em>
          </h1>
          <p className="tvn-boundary-summary">
            LevelField evaluates the information conditions of an event type—not real-time conduct.
          </p>
        </div>

        <div className="tvn-boundary-ledger">
          <div className="tvn-boundary-ledger-row">
            <span>WITHIN SCOPE</span>
            <b>Who can know first?</b>
          </div>
          <div className="tvn-boundary-ledger-row">
            <span>OUTSIDE SCOPE</span>
            <b>Wrongdoing allegations</b>
          </div>
          <div className="tvn-boundary-ledger-row">
            <span>OUTSIDE SCOPE</span>
            <b>Live insider-activity detection</b>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
