# Product Roadmap

This document describes platform maturity for diligence and planning. It replaces informal “stub lists” with clear delivery stages.

## Maturity definitions

| Stage | Meaning |
|-------|---------|
| **Available** | Shipped in the product surface; usable in demo/production paths |
| **Beta** | Core flows work; depth, polish, or backend hardening continues |
| **In development** | Scaffolded or partial; not yet a primary diligence claim |

---

## Platform areas

| Area | Packages / routes | Stage | Notes |
|------|-------------------|-------|-------|
| Workspace shell | `platform-core`, `/workspace` | Available | Module registry, nav, global search |
| Playground & Provider Hub | `provider-hub`, `/workspace/playground` | Available | Multi-model compare, routing preferences |
| Membership & Wallet | `membership`, `wallet` | Available | Tier gates and credit accounting |
| Agent Studio | `agent-studio`, `/workspace/agents` | Beta | Create, skills, execute; skill governance expanding |
| Workflows / LiveSync | `automation-engine`, `livesync` | Beta | Graph orchestration and event sync |
| Knowledge Pipeline | `knowledge-pipeline` | Beta | RAG ingestion and retrieval |
| AI Store / Marketplace | `store`, `marketplace-core` | Available | Install, catalog, developer surfaces |
| Discovery Hub | `discovery-hub`, `/discover` | Available | Search, compare, deals, trust-aware catalog |
| Trust Engine | `trust-engine` | Available | Scores, badges, certification flows |
| Governance | `governance` | Beta | Policies, inventory, approvals |
| Business Builder | `requirements`, `builder`, `/studio` | Available | NL requirements → solution design |
| Vertical apps | Invoice, Supply Chain, Support, Sales | Beta | Domain apps with expanding ERP/CRM depth |
| Desktop / Mobile | `apps/desktop`, `apps/mobile` | Beta | Shell clients over the web platform |
| MCP & Indexer | `mcp`, `indexer` | In development | Integration depth still expanding |

---

## Near-term priorities

1. Harden Agent Studio and workflow execution for enterprise pilots  
2. Deepen Trust Engine and governance reporting for regulated buyers  
3. Grow Discovery Hub and Store catalog quality (not just listing volume)  
4. Expand vertical solutions with real connector coverage  
5. Strengthen auth, SSO, and private-routing options for enterprise contracts  

---

## How to read the codebase

- Start with [Technical Overview](./TECHNICAL-OVERVIEW.md) and [Architecture](./ARCHITECTURE.md).  
- Each major package includes a short README describing purpose and entry points.  
- Module-specific docs are linked from [docs/README.md](./README.md).

For historical engineering checklists, see [BACKLOG.md](./BACKLOG.md) (internal).
