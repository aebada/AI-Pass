#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="$ROOT/apps/web"
API_DIR="$WEB/app/api"
STATIC_SKIP="$WEB/_static_export_skip"
AUTH_CALLBACK="$WEB/app/auth/google/callback"
LAYOUT="$WEB/app/layout.tsx"
MIDDLEWARE="$WEB/middleware.ts"
MIDDLEWARE_SKIP="$WEB/_middleware_static_export_skip.ts"

export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/local/bin:${PATH:-}"
export PNPM_PACKAGE_IMPORT_METHOD="${PNPM_PACKAGE_IMPORT_METHOD:-copy}"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=8192}"

cd "$ROOT"
env -u CI pnpm install --frozen-lockfile 2>/dev/null || env -u CI pnpm install --no-frozen-lockfile
pnpm --filter @ai-pass/livesync build
pnpm --filter @ai-pass/invoice-ai build
pnpm --filter @ai-pass/runtime-core build
pnpm --filter @ai-pass/orchestration build
pnpm --filter @ai-pass/model-hub build
pnpm --filter @ai-pass/platform-core build

# Model Hub UI lives at apps/web/app/workspace/model-hub/ — never delete it during static export prep.
MH_UI="$WEB/app/workspace/model-hub"
if [[ ! -f "$MH_UI/page.tsx" ]]; then
  echo "error: Model Hub UI missing at $MH_UI — run: python3 scripts/_write_model_hub_ui.py" >&2
  exit 1
fi

LAYOUT_BAK=""
MIDDLEWARE_MOVED=0

# Recover from a previous interrupted build (middleware/api left in skip dirs).
if [[ -f "$MIDDLEWARE_SKIP" && ! -f "$MIDDLEWARE" ]]; then
  mv "$MIDDLEWARE_SKIP" "$MIDDLEWARE"
fi
if [[ -d "$STATIC_SKIP/api" ]]; then
  rm -rf "$API_DIR"
  mv "$STATIC_SKIP/api" "$API_DIR"
fi
if [[ -d "$STATIC_SKIP/auth/google/callback" && ! -d "$AUTH_CALLBACK" ]]; then
  mkdir -p "$WEB/app/auth/google"
  mv "$STATIC_SKIP/auth/google/callback" "$AUTH_CALLBACK"
fi
rmdir "$STATIC_SKIP/auth/google" 2>/dev/null || true
rmdir "$STATIC_SKIP/auth" 2>/dev/null || true
rmdir "$STATIC_SKIP" 2>/dev/null || true

cleanup() {
  if [[ -n "$LAYOUT_BAK" && -f "$LAYOUT_BAK" ]]; then
    mv "$LAYOUT_BAK" "$LAYOUT"
  fi
  if [[ "$MIDDLEWARE_MOVED" -eq 1 && -f "$MIDDLEWARE_SKIP" ]]; then
    rm -f "$MIDDLEWARE"
    mv "$MIDDLEWARE_SKIP" "$MIDDLEWARE"
  fi
  if [[ -d "$STATIC_SKIP/api" ]]; then
    rm -rf "$API_DIR"
    mv "$STATIC_SKIP/api" "$API_DIR"
  fi
  if [[ -d "$STATIC_SKIP/auth/google/callback" ]]; then
    mkdir -p "$WEB/app/auth/google"
    mv "$STATIC_SKIP/auth/google/callback" "$AUTH_CALLBACK"
  fi
  rmdir "$STATIC_SKIP/auth/google" 2>/dev/null || true
  rmdir "$STATIC_SKIP" 2>/dev/null || true
}
trap cleanup EXIT ERR INT TERM

# Static export cannot prerender with force-dynamic root layout or auth middleware.
if [[ -f "$LAYOUT" ]]; then
  LAYOUT_BAK="${LAYOUT}.static_export_bak"
  cp "$LAYOUT" "$LAYOUT_BAK"
  sed -i '' '/NODE_STANDALONE_FORCE_DYNAMIC/,/force-dynamic/d' "$LAYOUT"
fi
if [[ -f "$MIDDLEWARE" ]]; then
  rm -f "$MIDDLEWARE_SKIP"
  mv "$MIDDLEWARE" "$MIDDLEWARE_SKIP"
  MIDDLEWARE_MOVED=1
elif [[ -f "$MIDDLEWARE_SKIP" ]]; then
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
chmod -R u+w "$WEB/.next" 2>/dev/null || true
rm -rf "$WEB/.next" "$WEB/out" /tmp/aipass-next-static /tmp/aipass-next-dist
cd "$WEB"
NEXT_DIST_DIR=/tmp/aipass-next-dist NEXT_PUBLIC_STATIC_EXPORT=1 NEXT_PUBLIC_USE_LARAVEL_AUTH=1 STATIC_EXPORT=1 pnpm build

# Next may write export to out/, /tmp/aipass-next-dist, or apps/web/tmp/aipass-next-dist
if [[ ! -f "$WEB/out/index.html" ]]; then
  for candidate in /tmp/aipass-next-dist "$WEB/tmp/aipass-next-dist"; do
    if [[ -f "$candidate/index.html" ]]; then
      echo "Using export from $candidate"
      rm -rf "$WEB/out"
      cp -R "$candidate" "$WEB/out"
      break
    fi
  done
fi

if [[ ! -f "$WEB/out/index.html" ]]; then
  echo "error: $WEB/out/index.html not found after build" >&2
  exit 1
fi

if [[ -f "$WEB/public/.htaccess" ]]; then
  cp "$WEB/public/.htaccess" "$WEB/out/.htaccess"
  echo "Installed .htaccess for Apache clean URLs + Laravel auth proxy"
fi

if [[ -f "$WEB/public/auth/run-migrate.php" ]]; then
  mkdir -p "$WEB/out/auth"
  cp "$WEB/public/auth/run-migrate.php" "$WEB/out/auth/run-migrate.php"
  echo "Installed auth/run-migrate.php for one-time Laravel migrate"
fi

# Next export creates both foo.html and foo/ — copy page HTML as index for trailing-slash hosts
while IFS= read -r -d '' html; do
  base="${html%.html}"
  if [[ -d "$base" && ! -f "$base/index.html" ]]; then
    cp "$html" "$base/index.html"
  fi
done < <(find "$WEB/out" -name '*.html' ! -name 'index.html' ! -path '*/_next/*' -print0)
echo "Installed index.html in route directories (trailing-slash / CDN hosts)"

PHP_AUTH="$ROOT/php-auth"
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
    echo "warning: php-auth vendor missing — run: (cd php-auth && php composer.phar install)" >&2
  fi
fi

for logo_asset in logo.svg logo-light.svg logo-icon.svg icon.svg; do
  if [[ -f "$WEB/public/$logo_asset" ]] && [[ ! -f "$WEB/out/$logo_asset" ]]; then
    cp "$WEB/public/$logo_asset" "$WEB/out/$logo_asset"
    echo "Copied $logo_asset to out/"
  fi
done

for stale_logo in logo.png apple-touch-icon.png; do
  if [[ -f "$WEB/out/$stale_logo" ]]; then
    rm -f "$WEB/out/$stale_logo"
    echo "Removed stale $stale_logo from out/"
  fi
done

LARAVEL_AUTH_CSS="$ROOT/services/auth-api/public/css/auth.css"
if [[ -f "$LARAVEL_AUTH_CSS" ]]; then
  mkdir -p "$WEB/out/css"
  cp "$LARAVEL_AUTH_CSS" "$WEB/out/css/auth.css"
  echo "Copied Laravel auth.css to out/css/ (Blade login/register styling)"
fi


# Verify exported HTML references existing CSS chunks (landing + app routes)
css_missing=0
while IFS= read -r -d '' html; do
  while IFS= read -r css_path; do
    [[ -z "$css_path" ]] && continue
    rel="${css_path#/}"
    if [[ ! -f "$WEB/out/$rel" ]]; then
      echo "error: missing CSS chunk $rel (referenced from ${html#$WEB/out/})" >&2
      css_missing=1
    fi
  done < <(grep -oE '/_next/static/css/[^"'"'"'<> ]+\.css' "$html" 2>/dev/null | sort -u)
done < <(find "$WEB/out" -maxdepth 2 -name 'index.html' -print0)
if [[ "$css_missing" -ne 0 ]]; then
  exit 1
fi
css_count="$(find "$WEB/out/_next/static/css" -name '*.css' 2>/dev/null | wc -l | tr -d ' ')"
echo "Verified CSS chunks in out/ ($css_count files)"

# The export copies public/ into out/ with fresh timestamps. For the ~2GB of
# desktop installers that means lftp mirror sees them as newer than the live
# copies and re-uploads every one, despite the bytes being identical. Restore
# the source mtimes so an unchanged release is skipped.
RELEASES_SRC="$WEB/public/downloads/releases"
RELEASES_OUT="$WEB/out/downloads/releases"
if [[ -d "$RELEASES_SRC" && -d "$RELEASES_OUT" ]]; then
  restamped=0
  for src in "$RELEASES_SRC"/*; do
    [[ -f "$src" ]] || continue
    out="$RELEASES_OUT/$(basename "$src")"
    [[ -f "$out" ]] || continue
    if [[ "$(stat -f %z "$src")" == "$(stat -f %z "$out")" ]]; then
      touch -r "$src" "$out"
      restamped=$((restamped + 1))
    fi
  done
  echo "Restored source mtimes on $restamped unchanged release file(s)"
fi

echo "Static export ready: $WEB/out/"
