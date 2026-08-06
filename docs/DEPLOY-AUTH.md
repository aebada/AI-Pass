# Deploy Google login on aipass.space (PHP auth)

Production Google Sign-In uses **PHP sessions** on Hostinger shared hosting — **no Node.js** required.

For full reference (env vars, file paths, Google Console), see **[PHP-AUTH.md](./PHP-AUTH.md)**.

## Quick deploy

```bash
# 1. Static Next export (enables PHP auth bridge in the bundle)
./scripts/build-web-static.sh
./scripts/deploy-ftp.sh

# 2. PHP auth (login, OAuth callback, vendor/)
cd php-auth && composer install --no-dev --optimize-autoloader
cd ..
./scripts/deploy-hostinger-php-auth.sh
```

FTP credentials (never commit):

```bash
export FTP_HOST=92.113.19.130
export FTP_USER='u234903558.aipass'
export FTP_PASS='your-password'
export FTP_REMOTE_DIR=/
```

## Secrets on the server

**File:** `domains/aipass.space/public_html/auth-lib/.env`  
(Copy from `php-auth/auth-lib/.env.example` and fill in values.)

| Variable | Example |
|----------|---------|
| `APP_URL` | `https://aipass.space` |
| `APP_ENV` | `production` |
| `DB_HOST` | `localhost` |
| `DB_NAME` | `u234903558_aipass` |
| `DB_USER` | `u234903558_aipass` |
| `DB_PASS` | *(hPanel → Databases)* |
| `GOOGLE_CLIENT_ID` | *(Google Console)* |
| `GOOGLE_CLIENT_SECRET` | *(Google Console)* |
| `GOOGLE_REDIRECT_URI` | `https://aipass.space/auth/google-callback.php` |
| `SESSION_SECRET` | `openssl rand -hex 32` |
| `LOGIN_SUCCESS_URL` | `/workspace` |

## Google Cloud Console (aipass-501004)

**Authorized redirect URI (required):**

```text
https://aipass.space/auth/google-callback.php
```

**Authorized JavaScript origin:**

```text
https://aipass.space
```

## Database

Run `php-auth/sql/001_users.sql` once in phpMyAdmin.

## Verify

```bash
curl -sS -o /dev/null -w "%{http_code}" https://aipass.space/auth/login.php
# Expect 200

curl -sS https://aipass.space/auth/me.php
# Expect {"authenticated":false} when logged out
```

Open **https://aipass.space/auth/login.php** → **Continue with Google** → should land on `/workspace` with a session.

The static `/login` page also works when the site is built with `NEXT_PUBLIC_USE_PHP_AUTH=1` (default in `build-web-static.sh`).

## Architecture

```text
Browser → https://aipass.space/auth/google.php
       → Google OAuth
       → https://aipass.space/auth/google-callback.php
       → PHP session cookie (AIPASS_SESSION)
       → redirect /workspace
       → PhpAuthBridge reads /auth/me.php
```

Static HTML continues to be served from `public_html/`; PHP handles `/auth/*.php` only.

## Legacy Node / NextAuth path

The previous Node.js + NextAuth approach (`/api/auth/*`, reverse proxy) is **not required** for Hostinger static hosting. See git history of this file if you need the Node deployment notes.
