# Environments

Three environments, each with its own database and its own auth secret.

| Environment | Runs where | Database | Purpose |
|---|---|---|---|
| development | Developer machine | Local Postgres via `docker-compose` | Day to day work |
| staging | Container host | Managed Postgres, separate instance or branch | Verification before release |
| production | Container host | Managed Postgres | Live |

Secrets are never shared between environments. A leaked staging secret must not
grant anything in production, and `BETTER_AUTH_SECRET` signs session tokens, so
reusing it across environments would make staging sessions valid in production.

## Local development

Start Postgres and apply the schema:

```bash
docker compose up -d postgres
cp .env.example .env
```

Set `BETTER_AUTH_SECRET` in `.env`:

```bash
openssl rand -base64 32
```

Then:

```bash
pnpm --filter @ai-pass/db generate
pnpm --filter @ai-pass/db migrate
pnpm --filter @ai-pass/api-server dev
```

The API listens on port 4000. `pnpm --filter @ai-pass/db studio` opens Prisma
Studio against the local database.

## Required variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `BETTER_AUTH_SECRET` | Signs session tokens. Distinct per environment |
| `BETTER_AUTH_URL` | Public base URL of the API service |
| `AUTH_TRUSTED_ORIGINS` | Comma separated origins allowed to send credentialed requests |

`AUTH_TRUSTED_ORIGINS` is the CORS allowlist. Sessions are carried in cookies,
so this cannot be a wildcard.

## Staging and production

The API runs as a container built from `Dockerfile.api`. Migrations are applied
with `pnpm --filter @ai-pass/db migrate:deploy` as a release step, before the new
container serves traffic. `migrate:deploy` only applies committed migrations and
never generates or resets, which is what makes it safe to run unattended.

Roll back by deploying the previous image. Schema changes that cannot be rolled
back by redeploying need a follow-up migration rather than an edit to an applied
one.

## Note on the existing Hostinger deploy

`docs/AUTH.md` describes a static export deployed over FTP. That path cannot
serve authenticated traffic, because sessions require a Node runtime. It remains
usable for the marketing site; the application needs a container host.
