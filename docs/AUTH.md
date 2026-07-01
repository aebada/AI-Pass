# Authentication (Google OAuth)

AI-Pass uses [Auth.js / NextAuth.js v5](https://authjs.dev) for Google Sign-In. OAuth credentials come from **your** Google Cloud project (**aipass-501004** for production) via environment variables — never from committed source code.

## Quick start (local dev)

1. Copy the example env file:

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

2. Generate a session secret:

   ```bash
   openssl rand -base64 32
   ```

   Set the output as `NEXTAUTH_SECRET` in `.env.local`.

3. Add Google OAuth credentials (see [Google Cloud Console](#google-cloud-console-aipass-501004)).

4. Set:

   ```env
   NEXTAUTH_URL=http://localhost:3000
   ```

5. Start the web app (requires Node — not static FTP export):

   ```bash
   pnpm dev:web
   ```

6. Open **http://localhost:3000/login** and click **Continue with Google**.

After a successful sign-in you are redirected to `/workspace`.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | Yes | OAuth 2.0 Client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Yes | OAuth 2.0 Client secret |
| `NEXTAUTH_URL` | Yes | Public base URL of the app (`http://localhost:3000` dev, `https://aipass.space` prod) |
| `NEXTAUTH_SECRET` | Yes | Random string for signing session cookies (`openssl rand -base64 32`) |
| `MICROSOFT_CLIENT_ID` | No | Future Microsoft Entra ID provider (stub commented in `apps/web/auth.ts`) |
| `MICROSOFT_CLIENT_SECRET` | No | Future Microsoft provider |
| `MICROSOFT_TENANT_ID` | No | Azure tenant (`common`, `organizations`, or tenant GUID) |

Example `.env.local`:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret
```

For production, set `NEXTAUTH_URL=https://aipass.space` in your deployment secret store (or swap the value in `.env.local` when testing prod locally).

## Google Cloud Console (aipass-501004)

Production OAuth client lives in Google Cloud project **aipass-501004**.

### 1. Enable APIs

In [Google Cloud Console](https://console.cloud.google.com/):

1. Select project **aipass-501004**.
2. Go to **APIs & Services → Library**.
3. Enable **Google Identity** services (OAuth).  
   Legacy name: **Google+ API** — not required on modern projects; OAuth consent + credentials are sufficient.

### 2. OAuth consent screen

1. **APIs & Services → OAuth consent screen**.
2. Choose **External** (or Internal for Workspace-only).
3. Fill app name (e.g. `AI-Pass`), support email, and developer contact.
4. Add scopes: `openid`, `email`, `profile`.
5. Add test users while the app is in **Testing** mode.

### 3. Create OAuth 2.0 credentials

1. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
2. Application type: **Web application**.
3. Name: e.g. `AI-Pass Web`.
4. **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - `https://aipass.space` (production)
5. **Authorized redirect URIs** (must match exactly):

   NextAuth v5 uses `/api/auth/callback/google` by default. Register **all** of these:

   - `https://aipass.space/api/auth/callback/google` — **required** (NextAuth default)
   - `https://aipass.space/auth/google/callback` — alias route (backward compat if already configured)
   - `http://localhost:3000/api/auth/callback/google` — local development

   Pattern for the primary URI: `{NEXTAUTH_URL}/api/auth/callback/google`

6. Copy **Client ID** and **Client secret** into `apps/web/.env.local` (never commit secrets).

### Redirect URI alias

If Google Console was configured with `https://aipass.space/auth/google/callback` instead of the NextAuth default, the app includes an alias route at `apps/web/app/auth/google/callback/route.ts` that forwards to `/api/auth/callback/google` with the same query parameters.

**You still must add** `https://aipass.space/api/auth/callback/google` to Google Console — NextAuth sends that URI when initiating sign-in. The alias only helps if Google redirects to the legacy path (e.g. after a manual link or older client config).

## Architecture

| Piece | Location |
|-------|----------|
| NextAuth config | `apps/web/auth.ts` |
| API route | `apps/web/app/api/auth/[...nextauth]/route.ts` |
| Google callback alias | `apps/web/app/auth/google/callback/route.ts` |
| Login UI | `apps/web/app/login/page.tsx` |
| Session bridge | `apps/web/app/components/auth/AuthSessionBridge.tsx` |
| Shared types/helpers | `packages/auth-core/` |
| Soft landing redirect | `apps/web/middleware.ts`, `LandingRedirect` |

Microsoft Entra ID is prepared as a **commented stub** in `apps/web/auth.ts` for a future provider.

## Static export vs Node server

`apps/web/next.config.ts` supports `STATIC_EXPORT=1` for pure static hosting (e.g. FTP).

**Limitation:** NextAuth API routes (`/api/auth/*`) require a **Node.js server**. They do not run on a static-only FTP deploy.

| Deployment | Google OAuth |
|------------|--------------|
| `pnpm dev:web` / `next start` / VPS api-server | Full OAuth works |
| `STATIC_EXPORT=1` + static FTP | Auth API routes unavailable |

For static-only sites you would need either:

- A separate auth backend (VPS `api-server`), or
- Client-only [Google Identity Services](https://developers.google.com/identity/gsi/web) (limited: no server session, different security model).

**Recommendation:** Use the standard Next.js server (`pnpm build` + `next start` or your VPS) for production auth.

For Hostinger production deploy steps, see **[DEPLOY-AUTH.md](./DEPLOY-AUTH.md)**.

## Security notes

- Never commit `.env.local`, client secrets, or `NEXTAUTH_SECRET`.
- **Rotate secrets if they are exposed.** If OAuth credentials were shared in chat, email, or logs, regenerate the client secret in [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials?project=aipass-501004) and update `.env.local` / deployment env vars immediately.
- Keep OAuth redirect URIs strict — no wildcards.
- In production set `NEXTAUTH_URL=https://aipass.space` to match your public URL.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `redirect_uri_mismatch` | Add `{NEXTAUTH_URL}/api/auth/callback/google` to Google Console redirect URIs (see list above) |
| Session not persisting | Set `NEXTAUTH_SECRET` and correct `NEXTAUTH_URL` |
| Works locally, fails in prod | Add production origin + redirect URI; set prod env vars on the server |
| 404 on `/api/auth/*` | Do not use static export; run Next with Node |

## Login URL

- Development: http://localhost:3000/login  
- Production: https://aipass.space/login
