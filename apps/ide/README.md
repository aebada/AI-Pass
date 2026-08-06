# AI-Pass IDE (`@ai-pass/ide`)

Cross-platform Electron shell for the live AI-Pass product. A native tab bar (**Work**, **Chat**, **Orchestrations**) wraps embedded webviews that load `https://aipass.space` routes (or `AIPASS_WEB_URL`). The desktop binary updates separately via `electron-updater`.

This is distinct from `@ai-pass/desktop`, which packages a local static web build with filesystem IPC. Prefer **AI-Pass IDE** for downloadable end-user installs.

## Quick start

```bash
# from repo root
pnpm install
pnpm --filter @ai-pass/ide start
# → builds TypeScript, launches Electron against https://aipass.space/workspace
```

Staging / local web:

```bash
pnpm --filter @ai-pass/ide dev
# → AIPASS_WEB_URL=http://localhost:3000 (run web separately)
```

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm start` | Compile + run against production web |
| `pnpm dev` | Compile + run against localhost:3000 |
| `pnpm build` / `typecheck` | `tsc` |
| `pnpm dist:mac` / `dist:win` / `dist:linux` | electron-builder artifacts in `release/` |

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Electron main (menu, updater, projects store, IPC)     │
│  preload (contextBridge: aiPassIde)                      │
└──────────────┬───────────────────────────────────────────┘
               │ BrowserWindow loads local shell (index.html)
               │ + webviews (partition persist:aipass)
               ▼
┌──────────────────────────────────────────────────────────┐
│  Native tab bar: Work | Chat | Orchestrations            │
│  Work sidebar: projects & folders (ide-projects.json)    │
│  Each tab embeds aipass.space routes in a webview        │
└──────────────┬───────────────────────────────────────────┘
               ▼
   Work → /workspace
   Chat → /workspace/playground
   Orchestrations → /workspace/workflows/livesync
```

### Tabs

| Tab | Web route | Purpose |
|-----|-----------|---------|
| **Work** | `/workspace` | Main workspace; includes project/folder sidebar |
| **Chat** | `/workspace/playground` | AI Playground / chat |
| **Orchestrations** | `/workspace/workflows/livesync` | LiveSync workflows & agents |

Projects and folders are stored in `userData/ide-projects.json`. Use **+** (folder) or **⊕** (project) in the Work sidebar, or the View menu (⌘1–3) to switch tabs.

## Environment

| Variable | Default | Meaning |
|----------|---------|---------|
| `AIPASS_WEB_URL` | `https://aipass.space` | Workspace origin |
| `AIPASS_UPDATE_URL` | from `electron-builder.yml` | Override update feed |
| `AIPASS_DEVTOOLS` | unset | Force DevTools in packaged builds |

## Deep links

`aipass://workspace/playground` → navigate the main window to that path on the configured origin.

## Icons

`resources/icon.svg` is the brand mark. PNGs are generated with `rsvg-convert` (see `scripts/generate-icons.sh`). For store-ready `.icns` / `.ico`, run the script on a machine with the optional tools installed, or let electron-builder convert from `icon.png`.

## Release

See [docs/IDE.md](../../docs/IDE.md) and [public/downloads/releases/README.md](../web/public/downloads/releases/README.md).
