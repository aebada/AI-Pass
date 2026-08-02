# Developer Guide

How to work in the AI-Pass monorepo day to day.

See also: [Technical Overview](./TECHNICAL-OVERVIEW.md) · [Deployment](./DEPLOYMENT.md) · [Docs index](./README.md)

---

## Prerequisites

- **Node.js** 20+
- **pnpm** 9.x (`packageManager` in root `package.json`)
- **PHP** 8.4 + Composer (only if you run Laravel auth-api locally)
- Optional: MySQL matching Hostinger for full auth parity

---

## Install

```bash
cd /path/to/AI-Pass
pnpm install
```

Build shared libraries you will import (Turbo can orchestrate):

```bash
pnpm build
# or targeted:
pnpm --filter @ai-pass/shared build
pnpm --filter @ai-pass/platform-core build
pnpm --filter @ai-pass/provider-hub build
pnpm --filter @ai-pass/agent-studio build
pnpm --filter @ai-pass/ui build
```

---

## Run the web app

```bash
pnpm dev:web
# → http://localhost:3000
```

| URL | Purpose |
|-----|---------|
| `/` | Marketing |
| `/workspace` | Platform OS home |
| `/workspace/playground` | Model chat |
| `/workspace/agents` | Agent Studio |
| `/workspace/agents/execute` | Run agent + model picker |
| `/workspace/agents/settings` | Auto-models FAQ + admin allowlists |
| `/ide` | In-browser IDE |

Without Laravel, many `/api/v1/*` Next handlers serve **demo** data. Live AI chat against production keys requires auth-api (see below).

---

## Run Laravel auth-api (local)

```bash
cd services/auth-api
cp .env.example .env   # if needed
composer install
php artisan key:generate
php artisan migrate
php artisan serve --port=8000
```

Point the web proxy / env so `/auth` and `/api/v1/ai` reach this process (see [Laravel Auth](./LARAVEL-AUTH.md)).

Set provider keys in `.env` (examples):

```bash
OPENAI_API_KEY=
OPENROUTER_API_KEY=
KIMI_API_KEY=
KIMI_BASE_URL=https://api.moonshot.ai/v1
```

Model catalog: `config/ai.php`.

---

## Monorepo conventions

### Package naming

- npm name: `@ai-pass/<name>`
- Path: `packages/<name>`
- `"type": "module"`, build with `tsc` → `dist/`
- Export from `src/index.ts`

### Imports

Prefer package entry points:

```ts
import { getModels } from '@ai-pass/model-hub';
import { resolveAgentModel } from '@ai-pass/agent-studio';
```

Do not deep-import another package’s `src/` unless that package documents it.

### AI calls

Apps must go through Provider Hub / Laravel AI proxy — never hardcode vendor SDKs in page components.

### Agents & models

- Default / unset model → **Auto (Standard)** (`auto`)
- Override per run via execute `modelId`
- Documented in [AUTO-MODELS.md](./AUTO-MODELS.md)

### UI

Workspace pages use `WorkspaceLayoutClient` + dark tokens from `@ai-pass/ui`. Prefer existing patterns over new design systems.

### Docs

- Product/engineering docs live in `docs/`
- Update [docs/README.md](./README.md) when adding a new top-level doc

---

## Common scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install workspace |
| `pnpm build` | Build all packages/apps (Turbo) |
| `pnpm typecheck` | Typecheck |
| `pnpm dev:web` | Next dev server |
| `./scripts/build-web-static.sh` | Production static export → `apps/web/out` |
| `./scripts/deploy-ftp.sh` | Upload `out/` to Hostinger `public_html` |
| `./scripts/deploy-hostinger-laravel-auth.sh` | Upload Laravel auth-api |

---

## Adding a workspace module

1. Add module def in `packages/platform-core` (route, icon, permissions, nav).
2. Add page under `apps/web/app/workspace/<module>/`.
3. Wrap with `WorkspaceLayoutClient`.
4. Document in `docs/` and link from [docs/README.md](./README.md).
5. Rebuild `platform-core` before static export.

---

## Adding a model

1. `@ai-pass/provider-hub` catalog (+ types if new provider id).
2. `@ai-pass/model-hub` registry (if Model Hub UI lists it).
3. `services/auth-api/config/ai.php` models + `free_model_ids` + endpoints/keys.
4. Optionally `AGENT_MODEL_PICKER_OPTIONS` in `agent-studio/auto-models.ts`.
5. Rebuild hubs; redeploy Laravel + web.

---

## Testing tips

- Agent Studio: `/workspace/agents/execute` with `modelId: "auto"` and a pinned model.
- Playground: authenticated session required for live `/api/v1/ai/chat`.
- After static export, confirm CSS hashes exist under `apps/web/out/_next/static/css/` before FTP deploy.

---

## Troubleshooting

| Symptom | Check |
|---------|-------|
| `Cannot find module '@ai-pass/…'` | `pnpm install` + build that package’s `dist/` |
| Playground 401 / empty models | Laravel session + `/auth/me` + `config/ai.php` |
| CSS broken after deploy | Run `verify-live-css` / ensure full static upload |
| Agent “model not allowed” | Admin allowlist in Agent Settings / `setModelAccessPolicy` |
