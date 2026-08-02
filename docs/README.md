# AI-Pass Technical Documentation

Enterprise AI operating platform: workspace, agents, models, governance, marketplace, and vertical business apps.

**Live site:** [https://aipass.space](https://aipass.space)

---

## Start here

| Document | Audience | Description |
|----------|----------|-------------|
| [Technical Overview](./TECHNICAL-OVERVIEW.md) | Engineers, architects | Stack, monorepo layout, runtime rules, key flows |
| [Developer Guide](./DEVELOPER-GUIDE.md) | Contributors | Local setup, scripts, conventions, testing |
| [Deployment](./DEPLOYMENT.md) | DevOps / release | Static web + Laravel auth deploy to Hostinger |
| [Architecture](./ARCHITECTURE.md) | Architects | Layered system design |
| [Platform](./PLATFORM.md) | Product + eng | Module map and OS shell |
| [API](./API.md) | Integrators | REST API surface |

---

## Platform foundations

| Document | Topic |
|----------|-------|
| [Runtime Architecture](./RUNTIME-ARCHITECTURE.md) | Planner → Tool Router → Execution Engine |
| [AI OS](./AI-OS.md) | Operating-system framing of the workspace |
| [Provider / Multi-AI setup](./MULTI-AI-SETUP.md) | Provider Hub, keys, routing |
| [Auto models](./AUTO-MODELS.md) | Agent Auto (Standard) default + picker + admin policy |
| [Universal Membership](./UNIVERSAL-MEMBERSHIP.md) | Free / Professional / Power / Enterprise |
| [Auth](./AUTH.md) · [Laravel Auth](./LARAVEL-AUTH.md) · [Deploy Auth](./DEPLOY-AUTH.md) | Identity, sessions, OAuth |

---

## Build & orchestration

| Document | Topic |
|----------|-------|
| [Agent Studio](./AGENT-STUDIO.md) | Agent wizard, skills, workflows, execution |
| [LiveSync Engine](./LIVESYNC-ENGINE.md) | Event-driven orchestration |
| [Knowledge Pipeline](./KNOWLEDGE-PIPELINE.md) | RAG, collections, retrieval |
| [AI Governance](./AI-GOVERNANCE.md) | AI-system policies, risk, approvals |
| [Trust Engine](./TRUST-ENGINE.md) | Certification and trust scores |
| [Compliance AI](./COMPLIANCE-AI.md) | Compliance vertical |

---

## Marketplace & store

| Document | Topic |
|----------|-------|
| [Marketplace](./MARKETPLACE.md) | Skills registry and publishing |
| [AI Pass Store](./AI-PASS-STORE.md) | End-user app store |
| [Discovery Hub](./DISCOVERY-HUB.md) | Search and discovery |

---

## Vertical solutions

| Document | Topic |
|----------|-------|
| [Invoice AI](./INVOICE-AI.md) | AP automation |
| [Supply Chain AI](./SUPPLY-CHAIN-AI.md) | Supply chain |
| [Customer Support AI](./CUSTOMER-SUPPORT-AI.md) | Support agents |
| [Sales AI](./SALES-AI.md) | Sales workflows |
| [Content AI](./CONTENT-AI.md) | Content generation |
| [Presence Audit](./PRESENCE-AUDIT.md) | Brand presence across LLMs |
| [ERP Integration](./ERP-INTEGRATION.md) | ERP connectors |

---

## Operations

| Document | Topic |
|----------|-------|
| [Deployment](./DEPLOYMENT.md) | Production publish |
| [Backlog](./BACKLOG.md) | Module status tracking |
| [PHP Auth (legacy)](./PHP-AUTH.md) | Legacy PHP auth notes |

---

## Quick mental model

```text
Browser / Desktop
       │
       ▼
 apps/web  (Next.js static export → Hostinger public_html)
       │
       ├─ /workspace/*     Platform OS UI
       ├─ /api/v1/*        Next route handlers (demo) + Apache proxy
       └─ /auth/*          → Laravel auth-api (sessions, Google OAuth, AI proxy)
       │
       ▼
 packages/*                Domain libraries (pnpm workspace)
       │
       ▼
 runtime-core → provider-hub → wallet → AI providers
```

**Core rule:** Application code must not call provider SDKs directly. Route AI through `@ai-pass/provider-hub` (and credit via `@ai-pass/wallet`). Agent runs without a pinned model use **Auto (Standard)** — see [Auto models](./AUTO-MODELS.md).
