#!/usr/bin/env bash
# Deploy apps/web static export to Hostinger FTP (live site: https://aipass.space).
# Credentials via environment (never commit passwords):
#   FTP_HOST, FTP_USER, FTP_PASS, FTP_REMOTE_DIR (default: /)
#
# Example (Hostinger shared hosting — same docroot for aipass.space):
#   export FTP_HOST=92.113.19.130
#   export FTP_USER='u234903558.aipass'
#   export FTP_PASS='your-ftp-password'
#   export FTP_REMOTE_DIR=/
#   ./scripts/build-web-static.sh
#   ./scripts/deploy-ftp.sh
#
# Overlay is the default so Hostinger auth/, auth-lib/, and .env stay on the server.
# Set FTP_DELETE=1 only when you intend to wipe extra remote files.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/apps/web/out"

: "${FTP_HOST:?Set FTP_HOST}"
: "${FTP_USER:?Set FTP_USER}"
: "${FTP_PASS:?Set FTP_PASS}"
FTP_REMOTE_DIR="${FTP_REMOTE_DIR:-/}"
FTP_DELETE="${FTP_DELETE:-0}"

export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-}"

if [[ ! -f "$OUT_DIR/index.html" ]]; then
  echo "No static build found; running scripts/build-web-static.sh ..."
  "$ROOT/scripts/build-web-static.sh"
fi

if ! command -v lftp >/dev/null 2>&1; then
  echo "error: lftp is required (brew install lftp)" >&2
  exit 1
fi

DELETE_FLAG=""
if [[ "$FTP_DELETE" == "1" ]]; then
  DELETE_FLAG="--delete"
fi

echo "Uploading $OUT_DIR -> ftp://${FTP_HOST}${FTP_REMOTE_DIR} (overlay, delete=${FTP_DELETE})"
# shellcheck disable=SC2086
lftp -u "$FTP_USER","$FTP_PASS" "ftp://${FTP_HOST}" -e "\
  set ftp:ssl-allow no; \
  set net:max-retries 3; \
  set net:timeout 30; \
  mirror -R -a --verbose ${DELETE_FLAG} \
    --exclude-glob auth/ \
    --exclude-glob auth-lib/ \
    --exclude-glob laravel-auth/ \
    --exclude-glob .env \
    --exclude-glob .env.* \
    $OUT_DIR $FTP_REMOTE_DIR; \
  quit"

echo "Deploy complete."
