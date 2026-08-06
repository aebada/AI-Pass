#!/usr/bin/env bash
# Build Next.js standalone server bundle for Hostinger Node / reverse-proxy deploy.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

BUILD_LOCK="$ROOT/.ai-pass-build.lock"
if ! mkdir "$BUILD_LOCK" 2>/dev/null; then
  echo "Another AI-Pass build is running ($BUILD_LOCK). Retry in a minute." >&2
  exit 1
fi
trap 'rmdir "$BUILD_LOCK" 2>/dev/null || true' EXIT

WEB="$ROOT/apps/web"
DIST="$ROOT/dist/deploy-node"
ENV_LOCAL="$WEB/.env.local"

export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-}"

cd "$ROOT"
CI=1 pnpm install --frozen-lockfile 2>/dev/null || CI=1 pnpm install
pnpm --filter @ai-pass/livesync build
pnpm --filter @ai-pass/store-api build

# Ensure API routes are present (static export may move them aside)
restore_skipped_api() {
  local skip="$WEB/app/_static_export_skip"
  if [[ -d "$skip/api" ]]; then
    echo "Restoring app/api from _static_export_skip ..."
    rm -rf "$WEB/app/api"
    mv "$skip/api" "$WEB/app/api"
    if [[ -d "$skip/auth/google/callback" ]]; then
      mkdir -p "$WEB/app/auth/google"
      rm -rf "$WEB/app/auth/google/callback"
      mv "$skip/auth/google/callback" "$WEB/app/auth/google/callback"
    fi
    rmdir "$skip/auth/google" 2>/dev/null || true
    rmdir "$skip/auth" 2>/dev/null || true
    rmdir "$skip" 2>/dev/null || true
  fi
  if [[ -d "$WEB/app/_api_static_export_skip" && ! -d "$WEB/app/api" ]]; then
    mv "$WEB/app/_api_static_export_skip" "$WEB/app/api"
  fi
  if [[ ! -f "$WEB/app/api/auth/[...nextauth]/route.ts" ]]; then
    echo "error: NextAuth route missing at app/api/auth/[...nextauth]/route.ts" >&2
    exit 1
  fi
}

patch_layout_for_node_build() {
  LAYOUT="$WEB/app/layout.tsx"
  LAYOUT_BAK="$WEB/app/.layout.tsx.node-build.bak"
  if [[ ! -f "$LAYOUT_BAK" ]]; then
    cp "$LAYOUT" "$LAYOUT_BAK"
    # Force dynamic routes so standalone build does not fail on prerender errors
    if ! grep -q NODE_STANDALONE_FORCE_DYNAMIC "$LAYOUT"; then
      perl -i -pe 'if ($.==1 && !$done++){ $done=1; $_ .= "\n// NODE_STANDALONE_FORCE_DYNAMIC\nexport const dynamic = \047force-dynamic\047;\n" }' "$LAYOUT"
    fi
  fi
}

restore_layout_after_node_build() {
  LAYOUT="$WEB/app/layout.tsx"
  LAYOUT_BAK="$WEB/app/.layout.tsx.node-build.bak"
  if [[ -f "$LAYOUT_BAK" ]]; then
    mv "$LAYOUT_BAK" "$LAYOUT"
  fi
}

restore_skipped_api

rm -rf "/.next"

patch_layout_for_node_build
trap restore_layout_after_node_build EXIT

echo "Building @ai-pass/web (standalone)..."
DEPLOY_NODE=1 pnpm --filter @ai-pass/web build

STANDALONE="$WEB/.next/standalone"
SERVER_JS="$STANDALONE/apps/web/server.js"
if [[ ! -f "$SERVER_JS" ]]; then
  echo "error: expected standalone server at $SERVER_JS" >&2
  exit 1
fi

rm -rf "$DIST"
mkdir -p "$DIST"

# Standalone app tree + static assets + public files
cp -a "$STANDALONE/." "$DIST/"
mkdir -p "$DIST/apps/web/.next"
cp -a "$WEB/.next/static" "$DIST/apps/web/.next/static"
if [[ -d "$WEB/public" ]]; then
  mkdir -p "$DIST/apps/web/public"
  cp -a "$WEB/public/." "$DIST/apps/web/public/"
fi

# start.sh — run from bundle root on the server
cat > "$DIST/start.sh" << 'START'
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export PORT="${PORT:-3000}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
if [[ -f .env.production ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.production
  set +a
fi
exec node apps/web/server.js
START
chmod +x "$DIST/start.sh"

# Template for manual server setup (no secrets)
cat > "$DIST/.env.production.example" << 'ENVEX'
# Copy to .env.production on the server and fill values (never commit .env.production).
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=https://aipass.space
NEXTAUTH_SECRET=openssl-rand-base64-32
ENVEX

# Optional: pack secrets from local dev env for FTP deploy (dist/ is gitignored)
if [[ -f "$ENV_LOCAL" ]]; then
  {
    echo "# Generated from apps/web/.env.local — upload only via secure channel"
    grep -E '^(GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|NEXTAUTH_URL|NEXTAUTH_SECRET)=' "$ENV_LOCAL" || true
  } > "$DIST/.env.production"
  # Production URL override
  if grep -q '^NEXTAUTH_URL=' "$DIST/.env.production"; then
    sed -i '' 's|^NEXTAUTH_URL=.*|NEXTAUTH_URL=https://aipass.space|' "$DIST/.env.production" 2>/dev/null \
      || sed -i 's|^NEXTAUTH_URL=.*|NEXTAUTH_URL=https://aipass.space|' "$DIST/.env.production"
  else
    echo 'NEXTAUTH_URL=https://aipass.space' >> "$DIST/.env.production"
  fi
  if ! grep -q '^GOOGLE_CLIENT_ID=' "$DIST/.env.production"; then
    echo 'GOOGLE_CLIENT_ID=148156861979-ua974fq9iatjv2gvfneh9cga49efb0mm.apps.googleusercontent.com' >> "$DIST/.env.production"
  fi
  chmod 600 "$DIST/.env.production"
  echo "Wrote $DIST/.env.production from .env.local (not committed)"
else
  echo "warn: $ENV_LOCAL missing — only .env.production.example created" >&2
fi

# Apache proxy snippet for static docroot
mkdir -p "$DIST/apache"
cp "$ROOT/docs/apache-api-proxy.htaccess" "$DIST/apache/api-proxy.htaccess" 2>/dev/null || true

echo ""
echo "Node deploy bundle ready: $DIST"
echo "Start on server: cd dist/deploy-node && ./start.sh"
