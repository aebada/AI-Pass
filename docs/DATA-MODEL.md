# AI Pass — Data Model Sketches

Accurate sketches of entities, statuses, and browser persistence keys as implemented today. Prefer types in source over this doc when they diverge.

Primary type home for Invoice AI: `packages/shared/src/invoice-ai.ts` (exported as `@ai-pass/shared/invoice-ai`).

---

## Identity & session

### Laravel users (production)

Stored in MySQL by `services/auth-api` (`User` model: UUID primary key, `google_id`, `avatar_url`, `auth_provider`, …). Session cookie name: **`AIPASS_SESSION`**.

`GET /auth/me` returns the authenticated profile (and org/governance fields when bootstrapped — see [WORKSPACE-GOVERNANCE.md](./WORKSPACE-GOVERNANCE.md)).

### Client profile (`AppProviders`)

| Field | Role |
|-------|------|
| `id` | User id |
| `name`, `email`, `avatarInitials`, `avatarUrl?` | Display |
| `plan` | Membership / UI plan tier |
| `workspace` | Workspace display name (feeds Invoice AI tenant slug) |
| `onboarded` | Onboarding gate |

Persisted under `ai-pass:profile` in `localStorage` (legacy demo profiles are stripped).

---

## Invoice AI tenant ids

Resolved by `resolveInvoiceAITenantId` (`packages/invoice-ai/src/tenant/resolve-tenant.ts`):

| Condition | `tenantId` |
|-----------|------------|
| No user | `anonymous` |
| Email `demo@example.com`, or demo tenant + `NEXT_PUBLIC_INVOICE_AI_DEMO=1` | `tenant_acme` (`DEMO_TENANT_ID`) |
| Non-generic `user.workspace` | `tenant_<slugified-workspace>` |
| Else non-placeholder `user.id` | `tenant_<slugified-id>` |
| Fallback | `anonymous` |

Generic workspaces skipped for slug: `default`, `my workspace` (case-insensitive).

Service registry: one in-memory `InvoiceAIService` per tenant id. Snapshot key: `invoice-ai:data:{tenantId}`.

---

## Invoice entity

```ts
// packages/shared/src/invoice-ai.ts (abbreviated)
interface Invoice {
  id: string;                    // e.g. inv_<id>
  tenantId: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  documentType: InvoiceDocumentType;
  direction: 'incoming' | 'outgoing';
  status: InvoiceStatus;
  amount: number;
  currency: string;
  taxAmount?: number;
  dueDate?: string;
  items: InvoiceItem[];
  extractedFields: Record<string, { value: unknown; confidence: number }>;
  decision: AgentDecision;       // e.g. PASS / FAIL / NEEDS_INFO
  validationId?: string;
  workflowId?: string;
  useCaseId?: string;
  department?: string;
  uploadedAt: string;
  processedAt?: string;
  purchaseOrderId?: string;
  deliveryNoteId?: string;
  fileName?: string;
  mimeType?: string;
}
```

### `InvoiceStatus`

| Status | Typical meaning in pipeline |
|--------|-----------------------------|
| `draft` | Created but not processed |
| `processing` | OCR / extraction in flight |
| `validated` | Validation passed; may still need review |
| `pending_approval` | Routed to approver(s) |
| `approved` | Controller approved; ERP push attempted |
| `rejected` | Denied (validation FAIL or human reject) |
| `paid` | Terminal paid state (demo / later stages) |
| `flagged` | Fraud / deepfake / high-severity halt |

Upload path sets status from validation + fraud heuristics, then may force `pending_approval` when approval rows are created (`InvoiceAIService.uploadInvoice`).

### `InvoiceDocumentType`

`invoice` · `receipt` · `offer` · `prescription` · `sick_note` · `delivery_note`

### Use-case ids (`InvoiceUseCaseId`)

`bookkeeping` · `tax_declaration` · `insurance_claims` · `public_sector` · `healthcare` · `financial_services` · `construction_procure_to_pay` · `supply_chain` · `custom`

---

## Related Invoice AI entities

| Entity | Key fields / statuses |
|--------|------------------------|
| **Vendor** | `status`: `active` \| `blocked` \| `review`; `riskScore`, spend counters |
| **ValidationResult** | `passed`, `decision`, per-rule checks (`info`/`warning`/`error`), `confidence` |
| **FraudAlert** | `type`: `duplicate` \| `anomaly` \| `vendor_risk` \| `amount_threshold` \| `pattern` \| `deepfake` \| `legal`; `severity`; `status`: `open` \| `investigating` \| `resolved` \| `false_positive` |
| **Approval** | `status`: `pending` \| `approved` \| `rejected` \| `escalated`; `level` |
| **ComplianceCheck** | Rule results tied to invoice / use case |
| **BookkeepingEntry** / **TaxDeclarationLine** | Posting / VAT lines from compliance packs |
| **PurchaseOrder** / **DeliveryNote** / **PoInvoiceMatch** | Procure-to-pay / 3-way match |
| **CashDiscountAlert** | Skonto-style deadlines (`available` \| `expiring_soon` \| `missed`) |
| **SupplyOffer** | Offer lifecycle statuses (`received` … `revision_requested`) |
| **Tender** | `open` \| `closed` \| `awarded` |
| **SupplyChainWorkflow** | Multi-step sourcing workflow inside Invoice AI |
| **InvoiceWorkflow** | `mode`: `manual` \| `semi_automated` \| `autonomous`; step graph |
| **AuditLog** | `entityType` + `action` (e.g. `invoice.uploaded`, `invoice.approved`) |
| **FakeInvoiceDetection** (API DTO) | `verdict`: `Authentic` \| `Suspicious` \| `Likely Fake`; scores + signals |

### Invoice AI roles & permissions

Roles (`packages/invoice-ai/src/tenant/types.ts`):  
`platform_admin` · `tenant_admin` · `finance_manager` · `approver` · `accountant` · `auditor` · `viewer`

Permissions include `invoice:read|upload|approve|reject`, `fraud:*`, `compliance:read`, `workflow:*`, `admin:*`, `chat:use`, `export:run`.

API action checks: `canPerform` / `assertCanPerform` in `tenant/rbac.ts` (used by Node API handlers).

---

## Lifecycle UI stages (not the same as `InvoiceStatus`)

`InvoiceLifecyclePanel` maps detail into ordered stages (`invoice-lifecycle-utils.ts`):

1. Uploaded  
2. OCR / Extract  
3. Validate  
4. Fraud  
5. Compliance  
6. Controller Review  
7. Approved / Denied  
8. Bookkeeping  
9. ERP  
10. Paid  

Stage state: `completed` \| `current` \| `pending` \| `failed`. Progress is derived from invoice status + related collections (validation, fraud, compliance, approvals, bookkeeping, audit).

---

## Service snapshot (persistence shape)

`InvoiceAIServiceSnapshot` arrays persisted by `tenant-persistence.ts`:

```
invoices, vendors, validations, fraudAlerts, approvals, workflows,
complianceChecks, bookkeepingEntries, taxLines, purchaseOrders,
deliveryNotes, poMatches, accountSuggestions, cashDiscounts,
materialConsumption, upcomingDeliveries, supplyOffers,
supplyChainWorkflows, tenders, auditLogs
```

Corrupt / non-array schemas are discarded (`isValidInvoiceAIServiceSnapshot`).

---

## Browser `localStorage` keys (selected)

| Key | Owner | Contents |
|-----|-------|----------|
| `ai-pass:profile` | `AppProviders` | Signed-in `UserProfile` JSON |
| `ai-pass:theme` | `AppProviders` | `dark` \| `light` \| `system` |
| `ai-pass:onboarded` | `AppProviders` | `"true"` after onboarding |
| `ai-pass:api-key` | `AppProviders` | Client-side key preference (local/dev) |
| `ai-pass:ai-model` | `AppProviders` | Preferred model id string |
| `ai-pass:last-requirement` | Requirements wizard | Last NL → spec |
| `ai-pass:studio-spec` | Studio | Active builder spec |
| `ai-pass:last-solution` / `ai-pass:solutions` | Solutions | Generated solution list |
| `ai-pass-settings` | IDE workspace | Editor/settings blob |
| `ai-pass-mcp` | IDE settings | MCP server list |
| `workspace-app-sidebar-visible` | Focus mode hook | `"true"` / `"false"` |
| `invoice-ai:data:{tenantId}` | Invoice AI persistence | Full service snapshot |
| `invoice-ai:integrations` | Invoice AI integrations page | Integration form values |

Other packages may use their own keys (e.g. data-products / semantic-layer catalogs, agent-core configs, model-hub BYOK). Grep `localStorage` when extending.

---

## Workspace governance (Laravel)

Tables (auth-api migrations): `organizations`, `organization_members`, `workspace_groups`, `workspace_group_members`, `scim_tokens`.

Workspace roles: `owner` · `admin` · `manager` · `member` · `viewer` · `auditor` (legacy `builder` → builders group). Capabilities resolved via `@ai-pass/workspace-rbac`.

---

## What is *not* persisted server-side on Hostinger static

Invoice AI invoices, fraud alerts, supply offers, etc. live in the **browser** under the tenant snapshot key unless you run the Node API / a dedicated backend. Laravel holds **users, sessions, and org governance** — not the Invoice AI document store.

---

## Related

- [CONCEPTS.md](./CONCEPTS.md) — product/tech vocabulary
- [INVOICE-AI.md](./INVOICE-AI.md) — feature flows
- [INVOICE-AI-API.md](./INVOICE-AI-API.md) — HTTP DTOs when Node APIs are enabled
- [WORKSPACE-GOVERNANCE.md](./WORKSPACE-GOVERNANCE.md) — org RBAC schema
