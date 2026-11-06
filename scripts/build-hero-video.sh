#!/usr/bin/env bash
# Builds the portrait (phone) homepage hero loop from product photography.
# The desktop film is built by build-hero-wide.sh.
#
#   bash scripts/build-hero-video.sh
#
# Each still gets a slow "Ken Burns" push in or out; clips cross-fade, and the
# final clip eases back to the first frame so the loop is seamless.
# Output: public/media/video/hero-mobile.mp4 (+ hero-mobile-poster.jpg).
set -euo pipefail

cd "$(dirname "$0")/.."
OUT=public/media/video
mkdir -p "$OUT"

SRC=public/media/products
FRAMES=(
  "$SRC/glow-up-pithi-pack/05.jpg"
  "$SRC/vita-clay-ubtan-pack/03.jpg"
  "$SRC/scrubulush-exfoliator/07.jpg"
  "$SRC/aquench-soothing-hydrogel/03.jpg"
  "$SRC/glow-up-pithi-pack/05.jpg" # returns to the opening frame for a seamless loop
)

W=1080 H=1350 FPS=25 CLIP=5 FADE=1.2
STEP=0.0006 # zoom change per frame (~7.5% over a clip)

inputs=()
filters=""
for i in "${!FRAMES[@]}"; do
  inputs+=(-loop 1 -framerate "$FPS" -t "$CLIP" -i "${FRAMES[$i]}")
  last=$(( ${#FRAMES[@]} - 1 ))
  if (( i == last )); then
    # Ease back out to zoom 1.0 so the last frame matches the first.
    zoom="1+${STEP}*(${CLIP}*${FPS}-on)"
  elif (( i % 2 == 0 )); then
    zoom="1+${STEP}*on"   # push in
  else
    zoom="1.075-${STEP}*on" # pull out
  fi
  # Upscale first so zoompan moves smoothly instead of in whole-pixel steps.
  filters+="[$i:v]scale=$((W * 2)):$((H * 2)):force_original_aspect_ratio=increase,crop=$((W * 2)):$((H * 2)),"
  filters+="zoompan=z='${zoom}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=${FPS},"
  filters+="setsar=1,format=yuv420p[v$i];"
done

# Chain the cross-fades.
prev="v0"
for (( i = 1; i < ${#FRAMES[@]}; i++ )); do
  offset=$(echo "$i * ($CLIP - $FADE)" | bc -l)
  out="x$i"
  filters+="[$prev][v$i]xfade=transition=fade:duration=${FADE}:offset=${offset}[$out];"
  prev="$out"
done
filters="${filters%;}"

ffmpeg -y -loglevel error "${inputs[@]}" \
  -filter_complex "$filters" -map "[$prev]" \
  -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -movflags +faststart -an \
  "$OUT/.hero-portrait.mp4"

# Poster = the opening frame, shown before the video starts and for reduced motion.
ffmpeg -y -loglevel error -i "$OUT/.hero-portrait.mp4" -frames:v 1 -q:v 3 "$OUT/hero-mobile-poster.jpg"

# Lighter cut for phones (served via <source media>).
ffmpeg -y -loglevel error -i "$OUT/.hero-portrait.mp4" -vf scale=720:900 \
  -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart -an \
  "$OUT/hero-mobile.mp4"
rm "$OUT/.hero-portrait.mp4"
ls -lh "$OUT"
