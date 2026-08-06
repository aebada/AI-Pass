# Deploy documentation (docs.ai-pass.com)

Static docs site source: **`apps/docs/site/`**  
Build output: **`apps/docs/out/`**

## Build

```bash
./scripts/build-docs-static.sh
# or
pnpm --filter @ai-pass/docs build
```

## Deploy to Hostinger

1. Copy FTP credentials into `scripts/.deploy-env.local` (see `scripts/deploy-ftp.sh` example).
2. Configure the docs document root:

```bash
# Primary (after ai-pass.com DNS + subdomain exist)
DOCS_FTP_REMOTE_DIR=/domains/docs.ai-pass.com/public_html

# Interim on live domain
DOCS_FTP_REMOTE_DIR=/domains/docs.aipass.space/public_html
```

3. Deploy:

```bash
./scripts/deploy-docs-ftp.sh
```

## hPanel: docs.ai-pass.com subdomain

1. **Websites → Domains** — add `ai-pass.com` or confirm nameservers point to Hostinger.
2. **Subdomains** — create `docs` for `ai-pass.com`.
3. Note the document root (typically `domains/docs.ai-pass.com/public_html`).
4. **SSL** — issue free certificate for `docs.ai-pass.com`.
5. Run `./scripts/deploy-docs-ftp.sh`.

### DNS records (if domain uses external DNS)

| Type | Name | Value |
|------|------|-------|
| A | `docs` | Hostinger server IP (same as aipass.space, e.g. `92.113.19.130`) |

Or use Hostinger nameservers and manage DNS in hPanel.

## Interim: docs.aipass.space

Until `ai-pass.com` resolves:

1. hPanel → **Subdomains** → `docs.aipass.space`
2. `DOCS_FTP_REMOTE_DIR=/domains/docs.aipass.space/public_html ./scripts/deploy-docs-ftp.sh`
3. Optionally set `DOCS_URL=https://docs.aipass.space` in `apps/web/app/lib/site-nav.ts`

## Fallback: /docs on main site

```bash
DOCS_FTP_REMOTE_DIR=/docs ./scripts/deploy-docs-ftp.sh
```

Live at `https://aipass.space/docs/` (update `DOCS_URL` accordingly).

## Pages

| Path | Topic |
|------|-------|
| `/` | Overview |
| `/getting-started/` | Local dev setup |
| `/auth/` | PHP + NextAuth |
| `/deployment/` | Hostinger deploy |
| `/digital-twin/` | Twin architecture |
| `/api/` | REST API overview |

Deep-dive markdown remains in repo **`docs/`** (architecture, Invoice AI, governance, etc.).
