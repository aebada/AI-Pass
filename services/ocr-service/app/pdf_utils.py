"""PDF and image helpers for Unlimited-OCR requests."""

from __future__ import annotations

import io
import os
import tempfile
from typing import Iterable

import fitz
from PIL import Image


def pdf_to_png_paths(pdf_bytes: bytes, dpi: int = 300) -> tuple[list[str], str]:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    tmp_dir = tempfile.mkdtemp(prefix="aipass_ocr_")
    matrix = fitz.Matrix(dpi / 72, dpi / 72)
    paths: list[str] = []
    for index, page in enumerate(doc):
        out = os.path.join(tmp_dir, f"page_{index + 1:04d}.png")
        page.get_pixmap(matrix=matrix).save(out)
        paths.append(out)
    doc.close()
    return paths, tmp_dir


def image_bytes_to_temp_path(image_bytes: bytes, suffix: str = ".png") -> tuple[str, str]:
    tmp_dir = tempfile.mkdtemp(prefix="aipass_ocr_")
    path = os.path.join(tmp_dir, f"image{suffix}")
    with open(path, "wb") as handle:
        handle.write(image_bytes)
    return path, tmp_dir


def encode_image_base64(path: str) -> dict:
    ext = os.path.splitext(path)[1].lower()
    mime = "image/jpeg" if ext in (".jpg", ".jpeg") else f"image/{ext.lstrip('.')}"
    with open(path, "rb") as handle:
        import base64

        data = base64.b64encode(handle.read()).decode("utf-8")
    return {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{data}"}}


def build_openai_content(prompt: str, image_paths: Iterable[str]) -> list[dict]:
    return [{"type": "text", "text": prompt}, *[encode_image_base64(path) for path in image_paths]]


def normalize_image_bytes(image_bytes: bytes) -> bytes:
    """Convert exotic image formats to PNG bytes when needed."""
    with Image.open(io.BytesIO(image_bytes)) as image:
        if image.format and image.format.upper() in {"PNG", "JPEG", "JPG", "WEBP"}:
            return image_bytes
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        return buffer.getvalue()
