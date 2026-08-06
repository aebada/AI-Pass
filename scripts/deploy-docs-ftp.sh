#!/usr/bin/env bash
# Deploy apps/docs/out to Hostinger FTP for docs.ai-pass.com (or docs.aipass.space interim).
#
# Credentials via scripts/.deploy-env.local or environment:
#   FTP_HOST, FTP_USER, FTP_PASS
#   DOCS_FTP_REMOTE_DIR (default: /domains/docs.ai-pass.com/public_html)
#
# Interim (before ai-pass.com DNS):
#   DOCS_FTP_REMOTE_DIR=/domains/docs.aipass.space/public_html
#   — create docs.aipass.space subdomain in hPanel first.
#
# Fallback on main domain:
#   DOCS_FTP_REMOTE_DIR=/docs

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/apps/docs/out"
DEPLOY_ENV="$ROOT/scripts/.deploy-env.local"

if [[ -f "$DEPLOY_ENV" ]]; then
  # shellcheck source=/dev/null
  source "$DEPLOY_ENV"
fi

: "${FTP_HOST:?Set FTP_HOST (or create scripts/.deploy-env.local)}"
: "${FTP_USER:?Set FTP_USER}"
: "${FTP_PASS:?Set FTP_PASS}"
DOCS_FTP_REMOTE_DIR="${DOCS_FTP_REMOTE_DIR:-/domains/docs.ai-pass.com/public_html}"

export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-}"

if [[ ! -f "$OUT_DIR/index.html" ]]; then
  echo "No docs build found; running scripts/build-docs-static.sh ..."
  "$ROOT/scripts/build-docs-static.sh"
fi

if ! command -v lftp >/dev/null 2>&1; then
  echo "error: lftp is required (brew install lftp)" >&2
  exit 1
fi

echo "Uploading $OUT_DIR -> ftp://${FTP_HOST}${DOCS_FTP_REMOTE_DIR}"
lftp -u "$FTP_USER","$FTP_PASS" "ftp://${FTP_HOST}" -e "\
  set ftp:ssl-allow no; \
  mkdir -p ${DOCS_FTP_REMOTE_DIR}; \
  mirror -R -a --delete --verbose $OUT_DIR ${DOCS_FTP_REMOTE_DIR}; \
  quit"

echo "Docs deploy complete -> ${DOCS_FTP_REMOTE_DIR}"
echo "Verify after DNS/SSL: https://docs.ai-pass.com/"
