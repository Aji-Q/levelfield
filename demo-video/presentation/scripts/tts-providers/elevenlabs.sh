#!/usr/bin/env bash
# ElevenLabs Text-to-Speech adapter for the web-video-presentation runner.
# Docs: https://elevenlabs.io/docs/api-reference/text-to-speech/convert

tts_check() {
  command -v curl >/dev/null || { echo "✗ curl not found" >&2; return 1; }
  command -v jq >/dev/null || { echo "✗ jq not found" >&2; return 1; }
  [[ -n "${ELEVENLABS_API_KEY:-}" ]] || { echo "✗ ELEVENLABS_API_KEY not set" >&2; return 1; }

  local boost="${ELEVENLABS_SPEAKER_BOOST:-false}"
  if [[ "$boost" != "true" && "$boost" != "false" ]]; then
    echo "✗ ELEVENLABS_SPEAKER_BOOST must be true or false" >&2
    return 1
  fi
}

tts_install_help() {
  cat <<'EOF' >&2
Configure ElevenLabs without committing credentials:
  export ELEVENLABS_API_KEY="..."
  export ELEVENLABS_VOICE_ID="..."   # optional; Rachel is the fallback

Then run:
  PRESENTATION_TTS=elevenlabs npm run synthesize-audio
EOF
}

tts_synthesize() {
  local text="$1" out="$2"
  local voice="${3:-${ELEVENLABS_VOICE_ID:-21m00Tcm4TlvDq8ikWAM}}"
  local model="${ELEVENLABS_MODEL_ID:-eleven_multilingual_v2}"
  local stability="${ELEVENLABS_STABILITY:-0.58}"
  local similarity="${ELEVENLABS_SIMILARITY_BOOST:-0.75}"
  local style="${ELEVENLABS_STYLE:-0}"
  local speed="${ELEVENLABS_SPEED:-1.0}"
  local boost="${ELEVENLABS_SPEAKER_BOOST:-false}"
  local payload

  # The locked script already expands numbers, MCP, stdio and CB-1 into
  # narration-friendly words. These two brand aliases improve consistency
  # without changing the visible script or subtitle text.
  text="${text//LevelField/Level Field}"
  text="${text//DreamDEX/Dream Dex}"

  payload=$(jq -n \
    --arg text "$text" \
    --arg model "$model" \
    --argjson stability "$stability" \
    --argjson similarity "$similarity" \
    --argjson style "$style" \
    --argjson speed "$speed" \
    --argjson boost "$boost" \
    '{
      text: $text,
      model_id: $model,
      voice_settings: {
        stability: $stability,
        similarity_boost: $similarity,
        style: $style,
        speed: $speed,
        use_speaker_boost: $boost
      }
    }') || return 1

  curl -fsS \
    --retry 2 \
    --retry-all-errors \
    -o "$out" \
    -X POST \
    "https://api.elevenlabs.io/v1/text-to-speech/$voice?output_format=mp3_44100_128" \
    -H "xi-api-key: $ELEVENLABS_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$payload"
}
