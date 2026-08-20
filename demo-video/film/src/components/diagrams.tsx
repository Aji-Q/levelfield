import React from "react";
import { Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { ACCENT, ACCENT_BRIGHT, BAND_COLOR, BORDER, FG, FG_DIM, FG_FAINT, MONO, SANS, SERIF } from "../theme";
import curated from "../curated-scores.json";

const DIMS = [
  { id: "D1", name: "Outcome Control", w: 30 },
  { id: "D3", name: "Insider Tradability", w: 25 },
  { id: "D2", name: "Knowledge Circle", w: 20 },
  { id: "D4", name: "Disclosure Synchronicity", w: 15 },
  { id: "D5", name: "Outcome Manufacturability", w: 10 },
];

// Five weight bars building in sequence — the anchor-library beat.
export const DimBars: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ width: 1280 }}>
      {DIMS.map((d, i) => {
        const local = frame - delay - i * 9;
        const grow = interpolate(local, [0, 22], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const s = spring({ frame: local, fps: 25, config: { damping: 200 } });
        return (
          <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 26, marginBottom: 30, opacity: s }}>
            <span style={{ fontFamily: MONO, fontSize: 30, color: ACCENT, width: 56 }}>{d.id}</span>
            <span style={{ fontFamily: SANS, fontSize: 32, color: FG, width: 470 }}>{d.name}</span>
            <div style={{ flex: 1, height: 18, border: `1px solid ${BORDER}`, position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  inset: 1,
                  width: `${grow * (d.w / 30) * 100}%`,
                  maxWidth: "100%",
                  background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_BRIGHT})`,
                }}
              />
            </div>
            <span style={{ fontFamily: MONO, fontSize: 30, color: FG_DIM, width: 90, textAlign: "right" }}>
              {Math.round(grow * d.w)}%
            </span>
          </div>
        );
      })}
    </div>
  );
};

// The engine beat: weighted sum line, then the graduated circuit-breaker floors tick in.
export const EngineDiagram: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const f1 = spring({ frame: frame - delay, fps: 25, config: { damping: 200 } });
  const floors = [
    { d3: "D3·3", v: 80 },
    { d3: "D3·4", v: 90 },
    { d3: "D3·5", v: 95 },
  ];
  return (
    <div style={{ width: 1600, textAlign: "center" }}>
      <div style={{ fontFamily: MONO, fontSize: 44, color: FG, opacity: f1, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
        score = round( 100 × Σ w<span style={{ fontSize: 34 }}>d</span> · (level<span style={{ fontSize: 34 }}>d</span> − 1) / 4 )
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 70 }}>
        {floors.map((fl, i) => {
          const s = spring({ frame: frame - delay - 26 - i * 8, fps: 25, config: { damping: 13, stiffness: 160 } });
          return (
            <div
              key={fl.v}
              style={{
                opacity: s,
                transform: `translateY(${(1 - s) * 20}px)`,
                border: `1px solid ${ACCENT}`,
                padding: "26px 44px",
                fontFamily: MONO,
              }}
            >
              <div style={{ fontSize: 28, color: FG_DIM }}>CB floor · {fl.d3}</div>
              <div style={{ fontSize: 74, color: ACCENT_BRIGHT, fontWeight: 600 }}>{fl.v}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Attestation schema card — fields light up one by one (future-tense provenance beat).
export const SchemaCard: React.FC<{ delay?: number; readback?: boolean }> = ({ delay = 0, readback = false }) => {
  const frame = useCurrentFrame();
  const fields = ["score", "band", "dims[5]", "methodHash", "scoredAt", "sourceUri"];
  return (
    <div
      style={{
        border: `1px solid ${ACCENT}`,
        background: "rgba(12,11,9,0.96)",
        padding: "38px 48px",
        width: 660,
      }}
    >
      <div style={{ fontFamily: MONO, fontSize: 22, color: FG_FAINT, letterSpacing: "0.14em", marginBottom: 22, whiteSpace: "nowrap" }}>
        ATTESTATION · AFTER REPUBLISH
      </div>
      {fields.map((f, i) => {
        const s = spring({ frame: frame - delay - i * 7, fps: 25, config: { damping: 200 } });
        const hot = readback && frame - delay > 60 + i * 5;
        return (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 18, opacity: s, marginBottom: 14 }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: hot ? ACCENT_BRIGHT : FG_FAINT }} />
            <span style={{ fontFamily: MONO, fontSize: 32, color: hot ? FG : FG_DIM }}>{f}</span>
            {hot && <span style={{ fontFamily: MONO, fontSize: 24, color: ACCENT, marginLeft: "auto" }}>read ✓</span>}
          </div>
        );
      })}
    </div>
  );
};

// Sixteen curated contracts rise into their category strip; rho counts up. Real scores.
const CAT_ORDER = ["market_data", "statistical", "public", "institutional", "individual"];
const CAT_LABEL: Record<string, string> = {
  market_data: "market data",
  statistical: "statistical",
  public: "public",
  institutional: "institutional",
  individual: "individual",
};

export const DotChart: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const W = 1600;
  const H = 560;
  const left = 310;
  const plotW = W - left - 60;
  const x = (score: number) => left + (score / 100) * plotW;
  const rho = interpolate(frame - delay - 40, [0, 30], [0, 0.93], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{ width: W }}>
      <svg width={W} height={H}>
        {CAT_ORDER.map((cat, row) => {
          const y = 60 + row * 100;
          const pts = (curated as { score: number; band: string; cat: string }[]).filter((c) => c.cat === cat);
          return (
            <g key={cat}>
              <text x={left - 18} y={y + 8} textAnchor="end" fontFamily={MONO} fontSize={24} fill={FG_DIM}>
                {CAT_LABEL[cat]}
              </text>
              <line x1={left} y1={y} x2={left + plotW} y2={y} stroke={BORDER} strokeWidth={1} />
              {pts.map((c, i) => {
                const s = spring({ frame: frame - delay - row * 6 - i * 3, fps: 25, config: { damping: 14, stiffness: 140 } });
                return (
                  <circle
                    key={i}
                    cx={x(c.score)}
                    cy={y - (1 - s) * 40}
                    r={11}
                    fill={BAND_COLOR[c.band]}
                    opacity={s}
                  />
                );
              })}
            </g>
          );
        })}
        {[0, 25, 50, 75, 100].map((v) => (
          <text key={v} x={x(v)} y={H - 28} textAnchor="middle" fontFamily={MONO} fontSize={22} fill={FG_FAINT}>
            {v}
          </text>
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "center", gap: 20, alignItems: "baseline", marginTop: 8 }}>
        <span style={{ fontFamily: SANS, fontSize: 34, color: FG_DIM }}>category order preserved · Spearman ρ</span>
        <span style={{ fontFamily: MONO, fontSize: 64, color: ACCENT_BRIGHT, fontVariantNumeric: "tabular-nums" }}>
          {rho.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

// Small conservative-default diagram: unknown -> level 4.
export const ConservativeDefault: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const s1 = spring({ frame: frame - delay, fps: 25, config: { damping: 200 } });
  const line = interpolate(frame - delay - 10, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s2 = spring({ frame: frame - delay - 26, fps: 25, config: { damping: 13, stiffness: 160 } });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
      <div style={{ opacity: s1, border: `1px dashed ${FG_FAINT}`, padding: "30px 40px", fontFamily: MONO, fontSize: 40, color: FG_DIM }}>
        information missing
      </div>
      <svg width={170} height={24}>
        <line x1={0} y1={12} x2={line * 150} y2={12} stroke={ACCENT} strokeWidth={3} />
        {line >= 1 && <path d="M 150 4 L 168 12 L 150 20 z" fill={ACCENT} />}
      </svg>
      <div
        style={{
          opacity: s2,
          transform: `scale(${0.9 + 0.1 * Math.min(1, s2)})`,
          border: `1px solid ${ACCENT}`,
          padding: "30px 44px",
          fontFamily: MONO,
          fontSize: 44,
          color: ACCENT_BRIGHT,
        }}
      >
        level 4 · conservative
      </div>
    </div>
  );
};

export { SERIF };
