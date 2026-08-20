import { MaskReveal } from "../../components/MaskReveal";
import type { ChapterStepProps } from "../../registry/types";
import "./AgentToChain.css";

const registryAddress = "0xb8e11dea346f2c961880879606a269db3165bbc7";

function TerminalHeader({ label }: { label: string }) {
  return (
    <div className="atc-terminal-head">
      <span className="atc-terminal-mark" aria-hidden="true" />
      <span>{label}</span>
      <span className="atc-terminal-status">REPRODUCIBLE TRANSCRIPT</span>
    </div>
  );
}

function StepConnect() {
  return (
    <section className="atc-scene atc-connect" aria-label="A reproducible transcript shows an agent connecting to the LevelField MCP server over standard input and output">
      <div className="atc-chapter-label">04 · Agent policy gate</div>
      <div className="atc-connect-copy">
        <div className="atc-kicker">Before any action</div>
        <h2>
          <MaskReveal show duration={900}>
            <span>The agent asks</span>
          </MaskReveal>
          <MaskReveal show delay={360} duration={900}>
            <em>LevelField first.</em>
          </MaskReveal>
        </h2>
        <p>One reproducible MCP transcript. A visible policy. No order is submitted in this demo.</p>
      </div>

      <div className="atc-terminal atc-terminal-connect">
        <TerminalHeader label="npm run demo:agent" />
        <div className="atc-terminal-body">
          <p className="atc-command"><span>$</span> npx tsx scripts/agent-demo.ts</p>
          <p>LevelField agent demo: pre-trade risk check</p>
          <p className="atc-terminal-rule">============================================================</p>
          <p className="atc-line-draw">
            <span className="atc-ok">●</span> Connected to the LevelField MCP server over stdio
          </p>
          <p className="atc-terminal-dim">npx tsx packages/mcp/src/server.ts</p>
        </div>
      </div>

      <svg className="atc-connect-route" viewBox="0 0 600 140" aria-hidden="true">
        <path d="M10 70 H224" />
        <path d="M376 70 H590" />
        <rect x="224" y="18" width="152" height="104" />
        <text x="300" y="62" textAnchor="middle">MCP</text>
        <text x="300" y="91" textAnchor="middle">STDIO</text>
      </svg>
      <div className="atc-route-labels" aria-hidden="true"><span>AGENT</span><span>LEVELFIELD</span></div>
    </section>
  );
}

function StepPolicy() {
  const bands = [
    { range: "00—24", band: "LOW", decision: "PROCEED" },
    { range: "25—49", band: "MODERATE", decision: "PROCEED" },
    { range: "50—74", band: "ELEVATED", decision: "DECLINE" },
    { range: "75—100", band: "HIGH", decision: "DECLINE" },
  ];

  return (
    <section className="atc-scene atc-policy" aria-label="Visible policy maps low and moderate risk to proceed and elevated and high risk to decline">
      <header className="atc-policy-head">
        <div>
          <div className="atc-kicker">Deterministic pre-action gate</div>
          <h2>A policy you can read.</h2>
        </div>
        <p>Band in. Decision out.</p>
      </header>

      <div className="atc-policy-grid">
        {bands.map((item, index) => (
          <div className="atc-policy-row" key={item.band} style={{ "--atc-i": index } as React.CSSProperties}>
            <span className="atc-band-range">{item.range}</span>
            <span className="atc-band-name">{item.band}</span>
            <span className="atc-policy-line"><i /></span>
            <span className={`atc-decision ${item.decision === "DECLINE" ? "atc-decision-decline" : ""}`}>
              {item.decision}
            </span>
          </div>
        ))}
      </div>
      <div className="atc-policy-note">
        <span>Transparent threshold</span>
        <span>Risk assessment—not trade execution</span>
      </div>
    </section>
  );
}

function StepDecisions() {
  return (
    <section className="atc-scene atc-decisions" aria-label="An MCP response transcript shows proceed at three and decline at ninety-five">
      <div className="atc-decision-title">
        <div className="atc-kicker">MCP response transcript · cache snapshot</div>
        <h2>Same policy. Opposite decisions.</h2>
      </div>

      <article className="atc-result atc-result-low">
        <div className="atc-result-index">01 · DREAMDEX REFERENCE</div>
        <div className="atc-result-score"><span className="hero-num">3</span><i>/100</i></div>
        <div className="atc-result-band">LOW</div>
        <div className="atc-result-action">PROCEED</div>
        <p>Public price binary · score cache snapshot</p>
      </article>

      <div className="atc-result-axis" aria-hidden="true">
        <span />
        <i>FIXED POLICY</i>
        <span />
      </div>

      <article className="atc-result atc-result-high">
        <div className="atc-result-index">02 · CURATED REFERENCE</div>
        <div className="atc-result-score"><span className="hero-num">95</span><i>/100</i></div>
        <div className="atc-result-band">HIGH · CB-1</div>
        <div className="atc-result-action">DECLINE</div>
        <p>One person decides · reason attached</p>
      </article>
    </section>
  );
}

function StepRegistry() {
  const fields = ["SCORE + BAND", "D1—D5", "METHOD HASH", "TIMESTAMP", "IMMUTABLE SOURCE"];
  return (
    <section className="atc-scene atc-registry" aria-label="The registry is deployed, while current source-bound attestations await a provenance-complete republish">
      <div className="atc-registry-top">
        <div>
          <div className="atc-kicker">Somnia Shannon · ScoreRegistry</div>
          <h2>Bind the score<br /><em>to its source.</em></h2>
        </div>
        <div className="atc-registry-state">
          <span className="atc-state-key">CONTRACT</span>
          <span className="atc-state-value">DEPLOYED</span>
          <span className="atc-state-key">LEGACY PROVENANCE</span>
          <span className="atc-state-pending">URI MISMATCH</span>
          <span className="atc-state-key">VERIFIED SNAPSHOT</span>
          <span className="atc-state-pending">NOT WRITTEN</span>
        </div>
      </div>

      <div className="atc-ledger">
        <div className="atc-ledger-head">
          <span>ATTESTATION SCHEMA</span>
          <span>AFTER PROVENANCE-COMPLETE REPUBLISH</span>
        </div>
        <div className="atc-ledger-fields">
          {fields.map((field, index) => (
            <div key={field} style={{ "--atc-i": index } as React.CSSProperties}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{field}</strong>
              <i />
            </div>
          ))}
        </div>
        <div className="atc-ledger-address">
          <span>REGISTRY</span>
          <code>{registryAddress}</code>
        </div>
      </div>
    </section>
  );
}

function StepVerify() {
  const checks = ["score + band", "five dimensions", "method hash", "scored at", "source URI"];
  return (
    <section className="atc-scene atc-verify" aria-label="The verifier shows a legacy URI mismatch and leaves the verified snapshot unwritten">
      <div className="atc-verify-copy">
        <div className="atc-kicker">Read back · compare every field</div>
        <h2>Anything missing<br />or changed?</h2>
        <div className="atc-fail-seal">
          <span>FAIL CLOSED</span>
          <i>snapshot not written</i>
        </div>
      </div>

      <div className="atc-verify-panel">
        <div className="atc-verify-header"><span>ON-CHAIN</span><span>LOCAL CACHE</span></div>
        {checks.map((check, index) => (
          <div className="atc-check" key={check} style={{ "--atc-i": index } as React.CSSProperties}>
            <span className="atc-check-source">READ</span>
            <span className="atc-check-track"><i /></span>
            <strong>{check}</strong>
            <span className="atc-check-track atc-check-track-back"><i /></span>
            <span className="atc-check-source">EXPECT</span>
          </div>
        ))}
        <div className="atc-verify-result">
          <code>legacy URI mismatch</code>
          <span>SNAPSHOT NOT WRITTEN</span>
        </div>
      </div>
      <div className="atc-verify-foot">Legacy provenance: URI mismatch · verified snapshot not written.</div>
    </section>
  );
}

export default function AgentToChain({ step }: ChapterStepProps) {
  if (step === 0) return <StepConnect />;
  if (step === 1) return <StepPolicy />;
  if (step === 2) return <StepDecisions />;
  if (step === 3) return <StepRegistry />;
  if (step === 4) return <StepVerify />;
  return null;
}
