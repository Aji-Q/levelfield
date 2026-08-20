import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { BEATS, FPS } from "./beats";
import { ACCENT, ACCENT_BRIGHT, FG, FG_DIM, FG_FAINT, MONO, SANS, SERIF } from "./theme";
import { CameraVideo, Card, Chip, Counter, Glyph, Grid, KineticLine, LowerThird, MeterSweep } from "./components/core";
import { ConservativeDefault, DimBars, DotChart, EngineDiagram, SchemaCard } from "./components/diagrams";

const FONT_CSS = `
@font-face { font-family: LFInstrumentSerif; src: url('${staticFile("fonts/instrument-serif.woff2")}') format('woff2'); }
@font-face { font-family: LFPlexSans; src: url('${staticFile("fonts/plex-sans.woff2")}') format('woff2'); }
@font-face { font-family: LFPlexMono; src: url('${staticFile("fonts/plex-mono.woff2")}') format('woff2'); font-weight: 400; }
@font-face { font-family: LFPlexMono; src: url('${staticFile("fonts/plex-mono-2.woff2")}') format('woff2'); font-weight: 600; }
`;

const Center: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 46 }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", display: "flex", flexDirection: "column", gap }}>
    {children}
  </AbsoluteFill>
);

const FadeTail: React.FC<{ durationFrames: number; fade?: number }> = ({ durationFrames, fade = 8 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [durationFrames - fade, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ backgroundColor: "#0c0b09", opacity: o, pointerEvents: "none" }} />;
};

// ---- beat scenes -------------------------------------------------------------

const S0: React.FC<{ d: number }> = () => {
  const frame = useCurrentFrame();
  const gridIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Grid opacity={gridIn} />
      <Center gap={54}>
        <KineticLine text="Every event contract gives you a price." size={84} delay={6} />
        <KineticLine text="It does not tell you who could know first." size={96} delay={52} color={ACCENT_BRIGHT} />
      </Center>
    </AbsoluteFill>
  );
};

const S1: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - 8, fps: FPS, config: { damping: 100 } });
  const bg = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Grid />
      <AbsoluteFill style={{ opacity: bg * 0.55 }}>
        <CameraVideo src="captures/home-open.webm" startFrom={1.4} durationFrames={d} move={{ from: { scale: 1.02, x: 0, y: 0 }, to: { scale: 1.1, x: 0, y: -20 } }} dim={0.45} />
      </AbsoluteFill>
      <Center gap={40}>
        <div style={{ opacity: s, transform: `scale(${0.94 + s * 0.06})`, display: "flex", alignItems: "center", gap: 34 }}>
          <Glyph width={170} progress={Math.min(1, frame / 40)} />
          <span style={{ fontFamily: SERIF, fontSize: 120, color: FG }}>LevelField</span>
        </div>
        <KineticLine text="A pre-trade structural risk layer for DreamDEX." size={46} serif={false} color={FG_DIM} delay={28} perWord={2} />
      </Center>
    </AbsoluteFill>
  );
};

const S2: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <CameraVideo src="captures/market-three.webm" startFrom={1.5} durationFrames={d} move={{ from: { scale: 1.0, x: 0, y: 0 }, to: { scale: 1.12, x: -40, y: 30 } }} dim={0.32} />
    <Center>
      <div style={{ padding: "70px 110px", background: "radial-gradient(ellipse at center, rgba(12,11,9,0.9) 30%, rgba(12,11,9,0) 75%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <Counter from={0} to={3} delay={46} durationFrames={26} size={280} band="low" />
        <MeterSweep score={3} delay={52} />
      </div>
    </Center>
    <LowerThird title="Live DreamDEX market · Somnia Shannon" sub="captured snapshot · timestamped on screen" delay={20} />
  </AbsoluteFill>
);

const S3: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <CameraVideo src="captures/market-three.webm" startFrom={7.0} durationFrames={d} move={{ from: { scale: 1.08, x: 0, y: -60 }, to: { scale: 1.16, x: 0, y: -170 } }} dim={0.2} />
    <div style={{ position: "absolute", right: 100, top: 130, display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-end" }}>
      <Chip label="outcome · public process" delay={26} />
      <Chip label="disclosure · simultaneous" delay={64} />
    </div>
  </AbsoluteFill>
);

const S4: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const cut = spring({ frame, fps: FPS, config: { damping: 16, stiffness: 190 } });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${1.04 - cut * 0.04})` }}>
        <CameraVideo src="captures/curated-95.webm" startFrom={1.8} durationFrames={d} move={{ from: { scale: 1.0, x: 0, y: 0 }, to: { scale: 1.07, x: 0, y: -10 } }} dim={0.3} />
      </AbsoluteFill>
      <Center>
        <KineticLine text="Same instrument. Very different field." size={88} delay={16} />
      </Center>
      <LowerThird title="Curated reference contract" sub="individual-decision event · separate source" delay={40} />
    </AbsoluteFill>
  );
};

const S5: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <CameraVideo src="captures/curated-95.webm" startFrom={4.2} durationFrames={d} move={{ from: { scale: 1.05, x: 0, y: 0 }, to: { scale: 1.12, x: 0, y: -30 } }} dim={0.42} />
    <Center>
      <div style={{ padding: "70px 110px", background: "radial-gradient(ellipse at center, rgba(12,11,9,0.9) 30%, rgba(12,11,9,0) 75%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <Counter from={3} to={95} delay={12} durationFrames={40} size={320} band="high" />
        <MeterSweep score={95} delay={16} durationFrames={44} />
      </div>
    </Center>
  </AbsoluteFill>
);

const S6: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <CameraVideo src="captures/curated-95.webm" startFrom={8.6} durationFrames={d} move={{ from: { scale: 1.12, x: 0, y: -120 }, to: { scale: 1.22, x: 0, y: -240 } }} dim={0.18} />
    <div style={{ position: "absolute", right: 100, top: 150, display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-end" }}>
      <Chip label="D1 · outcome control · level 5" delay={40} />
      <Chip label="D3 · insider tradability · level 5" delay={100} />
      <Chip label="circuit breaker CB-1 · floor" delay={160} />
    </div>
  </AbsoluteFill>
);

const S7: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const split = spring({ frame, fps: FPS, config: { damping: 100 } });
  const plate: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: 170,
    padding: "6px 60px",
    background: "rgba(12,11,9,0.78)",
    border: "1px solid rgba(42,39,33,0.9)",
  };
  return (
    <AbsoluteFill style={{ backgroundColor: "#0c0b09" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex" }}>
        <div style={{ width: "50%", overflow: "hidden", opacity: split, borderRight: `1px solid ${ACCENT}`, position: "relative" }}>
          <CameraVideo src="captures/market-three.webm" startFrom={2.4} durationFrames={d} move={{ from: { scale: 1.12, x: 0, y: 90 }, to: { scale: 1.16, x: 0, y: 70 } }} dim={0.55} />
        </div>
        <div style={{ width: "50%", overflow: "hidden", opacity: split, position: "relative" }}>
          <CameraVideo src="captures/curated-95.webm" startFrom={4.6} durationFrames={d} move={{ from: { scale: 1.12, x: 0, y: 90 }, to: { scale: 1.16, x: 0, y: 70 } }} dim={0.55} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 130, left: 0, right: 0, display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        <span style={{ ...plate, color: FG }}>3</span>
        <span style={{ ...plate, color: ACCENT_BRIGHT }}>95</span>
      </div>
      <div style={{ position: "absolute", bottom: 100, left: 0, right: 0, textAlign: "center" }}>
        <KineticLine text="The contrast is the product." size={62} delay={60} />
      </div>
    </AbsoluteFill>
  );
};

const S8: React.FC<{ d: number }> = () => (
  <AbsoluteFill>
    <Grid />
    <Center gap={30}>
      <div style={{ fontFamily: MONO, fontSize: 30, color: FG_FAINT, letterSpacing: "0.2em" }}>SCOPE</div>
      <Chip label="not an outcome prediction" delay={12} tone="dim" />
      <Chip label="not live insider detection" delay={30} tone="dim" />
      <Chip label="not an accusation" delay={48} tone="dim" />
    </Center>
  </AbsoluteFill>
);

const S9: React.FC<{ d: number }> = () => (
  <AbsoluteFill>
    <Grid />
    <Center gap={60}>
      <KineticLine text="A public, five-dimension anchor library." size={64} delay={4} />
      <DimBars delay={30} />
    </Center>
  </AbsoluteFill>
);

const S10: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <CameraVideo src="captures/instruction-rejection.webm" startFrom={7.6} durationFrames={d} move={{ from: { scale: 1.12, x: 60, y: -40 }, to: { scale: 1.3, x: 90, y: -90 } }} dim={0.12} />
    <div style={{ position: "absolute", right: 110, bottom: 120 }}>
      <Chip label="quote ≠ contract text → not scored" delay={98} />
    </div>
  </AbsoluteFill>
);

const S11: React.FC<{ d: number }> = () => (
  <AbsoluteFill>
    <Grid />
    <Center>
      <ConservativeDefault delay={16} />
    </Center>
  </AbsoluteFill>
);

const S12: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const tail = interpolate(frame, [d - 62, d - 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Grid />
      <Center gap={70}>
        <EngineDiagram delay={8} />
        <div style={{ opacity: tail }}>
          <KineticLine text="The model never writes the number." size={56} delay={d - 60} color={ACCENT_BRIGHT} />
        </div>
      </Center>
    </AbsoluteFill>
  );
};

const S13: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <CameraVideo src="captures/mcp-policy.webm" startFrom={2.8} durationFrames={d} move={{ from: { scale: 1.0, x: 0, y: 0 }, to: { scale: 1.1, x: 0, y: 20 } }} dim={0.1} />
    <LowerThird title="Real MCP server · stdio transcript" sub="assessment only — no order submitted" delay={26} />
  </AbsoluteFill>
);

const S14: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <CameraVideo src="captures/mcp-policy.webm" startFrom={8.4} durationFrames={d} move={{ from: { scale: 1.06, x: 0, y: 0 }, to: { scale: 1.12, x: 0, y: -10 } }} dim={0.16} />
    <div style={{ position: "absolute", right: 110, top: 150, display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-end" }}>
      <Chip label="low / moderate → PROCEED" delay={28} />
      <Chip label="elevated / high → DECLINE" delay={78} />
    </div>
  </AbsoluteFill>
);

const S15: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <CameraVideo src="captures/mcp-policy.webm" startFrom={13.2} durationFrames={d} move={{ from: { scale: 1.15, x: 0, y: 60 }, to: { scale: 1.32, x: 0, y: 140 } }} dim={0.08} />
  </AbsoluteFill>
);

const S16: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <CameraVideo src="captures/explorer-v2.webm" startFrom={13.0} durationFrames={d} move={{ from: { scale: 1.0, x: 0, y: 0 }, to: { scale: 1.1, x: -30, y: -30 } }} dim={0.4} />
    <div style={{ position: "absolute", left: 110, top: 140 }}>
      <SchemaCard delay={30} />
    </div>
    <LowerThird title="Somnia Shannon · ScoreRegistry" sub="real publishBatch transactions · source verified" delay={16} />
  </AbsoluteFill>
);

const S17: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <CameraVideo src="captures/explorer-v2.webm" startFrom={18.5} durationFrames={d} move={{ from: { scale: 1.08, x: -20, y: -20 }, to: { scale: 1.14, x: -40, y: -50 } }} dim={0.5} />
    <Center>
      <SchemaCard delay={0} readback />
      <Chip label="fails closed on any mismatch" delay={70} />
    </Center>
  </AbsoluteFill>
);

const S18: React.FC<{ d: number }> = () => (
  <AbsoluteFill>
    <Grid />
    <Center gap={40}>
      <DotChart delay={10} />
    </Center>
  </AbsoluteFill>
);

const S19: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <CameraVideo src="captures/evidence-cli.webm" startFrom={12.5} durationFrames={d} move={{ from: { scale: 1.0, x: 0, y: 0 }, to: { scale: 1.12, x: 0, y: 30 } }} dim={0.16} />
    <div style={{ position: "absolute", right: 110, top: 150, display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-end" }}>
      <Chip label="69 software tests" delay={30} />
      <Chip label="8 smart-contract tests" delay={70} />
      <Chip label="SDK cross-check · read-only" delay={130} />
    </div>
  </AbsoluteFill>
);

const S20: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const dimBg = interpolate(frame, [70, 130], [0.35, 0.93], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logoIn = spring({ frame: frame - 90, fps: FPS, config: { damping: 100 } });
  return (
    <AbsoluteFill>
      <CameraVideo src="captures/closing.webm" startFrom={1.4} durationFrames={d} move={{ from: { scale: 1.0, x: 0, y: 0 }, to: { scale: 1.08, x: 0, y: -20 } }} dim={dimBg} />
      <Center gap={44}>
        <div style={{ opacity: logoIn, display: "flex", alignItems: "center", gap: 28 }}>
          <Glyph width={140} />
          <span style={{ fontFamily: SERIF, fontSize: 96, color: FG }}>LevelField</span>
        </div>
        <KineticLine text="Know who can know before you do." size={72} delay={116} color={ACCENT_BRIGHT} />
        <div style={{ opacity: interpolate(frame, [170, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), fontFamily: MONO, fontSize: 30, color: FG_FAINT }}>
          Somnia × DreamDEX · Event Contracts Hackathon
        </div>
      </Center>
    </AbsoluteFill>
  );
};

const SCENES: React.FC<{ d: number }>[] = [S0, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20];

export const Film: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0c0b09" }}>
    <style>{FONT_CSS}</style>
    {BEATS.map((b) => {
      const Scene = SCENES[b.index];
      return (
        <Sequence key={b.index} from={b.startFrame} durationInFrames={b.durationFrames} name={`S${b.index} ${b.chapter}`}>
          <Scene d={b.durationFrames} />
          <FadeTail durationFrames={b.durationFrames} />
        </Sequence>
      );
    })}
    {BEATS.map((b) => (
      <Sequence key={`a${b.index}`} from={b.startFrame} durationInFrames={b.durationFrames} name={`audio ${b.index}`}>
        <Audio src={staticFile(`audio/${b.audio}`)} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
