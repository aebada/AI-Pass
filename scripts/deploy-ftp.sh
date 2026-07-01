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

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/apps/web/out"

: "${FTP_HOST:?Set FTP_HOST}"
: "${FTP_USER:?Set FTP_USER}"
: "${FTP_PASS:?Set FTP_PASS}"
FTP_REMOTE_DIR="${FTP_REMOTE_DIR:-/}"

export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-}"

if [[ ! -f "$OUT_DIR/index.html" ]]; then
  echo "No static build found; running scripts/build-web-static.sh ..."
  "$ROOT/scripts/build-web-static.sh"
fi

if ! command -v lftp >/dev/null 2>&1; then
  echo "error: lftp is required (brew install lftp)" >&2
  exit 1
fi

echo "Uploading $OUT_DIR -> ftp://${FTP_HOST}${FTP_REMOTE_DIR}"
lftp -u "$FTP_USER","$FTP_PASS" "ftp://${FTP_HOST}" -e "\
  set ftp:ssl-allow no; \
  mirror -R -a --delete --verbose $OUT_DIR $FTP_REMOTE_DIR; \
  quit"

echo "Deploy complete."
