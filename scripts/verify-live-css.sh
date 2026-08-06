#!/usr/bin/env bash
# Verify live site CSS chunks referenced by index.html return HTTP 200 + text/css.
set -euo pipefail

LIVE_URL="${1:-${DEPLOY_VERIFY_URL:-https://aipass.space}}"
LIVE_URL="${LIVE_URL%/}"

if ! command -v curl >/dev/null 2>&1; then
  echo "error: curl is required" >&2
  exit 1
fi

live_html="$(curl -fsSL "${LIVE_URL}/" 2>/dev/null || true)"
if [[ -z "$live_html" ]]; then
  echo "error: could not fetch ${LIVE_URL}/" >&2
  exit 1
fi

css_paths="$(grep -oE '/_next/static/css/[a-zA-Z0-9._-]+\.css' <<<"$live_html" | sort -u)"
css_count="$(grep -c . <<<"$css_paths" || true)"

if [[ "$css_count" -eq 0 ]]; then
  echo "error: no CSS URLs found in live index.html" >&2
  exit 1
fi

echo "Checking ${css_count} CSS URL(s) from ${LIVE_URL}/"

fail=0
while IFS= read -r css_path; do
  [[ -z "$css_path" ]] && continue
  tmp="$(mktemp)"
  bust="${css_path}?__deploy_verify=$(date +%s)"
  code="$(curl -sS -o "$tmp" -w '%{http_code}' "${LIVE_URL}${bust}")"
  headers="$(curl -sSI "${LIVE_URL}${bust}" | tr -d '\r')"
  ctype="$(grep -i '^content-type:' <<<"$headers" | head -1 | cut -d: -f2- | tr -d ' ' | tr '[:upper:]' '[:lower:]')"
  if head -c 40 "$tmp" | grep -qiE '<!DOCTYPE|<html'; then
    body_kind=HTML
  else
    body_kind=CSS
  fi
  rm -f "$tmp"

  if [[ "$code" != "200" ]]; then
    echo "FAIL  HTTP ${code}  ${css_path}"
    fail=1
  elif [[ "$body_kind" == "HTML" ]]; then
    echo "FAIL  body=HTML (SPA fallback)  ${ctype:-unknown}  ${css_path}"
    fail=1
  elif [[ "$ctype" != text/css* ]]; then
    echo "FAIL  content-type=${ctype:-unknown}  ${css_path}"
    fail=1
  else
    echo "OK    HTTP 200 text/css  ${css_path}"
  fi
done <<<"$css_paths"

if [[ "$fail" -ne 0 ]]; then
  echo "error: live CSS verification failed (${css_count} checked)" >&2
  exit 1
fi

echo "Live CSS verification passed (${css_count} files)."
