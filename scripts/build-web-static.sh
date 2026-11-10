#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="$ROOT/apps/web"
API_DIR="$WEB/app/api"
STATIC_SKIP="$WEB/app/_static_export_skip"
AUTH_CALLBACK="$WEB/app/auth/google/callback"
LAYOUT="$WEB/app/layout.tsx"
MIDDLEWARE="$WEB/middleware.ts"
MIDDLEWARE_SKIP="$WEB/_middleware_static_export_skip.ts"

export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-}"

cd "$ROOT"
CI=1 pnpm install --frozen-lockfile 2>/dev/null || CI=1 pnpm install
pnpm --filter @ai-pass/livesync build

LAYOUT_BAK=""
MIDDLEWARE_MOVED=0

cleanup() {
  if [[ -n "$LAYOUT_BAK" && -f "$LAYOUT_BAK" ]]; then
    mv "$LAYOUT_BAK" "$LAYOUT"
  fi
  if [[ "$MIDDLEWARE_MOVED" -eq 1 && -f "$MIDDLEWARE_SKIP" ]]; then
    mv "$MIDDLEWARE_SKIP" "$MIDDLEWARE"
  fi
  if [[ -d "$STATIC_SKIP/api" ]]; then
    mv "$STATIC_SKIP/api" "$API_DIR"
  fi
  if [[ -d "$STATIC_SKIP/auth/google/callback" ]]; then
    mkdir -p "$WEB/app/auth/google"
    mv "$STATIC_SKIP/auth/google/callback" "$AUTH_CALLBACK"
  fi
  rmdir "$STATIC_SKIP/auth/google" 2>/dev/null || true
  rmdir "$STATIC_SKIP/auth" 2>/dev/null || true
  rmdir "$STATIC_SKIP" 2>/dev/null || true
}
trap cleanup EXIT

# Static export cannot prerender with force-dynamic root layout or auth middleware.
if [[ -f "$LAYOUT" ]]; then
  LAYOUT_BAK="${LAYOUT}.static_export_bak"
  cp "$LAYOUT" "$LAYOUT_BAK"
  sed -i '' '/NODE_STANDALONE_FORCE_DYNAMIC/,/force-dynamic/d' "$LAYOUT"
fi
if [[ -f "$MIDDLEWARE" ]]; then
  mv "$MIDDLEWARE" "$MIDDLEWARE_SKIP"
  MIDDLEWARE_MOVED=1
fi

mkdir -p "$STATIC_SKIP"
if [[ -d "$API_DIR" ]]; then
  mv "$API_DIR" "$STATIC_SKIP/api"
fi
if [[ -d "$AUTH_CALLBACK" ]]; then
  mkdir -p "$STATIC_SKIP/auth/google"
  mv "$AUTH_CALLBACK" "$STATIC_SKIP/auth/google/callback"
fi

cd "$WEB"
NEXT_PUBLIC_STATIC_EXPORT=1 NEXT_PUBLIC_USE_LARAVEL_AUTH=1 STATIC_EXPORT=1 pnpm build

if [[ ! -f "$WEB/out/index.html" ]]; then
  echo "error: $WEB/out/index.html not found after build" >&2
  exit 1
fi

if [[ -f "$WEB/public/.htaccess" ]]; then
  cp "$WEB/public/.htaccess" "$WEB/out/.htaccess"
  echo "Installed .htaccess for Apache clean URLs"
fi

PHP_AUTH="$ROOT/services/php-auth-legacy"
if [[ -d "$PHP_AUTH/auth" && "${COPY_PHP_AUTH:-0}" == "1" ]]; then
  if [[ ! -d "$PHP_AUTH/auth-lib/vendor" ]]; then
    echo "Installing PHP auth dependencies..."
    "$ROOT/scripts/install-php-auth.sh"
  fi
  echo "Installing PHP auth into static export..."
  rm -rf "$WEB/out/auth" "$WEB/out/auth-lib"
  cp -R "$PHP_AUTH/auth" "$WEB/out/auth"
  cp -R "$PHP_AUTH/auth-lib" "$WEB/out/auth-lib"
  if [[ ! -d "$WEB/out/auth-lib/vendor" ]]; then
    echo "warning: php-auth vendor missing — run: (cd services/php-auth-legacy && php composer.phar install)" >&2
  fi
fi

for logo_asset in logo.svg logo-light.svg logo-icon.svg icon.svg; do
  if [[ -f "$WEB/public/$logo_asset" ]] && [[ ! -f "$WEB/out/$logo_asset" ]]; then
    cp "$WEB/public/$logo_asset" "$WEB/out/$logo_asset"
    echo "Copied $logo_asset to out/"
  fi
done

echo "Static export ready: $WEB/out/"
