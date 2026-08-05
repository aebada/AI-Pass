# AI Pass Platform API

> REST API surface for the Enterprise AI Operating System.

Base URL: `/api/v1`  
OpenAPI spec: `/api/docs`  
Package: `@ai-pass/platform-api`

---

## Response Envelope

```json
{
  "data": { ... },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-06-29T12:00:00.000Z",
    "version": "v1"
  }
}
```

---

## Endpoints

### System

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/modules` | List registered modules |
| GET | `/api/v1/search?q=` | Global semantic search |

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Authenticate user |
| POST | `/api/v1/auth/logout` | End session |
| GET | `/api/v1/auth/session` | Current session |

### Workspace

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/workspace/summary` | Dashboard summary |
| GET | `/api/v1/workspace/tasks` | Recent tasks |
| GET | `/api/v1/workspace/activity` | Activity feed |

### Providers

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/providers` | List AI providers |
| POST | `/api/v1/providers/route` | Route to optimal model |

### Wallet

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/wallet/balance` | Credit balance |
| GET | `/api/v1/wallet/usage` | Usage history |

### Marketplace

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/marketplace/apps` | Browse apps |
| POST | `/api/v1/marketplace/install` | Install app |

### Agents

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/agents` | List agents |
| POST | `/api/v1/agents/run` | Run agent |

### Workflows

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/workflows` | List workflows |
| POST | `/api/v1/workflows/run` | Execute workflow |

### Knowledge

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/knowledge/collections` | List collections |
| POST | `/api/v1/knowledge/ingest` | Ingest documents |

### Trust & Compliance

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/trust/score` | Trust score overview |
| GET | `/api/v1/compliance/policies` | Compliance policies |

### Organization

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/org` | Organization details |
| GET | `/api/v1/org/departments` | List departments |

---

## Node/VPS Server

```bash
pnpm --filter @ai-pass/api-server dev
# Listens on http://localhost:4000
```

Handlers: `packages/platform-api/src/handlers.ts`

---

## Next.js Routes (apps/web)

Core platform routes currently include:
- `GET /api/v1/health`
- `GET /api/v1/modules`
- `GET /api/v1/search`
- `GET /api/v1/workspace/summary`
- `GET /api/docs`

Additional module APIs are documented alongside their packages (Store, Marketplace, Discovery, Knowledge, Trust).
