#!/usr/bin/env bash
# Deploy Invoice AI Platform — static web (Vercel-compatible) + backend notes
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="$ROOT/apps/web"
MOBILE="$ROOT/apps/invoice-ai-mobile"

export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-}"

usage() {
  cat <<'EOF'
Usage: ./scripts/deploy-invoice-ai-platform.sh [command]

Commands:
  build-web     Build static export (default)
  vercel        Build + deploy to Vercel (requires vercel CLI)
  mobile        Build Flutter APK (requires Flutter SDK)
  all           build-web + mobile build instructions

Environment:
  VERCEL_PROJECT    Optional Vercel project name
  COPY_PHP_AUTH=1   Bundle PHP auth into static export (see build-web-static.sh)

Backend (Phase 2 — optional):
  Render:   connect repo, build @ai-pass/invoice-ai + Laravel service
  Railway:  deploy services/laravel with PostgreSQL plugin

See docs/DEPLOY-INVOICE-AI-PLATFORM.md for full guide.
EOF
}

build_web() {
  echo "==> Building Invoice AI web (static export)"
  cd "$ROOT"
  pnpm --filter @ai-pass/invoice-ai build
  "$ROOT/scripts/build-web-static.sh"
  echo ""
  echo "Static artifact: $WEB/out/"
  echo "Invoice AI routes: /workspace/apps/invoice-ai/*"
}

deploy_vercel() {
  build_web
  if ! command -v vercel >/dev/null 2>&1; then
    echo "error: vercel CLI not found. Install: npm i -g vercel" >&2
    exit 1
  fi
  echo "==> Deploying to Vercel"
  cd "$WEB"
  vercel deploy --prebuilt --prod ${VERCEL_PROJECT:+--scope "$VERCEL_PROJECT"}
}

build_mobile() {
  echo "==> Building Invoice AI mobile"
  if ! command -v flutter >/dev/null 2>&1; then
    echo "error: Flutter SDK not found. See https://docs.flutter.dev/get-started/install" >&2
    exit 1
  fi
  cd "$MOBILE"
  flutter pub get
  flutter analyze
  flutter build apk --dart-define=INVOICE_AI_API_URL="${INVOICE_AI_API_URL:-http://localhost:8000/api/v1/invoice-ai}"
  echo "APK: $MOBILE/build/app/outputs/flutter-apk/app-release.apk"
}

CMD="${1:-build-web}"
case "$CMD" in
  build-web) build_web ;;
  vercel) deploy_vercel ;;
  mobile) build_mobile ;;
  all)
    build_web
    echo ""
    echo "==> Mobile: run './scripts/deploy-invoice-ai-platform.sh mobile' when Flutter is installed"
    ;;
  -h|--help|help) usage ;;
  *)
    echo "Unknown command: $CMD" >&2
    usage
    exit 1
    ;;
esac
