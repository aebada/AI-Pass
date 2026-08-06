# AI-Pass Model Hub

**One workspace. One membership. One AI wallet. All AI models.**

Model Hub is the central registry and control plane for every model on the AI-Pass platform — proprietary AI-Pass models, third-party cloud APIs, open-source/local runtimes, and customer private endpoints.

## Architecture

```
packages/model-hub/              # @ai-pass/model-hub — shared registry package
├── src/types.ts               # ModelRecord, filters, routing, governance types
├── src/registry.ts            # MODEL_REGISTRY (47 models), ROUTING_RULES, ModelRegistry
├── src/router.ts              # resolveModel(), autoRoute(), ModelRouter
├── src/catalog.ts             # getModels(), getModelById(), UI helpers
├── src/legacy-api.ts          # getModel() snake_case bridge for detail pages
├── src/membership.ts          # Plan gates + canAccessModel()
├── src/wallet.ts              # Credit estimation + deduction stubs
├── src/trust.ts               # Trust scores + ranking
├── src/byo-keys.ts            # BYOK localStorage (static export)
├── src/compare.ts             # Model comparison for benchmarks
└── src/governance.ts          # Org allow/block policies

apps/web/app/workspace/model-hub/
├── layout.tsx + ModelHubShell  # Subnav + WorkspaceLayoutClient
├── page.tsx                    # Catalog dashboard with filters
├── aipass/                     # AI-Pass model family (9 models)
├── providers/                  # Third-party grid
├── open-source/                # Ollama/vLLM connect (localStorage)
├── private/                    # Custom endpoints (localStorage)
├── routing/                    # Routing mode preview + rules
├── governance/                   # Policy simulator
├── keys/                       # BYO API keys
├── benchmarks/                 # Side-by-side compare
├── fine-tuning/                # Placeholder (Enterprise gate)
├── monitoring/                 # Placeholder
└── [modelId]/                  # Model detail page

apps/web/app/api/model-hub/
├── catalog/route.ts            # GET filtered catalog
├── route/route.ts              # POST autoRoute preview
└── keys/route.ts               # POST test connection stub
```

### Integration

| Consumer | Integration |
|----------|-------------|
| **Playground** | `getModels()` / `getModelById()` from `@ai-pass/model-hub` |
| **Provider Hub** | `model-hub-bridge.ts` → `resolveModel()` for all routing |
| **AI Wallet** | `estimateRequestCredits()` + credit fields on `ModelRecord.pricing` |
| **Platform nav** | `model-hub` module in `platform-core` (`navOrder: 2.1`) |
| **Static export** | BYOK keys, open-source/private endpoints, routing mode in `localStorage` |

## Model categories (47 total)

| Category | Count | Examples |
|----------|-------|----------|
| `aipass` | 9 | General, Enterprise, Finance, Supply, HR, Legal, Analyst, Compliance, Support |
| `provider` | ~28 | GPT-4o, Claude Sonnet 4, Gemini, DeepSeek, Mistral, Grok, Groq, OpenRouter |
| `open-source` | ~6 | Llama, Qwen, Together, vLLM, LM Studio, Ollama |
| `private` | ~4 | Azure OpenAI, AWS Bedrock, Vertex AI, on-prem |

## Package exports

```typescript
import {
  getModels,
  getModelById,
  resolveModelRoute,
  autoRoute,
  MODEL_REGISTRY,
  AIPASS_MODELS,
  ROUTING_RULES,
} from '@ai-pass/model-hub';
```

## Build

```bash
pnpm --filter @ai-pass/model-hub build
pnpm --filter @ai-pass/web build
# Static export (moves API routes aside):
./scripts/build-web-static.sh
./scripts/deploy-ftp.sh
```

## Testing

1. **Sidebar** — `/workspace` → **Model Hub** appears after AI Playground
2. **Catalog** — `/workspace/model-hub` — filter by provider, tier, capabilities
3. **AI-Pass** — `/workspace/model-hub/aipass` — 9 family cards
4. **Playground** — Launch any model; URL `?model=` pre-selects dropdown
5. **Open-source** — Save Ollama connection (persists in localStorage)
6. **Routing** — `/workspace/model-hub/routing` — change mode, see live preview
7. **API** (Node deploy) — `GET /api/model-hub/catalog?category=aipass`

## Roadmap

- Fine-Tuning Studio — training pipeline
- Model Monitoring — live latency/error dashboards
- Server-side persistence for routing rules and private endpoints
- Provider Hub health sync into monitoring tab
