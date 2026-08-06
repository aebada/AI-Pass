# Authentication (Google OAuth)

AI-Pass supports two auth paths:

| Deployment | Auth stack | Docs |
|------------|------------|------|
| **Hostinger static FTP (production)** | PHP sessions (`php-auth/`) | **[PHP-AUTH.md](./PHP-AUTH.md)** |
| Local dev with Node (`pnpm dev:web`) | Auth.js / NextAuth v5 | This file |

For **aipass.space** on Hostinger, use **PHP auth** — no Node.js required.

---

## PHP auth (production — Hostinger)

See **[PHP-AUTH.md](./PHP-AUTH.md)** for:

- Env vars in `public_html/auth-lib/.env`
- Google redirect URI: `https://aipass.space/auth/google-callback.php`
- Deploy: `./scripts/deploy-hostinger-php-auth.sh`
- Login URLs: `/auth/login.php` or `/login` (static page wired to PHP)

---

## NextAuth (local Node development)

AI-Pass uses [Auth.js / NextAuth.js v5](https://authjs.dev) when running the Next.js dev server. OAuth credentials come from **your** Google Cloud project (**aipass-501004** for production) via environment variables — never from committed source code.

### Quick start (local dev)

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

5. Start the web app:

   ```bash
   pnpm dev:web
   ```

6. Open **http://localhost:3000/login** and click **Continue with Google**.

After a successful sign-in you are redirected to `/workspace`.

### Environment variables (NextAuth)

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | Yes | OAuth 2.0 Client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Yes | OAuth 2.0 Client secret |
| `NEXTAUTH_URL` | Yes | Public base URL of the app (`http://localhost:3000` dev) |
| `NEXTAUTH_SECRET` | Yes | Random string for signing session cookies |

### Static export + PHP auth build flags

When building for Hostinger:

```bash
./scripts/build-web-static.sh
```

Sets `NEXT_PUBLIC_USE_PHP_AUTH=1` and `NEXT_PUBLIC_STATIC_EXPORT=1` automatically.

## Google Cloud Console (aipass-501004)

Production OAuth client lives in Google Cloud project **aipass-501004**.

### Redirect URIs to register

**PHP auth (Hostinger — required for production):**

- `https://aipass.space/auth/google-callback.php`

**NextAuth (local dev only):**

- `http://localhost:3000/api/auth/callback/google`

### OAuth consent screen

1. **APIs & Services → OAuth consent screen**.
2. Scopes: `openid`, `email`, `profile`.

## Architecture

### PHP (production)

| Piece | Location |
|-------|----------|
| OAuth flow | `php-auth/auth-lib/src/GoogleOAuth.php` |
| User linking | `php-auth/auth-lib/src/UserRepository.php` |
| Sessions | `php-auth/auth-lib/src/SessionAuth.php` |
| Login UI | `php-auth/auth/login.php`, `register.php` |
| Static bridge | `apps/web/app/components/auth/PhpAuthBridge.tsx` |

### NextAuth (dev)

| Piece | Location |
|-------|----------|
| NextAuth config | `apps/web/auth.ts` |
| API route | `apps/web/app/api/auth/[...nextauth]/route.ts` |
| Login UI | `apps/web/app/login/page.tsx` |

## Security notes

- Never commit `.env`, `.env.local`, `auth-lib/.env`, client secrets, or session secrets.
- Rotate secrets if exposed.
- Keep OAuth redirect URIs strict — no wildcards.

## Login URLs

| Context | URL |
|---------|-----|
| PHP (production) | https://aipass.space/auth/login.php |
| Static Next + PHP | https://aipass.space/login |
| Local NextAuth dev | http://localhost:3000/login |

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `redirect_uri_mismatch` (PHP) | Add `https://aipass.space/auth/google-callback.php` in Google Console |
| `redirect_uri_mismatch` (NextAuth) | Add `http://localhost:3000/api/auth/callback/google` |
| Session not persisting (PHP) | Check `auth-lib/.env`, `APP_ENV=production`, HTTPS |
| `/login` ignores PHP | Rebuild with `./scripts/build-web-static.sh` |

For Hostinger deploy steps, see **[DEPLOY-AUTH.md](./DEPLOY-AUTH.md)** and **[PHP-AUTH.md](./PHP-AUTH.md)**.
