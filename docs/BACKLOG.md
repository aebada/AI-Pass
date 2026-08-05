# Product status (internal)

> Internal engineering checklist. For investor- and partner-facing maturity language, use [PRODUCT-ROADMAP.md](./PRODUCT-ROADMAP.md).

This file tracks wiring completeness across workspace modules. Status labels are for the engineering team only.

| Status | Meaning |
|--------|---------|
| **done** | UI wired, package exists, usable |
| **partial** | Core UX present; backend or depth still expanding |
| **planned** | Registry or scaffold only |

| Module | Route | Status | Package |
|--------|-------|--------|---------|
| Workspace | `/workspace` | done | platform-core |
| Playground | `/workspace/playground` | done | provider-hub |
| Agents | `/workspace/agents` | partial | agent-studio |
| Workflows | `/workspace/workflows` | partial | livesync, automation-engine |
| Knowledge | `/workspace/knowledge` | partial | knowledge-pipeline |
| Analysis | `/workspace/analysis` | partial | presence-audit |
| Marketplace | `/workspace/marketplace` | done | marketplace, store |
| Apps | `/workspace/apps` | partial | store |
| Trust | `/workspace/trust` | done | trust-engine |
| Compliance | `/workspace/compliance` | partial | governance |
| Wallet | `/workspace/wallet` | done | wallet |
| Settings | `/workspace/settings` | done | — |
| Provider Hub | `/workspace/providers` | done | provider-hub |
| Membership | `/workspace/membership` | done | membership |
| Requirements | `/workspace/requirements` | done | requirements |
| Builder Studio | `/workspace/builder` | done | builder |
| IDE | `/workspace/ide` | done | editor, agent |
| Agent Studio | `/workspace/agents/studio` | done | agent-studio |
| LiveSync | `/workspace/workflows/livesync` | done | livesync |
| MCP | `/workspace/settings/mcp` | planned | mcp |
| Indexer | `/workspace/knowledge/indexer` | planned | indexer |
| Deployment | `/workspace/apps/deploy` | planned | deployment |
| Invoice AI | `/workspace/apps/invoice-ai` | partial | verticals |
| Supply Chain | `/workspace/apps/supply-chain` | partial | verticals |
| Customer Support | `/workspace/apps/customer-support` | partial | verticals |

Update this table when module wiring changes. Do not paste it into external decks without translating through PRODUCT-ROADMAP maturity stages.
