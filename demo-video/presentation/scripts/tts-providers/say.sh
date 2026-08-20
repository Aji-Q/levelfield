#!/usr/bin/env bash
# Offline macOS preview voice. Final narration is generated with ElevenLabs.

tts_check() {
  command -v say >/dev/null || { echo "✗ macOS say not found" >&2; return 1; }
  command -v ffmpeg >/dev/null || { echo "✗ ffmpeg not found" >&2; return 1; }
}

tts_install_help() {
  cat <<'EOF' >&2
The preview provider requires macOS `say` and ffmpeg:
  brew install ffmpeg
EOF
}

tts_synthesize() {
  local text="$1" out="$2" voice="${3:-${SAY_VOICE:-Daniel}}"
  local rate="${SAY_RATE:-155}"
  local tmp_base tmp
  tmp_base=$(mktemp -t levelfield-tts)
  tmp="${tmp_base}.aiff"
  rm -f "$tmp_base"

  text="${text//LevelField/Level Field}"
  text="${text//DreamDEX/Dream Dex}"

  say -v "$voice" -r "$rate" -o "$tmp" "$text" &&
    ffmpeg -y -loglevel error -i "$tmp" -codec:a libmp3lame -qscale:a 2 "$out"
  local code=$?
  rm -f "$tmp" "$tmp_base"
  return $code
}
