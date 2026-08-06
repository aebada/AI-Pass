"""FastAPI OCR wrapper for Baidu Unlimited-OCR."""

from __future__ import annotations

import os
import shutil
import time
from typing import Annotated

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .inference import infer_document, is_live_inference_configured, stub_infer
from .pdf_utils import image_bytes_to_temp_path, normalize_image_bytes, pdf_to_png_paths

load_dotenv()

app = FastAPI(title="AI-Pass OCR Service", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str
    engine: str
    stub_mode: bool
    inference_configured: bool


class ExtractResponse(BaseModel):
    rawText: str
    provider: str
    engine: str
    pageCount: int
    creditsUsed: int
    latencyMs: int


def _require_api_key(authorization: str | None = None) -> None:
    expected = os.getenv("OCR_SERVICE_API_KEY", "").strip()
    if not expected:
        return
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing OCR service API key")
    token = authorization.removeprefix("Bearer ").strip()
    if token != expected:
        raise HTTPException(status_code=403, detail="Invalid OCR service API key")


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    stub_mode = os.getenv("OCR_STUB_MODE", "0") == "1" or not is_live_inference_configured()
    return HealthResponse(
        status="ok",
        engine="baidu/Unlimited-OCR",
        stub_mode=stub_mode,
        inference_configured=is_live_inference_configured(),
    )


@app.post("/ocr/extract", response_model=ExtractResponse)
async def extract(
    file: UploadFile = File(...),
    fileName: Annotated[str | None, Form()] = None,
    mimeType: Annotated[str | None, Form()] = None,
    prompt: Annotated[str | None, Form()] = None,
    imageMode: Annotated[str | None, Form()] = None,
    authorization: Annotated[str | None, Header()] = None,
) -> ExtractResponse:
    _require_api_key(authorization)

    started = time.perf_counter()
    resolved_name = fileName or file.filename or "document.pdf"
    resolved_mime = mimeType or file.content_type or "application/octet-stream"
    stub_mode = os.getenv("OCR_STUB_MODE", "0") == "1" or not is_live_inference_configured()

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file")

    tmp_dirs: list[str] = []
    image_paths: list[str] = []

    try:
        if resolved_mime == "application/pdf" or resolved_name.lower().endswith(".pdf"):
            dpi = int(os.getenv("OCR_PDF_DPI", "300"))
            image_paths, tmp_dir = pdf_to_png_paths(file_bytes, dpi=dpi)
            tmp_dirs.append(tmp_dir)
            page_count = len(image_paths)
            resolved_prompt = prompt or "<image>Multi page parsing."
            mode = "base"
            ngram_window = 1024
        else:
            normalized = normalize_image_bytes(file_bytes)
            suffix = ".png" if not resolved_name.lower().endswith((".jpg", ".jpeg")) else ".jpg"
            image_path, tmp_dir = image_bytes_to_temp_path(normalized, suffix=suffix)
            tmp_dirs.append(tmp_dir)
            image_paths = [image_path]
            page_count = 1
            resolved_prompt = prompt or "<image>document parsing."
            mode = imageMode or os.getenv("OCR_DEFAULT_IMAGE_MODE", "gundam")
            ngram_window = 128

        if stub_mode:
            raw_text = stub_infer(
                file_name=resolved_name,
                mime_type=resolved_mime,
                page_count=page_count,
            )
        else:
            raw_text = await infer_document(
                prompt=resolved_prompt,
                image_paths=image_paths,
                image_mode=mode,
                ngram_window=ngram_window,
            )

        latency_ms = int((time.perf_counter() - started) * 1000)
        credits = 12 if page_count > 1 else 10

        return ExtractResponse(
            rawText=raw_text,
            provider="stub" if stub_mode else "unlimited-ocr",
            engine="baidu/Unlimited-OCR",
            pageCount=page_count,
            creditsUsed=credits,
            latencyMs=latency_ms,
        )
    finally:
        for tmp_dir in tmp_dirs:
            shutil.rmtree(tmp_dir, ignore_errors=True)


def main() -> None:
    import uvicorn

    host = os.getenv("OCR_HOST", "0.0.0.0")
    port = int(os.getenv("OCR_PORT", "8100"))
    uvicorn.run("app.main:app", host=host, port=port, reload=False)


if __name__ == "__main__":
    main()
