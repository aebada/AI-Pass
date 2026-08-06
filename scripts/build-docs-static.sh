#!/usr/bin/env bash
# Build static documentation site (apps/docs/site -> apps/docs/out).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/apps/docs/site"
OUT="$ROOT/apps/docs/out"

rm -rf "$OUT"
mkdir -p "$OUT"
cp -R "$SRC/." "$OUT/"

# Apache on Hostinger: directory index + trailing slash friendly
cat > "$OUT/.htaccess" <<'HTACCESS'
DirectoryIndex index.html
Options -Indexes

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Serve /path/ from /path/index.html
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteCond %{REQUEST_FILENAME}/index.html -f
  RewriteRule ^(.+[^/])$ $1/ [R=301,L]

  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME}/index.html -f
  RewriteRule ^(.+)$ $1/index.html [L]
</IfModule>
HTACCESS

echo "Docs static site ready: $OUT/"
