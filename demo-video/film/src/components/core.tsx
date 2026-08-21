import React from "react";
import {
  AbsoluteFill,
  Easing,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ACCENT, ACCENT_BRIGHT, BAND_COLOR, BG, BORDER, FG, FG_DIM, FG_FAINT, GRID_LINE, MONO, SANS, SERIF } from "../theme";

// ---------- backdrop ----------

export const Grid: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <AbsoluteFill
    style={{
      backgroundColor: BG,
      backgroundImage: `linear-gradient(${GRID_LINE} 1px, transparent 1px), linear-gradient(90deg, ${GRID_LINE} 1px, transparent 1px), radial-gradient(ellipse 120% 70% at 50% -10%, #17140e 0%, ${BG} 55%)`,
      backgroundSize: "64px 64px, 64px 64px, 100% 100%",
      opacity,
    }}
  />
);

// ---------- the level-bubble glyph ----------

export const Glyph: React.FC<{ width?: number; progress?: number; color?: string }> = ({
  width = 120,
  progress = 1,
  color = ACCENT,
}) => {
  // The bubble slides from off-center to level as progress -> 1: the brand gesture.
  const cx = interpolate(progress, [0, 1], [24, 60], { extrapolateRight: "clamp" });
  return (
    <svg width={width} viewBox="0 0 120 50" style={{ display: "block" }}>
      <rect x={4} y={8} width={112} height={34} rx={17} fill="none" stroke={color} strokeWidth={4} />
      <line x1={46} y1={9} x2={46} y2={41} stroke={color} strokeWidth={2.4} opacity={0.55} />
      <line x1={74} y1={9} x2={74} y2={41} stroke={color} strokeWidth={2.4} opacity={0.55} />
      <circle cx={cx} cy={25} r={9.5} fill={ACCENT_BRIGHT} />
    </svg>
  );
};

// ---------- camera moves over real captures ----------

export interface CameraMove {
  from: { scale: number; x: number; y: number };
  to: { scale: number; x: number; y: number };
}

export const CameraVideo: React.FC<{
  src: string;
  startFrom: number; // seconds into the source
  move: CameraMove;
  durationFrames: number;
  dim?: number; // 0..1 darkening for overlay legibility
}> = ({ src, startFrom, move, durationFrames, dim = 0 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const scale = interpolate(t, [0, 1], [move.from.scale, move.to.scale]);
  const x = interpolate(t, [0, 1], [move.from.x, move.to.x]);
  const y = interpolate(t, [0, 1], [move.from.y, move.to.y]);
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <AbsoluteFill style={{ transform: `scale(${scale}) translate(${x}px, ${y}px)` }}>
        <OffthreadVideo src={staticFile(src)} trimBefore={Math.round(startFrom * 25)} muted style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
      {dim > 0 && <AbsoluteFill style={{ backgroundColor: BG, opacity: dim }} />}
    </AbsoluteFill>
  );
};

// ---------- kinetic type ----------

export const KineticLine: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  serif?: boolean;
  color?: string;
  perWord?: number;
}> = ({ text, delay = 0, size = 92, serif = true, color = FG, perWord = 3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div
      style={{
        fontFamily: serif ? SERIF : SANS,
        fontSize: size,
        lineHeight: 1.15,
        color,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: "0.28em",
        textAlign: "center",
      }}
    >
      {words.map((w, i) => {
        const s = spring({ frame: frame - delay - i * perWord, fps, config: { damping: 200, stiffness: 90 } });
        return (
          <span key={i} style={{ opacity: s, transform: `translateY(${(1 - s) * 26}px)`, display: "inline-block" }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const Counter: React.FC<{
  from: number;
  to: number;
  delay?: number;
  durationFrames?: number;
  size?: number;
  band?: string;
}> = ({ from, to, delay = 0, durationFrames = 30, size = 300, band }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const value = Math.round(interpolate(t, [0, 1], [from, to]));
  const settle = spring({ frame: frame - delay - durationFrames, fps: 25, config: { damping: 12, stiffness: 160 } });
  const scale = 1 + (1 - Math.min(1, settle)) * 0.04 * (frame - delay >= durationFrames ? 1 : 0);
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 28, justifyContent: "center" }}>
      <span
        style={{
          fontFamily: MONO,
          fontVariantNumeric: "tabular-nums",
          fontSize: size,
          fontWeight: 500,
          letterSpacing: "-0.04em",
          color: FG,
          transform: `scale(${scale})`,
          display: "inline-block",
        }}
      >
        {value}
      </span>
      <span style={{ fontFamily: MONO, fontSize: size * 0.22, color: FG_FAINT }}>/100</span>
      {band && frame - delay > durationFrames - 4 && (
        <span style={{ fontFamily: MONO, fontSize: size * 0.3, fontWeight: 600, color: BAND_COLOR[band] ?? ACCENT }}>{band}</span>
      )}
    </div>
  );
};

// ---------- the 0-100 meter with sweeping needle ----------

export const MeterSweep: React.FC<{ score: number; delay?: number; width?: number; durationFrames?: number }> = ({
  score,
  delay = 0,
  width = 900,
  durationFrames = 32,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const pos = 8 + (Math.min(100, score) / 100) * 284 * t;
  const ticks = [];
  for (let v = 0; v <= 100; v += 5) {
    const tx = 8 + (v / 100) * 284;
    const major = v % 25 === 0;
    ticks.push(
      <line key={v} x1={tx} y1={major ? 10 : 15} x2={tx} y2={20} stroke={FG_FAINT} strokeWidth={major ? 1.1 : 0.6} opacity={major ? 0.85 : 0.4} />,
    );
  }
  return (
    <svg width={width} viewBox="0 0 300 34" style={{ display: "block" }}>
      <line x1={8} y1={20} x2={292} y2={20} stroke={FG_FAINT} strokeWidth={1} opacity={0.7} />
      {ticks}
      {[0, 25, 50, 75, 100].map((v) => (
        <text key={v} x={8 + (v / 100) * 284} y={30} textAnchor="middle" fontFamily={MONO} fontSize={6.5} fill={FG_FAINT}>
          {v}
        </text>
      ))}
      <path d={`M ${pos} 17 l -4.5 -8 h 9 z`} fill={ACCENT_BRIGHT} />
    </svg>
  );
};

// ---------- chips, stamps, lower thirds ----------

export const Chip: React.FC<{ label: string; delay?: number; tone?: "accent" | "dim" }> = ({ label, delay = 0, tone = "accent" }) => {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - delay, fps: 25, config: { damping: 14, stiffness: 170 } });
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${(1 - s) * 14}px)`,
        border: `1px solid ${tone === "accent" ? ACCENT : BORDER}`,
        color: tone === "accent" ? ACCENT_BRIGHT : FG_DIM,
        background: "rgba(12,11,9,0.82)",
        fontFamily: MONO,
        fontSize: 28,
        letterSpacing: "0.06em",
        padding: "12px 22px",
        display: "inline-block",
      }}
    >
      {label}
    </div>
  );
};

const LOWER_THIRD_POS: Record<string, React.CSSProperties> = {
  bl: { left: 90, bottom: 84 },
  tl: { left: 90, top: 110 },
  tr: { right: 90, top: 110 },
};

export const LowerThird: React.FC<{ title: string; sub?: string; delay?: number; pos?: "bl" | "tl" | "tr" }> = ({
  title,
  sub,
  delay = 0,
  pos = "bl",
}) => {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - delay, fps: 25, config: { damping: 100, stiffness: 120 } });
  return (
    <div
      style={{
        position: "absolute",
        ...LOWER_THIRD_POS[pos],
        opacity: s,
        transform: `translateY(${(1 - s) * 18}px)`,
        background: "rgba(12,11,9,0.85)",
        padding: "20px 30px 22px 26px",
      }}
    >
      <div style={{ width: 52, height: 3, background: ACCENT, marginBottom: 14 }} />
      <div style={{ fontFamily: SANS, fontSize: 40, color: FG, fontWeight: 600 }}>{title}</div>
      {sub && <div style={{ fontFamily: MONO, fontSize: 26, color: FG_DIM, marginTop: 6 }}>{sub}</div>}
    </div>
  );
};

// ---------- burned captions ----------
// Quiet, design-system caption: Plex Sans on a sharp dark plate, gentle fade+rise.
export const Caption: React.FC<{ text: string; durationFrames: number }> = ({ text, durationFrames }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, 5, Math.max(6, durationFrames - 4), durationFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = interpolate(frame, [0, 5], [8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          marginBottom: 56,
          maxWidth: 1240,
          opacity: a,
          transform: `translateY(${rise}px)`,
          background: "rgba(12,11,9,0.78)",
          backdropFilter: "blur(6px)",
          padding: "13px 30px 15px",
          fontFamily: SANS,
          fontSize: 33,
          lineHeight: 1.45,
          color: "#f2ede3",
          letterSpacing: "0.012em",
          textAlign: "center",
          textWrap: "balance",
        } as React.CSSProperties}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      border: `1px solid ${BORDER}`,
      background: "rgba(21,19,15,0.92)",
      padding: "42px 52px",
      ...style,
    }}
  >
    {children}
  </div>
);
