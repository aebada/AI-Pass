# Deploy Invoice AI Platform

Step-by-step deployment guide for the Invoice AI Financial Automation Platform.

## Prerequisites

- Node.js 20+
- pnpm 9+
- PHP 8.2+ with Laravel (for auth/API backend)
- PostgreSQL or MySQL (Laravel)
- Optional: Flutter SDK 3.x (mobile app)

## Demo Credentials

For local and static-demo deployments without OAuth configured:

| Field    | Value              |
|----------|--------------------|
| Email    | `demo@example.com` |
| User ID  | `demo-user`        |
| Tenant   | `tenant_acme` (Acme Corp) |
| Role     | `finance_manager`  |

Sign in via `/login` when `NEXT_PUBLIC_USE_PHP_AUTH=1` or `NEXT_PUBLIC_USE_LARAVEL_AUTH=1` is set, or use the in-app demo profile persisted in localStorage.

Mobile app: use the same demo email on the Login screen — API calls include `X-Tenant-Id: tenant_acme`.

## Quick Deploy Script

```bash
chmod +x scripts/deploy-invoice-ai-platform.sh

# Static web export
./scripts/deploy-invoice-ai-platform.sh build-web

# Vercel (requires vercel CLI + linked project)
./scripts/deploy-invoice-ai-platform.sh vercel

# Flutter APK
./scripts/deploy-invoice-ai-platform.sh mobile
```

### Vercel (static frontend)

1. Build: `./scripts/deploy-invoice-ai-platform.sh build-web`
2. Set root directory to `apps/web/out` or use `vercel deploy --prebuilt`
3. Environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_USE_LARAVEL_AUTH=1` (or PHP auth)
   - `NEXT_PUBLIC_INVOICE_AI_API_URL=https://your-api.example.com/api/v1/invoice-ai`

### Render / Railway (optional backend)

**Render:** Create a Web Service from this repo; build command `pnpm install && pnpm --filter @ai-pass/invoice-ai build`; start command points to Laravel or Node API handler.

**Railway:** Deploy `services/laravel` with PostgreSQL; set `APP_URL`, OAuth secrets, and `OPENAI_API_KEY`. Point `NEXT_PUBLIC_INVOICE_AI_API_URL` at the Railway public URL.

Until the backend is live, the web app uses `@ai-pass/invoice-ai` in-browser demo services (no network required for core flows).

## Environment Variables

### Web App (`apps/web/.env.production`)

```env
# Laravel auth bridge
NEXT_PUBLIC_AUTH_API_URL=https://api.your-domain.com
NEXT_PUBLIC_APP_URL=https://app.your-domain.com

# Static export (current mode)
NEXT_OUTPUT=export

# Optional: live API when Phase 2 routes are deployed
NEXT_PUBLIC_INVOICE_AI_API_URL=https://api.your-domain.com/api/v1/invoice-ai
```

### Laravel Backend

```env
APP_URL=https://api.your-domain.com
DB_CONNECTION=pgsql
DB_HOST=
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

# OAuth providers (Phase 2)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# AI providers (via provider-hub)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Wallet / credits
FREE_MONTHLY_CREDITS=500
```

### Invoice AI Package (server-side)

```env
FREE_MONTHLY_CREDITS=500
FREE_DAILY_REQUESTS=100
```

## Build Steps

### 1. Install dependencies

```bash
pnpm install
```

### 2. Build platform packages

```bash
pnpm --filter @ai-pass/provider-hub build
pnpm --filter @ai-pass/wallet build
pnpm --filter @ai-pass/agent-studio build
pnpm --filter @ai-pass/marketplace build
pnpm --filter @ai-pass/invoice-ai build
```

### 3. Run tests

```bash
pnpm --filter @ai-pass/invoice-ai test
```

### 4. Build web app

```bash
pnpm build:web
```

Output: `apps/web/out/` (static export)

### 5. Deploy static web

Options:
- **Apache/Nginx**: Serve `apps/web/out/` with SPA fallback to `index.html`
- **S3 + CloudFront**: Upload `out/` bucket, configure error page → `index.html`
- **cPanel**: Use existing `.htaccess` in `apps/web/public/`

### 6. Deploy Laravel API (Phase 2)

```bash
cd services/laravel  # adjust to your Laravel path
composer install --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

Point reverse proxy (`/api/*`) to Laravel PHP-FPM.

## Verification Checklist

1. Open `/login` — authenticate via Laravel bridge
2. Navigate to `/workspace/apps/invoice-ai` — platform banner shows active router + tenant
3. Upload a PDF at `/workspace/apps/invoice-ai/upload` — invoice appears in portfolio
4. Check `/workspace/apps/invoice-ai/admin` — demo metrics render
5. Chat at `/workspace/apps/invoice-ai/chat` — query returns answer
6. Approve at `/workspace/apps/invoice-ai/approvals`

## Mobile Deployment (Phase 3)

```bash
cd apps/invoice-ai-mobile
flutter pub get
flutter build apk   # Android
flutter build ios   # iOS
```

Configure `lib/config.dart` with production API URL.

## Monitoring

- Wallet usage: `@ai-pass/wallet` usage history per user/tenant
- Provider health: `@ai-pass/provider-hub` HealthMonitor
- Workflow runs: admin metrics endpoint (stub → DB in Phase 2)

## Security Notes

- Never commit `.env` files with API keys
- PII masking runs before model routing in upload pipeline
- RBAC permissions defined in `packages/invoice-ai/src/tenant/types.ts` — enforce on API in Phase 2
- Enable MFA for admin roles in production

## Rollback

Static export rollback: redeploy previous `out/` artifact.

API rollback: `php artisan migrate:rollback` + redeploy previous Laravel release.
