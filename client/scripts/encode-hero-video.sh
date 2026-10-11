#!/usr/bin/env bash
# Converte il video dell'Hero (sorgente fuori da git, es. il .mov HEVC originale) nei due
# formati che tutti i browser decodificano: WebM/VP9 e MP4/H.264. Senza audio, 1920px max,
# con faststart per partire prima di aver scaricato tutto il file.
#
# Uso: scripts/encode-hero-video.sh path/al/video-sorgente.mov
set -euo pipefail

if [ $# -ne 1 ] || [ ! -f "$1" ]; then
  echo "Uso: $0 <video-sorgente>" >&2
  exit 1
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg non trovato nel PATH (su Windows: winget install Gyan.FFmpeg, poi riapri il terminale)" >&2
  exit 1
fi

SRC="$1"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/videos"
mkdir -p "$OUT_DIR"

SCALE="scale='min(1920,iw)':-2"

ffmpeg -y -i "$SRC" -an -vf "$SCALE" -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -crf 23 -preset slow -movflags +faststart "$OUT_DIR/intro.mp4"

ffmpeg -y -i "$SRC" -an -vf "$SCALE" -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 \
  -deadline good "$OUT_DIR/intro.webm"

ls -lh "$OUT_DIR"/intro.*
