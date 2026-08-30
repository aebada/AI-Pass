# Contributing to AI Pass

Thanks for helping make AI Pass better. This guide is for anyone who wants to open issues, discuss ideas, or send pull requests.

## Ways to contribute

- **Bug reports** — use the Bug report issue template
- **Feature ideas** — use the Feature request template
- **Documentation** — fixes and clarifications in `docs/` and the root `README.md`
- **Code** — packages under `packages/`, apps under `apps/`, services under `services/`
- **Tests** — unit tests next to packages; Playwright smoke under `e2e/`

## Before you start

1. Read [README.md](./README.md) and [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)
2. Skim [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) so changes land in the right layer
3. Search existing issues and PRs to avoid duplicates
4. For larger changes, open an issue first so maintainers can align on scope

## Development setup

```bash
git clone https://github.com/aebada/AI-Pass.git
cd AI-Pass
pnpm install
pnpm dev:web
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Business landing |
| http://localhost:3000/ide | AI workspace |
| http://localhost:3000/workspace | Platform workspace |
| http://localhost:3000/workspace/coworker | AI Coworker options |

Requirements: **Node.js 20+** (22 preferred), **pnpm 9+**.

Useful commands:

```bash
pnpm typecheck
pnpm test
pnpm run test:e2e:smoke
pnpm build
```

Copy env examples only — never commit real secrets:

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp services/auth-api/.env.example services/auth-api/.env
```

## Pull request process

1. Fork the repo (or create a branch if you have write access)
2. Create a focused branch: `fix/…`, `feat/…`, or `docs/…`
3. Keep PRs small and reviewable when possible
4. Fill out the PR template
5. Ensure CI is green (`typecheck`, package builds, tests)
6. Link related issues with `Fixes #123` when applicable

### Coding guidelines

- Prefer TypeScript in `packages/` and `apps/web`
- Match existing patterns in the package you touch
- Do not add production secrets, API keys, or deploy credentials
- Public marketing claims must map to [docs/claims-source.md](./docs/claims-source.md)
- Avoid unverified compliance claims (see PR template)

## What not to put in the repo

- `.env`, `.env.local`, `scripts/.deploy-env.local`
- FTP / Hostinger passwords, OAuth client secrets, live API keys
- Large binaries / model weights (see `.gitignore`)

## Communication

- **Bugs & features:** GitHub Issues
- **Security vulnerabilities:** see [SECURITY.md](./SECURITY.md) — do not open a public issue for sensitive reports
- **Product site:** [aipass.space](https://aipass.space)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
