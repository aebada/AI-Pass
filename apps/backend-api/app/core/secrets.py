"""Heuristic detection of credentials pasted into free-text agent configuration.

Agent config is visible to every workspace reader and copied into immutable
version snapshots, so a leaked key would be impossible to scrub. These patterns
target well-known key formats and stay narrow to avoid rejecting normal prose.
"""
from __future__ import annotations

import re

_SECRET_PATTERNS = [
    re.compile(r"\bsk-(?:ant-|proj-|live-|test-)?[A-Za-z0-9_-]{20,}"),  # OpenAI / Anthropic / Stripe
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),  # AWS access key id
    re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b"),  # Google API key
    re.compile(r"\bgh[pousr]_[A-Za-z0-9]{36,}\b"),  # GitHub token
    re.compile(r"\bxox[abpors]-[A-Za-z0-9-]{10,}"),  # Slack token
    re.compile(r"\bhf_[A-Za-z0-9]{30,}\b"),  # Hugging Face token
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(r"\bBearer\s+[A-Za-z0-9._~+/-]{20,}=*", re.IGNORECASE),
]


def contains_secret(value: str) -> bool:
    return any(pattern.search(value) for pattern in _SECRET_PATTERNS)
