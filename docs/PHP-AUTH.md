# PHP authentication (Google OAuth + email/password)

Session-based auth for **Hostinger shared PHP hosting** — no Node.js or NextAuth required. The static Next.js site (`apps/web/out/`) and PHP auth (`services/php-auth-legacy/`) run side-by-side on Apache.

## Architecture

```text
Browser
  ├─ /login, /workspace, …     → static HTML (Next export)
  ├─ /auth/login.php           → PHP login + email/password
  ├─ /auth/google.php          → OAuth redirect to Google
  ├─ /auth/google-callback.php → OAuth callback, session cookie
  └─ /auth/me.php              → JSON session check (PhpAuthBridge)
```

| Piece | Location |
|-------|----------|
| PHP library | `services/php-auth-legacy/auth-lib/` |
| Public routes | `services/php-auth-legacy/auth/` |
| SQL migration | `services/php-auth-legacy/sql/001_users.sql` |
| Composer deps | `google/apiclient`, `vlucas/phpdotenv` |
| Static site bridge | `apps/web/app/components/auth/PhpAuthBridge.tsx` |
| Login page (static) | `apps/web/app/login/page.tsx` → links to `/auth/google.php` when `NEXT_PUBLIC_USE_PHP_AUTH=1` |

## Local development

### 1. Install PHP dependencies

```bash
cd services/php-auth-legacy
composer install
```

### 2. Configure environment

```bash
cp auth-lib/.env.example auth-lib/.env
# Edit auth-lib/.env — use local DB or Hostinger credentials
```

For local PHP built-in server (optional):

```bash
cd services/php-auth-legacy
php -S localhost:8080 -t ..
# Open http://localhost:8080/auth/login.php
```

Set `GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google-callback.php` in Google Console for local testing.

### 3. Create database

```bash
mysql -u root -p your_db < sql/001_users.sql
```

### 4. Static site with PHP auth

```bash
./scripts/build-web-static.sh   # sets NEXT_PUBLIC_USE_PHP_AUTH=1
# Serve apps/web/out/ + services/php-auth-legacy via Apache or two terminals
```

## Hostinger production setup

### Server directory layout

On Hostinger, the FTP docroot is typically:

```text
/home/u234903558/domains/aipass.space/public_html/
```

After deploy:

```text
public_html/
├── index.html              ← static Next export
├── login.html
├── workspace.html
├── .htaccess
├── auth/
│   ├── login.php
│   ├── register.php
│   ├── google.php
│   ├── google-callback.php
│   ├── logout.php
│   ├── me.php
│   └── styles.css
└── auth-lib/               ← NOT browsable (.htaccess denies all)
    ├── .env                ← YOU CREATE THIS (secrets)
    ├── .htaccess
    ├── bootstrap.php
    ├── vendor/
    └── src/
```

**Where to store secrets:** `public_html/auth-lib/.env`  
The file is blocked by `auth-lib/.htaccess` (`Require all denied`). Do **not** put `.env` in `auth/` or the docroot root.

hPanel does **not** need separate PHP env vars for this stack — the `.env` file is loaded by `vlucas/phpdotenv` in `bootstrap.php`. (Optional: you can set the same variables in hPanel → **Advanced → PHP → Environment variables** if you prefer; `Config::fromEnvironment()` reads `$_ENV`, `$_SERVER`, and `getenv()`.)

### Environment variables (auth-lib/.env)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `APP_URL` | Yes | `https://aipass.space` | Public site URL (no trailing slash) |
| `APP_ENV` | Yes | `production` | Enables secure session cookies |
| `DB_HOST` | Yes | `localhost` | MySQL host (Hostinger: `localhost`) |
| `DB_PORT` | No | `3306` | MySQL port |
| `DB_NAME` | Yes | `u234903558_aipass` | Database name from hPanel |
| `DB_USER` | Yes | `u234903558_aipass` | Database user |
| `DB_PASS` | Yes | *(from hPanel)* | Database password |
| `GOOGLE_CLIENT_ID` | Yes | `….apps.googleusercontent.com` | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | *(from Google Console)* | OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Yes | `https://aipass.space/auth/google-callback.php` | Must match Google Console exactly |
| `SESSION_SECRET` | Recommended | `openssl rand -hex 32` | Session ID entropy hint |
| `LOGIN_SUCCESS_URL` | No | `/workspace` | Default redirect after login |

**Next.js static build** (set at build time, not on PHP server):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_USE_PHP_AUTH` | `1` |
| `NEXT_PUBLIC_STATIC_EXPORT` | `1` |

`scripts/build-web-static.sh` sets these automatically.

### Google Cloud Console (project aipass-501004)

1. **APIs & Services → Credentials → OAuth 2.0 Client ID** (Web application).
2. **Authorized JavaScript origins:**
   - `https://aipass.space`
3. **Authorized redirect URIs** (exact match):
   - `https://aipass.space/auth/google-callback.php`
   - `http://localhost:8080/auth/google-callback.php` (optional, local PHP server)

You do **not** need `/api/auth/callback/google` for PHP auth.

### Database migration

In hPanel → **Databases → phpMyAdmin**, select your database and run:

```sql
-- contents of services/php-auth-legacy/sql/001_users.sql
```

Or import the file via phpMyAdmin **Import**.

### Composer / vendor on server

**Recommended:** deploy `vendor/` from your machine (included in FTP deploy).

```bash
cd services/php-auth-legacy && composer install --no-dev --optimize-autoloader
./scripts/deploy-hostinger-php-auth.sh
```

**Alternative on server** (SSH if available on your plan):

```bash
cd ~/domains/aipass.space/public_html/auth-lib/..
cd services/php-auth-legacy  # if you uploaded full php-auth-legacy tree
composer install --no-dev --optimize-autoloader
```

Most Hostinger shared plans: run `composer install` **locally** and upload `auth-lib/vendor/` via FTP.

### Deploy checklist

1. **Build static site:** `./scripts/build-web-static.sh`
2. **Deploy static:** `./scripts/deploy-ftp.sh`
3. **Deploy PHP auth:** `./scripts/deploy-hostinger-php-auth.sh`
4. **Create** `public_html/auth-lib/.env` from `auth-lib/.env.example` (fill real secrets)
5. **Run SQL** migration `001_users.sql` in phpMyAdmin
6. **Google Console:** add redirect URI `https://aipass.space/auth/google-callback.php`
7. **Verify:**
   - `https://aipass.space/auth/login.php` — login form loads
   - `https://aipass.space/auth/google.php` — redirects to Google
   - After sign-in → `https://aipass.space/workspace` with session
   - `https://aipass.space/auth/me.php` — JSON `{"authenticated":true,...}` when logged in

## Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/auth/login.php` | GET/POST | Email/password login + Google button |
| `/auth/register.php` | GET/POST | Email registration + Google button |
| `/auth/google.php` | GET | Start Google OAuth (CSRF `state`) |
| `/auth/google-callback.php` | GET | OAuth callback, upsert user, set session |
| `/auth/logout.php` | GET | Destroy session, redirect `/` |
| `/auth/me.php` | GET | JSON session status for static app |

## User linking

- Google sign-in **upserts by email** — no duplicate users.
- Existing email/password account → Google linked (`auth_provider` = `linked`).
- New Google user → `auth_provider` = `google`.
- Stored fields: `google_id`, `email`, `name`, `avatar_url`.

## Security

- CSRF tokens on login/register forms.
- OAuth `state` parameter (single-use, session-bound).
- Session cookie: `AIPASS_SESSION`, `HttpOnly`, `SameSite=Lax`, `Secure` in production.
- `auth-lib/` denied via `.htaccess`.
- Never commit `auth-lib/.env` or real secrets.

## Static site integration

- `/login` (Next page): when built with `NEXT_PUBLIC_USE_PHP_AUTH=1`, **Continue with Google** goes to `/auth/google.php`; email sign-in links to `/auth/login.php`.
- `PhpAuthBridge` calls `/auth/me.php` with credentials to sync the React app user state.
- Primary auth entry for email/password: **`/auth/login.php`**.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `redirect_uri_mismatch` | Add exact `GOOGLE_REDIRECT_URI` in Google Console |
| Blank page / 500 on auth | Check PHP error log in hPanel; verify `vendor/` uploaded |
| Database connection failed | Verify `DB_*` in `auth-lib/.env` |
| Session not persisting | `APP_ENV=production`; site must be HTTPS |
| `/login` still uses NextAuth | Rebuild with `./scripts/build-web-static.sh` |
| `auth-lib/.env` exposed | Ensure `auth-lib/.htaccess` deployed |

See also [DEPLOY-AUTH.md](./DEPLOY-AUTH.md).
