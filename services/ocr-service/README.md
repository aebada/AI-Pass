# AI-Pass OCR Service

Lightweight HTTP wrapper around [Baidu Unlimited-OCR](https://github.com/baidu/Unlimited-OCR). Model weights are **not** stored in this repo — inference runs on a separate GPU host via vLLM/SGLang, or in stub mode for local development.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service status |
| POST | `/ocr/extract` | Multipart OCR (`file`, optional `fileName`, `mimeType`, `prompt`, `imageMode`) |

## Quick start (stub mode, no GPU)

```bash
cd services/ocr-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m app.main
```

Set in AI-Pass:

```bash
OCR_PROVIDER=unlimited-ocr
OCR_SERVICE_URL=http://127.0.0.1:8100
```

## Live Unlimited-OCR (GPU)

1. Start vLLM on a GPU machine (pulls `baidu/Unlimited-OCR` from Hugging Face at runtime):

```bash
docker pull vllm/vllm-openai:unlimited-ocr
docker run --gpus all -p 8000:8000 vllm/vllm-openai:unlimited-ocr \
  --model baidu/Unlimited-OCR --served-model-name Unlimited-OCR
```

2. Point the API wrapper at inference:

```bash
export OCR_STUB_MODE=0
export OCR_INFERENCE_URL=http://127.0.0.1:8000/v1
python -m app.main
```

Or use Docker Compose with the `full` profile (requires NVIDIA Container Toolkit):

```bash
OCR_STUB_MODE=0 docker compose --profile full up ocr-api ocr-inference
```

## Production (Hostinger static + Laravel)

Hostinger shared hosting cannot run GPU inference. Options:

1. **Recommended:** Run `ocr-api` + vLLM on a GPU VPS (Hetzner, RunPod, Baidu Cloud). Set `OCR_SERVICE_URL` in your Node/Laravel deployment to the public OCR API URL.
2. **Managed OCR:** Use [Baidu Cloud OCR](https://cloud.baidu.com/doc/OCR/s/fmr1p39gb) and adapt `OCR_INFERENCE_URL` to their API gateway.
3. **Dev/demo:** Keep `OCR_STUB_MODE=1` — Invoice AI falls back to deterministic stub text.

Protect the public OCR API with `OCR_SERVICE_API_KEY` and pass `Authorization: Bearer …` from AI-Pass.

## Submodule (optional)

To vendor upstream recipes without model weights:

```bash
git submodule add https://github.com/baidu/Unlimited-OCR.git services/ocr-service/vendor/Unlimited-OCR
```

Use upstream `infer.py` only on the GPU host — not required for the HTTP wrapper.
