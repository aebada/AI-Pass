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
# Build workspace packages required by the web app. Continue on type errors, then
# force-emit any packages that still lack dist/ so Next can resolve workspace imports.
npx turbo run build --filter=@ai-pass/web^... --continue || true
python3 - <<'PY'
import json, subprocess
from pathlib import Path
root = Path(".")
web = json.loads((root / "apps/web/package.json").read_text())
deps = {**web.get("dependencies", {}), **web.get("devDependencies", {})}
names = sorted(k[len("@ai-pass/"):] for k in deps if k.startswith("@ai-pass/"))
for name in names:
    pkg = root / "packages" / name
    if not pkg.is_dir():
        continue
    pj = pkg / "package.json"
    if not pj.exists():
        continue
    meta = json.loads(pj.read_text())
    main = meta.get("main") or ""
    # Packages that export TypeScript source directly do not need dist/
    if main.endswith((".ts", ".tsx")):
        continue
    dist_js = pkg / "dist" / "index.js"
    if dist_js.exists():
        continue
    print(f"force-emit {name}")
    subprocess.run(
        ["npx", "tsc", "--noEmitOnError", "false", "--skipLibCheck"],
        cwd=pkg,
        check=False,
    )
PY

# Stale discovery-hub dist (from older feature branches) can break static prerender.
rm -rf packages/discovery-hub/dist packages/discovery-hub/*.tsbuildinfo packages/discovery-hub/.turbo
(cd packages/discovery-hub && npx tsc --noEmitOnError false --skipLibCheck --composite false) || true

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
  # Portable in-place sed (GNU Linux + BSD/macOS)
  if sed --version >/dev/null 2>&1; then
    sed -i '/NODE_STANDALONE_FORCE_DYNAMIC/,/force-dynamic/d' "$LAYOUT"
  else
    sed -i '' '/NODE_STANDALONE_FORCE_DYNAMIC/,/force-dynamic/d' "$LAYOUT"
  fi
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

# Hostinger DirectoryIndex often prefers path/index.html over path.html.
# Mirror every *.html shell into path/index.html so /workspace/ cannot serve a stale index.
python3 - <<PY
from pathlib import Path
out = Path("$WEB/out")
count = 0
for html in out.rglob("*.html"):
    rel = html.relative_to(out)
    if rel.name == "index.html":
        continue
    target_dir = out / rel.with_suffix("")
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / "index.html"
    target.write_bytes(html.read_bytes())
    count += 1
print(f"Mirrored {count} html shells to */index.html for DirectoryIndex")
PY

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

echo "Static export ready: $WEB/out/"
