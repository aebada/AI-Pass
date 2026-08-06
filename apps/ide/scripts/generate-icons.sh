#!/usr/bin/env bash
# Regenerate PNG icons from the brand SVG.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SVG="$ROOT/resources/icon.svg"
OUT="$ROOT/resources"

if [[ ! -f "$SVG" ]]; then
  echo "Missing $SVG — copy apps/web/public/logo-icon.svg first." >&2
  exit 1
fi

if ! command -v rsvg-convert >/dev/null 2>&1; then
  echo "Install librsvg (rsvg-convert) to regenerate icons." >&2
  exit 1
fi

rsvg-convert -w 1024 -h 1024 "$SVG" -o "$OUT/icon.png"
rsvg-convert -w 256 -h 256 "$SVG" -o "$OUT/icon-256.png"
echo "Wrote icon.png and icon-256.png"

# Optional: icns (macOS) / ico if tools exist
if command -v iconutil >/dev/null 2>&1; then
  echo "Tip: use electron-builder or a dedicated icns packer for .icns; PNG is enough for builder."
fi
