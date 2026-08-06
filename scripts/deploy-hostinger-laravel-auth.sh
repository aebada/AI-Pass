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
DEPLOY_ENV="$ROOT/scripts/.deploy-env.local"

if [[ -f "$DEPLOY_ENV" ]]; then
  # shellcheck source=/dev/null
  source "$DEPLOY_ENV"
fi

: "${FTP_HOST:?Set FTP_HOST (or create scripts/.deploy-env.local)}"
: "${FTP_USER:?Set FTP_USER}"
: "${FTP_PASS:?Set FTP_PASS}"
LARAVEL_REMOTE_DIR="${LARAVEL_REMOTE_DIR:-/laravel-auth}"

export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-}"

COMPOSER_BIN=""
if command -v composer >/dev/null 2>&1; then
  COMPOSER_BIN="composer"
elif [[ -f "$ROOT/php-auth/composer.phar" ]]; then
  COMPOSER_BIN="php $ROOT/php-auth/composer.phar"
fi

if [[ -z "$COMPOSER_BIN" ]]; then
  echo "error: install Composer, then re-run" >&2
  exit 1
fi

# Hostinger shared hosting runs PHP 8.4 — pin platform so vendor matches the server.
echo "Ensuring Composer vendor targets PHP 8.4 (Hostinger)..."
(
  cd "$LARAVEL"
  eval "$COMPOSER_BIN config platform.php 8.4.19"
  eval "$COMPOSER_BIN install --no-dev --optimize-autoloader"
)

echo "Ensuring Laravel storage/bootstrap dirs exist..."
for dir in storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache; do
  mkdir -p "$LARAVEL/$dir"
done

echo "Generating Laravel package discovery cache..."
(
  cd "$LARAVEL"
  php artisan package:discover --ansi >/dev/null
)

if ! command -v lftp >/dev/null 2>&1; then
  echo "error: lftp is required (brew install lftp)" >&2
  exit 1
fi

ENV_SOURCE=""
if [[ -f "$LARAVEL/.env.production" ]]; then
  ENV_SOURCE="$LARAVEL/.env.production"
elif [[ -f "$LARAVEL/.env.deploy-upload" ]]; then
  ENV_SOURCE="$LARAVEL/.env.deploy-upload"
fi

ENV_TEMP=""
ENV_UPLOAD=""
if [[ -n "$ENV_SOURCE" ]]; then
  ENV_TEMP="$(mktemp "${TMPDIR:-/tmp}/aipass-laravel-env.XXXXXX")"
  cp "$ENV_SOURCE" "$ENV_TEMP"
  ENV_UPLOAD=1
fi

echo "Uploading Laravel auth -> ftp://${FTP_HOST}${LARAVEL_REMOTE_DIR}"
VENDOR_TAR="$(mktemp "${TMPDIR:-/tmp}/aipass-vendor.XXXXXX").tar.gz"
(
  cd "$LARAVEL"
  tar czf "$VENDOR_TAR" vendor
)
lftp -u "$FTP_USER","$FTP_PASS" "ftp://${FTP_HOST}" -e "\
  set ftp:ssl-allow no; \
  set cmd:fail-exit no; \
  set mirror:parallel-transfer-count 1; \
  rm -f ${LARAVEL_REMOTE_DIR}/bootstrap/cache/config.php; \
  rm -f ${LARAVEL_REMOTE_DIR}/bootstrap/cache/routes-v7.php; \
  mirror -R -a --verbose \
    --exclude .env \
    --exclude .env.local \
    --exclude .env.deploy-upload \
    --exclude vendor \
    --exclude bootstrap/cache/config.php \
    --exclude bootstrap/cache/routes-v7.php \
    --exclude node_modules \
    --exclude .git \
    $LARAVEL ${LARAVEL_REMOTE_DIR}; \
  put $VENDOR_TAR -o ${LARAVEL_REMOTE_DIR}/aipass-vendor.tar.gz; \
  put $LARAVEL/public/extract-vendor.php -o ${LARAVEL_REMOTE_DIR}/public/extract-vendor.php; \
  quit"
rm -f "$VENDOR_TAR"

if [[ -n "$ENV_UPLOAD" && -n "$ENV_TEMP" ]]; then
  echo "Uploading production .env -> ${LARAVEL_REMOTE_DIR}/.env"
  lftp -u "$FTP_USER","$FTP_PASS" "ftp://${FTP_HOST}" -e "\
    set ftp:ssl-allow no; \
    put $ENV_TEMP -o ${LARAVEL_REMOTE_DIR}/.env; \
    quit"
fi

rm -f "$ENV_TEMP"

if [[ -n "$ENV_UPLOAD" && -n "$ENV_SOURCE" ]]; then
  SETUP_TOKEN="$(grep ^SETUP_TOKEN= "$ENV_SOURCE" | head -1 | cut -d= -f2-)"
  if [[ -n "$SETUP_TOKEN" ]]; then
    echo "Extracting vendor on server..."
    curl -fsS "https://aipass.space/laravel-auth/public/extract-vendor.php?token=${SETUP_TOKEN}" >/dev/null || \
      echo "warn: vendor extract failed — run extract-vendor.php manually" >&2
  fi
fi

echo "Setting remote storage/bootstrap permissions (775)..."
lftp -u "$FTP_USER","$FTP_PASS" "ftp://${FTP_HOST}" -e "\
  set ftp:ssl-allow no; \
  set cmd:fail-exit no; \
  chmod 775 -R ${LARAVEL_REMOTE_DIR}/storage ${LARAVEL_REMOTE_DIR}/bootstrap/cache; \
  quit"

echo "Laravel auth deploy complete."
if [[ -n "$ENV_UPLOAD" ]]; then
  echo "Uploaded ${LARAVEL_REMOTE_DIR}/.env from ${ENV_SOURCE#$ROOT/}"
  echo "Run migrations once (no SSH):"
  echo "  curl -sS \"https://aipass.space/auth/setup/\$(grep ^SETUP_TOKEN= \"\$ENV_SOURCE\" | cut -d= -f2)\""
  echo "Then remove SETUP_TOKEN from server .env."
else
  echo "Next on server:"
  echo "  1. cp ${LARAVEL_REMOTE_DIR}/.env.example ${LARAVEL_REMOTE_DIR}/.env"
  echo "  2. php artisan key:generate"
  echo "  3. php artisan migrate --force"
fi
echo "  4. php artisan php-auth:migrate-users   # if upgrading from php-auth"
echo "  5. Merge docs/apache-laravel-auth-proxy.htaccess into public_html/.htaccess"
