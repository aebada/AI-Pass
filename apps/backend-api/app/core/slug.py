"""Slug helpers.

Convention (matches the lowercase-dash slugs used elsewhere, e.g. organization
slugs in ``packages/platform-core``): lowercase ASCII, words of ``a-z`` / ``0-9``
joined by single hyphens, no leading or trailing hyphen.
"""
from __future__ import annotations

import re

SLUG_MAX_LENGTH = 140

_SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
_SEPARATOR_RE = re.compile(r"[^a-z0-9]+")


def slugify(value: str) -> str:
    """Best-effort slug from free text. Non-ASCII characters are dropped."""
    value = _SEPARATOR_RE.sub("-", value.strip().lower())
    return value.strip("-")[:SLUG_MAX_LENGTH]


def is_valid_slug(value: str) -> bool:
    return bool(value) and len(value) <= SLUG_MAX_LENGTH and _SLUG_RE.match(value) is not None
