# AI-Pass

**The enterprise AI operating system.**

AI-Pass unifies models, agents, workflows, knowledge, marketplace apps, and governance in one platform — so organizations can move from fragmented AI experiments to controlled production use.

**Live product:** [aipass.space](https://aipass.space)  
**Headquarters:** Munich, Germany

---

## Why AI-Pass

Enterprises today juggle chatbots, point apps, and shadow AI with weak shared controls. AI-Pass provides the missing platform layer:

| Challenge | AI-Pass approach |
|-----------|------------------|
| Vendor lock-in | Multi-provider hub (OpenAI, Anthropic, Google, Mistral, open models, and private LLMs) |
| Tool sprawl | One workspace for playground, agents, workflows, and apps |
| Uncontrolled spend | Membership tiers + unified AI Wallet |
| Compliance risk | Trust Engine, governance, auditability |
| Slow rollout | Marketplace apps and vertical solutions (finance, supply chain, support, and more) |

---

## Platform at a glance

```text
Clients          Web · Desktop · Mobile
Workspace        Playground · Agents · Workflows · Knowledge · Analysis
Intelligence     Provider Hub · Runtime · LiveSync · Agent Studio
Distribution     AI Store · Marketplace · Discovery Hub
Trust            Governance · Trust Engine · Compliance AI
Verticals        Invoice · Supply Chain · Customer Support · Sales · …
```

Core product surfaces:

- **AI Workspace** — command center for models, agents, and apps  
- **Provider Hub** — route and compare models under one membership  
- **Agent Studio** — design, skill, and run autonomous agents  
- **Workflows / LiveSync** — orchestrate multi-step business processes  
- **Knowledge Pipeline** — RAG and document intelligence  
- **AI Store & Marketplace** — install and publish certified apps/skills  
- **Discovery Hub** — find, compare, and connect AI tools into the platform  
- **Trust & Governance** — certification, policy, and inventory controls  

---

## Repository layout

```text
ai-pass/
├── apps/
│   ├── web/                 # Next.js product (marketing + workspace)
│   ├── desktop/             # Desktop shell
│   └── mobile/              # Mobile client
├── packages/                # Domain packages (platform, marketplace, verticals)
├── services/auth-api/       # Laravel auth + AI proxy
├── php-auth/                # Shared PHP auth library
├── docs/                    # Architecture and module documentation
└── scripts/                 # Build and deploy helpers
```

See [docs/README.md](./docs/README.md) for the full documentation index.

---

## Quick start

**Requirements:** Node.js 20+, pnpm 9+

```bash
pnpm install
pnpm build
pnpm dev:web
```

Then open [http://localhost:3000](http://localhost:3000).

| Path | Purpose |
|------|---------|
| `/` | Product landing |
| `/workspace` | Enterprise workspace |
| `/workspace/playground` | Multi-model playground |
| `/discover` | AI Discovery Hub |
| `/investors` | Investor overview |

Detailed setup: [Developer Guide](./docs/DEVELOPER-GUIDE.md).  
Production deploy notes: [Deployment](./docs/DEPLOYMENT.md).

---

## Documentation

| Document | Audience |
|----------|----------|
| [Technical Overview](./docs/TECHNICAL-OVERVIEW.md) | Engineers & architects |
| [Architecture](./docs/ARCHITECTURE.md) | System design |
| [Platform](./docs/PLATFORM.md) | Module map |
| [API](./docs/API.md) | Integrators |
| [Product roadmap](./docs/PRODUCT-ROADMAP.md) | Product & investors |
| [Security](./SECURITY.md) | Security contacts & practice |
| [Contributing](./CONTRIBUTING.md) | Contributors |

---

## For investors

- Product thesis and market framing: [aipass.space/investors](https://aipass.space/investors)  
- Contact: [investors@ai-pass.com](mailto:investors@ai-pass.com)  
- This repository is the engineering source of truth for the platform described on the website.

---

## License

Proprietary. Copyright © AI-Pass. All rights reserved.  
See [LICENSE](./LICENSE).
