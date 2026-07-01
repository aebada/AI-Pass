# Customer Support AI

Enterprise multilingual voice + text customer service platform for AI-Pass.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Customer Support AI App                       │
│  Dashboard │ Live Chat │ Voice │ Tickets │ Analytics │ Admin   │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              Conversation Service (orchestrator)                 │
│  start → detect language → intent → knowledge → rules →         │
│  decision → action → response → feedback → summary              │
└─┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬────────────┘
  │      │      │      │      │      │      │      │
  ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼
Intent Voice Know. Work.  CRM   Ticket Escal. Analytics
       STT/TTS       flow        Engine
```

### Packages

| Package | Purpose |
|---------|---------|
| `@ai-pass/customer-support-ai` | Core engine, services, API types, demo data |
| `@ai-pass/crm-connectors` | CRM adapter pattern (Salesforce, HubSpot, etc.) |

### Platform Integrations

| System | Integration |
|--------|-------------|
| **AI Provider Hub** | Routes chat/intent/voice/knowledge via `routeSupportRequest()` — no direct provider calls |
| **AI Wallet** | Records credits per message, voice minute, knowledge retrieval, CRM, workflow |
| **Membership** | Gates: `customer_support_ai` (Pro+), voice/CRM (Power+), enterprise (Enterprise) |
| **LiveSync** | Events: `support.conversation.*`, `support.ticket.updated`, `support.analytics.refresh` |
| **Trust Engine** | Conversation quality, policy compliance, trust score per response |
| **Compliance** | GDPR consent stubs, PII scan/redact, retention policy |
| **Knowledge Pipeline** | FAQ/policy/order retrieval with citations |
| **Marketplace** | App `customer-support-ai` + 17 reusable skills |
| **Agent Studio** | 4 support agents registered on platform init |
| **Workflow Engine** | Refund flow stub (`wf_refund`) |

## Conversation Engine

Lifecycle stages:

1. **Start** — create conversation, detect language, welcome message
2. **Message** — PII scan → intent detection → knowledge retrieval → escalation check
3. **Decision** — trust scoring, PASS/NEEDS_INFO
4. **Action** — workflow trigger (refund), ticket creation (escalation), CRM sync
5. **Response** — multilingual templated response with citations
6. **Feedback** — CSAT collection, conversation summary

## Voice

- **STT stub** — simulates transcription in EN/DE/AR
- **TTS stub** — returns encoded stub audio
- **Language switching** — runtime language change on voice session
- **Recording metadata** — format, sample rate, channels (stubbed)

Requires Power membership (`customer_support_voice`).

## CRM Integration

Adapter pattern in `@ai-pass/crm-connectors`:

- Salesforce, HubSpot, Dynamics, Zendesk, Freshdesk, ServiceNow, Custom REST
- All adapters extend `BaseCrmAdapter` with stubbed connect/update/create

## Skills (Marketplace)

IntentDetection, LanguageDetection, ConversationMemory, Summarization, FAQRetrieval, PolicyRetrieval, OrderLookup, CustomerProfile, RefundEligibility, ComplaintClassification, EscalationDecision, CRMUpdate, TicketCreation, Email, Slack, VoiceRecognition, TTS

## API Reference

Base path: `/api/customer-support-ai`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/conversation/start` | Start new conversation |
| POST | `/conversation/message` | Send chat message |
| POST | `/conversation/voice` | Voice STT/TTS actions |
| GET | `/conversation/history` | List conversations + messages |
| POST | `/ticket` | Create ticket |
| GET | `/ticket?id=` | Get ticket (or list all) |
| POST | `/crm/update` | Update CRM record |
| GET | `/analytics` | Dashboard analytics |
| POST | `/feedback` | Submit CSAT feedback |

Headers: `x-tenant-id`, `x-user-id`, `x-membership-tier`

## Web UI Routes

| Route | Page |
|-------|------|
| `/workspace/apps/customer-support-ai` | Dashboard |
| `/workspace/apps/customer-support-ai/live-chat` | Live Chat |
| `/workspace/apps/customer-support-ai/voice` | Voice Console |
| `/workspace/apps/customer-support-ai/history` | Conversation History |
| `/workspace/apps/customer-support-ai/tickets` | Ticket Management |
| `/workspace/apps/customer-support-ai/analytics` | Analytics |
| `/workspace/apps/customer-support-ai/knowledge` | Knowledge Search |
| `/workspace/apps/customer-support-ai/settings` | Channels & CRM |
| `/workspace/apps/customer-support-ai/admin` | Administration |

## Demo Data

Seed includes EN/DE/AR conversations, escalation example (urgent refund), tickets, analytics, and audit logs for tenant `tenant_acme`.

## Real vs Stubbed

| Component | Status |
|-----------|--------|
| Conversation orchestration | **Real** (in-memory) |
| Intent detection | **Real** (rule-based) |
| Language detection | **Real** (heuristic EN/DE/AR) |
| Knowledge retrieval | **Real** (knowledge-pipeline stub index) |
| STT/TTS | **Stub** |
| CRM adapters | **Stub** |
| Email/Slack notifications | **Stub** |
| Workflow engine | **Stub** (refund flow simulation) |
| Provider Hub routing | **Real** (routing selection, no LLM call) |
| LiveSync events | **Real** (when engine available) |
| Wallet metering | **Real** |
| Trust scoring | **Real** (trust package) |
| PII compliance | **Real** (regex scan) |
