# OCR — Baidu Unlimited-OCR Integration

AI-Pass integrates [Baidu Unlimited-OCR](https://github.com/baidu/Unlimited-OCR) as an optional GPU-backed document parser for Invoice AI and other workspace apps.

## What is Unlimited-OCR?

| Property | Detail |
|----------|--------|
| **Type** | Python deep-learning vision-language OCR model |
| **Model** | `baidu/Unlimited-OCR` on Hugging Face |
| **Stack** | PyTorch, Transformers, vLLM, or SGLang |
| **License** | MIT |
| **Hardware** | NVIDIA GPU (CUDA) required for live inference |
| **Strength** | One-shot long-horizon parsing of multi-page PDFs and complex layouts |

Unlimited-OCR is **not** a hosted REST API by itself. It exposes Python inference APIs and OpenAI-compatible endpoints via vLLM/SGLang. AI-Pass wraps it in a small FastAPI microservice.

## Architecture

```
Invoice upload (Next.js / mobile)
  → POST /api/v1/invoice-ai/upload
    → @ai-pass/invoice-ai (OCR_PROVIDER=unlimited-ocr)
      → @ai-pass/ocr client
        → services/ocr-service (FastAPI, port 8100)
          → vLLM/SGLang OpenAI API (GPU host, port 8000)
            → baidu/Unlimited-OCR (weights pulled at runtime — not in git)

Post-OCR structured analysis
  → provider-hub (extraction task, PII masking, field enrichment)
  → validation / fraud / compliance engines
```

### Monorepo layout

| Path | Role |
|------|------|
| `packages/ocr` | TypeScript HTTP client + invoice field heuristics |
| `packages/invoice-ai/src/ocr/` | Provider factory (`stub`, `unlimited-ocr`, cloud stubs) |
| `services/ocr-service/` | FastAPI wrapper (PDF → images → inference) |
| `apps/web/.../api/v1/ocr/extract` | Optional direct OCR proxy route |

Model weights are **never committed**. vLLM/SGLang downloads `baidu/Unlimited-OCR` on first run.

## Environment variables

### AI-Pass (Node / Next.js)

| Variable | Default | Purpose |
|----------|---------|---------|
| `OCR_PROVIDER` | `stub` | Set to `unlimited-ocr` to enable the microservice provider |
| `OCR_SERVICE_URL` | — | Base URL of `services/ocr-service` (e.g. `http://127.0.0.1:8100`) |
| `OCR_SERVICE_API_KEY` | — | Optional bearer token for the OCR API |

Add to `apps/web/.env.local` for local dev:

```bash
OCR_PROVIDER=unlimited-ocr
OCR_SERVICE_URL=http://127.0.0.1:8100
```

### OCR microservice (`services/ocr-service/.env`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `OCR_STUB_MODE` | `0` | `1` = deterministic stub (no GPU) |
| `OCR_INFERENCE_URL` | — | vLLM/SGLang base URL (e.g. `http://127.0.0.1:8000/v1`) |
| `OCR_INFERENCE_MODEL` | `Unlimited-OCR` | Served model name |
| `OCR_INFERENCE_API_KEY` | — | Optional key for inference backend |
| `OCR_SERVICE_API_KEY` | — | Protects `/ocr/extract` |
| `OCR_PORT` | `8100` | API listen port |
| `OCR_PDF_DPI` | `300` | PDF rasterization quality |

## Local development

### 1. Stub mode (no GPU)

```bash
cd services/ocr-service
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# OCR_STUB_MODE=1 is set in .env.example
python -m app.main
```

In another terminal:

```bash
pnpm install
OCR_PROVIDER=unlimited-ocr OCR_SERVICE_URL=http://127.0.0.1:8100 pnpm dev:web
```

Upload an invoice at `/workspace/apps/invoice-ai/upload`.

### 2. Live Unlimited-OCR (GPU machine)

On a GPU host:

```bash
docker pull vllm/vllm-openai:unlimited-ocr
docker run --gpus all -p 8000:8000 vllm/vllm-openai:unlimited-ocr \
  --model baidu/Unlimited-OCR --served-model-name Unlimited-OCR
```

On your dev machine (or same GPU host):

```bash
cd services/ocr-service
export OCR_STUB_MODE=0
export OCR_INFERENCE_URL=http://127.0.0.1:8000/v1
python -m app.main
```

Or use Docker Compose with the `full` profile (see `services/ocr-service/docker-compose.yml`).

### 3. Direct OCR API test

```bash
curl -s http://127.0.0.1:8100/health | jq
curl -s -F "file=@invoice.pdf" http://127.0.0.1:8100/ocr/extract | jq .rawText
```

## Production (Hostinger static + Laravel auth)

Shared Hostinger hosting **cannot** run Unlimited-OCR inference (GPU + large model). Recommended setup:

1. **GPU VPS** — Run vLLM + `services/ocr-service` on Hetzner, RunPod, or Baidu Cloud.
2. **Set secrets** on the Node API host (or Laravel `.env` if you proxy uploads there):
   - `OCR_PROVIDER=unlimited-ocr`
   - `OCR_SERVICE_URL=https://ocr.yourdomain.com`
   - `OCR_SERVICE_API_KEY=<shared-secret>`
3. **Static export** — Invoice AI demo UI can stay static; OCR runs only when Node API routes are deployed (see `docs/MULTI-AI-SETUP.md`).
4. **Managed fallback** — [Baidu Cloud OCR](https://cloud.baidu.com/doc/OCR/s/fmr1p39gb) if self-hosting is too heavy.

Without `OCR_SERVICE_URL`, Invoice AI keeps using the built-in `stub` provider (filename-based demo extraction).

## Provider selection

```bash
# Demo / offline
OCR_PROVIDER=stub

# Unlimited-OCR microservice (stub or live depending on OCR_STUB_MODE)
OCR_PROVIDER=unlimited-ocr
OCR_SERVICE_URL=http://127.0.0.1:8100

# Legacy cloud placeholders (still stub-backed in this repo)
OCR_PROVIDER=google
OCR_PROVIDER=azure
```

Post-OCR field enrichment always routes through **provider-hub** when API keys are configured (`OPENAI_API_KEY`, `OPENROUTER_API_KEY`, etc.) — see `packages/invoice-ai/src/middleware/ai-middleware.ts`.

## Optional git submodule

To vendor upstream scripts without model weights:

```bash
git submodule add https://github.com/baidu/Unlimited-OCR.git services/ocr-service/vendor/Unlimited-OCR
```

Use upstream `infer.py` only on the GPU host; the HTTP wrapper does not require the submodule.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `OCR_SERVICE_URL is not configured` | Set env var or use `OCR_PROVIDER=stub` |
| `fileBuffer is required` | Ensure upload route reads multipart file bytes |
| Timeouts on large PDFs | Increase client timeout; use `base` image mode for multi-page |
| 503 on `/api/v1/ocr/extract` | OCR service not running or URL wrong |
| Out of GPU memory | Use vLLM image with correct CUDA variant; reduce concurrency |

## References

- [Unlimited-OCR GitHub](https://github.com/baidu/Unlimited-OCR)
- [vLLM recipe](https://recipes.vllm.ai/baidu/Unlimited-OCR)
- [Hugging Face model](https://huggingface.co/baidu/Unlimited-OCR)
- [Invoice AI architecture](./INVOICE-AI.md)
- [OCR service README](../services/ocr-service/README.md)
