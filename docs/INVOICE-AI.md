# Invoice AI — Architecture

Invoice AI is an enterprise finance automation marketplace app inside AI Pass Workspace. It orchestrates the full invoice lifecycle through platform modules — no direct provider calls.

## Positioning

- Full finance automation engine
- Configurable industry workflow system
- Agent-driven business automation layer
- Enterprise compliance and orchestration
- Template-driven solution builder (automation packs)

## Package structure

```
packages/invoice-ai/
├── src/
│   ├── index.ts              # Platform factory, exports
│   ├── api-types.ts          # REST request/response types
│   ├── demo-data.ts          # Static-export compatible seed data
│   ├── agents.ts             # Agent Studio agent definitions
│   ├── membership-gates.ts     # Plan-based feature gates
│   ├── livesync.ts             # invoice.uploaded event emission
│   ├── services/
│   │   ├── ocr-service.ts      # OCR stub (no direct providers)
│   │   ├── validation-engine.ts
│   │   ├── fraud-engine.ts
│   │   ├── approval-engine.ts
│   │   └── invoice-service.ts  # Main orchestrator
│   └── api/
│       ├── index.ts
│       └── handlers.ts         # Header parsing for API routes
```

## Platform integration

| Module | Usage |
|--------|-------|
| **provider-hub** | Model routing via platform (agents never call providers directly) |
| **wallet** | Credit tracking on OCR, validation, chat queries |
| **membership** | `invoice_ai`, `invoice_ai_fraud`, `invoice_ai_automation`, `invoice_ai_enterprise` gates |
| **agent-studio** | 7 agents: Extraction, Validation, Fraud, Compliance, Approval, Audit, Payment |
| **livesync** | `invoice.uploaded` trigger → `wf_invoice_validation` workflow |
| **marketplace** | Skill invocation via platform executor |
| **governance** | Audit logs, approval artifacts |
| **store** | Registered as marketplace app "Invoice AI" |
| **platform-core** | ModuleRegistry entry `invoice-ai` at `/workspace/apps/invoice-ai` |

## Data model

Defined in `@ai-pass/shared` (`invoice-ai.ts`):

- `Invoice`, `InvoiceItem`, `Vendor`, `Approval`, `InvoiceWorkflow`
- `FraudAlert`, `ValidationResult`, `AuditLog`
- `InvoiceAutomationPack` (industry packs)

## REST API

Base: `/api/v1/invoice-ai`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/invoices` | List invoices |
| GET | `/invoices/:id` | Invoice detail + validation, approvals, fraud, audit |
| POST | `/upload` | Upload file (multipart) → OCR → validate → fraud → LiveSync |
| POST | `/validate` | Re-run validation |
| POST | `/approve` | Approve pending invoice |
| POST | `/reject` | Reject with reason |
| POST | `/chat` | Semantic query demo |
| GET | `/workflow` | List workflows |
| GET | `/vendors` | List vendors |
| GET | `/fraud` | List fraud alerts |

Headers: `x-tenant-id`, `x-user-id`, `x-membership-tier`

## Web UI

Route: `/workspace/apps/invoice-ai`

| Page | Path |
|------|------|
| Dashboard | `/` |
| Invoices | `/invoices`, `/invoices/[id]` |
| Upload | `/upload` |
| Approvals | `/approvals` |
| Fraud Center | `/fraud` (Power+) |
| Workflow Builder | `/workflow` (Power+) |
| Vendors | `/vendors` |
| Reports | `/reports` |
| Settings + Packs | `/settings` |
| Chat panel | Sidebar on most pages |

## Automation packs (stub)

- Insurance Claims
- Healthcare & Medical Billing
- Financial Services
- Public Sector Procurement

## Agent pipeline

```
Upload → Extraction Agent → Validation Agent → Fraud Agent
       → Compliance Agent → Approval Agent → Payment Agent → Audit Agent
```

Each step logs to audit trail and records wallet credits.

## Static export

Set `STATIC_EXPORT=1` for `next build`. Pages import `demo-data` and `defaultInvoiceAIService` directly; API routes are unavailable in static mode. Chat and upload fall back to in-process service calls.

## What's working vs stubbed

| Area | Status |
|------|--------|
| Dashboard, lists, detail views | Working (demo data) |
| Upload + OCR pipeline | Working (stub OCR, real orchestration) |
| Validation / fraud / approval engines | Working (rule-based) |
| LiveSync on upload | Working (emits `invoice.uploaded`) |
| Wallet credit tracking | Working |
| Membership gates | Working |
| Agent Studio registration | Working (7 agents registered) |
| REST API routes | Working (Next.js API) |
| Semantic chat | Working (keyword-based demo) |
| Workflow builder UI | Stub (visual display, no edit) |
| Automation pack install | Stub |
| ERP / SAP / Oracle integration | Stub |
| Real OCR / LLM extraction | Stub |
| Payment scheduling | Stub |
| Autonomous mode | Stub |
