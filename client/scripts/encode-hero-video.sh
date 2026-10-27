#!/usr/bin/env bash
# Converte il video dell'Hero (sorgente fuori da git: il .mov HEVC originale, in iCloud
# "Azienda Agricola/intro_long.mov") in MP4/H.264, che tutti i browser decodificano, leggero per
# uno sfondo sotto un velo scuro: per computer (1920 px) e per telefono (960 px). Il WebM/VP9
# veniva più pesante a parità di resa, quindi non si produce. Senza audio. Indice all'inizio del
# file (faststart) e un fotogramma chiave ogni 2 secondi: il video parte mentre si scarica e
# continua a pezzi anche su una rete lenta.
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

# Fotogramma chiave ogni 2 secondi a 30 fps.
GOP=60

encode() {
  local width="$1" suffix="$2" crf264="$3" maxrate="$4"
  local scale="scale='min(${width},iw)':-2"
  ffmpeg -y -loglevel error -i "$SRC" -an -vf "$scale" -c:v libx264 -profile:v high -pix_fmt yuv420p \
    -crf "$crf264" -maxrate "$maxrate" -bufsize "$((${maxrate%k} * 2))k" -g "$GOP" -keyint_min "$GOP" \
    -preset slow -movflags +faststart "$OUT_DIR/intro${suffix}.mp4"
}

# Sfondo sotto un velo scuro: bitrate basso, la differenza non si vede e il video arriva prima.
encode 1920 "" 30 1500k
encode 960 "-mobile" 31 700k

ls -lh "$OUT_DIR"/intro*
