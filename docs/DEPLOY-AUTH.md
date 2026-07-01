# Deploy Google login (NextAuth) on aipass.space

Static FTP export **cannot** run `/api/auth/*`. Production Google Sign-In needs a **Node.js** process plus Apache (or hPanel) routing to it.

## Google Cloud Console checklist (project **aipass-501004**)

1. **Authorized JavaScript origins**
   - `https://aipass.space`
   - `http://localhost:3000` (dev)
2. **Authorized redirect URIs**
   - `https://aipass.space/api/auth/callback/google` (required — NextAuth default)
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - Optional legacy: `https://aipass.space/auth/google/callback`

If `https://aipass.space` is missing under **JavaScript origins**, add it and save.

## 1. Build the Node bundle (local)

```bash
./scripts/build-node-prod.sh
```

Or manually:

```bash
DEPLOY_NODE=1 pnpm --filter @ai-pass/web build
```

Output directory: **`dist/deploy-node/`**

| File | Purpose |
|------|---------|
| `start.sh` | Starts server on `PORT=3000` (loads `.env.production`) |
| `.env.production.example` | Template — copy to `.env.production` on server |
| `.env.production` | Auto-generated from `apps/web/.env.local` when building locally (gitignored) |
| `apache/api-proxy.htaccess` | Snippet to proxy `/api/*` to Node |

### Production environment variables

Set on the server in `.env.production` (never commit):

```env
GOOGLE_CLIENT_ID=148156861979-ua974fq9iatjv2gvfneh9cga49efb0mm.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<from Google Console>
NEXTAUTH_URL=https://aipass.space
NEXTAUTH_SECRET=<openssl rand -base64 32>
```

## 2. Hostinger hPanel — Node.js Web App

1. **Websites → aipass.space → Advanced → Node.js** (or **Node.js Web App**).
2. **Create application**
   - Node version: **20.x** or newer
   - Application root: folder where you uploaded `dist/deploy-node` (e.g. `nodejs-aipass` or `domains/aipass.space/nodejs`)
   - Application startup file: **`start.sh`** or command: `bash start.sh`
   - Application URL: often an internal port; set app to listen on **`PORT`** provided by Hostinger if shown in panel (adjust `start.sh` / env if panel injects `PORT`).
3. Upload bundle via **File Manager** or FTP:

   ```bash
   export FTP_HOST=92.113.19.130
   export FTP_USER='u234903558.aipass'
   export FTP_PASS='your-password'
   export NODE_REMOTE_DIR=/nodejs-aipass
   ./scripts/deploy-hostinger-node.sh
   ```

4. On server, ensure `.env.production` exists next to `start.sh` with secrets filled.
5. **Restart** the Node.js application in hPanel.

## 3. Apache reverse proxy (static site + Node API)

Keep the static export in `public_html`. Run Node on `127.0.0.1:3000`. Merge **`docs/apache-api-proxy.htaccess`** into `public_html/.htaccess` **above** the SPA fallback rule:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_URI} ^/api/ [OR]
  RewriteCond %{REQUEST_URI} ^/auth/google/callback
  RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
</IfModule>
```

If you get **500** or proxy errors, open a Hostinger ticket to enable **mod_proxy** / **mod_proxy_http** for your plan.

**Order matters:** API proxy rules must run **before** rules that rewrite unknown paths to `index.html`.

## 4. Verify

```bash
curl -sS https://aipass.space/api/auth/providers | head -c 200
```

Expected: JSON containing `"google"` (not HTML).

Then open **https://aipass.space/login** → **Continue with Google**.

## Architecture

```text
Browser → https://aipass.space/api/auth/*
       → Apache [P] proxy → Node :3000 (Next.js standalone)
       → Google OAuth → callback /api/auth/callback/google
```

Static pages (`/`, `/login.html`, etc.) continue to be served from Apache `public_html` unless you move the full site behind Node.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `/api/auth/providers` returns HTML | Proxy not applied or Node not running |
| `redirect_uri_mismatch` | Add exact callback URI in Google Console |
| `OAuth client` errors | Check `GOOGLE_CLIENT_ID` / secret on server |
| Session cookies fail | `NEXTAUTH_URL` must be `https://aipass.space` (no trailing slash) |

See also [AUTH.md](./AUTH.md).
