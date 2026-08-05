# Auth API (`services/auth-api`)

Laravel service that powers authentication, OAuth, sessions, and AI proxy endpoints for AI-Pass hosted deployments.

## Role in the platform

- User login / registration and session cookies for `aipass.space`  
- Google OAuth and desktop/IDE auth exchange where enabled  
- Server-side AI provider proxy (OpenRouter and related routing)  

Product docs: [Auth](../../docs/AUTH.md), [Laravel Auth](../../docs/LARAVEL-AUTH.md), [Deployment](../../docs/DEPLOYMENT.md).

## Local notes

This directory is a Laravel application. Configure `.env` from the service’s `.env.example` (never commit secrets). Prefer the monorepo deploy scripts under `scripts/` for Hostinger uploads rather than ad-hoc FTP.

```bash
# From repo root (example)
./scripts/deploy-hostinger-laravel-auth.sh
```

Requires `FTP_*` environment variables for production upload.
