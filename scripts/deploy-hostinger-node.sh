#!/usr/bin/env bash
# Upload dist/deploy-node to Hostinger (FTP) and print hPanel Node.js steps.
#
# Env (same as static deploy; optional NODE_REMOTE_DIR):
#   FTP_HOST, FTP_USER, FTP_PASS
#   NODE_REMOTE_DIR — remote path for Node app (default: /nodejs-aipass)
#
# Example:
#   export FTP_HOST=92.113.19.130
#   export FTP_USER='u234903558.aipass'
#   export FTP_PASS='...'
#   export NODE_REMOTE_DIR=/nodejs-aipass
#   ./scripts/deploy-hostinger-node.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUNDLE="$ROOT/dist/deploy-node"
NODE_REMOTE_DIR="${NODE_REMOTE_DIR:-/nodejs-aipass}"

export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-}"

if [[ ! -f "$BUNDLE/start.sh" ]]; then
  echo "No bundle; running scripts/build-node-prod.sh ..."
  "$ROOT/scripts/build-node-prod.sh"
fi

if [[ -z "${FTP_HOST:-}" || -z "${FTP_USER:-}" || -z "${FTP_PASS:-}" ]]; then
  echo "FTP credentials not set (FTP_HOST, FTP_USER, FTP_PASS)."
  echo "Bundle is at: $BUNDLE"
  echo "See docs/DEPLOY-AUTH.md for Hostinger hPanel Node.js setup."
  exit 0
fi

if ! command -v lftp >/dev/null 2>&1; then
  echo "error: lftp is required (brew install lftp)" >&2
  exit 1
fi

echo "Uploading Node bundle -> ftp://${FTP_HOST}${NODE_REMOTE_DIR}"
lftp -u "$FTP_USER","$FTP_PASS" "ftp://${FTP_HOST}" -e "\
  set ftp:ssl-allow no; \
  mkdir -p ${NODE_REMOTE_DIR}; \
  mirror -R -a --delete --verbose $BUNDLE ${NODE_REMOTE_DIR}; \
  quit"

echo "FTP upload complete. SSH/hPanel: run ./start.sh or configure Node.js app entry start.sh"
