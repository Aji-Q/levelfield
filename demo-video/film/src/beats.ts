// Frame-accurate beat boundaries derived from the locked narration audio.
// Each beat = its mp3 duration + a 0.2s trail, so the beat boundaries, the burned
// captions, and the shipped SRT all share one timeline.
import beatMap from "./beat-map.json";

export const FPS = 25;
export const TRAIL = 0.2;

export interface Beat {
  index: number;
  chapter: string;
  text: string;
  audio: string;
  startSec: number;
  durationSec: number; // includes trail
  startFrame: number;
  durationFrames: number;
}

let cursor = 0;
export const BEATS: Beat[] = (beatMap.beats as { chapter: string; text: string; audio: string; duration: number }[]).map(
  (b, index) => {
    const durationSec = b.duration + TRAIL;
    const beat: Beat = {
      index,
      chapter: b.chapter,
      text: b.text,
      audio: b.audio,
      startSec: cursor,
      durationSec,
      startFrame: Math.round(cursor * FPS),
      durationFrames: 0,
    };
    cursor += durationSec;
    beat.durationFrames = Math.round(cursor * FPS) - beat.startFrame;
    return beat;
  },
);

export const TOTAL_FRAMES = Math.round(cursor * FPS);
