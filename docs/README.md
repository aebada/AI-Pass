# AI Pass — Documentation Index

Start here for architecture, concepts, local setup, production deploy, and key subsystems.

## Core guides

| Doc | Audience | Contents |
|-----|----------|----------|
| [CONCEPTS.md](./CONCEPTS.md) | All readers | Product & tech concepts, flows overview, package map, **glossary** |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | All engineers | Monorepo layout, static web vs Laravel auth, diagrams, tenant model |
| [DATA-MODEL.md](./DATA-MODEL.md) | Engineers / product | Entities, invoice statuses, lifecycle stages, localStorage keys |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Contributors | Node/pnpm setup, dev servers, testing, common pitfalls |
| [OPEN-SOURCE.md](./OPEN-SOURCE.md) | Maintainers / contributors | Public-repo checklist, license, GitHub settings |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Ops / release | Hostinger static + Laravel auth, env vars, FTP caveats |
| [INVOICE-AI.md](./INVOICE-AI.md) | Product / platform | Invoice AI client service, routes, features, lifecycle, flows |

## Auth

| Doc | Notes |
|-----|-------|
| [LARAVEL-AUTH.md](./LARAVEL-AUTH.md) | **Production** auth on aipass.space (`services/auth-api`) |
| [AUTH.md](./AUTH.md) | NextAuth local Node path |
| [PHP-AUTH.md](./PHP-AUTH.md) | Legacy PHP sessions (fallback) |
| [DEPLOY-AUTH.md](./DEPLOY-AUTH.md) | Quick PHP-auth deploy notes (legacy Hostinger path) |

## Invoice AI (deep references)

| Doc | Notes |
|-----|-------|
| [INVOICE-AI-PLATFORM.md](./INVOICE-AI-PLATFORM.md) | Platform roadmap, middleware, orchestrator, RBAC |
| [INVOICE-AI-API.md](./INVOICE-AI-API.md) | REST catalog / headers for Node or future API |
| [DEPLOY-INVOICE-AI-PLATFORM.md](./DEPLOY-INVOICE-AI-PLATFORM.md) | Vercel / mobile / env matrix for Invoice AI |

## Platform modules (selected)

| Doc | Package / topic |
|-----|-----------------|
| [OPENWORKER-VS-AI-PASS.md](./OPENWORKER-VS-AI-PASS.md) | OpenWorker comparison + AI Coworker platform options |
| [RUNTIME-ARCHITECTURE.md](./RUNTIME-ARCHITECTURE.md) | `runtime-core` execution path |
| [PLATFORM.md](./PLATFORM.md) | Platform OS overview |
| [IDE.md](./IDE.md) | Downloadable IDE shell |
| [OCR.md](./OCR.md) | OCR package + service |
| [MODEL-HUB.md](./MODEL-HUB.md) | Model Hub UI / routing |
| [MULTI-AI-SETUP.md](./MULTI-AI-SETUP.md) | Provider keys |
| [ORCHESTRATION.md](./ORCHESTRATION.md) | Orchestration package |
| [WORKSPACE-GOVERNANCE.md](./WORKSPACE-GOVERNANCE.md) | Workspace RBAC |
| [UNIVERSAL-MEMBERSHIP.md](./UNIVERSAL-MEMBERSHIP.md) | Membership tiers + wallet framing |
| [SUPPLY-CHAIN-AI.md](./SUPPLY-CHAIN-AI.md) | Standalone supply-chain vertical |

## Deploy helpers in-repo

| Path | Role |
|------|------|
| `scripts/build-web-static.sh` | Static Next export (Node 22 preferred) |
| `scripts/deploy-ftp.sh` | FTP upload of `apps/web/out/` |
| `scripts/deploy-hostinger-laravel-auth.sh` | Laravel auth FTP deploy |
| `docs/apache-laravel-auth-proxy.htaccess` | Apache `/auth/*` proxy rules |
| `docs/apache-laravel-api-proxy.htaccess` | Apache `/api/v1/ai|twin` proxy |

Live site: [https://aipass.space](https://aipass.space)
