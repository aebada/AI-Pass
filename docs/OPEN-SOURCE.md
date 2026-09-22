# Open-sourcing AI Pass

Checklist for operating [aebada/AI-Pass](https://github.com/aebada/AI-Pass) as a public, contributor-friendly repository.

## Done in-repo

| Item | Location |
|------|----------|
| MIT License | [LICENSE](../LICENSE) |
| Contributing guide | [CONTRIBUTING.md](../CONTRIBUTING.md) |
| Code of Conduct | [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) |
| Security policy | [SECURITY.md](../SECURITY.md) |
| Issue templates | `.github/ISSUE_TEMPLATE/` |
| PR template | `.github/PULL_REQUEST_TEMPLATE.md` |
| CI | `.github/workflows/ci.yml` |

## Maintainer actions on GitHub

1. **Merge OSS files to the default branch (`main`)** so GitHub detects the license.
2. **Settings → General → Danger Zone → Change visibility → Public**
   (or `gh repo edit aebada/AI-Pass --visibility public --accept-visibility-change-consequences`).
3. **Settings → Collaborators / Moderation** — enable:
   - Issue templates
   - Automatically delete head branches
   - (Optional) Require PR reviews on `main`
4. **Settings → Code security** — enable Dependabot alerts (and updates if desired).
5. **About** sidebar — set description, homepage `https://aipass.space`, topics:
   `ai`, `typescript`, `nextjs`, `monorepo`, `marketplace`, `agents`, `open-source`.
6. Confirm **no production secrets** remain in git history (`.env`, FTP, OAuth). Rotate any key that was ever committed.

## Contributor path

```text
Fork → clone → pnpm install → pnpm dev:web → branch → PR
```

Full details: [CONTRIBUTING.md](../CONTRIBUTING.md).

## Note on `package.json` `"private": true`

Root and workspace packages stay `"private": true` so they are **not published to npm**.
That is normal for an open-source monorepo. The **git repository** is public; packages
are still MIT-licensed source.
