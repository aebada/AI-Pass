"""Limits and allowlists for agent model configuration.

Provider ids mirror ``HubProviderId`` in ``packages/provider-hub``. Model ids are
only shape-checked: the provider catalog changes too often to hard-code here.
"""
from __future__ import annotations

import re

SYSTEM_PROMPT_MAX_LENGTH = 20_000
CHANGE_NOTE_MAX_LENGTH = 500
MAX_BINDINGS = 50

PROVIDER_IDS = frozenset(
    {
        "openai",
        "anthropic",
        "gemini",
        "openrouter",
        "deepseek",
        "grok",
        "mistral",
        "llama",
        "qwen",
        "cerebras",
        "sambanova",
        "ollama",
        "huggingface",
        "together",
        "groq",
        "fireworks",
    }
)

MODEL_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:/@-]{0,127}$")
BINDING_ID_RE = re.compile(r"^[a-z0-9][a-z0-9._:-]{0,127}$")

TEMPERATURE_RANGE = (0.0, 2.0)
TOP_P_RANGE = (0.0, 1.0)
PENALTY_RANGE = (-2.0, 2.0)
MAX_TOKENS_RANGE = (1, 32_768)
MAX_STOP_SEQUENCES = 4
STOP_SEQUENCE_MAX_LENGTH = 64
