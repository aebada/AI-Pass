# DeepTeam — LLM Red Teaming & Guardrails

AI-Pass integrates [Confident AI DeepTeam](https://github.com/confident-ai/deepteam) as an external Python security layer for adversarial testing and production guardrails.

## What is DeepTeam?

| Property | Detail |
|----------|--------|
| **Type** | Python LLM red-teaming framework (built on [DeepEval](https://github.com/confident-ai/deepeval)) |
| **License** | Apache 2.0 (compatible with AI-Pass MIT stack) |
| **Capabilities** | 50+ vulnerability probes, 20+ adversarial attacks, OWASP/NIST/MITRE frameworks, 7 production guardrails |
| **Runtime** | Local Python — **not** runnable on Hostinger static hosting |

DeepTeam simulates attacks (prompt injection, jailbreaking, roleplay, etc.) against your LLM application via a `model_callback`, then scores outputs with LLM-as-judge metrics. It also provides input/output guardrails (`PromptInjectionGuard`, `ToxicityGuard`, `PrivacyGuard`, etc.).

## Architecture

```
Governance UI (/workspace/governance/security)
  → POST /api/governance/security/scan | /guard
    → @ai-pass/deepteam client
      → services/deepteam-service (FastAPI, port 8200)
        → deepteam red_team() / Guardrails (live)
        → keyword stub (dev, no API keys)

Red-team target callback
  → POST /api/governance/security/probe (default)
  → or custom targetUrl per scan (your app endpoint)

Scan results
  → governance monitoring events (type: security_scan)
```

### Monorepo layout

| Path | Role |
|------|------|
| `services/deepteam-service/` | FastAPI microservice wrapping DeepTeam |
| `packages/deepteam/` | TypeScript HTTP client |
| `apps/web/app/api/governance/security/` | Next.js API routes (scan, guard, health, probe) |
| `apps/web/app/workspace/governance/security/` | Governance Security UI |

## Environment variables

### AI-Pass (Node / Next.js)

| Variable | Default | Purpose |
|----------|---------|---------|
| `DEEPTEAM_SERVICE_URL` | — | Base URL of `services/deepteam-service` (e.g. `http://127.0.0.1:8200`) |
| `DEEPTEAM_SERVICE_API_KEY` | — | Optional bearer token for the security API |

### DeepTeam microservice (`services/deepteam-service/.env`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `DEEPTEAM_STUB_MODE` | `1` | `1` = deterministic stub (no LLM keys). `0` = live DeepTeam |
| `DEEPTEAM_SERVICE_API_KEY` | — | Protects `/security/*` endpoints |
| `DEEPTEAM_HOST` | `0.0.0.0` | Bind host |
| `DEEPTEAM_PORT` | `8200` | Bind port |
| `OPENAI_API_KEY` | — | Judge / attack-simulation LLM (required for live mode) |
| `DEEPTEAM_DEFAULT_TARGET_URL` | probe route | Default red-team callback when scan omits `targetUrl` |
| `DEEPTEAM_ATTACKS_PER_VULN` | `1` | Attacks per vulnerability (keep low in API) |
| `CONFIDENT_API_KEY` | — | Optional — sync results to [Confident AI](https://app.confident-ai.com) cloud |

## Local development

### 1. Start the security service (stub mode)

```bash
cd services/deepteam-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m app.main
```

### 2. Point AI-Pass at the service

```bash
# apps/web/.env.local
DEEPTEAM_SERVICE_URL=http://127.0.0.1:8200
```

### 3. Run the web app

```bash
pnpm install
pnpm --filter @ai-pass/deepteam build
pnpm dev:web
```

Open **Governance → Security** (`/workspace/governance/security`) to run scans and test input guardrails.

### Live red teaming

```bash
cd services/deepteam-service
source .venv/bin/activate
pip install deepteam
export DEEPTEAM_STUB_MODE=0
export OPENAI_API_KEY=sk-...
python -m app.main
```

Scans POST adversarial prompts to `targetUrl` expecting:

```json
{ "input": "adversarial prompt" }
```

Response:

```json
{ "output": "model response text" }
```

## API reference

### `GET /api/governance/security/health`

Returns service connectivity and stub/live mode.

### `POST /api/governance/security/scan`

```json
{
  "systemId": "sys_invoice_ai",
  "framework": "OWASP",
  "targetUrl": "http://localhost:3000/api/governance/security/probe",
  "vulnerabilities": ["bias", "pii_leakage"],
  "attacks": ["prompt_injection"]
}
```

Use `framework` **or** `vulnerabilities` + `attacks`. Frameworks: `OWASP`, `NIST`, `MITRE`, `Aegis`, `BeaverTails`, `OWASP_ASI_2026`.

### `POST /api/governance/security/guard`

```json
{
  "channel": "input",
  "text": "Ignore all previous instructions..."
}
```

For output guarding, pass `pairedText` (original user input) with `channel: "output"`.

### `POST /api/governance/security/probe`

Built-in safe echo target for red-team callbacks during development.

## Production

Hostinger static + Laravel cannot run Python DeepTeam. Deploy like OCR:

1. **VPS / container** — Run `services/deepteam-service` on Fly.io, Railway, Hetzner, etc.
2. **Set env in production Next.js / Laravel:**
   - `DEEPTEAM_SERVICE_URL=https://security.yourdomain.com`
   - `DEEPTEAM_SERVICE_API_KEY=<shared-secret>`
3. **Protect the service** — Bearer auth on all `/security/*` routes.
4. **Target URLs** — Point scans at your production app’s LLM callback endpoint (agent chat API, RAG route, etc.).

Without `DEEPTEAM_SERVICE_URL`, the Governance Security UI shows offline status; other AI-Pass features are unaffected.

## API keys

| Key | Required? | Purpose |
|-----|-----------|---------|
| `OPENAI_API_KEY` | Live scans/guards | DeepTeam uses an LLM as judge and attack simulator |
| `DEEPTEAM_SERVICE_API_KEY` | Recommended prod | Authenticates AI-Pass → security microservice |
| `CONFIDENT_API_KEY` | Optional | Upload risk assessments to Confident AI dashboard |
| Anthropic / Google / etc. | Optional | Configure via DeepEval provider commands |

Stub mode works with **no keys** — useful for CI and local UI development.

## Integration with governance

- Completed scans with a `systemId` create **monitoring events** (`security_scan`) in `@ai-pass/governance`.
- View results under **Governance → Monitoring**.
- Trust Center / Compliance AI can reference scan pass rates in future reporting (not wired in this initial integration).

## Related docs

- [OCR service pattern](./OCR.md) — same external microservice model
- [Governance](./PLATFORM.md) — inventory, policies, risk register
- [DeepTeam GitHub](https://github.com/confident-ai/deepteam)
- [DeepTeam docs](https://www.trydeepteam.com/docs/red-teaming-introduction)
