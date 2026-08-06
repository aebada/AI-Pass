# AI-Pass Marketplace

The AI-Pass Marketplace is the platform ecosystem for apps, agents, skills, and automation packs — integrated with AI Wallet, Universal Membership, and the Trust Engine.

## Architecture

| Package | Role |
|---------|------|
| `@ai-pass/marketplace-core` | Registries, catalog, search, promotions, billing, security, analytics |
| `@ai-pass/marketplace-runtime` | Sandbox execution, installations, wallet on every skill run |
| `@ai-pass/marketplace-api` | REST handler stubs for Next.js API routes |
| `@ai-pass/marketplace` | Unified re-exports for agent-studio and vertical apps |

## 12 Platform Modules

### 1. Developer Portal
- Register and verify developers
- API keys (sandbox + live prefixes)
- Payout stubs with 70/30 revenue share
- Dashboard: `DeveloperPortalService`

### 2. Marketplace Catalog
Home sections: Featured, Trending, New, Recently Updated, Enterprise Ready, Open Source, Agent Packs, Automation Packs, Skill Packs, Industry Packs, Collections, Deals, Editor's Picks.

### 3. Discovery Engine
- Full-text search on name, description, tags
- Semantic search stub (synonym expansion)
- AI recommendations via `catalog.getRecommendations()`
- Filters: certified, enterprise-ready, free/paid, open source, app type, model

### 4. App Registry
Application types: Hosted SaaS, GitHub App, External API, Agent Pack, Automation Pack, Skill Pack, Enterprise App, Private App.

### 5. Skills Registry
Full schema: ID, version, name, description, category, input/output schema, credit cost, risk level, permissions, compatible models, dependencies.

Skill categories: Parsing, OCR, Retrieval, Decision, Automation, Analytics, Translation, Voice, Vision, Compliance, Knowledge, API Integration, Computer Action.

### 6. Runtime Sandbox
CPU/memory/timeout limits, network/filesystem/wallet/providerHub/tenantData permissions, tenant isolation, audit logging. Implemented in `@ai-pass/marketplace-runtime`.

### 7. Billing & Monetization
Pricing models: free, freemium, subscription, pay-per-use, enterprise license. Default revenue share: **70% developer / 30% platform**.

### 8. Reviews & Ratings
1–5 stars, verified purchase flag, developer reply, abuse report.

### 9. Promotion Engine
Featured, sponsored, trending, editor's picks, deals, bundles, campaigns, coupons.

### 10. Security & Approval Pipeline
Static analysis, dependency scan, permission review, AI safety checks. Risk levels: low, medium, high, critical.

### 11. Analytics & Monitoring
Installs, active users, revenue, credits, executions, crashes, latency, retention.

### 12. Enterprise Private Marketplace
Private store, approve versions, restrict categories, block models, internal publishing policy per org.

## 7-Step App Submission Wizard

1. **Application Info** — name, description  
2. **Technical Config** — app type, category  
3. **Permissions** — required scopes  
4. **Pricing** — model and price  
5. **AI Models Used** — model list  
6. **Security Review** — automated pipeline preview  
7. **Submit** — POST `/api/v1/marketplace/apps`

Route: `/workspace/marketplace/publish/app`

## Publish Skill Wizard

Route: `/workspace/marketplace/publish/skill`

## Frontend Routes

| Route | Purpose |
|-------|---------|
| `/workspace/marketplace` | Home — all catalog sections |
| `/workspace/marketplace/search` | Search + filters |
| `/workspace/marketplace/categories/[category]` | Category browse |
| `/workspace/marketplace/apps/[slug]` | App details + install |
| `/workspace/marketplace/skills/[slug]` | Skill details |
| `/workspace/marketplace/developer` | Developer portal |
| `/workspace/marketplace/publish/app` | 7-step app wizard |
| `/workspace/marketplace/publish/skill` | Skill wizard |
| `/workspace/marketplace/analytics` | Analytics dashboard |
| `/workspace/marketplace/enterprise` | Enterprise private store |
| `/workspace/marketplace/admin` | Admin console |
| `/marketplace` | Legacy redirect → workspace |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/v1/marketplace/developers` | List/register developers |
| GET/POST | `/api/v1/marketplace/apps` | List/create apps |
| GET/PUT/DELETE | `/api/v1/marketplace/apps/[id]` | App CRUD |
| GET/POST | `/api/v1/marketplace/skills` | List/create skills |
| POST | `/api/v1/marketplace/install` | Install app |
| GET | `/api/v1/marketplace/wallet` | Wallet summary |
| POST | `/api/v1/marketplace/billing` | Revenue share + payout |
| GET/POST | `/api/v1/marketplace/reviews` | Reviews |
| GET | `/api/v1/marketplace/analytics` | Analytics |
| GET | `/api/v1/marketplace/catalog` | Full home catalog |

## Integrations

- **AI Wallet** — `recordSkillUsage()` on every skill execution  
- **Membership** — `checkInstallEntitlement()` gates installs by tier  
- **Trust Engine** — Certified, Enterprise Ready, Verified Developer, Compliance Ready badges  
- **Vertical apps** — Invoice AI, Supply Chain AI, Customer Support AI, HR AI (seed stubs)  
- **Platform links** — Agent Studio, Workflow Engine (LiveSync), Knowledge Pipeline, Analysis Studio

## Seed Data

Demo includes 3 developers, 12 apps, 18 skills, reviews, deals, campaigns, collections, industry packs, coupons, and bundles.

## Categories

Finance, HR, Supply Chain, Legal, Compliance, Healthcare, Marketing, Sales, Customer Support, Analytics, AI Agents, Automation, Knowledge, Vision AI, Voice AI, Developer Tools, IoT, Custom.
