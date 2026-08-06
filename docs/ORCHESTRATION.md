# AI Execution Orchestration

AI-Pass orchestration is the **plan → route → execute → evaluate** layer for multi-step AI work. The MVP ships as `@ai-pass/orchestration` on top of `@ai-pass/runtime-core`.

## Architecture

```
Workspace UI (/workspace/execution)
  → POST /api/v1/orchestration/plan
  → POST /api/v1/orchestration/execute
       ↓
  OrchestrationService (@ai-pass/orchestration)
       ↓
  ExecutionEngine (@ai-pass/runtime-core)
       ↓
  Provider Hub · Wallet · Skills · Workflows
```

| Layer | Package | Role |
|-------|---------|------|
| UI | `apps/web/app/workspace/execution/` | Goal input, plan review, execution logs |
| API | `apps/web/app/api/v1/orchestration/` | HTTP bridge for plan + execute |
| Service | `packages/orchestration/` | Thin facade over runtime-core |
| Engine | `packages/runtime-core/` | Planner, router, executor, evaluator |

## Static hosting (demo mode)

On static FTP deploy (`STATIC_EXPORT=1`), API routes are stripped at build time. The execution page detects unavailable APIs (404, 405, or HTML fallback) and uses `demoPlan()` / `demoExecution()` from `@ai-pass/orchestration` so the UI remains usable.

## API

### `POST /api/v1/orchestration/plan`

```json
{
  "input": {
    "goal": "Parse invoice PDF and recommend approval",
    "membershipTier": "professional",
    "userId": "user_123"
  }
}
```

Response: `{ "plan": { ... } }`

### `POST /api/v1/orchestration/execute`

```json
{
  "plan": { "...": "..." },
  "mode": "sequential",
  "outputFormat": "executive_summary"
}
```

Response: `{ "execution": { ... } }`

Legacy routes `/api/v1/runtime/plan` and `/api/v1/runtime/execute` remain for backward compatibility.

## Workspace navigation

Sidebar label: **AI Execution** (`/workspace/execution`), registered in `packages/platform-core/src/modules.ts`.

## Local development

```bash
pnpm install
pnpm --filter @ai-pass/orchestration build
pnpm dev:web
```

Open http://localhost:3000/workspace/execution

## Production (Node.js)

Deploy with `DEPLOY_NODE=1` so API routes are included. Orchestration uses runtime-core's execution engine with wallet deduction and provider routing.

## Related docs

- [RUNTIME-ARCHITECTURE.md](./RUNTIME-ARCHITECTURE.md) — planner, router, executor internals
- [AGENT-STUDIO.md](./AGENT-STUDIO.md) — agent-specific execution history
- [INVOICE-AI-PLATFORM.md](./INVOICE-AI-PLATFORM.md) — domain orchestrator example
