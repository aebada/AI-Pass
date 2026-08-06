# Invoice AI API Catalog

OpenAPI-style route catalog for Invoice AI mobile and admin clients.

**Base URL (Node deploy):** `http://localhost:3000/api/v1/invoice-ai`

**Static export:** API routes are not bundled; web/mobile demo uses `@ai-pass/invoice-ai` client-side service. Set `DEPLOY_NODE=1` for live HTTP routes.

Authentication: Bearer token or session cookie from Laravel auth bridge.

---

## Required Headers

```
Authorization: Bearer <token>
X-Tenant-Id: tenant_acme
X-User-Id: user_123
X-User-Roles: finance_manager
X-Membership-Tier: professional
Content-Type: application/json
```

### RBAC

Roles: `platform_admin`, `tenant_admin`, `finance_manager`, `approver`, `accountant`, `auditor`, `viewer`

| Action | Roles |
|--------|-------|
| Upload / validate | finance_manager, tenant_admin, accountant, … |
| Approve / reject | approver, finance_manager, tenant_admin, … |
| Admin metrics | tenant_admin, platform_admin |
| Export reports | finance_manager, accountant, auditor, … |

Forbidden responses:

```json
{ "error": { "code": "FORBIDDEN", "message": "Forbidden: requires permission for invoice.approve" } }
```

---

## Live Route Examples

### Upload invoice

```bash
curl -X POST http://localhost:3000/api/v1/invoice-ai/upload \
  -H "X-Tenant-Id: tenant_acme" \
  -H "X-User-Id: demo-user" \
  -H "X-User-Roles: finance_manager" \
  -H "X-Membership-Tier: professional" \
  -F "file=@invoice-acme.pdf"
```

### List invoices

```bash
curl http://localhost:3000/api/v1/invoice-ai/invoices \
  -H "X-Tenant-Id: tenant_acme" \
  -H "X-User-Roles: viewer"
```

### Approve invoice

```bash
curl -X POST http://localhost:3000/api/v1/invoice-ai/approve \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: tenant_acme" \
  -H "X-User-Roles: approver" \
  -d '{"invoiceId":"inv_001","comment":"Looks good"}'
```

### Chat query

```bash
curl -X POST http://localhost:3000/api/v1/invoice-ai/chat \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: tenant_acme" \
  -H "X-User-Roles: finance_manager" \
  -d '{"query":"How many invoices need approval?"}'
```

When `PROVIDER_HUB_LIVE=1` or provider API keys are set, chat/extraction routes through `@ai-pass/provider-hub`; otherwise rule-based stub responses apply.

### Export reports

```bash
# JSON
curl "http://localhost:3000/api/v1/invoice-ai/reports/export?format=json" \
  -H "X-Tenant-Id: tenant_acme" \
  -H "X-User-Roles: finance_manager"

# CSV
curl "http://localhost:3000/api/v1/invoice-ai/reports/export?format=csv" \
  -H "X-Tenant-Id: tenant_acme" \
  -H "X-User-Roles: accountant" -o invoices.csv

# PDF stub
curl "http://localhost:3000/api/v1/invoice-ai/reports/export?format=pdf" \
  -H "X-Tenant-Id: tenant_acme" \
  -H "X-User-Roles: finance_manager"
```

### Admin metrics

```bash
curl http://localhost:3000/api/v1/invoice-ai/admin/metrics \
  -H "X-Tenant-Id: tenant_acme" \
  -H "X-User-Roles: tenant_admin"
```

---

## Route Catalog

| Method | Path | Status | Description |
|--------|------|--------|-------------|
| GET | `/invoices` | live | List invoices for tenant |
| GET | `/invoices/{id}` | live | Invoice detail |
| POST | `/upload` | live | Upload document (multipart) |
| POST | `/validate` | live | Re-run validation |
| POST | `/approve` | live | Approve pending invoice (RBAC) |
| POST | `/reject` | live | Reject with reason (RBAC) |
| POST | `/chat` | live | Natural language queries |
| GET | `/dashboard` | live | Summary stats |
| GET | `/approvals` | live | Approval queue (`?status=pending`) |
| GET | `/vendors` | live | Vendor registry |
| GET | `/fraud` | live | Fraud alerts |
| GET | `/workflow` | live | Tenant workflows |
| GET | `/reports/export?format=json\|csv\|pdf` | live | Export engine |
| GET | `/admin/metrics` | live | AI cost, tokens, workflow runs (RBAC) |
| GET/POST | `/erp/connections` | live | ERP connection CRUD |
| POST | `/erp/connections/{id}/test` | live | Test ERP connection |
| POST | `/erp/connections/{id}/sync` | live | Sync ERP connection |
| GET | `/erp/connections/{id}/health` | live | ERP health check |
| POST | `/erp/webhook/{provider}` | live | ERP webhook receiver |

---

## Upload Response

```json
{
  "invoice": { "id": "inv_...", "status": "pending_approval" },
  "validation": { "decision": "PASS" },
  "fraudAlerts": [],
  "compliance": [],
  "bookkeeping": [],
  "creditsUsed": 12
}
```

---

## Running Locally (Node API)

```bash
# Build packages
pnpm --filter @ai-pass/invoice-ai build

# Start Next.js with API routes enabled
cd apps/web
DEPLOY_NODE=1 pnpm dev
```

Optional provider hub (live AI):

```bash
export PROVIDER_HUB_LIVE=1
export OPENAI_API_KEY=sk-...
export OCR_PROVIDER=google   # stub | paddle | docling | google | azure | tesseract
```

---

## Mobile Client Notes

The Flutter scaffold (`apps/invoice-ai-mobile/`) uses `InvoiceAIApiClient` pointing to these routes. In static-export mode, the web app uses `@ai-pass/invoice-ai` client-side service directly; mobile clients should target the Node/Laravel API when routes are live.

### Error Format

```json
{
  "error": {
    "code": "TIER_REQUIRED",
    "message": "Invoice AI requires Professional plan or higher"
  }
}
```

---

## Deferred (Phase 4+)

- Real PDF generation (currently base64 stub)
- Outbound webhook HTTP delivery (emitter stub only)
- Live OCR provider SDK calls (cloud providers are config stubs)
- Laravel PHP route parity in `services/auth-api`
- Persistent multi-tenant database storage
- Workflow run history API (`POST /workflows/{id}/run`)
