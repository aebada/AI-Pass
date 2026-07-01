# Laravel Authentication (Hostinger)

Session-based Google OAuth 2.0 and email/password login for the **static** Next.js export on [aipass.space](https://aipass.space). Powered by Laravel 11 + Socialite in `services/auth-api/`.

## Architecture

```text
Browser
  ├─ /login (static Next page) → links to /auth/google or /auth/login
  ├─ /auth/google → Google OAuth consent (Laravel + Socialite)
  ├─ /auth/google/callback → link/create user, Laravel session cookie
  ├─ /auth/login /auth/register → email/password (Blade)
  └─ /auth/me → JSON session (LaravelAuthBridge syncs to localStorage)

public_html/              ← static Next.js export (FTP / git deploy)
laravel-auth/             ← services/auth-api (outside public_html)
  ├─ .env                 ← secrets (never in git)
  ├─ public/index.php     ← Apache proxies /auth/* here
  └─ storage/             ← writable logs, cache, sessions
```

| Piece | Location |
|-------|----------|
| Laravel app | `services/auth-api/` |
| Google OAuth | `app/Http/Controllers/Auth/GoogleAuthController.php` |
| User model | `app/Models/User.php` (UUID, `google_id`, `avatar_url`, `auth_provider`) |
| php-auth migration (same DB) | `php artisan php-auth:migrate-users` |
| php-auth migration (remote DB) | `php artisan auth:migrate-from-legacy` |
| Static bridge | `apps/web/app/components/auth/LaravelAuthBridge.tsx` |
| Build hook | `scripts/build-web-static.sh` (sets `NEXT_PUBLIC_USE_LARAVEL_AUTH=1`) |
| FTP deploy | `scripts/deploy-hostinger-laravel-auth.sh` |

## Quick start (local)

```bash
cd services/auth-api
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
# → http://127.0.0.1:8000/auth/login
```

Install dependencies:

```bash
cd services/auth-api
composer install   # or: php ../../php-auth/composer.phar install
```

## Environment variables

Set on the server in **`~/domains/aipass.space/laravel-auth/.env`** (path may vary). Copy from `.env.example`; never commit `.env`.

| Variable | Description | Example (production) |
|----------|-------------|-------------------|
| `APP_NAME` | Application name | `AI-Pass Auth` |
| `APP_ENV` | Environment | `production` |
| `APP_KEY` | Laravel encryption key | `php artisan key:generate` |
| `APP_DEBUG` | Debug mode | `false` |
| `APP_URL` | Public site URL | `https://aipass.space` |
| `DB_CONNECTION` | Database driver | `mysql` |
| `DB_HOST` | MySQL host (Hostinger) | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_DATABASE` | Database name | from hPanel → Databases |
| `DB_USERNAME` | MySQL user | from hPanel → Databases |
| `DB_PASSWORD` | MySQL password | from hPanel → Databases |
| `SESSION_DRIVER` | Session storage | `database` |
| `SESSION_LIFETIME` | Minutes (7 days) | `10080` |
| `SESSION_COOKIE` | Cookie name | `AIPASS_SESSION` |
| `SESSION_PATH` | Cookie path | `/` |
| `SESSION_DOMAIN` | Cookie domain | `null` (same host) |
| `GOOGLE_CLIENT_ID` | OAuth client ID | Google Console |
| `GOOGLE_CLIENT_SECRET` | OAuth secret | Google Console |
| `GOOGLE_REDIRECT_URI` | OAuth callback | `https://aipass.space/auth/google/callback` |
| `LOGIN_SUCCESS_URL` | Post-login redirect | `/workspace` |
| `MAIL_*` | Email verification / password reset | Hostinger SMTP or `log` for testing |

### Static Next.js build (optional)

Set at build time in `apps/web` (see `apps/web/.env.example`):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_USE_LARAVEL_AUTH` | `1` — use Laravel routes from `/login` |
| `NEXT_PUBLIC_AUTH_API_URL` | Empty when Laravel is same origin; set e.g. `https://auth.aipass.space` for subdomain |

## Google Cloud Console (project **aipass-501004**)

1. **APIs & Services → Credentials → OAuth 2.0 Client ID** (Web application).
2. **Authorized JavaScript origins:**
   - `https://aipass.space`
3. **Authorized redirect URIs:**
   - `https://aipass.space/auth/google/callback` (**required**)
   - `http://127.0.0.1:8000/auth/google/callback` (optional local Laravel)

## Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/auth/google` | GET | Start Google OAuth |
| `/auth/google/callback` | GET | OAuth callback, session, redirect |
| `/auth/login` | GET/POST | Email sign-in (remember me) |
| `/auth/register` | GET/POST | Email registration |
| `/auth/logout` | GET/POST | End session |
| `/auth/me` | GET | JSON `{ authenticated, user }` |
| `/auth/forgot-password` | GET/POST | Request reset link |
| `/auth/reset-password/{token}` | GET/POST | Set new password |
| `/auth/verify-email` | GET | Verification notice |
| `/auth/verify-email/{id}/{hash}` | GET | Verify email (signed URL) |

Legacy php-auth URLs redirect to Laravel equivalents (`/auth/google.php` → `/auth/google`, etc.).

## Database

### Fresh install

```bash
php artisan migrate
```

Creates `users` (UUID primary key), `sessions`, `password_reset_tokens`, plus Laravel cache/jobs tables.

### Upgrade from php-auth

If the same MySQL database already has php-auth `users` rows:

```bash
php artisan migrate          # adds Laravel tables if missing
php artisan php-auth:migrate-users
```

The command:

- Renames `password_hash` → `password` when needed
- Adds `google_id`, `avatar_url`, `auth_provider`, `last_login_at` if missing
- Allows `NULL` passwords for Google-only accounts

Dry run: `php artisan php-auth:migrate-users --dry-run`

## Hostinger deployment

Hostinger **git auto-deploy** typically updates `public_html/` only. Laravel must be deployed **separately** (FTP or SSH).

### 1. Build static frontend

```bash
./scripts/build-web-static.sh
# Upload apps/web/out/ → public_html/ (existing FTP or git deploy)
```

### 2. Deploy Laravel auth

```bash
export FTP_HOST=...
export FTP_USER=...
export FTP_PASS=...
export LARAVEL_REMOTE_DIR=/laravel-auth
./scripts/deploy-hostinger-laravel-auth.sh
```

### 3. Server `.env` location

Create **`~/domains/aipass.space/laravel-auth/.env`** (adjust path to match `LARAVEL_REMOTE_DIR`):

```bash
cp .env.example .env
nano .env          # fill DB_*, GOOGLE_*, APP_KEY
php artisan key:generate
php artisan migrate --force
php artisan php-auth:migrate-users   # if upgrading
php artisan config:cache
php artisan route:cache
```

Ensure `storage/` and `bootstrap/cache/` are writable by the web server user.

### 4. Apache proxy (static + Laravel)

Merge **`docs/apache-laravel-auth-proxy.htaccess`** into **`public_html/.htaccess`** **before** the SPA fallback rule.

Set `LARAVEL_PUBLIC_PATH` in Apache config or replace the placeholder with your absolute path, e.g.:

```apache
/home/u234903558/domains/aipass.space/laravel-auth/public
```

**Order matters:** Laravel `/auth/*` rules must run **before** rules that rewrite unknown paths to `index.html`.

Alternative: point a subdomain (e.g. `auth.aipass.space`) document root to `laravel-auth/public/` and set `NEXT_PUBLIC_AUTH_API_URL=https://auth.aipass.space` at build time.

### 5. Writable directories

On the server:

```bash
chmod -R ug+rwx storage bootstrap/cache
```

## Verify

```bash
curl -sS https://aipass.space/auth/me
# → {"authenticated":false} (401) when logged out

# Browser:
# https://aipass.space/login → Continue with Google
# https://aipass.space/auth/login → email sign-in
```

## Features

- **Google OAuth:** create user, link by email, store `google_id`, `avatar_url`, `name`, `email`
- **Email/password:** register, login, logout, remember me
- **Password reset:** forgot + reset token flow
- **Email verification:** required for email registrations (`MustVerifyEmail`)
- **Session bridge:** `LaravelAuthBridge` reads `/auth/me` for workspace UI

## Legacy php-auth

`php-auth/` remains in the repository until Laravel auth is validated in production. To fall back during static builds:

```bash
COPY_PHP_AUTH=1 NEXT_PUBLIC_USE_PHP_AUTH=1 ./scripts/build-web-static.sh
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `/auth/me` returns HTML | Apache proxy not applied; check `.htaccess` order |
| `redirect_uri_mismatch` | Set `GOOGLE_REDIRECT_URI` and Console URI to `https://aipass.space/auth/google/callback` exactly |
| 500 on Laravel routes | Check `storage/logs/laravel.log`; run `php artisan migrate` |
| Session not shared with `/login` | `SESSION_PATH=/`, same domain; cookie name `AIPASS_SESSION` |
| Existing users cannot log in | Run `php artisan php-auth:migrate-users` |

## Related docs

- [PHP-AUTH.md](./PHP-AUTH.md) — legacy php-auth (deprecated path)
- [DEPLOY-AUTH.md](./DEPLOY-AUTH.md) — NextAuth + Node deploy (alternative)
