#!/usr/bin/env bash
# Deploy php-auth (Google OAuth + email/password) to Hostinger FTP docroot.
#
# Upload layout on server (public_html = FTP_REMOTE_DIR):
#   auth/          ← login.php, google.php, google-callback.php, …
#   auth-lib/      ← vendor/, src/, bootstrap.php, .env (you create on server)
#
# Credentials via environment (never commit passwords):
#   FTP_HOST, FTP_USER, FTP_PASS, FTP_REMOTE_DIR (default: /)
#
# Example:
#   export FTP_HOST=92.113.19.130
#   export FTP_USER='u234903558.aipass'
#   export FTP_PASS='your-ftp-password'
#   export FTP_REMOTE_DIR=/
#   ./scripts/deploy-hostinger-php-auth.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PHP_AUTH="$ROOT/php-auth"
AUTH_SRC="$PHP_AUTH/auth"
LIB_SRC="$PHP_AUTH/auth-lib"

: "${FTP_HOST:?Set FTP_HOST}"
: "${FTP_USER:?Set FTP_USER}"
: "${FTP_PASS:?Set FTP_PASS}"
FTP_REMOTE_DIR="${FTP_REMOTE_DIR:-/}"

export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-}"

if [[ ! -d "$LIB_SRC/vendor" ]]; then
  echo "vendor/ missing — run: cd php-auth && composer install"
  if command -v composer >/dev/null 2>&1; then
    (cd "$PHP_AUTH" && composer install --no-dev --optimize-autoloader)
  else
    echo "error: install Composer locally, then re-run this script" >&2
    exit 1
  fi
fi

if ! command -v lftp >/dev/null 2>&1; then
  echo "error: lftp is required (brew install lftp)" >&2
  exit 1
fi

echo "Uploading PHP auth -> ftp://${FTP_HOST}${FTP_REMOTE_DIR}"
lftp -u "$FTP_USER","$FTP_PASS" "ftp://${FTP_HOST}" -e "\
  set ftp:ssl-allow no; \
  mirror -R -a --verbose --exclude .env --exclude .env.local $AUTH_SRC ${FTP_REMOTE_DIR}auth; \
  mirror -R -a --verbose --exclude .env --exclude .env.local $LIB_SRC ${FTP_REMOTE_DIR}auth-lib; \
  quit"

echo "PHP auth deploy complete."
echo "Next: create ${FTP_REMOTE_DIR}auth-lib/.env on the server (see php-auth/auth-lib/.env.example)"
