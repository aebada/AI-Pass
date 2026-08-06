# AI Pass — Production Deployment

How production is deployed today: **Hostinger shared hosting** with a **static Next.js export** + **Laravel auth** (`services/auth-api`).

Live site: [https://aipass.space](https://aipass.space)

Deep references:

- Concepts (static vs Node, auth proxy) → [CONCEPTS.md](./CONCEPTS.md)
- Architecture diagrams → [ARCHITECTURE.md](./ARCHITECTURE.md)
- Laravel auth details → [LARAVEL-AUTH.md](./LARAVEL-AUTH.md)
- Invoice AI platform deploy options → [DEPLOY-INVOICE-AI-PLATFORM.md](./DEPLOY-INVOICE-AI-PLATFORM.md)
- Legacy PHP auth → [PHP-AUTH.md](./PHP-AUTH.md) / [DEPLOY-AUTH.md](./DEPLOY-AUTH.md)

---

## Target architecture

```text
Hostinger
├── public_html/              ← apps/web/out/ (static Next export + .htaccess)
│   └── laravel-auth/         ← optional in-docroot copy of services/auth-api
│       └── public/index.php
└── laravel-auth/             ← OR sibling of public_html (outside web root)
    └── public/index.php
```

Apache in `public_html/.htaccess` proxies:

| Prefix | Target |
|--------|--------|
| `/auth/*` | Laravel `index.php` |
| `/api/v1/(ai\|twin)/*` | Laravel AI / Digital Twin controllers |

FTP deploy **excludes** remote `laravel-auth/` and `auth-lib/` from mirror deletes so auth is not wiped by the static site upload.

---

## Required tools

| Tool | Why |
|------|-----|
| **Node 22** | Preferred for static builds (`scripts/build-web-static.sh` puts Homebrew `node@22` first on `PATH`) |
| pnpm 9 | Workspace install / build |
| **lftp** | FTP mirror (`brew install lftp`) |
| Composer + PHP | Laravel vendor for Hostinger PHP 8.4 |

Credentials (never commit):

```bash
# scripts/.deploy-env.local is sourced automatically if present
export FTP_HOST=92.113.19.130
export FTP_USER='u234903558.aipass'
export FTP_PASS='…'
export FTP_REMOTE_DIR=/
export LARAVEL_REMOTE_DIR=/laravel-auth   # for auth deploy script
```

---

## 1. Build static web

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
./scripts/build-web-static.sh
```

What the script does:

1. `pnpm install` (with `PNPM_PACKAGE_IMPORT_METHOD=copy`)
2. Builds key packages (`livesync`, `invoice-ai`, `runtime-core`, …)
3. Temporarily moves `app/api`, Google auth callback, and middleware aside (static export cannot include them)
4. Runs `NEXT_PUBLIC_STATIC_EXPORT=1 NEXT_PUBLIC_USE_LARAVEL_AUTH=1 STATIC_EXPORT=1 pnpm build` in `apps/web`
5. Ensures `apps/web/out/index.html` exists (copies from `/tmp/aipass-next-dist` if needed)
6. Copies `.htaccess`, auth CSS, route `index.html` shims; verifies CSS chunks

**Do not deploy** if `apps/web/out/index.html` is missing or CSS verification fails.

### Build-time env (set by script)

| Variable | Value |
|----------|-------|
| `STATIC_EXPORT` | `1` |
| `NEXT_PUBLIC_STATIC_EXPORT` | `1` |
| `NEXT_PUBLIC_USE_LARAVEL_AUTH` | `1` |
| `NEXT_DIST_DIR` | `/tmp/aipass-next-dist` |

Optional: `COPY_PHP_AUTH=1` bundles legacy `php-auth/` into `out/` (not the default Laravel path).

---

## 2. Deploy static site (FTP)

```bash
./scripts/deploy-ftp.sh
# optional: ./scripts/deploy-ftp.sh --force   # only if CSS URL check must be overridden
```

Behavior:

| Phase | Action |
|-------|--------|
| Pre-flight | Requires `OUT_DIR/index.html` (default `apps/web/out`); verifies CSS/JS assets; checks webpack hash consistency with Invoice AI page |
| Staging | Copies `out/` → `/tmp/aipass-deploy-staging` |
| Upload | `_next/static` first, then full site, then **`--delete` prune** |
| Post | Uploads `.htaccess`; `verify-live-css.sh` against live site |

### FTP caveats (`--delete`)

- Phase 3 uses `mirror --delete`. A **bad or empty local tree** would delete remote files.
- The script aborts early if `index.html` is missing or CSS refs are broken — keep it that way.
- Concurrent `lftp` deploys are blocked (lock + process check).
- Remote paths `laravel-auth/` and `auth-lib/` are **excluded** from the mirror so auth stays intact.

Override artifact path:

```bash
OUT_DIR=/tmp/aipass-deploy-out ./scripts/deploy-ftp.sh
```

---

## 3. Deploy Laravel auth

```bash
./scripts/deploy-hostinger-laravel-auth.sh
```

- Pins Composer `platform.php` to **8.4.19** (Hostinger)
- `composer install --no-dev`
- Mirrors app (excludes local `.env`), uploads `vendor` as tar + `extract-vendor.php`
- Uploads `.env` from `services/auth-api/.env.production` or `.env.deploy-upload` if present

Then on server (or via `/auth/setup/{SETUP_TOKEN}`): migrate, clear setup token. Full checklist: [LARAVEL-AUTH.md](./LARAVEL-AUTH.md).

---

## Required environment (Laravel server)

File: `~/domains/aipass.space/laravel-auth/.env` (path may vary with `LARAVEL_REMOTE_DIR`).

| Variable | Purpose |
|----------|---------|
| `APP_KEY` | `php artisan key:generate` |
| `APP_URL` | `https://aipass.space` |
| `DB_*` | Hostinger MySQL |
| `SESSION_COOKIE` | `AIPASS_SESSION` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth |
| `GOOGLE_REDIRECT_URI` | `https://aipass.space/auth/google/callback` |
| `LOGIN_SUCCESS_URL` | `/workspace` |
| `MAIL_*` | SMTP for password reset (not `log`/`array` in prod) |
| `OPENAI_API_KEY` (+ other provider keys) | Playground / twin via Laravel |

Never put provider secrets in the static export or git.

Web client (build-time only, optional):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_USE_LARAVEL_AUTH` | `1` (set by build script) |
| `NEXT_PUBLIC_AUTH_API_URL` | Empty for same-origin; set if auth is on a subdomain |

---

## Google OAuth redirect URI

Google Cloud project **aipass-501004** (Web client):

| Setting | Value |
|---------|-------|
| Authorized JavaScript origin | `https://aipass.space` |
| **Authorized redirect URI** | `https://aipass.space/auth/google/callback` |

Local Laravel (optional): `http://127.0.0.1:8000/auth/google/callback`.

Mismatch → Google `redirect_uri_mismatch`.

---

## Verify

```bash
curl -sS https://aipass.space/auth/me
# logged out → JSON with authenticated:false (or 401)

curl -sS -o /dev/null -w "%{http_code}\n" https://aipass.space/
# 200

# Browser: https://aipass.space/login → Google or email → /workspace
# Invoice AI: https://aipass.space/workspace/apps/invoice-ai
```

CSS / asset check after FTP: `./scripts/verify-live-css.sh`.

---

## DNS (if domain does not resolve)

| Type | Name | Value |
|------|------|-------|
| A | `@` | Hostinger IP (e.g. `92.113.19.130`) |
| A/CNAME | `www` | Hostinger CDN / target |

Use Hostinger nameservers if the registrar still shows parking NS.

---

## Alternative paths

| Path | When |
|------|------|
| Node / NextAuth VPS | `DEPLOY_NODE=1`, see `apps/web/.env.production.example` and [AUTH.md](./AUTH.md) |
| Legacy php-auth | `COPY_PHP_AUTH=1` + [PHP-AUTH.md](./PHP-AUTH.md); redirect URI was `/auth/google-callback.php` |
| Invoice AI helpers | `./scripts/deploy-invoice-ai-platform.sh build-web` wraps the same static build |

---

## Related scripts

| Script | Role |
|--------|------|
| `scripts/build-web-static.sh` | Produce `apps/web/out/` |
| `scripts/deploy-ftp.sh` | Upload static site |
| `scripts/deploy-hostinger-laravel-auth.sh` | Upload Laravel |
| `scripts/deploy-hostinger-php-auth.sh` | Legacy PHP auth |
| `scripts/build-docs-static.sh` / `deploy-docs-ftp.sh` | Docs site |
| `scripts/verify-live-css.sh` | Post-deploy CSS check |
