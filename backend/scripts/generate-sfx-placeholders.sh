#!/usr/bin/env bash
# DEV placeholder sound effects for answer selection / Answer Locked.
# Synthesised with ffmpeg (no samples, no licences). Final sounds may replace
# these files 1:1 — keep the file names; no code change is needed.
#
#   select.m4a — ~80 ms soft electronic click (2.6 kHz + overtones, fast decay)
#   locked.m4a — ~280 ms two-note confirm (C6 → G6, neutral: says nothing
#                about right/wrong)
#
# Both are peak-normalised to -3 dBFS; playback level lives in
# src/audio/sfxConfig.ts, never in the files.
#
# Run from the repo root:  bash backend/scripts/generate-sfx-placeholders.sh
set -euo pipefail

OUT="assets/sfx"
TMP="$(mktemp -d)"
mkdir -p "$OUT"

SEL="(1-exp(-t/0.0015))*exp(-t/0.018)*(0.8*sin(2*PI*2600*t)+0.25*sin(2*PI*5200*t)+0.15*sin(2*PI*1300*t))"
LOCK="(1-exp(-t/0.003))*exp(-t/0.06)*(sin(2*PI*1046.5*t)+0.2*sin(2*PI*2093*t)) + gte(t,0.11)*(1-exp(-(t-0.11)/0.003))*exp(-(t-0.11)/0.08)*(sin(2*PI*1568*t)+0.2*sin(2*PI*3136*t))"

render() { # name expr duration fadeStart fadeDur
  ffmpeg -v error -y -f lavfi -i "aevalsrc='$2':s=44100:d=$3" \
    -af "afade=t=out:st=$4:d=$5" -c:a pcm_f32le "$TMP/$1.wav"
  local peak
  peak=$(ffmpeg -hide_banner -i "$TMP/$1.wav" -af astats -f null - 2>&1 \
    | grep -m1 "Peak level dB" | awk '{print $NF}')
  local gain
  gain=$(awk -v p="$peak" 'BEGIN { printf "%.3f", -3 - p }')
  ffmpeg -v error -y -i "$TMP/$1.wav" -af "volume=${gain}dB" \
    -ac 1 -c:a aac -b:a 128k "$OUT/$1.m4a"
  echo "$1.m4a  peak ${peak} dB -> -3 dB (gain ${gain} dB)"
}

render select "$SEL" 0.08 0.068 0.012
render locked "$LOCK" 0.28 0.24 0.04
rm -rf "$TMP"
