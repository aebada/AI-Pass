# Sales AI

AI-powered Revenue Operating System for AI-Pass — email, LinkedIn, proposals, CRM, campaigns, and agents.

**Headline:** Close More Deals with AI  
**Subtitle:** Generate personalized emails, proposals, outreach campaigns, meeting preparation, and AI-powered sales workflows from one unified platform.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Sales AI App                             │
│  Dashboard │ Email │ LinkedIn │ Proposals │ Copilot │ Campaigns │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              SalesAIService (orchestrator)                       │
│  email → linkedin → proposal → meeting → campaign → crm → copilot│
└─┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬────────────┘
  │      │      │      │      │      │      │      │
  ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼
Email  LinkedIn Proposal Meeting Campaign CRM   Copilot Analytics
Assist  Assist  Gen     Prep    Builder Service
```

### Packages

| Package | Purpose |
|---------|---------|
| `@ai-pass/sales-ai` | Core engine, services, API types, demo data |
| `@ai-pass/crm-connectors` | CRM adapters (Salesforce, HubSpot, Zoho, Pipedrive, Dynamics, Monday) |

### Platform Integrations

| System | Integration |
|--------|-------------|
| **AI Provider Hub** | Routes email/linkedin/proposal/copilot via `routeSalesRequest()` — no direct provider calls |
| **AI Wallet** | Records credits per email, LinkedIn, proposal, meeting prep, campaign, CRM sync |
| **Membership** | Free: 20 emails/mo; Pro (€39): 500; Business (€99): CRM + campaigns; Enterprise: unlimited |
| **LiveSync** | Events: `lead.created`, `campaign.sent`, `deal.updated`, `sales.analytics.refresh` |
| **Trust Engine** | Outbound quality, compliance, hallucination risk, confidence scoring |
| **Knowledge Pipeline** | Product sheets, pricing, FAQs, battle cards, proposal templates via RAG |
| **Marketplace** | App `sales-ai` (flagship) + skills `skill_sales_email`, `skill_sales_linkedin`, `skill_sales_proposal` |
| **Agent Studio** | 6 agents: Research, Email, Proposal, Meeting, Negotiation, CRM |
| **Playground** | Link to `/workspace/playground` for model comparison |

## Services

| Service | Capabilities |
|---------|-------------|
| `email-assistant` | Cold, follow-up, intro, investor, partnership, support, proposal, quotation |
| `linkedin-assistant` | Connection, follow-up, InMail, comments, profile optimization, sequences |
| `proposal-generator` | Proposals, quotations, RFP, contracts, project offers |
| `sales-copilot` | Objections, next-best action, meeting prep, deal insights, follow-ups |
| `meeting-prep` | Company summary, decision makers, news, questions, agenda, strategy, risks |
| `crm-service` | Salesforce, HubSpot, Zoho, Pipedrive, Dynamics, Monday sync |
| `personalization-engine` | Website, LinkedIn, CRM history, conversations, industry, title, company size |
| `campaign-builder` | Cold, nurturing, follow-up, upsell, renewals, investor outreach |
| `analytics-service` | Open rate, reply rate, conversion, meetings, AI effectiveness, ROI |
| `outreach-service` | Email, LinkedIn, WhatsApp, SMS, Teams, Slack (stubs) |
| `workflow-integration` | Lead → research → email → wait → follow-up → CRM → notify |

## Membership Gates

| Feature | Free | Pro | Business | Enterprise |
|---------|------|-----|----------|------------|
| `sales_ai` | — | ✓ | ✓ | ✓ |
| Emails/month | 20 | 500 | 5000 | ∞ |
| `sales_ai_crm` | — | — | ✓ | ✓ |
| `sales_ai_campaigns` | — | — | ✓ | ✓ |
| `sales_ai_enterprise` | — | — | — | ✓ |

## API Reference

Base path: `/api/sales`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/email` | Generate email draft |
| POST | `/linkedin` | Generate LinkedIn message |
| POST | `/proposal` | Generate proposal/quotation |
| POST | `/meeting-prep` | Generate meeting brief |
| POST | `/campaign` | Create outreach campaign |
| GET | `/campaigns` | List campaigns |
| POST | `/crm/sync` | Sync lead/contact/deal to CRM |
| GET | `/analytics` | Sales analytics KPIs |
| POST | `/copilot` | Sales copilot chat |

Headers: `x-tenant-id`, `x-user-id`, `x-membership-tier`

## UI Routes

| Route | Page |
|-------|------|
| `/workspace/apps/sales-ai` | Dashboard |
| `/workspace/apps/sales-ai/email` | Email Assistant |
| `/workspace/apps/sales-ai/linkedin` | LinkedIn Assistant |
| `/workspace/apps/sales-ai/proposals` | Proposals |
| `/workspace/apps/sales-ai/copilot` | Sales Copilot |
| `/workspace/apps/sales-ai/meeting-prep` | Meeting Prep |
| `/workspace/apps/sales-ai/campaigns` | Campaign Builder |
| `/workspace/apps/sales-ai/crm` | CRM Connections |
| `/workspace/apps/sales-ai/analytics` | Analytics |
| `/workspace/apps/sales-ai/settings` | Settings/Admin |

## Demo Data

- 3 leads (TechFlow, Nordic Data, ScaleUp Ventures)
- 2 campaigns (Q3 SaaS Cold Outreach, Investor Intro Sequence)
- 2 sample emails, 1 proposal, meeting prep for TechFlow GmbH
- 1 deal (TechFlow Enterprise License — €48,000)

## Registration

- Marketplace seed: `sales-ai` (slug), `app_sales_ai` (ID)
- Store: `/workspace/store/apps/sales-ai`
- Platform module: `sales-ai` in `platform-core`
- Site nav: AI Apps → Sales AI
- Homepage: AI Apps cards
- Trust Engine: `sys_sales_ai`, verification `AIP-SALES2026`
