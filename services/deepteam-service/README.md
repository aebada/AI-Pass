# AI-Pass DeepTeam Security Service

HTTP wrapper around [Confident AI DeepTeam](https://github.com/confident-ai/deepteam) for LLM red teaming and production guardrails.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service status |
| POST | `/security/scan` | Run red-team assessment against a target callback URL |
| POST | `/security/guard` | Guard LLM input or output (prompt injection, toxicity, PII) |

## Quick start (stub mode, no API keys)

```bash
cd services/deepteam-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m app.main
```

Set in AI-Pass:

```bash
DEEPTEAM_SERVICE_URL=http://127.0.0.1:8200
```

## Live red teaming

```bash
pip install deepteam
export DEEPTEAM_STUB_MODE=0
export OPENAI_API_KEY=sk-...
python -m app.main
```

Scan requests POST adversarial prompts to `targetUrl` (default: AI-Pass probe route) expecting `{"output": "..."}`.

## Production

Hostinger static hosting cannot run Python. Deploy this service on a VPS or container platform and set `DEEPTEAM_SERVICE_URL` in Next.js/Laravel.

Protect the API with `DEEPTEAM_SERVICE_API_KEY`.

See [docs/DEEPTEAM.md](../../docs/DEEPTEAM.md).
