#!/usr/bin/env bash
# Builds the widescreen (desktop) homepage hero film from product photography.
#
#   bash scripts/build-hero-wide.sh
#
# Slow push-in / pull-out on each still with soft cross-fades; the last clip
# returns to the first frame so the loop is seamless.
# Output: public/media/video/hero-wide.mp4 (+ hero-wide-poster.jpg).
set -euo pipefail

cd "$(dirname "$0")/.."
OUT=public/media/video
mkdir -p "$OUT"

SRC=public/media/products
FRAMES=(
  "$SRC/sheavibe-lotion/06.jpg"
  "$SRC/aqua-riche-night-repair-gel-cream/05.jpg"
  "$SRC/terra-tress-hair-scalp-oil/05.jpg"
  "$SRC/glow-up-pithi-pack/04.jpg"
  "$SRC/aloe-vibe-shower-gel/05.jpg"
  "$SRC/supple-goals-body-balm/05.jpg"
  "$SRC/sheavibe-lotion/06.jpg" # back to the opening frame
)

W=1920 H=1080 FPS=25 CLIP=5 FADE=1.4
STEP=0.0005

inputs=()
filters=""
last=$(( ${#FRAMES[@]} - 1 ))
for i in "${!FRAMES[@]}"; do
  inputs+=(-loop 1 -framerate "$FPS" -t "$CLIP" -i "${FRAMES[$i]}")
  if (( i == last )); then
    zoom="1+${STEP}*(${CLIP}*${FPS}-on)"
  elif (( i % 2 == 0 )); then
    zoom="1+${STEP}*on"
  else
    zoom="1.0625-${STEP}*on"
  fi
  SW=$((W * 3 / 2)) SH=$((H * 3 / 2))
  filters+="[$i:v]scale=${SW}:${SH}:force_original_aspect_ratio=increase,crop=${SW}:${SH},"
  filters+="zoompan=z='${zoom}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=${FPS},"
  filters+="setsar=1,format=yuv420p[v$i];"
done

prev="v0"
for (( i = 1; i < ${#FRAMES[@]}; i++ )); do
  offset=$(echo "$i * ($CLIP - $FADE)" | bc -l)
  filters+="[$prev][v$i]xfade=transition=fade:duration=${FADE}:offset=${offset}[x$i];"
  prev="x$i"
done
filters="${filters%;}"

ffmpeg -y -loglevel error "${inputs[@]}" \
  -filter_complex "$filters" -map "[$prev]" \
  -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart -an \
  "$OUT/hero-wide.mp4"

ffmpeg -y -loglevel error -i "$OUT/hero-wide.mp4" -frames:v 1 -q:v 3 "$OUT/hero-wide-poster.jpg"
ls -lh "$OUT"
