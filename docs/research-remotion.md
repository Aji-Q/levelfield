# Remotion motion-design research (for demo video upgrade)

> Scope: primary-source techniques for turning the 2:53 screen-capture-plus-narration demo into a
> designed motion piece with Remotion. Real product captures stay the evidence layer; everything
> below is camera/type/diagram/transition/audio/render tooling to build *around* and *on top of*
> those captures.

**Important repo-state finding, checked before writing this doc:** `demo-video/presentation`
(`/Users/qinjiaji/Desktop/GitProject/levelfield/demo-video/presentation/package.json`) currently
has **no Remotion dependency at all** — only `react`, `react-dom`, `vite`. The render pipeline is a
bespoke Playwright-screenshot-to-ffmpeg-concat script
(`demo-video/presentation/scripts/render-video.mjs`), not `@remotion/renderer`. The task brief's
premise ("the repo already uses Remotion 4.x in demo-video/presentation") does not match what's on
disk today. This doc is written as if adopting Remotion fresh into that directory (or a sibling
`demo-video/remotion` package) — see the "adoption note" at the end of the recommended-stack
section.

---

## 1. Camera moves on video layers (Ken Burns, zoom-to-region)

**Technique.** Ken Burns on a video/image layer is just CSS `transform: scale() translate()`
driven by frame number, wrapped around an `<OffthreadVideo>`/`<Img>` inside an `AbsoluteFill` with
`overflow: hidden` on the parent so the scaled-up layer doesn't clip the frame edges. Use
`interpolate()` for a linear/eased camera move (predictable arrival time — good for "arrive exactly
when narration hits a beat"); use `spring()` when the move should feel like it has momentum/overshoot
(good for a "punch-in" on a score reveal). Multi-keyframe `interpolate()` (array input/output ranges)
lets one call encode zoom-in/hold/zoom-out without chaining multiple calls. "Zoom to region"
(screen-studio style) is the same primitive with the transform-origin computed from the target
DOM rect's pixel coordinates instead of `center`, so the zoom converges on a click target or UI
element rather than the frame center.

**APIs.**
- `interpolate(input, inputRange, outputRange, options)` — core primitive, `remotion` package.
  `extrapolateLeft`/`extrapolateRight`: `'extend' | 'clamp' | 'wrap' | 'identity'`. `easing` accepts
  a function or an array (length = `inputRange.length - 1`) for per-segment curves.
- `spring({frame, fps, config, from, to, durationInFrames, delay})` — `remotion` package.
  `config.damping` (default 10), `config.stiffness` (default 100), `config.mass` (default 1),
  `config.overshootClamping` (default false, set `true` to kill overshoot on a hard zoom-in).
- `<OffthreadVideo src style transparent toneMapped trimBefore trimAfter>` — `remotion` package.
  `trimBefore`/`trimAfter` are the current names (frame counts); `startFrom`/`endAt` were renamed to
  these in v4.0.319 and are deprecated aliases. `transparent` forces PNG frame extraction (slower);
  leave `false` (BMP, faster) unless you need alpha.

**Fps matching (25fps source into a 25fps comp).** Set the Remotion `<Composition fps={25}>` to
match your capture's native frame rate exactly. `OffthreadVideo` decodes the exact video frame for
the current composition frame via ffmpeg's `-ss`/frame-accurate seeking — when comp fps === source
fps there is a 1:1 frame mapping and no resampling/frame-blend interpolation happens; when they
differ, Remotion has to interpolate between source frames (blur/ghosting risk on fast pans). Since
your captures are screen recordings, exporting the composition at 25fps (not 30) avoids that
resampling step entirely — confirmed by Remotion's own guidance that mismatched fps forces frame
interpolation on `OffthreadVideo`.

**Snippet — zoom-in/hold/zoom-out Ken Burns over a capture, clamped to no overshoot on entry:**
```tsx
// pattern from remotion-dev/remotion discussion #639 (github.com/orgs/remotion-dev/discussions/639),
// adapted to OffthreadVideo + a wrapping AbsoluteFill for overflow clipping
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';

export const KenBurnsCapture: React.FC<{src: string; durationInFrames: number}> = ({
  src,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const d = durationInFrames;

  const scale = interpolate(
    frame,
    [0, d / 4, (2 * d) / 4, (3 * d) / 4, d],
    [1, 1.15, 1.15, 1.15, 1],
    {extrapolateRight: 'clamp'},
  );

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <OffthreadVideo
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${scale})`,
          transformOrigin: 'center',
        }}
      />
    </AbsoluteFill>
  );
};
```

**Snippet — zoom-to-region (screen-studio style), converging on a pixel rect:**
```tsx
// derived pattern: same interpolate() primitive, transformOrigin computed from a target rect
// instead of 'center'. Compute targetRect once (e.g. from a captured DOM bounding box logged
// during the Playwright capture pass) and pass it as a prop.
const zoomProgress = interpolate(frame, [startFrame, startFrame + 20], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
const scale = interpolate(zoomProgress, [0, 1], [1, 2.2]);
const originX = (targetRect.x + targetRect.width / 2) / videoWidth * 100;
const originY = (targetRect.y + targetRect.height / 2) / videoHeight * 100;

<OffthreadVideo
  style={{
    transform: `scale(${scale})`,
    transformOrigin: `${originX}% ${originY}%`,
  }}
  src={src}
/>;
```

**Sources.**
- https://www.remotion.dev/docs/interpolate
- https://www.remotion.dev/docs/spring
- https://www.remotion.dev/docs/offthreadvideo
- https://github.com/orgs/remotion-dev/discussions/639 (Ken Burns zoom in/out array-interpolate pattern)
- https://remotion-bits.dev/docs/bits/ken-burns/ (Scene3D-step-based Ken Burns bit, image-only)

---

## 2. Transitions

**Technique.** `@remotion/transitions` gives you `<TransitionSeries>`, a drop-in replacement for
`<Series>` where consecutive `<TransitionSeries.Sequence>` blocks are joined by a
`<TransitionSeries.Transition>` that overlaps the tail of one scene with the head of the next —
the transition's `durationInFrames` is *subtracted* from the total timeline (the two clips genuinely
overlap), which is what makes it read as a cut instead of a crossfade sandwiched between two static
holds. Built-in presentations: `fade`, `slide`, `wipe`, `clockWipe`, `flip`, `iris` (import each
from its own subpath, e.g. `@remotion/transitions/fade`, so unused ones tree-shake out). Timing is
either `linearTiming({durationInFrames})` (constant-speed cut) or
`springTiming({config, durationInFrames})` (eased, can overshoot/settle like a real camera cut).
Custom presentations are just a component receiving `presentationProgress` (0–1) and
`presentationDirection` (`'entering' | 'exiting'`) — cheap to write your own "glitch" or "scan-line"
transition matching a product's visual language.

**APIs.** `npx remotion add @remotion/transitions` installs it.
```tsx
import {AbsoluteFill} from 'remotion';
import {linearTiming, springTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {wipe} from '@remotion/transitions/wipe';
import {slide} from '@remotion/transitions/slide';
```

**Snippet — TransitionSeries with mixed timing (spring fade, then a linear wipe):**
```tsx
// adapted from remotion.dev/docs/transitions/transitionseries
export const TransitionExample: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={60}>
      <Fill color="#0b84f3" />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition
      timing={springTiming({config: {damping: 200}})}
      presentation={fade()}
    />

    <TransitionSeries.Sequence durationInFrames={60}>
      <Fill color="pink" />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition
      timing={linearTiming({durationInFrames: 30})}
      presentation={wipe()}
    />

    <TransitionSeries.Sequence durationInFrames={60}>
      <Fill color="#2ecc71" />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
```

`wipe()` takes a `direction` of `'from-left' | 'from-top-left' | 'from-top' | 'from-top-right' |
'from-right' | 'from-bottom-right' | 'from-bottom' | 'from-bottom-left'`, plus (v4.0.84+)
`outerEnterStyle`/`outerExitStyle`/`innerEnterStyle`/`innerExitStyle` for styling the two layers
independently — useful for adding a colored "seam" line on the wipe edge.

**Snippet — minimal custom presentation shape:**
```tsx
// adapted from remotion.dev/docs/transitions/presentations/custom
import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';

type ScanlinePresentationProps = {color: string};

const ScanlinePresentation: React.FC<
  TransitionPresentationComponentProps<ScanlinePresentationProps>
> = ({children, presentationDirection, presentationProgress, passedProps}) => {
  const clipPath =
    presentationDirection === 'entering'
      ? `inset(${(1 - presentationProgress) * 100}% 0 0 0)`
      : undefined;
  return (
    <AbsoluteFill style={{clipPath}}>
      <AbsoluteFill>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const scanlinePresentation = (
  props: ScanlinePresentationProps,
): TransitionPresentation<ScanlinePresentationProps> => ({component: ScanlinePresentation, props});
```

**Community transition packs found (real repos, worth reading before writing your own):**
- `Ashad001/remotion-transitions` — "production-ready TransitionPresentation patterns with
  animation math" — https://github.com/Ashad001/remotion-transitions
- `marcusstenbeck/remotion-transition-series` — a `<Series>`-with-transitions component predating
  the official package, useful as a second reference implementation —
  https://github.com/marcusstenbeck/remotion-transition-series
- `naveen-annam/creativly.ai-brand-video-remotion` — real production brand video, "17 cinematic
  scenes, 13 transitions" orchestrated through `TransitionSeries` in `src/BrandVideo.tsx` (fade,
  slide, wipe, clockWipe) — good full-film reference for pacing a multi-chapter piece —
  https://github.com/naveen-annam/creativly.ai-brand-video-remotion

**Sources.**
- https://www.remotion.dev/docs/transitions/
- https://www.remotion.dev/docs/transitions/transitionseries
- https://www.remotion.dev/docs/transitions/presentations/wipe
- https://www.remotion.dev/docs/transitions/presentations/custom
- https://github.com/remotion-dev/remotion/blob/main/packages/transitions/src/TransitionSeries.tsx

---

## 3. Kinetic typography & number animations

**Technique.** Three reveal families cover almost everything a demo needs: (a) opacity+translate
stagger per word/char driven by `spring()` with a per-item `delay`, for headline reveals; (b)
character-count typewriter driven by linear frame math, for terminal/CLI-flavored beats; (c) numeric
counters that map frame → target value via `interpolate()` (linear count-up) or wrap a `spring()`
output for a "counter that overshoots then settles" feel — exactly the shape needed for a 3 → 95
score reveal. `@remotion/google-fonts` gives type-safe, per-weight font loading so headline type
doesn't depend on system fonts being installed on the render machine (critical for CI/headless
renders).

**APIs.**
- `spring({frame, fps, config: {damping, stiffness}})` — stagger driver, `remotion` package.
- `interpolate(frame, [0, duration], [0, targetValue], {extrapolateRight: 'clamp'})` — counter math.
- `loadFont('normal', {weights, subsets})` from `@remotion/google-fonts/<FontName>` — one import per
  font family (tree-shakeable), returns `{fontFamily}`. Install: `npm install @remotion/google-fonts`.

**Snippet — staggered word/line reveal (spring-driven, translateX + opacity):**
```tsx
// pattern from resemble-ai/remotion-resemble-skill visual-animations.md
// (github.com/resemble-ai/remotion-resemble-skill)
const StaggeredList: React.FC<{items: string[]}> = ({items}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {items.map((item, index) => {
        const delay = index * 5; // 5-frame stagger between lines
        const progress = spring({
          frame: frame - delay,
          fps,
          config: {damping: 12, stiffness: 100},
        });
        return (
          <div
            key={index}
            style={{
              opacity: progress,
              transform: `translateX(${interpolate(progress, [0, 1], [-50, 0])}px)`,
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
};
```

**Snippet — score counter (3 → 95 style), linear count with tabular-nums to prevent digit jitter:**
```tsx
// pattern from resemble-ai/remotion-resemble-skill visual-animations.md
const AnimatedCounter: React.FC<{value: number; duration?: number; prefix?: string; suffix?: string}> = ({
  value,
  duration = 60,
  prefix = '',
  suffix = '',
}) => {
  const frame = useCurrentFrame();
  const currentValue = Math.round(
    interpolate(frame, [0, duration], [0, value], {extrapolateRight: 'clamp'}),
  );
  return (
    <span style={{fontVariantNumeric: 'tabular-nums'}}>
      {prefix}
      {currentValue.toLocaleString()}
      {suffix}
    </span>
  );
};
// For an overshoot-then-settle counter (e.g. landing on 95 with a little bounce):
// wrap the interpolate's *input* in a spring() output instead of raw frame:
const springProgress = spring({frame, fps, config: {damping: 12, stiffness: 100}});
const bouncyValue = Math.round(interpolate(springProgress, [0, 1], [0, 95]));
```

**Snippet — Google Fonts, type-safe load:**
```tsx
import {loadFont} from '@remotion/google-fonts/TitanOne';
const {fontFamily} = loadFont('normal', {weights: ['400'], subsets: ['latin']});
// <div style={{fontFamily}}>Know who can know first.</div>
```

**Typewriter (for terminal-flavored kinetic type, not a real terminal — see §6 for that):**
```tsx
const Typewriter: React.FC<{text: string; startFrame?: number}> = ({text, startFrame = 0}) => {
  const frame = useCurrentFrame();
  const charsToShow = Math.floor((frame - startFrame) * 2); // ~2 chars/frame at 25fps ≈ 50 chars/s
  const displayText = text.slice(0, Math.max(0, charsToShow));
  const showCursor = Math.floor(frame / 15) % 2 === 0;
  return (
    <span style={{fontFamily: 'monospace'}}>
      {displayText}
      {showCursor && <span>|</span>}
    </span>
  );
};
```

**Sources.**
- https://www.remotion.dev/docs/fonts
- https://www.remotion.dev/docs/spring
- https://www.remotion.dev/docs/interpolate
- https://github.com/resemble-ai/remotion-resemble-skill/blob/master/remotion-resemble-ai/rules/visual-animations.md
  (worth reading in full — it's a Claude-skill-formatted pattern library specifically for Remotion
  kinetic type/counters/staggers, structured as copy-paste components)

---

## 4. Animated diagrams (SVG paths, flow/pipeline diagrams)

**Technique.** `@remotion/paths` (zero dependencies) has three functions: `getLength(path)` returns
total path length; `getPointAtLength(path, distance)` gives an `{x, y}` for placing a moving dot or
label along the path; `evolvePath(progress, path)` is the one-call "draw this path from 0% to
progress%" helper — it returns `{strokeDasharray, strokeDashoffset}` ready to spread onto an SVG
`<path>`'s style, replacing the classic hand-rolled `strokeDasharray = strokeDashoffset = length`
trick. For a pipeline/architecture diagram: draw each edge with `evolvePath` gated by a per-edge
`Sequence`/frame-offset so edges draw in causal order, fade in each node when the incoming edge
finishes (`progress > 0.92` is a common threshold for "arrowhead is visible now"), and optionally
animate a small circle along the bezier via `getPointAtLength` for a "data packet flowing" motif.

**APIs.**
- `getLength(path: string): number`
- `getPointAtLength(path: string, distance: number): {x: number; y: number}`
- `evolvePath(progress: number, path: string): {strokeDasharray: string; strokeDashoffset: number}`
  — `progress` 0 = invisible, 1 = fully drawn.

**Snippet — progressive path draw:**
```tsx
import {evolvePath} from '@remotion/paths';
import {interpolate, useCurrentFrame} from 'remotion';

export const AnimatedEdge: React.FC<{path: string; drawStart: number; drawFrames: number}> = ({
  path,
  drawStart,
  drawFrames,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [drawStart, drawStart + drawFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const {strokeDasharray, strokeDashoffset} = evolvePath(progress, path);
  return (
    <path
      d={path}
      stroke="#6ee7ff"
      strokeWidth={2}
      fill="none"
      strokeDasharray={strokeDasharray}
      strokeDashoffset={strokeDashoffset}
    />
  );
};
```

**Snippet — dot traveling along the edge, for a "flow" motif (combine with the above):**
```tsx
import {getLength, getPointAtLength} from '@remotion/paths';
const length = getLength(path);
const dotProgress = interpolate(frame, [drawStart, drawStart + drawFrames], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
const {x, y} = getPointAtLength(path, length * dotProgress);
// <circle cx={x} cy={y} r={4} fill="#6ee7ff" />
```

**Real production reference — a 5-node pipeline diagram, i.e. structurally identical to a
5-dimension score diagram.** `naveen-annam/creativly.ai-brand-video-remotion` has
`src/components/FlowNode.tsx` and `src/components/FlowEdge.tsx`, used by
`src/scenes/FlowDemoScene.tsx` (described in its own README as "5-node pipeline walkthrough, bezier
edges, camera system, tooltips"). Confirmed by reading `FlowEdge.tsx` source directly: it clamps a
progress value to [0,1], calls `evolvePath(p, path)` for the stroke-draw, fades in an arrowhead once
`progress > 0.92`, and optionally renders flowing dots along the bezier using cubic-bezier point math
with a sine-wave opacity — i.e. exactly the pattern above, in a shipped repo, at the same node-count
as LevelField's 5-dimension anchor library. This is the single best structural reference for the
"5-dimension animated diagram" deliverable.

**Sources.**
- https://www.remotion.dev/docs/paths/evolve-path
- https://www.remotion.dev/docs/paths/get-length
- https://github.com/naveen-annam/creativly.ai-brand-video-remotion (`src/components/FlowEdge.tsx`,
  `src/components/FlowNode.tsx`, `src/scenes/FlowDemoScene.tsx`)
- https://www.meje.dev/blog/svg-animtion-with-remotion (general guide on importing hand-authored SVG
  into Remotion as React components via SVGR, for static diagram artwork you then animate)

---

## 5. Audio sync

**Technique.** Two separate concerns: (1) placing narration/music with trim/offset so cue points
land on exact frames, and (2) audio-reactive visuals (waveform bars) if you want the terminal/data
beats to visibly pulse with narration or a sting. For (1), wrap `<Audio>`/`<Html5Audio>` in a
`<Sequence from={frameOffset}>` to shift it in time, and use `trimBefore`/`trimAfter` (frame counts;
these replaced the deprecated `startFrom`/`endAt` props in v4.0.319) to cut dead air from the start
or tail of a clip — this is how you align a scene cut to a narration cue timestamp supplied as JSON:
convert the JSON timestamp (seconds) to frames (`seconds * fps`) and use that as the `Sequence`'s
`from`. For (2), `useAudioData()`/`getAudioData()` load the waveform once, then
`visualizeAudio({audioData, frame, fps, numberOfSamples})` returns a `numberOfSamples`-length
`number[]` of per-band amplitudes (0–1) for the current frame — feed straight into bar heights.

**APIs.**
- `<Html5Audio src trimBefore trimAfter volume>` (or `<Audio>` from `@remotion/media` in newer
  versions) — `remotion` package.
- `useAudioData(src)` → `AudioData | null`, `@remotion/media-utils`.
- `visualizeAudio({audioData, frame, fps, numberOfSamples, smoothing?, optimizeFor?})` → `number[]`,
  `@remotion/media-utils`. `numberOfSamples` must be a power of two (16/32/64…).

**Snippet — cue-synced narration placement from a JSON timestamp table:**
```tsx
import {AbsoluteFill, Html5Audio, Sequence, staticFile} from 'remotion';

// cues.json: [{ "scene": "three-vs-ninety-five", "startSec": 23.4, "trimStartSec": 0.6 }, ...]
const fps = 25;
const startFrame = Math.round(cue.startSec * fps);
const trimBeforeFrames = Math.round(cue.trimStartSec * fps);

<Sequence from={startFrame}>
  <Html5Audio src={staticFile(`audio/${cue.scene}.mp3`)} trimBefore={trimBeforeFrames} volume={0.9} />
</Sequence>;
```

**Snippet — bar visualizer synced to narration/music (for a terminal or diagram beat that pulses):**
```tsx
// adapted from remotion.dev/docs/visualize-audio
import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import {staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const AudioBarVisualizer: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const audioData = useAudioData(staticFile('music.mp3'));
  if (!audioData) return null;

  const bands = visualizeAudio({fps, frame, audioData, numberOfSamples: 16});
  return (
    <>
      {bands.map((amplitude, i) => (
        <div key={i} style={{width: 8, height: 15 + 200 * amplitude, background: '#6ee7ff'}} />
      ))}
    </>
  );
};
```

**Sources.**
- https://www.remotion.dev/docs/audio (Html5Audio trimBefore/trimAfter/volume)
- https://www.remotion.dev/docs/visualize-audio
- https://github.com/remotion-dev/remotion/blob/main/packages/media-utils/src/visualize-audio.ts

---

## 6. Terminal beats

**Options compared, for embedding into a 1080p25 dark-theme Remotion comp:**

| Tool | Output | Determinism | Fit for Remotion embed |
|---|---|---|---|
| **charmbracelet/vhs** | gif/mp4/webm/frames, direct from a `.tape` script | Fully deterministic: a `.tape` file is code — same tape → same recording, no wall-clock/human-typing variance | **Best fit.** Render a `.tape` to `mp4` at your exact composition fps/theme, then drop it into an `<OffthreadVideo>` layer like any other capture — no runtime terminal emulation needed inside React |
| **asciinema + agg** | `.cast` (JSON) → gif via `agg`, or → SVG via `svg-term-cli`/`termsvg` | Cast file is deterministic once recorded, but *recording* it requires a live/scripted terminal session (more setup than a tape) | Workable, but two extra hops (record → cast → gif) vs. vhs's one (tape → mp4) |
| **Remotion-native typewriter** (React component rendering fake terminal text char-by-char, per §3) | N/A — it's live React, not an embedded clip | Fully deterministic (pure frame math) | Best when the "terminal" is stylized/kinetic-type rather than a real command transcript; wrong choice if you need to show *actual* CLI output (LevelField's real `npm run demo:agent` transcript, per the outline's chapter 4) |

**Recommendation for LevelField specifically:** the outline's terminal beats (chapter 4:
`agent-to-chain`) are *real* MCP stdio transcripts and *real* Somnia explorer state — these must stay
literal evidence, so a Remotion-native fake typewriter is wrong for them (it would be dramatizing,
not showing, the real interaction). Use **vhs**: write a `.tape` that replays the actual captured
command sequence (already exists as `.actions.json`/`transcript.txt` under
`demo-video/capture/runs/.../terminal/`), render it once to a deterministic mp4 at the film's
resolution/theme, and treat that mp4 as another evidence-layer clip that gets Ken Burns/zoom treatment
like the browser captures. This preserves "real product screen captures remain the evidence layer."

**VHS tape syntax (from the real example + README):**
```
Output demo.gif

Require echo

Set Shell "bash"
Set FontSize 32
Set Width 1200
Set Height 600
Set Theme "Catppuccin Frappe"
Set TypingSpeed 100ms
Set Framerate 60

Type "echo 'Welcome to VHS!'"
Sleep 500ms
Enter
Sleep 2s

Wait /name/
Sleep 1s

Hide
Type "clear"
Enter
Show
```
`Output` accepts `.gif`, `.mp4`, `.webm`, or a `frames/` directory (PNG sequence — useful if you want
to hand frames straight to Remotion's own frame pipeline instead of re-decoding a video). `Set Theme`
takes a name (`"Catppuccin Frappe"`, etc.) or an inline JSON base16 palette object for full control
over a dark theme matching the film's palette. Run with `vhs demo.tape`.

**Sources.**
- https://github.com/charmbracelet/vhs
- https://github.com/charmbracelet/vhs/blob/main/examples/demo.tape
- https://github.com/orangekame3/awesome-terminal-recorder (comparison list: asciinema, agg,
  svg-term-cli, termsvg, vhs)
- https://github.com/marionebl/svg-term-cli

---

## 7. Render pipeline

**Technique.** For a 1920×1080@25fps H.264 export with correct color tagging, use `@remotion/renderer`
programmatically (`selectComposition` + `renderMedia`) rather than shelling out to the CLI, so the
render script can be driven by the same JSON cue data used for audio sync — one Node script, one
source of truth. Set `codec: 'h264'`, `crf` for quality (18 is a common "visually lossless enough"
value), `x264Preset` for speed/size tradeoff, and `colorSpace: 'bt709'` for correct color tagging.
**Caveat found in research:** prior to Remotion v4.0.83, `colorSpace: 'bt709'` only tagged the output
metadata without doing actual colorspace conversion; v4.0.83+ performs real conversion. Pin to
≥4.0.83 (any current 4.x satisfies this) and verify with `ffprobe -show_streams` that
`color_space=bt709`, `color_primaries=bt709`, `color_trc=bt709` are actually set on the output — if
they're missing, add a post-encode `ffmpeg -i in.mp4 -c copy -color_primaries bt709 -color_trc bt709
-colorspace bt709 out.mp4` tagging pass as a fallback (stream copy, no re-encode, cheap insurance).
`concurrency` accepts a number, a percentage string (`'50%'`), or `null` for Remotion's CPU-based
default — tune down from 100% on a shared/CI machine to avoid OOM during parallel Chrome instances.

**Determinism pitfalls.** Remotion renders by opening the composition in headless Chrome multiple
times across threads/frames, so any source of cross-invocation variance breaks frame consistency:
`Math.random()` is explicitly forbidden (ESLint-flagged) because each thread/frame gets a different
value; use `random(seed)` from the `remotion` package instead — same seed (number or string) always
produces the same pseudorandom float in [0,1). Likewise avoid `Date.now()`/`new Date()` for anything
that affects rendered output (use frame number + a fixed reference timestamp passed via
`inputProps` instead, if a piece of UI needs to show a clock).

**Snippet — programmatic render script (CLI-equivalent, but scriptable against your own cue JSON):**
```js
// adapted from remotion.dev/docs/renderer/render-media
import {renderMedia, selectComposition} from '@remotion/renderer';

const composition = await selectComposition({
  serveUrl: bundleLocation, // from bundle() in @remotion/bundler
  id: 'LevelFieldDemo',
  inputProps: {cues},
});

await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: 'h264',
  outputLocation: 'out/levelfield-demo.mp4',
  inputProps: {cues},
  concurrency: '70%',
  crf: 18,
  x264Preset: 'slow',
  pixelFormat: 'yuv420p',
  colorSpace: 'bt709',
});
```

**Equivalent CLI form** (useful for a quick manual re-render without touching the script):
```bash
npx remotion render --codec=h264 --crf=18 --pixel-format=yuv420p \
  --color-space=bt709 --x264-preset=slow --concurrency=70% \
  src/index.ts LevelFieldDemo out/levelfield-demo.mp4
```
(Composition `width`/`height`/`fps` come from the `<Composition>` definition, not CLI flags, unless
overridden with `--width`/`--height`/`--fps`, available since v3.2.40/v4.0.424 respectively — for
this film, just define `fps={25} width={1920} height={1080}` once in the composition and never
override at render time, so preview and final output are guaranteed identical.)

**Sources.**
- https://www.remotion.dev/docs/renderer/render-media
- https://www.remotion.dev/docs/cli/render
- https://www.remotion.dev/docs/random
- https://www.remotion.dev/docs/using-randomness
- https://github.com/remotion-dev/remotion/blob/main/packages/core/src/random.ts

---

## Recommended stack for our film

Concrete package list and pattern choice per deliverable, given the constraint that real product
captures (browser, explorer, terminal) stay the evidence layer and motion design wraps around them.

| Deliverable | Packages | Pattern |
|---|---|---|
| **Opening title** | `remotion` core, `@remotion/google-fonts` | Headline built from the §3 staggered-word-reveal pattern (`spring`, `damping: 12, stiffness: 100`, 5-frame stagger), Google Font loaded once in a shared `fonts.ts` module so it's ready before any frame renders. No `<TransitionSeries>` needed yet — this is scene 1, nothing to transition from. |
| **Score-counter kinetic type (3 → 95)** | `remotion` core | The §3 `AnimatedCounter` pattern, but drive its *input* through a `spring({config: {damping: 12, stiffness: 100}})` (not raw `interpolate`) so the number overshoots slightly past the target and settles — reads as "landing on a verdict" rather than a mechanical odometer. `fontVariantNumeric: 'tabular-nums'` is mandatory or digit width jitter will be visible at 1080p. |
| **5-dimension animated diagram** | `@remotion/paths` (`evolvePath`, `getLength`, `getPointAtLength`) | Direct structural copy of the `FlowEdge.tsx`/`FlowNode.tsx` pattern from `naveen-annam/creativly.ai-brand-video-remotion`: 5 nodes (one per LevelField anchor dimension), bezier edges drawn with `evolvePath`, each edge gated on its own `Sequence` offset so dimensions resolve in reading order, arrowhead/node label fades in at `progress > 0.92`. |
| **Ken Burns on captures** | `remotion` core (`OffthreadVideo`, `interpolate`) | The §1 multi-keyframe `interpolate()` pattern for slow ambient zoom on hold shots; the §1 zoom-to-region variant (transform-origin from a captured DOM rect) specifically for the moments the outline calls out as click-driven (e.g. "点击 DreamDEX 价格二元合约" in chapter 1 step 3, or the CB-1 evidence reveal in chapter 2 step 4) — origin coordinates can be logged directly by the existing Playwright capture scripts (`demo-video/capture/scripts/lib/cursor.mjs` already tracks cursor position) and passed into the Remotion comp as `inputProps`, so the zoom target is derived from real interaction data, not eyeballed. |
| **Beat-synced transitions** | `@remotion/transitions` (`TransitionSeries`, `fade`, `wipe`, `slide`, `clockWipe`) | `springTiming({config: {damping: 200}})` for soft cuts inside a chapter (e.g. price event → reference case in chapter 2), `linearTiming({durationInFrames: 10–15})` `wipe()` for chapter boundaries (5 chapters = 4 hard chapter-transition wipes) — mirrors the pacing of the reference `BrandVideo.tsx` (13 transitions across 17 scenes). Transition frame offsets should be computed from the narration cue JSON (§5) so a wipe always lands on a narration pause, never mid-sentence. |
| **Terminal beats** | `charmbracelet/vhs` (external, pre-render step) + `remotion` `OffthreadVideo` | Convert the already-captured real transcripts (`demo-video/capture/runs/2026-08-20T1530Z-preview/terminal/.../transcript.txt` and `actions.json`) into `.tape` scripts that `Type`/`Sleep`/`Enter` the *exact* real command sequence, render once via `vhs` to mp4 at matching theme/resolution, then treat that mp4 as an evidence clip inside the Remotion comp (Ken Burns + `TransitionSeries` apply to it exactly like a browser capture). Do not use a Remotion-native fake typewriter for these — the terminal output is real evidence (MCP stdio transcript, Forge test output), and a simulated retype would misrepresent it. |
| **Audio sync (cross-cutting)** | `remotion` (`Sequence`, `Html5Audio`/`Audio`, `trimBefore`) | Single `cues.json` (`{scene, startSec, trimStartSec}[]`) drives both narration `Sequence.from` placement (§5) and `TransitionSeries` chapter-boundary offsets, so audio and motion design read from one timestamp source instead of hand-tuned frame numbers in two places. |
| **Render** | `@remotion/renderer` (`selectComposition`, `renderMedia`), pinned to a current 4.x (≥4.0.83 for real bt709 conversion) | Programmatic script per §7: `codec: 'h264'`, `crf: 18`, `colorSpace: 'bt709'`, `pixelFormat: 'yuv420p'`, `concurrency: '70%'`; composition fixed at `fps={25} width={1920} height={1080}`; verify output tags with `ffprobe`; add the copy-only ffmpeg re-tag pass as a fallback if `ffprobe` shows the tags missing. Never use `Math.random()`/`Date.now()` anywhere in the comp — use `random(seed)` from `remotion` if any randomized motion (e.g. jitter) is wanted. |

**Adoption note (given the repo-state finding above):** none of this exists in
`demo-video/presentation` yet — that package is Vite/React/Playwright/ffmpeg-concat, not Remotion.
Two paths: (a) migrate `demo-video/presentation` in place — replace `render-video.mjs`'s
Playwright-screenshot loop with a real `<Composition>` tree using the patterns above, keep the
existing `audio-segments.json`/narration extraction scripts since they're format-agnostic JSON; or
(b) stand up a new `demo-video/remotion` package (`npx create-video@latest`) that imports the already
-captured evidence clips from `demo-video/capture/runs/.../edit-work/normalized/*.mp4` as
`OffthreadVideo` sources and leaves the existing Playwright capture pipeline untouched as the
"evidence collection" stage feeding a separate "evidence assembly" stage. (b) is lower-risk: it
doesn't touch the working capture/QA pipeline (`demo-video/capture/scripts/verify-final.mjs`,
`compose.mjs`) that already produced a verified 2:53 cut — it only replaces the final assembly step.
This is a build decision for whoever implements the upgrade, not resolved by this research pass.
