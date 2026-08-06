# Agent Architecture — Strategic Adoption Plan

AI-Pass is an **enterprise AI OS**. Agent infrastructure is a first-class platform layer — not a chatbot builder. Internal frameworks (Strands, LangGraph, etc.) are **implementation details** behind `@ai-pass/agent-core`, `@ai-pass/runtime-core`, and `@ai-pass/agent-studio`.

## Strategic Positioning

```
Workspace → Playground → Model Hub → Agent Studio → Workflow → LiveSync
    → Knowledge → Analysis → Marketplace → Apps → Trust → Compliance → Governance
                              ↑
                    @ai-pass/agent-core
                    (config · registry · lifecycle · observability · remote)
```

| Layer | Package | Role |
|-------|---------|------|
| UI | `apps/web/app/workspace/agents/` | Dashboard, wizard, execution console |
| Studio services | `@ai-pass/agent-studio` | CRUD, skills, workflows, publishing, monitoring |
| **Agent framework** | `@ai-pass/agent-core` | Config repository, lifecycle interface, registry, observability, remote design |
| Execution engine | `@ai-pass/runtime-core` | Plan → route → execute → evaluate |
| Orchestration facade | `@ai-pass/orchestration` | HTTP/API bridge for multi-step AI work |
| Domain verticals | `invoice-ai`, `supply-chain-ai`, etc. | Domain agents extending GenericAgent |

## Requirements Mapping

### 1. Agent Configuration Repository (centralized)

**Package:** `@ai-pass/agent-core` → `AgentConfigurationRepository`

Each agent stores a canonical `AgentConfig`:

| Field | Purpose |
|-------|---------|
| `model` | Primary/fallback models, temperature, tier preferences |
| `mcp` | MCP server IDs, allowed/denied tools |
| `skills` | Skill bindings with version and config |
| `moderation` | Safety guardrails, human-review thresholds |
| `memory` | Session TTL, knowledge base IDs |
| `env` | Runtime environment variables |
| `routingRules` | Conditional routing to model/skill/workflow/tool/remote |
| `permissions` | Scope grants and approval requirements |
| `tools` | Tool allowlist and concurrency limits |
| `versionHistory` | Immutable config snapshots |

**Adapters:**

- `InMemoryAgentConfigStorage` — server bootstrap, tests
- `LocalStorageAgentConfigAdapter` — static/demo deployments
- Future: PostgreSQL / S3-backed adapter via Agent Studio API

### 2. Generic Agent Framework

**Package:** `@ai-pass/agent-core` → `GenericAgent`, domain stubs

```
AbstractAgent (lifecycle contract)
    └── GenericAgent (reusable default)
            ├── InvoiceAgent
            ├── HrAgent
            ├── SupplyChainAgent
            └── … (vertical packages override hooks)
```

Domain agents live in vertical packages (`@ai-pass/invoice-ai`, etc.) and extend `GenericAgent` or `AbstractAgent`.

### 3. Abstract Agent Base Class

**Package:** `@ai-pass/agent-core` → `AbstractAgent` / `IAgent`

Lifecycle methods:

```
initialize() → plan() → reason() → execute() → validate() → evaluate() → complete()
                                                      ↓ (on failure)
                                                  rollback()
```

Each method returns `AgentStepResult` with phase, success, output, and partial metrics. Production wiring delegates `plan`/`execute`/`evaluate` to `@ai-pass/runtime-core`.

### 4. Agent Registry (expand Agent Studio)

**Package:** `@ai-pass/agent-core` → `AgentRegistry`

Registry entries (`AgentRegistryEntry`) include:

- Installed config + version
- Supported models and skills
- Dependencies (skills, tools, workflows)
- Trust score
- Usage stats (executions, latency, credits, cost)
- Source: `local` | `marketplace` | `remote` | `builtin`

**Integration:** `@ai-pass/agent-studio` `AgentService` remains the Studio CRUD layer. `AgentRegistry` adds enterprise metadata and syncs from `AgentConfigurationRepository`. The deprecated `AgentRegistry` alias in agent-studio will migrate to agent-core over time.

### 5. Remote Agent Support (design)

**Package:** `@ai-pass/agent-core` → `remote-executor.ts`

| Environment | Target | Use case |
|-------------|--------|----------|
| `cloud` | AI-Pass managed cloud | Default SaaS execution |
| `edge` | Regional edge nodes | Low-latency, data residency |
| `customer` | On-premises / VPC | Regulated industries |
| `worker` | Async worker pool | Long-running batch agents |

`StubRemoteAgentExecutor` accepts targets; HTTP/gRPC bridge deferred to Phase 3.

### 6. Agent Observability

**Package:** `@ai-pass/agent-core` → `AgentObservabilityCollector`

Tracks per execution:

- Execution time (total + phase breakdown)
- Token usage (input/output/total)
- Provider and model
- Cost (USD) and credits
- Retries and failures
- Confidence score
- Tool usage (count, latency per tool)
- API latency
- Human escalations

Feeds Agent Studio monitoring (`MonitoringService`) and registry usage stats.

## Module Mapping

| Existing module | Relationship to agent-core |
|-----------------|--------------------------|
| `packages/orchestration` | Thin API facade; does not own agent config |
| `packages/runtime-core` | Engine behind `plan()` / `execute()` / `evaluate()` |
| `packages/agent-studio` | Studio services; consumes agent-core types |
| `apps/web/lib/agents-library.ts` | Wizard localStorage; maps to `AgentConfig` via `createAgentConfigFromWizard` |
| `packages/platform-core/modules.ts` | `agents` + `agent-studio` workspace modules |
| Vertical packages | Domain agents extend `GenericAgent` |

## Phased Rollout

### Phase 1 — MVP (current)

- [x] `@ai-pass/agent-core` package with types, interfaces, stubs
- [x] `AgentConfigurationRepository` (in-memory + localStorage)
- [x] `AgentRegistry` with usage recording
- [x] `AgentObservabilityCollector`
- [x] Remote execution design types
- [x] `createAgentConfigFromWizard` adapter for Agent Studio wizard
- [x] This document

### Phase 2 — Studio integration

- Wire `AgentService` to sync with `AgentConfigurationRepository`
- Connect `ExecutionService` lifecycle to `AbstractAgent` methods
- Feed `MonitoringService` from `AgentObservabilityCollector`
- Persist configs via `/api/v1/agents` (replace in-memory-only paths)
- Register domain agents from vertical packages in `AgentRegistry`

### Phase 3 — Production

- Server-backed config repository (PostgreSQL + version history API)
- Remote executor HTTP/gRPC bridge with auth (JWT, mTLS, OAuth)
- Trust score computation from observability + Trust Engine
- Marketplace publish flow writes to registry with `source: 'marketplace'`
- Governance gates on `permissions` and `moderation` before execution

### Phase 4 — Enterprise

- Multi-tenant config isolation
- Edge and customer-environment agent runners
- Workflow orchestration across remote targets
- Compliance audit trail from observability events
- Agent dependency graph visualization in Agent Studio

## Local Development

```bash
pnpm install
pnpm --filter @ai-pass/agent-core build
pnpm --filter @ai-pass/agent-studio build
pnpm dev:web
```

Open http://localhost:3000/workspace/agents

## Related Docs

- [AGENT-STUDIO.md](./AGENT-STUDIO.md) — Studio services and UI
- [ORCHESTRATION.md](./ORCHESTRATION.md) — Plan/execute API layer
- [RUNTIME-ARCHITECTURE.md](./RUNTIME-ARCHITECTURE.md) — Execution engine internals
