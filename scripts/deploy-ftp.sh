#!/usr/bin/env bash
# Deploy apps/web static export to Hostinger FTP (live site: https://aipass.space).
# Credentials via environment (never commit passwords):
#   FTP_HOST, FTP_USER, FTP_PASS, FTP_REMOTE_DIR (default: /)
# Optional: OUT_DIR=/path/to/out (e.g. /tmp/aipass-deploy-out)
#
# Usage:
#   ./scripts/build-web-static.sh
#   ./scripts/deploy-ftp.sh [--force]
#
# --force  Allow deploy when index.html references zero CSS URLs (normally aborted).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_ENV="$ROOT/scripts/.deploy-env.local"
LOCK_FILE="/tmp/aipass-deploy.lock"
STAGING_DIR="/tmp/aipass-deploy-staging"
FORCE_DEPLOY=0

for arg in "$@"; do
  case "$arg" in
    --force) FORCE_DEPLOY=1 ;;
    -h|--help)
      echo "Usage: $0 [--force]" >&2
      exit 0
      ;;
    *)
      echo "error: unknown argument: $arg (try --force)" >&2
      exit 1
      ;;
  esac
done

if [[ -f "$DEPLOY_ENV" ]]; then
  # shellcheck source=/dev/null
  source "$DEPLOY_ENV"
fi

: "${FTP_HOST:?Set FTP_HOST (or create scripts/.deploy-env.local)}"
: "${FTP_USER:?Set FTP_USER}"
: "${FTP_PASS:?Set FTP_PASS}"
FTP_REMOTE_DIR="${FTP_REMOTE_DIR:-/}"

export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/local/bin:${PATH:-}"

OUT_DIR="${OUT_DIR:-$ROOT/apps/web/out}"

acquire_lock() {
  if command -v flock >/dev/null 2>&1; then
    exec 9>"$LOCK_FILE"
    if ! flock -n 9; then
      echo "error: another deploy holds $LOCK_FILE — aborting" >&2
      exit 1
    fi
  elif [[ -f "$LOCK_FILE" ]]; then
    lock_pid="$(cat "$LOCK_FILE" 2>/dev/null || true)"
    if [[ -n "$lock_pid" ]] && kill -0 "$lock_pid" 2>/dev/null; then
      echo "error: another deploy is running (pid $lock_pid, lock $LOCK_FILE)" >&2
      exit 1
    fi
    echo $$ >"$LOCK_FILE"
  else
    echo $$ >"$LOCK_FILE"
  fi
}

release_lock() {
  rm -f "$LOCK_FILE" 2>/dev/null || true
}

if pgrep -x lftp >/dev/null 2>&1; then
  echo "error: another lftp deploy is already running — aborting to avoid partial upload" >&2
  pgrep -fl '^lftp' >&2 || true
  exit 1
fi

acquire_lock
trap release_lock EXIT

if [[ ! -f "$OUT_DIR/index.html" ]]; then
  echo "error: missing $OUT_DIR/index.html — run ./scripts/build-web-static.sh first" >&2
  exit 1
fi

if ! command -v lftp >/dev/null 2>&1; then
  echo "error: lftp is required (brew install lftp)" >&2
  exit 1
fi

extract_css_urls() {
  local html="$1"
  grep -oE '/_next/static/css/[a-zA-Z0-9._-]+\.css' "$html" 2>/dev/null | sort -u
}

verify_local_css() {
  local base="$1"
  local html="$base/index.html"
  local css_urls css_count missing=0 css_path rel

  if [[ ! -f "$html" ]]; then
    echo "error: missing $html" >&2
    exit 1
  fi

  css_urls="$(extract_css_urls "$html")"
  css_count="$(grep -c . <<<"${css_urls:-}" || true)"

  if [[ "$css_count" -eq 0 ]]; then
    if [[ "$FORCE_DEPLOY" -eq 1 ]]; then
      echo "warning: index.html references 0 CSS URLs — proceeding due to --force" >&2
    else
      echo "error: index.html references 0 CSS URLs — aborting (pass --force to override)" >&2
      exit 1
    fi
    return 0
  fi

  echo "Pre-flight: verifying $css_count CSS file(s) in $base"
  while IFS= read -r css_path; do
    [[ -z "$css_path" ]] && continue
    rel="${css_path#/}"
    if [[ ! -f "$base/$rel" ]]; then
      echo "error: missing local CSS: $rel (referenced in index.html)" >&2
      missing=1
    fi
  done <<<"$css_urls"

  if [[ "$missing" -ne 0 ]]; then
    echo "error: rebuild with ./scripts/build-web-static.sh before deploy" >&2
    exit 1
  fi

  # Also verify JS chunks referenced from index.html
  local asset
  for asset in $(grep -oE '/_next/static/(css|chunks)/[a-zA-Z0-9._-]+\.(css|js)' "$html" | sort -u); do
    if [[ ! -f "$base${asset}" ]]; then
      echo "error: index.html references missing asset: $asset" >&2
      exit 1
    fi
  done

  local invoice_html="$base/workspace/apps/invoice-ai/index.html"
  if [[ -f "$invoice_html" ]]; then
    local home_webpack invoice_webpack
    home_webpack="$(grep -oE 'webpack-[a-f0-9]+\.js' "$html" | head -1)"
    invoice_webpack="$(grep -oE 'webpack-[a-f0-9]+\.js' "$invoice_html" | head -1)"
    if [[ -n "$home_webpack" && -n "$invoice_webpack" && "$home_webpack" != "$invoice_webpack" ]]; then
      echo "error: webpack runtime hash mismatch between index.html and invoice-ai page" >&2
      exit 1
    fi
    if [[ -n "$home_webpack" && ! -f "$base/_next/static/chunks/$home_webpack" ]]; then
      echo "error: HTML references missing webpack runtime: $home_webpack" >&2
      exit 1
    fi
    echo "Verified webpack runtime hash: ${home_webpack:-unknown}"
  fi

  echo "Pre-flight passed: all $css_count CSS files present locally"
}

stage_out_dir() {
  local src="$1"
  local dest="$2"
  echo "Staging deploy snapshot: $src -> $dest"
  rm -rf "$dest"
  cp -a "$src" "$dest"
  if [[ ! -f "$dest/index.html" ]]; then
    echo "error: staging copy missing index.html at $dest" >&2
    exit 1
  fi
}

lftp_mirror() {
  local local_dir="$1"
  local remote_dir="$2"
  local extra_flags="${3:-}"
  lftp -u "$FTP_USER","$FTP_PASS" "ftp://${FTP_HOST}" -e "\
    set ftp:ssl-allow no; \
    set net:max-retries 2; \
    set net:reconnect-interval-base 5; \
    set mirror:parallel-transfer-count 1; \
    mirror -R -a --verbose $extra_flags \
      --exclude-glob .htaccess.bak \
      --exclude-glob laravel-auth/ \
      --exclude-glob laravel-auth/** \
      --exclude-glob auth-lib/ \
      --exclude-glob auth-lib/** \
      $local_dir $remote_dir; \
    quit"
}

verify_local_css "$OUT_DIR"
stage_out_dir "$OUT_DIR" "$STAGING_DIR"
verify_local_css "$STAGING_DIR"

echo "Uploading from staging $STAGING_DIR -> ftp://${FTP_HOST}${FTP_REMOTE_DIR}"
echo "Phase 1/3: upload _next/static/ (no --delete)"
lftp_mirror "$STAGING_DIR/_next/static" "${FTP_REMOTE_DIR}/_next/static" ""

echo "Phase 2/3: upload site (no --delete)"
lftp_mirror "$STAGING_DIR" "$FTP_REMOTE_DIR" ""

echo "Phase 3/3: prune remote orphans (--delete)"
lftp_mirror "$STAGING_DIR" "$FTP_REMOTE_DIR" "--delete"

echo "Uploading .htaccess"
lftp -u "$FTP_USER","$FTP_PASS" "ftp://${FTP_HOST}" -e "\
  set ftp:ssl-allow no; \
  put $STAGING_DIR/.htaccess -o ${FTP_REMOTE_DIR}/.htaccess; \
  quit"

echo "Deploy upload complete. Verifying live CSS..."

if ! "$ROOT/scripts/verify-live-css.sh"; then
  echo "error: post-deploy verification failed — site may be unstyled" >&2
  echo "hint: re-run ./scripts/deploy-ftp.sh when no other lftp process is active" >&2
  exit 1
fi

LIVE_URL="${DEPLOY_VERIFY_URL:-https://aipass.space}"
LIVE_URL="${LIVE_URL%/}"
live_html="$(curl -fsSL "${LIVE_URL}/" 2>/dev/null || true)"
invoice_live="$(curl -fsSL "${LIVE_URL}/workspace/apps/invoice-ai" 2>/dev/null || true)"
if [[ -n "$live_html" && -n "$invoice_live" ]]; then
  live_webpack="$(grep -oE 'webpack-[a-f0-9]+\.js' <<<"$live_html" | head -1)"
  invoice_webpack="$(grep -oE 'webpack-[a-f0-9]+\.js' <<<"$invoice_live" | head -1)"
  if [[ -n "$live_webpack" && -n "$invoice_webpack" && "$live_webpack" != "$invoice_webpack" ]]; then
    echo "error: live webpack hash mismatch (home=$live_webpack invoice=$invoice_webpack)" >&2
    exit 1
  fi
fi

echo "Deploy complete — live CSS verification passed."
