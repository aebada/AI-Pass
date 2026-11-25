#!/usr/bin/env bash
# Lean Hostinger deploy: upload ONLY the static export (apps/web/out), never the git repo.
# Requires: FTP_HOST FTP_USER FTP_PASS  (FTP_REMOTE_DIR defaults to /)
#
# Best practices vs full-repo FTP:
# - No .git / packages / apps source on public_html
# - Strip RSC *.txt flight dumps before upload
# - Keep large desktop binaries out of this pass (upload separately if needed)
# - Prefer overlay without --delete unless LEAN_DELETE=1

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/apps/web/out"

: "${FTP_HOST:?Set FTP_HOST}"
: "${FTP_USER:?Set FTP_USER}"
: "${FTP_PASS:?Set FTP_PASS}"
FTP_REMOTE_DIR="${FTP_REMOTE_DIR:-/}"

if [[ ! -f "$OUT_DIR/index.html" ]]; then
  echo "Building static export..."
  "$ROOT/scripts/build-web-static.sh"
fi

# Drop RSC flight dumps — they waste disk and get hit by crawlers
find "$OUT_DIR" -type f -name '*.txt' ! -name 'robots.txt' -delete

# Prefer DirectoryIndex folders; drop sibling *.html when */index.html exists (halves HTML weight)
OUT_DIR="$OUT_DIR" python3 - <<'PY'
from pathlib import Path
import os
out = Path(os.environ["OUT_DIR"])
removed = 0
for index in out.rglob("index.html"):
    if index.parent == out:
        continue
    candidate = out / f"{index.parent.relative_to(out)}.html"
    if candidate.is_file():
        candidate.unlink()
        removed += 1
print(f"Removed {removed} duplicate *.html shells")
PY

if ! command -v lftp >/dev/null 2>&1; then
  echo "error: lftp required" >&2
  exit 1
fi

DELETE_FLAG=""
if [[ "${LEAN_DELETE:-0}" == "1" ]]; then
  DELETE_FLAG="--delete"
fi

# Exclude heavy desktop packages from the lean web mirror (serve via CDN or manual upload)
EXCLUDE=(
  --exclude-glob 'downloads/*.dmg'
  --exclude-glob 'downloads/*.exe'
  --exclude-glob 'downloads/*.AppImage'
  --exclude-glob 'downloads/*.deb'
  --exclude-glob 'downloads/*.zip'
  --exclude-glob '**/*.map'
)

echo "Lean upload $OUT_DIR -> ftp://${FTP_HOST}${FTP_REMOTE_DIR}"
lftp -u "$FTP_USER","$FTP_PASS" "ftp://${FTP_HOST}" -e "
  set ftp:ssl-allow no;
  set net:max-retries 4;
  set net:timeout 60;
  mirror -R -a --parallel=6 $DELETE_FLAG ${EXCLUDE[*]} $OUT_DIR $FTP_REMOTE_DIR;
  quit
"

echo "Lean deploy complete."
