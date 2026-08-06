# AI Pass Platform — Backlog

> 25 modules · unified workspace at `/workspace`

## Status Summary

| Status | Count | Meaning |
|--------|-------|---------|
| **done** | 10 | UI wired, package exists, usable |
| **stub** | 12 | Scaffolded UI + types, needs full backend |
| **pending** | 3 | Registry only, not yet wired |

---

## All 25 Modules

| # | ID | Name | Route | Status | Package |
|---|-----|------|-------|--------|---------|
| 1 | workspace | Workspace | `/workspace` | **done** | platform-core |
| 2 | playground | Playground | `/workspace/playground` | **done** | provider-hub |
| 3 | agents | Agents | `/workspace/agents` | **stub** | agent-studio |
| 4 | workflows | Workflows | `/workspace/workflows` | **stub** | livesync, builder |
| 5 | knowledge | Knowledge | `/workspace/knowledge` | **stub** | knowledge-pipeline |
| 6 | analysis | Analysis | `/workspace/analysis` | **stub** | presence-audit |
| 7 | marketplace | Marketplace | `/workspace/marketplace` | **done** | marketplace, store |
| 8 | apps | Apps | `/workspace/apps` | **stub** | store, deployment |
| 9 | trust | Trust | `/workspace/trust` | **done** | trust |
| 10 | compliance | Compliance | `/workspace/compliance` | **stub** | governance |
| 11 | wallet | Wallet | `/workspace/wallet` | **done** | wallet |
| 12 | settings | Settings | `/workspace/settings` | **done** | — |
| 13 | provider-hub | Provider Hub | `/workspace/providers` | **done** | provider-hub |
| 14 | membership | Membership | `/workspace/membership` | **done** | membership |
| 15 | requirements | Requirements | `/workspace/requirements` | **done** | requirements |
| 16 | builder-studio | Builder Studio | `/workspace/builder` | **done** | builder |
| 17 | ide | AI Pass Platform | `/workspace/ide` | **done** | editor, agent |
| 18 | agent-studio | Agent Studio | `/workspace/agents/studio` | **done** | agent-studio |
| 19 | livesync | LiveSync | `/workspace/workflows/livesync` | **done** | livesync |
| 20 | mcp | MCP Integrations | `/workspace/settings/mcp` | **pending** | mcp |
| 21 | indexer | Codebase Indexer | `/workspace/knowledge/indexer` | **pending** | indexer |
| 22 | deployment | Deployment | `/workspace/apps/deploy` | **pending** | deployment |
| 23 | invoice-ai | Invoice AI | `/workspace/apps/invoice-ai` | **stub** | verticals |
| 24 | supply-chain | Supply Chain AI | `/workspace/apps/supply-chain` | **stub** | verticals |
| 25 | customer-support | Customer Support AI | `/workspace/apps/customer-support` | **stub** | verticals |

---

## Phase Completion

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Architecture & Backlog (`PLATFORM.md`, `platform-core`) | ✅ |
| 2 | Unified Workspace Shell | ✅ |
| 3 | provider-hub, membership, wallet, playground | ✅ |
| 4 | Backend scaffold (`api-server`, `/api/docs`) | ✅ |
| 5 | Design system (`ui/workspace`, tokens) | ✅ |
| 6 | Landing page → Enterprise AI OS | ✅ |
| 7 | Build & verify | 🔄 |

---

## Next 5 Highest-Priority Modules

1. **Agents** — Embed Agent Studio inside workspace (replace legacy `/studio`)
2. **Workflows** — Visual canvas + LiveSync trigger wiring
3. **Compliance** — Governance approval queue in workspace home
4. **Knowledge** — Knowledge Pipeline UI inside workspace shell
5. **MCP** — MCP server connection settings UI

---

## P1 Technical Debt

- Redirect all legacy routes into workspace shell
- ESLint `no-restricted-imports` for `@ai-pass/ai-core` in apps
- Live API key vault (server-side)
- Stripe/Paddle billing integration
- Real provider health polling

---

## P2 Cross-Platform

- Flutter/Tauri: consume `@ai-pass/shared` membership + wallet types
- Mobile wallet widget
