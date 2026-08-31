#!/usr/bin/env bash
# Install PHP auth dependencies (google/apiclient, phpdotenv).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PHP_AUTH="$ROOT/services/php-auth-legacy"

cd "$PHP_AUTH"

if [[ ! -f composer.phar ]]; then
  curl -sS https://getcomposer.org/download/latest-stable/composer.phar -o composer.phar
fi

php composer.phar install --no-interaction --no-dev
echo "PHP auth ready: $PHP_AUTH/auth-lib/vendor"
