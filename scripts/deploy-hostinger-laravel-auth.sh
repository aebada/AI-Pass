#!/usr/bin/env bash
# Deploy Laravel auth API (services/auth-api) to Hostinger via FTP.
#
# Server layout (recommended):
#   ~/domains/aipass.space/laravel-auth/   ← full Laravel app (NOT in public_html)
#   ~/domains/aipass.space/public_html/    ← static Next.js export
#
# Apache in public_html/.htaccess proxies /auth/* → laravel-auth/public/index.php
# See docs/LARAVEL-AUTH.md and docs/apache-laravel-auth-proxy.htaccess
#
# Credentials via environment (never commit passwords):
#   FTP_HOST, FTP_USER, FTP_PASS, LARAVEL_REMOTE_DIR (default: /laravel-auth)
#
# Example:
#   export FTP_HOST=92.113.19.130
#   export FTP_USER='u234903558.aipass'
#   export FTP_PASS='your-ftp-password'
#   export LARAVEL_REMOTE_DIR=/laravel-auth
#   ./scripts/deploy-hostinger-laravel-auth.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LARAVEL="$ROOT/services/auth-api"

: "${FTP_HOST:?Set FTP_HOST}"
: "${FTP_USER:?Set FTP_USER}"
: "${FTP_PASS:?Set FTP_PASS}"
LARAVEL_REMOTE_DIR="${LARAVEL_REMOTE_DIR:-/laravel-auth}"

export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-}"

if [[ ! -d "$LARAVEL/vendor" ]]; then
  echo "Installing Laravel dependencies..."
  if command -v composer >/dev/null 2>&1; then
    (cd "$LARAVEL" && composer install --no-dev --optimize-autoloader)
  elif [[ -f "$ROOT/services/php-auth-legacy/composer.phar" ]]; then
    (cd "$LARAVEL" && php "$ROOT/services/php-auth-legacy/composer.phar" install --no-dev --optimize-autoloader)
  else
    echo "error: install Composer, then re-run" >&2
    exit 1
  fi
fi

if ! command -v lftp >/dev/null 2>&1; then
  echo "error: lftp is required (brew install lftp)" >&2
  exit 1
fi

echo "Uploading Laravel auth -> ftp://${FTP_HOST}${LARAVEL_REMOTE_DIR}"
lftp -u "$FTP_USER","$FTP_PASS" "ftp://${FTP_HOST}" -e "\
  set ftp:ssl-allow no; \
  mirror -R -a --verbose \
    --exclude .env \
    --exclude .env.local \
    --exclude node_modules \
    --exclude .git \
    $LARAVEL ${LARAVEL_REMOTE_DIR}; \
  quit"

echo "Laravel auth deploy complete."
echo "Next on server:"
echo "  1. cp ${LARAVEL_REMOTE_DIR}/.env.example ${LARAVEL_REMOTE_DIR}/.env"
echo "  2. php artisan key:generate"
echo "  3. php artisan migrate --force"
echo "  4. php artisan php-auth:migrate-users   # if upgrading from php-auth"
echo "  5. Merge docs/apache-laravel-auth-proxy.htaccess into public_html/.htaccess"
