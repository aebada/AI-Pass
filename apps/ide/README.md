# AI-Pass IDE (`@ai-pass/ide`)

Electron shell for the live **aipass.space** workspace.

## Google sign-in

Google OAuth **must not** run inside Electron — Google returns HTTP 500 for embedded Chromium.

Flow (1.0.3+):

1. IDE intercepts `/auth/google` and any `accounts.google.com` navigation.
2. Opens the system browser with `?desktop=1`.
3. Laravel completes OAuth, issues a one-time code, shows `/auth/google/desktop-complete`.
4. Browser opens `aipass://auth/desktop?code=…`.
5. IDE exchanges the code at `/auth/google/desktop-exchange` inside `persist:aipass` and lands on `/workspace`.

## Scripts

```bash
pnpm --filter @ai-pass/ide build
pnpm --filter @ai-pass/ide start          # production web
pnpm --filter @ai-pass/ide dev            # localhost:3000
pnpm --filter @ai-pass/ide dist:mac       # installers
```

Set `AIPASS_WEB_URL` to point at a non-production frontend when developing.
