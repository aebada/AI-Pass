"""Call Unlimited-OCR via OpenAI-compatible vLLM/SGLang endpoint."""

from __future__ import annotations

import os
from typing import Iterable

import httpx


def _inference_url() -> str | None:
    url = os.getenv("OCR_INFERENCE_URL", "").strip().rstrip("/")
    return url or None


def _model_name() -> str:
    return os.getenv("OCR_INFERENCE_MODEL", "Unlimited-OCR")


def is_live_inference_configured() -> bool:
    return _inference_url() is not None


async def infer_document(
    *,
    prompt: str,
    image_paths: Iterable[str],
    image_mode: str,
    ngram_window: int,
) -> str:
    base = _inference_url()
    if not base:
        raise RuntimeError("OCR_INFERENCE_URL is not configured")

    headers = {"Content-Type": "application/json"}
    api_key = os.getenv("OCR_INFERENCE_API_KEY", "").strip()
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    from .pdf_utils import build_openai_content

    payload = {
        "model": _model_name(),
        "messages": [{"role": "user", "content": build_openai_content(prompt, image_paths)}],
        "temperature": 0,
        "stream": False,
        "images_config": {"image_mode": image_mode},
    }

    # SGLang custom logit processor params (ignored by plain vLLM)
    payload["custom_params"] = {"ngram_size": 35, "window_size": ngram_window}

    timeout = httpx.Timeout(1200.0, connect=30.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(f"{base}/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()

    choices = data.get("choices") or []
    if not choices:
        return ""
    message = choices[0].get("message") or {}
    return str(message.get("content") or "")


def stub_infer(*, file_name: str, mime_type: str, page_count: int) -> str:
    base = file_name.rsplit(".", 1)[0].lower()
    vendor = "Acme Supplies GmbH" if "acme" in base else "Unknown Vendor"
    return (
        f"# Document parsing (stub)\n\n"
        f"File: {file_name}\n"
        f"MIME: {mime_type}\n"
        f"Pages: {page_count}\n\n"
        f"Vendor: {vendor}\n"
        f"Invoice Number: INV-2026-{abs(hash(file_name)) % 9000 + 1000}\n"
        f"Date: 2026-07-05\n"
        f"Total: EUR 1,234.56\n\n"
        f"This is stub OCR output. Set OCR_INFERENCE_URL to a GPU Unlimited-OCR server for live parsing."
    )
