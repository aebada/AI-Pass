# Invoice AI — Subsystem Guide

Entry point for the Invoice AI marketplace app. Deep references:

- Concepts / glossary → [CONCEPTS.md](./CONCEPTS.md)
- Entities & statuses → [DATA-MODEL.md](./DATA-MODEL.md)
- Platform roadmap / middleware / RBAC → [INVOICE-AI-PLATFORM.md](./INVOICE-AI-PLATFORM.md)
- REST catalog (Node / future API) → [INVOICE-AI-API.md](./INVOICE-AI-API.md)
- Deploy options → [DEPLOY-INVOICE-AI-PLATFORM.md](./DEPLOY-INVOICE-AI-PLATFORM.md) · [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Positioning

Invoice AI is a finance automation vertical inside AI Pass Workspace. On **static Hostinger** it runs **entirely client-side** via `@ai-pass/invoice-ai` (OCR/validation/fraud are rule-based stubs unless a Node API or live providers are wired). Agents and engines go through platform packages (`provider-hub`, `wallet`, `livesync`, etc.) rather than calling vendors directly from UI code.

Conceptually: one **tenant** → one `InvoiceAIService` → one `localStorage` snapshot; UI always under `InvoiceAIProvider`.

---

## Package & UI layout

```
packages/invoice-ai/
├── src/
│   ├── index.ts                 # Platform factory + re-exports
│   ├── demo-data.ts             # Seed data for demo tenant
│   ├── agents.ts                # Agent Studio definitions
│   ├── membership-gates.ts
│   ├── livesync.ts              # invoice.uploaded emission
│   ├── services/
│   │   ├── invoice-service.ts   # Main orchestrator
│   │   ├── service-registry.ts  # Per-tenant instances
│   │   ├── tenant-persistence.ts# localStorage snapshots
│   │   ├── ocr-service.ts / validation / fraud / approval / …
│   │   ├── fake-invoice-detection.ts
│   │   ├── supply-chain-engine.ts
│   │   └── procure-to-pay-engine.ts
│   ├── tenant/                  # resolve tenant id, RBAC types
│   ├── middleware/              # PII mask, AI router facade
│   ├── orchestrator/            # Agent pipeline stubs
│   ├── workflow/
│   ├── admin/
│   ├── ocr/
│   ├── reporting/
│   └── api/                     # Handlers for Node API routes

apps/web/app/workspace/apps/invoice-ai/
├── layout.tsx                   # Wraps children in InvoiceAIProvider
├── page.tsx                     # Dashboard
├── portfolio/ upload/ chat/ …
└── components/
    ├── InvoiceAIProvider.tsx    # Required context
    ├── InvoiceShell.tsx         # Nav chrome
    ├── InvoicePortfolio.tsx
    ├── InvoiceLifecyclePanel.tsx
    └── …
```

Build / test:

```bash
pnpm --filter @ai-pass/invoice-ai build
pnpm --filter @ai-pass/invoice-ai test
```

---

## Client-side service & tenant isolation

| Piece | Behavior |
|-------|----------|
| Factory | `getInvoiceAIService(tenantId, { email })` |
| Tenant id | `resolveInvoiceAITenantId(user)` → `tenant_<workspace>` or `tenant_<userId>` or `anonymous` |
| Demo | Email `demo@example.com` → shared demo tenant (`DEMO_TENANT_ID`); optional `NEXT_PUBLIC_INVOICE_AI_DEMO=1` |
| Storage | Browser `localStorage` key `invoice-ai:data:{tenantId}` (debounced snapshot) |
| Isolation | Separate in-memory service per tenant; list methods filter by `tenantId` |
| Legacy | `defaultInvoiceAIService` proxies the demo-tenant singleton — prefer `getInvoiceAIService` |

Corrupt snapshots are discarded (`isValidInvoiceAIServiceSnapshot`).

---

## Provider / layout requirements

Invoice AI pages **must** render under the route layout that mounts `InvoiceAIProvider`:

```tsx
// apps/web/app/workspace/apps/invoice-ai/layout.tsx
export default function InvoiceAILayout({ children }) {
  return <InvoiceAIProvider>{children}</InvoiceAIProvider>;
}
```

`InvoiceAIProvider`:

- Reads the logged-in user from `AppProviders` (`useApp()`)
- Resolves `tenantId` and obtains a tenant-scoped `InvoiceAIService`
- Exposes upload / approve / reject / chat / fake detection / use-case helpers
- Subscribes to service updates so UI re-renders after mutations

Do not call `getInvoiceAIService` from a page outside this tree without also providing tenant context. Shell navigation uses `InvoiceShell` for primary links.

---

## Key routes

Base: `/workspace/apps/invoice-ai`

| Page | Path |
|------|------|
| Dashboard | `/` |
| Invoices | `/invoices`, `/invoices/[id]` |
| Portfolio | `/portfolio` |
| Upload | `/upload` |
| Approvals | `/approvals` |
| Fraud Center | `/fraud` |
| Fake detection | `/fake-detection` |
| Supply chain | `/supply-chain` |
| Procure-to-pay | `/procure-to-pay` |
| Chat | `/chat` |
| Use cases | `/use-cases` |
| Workflow | `/workflow` |
| Vendors | `/vendors` |
| Reports | `/reports` |
| Settings / ERP | `/settings`, `/settings/erp` |
| Integrations | `/integrations` |
| Admin metrics | `/admin` |

Primary nav (shell): Dashboard, Invoices, Upload, Approvals, Fraud, Workflow, Vendors, Reports, Settings. Other routes are linked from dashboard / feature pages.

---

## Features (as implemented)

| Feature | Notes |
|---------|-------|
| **Portfolio** | Card grid over tenant invoices + lifecycle mini status |
| **Upload** | Multi-file; OCR stub → validation → fraud → compliance → LiveSync `invoice.uploaded` |
| **Chat** | Keyword / topic demo via `chat-engine` (fraud, approvals, spend, vendors, …) — not a live LLM on static |
| **Supply chain** | Offers, tenders, weighted comparisons (`SupplyChainEngine`) inside Invoice AI snapshot |
| **Fake detection** | Heuristics → `Authentic` / `Suspicious` / `Likely Fake`; fraud alerts type `deepfake` |
| **Lifecycle** | Status + related entities → 10-stage UI (`InvoiceLifecyclePanel`) |
| **Procure-to-pay** | PO / delivery / 3-way match for construction-oriented packs |
| **Use cases** | Bookkeeping, tax, insurance, public sector, construction, custom, … |
| **Membership gates** | Plan tiers gate fraud / automation / enterprise features |
| **Wallet** | Credit tracking hooks on OCR / validation / chat |
| **Admin** | Metrics stub page + `admin/` package services |

### Agent pipeline (registered definitions)

```
Upload → Extraction → Validation → Fraud → Compliance → Approval → Payment → Audit
```

Agent Studio ids (`packages/invoice-ai/src/agents.ts`): `agent_extraction`, `agent_validation`, `agent_fraud`, `agent_compliance`, `agent_approval`, `agent_audit`, … — routed via platform skills, not direct provider calls from UI.

See also [INVOICE-AI-PLATFORM.md](./INVOICE-AI-PLATFORM.md).

---

## Lifecycle stages (UI)

The portfolio / detail panels show an end-to-end track that is **derived** from `InvoiceStatus` plus related collections — it is not a separate stored status field.

| # | Stage id | Label |
|---|----------|-------|
| 1 | `uploaded` | Uploaded |
| 2 | `ocr` | OCR / Extract |
| 3 | `validate` | Validate |
| 4 | `fraud` | Fraud |
| 5 | `compliance` | Compliance |
| 6 | `controller` | Controller Review |
| 7 | `decision` | Approved / Denied |
| 8 | `bookkeeping` | Bookkeeping |
| 9 | `erp` | ERP |
| 10 | `paid` | Paid |

Implementation: `apps/web/app/workspace/apps/invoice-ai/components/invoice-lifecycle-utils.ts`.

### Invoice statuses (stored)

`draft` · `processing` · `validated` · `pending_approval` · `approved` · `rejected` · `paid` · `flagged`

Full entity notes: [DATA-MODEL.md](./DATA-MODEL.md#invoice-entity).

---

## Feature flows (detail)

### Upload → OCR → validate → fraud → approve

1. UI calls `InvoiceAIProvider` upload helpers → `InvoiceAIService.uploadInvoice`.
2. OCR stub returns fields, amount, optional `deepfakeScore` / signals.
3. Validation engine writes a `ValidationResult`; compliance pack may emit checks, bookkeeping, tax lines.
4. If membership allows fraud (`invoice_ai_fraud`), `FraudEngine.analyze` runs; deepfake / legal alerts may append.
5. Construction-ish use cases / filenames trigger procure-to-pay matching (PO / delivery / Skonto).
6. Status chosen from validation + alert severity; approval router may set `pending_approval`.
7. Wallet records credits; audit `invoice.uploaded`; LiveSync emits `invoice.uploaded`.
8. Snapshot debounced to `invoice-ai:data:{tenantId}`.

Approve / reject: pending `Approval` row required → status `approved` / `rejected` → ERP stub push on approve → audit + LiveSync.

### Chat

`chat-engine` classifies topics (fraud, approvals, spend, tax, portfolio, vendor, procurement, compliance, general) with keyword / follow-up heuristics and answers from **in-memory tenant data**. System prompt discourages leaking RAG chunk metadata. Credits recorded when the service `chat` path runs. This is a **demo assistant** on static hosting, not Laravel `/api/v1/ai/chat`.

### Fake detection

`fake-invoice-detection.ts` maps risk 0–1 → verdict:

| Risk % | Verdict |
|--------|---------|
| below 40 | Authentic |
| 40–70 | Suspicious |
| above 70 | Likely Fake |

Upload response includes `authenticity`; critical deepfake severity flags the invoice. Fraud Center / Fake Detection routes surface alerts with type `deepfake`.

### Supply chain (inside Invoice AI)

`SupplyChainEngine` compares tenders/offers with weighted criteria (price, lead time, compliance, vendor risk) and optional user rules. State lives in the same tenant snapshot (`supplyOffers`, `tenders`, `supplyChainWorkflows`). Distinct from the standalone `@ai-pass/supply-chain-ai` package — see [SUPPLY-CHAIN-AI.md](./SUPPLY-CHAIN-AI.md).

### Membership gates

| Helper | Feature key |
|--------|-------------|
| `canAccessInvoiceAI` | `invoice_ai` |
| `canAccessFraudCenter` | `invoice_ai_fraud` |
| `canAccessWorkflowBuilder` | `invoice_ai_automation` |
| `canAccessEnterprisePacks` | `invoice_ai_enterprise` |

---

## Static export vs Node API

| Mode | Behavior |
|------|----------|
| **Static** (`STATIC_EXPORT=1`) | No `/api/v1/invoice-ai`; UI uses in-process service + `localStorage` |
| **Node** (`pnpm dev:web` or `DEPLOY_NODE=1`) | Optional HTTP handlers under `/api/v1/invoice-ai` — catalog in [INVOICE-AI-API.md](./INVOICE-AI-API.md) |

Headers for API mode: `x-tenant-id`, `x-user-id`, `x-membership-tier` (and RBAC roles when enforced).

---

## Platform integration

| Module | Usage |
|--------|-------|
| `provider-hub` | Model routing facade (middleware) |
| `wallet` | Credits |
| `membership` | Feature gates |
| `agent-studio` | Agent definitions |
| `livesync` | `invoice.uploaded` |
| `marketplace` / `store` | Packs / app listing |
| `platform-core` | Module registry entry at `/workspace/apps/invoice-ai` |
| `erp-connectors` | ERP service stubs |

---

## Working vs stubbed (summary)

| Working (demo / client) | Stub / Phase 2+ |
|-------------------------|-----------------|
| Dashboard, portfolio, upload orchestration | Real LLM / OCR providers |
| Rule-based validation, fraud, fake detection | Persistent server DB for invoices |
| Approvals, chat keywords, use cases | Full workflow editor |
| localStorage tenant isolation | Live ERP sync |
| Agent registration | Autonomous payment scheduling |

Component / roadmap matrix: [INVOICE-AI-PLATFORM.md](./INVOICE-AI-PLATFORM.md#component-map-vs-specification).

---

## Related

- [CONCEPTS.md](./CONCEPTS.md) — tenant, membership, static vs Node
- [DATA-MODEL.md](./DATA-MODEL.md) — statuses, snapshot keys, roles
- [ARCHITECTURE.md](./ARCHITECTURE.md) — tenant model in system context
- [DEVELOPMENT.md](./DEVELOPMENT.md) — build/test commands
- Mobile scaffold: `apps/invoice-ai-mobile/`
