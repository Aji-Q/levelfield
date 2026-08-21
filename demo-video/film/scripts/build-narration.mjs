// Build v2 narration + beat map + captions from src/script-v2.json.
//
//   node scripts/build-narration.mjs            # ElevenLabs if ELEVENLABS_API_KEY set, else macOS say
//   FORCE_OFFLINE=1 node scripts/build-narration.mjs   # force the offline timing voice
//
// Outputs:
//   public/audio-v2/<chapter>-<step>.mp3         narration per beat
//   public/audio-v2/<chapter>-<step>.align.json  char-level timestamps (ElevenLabs only)
//   src/beat-map.json                            measured durations (drives the whole film)
//   src/captions.json                            absolute-time caption cues (burned layer + SRT)
//
// One-pass policy: each beat is generated exactly once per run; no retries that spend credits.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO_DIR = path.join(ROOT, "public", "audio-v2");
mkdirSync(AUDIO_DIR, { recursive: true });

const script = JSON.parse(readFileSync(path.join(ROOT, "src", "script-v2.json"), "utf8"));
const KEY = process.env.FORCE_OFFLINE ? "" : (process.env.ELEVENLABS_API_KEY ?? "");
const TRAIL = 0.2;
const FPS = 25;

console.log(KEY ? "engine: ElevenLabs " + script.voice.voice_name : "engine: offline macOS say (timing scratch)");

// Cache is only valid within one engine: switching offline <-> ElevenLabs regenerates all.
const engine = KEY ? "elevenlabs" : "offline";
const enginePath = path.join(AUDIO_DIR, ".engine");
const engineChanged = !existsSync(enginePath) || readFileSync(enginePath, "utf8").trim() !== engine;
if (engineChanged) console.log("engine changed -> regenerating all beats");
writeFileSync(enginePath, engine);

async function elevenlabs(text, outMp3, outAlign) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${script.voice.voice_id}/with-timestamps?output_format=mp3_44100_128`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "xi-api-key": KEY, "content-type": "application/json" },
    body: JSON.stringify({ text, model_id: script.voice.model_id, voice_settings: script.voice.settings }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const body = await res.json();
  writeFileSync(outMp3, Buffer.from(body.audio_base64, "base64"));
  writeFileSync(outAlign, JSON.stringify(body.alignment));
}

function offlineSay(text, outMp3) {
  const aiff = outMp3.replace(/\.mp3$/, ".aiff");
  execFileSync("say", ["-v", "Daniel", "-r", "178", "-o", aiff, text]);
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", aiff, "-ar", "44100", "-b:a", "128k", outMp3]);
  execFileSync("rm", [aiff]);
}

const probe = (f) =>
  parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

// Split a beat's text into caption cues of at most `max` characters, breaking at
// sentence ends first, then at " — " / ", ". e.g. 160-char beat -> 2-3 cues.
function splitCues(text, max = 80) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const parts = [];
  for (const s of sentences) {
    if (s.length <= max) { parts.push(s); continue; }
    // Split near the midpoint at the best separator so neither half dangles
    // ("...standard input and" is worse than two balanced clauses).
    let rest = s;
    while (rest.length > max) {
      const mid = rest.length / 2;
      let cut = -1;
      for (const sep of [" — ", ", ", " "]) {
        let best = -1, i = rest.indexOf(sep);
        while (i !== -1) {
          if (Math.abs(i - mid) < Math.abs(best - mid)) best = i;
          i = rest.indexOf(sep, i + 1);
        }
        if (best > 20 && best < rest.length - 15) { cut = best + (sep === " — " ? 2 : sep.length - 1); break; }
      }
      if (cut < 0) cut = max;
      parts.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
    if (rest) parts.push(rest);
  }
  // Merge tiny fragments forward so no cue flashes by.
  const cues = [];
  for (const p of parts) {
    if (cues.length && (cues[cues.length - 1] + " " + p).length <= max && p.length < 25)
      cues[cues.length - 1] += " " + p;
    else cues.push(p);
  }
  return cues;
}

// Map cue substrings to times using ElevenLabs char alignment; fall back to
// proportional-by-character timing across the measured speech duration.
function cueTimes(beatText, cues, align, dur) {
  const out = [];
  if (align) {
    const chars = align.characters;
    const starts = align.character_start_times_seconds;
    const ends = align.character_end_times_seconds;
    const joined = chars.join("");
    let searchFrom = 0;
    for (const cue of cues) {
      const probeStr = cue.replace(/\s+/g, " ");
      let idx = joined.indexOf(probeStr, searchFrom);
      if (idx < 0) idx = joined.indexOf(probeStr.slice(0, 20), searchFrom);
      if (idx < 0) return cueTimes(beatText, cues, null, dur); // alignment mismatch: proportional
      const end = idx + probeStr.length - 1;
      out.push({ text: cue, start: Math.max(0, starts[idx] - 0.05), end: Math.min(dur, ends[Math.min(end, ends.length - 1)] + 0.12) });
      searchFrom = end;
    }
    return out;
  }
  const total = cues.reduce((a, c) => a + c.length, 0);
  let t = 0;
  for (const cue of cues) {
    const w = (cue.length / total) * dur;
    out.push({ text: cue, start: t, end: Math.min(dur, t + w) });
    t += w;
  }
  return out;
}

const beats = [];
const captions = [];
let cursor = 0;
for (const b of script.beats) {
  const stem = `${b.chapter}-${b.step}`;
  const mp3 = path.join(AUDIO_DIR, `${stem}.mp3`);
  const alignPath = path.join(AUDIO_DIR, `${stem}.align.json`);
  // Reuse existing audio unless REGEN=1 — protects the one-pass ElevenLabs budget
  // when only caption/split logic changes.
  if (!existsSync(mp3) || process.env.REGEN || engineChanged) {
    if (KEY) await elevenlabs(b.text, mp3, alignPath);
    else offlineSay(b.text, mp3);
  }
  const dur = probe(mp3);
  const align = KEY && existsSync(alignPath) ? JSON.parse(readFileSync(alignPath, "utf8")) : null;
  const cues = cueTimes(b.text, splitCues(b.text), align, dur);
  for (const c of cues) {
    const cps = c.text.length / Math.max(0.6, c.end - c.start);
    if (cps > 19) console.warn(`  CPS ${cps.toFixed(1)} high: "${c.text.slice(0, 40)}..."`);
    captions.push({ start: +(cursor + c.start).toFixed(3), end: +(cursor + c.end).toFixed(3), text: c.text });
  }
  beats.push({ chapter: b.chapter, step: b.step, text: b.text, audio: `audio-v2/${stem}.mp3`, start: +cursor.toFixed(3), duration: +dur.toFixed(3) });
  cursor += dur + TRAIL;
  console.log(`${stem}: ${dur.toFixed(2)}s, ${cues.length} cue(s)`);
}

writeFileSync(path.join(ROOT, "src", "beat-map.json"), JSON.stringify({ fps: FPS, totalSeconds: +cursor.toFixed(3), beats }, null, 2));
writeFileSync(path.join(ROOT, "src", "captions.json"), JSON.stringify(captions, null, 2));

// Sidecar SRT with identical cues.
const ts = (s) => {
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(Math.floor(s % 60)).padStart(2, "0");
  const ms = String(Math.round((s % 1) * 1000)).padStart(3, "0");
  return `${h}:${m}:${sec},${ms}`;
};
writeFileSync(
  path.join(ROOT, "out", "captions-v2.srt"),
  captions.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join("\n") + "\n",
);
console.log(`total ${cursor.toFixed(2)}s (${Math.round(cursor * FPS)} frames), ${captions.length} caption cues`);
