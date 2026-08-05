# Contributing

Thanks for helping build AI-Pass. This guide keeps the monorepo consistent for a team that ships across web, desktop, mobile, and backend services.

## Before you start

1. Read [docs/DEVELOPER-GUIDE.md](./docs/DEVELOPER-GUIDE.md) and [docs/TECHNICAL-OVERVIEW.md](./docs/TECHNICAL-OVERVIEW.md).  
2. Use Node.js 20+ and pnpm 9+.  
3. Prefer small, reviewable pull requests with a clear purpose.

## Workflow

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm --filter @ai-pass/web dev
```

- Create a feature branch from `main`.  
- Keep package public APIs exported from each package’s `src/index.ts`.  
- Document user-facing modules under `docs/` when behavior changes.  
- Never commit secrets, FTP passwords, or production `.env` files.

## Code style

- TypeScript strict mode as configured in `tsconfig.base.json`  
- Prefer clear names and short comments that explain *why*, not *what*  
- Match existing patterns in the package you are editing  
- Avoid drive-by refactors unrelated to the change

## Pull requests

Please include:

- What changed and why  
- How you tested it  
- Links to related docs or issues  

Security issues: email security@ai-pass.com — do not open a public PR with exploit details.
