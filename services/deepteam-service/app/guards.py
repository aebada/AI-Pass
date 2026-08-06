"""Input/output guardrails — DeepTeam live mode or keyword stub."""

from __future__ import annotations

import os
import re
import time
import uuid
from typing import Any

from .scanner import is_stub_mode

INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(previous|prior)\s+instructions", re.I),
    re.compile(r"system\s+prompt", re.I),
    re.compile(r"jailbreak", re.I),
    re.compile(r"you\s+are\s+now\s+dan", re.I),
]

TOXIC_PATTERNS = [
    re.compile(r"\b(kill|murder|hate)\b", re.I),
]

PII_PATTERNS = [
    re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
    re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
]


def _stub_guard(*, channel: str, text: str, paired_text: str | None) -> dict[str, Any]:
    content = text or ""
    breached = False
    reasons: list[str] = []
    guards_run = ["PromptInjectionGuard", "ToxicityGuard", "PrivacyGuard"]

    if channel == "input":
        for pattern in INJECTION_PATTERNS:
            if pattern.search(content):
                breached = True
                reasons.append("prompt_injection_detected")
                break
        for pattern in PII_PATTERNS:
            if pattern.search(content):
                breached = True
                reasons.append("pii_in_input")
                break
    else:
        for pattern in TOXIC_PATTERNS:
            if pattern.search(content):
                breached = True
                reasons.append("toxicity_detected")
                break
        for pattern in PII_PATTERNS:
            if pattern.search(content):
                breached = True
                reasons.append("pii_in_output")
                break

    return {
        "guardId": f"guard_stub_{uuid.uuid4().hex[:10]}",
        "mode": "stub",
        "channel": channel,
        "breached": breached,
        "reasons": reasons,
        "guards": guards_run,
        "input": paired_text if channel == "output" else text,
        "output": text if channel == "output" else None,
    }


def _live_guard(*, channel: str, text: str, paired_text: str | None) -> dict[str, Any]:
    from deepteam import Guardrails  # type: ignore
    from deepteam.guardrails import (  # type: ignore
        PrivacyGuard,
        PromptInjectionGuard,
        ToxicityGuard,
    )

    guardrails = Guardrails(
        input_guards=[PromptInjectionGuard(), PrivacyGuard()],
        output_guards=[ToxicityGuard(), PrivacyGuard()],
    )

    if channel == "input":
        result = guardrails.guard_input(text)
    else:
        result = guardrails.guard_output(input=paired_text or "", output=text)

    return {
        "guardId": f"guard_{uuid.uuid4().hex[:10]}",
        "mode": "live",
        "channel": channel,
        "breached": bool(getattr(result, "breached", False)),
        "reasons": list(getattr(result, "reasons", []) or []),
        "guards": ["PromptInjectionGuard", "PrivacyGuard", "ToxicityGuard"],
        "input": paired_text if channel == "output" else text,
        "output": text if channel == "output" else None,
    }


def run_guard(
    *,
    channel: str,
    text: str,
    paired_text: str | None = None,
) -> dict[str, Any]:
    started = time.perf_counter()
    if channel not in {"input", "output"}:
        raise ValueError("channel must be 'input' or 'output'")
    if not text.strip():
        raise ValueError("text is required")

    if is_stub_mode():
        payload = _stub_guard(channel=channel, text=text, paired_text=paired_text)
    else:
        payload = _live_guard(channel=channel, text=text, paired_text=paired_text)

    payload["latencyMs"] = int((time.perf_counter() - started) * 1000)
    return payload
