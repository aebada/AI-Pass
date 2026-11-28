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

# Keep sibling *.html shells: Hostinger .htaccess still rewrites some paths to path.html.
# DirectoryIndex folders (*/index.html) remain the primary clean-URL target.

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
