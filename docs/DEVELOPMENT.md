# AI Pass — Local Development

Prerequisites and workflows for working in the monorepo.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | **22 preferred** (`>=20` required by `package.json` engines) | Static build script prepends Homebrew `node@22` to `PATH` |
| **pnpm** | 9.x (`packageManager`: `pnpm@9.15.0`) | Enable via `corepack enable` |
| **PHP + Composer** | 8.2+ (8.4 matches Hostinger) | Only for Laravel auth local / deploy |
| **lftp** | any | Only for FTP deploys |

Optional: Flutter SDK (Invoice AI mobile), Electron deps (desktop/ide).

---

## Install

From the repo root (`/Volumes/All/Dev/AI-Pass` or your clone):

```bash
# Prefer Node 22 on macOS Homebrew
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"

# On external / network volumes, copy is safer than hardlinks
export PNPM_PACKAGE_IMPORT_METHOD=copy

pnpm install
```

Root scripts:

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install all workspace deps |
| `pnpm build` | Turbo build all packages/apps that define `build` |
| `pnpm typecheck` | Turbo typecheck |
| `pnpm lint` | Turbo lint |
| `pnpm clean` | Clean Turbo outputs + root `node_modules` |

---

## Dev servers

```bash
pnpm dev:web          # Next.js @ http://localhost:3000 (0.0.0.0)
pnpm dev:desktop      # Electron + web
pnpm --filter @ai-pass/ide start   # IDE shell (see IDE.md)
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Business landing |
| http://localhost:3000/login | Auth (NextAuth when not using Laravel flags) |
| http://localhost:3000/workspace | Platform workspace |
| http://localhost:3000/workspace/apps/invoice-ai | Invoice AI |
| http://localhost:3000/ide | In-browser IDE |
| http://127.0.0.1:8000/auth/login | Laravel auth (after `php artisan serve`) |

### Web env (NextAuth local)

```bash
cp apps/web/.env.example apps/web/.env.local
# Set GOOGLE_CLIENT_ID/SECRET, NEXTAUTH_URL=http://localhost:3000, NEXTAUTH_SECRET
```

See [AUTH.md](./AUTH.md).

### Laravel auth (local)

```bash
cd services/auth-api
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

See [LARAVEL-AUTH.md](./LARAVEL-AUTH.md).

---

## Building packages you care about

Static export and many web imports expect built `dist/` for some packages. The static script builds these explicitly:

```bash
pnpm --filter @ai-pass/livesync build
pnpm --filter @ai-pass/invoice-ai build
pnpm --filter @ai-pass/runtime-core build
pnpm --filter @ai-pass/orchestration build
pnpm --filter @ai-pass/model-hub build
pnpm --filter @ai-pass/platform-core build
```

Or rely on Turbo:

```bash
pnpm build
pnpm build:web
```

---

## Testing packages

Example — Invoice AI unit tests (Node test runner + tsx):

```bash
pnpm --filter @ai-pass/invoice-ai test
pnpm --filter @ai-pass/invoice-ai typecheck
```

Other packages follow the same pattern when they define `"test"` / `"typecheck"` in `package.json`.

---

## Common pitfalls

### `node_modules` on an external / exFAT / network volume

This repo often lives on an external disk (`/Volumes/...`). pnpm hardlinks can fail or leave broken installs.

**Mitigations:**

- Set `PNPM_PACKAGE_IMPORT_METHOD=copy` (also defaulted in `build-web-static.sh`).
- If install looks corrupt (`node_modules_bad_*` leftovers), remove bad trees and reinstall:

  ```bash
  rm -rf node_modules apps/*/node_modules packages/*/node_modules
  pnpm install
  ```

- Prefer cloning to a local APFS/SSD volume for day-to-day work if installs keep failing.

### Static export constraints

| Constraint | Implication |
|------------|-------------|
| `STATIC_EXPORT=1` → `output: 'export'` | No Node server; no dynamic API routes in the artifact |
| Build moves `app/api` aside | Restored by trap on exit — interrupted builds may leave `_static_export_skip/` |
| Middleware disabled for export | Auth middleware file temporarily renamed during build |
| Root layout `force-dynamic` stripped | Required for prerender |
| Dotfiles | Next may not copy `.htaccess`; script copies `public/.htaccess` → `out/` |

Never deploy an incomplete `out/` (missing `index.html` or CSS chunks). See [DEPLOYMENT.md](./DEPLOYMENT.md).

### Auth flags vs local NextAuth

| Mode | Flags |
|------|-------|
| Local NextAuth | Leave `NEXT_PUBLIC_USE_LARAVEL_AUTH` unset; use `.env.local` |
| Static / Hostinger-like | `build-web-static.sh` sets `NEXT_PUBLIC_USE_LARAVEL_AUTH=1` and `NEXT_PUBLIC_STATIC_EXPORT=1` |

### Memory during Next static build

`build-web-static.sh` sets `NODE_OPTIONS=--max-old-space-size=8192`. Raise if the machine OOMs.

### Model Hub UI missing

If `apps/web/app/workspace/model-hub/page.tsx` is absent, the static build fails. Regenerate with:

```bash
python3 scripts/_write_model_hub_ui.py
```

---

## Useful paths

| Path | Role |
|------|------|
| `apps/web/next.config.ts` | Static vs standalone (`STATIC_EXPORT`, `DEPLOY_NODE`) |
| `apps/web/.env.example` | Client/server env template |
| `services/auth-api/.env.example` | Laravel env template |
| `.env.example` (root) | Minimal provider keys for monorepo tools |

---

## Related

- [CONCEPTS.md](./CONCEPTS.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [INVOICE-AI.md](./INVOICE-AI.md)
- [DATA-MODEL.md](./DATA-MODEL.md)
