import { readAnchorLibrary } from "@/lib/anchors";

export default function MethodologyPage() {
  const lib = readAnchorLibrary();

  return (
    <div className="content-page methodology-page">
      <p className="eyebrow">Transparent by design</p>
      <h1>Methodology</h1>
      <p className="framework-block">{lib.framework.trim()}</p>

      <div className="method-principles" aria-label="Method principles">
        <div><strong>Model</strong><span>classifies against public anchors</span></div>
        <div><strong>Code</strong><span>verifies quotes and computes every number</span></div>
        <div><strong>Chain</strong><span>attests the result and method version</span></div>
      </div>

      <h2>The five dimensions</h2>
      {lib.dimensions.map((d) => (
        <section className="methodology-dimension" key={d.id}>
          <div className="methodology-dimension-head">
            <h3>
              {d.id} · {d.name}
            </h3>
            <span className="weight-tag">weight {Math.round(d.weight * 100)}%</span>
          </div>
          <p className="methodology-question">{d.question.trim()}</p>
          <p className="methodology-guidance">{d.guidance.trim()}</p>
          <div className="table-scroll" tabIndex={0} aria-label={`${d.name} anchor levels table`}>
          <table className="level-table">
            <caption>Anchor levels for {d.name}</caption>
            <thead>
              <tr>
                <th scope="col">Level</th>
                <th scope="col">Label</th>
                <th scope="col">Definition</th>
                <th scope="col">Reference examples</th>
              </tr>
            </thead>
            <tbody>
              {d.levels.map((l) => (
                <tr key={l.level}>
                  <td className="level-num">{l.level}</td>
                  <td className="level-label">{l.label}</td>
                  <td>{l.definition.trim()}</td>
                  <td>
                    <ul>
                      {l.references.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>
      ))}

      <h2>Scoring</h2>
      <p>
        Each dimension&apos;s matched level maps to a 0–100 score via a fixed weighted formula,
        then to a band:
      </p>
      <div className="table-scroll" tabIndex={0} aria-label="Score bands table">
      <table className="level-table" style={{ marginBottom: "2rem" }}>
        <caption>Score bands</caption>
        <thead>
          <tr>
            <th scope="col">Band</th>
            <th scope="col">Score range</th>
          </tr>
        </thead>
        <tbody>
          {lib.scoring.bands.map((b) => (
            <tr key={b.name}>
              <td className="level-label">{b.name}</td>
              <td>
                {b.min}–{b.max}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <h3>Circuit breakers</h3>
      <p className="methodology-guidance" style={{ marginTop: "0.5rem" }}>
        A circuit breaker overrides the weighted score with a floor when a specific, high-risk
        structural combination is matched.
      </p>
      {lib.scoring.circuit_breakers.map((cb) => (
        <div className="circuit-breaker-block" key={cb.id}>
          <h4>
            {cb.id} — floor {cb.floor}
          </h4>
          <p style={{ margin: "0 0 0.5rem" }}>
            Condition: <code>{cb.condition}</code>
          </p>
          <p style={{ margin: 0 }}>{cb.rationale.trim()}</p>
        </div>
      ))}

      <h3>Conservative default</h3>
      <p>
        A dimension that defaults to level {lib.scoring.conservative_default.level} is always
        flagged as a caveat on the result. {lib.scoring.conservative_default.rationale.trim()}
      </p>

      <div className="not-this">
        <h2 style={{ border: "none", margin: "0 0 1rem" }}>What this is not</h2>
        <ul>
          <li>Not a prediction of any outcome, and not trading advice.</li>
          <li>
            Not live insider detection: the score reflects the structural risk of the event
            type, not activity in a specific market right now.
          </li>
          <li>Not an accusation against any person or account.</li>
        </ul>
      </div>
    </div>
  );
}
