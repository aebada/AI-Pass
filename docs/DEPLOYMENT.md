# Deployment Guide

How AI-Pass is published to production (**aipass.space** on Hostinger).

See also: [Developer Guide](./DEVELOPER-GUIDE.md) · [Laravel Auth](./LARAVEL-AUTH.md) · [Deploy Auth](./DEPLOY-AUTH.md)

---

## Production topology

```text
Hostinger
├── domains/aipass.space/public_html/     ← Next static export (apps/web/out)
└── domains/aipass.space/laravel-auth/    ← Laravel auth-api (outside web root)
```

Apache in `public_html` proxies:

- `/auth/*` → Laravel
- `/api/v1/ai/*` (and related) → Laravel

Credentials for FTP scripts live in `scripts/.deploy-env.local` (gitignored):

```bash
FTP_HOST=...
FTP_USER=...
FTP_PASS=...
LARAVEL_REMOTE_DIR=/laravel-auth   # optional
FTP_REMOTE_DIR=/                   # optional, public_html root
```

---

## 1. Build static web

```bash
export NODE_OPTIONS=--max-old-space-size=8192
./scripts/build-web-static.sh
```

Output: `apps/web/out/`

Pre-flight: confirm CSS under `apps/web/out/_next/static/css/` and that `index.html` references those hashes.

Rebuild packages that the web app imports before export (at least):

```bash
pnpm --filter @ai-pass/platform-core build
pnpm --filter @ai-pass/provider-hub build
pnpm --filter @ai-pass/model-hub build   # if present
pnpm --filter @ai-pass/agent-studio build
pnpm --filter @ai-pass/ui build
pnpm --filter @ai-pass/membership build
```

---

## 2. Deploy static site (FTP)

```bash
./scripts/deploy-ftp.sh
# optional verification:
./scripts/verify-live-css.sh
```

Notes:

- Script uses a lock file (`/tmp/aipass-deploy.lock`) — do not run two FTP deploys at once.
- Large binaries under `/downloads/releases/` can make sync slow; expect long runs.
- Use `--force` only if you intentionally deploy an export with no CSS references.

---

## 3. Deploy Laravel auth-api

```bash
./scripts/deploy-hostinger-laravel-auth.sh
```

This installs Composer deps targeting PHP 8.4 and uploads the app to `LARAVEL_REMOTE_DIR`.

On the server after upload (SSH or Hostinger terminal if available):

```bash
cd ~/domains/aipass.space/laravel-auth
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

### Secrets on server `.env`

Never commit production secrets. Ensure at least:

| Variable | Purpose |
|----------|---------|
| `APP_KEY` | Laravel |
| `APP_URL` | `https://aipass.space` |
| DB_* | MySQL |
| `GOOGLE_CLIENT_*` | OAuth |
| `OPENAI_API_KEY` / `OPENROUTER_API_KEY` / `KIMI_API_KEY` / … | AI providers |
| `MAIL_*` | Password reset email (not `log` in production) |

Model catalog updates require deploying `config/ai.php` (via this script) + `config:cache` clear/rebuild.

---

## 4. Post-deploy checks

1. `https://aipass.space/` loads with styles (not unstyled HTML).
2. `https://aipass.space/auth/me` returns JSON (`authenticated` true/false).
3. Signed-in Playground: `GET /api/v1/ai/models` lists latest models (incl. Kimi / GPT-5.6 family when configured).
4. Agent Execute: Auto (Standard) resolves and logs the effective model.
5. Google login round-trips to `/workspace`.

---

## 5. Rollback tips

- Keep previous `out/` artifact locally; re-upload if a bad static build ships.
- Laravel: redeploy last known-good `config/ai.php` / code tarball; `php artisan config:cache`.
- Avoid partial FTP uploads of `/_next/static` — prefer full deploy script staging flow.

---

## 6. Related scripts

| Script | Role |
|--------|------|
| `scripts/build-web-static.sh` | Next static export |
| `scripts/deploy-ftp.sh` | Upload web |
| `scripts/verify-live-css.sh` | Live CSS hash check |
| `scripts/deploy-hostinger-laravel-auth.sh` | Upload Laravel |
| `scripts/deploy-docs-ftp.sh` | Optional docs site |

---

## 7. Environments

| Env | Web | Auth |
|-----|-----|------|
| Local | `pnpm dev:web` :3000 | `php artisan serve` :8000 |
| Production | Static `public_html` | `laravel-auth` behind Apache proxy |
