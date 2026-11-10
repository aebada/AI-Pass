# AI-Pass Backend API

Minimal FastAPI service (Sprint 0 scaffold). Config is environment-aware via
`app/config.py`, driven by the `APP_ENV` system variable (falls back to
`ENVIRONMENT`, defaults to `development`).

## Setup

```bash
cd apps/backend-api
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements-dev.txt   # includes requirements.txt + test deps
```

Each environment has its own env file:

| File | Committed? | Purpose |
| --- | --- | --- |
| `.env.example` | Yes | Template documenting every variable |
| `.env.development` | No (gitignored) | Local dev defaults, works out of the box |
| `.env.staging` | No (gitignored) | Staging — fill in `DATABASE_URL`/`SECRET_KEY` |
| `.env.production` | No (gitignored) | Production — fill in via your secrets store |

If you're setting this up fresh and the gitignored files aren't present, copy
`.env.example` to `.env.<environment>` and fill in real values.

## Running

Set `APP_ENV` and start uvicorn — it will load the matching `.env.<APP_ENV>` file:

```bash
# Development (hot reload, docs enabled at /docs)
APP_ENV=development uvicorn app.main:app --reload --port 8001

# Staging
APP_ENV=staging uvicorn app.main:app --port 8001

# Production (Swagger/ReDoc/OpenAPI disabled)
APP_ENV=production uvicorn app.main:app --port 8001
```

On Windows PowerShell, set the variable first: `$env:APP_ENV = "development"`.

Health check: `GET http://localhost:8001/health` → `{"status": "ok", "environment": "development"}`.

## Running with Docker

```bash
docker compose --profile development up   # hot reload, mounts ./app
docker compose --profile staging up
docker compose --profile production up
```

Each profile builds the image with its `APP_ENV` and loads the matching
`.env.<environment>` file via `env_file:`. All profiles expose port 8001.

## Environment-specific behavior

- **Docs/OpenAPI** (`/docs`, `/redoc`, `/openapi.json`): enabled in development and
  staging, disabled in production.
- **CORS**: `CORS_ALLOWED_ORIGINS` (comma-separated) per environment — dev allows
  `localhost:3000`, production restricts to `aipass.space`.
- **Log level**: `LOG_LEVEL` — debug in development, info in staging, warning in
  production.
- **Debug mode**: `DEBUG=true` only in development.

## Seeding agent templates

Adds the Customer Support Agent, Document Analyst and Enterprise Knowledge Agent
templates to a workspace as unpublished drafts. Safe to re-run: agents whose slug
already exists in the workspace are left untouched.

```bash
alembic upgrade head
python -m app.seeds.agent_templates \
  --organization-id <org uuid> --workspace-id <workspace uuid> --created-by <user uuid>
```

`--created-by` must be a member of the organization. The templates' knowledge-base
bindings are placeholders (`is_placeholder: true`) to replace before publishing.

## Tests

```bash
pytest
```
