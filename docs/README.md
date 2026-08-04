# AI-Pass Technical Documentation

Enterprise AI operating platform: workspace, agents, models, governance, marketplace, and vertical business apps.

**Live site:** [https://aipass.space](https://aipass.space)  
**Repository overview:** [../README.md](../README.md)

---

## Start here

| Document | Audience | Description |
|----------|----------|-------------|
| [Technical Overview](./TECHNICAL-OVERVIEW.md) | Engineers, architects | Stack, monorepo layout, runtime rules, key flows |
| [Developer Guide](./DEVELOPER-GUIDE.md) | Contributors | Local setup, scripts, conventions, testing |
| [Deployment](./DEPLOYMENT.md) | Release / ops | Static web + Laravel auth deploy |
| [Architecture](./ARCHITECTURE.md) | Architects | Layered system design |
| [Platform](./PLATFORM.md) | Product + eng | Module map and OS shell |
| [API](./API.md) | Integrators | REST API surface |
| [Product Roadmap](./PRODUCT-ROADMAP.md) | Product & investors | Maturity by area and near-term priorities |

---

## Platform foundations

| Document | Topic |
|----------|-------|
| [Runtime Architecture](./RUNTIME-ARCHITECTURE.md) | Planner → Tool Router → Execution Engine |
| [AI OS](./AI-OS.md) | Operating-system framing of the workspace |
| [Provider / Multi-AI setup](./MULTI-AI-SETUP.md) | Provider Hub, keys, routing |
| [Auto models](./AUTO-MODELS.md) | Agent Auto default + picker + admin policy |
| [Universal Membership](./UNIVERSAL-MEMBERSHIP.md) | Free / Professional / Power / Enterprise |
| [Auth](./AUTH.md) · [Laravel Auth](./LARAVEL-AUTH.md) · [Deploy Auth](./DEPLOY-AUTH.md) | Identity, sessions, OAuth |

---

## Build & orchestration

| Document | Topic |
|----------|-------|
| [Agent Studio](./AGENT-STUDIO.md) | Agent wizard, skills, workflows, execution |
| [LiveSync Engine](./LIVESYNC-ENGINE.md) | Event-driven orchestration |
| [Knowledge Pipeline](./KNOWLEDGE-PIPELINE.md) | RAG, collections, retrieval |
| [AI Governance](./AI-GOVERNANCE.md) | Policies, risk, approvals |
| [Trust Engine](./TRUST-ENGINE.md) | Certification and trust scores |
| [Compliance AI](./COMPLIANCE-AI.md) | Compliance vertical |

---

## Marketplace & discovery

| Document | Topic |
|----------|-------|
| [AI Pass Store](./AI-PASS-STORE.md) | Install and distribute apps |
| [Marketplace](./MARKETPLACE.md) | Skills, apps, developer catalog |
| [Discovery Hub](./DISCOVERY-HUB.md) | Discover, compare, connect AI tools |

---

## Vertical solutions

| Document | Topic |
|----------|-------|
| [Invoice AI](./INVOICE-AI.md) | Accounts payable automation |
| [Supply Chain AI](./SUPPLY-CHAIN-AI.md) | Procurement intelligence |
| [Customer Support AI](./CUSTOMER-SUPPORT-AI.md) | Multi-channel support agents |
| [Sales AI](./SALES-AI.md) | Revenue workflows |
| [Content AI](./CONTENT-AI.md) | Content workflows |
| [Presence Audit](./PRESENCE-AUDIT.md) | Brand visibility intelligence |
| [ERP Integration](./ERP-INTEGRATION.md) | ERP connectors |

---

## Deploy assets

Apache proxy snippets live under [`deploy/`](./deploy/) and are referenced from deployment docs — not product specifications.

---

## Internal notes

Engineering status tracking previously lived in `BACKLOG.md`. Prefer [Product Roadmap](./PRODUCT-ROADMAP.md) for external and investor-facing discussions of maturity.
