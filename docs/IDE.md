# AI-Pass IDE

Downloadable desktop shell for the AI-Pass platform. Users install **AI-Pass IDE** on Mac, Windows, or Linux; the app loads the live workspace at [aipass.space](https://aipass.space) so product features stay current without rebuilding the binary for every web change.

Package: `apps/ide` (`@ai-pass/ide`)  
App ID: `space.aipass.ide`  
Product name: **AI-Pass IDE**

> Related but different: `@ai-pass/desktop` (`apps/desktop`) embeds a local static export and exposes filesystem IPC for developer workflows. End-user downloads should use **AI-Pass IDE**.

## Architecture

| Layer | Role |
|-------|------|
| Electron main | Window chrome, app menu, deep links (`aipass://`), session partition, auto-updater |
| Preload (`aiPassIde`) | Version / update / open-external bridge (contextIsolation + sandbox) |
| Renderer (web) | Live `https://aipass.space/workspace` (override with `AIPASS_WEB_URL`) |
| Update feed | `https://aipass.space/downloads/releases/` (`electron-updater` generic provider) |

**Primary mode:** BrowserWindow → live workspace. The shell does **not** reimplement Playground, Agent Studio, Model Hub, Store, or Governance — menu items navigate to those web routes.

**Session:** Cookies and login persist via Electron partition `persist:aipass`.

**Google sign-in (1.0.2+):** Clicking Continue with Google opens the **system browser** (`/auth/google?desktop=1`). After Google consent, Laravel shows `/auth/google/desktop-complete` and deep-links to `aipass://auth/desktop?code=…`. The IDE exchanges that one-time code at `/auth/google/desktop-exchange` for a session cookie in `persist:aipass`. The shell also spoofs a full Chrome User-Agent + `Sec-CH-UA` client hints for any residual in-app Google navigations.

**Security:** `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`. Non-OAuth external origins open in the system browser.

## How users download

1. Open [https://aipass.space/downloads](https://aipass.space/downloads).
2. Choose **macOS**, **Windows**, or **Linux** under AI-Pass IDE.
3. Install from the linked artifact (DMG / NSIS / AppImage or `.deb`).

Until the first signed release is published, cards may show **Build from source** / **Coming soon** and point at this doc. Metadata lives in `apps/web/public/downloads/releases/version.json`.

## How auto-update works

1. Packaged app checks the generic feed on launch and every **6 hours**.
2. `electron-updater` reads `latest-mac.yml` / `latest.yml` / `latest-linux.yml` from `/downloads/releases/`.
3. When a newer version is found, the update downloads; the user is prompted to **Restart now** or **Later**.
4. **Help → Check for Updates…** (and About) triggers an interactive check.

Web product changes (new workspace modules, UI) appear immediately on next navigation — no IDE update required. Only native shell / Electron upgrades need a new IDE version.

## Maintainer: cut a release

```bash
# 1. Bump version
# edit apps/ide/package.json → "version"

# 2. Build (per platform or CI matrix)
pnpm install
pnpm --filter @ai-pass/ide dist:mac    # dmg + zip (x64 + arm64)
pnpm --filter @ai-pass/ide dist:win    # nsis + portable
pnpm --filter @ai-pass/ide dist:linux  # AppImage + deb

# 3. Collect from apps/ide/release/
#    - installers, .blockmap, latest*.yml (hashes)

# 4. Upload to the static site under /downloads/releases/
#    Update version.json: status "available", notes, paths

# 5. Deploy web public assets (FTP/CI as usual for apps/web)
```

### Signing & notarization (blockers without secrets)

| Platform | Requirement |
|----------|-------------|
| macOS | Apple Developer ID Application cert + notarization (`APPLE_ID`, team, app-specific password or API key). Gatekeeper will warn on unsigned builds. |
| Windows | Code signing cert for SmartScreen reputation. |
| Linux | AppImage/deb often unsigned; optional GPG for apt repos later. |

CI secrets are **not** committed. Local unsigned builds are fine for smoke tests; production downloads should be signed.

## Local development

```bash
pnpm --filter @ai-pass/ide start          # production web
pnpm --filter @ai-pass/ide dev            # localhost:3000 (start web separately)
pnpm --filter @ai-pass/ide typecheck
```

Deep link example (macOS, after first launch):

```bash
open 'aipass://workspace/playground'
```

## Menu shortcuts (Go)

- Workspace → `/workspace`
- Playground → `/workspace/playground`
- Agent Studio → `/workspace/agents/studio`
- Model Hub → `/workspace/model-hub`
- Store → `/workspace/store`
- Governance → `/workspace/governance`

## Monorepo scripts

Root helpers:

- `pnpm --filter @ai-pass/ide start`
- `pnpm build:ide` → `pnpm --filter @ai-pass/ide dist`
- `pnpm dist:ide:mac` / `dist:ide:win` / `dist:ide:linux`
