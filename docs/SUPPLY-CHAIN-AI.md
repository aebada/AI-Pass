# Supply Chain AI

Enterprise Procurement & Supplier Evaluation Platform for AI-Pass.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     apps/web (Next.js UI)                        │
│  Dashboard · Events · Offers · Evaluation · Comparison · Chat    │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API (/api/v1/supply-chain-ai/*)
┌────────────────────────────▼────────────────────────────────────┐
│              @ai-pass/supply-chain-ai                          │
│  SupplyChainAIService orchestrates:                              │
│  sourcing · supplier · offer-parse · normalize · policy          │
│  rules-engine · scoring-engine · agent-orchestrator              │
│  reporting · notification (stub) · audit                         │
└─────┬──────────┬──────────┬──────────┬──────────┬───────────────┘
      │          │          │          │          │
  Agent Studio  Wallet   LiveSync   Trust     Knowledge Pipeline
  Marketplace   Membership          Engine    (policy stub)
  ERP Connectors (Coupa/Ariba/Jaggaer)
```

## Explainability Model

Every evaluation produces:

1. **Rule Results** — PASS/FAIL/NEEDS_INFO per rule (budget, certs, blacklist, country, delivery, docs, policy)
2. **Score Breakdown** — Weighted dimensions: price, delivery, risk, quality, warranty, ESG, compliance, payment
3. **Agent Results** — Per-agent decision, confidence, summary, citations (via Agent Studio)
4. **Evidence IDs** — Traceable references to fields, policies, and rules
5. **Trust Score** — Computed via `@ai-pass/trust` ScoringEngine

## Agent Orchestration

Nine agents registered in Agent Studio:

| Agent | Type | Role |
|-------|------|------|
| Pricing Agent | `sc_pricing` | Benchmark pricing, TCO |
| Risk Agent | `sc_risk` | Supplier risk scoring |
| Compliance Agent | `sc_compliance` | Policy adherence |
| ESG Agent | `sc_esg` | Sustainability scoring |
| Logistics Agent | `sc_logistics` | Delivery & incoterms |
| Decision Agent | `sc_decision` | Award recommendation |
| Planner Agent | `sc_planner` | Workflow sequencing |
| Evaluator Agent | `sc_evaluator` | Multi-criteria synthesis |
| Output Composer | `sc_output` | Reports & memos |

All agents route through the platform skill executor — **no direct provider calls**.

## LiveSync Event Pipeline

```
offer.uploaded → offer.parsed → evaluation.completed → ranking.updated
  → dashboard.refresh → approval.required → notification (stub)
```

## ERP Integration

`@ai-pass/erp-connectors` provides stub adapters:

- **CoupaAdapter** — listSourcingEvents, listPurchaseOrders, syncAwardDecision
- **AribaAdapter** — SAP Ariba stub
- **JaggaerAdapter** — Jaggaer stub

Enterprise tier (`supply_chain_ai_erp`) gates ERP sync.

## Membership Gates

| Feature | Free | Pro | Power | Enterprise |
|---------|------|-----|-------|------------|
| `supply_chain_ai` | — | ✓ | ✓ | ✓ |
| `supply_chain_ai_advanced` | — | — | ✓ | ✓ |
| `supply_chain_ai_erp` | — | — | — | ✓ |
| `supply_chain_ai_enterprise` | — | — | — | ✓ |

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/supply-chain-ai/sourcing` | List sourcing events |
| POST | `/api/v1/supply-chain-ai/sourcing` | Create sourcing event |
| GET | `/api/v1/supply-chain-ai/offers?eventId=` | List offers |
| POST | `/api/v1/supply-chain-ai/offers` | Upload & parse offer |
| GET | `/api/v1/supply-chain-ai/evaluation?eventId=` | List evaluations |
| POST | `/api/v1/supply-chain-ai/evaluation` | Run evaluation |
| POST | `/api/v1/supply-chain-ai/chat` | Procurement chat |
| POST | `/api/v1/supply-chain-ai/reports` | Generate report artifact |
| GET/POST | `/api/v1/supply-chain-ai/approval` | Approvals queue |
| GET | `/api/v1/supply-chain-ai/suppliers` | List suppliers |

Headers: `x-tenant-id`, `x-user-id`, `x-membership-tier`

## Routes

- Primary: `/workspace/apps/supply-chain-ai`
- Alias: `/supply-chain-ai` (redirects to primary)
- Legacy: `/platform/supply-chain`

## Real vs Stubbed

| Component | Status |
|-----------|--------|
| Types & services | **Real** (in-memory) |
| Rules engine | **Real** (deterministic) |
| Scoring engine | **Real** (weighted templates) |
| Offer parsing | **Stub** (filename-based extraction) |
| Agent orchestrator | **Stub** (Agent Studio wired, stub outputs) |
| Knowledge pipeline | **Stub** (policy refs) |
| ERP connectors | **Stub** (no live API) |
| Notifications | **Stub** (in-memory queue) |
| Compliance AI | **Stub** |
| Chat | **Stub** (keyword routing) |
| Charts | **Stub** (SVG placeholder) |

## Demo Data

Seeded on startup: 3 events, 4 suppliers, 3 offers, 2 policies, 1 evaluation with rankings and evidence.
