# Auto models for agents

> Part of the [technical documentation](./README.md) set.

Agents without a pinned model run on **Auto (Standard)** — the smart default for the default agent, global agents, and custom agents where no specific model was selected.

**Effective:** 10 August 2026

## FAQ

### Which agents use auto models?

The default agent, other global agents and any custom agent you created where no specific model was selected, will run on Standard by August 10.

### Will this increase my bill?

No. Your bill will stay absolutely the same and then gradually reduce as we roll out new pricing optimisations in the auto models.

### Do I stay in control?

Yes, always. Standard is the smart default, not a lock-in. We are shipping two ways to tailor the model to your task:

1. **Model picker in the input bar** — switch models on the fly, even with the default agent (`/workspace/agents/execute`).
2. **Admin settings** (usage-based pricing plans) — restrict specific groups of models to certain users, user groups, or your whole workspace (`/workspace/agents/settings`).

## Implementation

| Piece | Location |
|-------|----------|
| Resolution + policy | `@ai-pass/agent-studio` → `auto-models.ts` |
| Execute routing | `ExecutionService` + `routeAgentModel()` |
| Picker UI | Agent Execute + Agent Wizard |
| Admin allowlists | Agent Settings → model access by group |

### Sentinel ids

- `auto` / unset → Standard lane (resolves to `gpt-5.6-luna` today)
- `auto-premium` → Premium lane (`gpt-5.6-terra`)
- `auto-frontier` → Frontier lane (`gpt-5.6-sol`)
- Any other catalog id → pinned model

### Override at run time

```http
POST /api/v1/agents/{id}/execute
{ "input": { "query": "..." }, "modelId": "kimi-k3" }
```

Omit `modelId` (or pass `auto`) to use the agent’s configured model / Standard auto.
