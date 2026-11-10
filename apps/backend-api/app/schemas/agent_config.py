"""Schemas for an agent's versioned configuration: prompt, model, bindings.

Every model here forbids unknown keys, so nothing outside the whitelisted
fields (an ``api_key``, say) can be smuggled into a draft or version snapshot.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.core.model_config import (
    BINDING_ID_RE,
    CHANGE_NOTE_MAX_LENGTH,
    MAX_BINDINGS,
    MAX_STOP_SEQUENCES,
    MAX_TOKENS_RANGE,
    MODEL_ID_RE,
    PENALTY_RANGE,
    PROVIDER_IDS,
    STOP_SEQUENCE_MAX_LENGTH,
    SYSTEM_PROMPT_MAX_LENGTH,
    TEMPERATURE_RANGE,
    TOP_P_RANGE,
)
from app.core.secrets import contains_secret

_SECRET_ERROR = "must not contain API keys, tokens or other credentials"


def _reject_secrets(value: str, field: str) -> str:
    if contains_secret(value):
        raise ValueError(f"{field} {_SECRET_ERROR}")
    return value


def clean_system_prompt(value: str) -> str:
    value = value.strip()
    if not value:
        raise ValueError("system_prompt must not be empty or whitespace-only")
    if len(value) > SYSTEM_PROMPT_MAX_LENGTH:
        raise ValueError(f"system_prompt must be at most {SYSTEM_PROMPT_MAX_LENGTH} characters")
    if "\x00" in value:
        raise ValueError("system_prompt must not contain NUL characters")
    return _reject_secrets(value, "system_prompt")


def clean_provider_id(value: str) -> str:
    value = value.strip().lower()
    if value not in PROVIDER_IDS:
        raise ValueError(f"unknown provider_id; expected one of: {', '.join(sorted(PROVIDER_IDS))}")
    return value


def clean_model_id(value: str) -> str:
    value = value.strip()
    if not MODEL_ID_RE.match(value):
        raise ValueError("model_id must be 1-128 characters of letters, digits and . _ : / @ -")
    return _reject_secrets(value, "model_id")


def clean_change_note(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.strip()
    if not value:
        return None
    if len(value) > CHANGE_NOTE_MAX_LENGTH:
        raise ValueError(f"change_note must be at most {CHANGE_NOTE_MAX_LENGTH} characters")
    return _reject_secrets(value, "change_note")


class GenerationSettings(BaseModel):
    # strict: no "0.7" strings or booleans sneaking in as numbers.
    model_config = ConfigDict(extra="forbid", strict=True, allow_inf_nan=False)

    temperature: float | None = Field(None, ge=TEMPERATURE_RANGE[0], le=TEMPERATURE_RANGE[1])
    top_p: float | None = Field(None, ge=TOP_P_RANGE[0], le=TOP_P_RANGE[1])
    max_tokens: int | None = Field(None, ge=MAX_TOKENS_RANGE[0], le=MAX_TOKENS_RANGE[1])
    presence_penalty: float | None = Field(None, ge=PENALTY_RANGE[0], le=PENALTY_RANGE[1])
    frequency_penalty: float | None = Field(None, ge=PENALTY_RANGE[0], le=PENALTY_RANGE[1])
    stop: list[str] | None = Field(None, max_length=MAX_STOP_SEQUENCES)

    @field_validator("stop")
    @classmethod
    def _validate_stop(cls, v: list[str] | None) -> list[str] | None:
        if v is None:
            return None
        for item in v:
            if not item or len(item) > STOP_SEQUENCE_MAX_LENGTH:
                raise ValueError(f"stop sequences must be 1-{STOP_SEQUENCE_MAX_LENGTH} characters")
            _reject_secrets(item, "stop")
        return v


def _check_binding_id(value: str, field: str) -> str:
    value = value.strip()
    if not BINDING_ID_RE.match(value):
        raise ValueError(f"{field} must be lowercase letters, digits and . _ : - (max 128)")
    return value


class ToolBinding(BaseModel):
    model_config = ConfigDict(extra="forbid")

    tool_id: str
    enabled: bool = True

    @field_validator("tool_id")
    @classmethod
    def _validate_tool_id(cls, v: str) -> str:
        return _check_binding_id(v, "tool_id")


class KnowledgeBaseBinding(BaseModel):
    model_config = ConfigDict(extra="forbid")

    knowledge_base_id: str
    name: str | None = Field(None, max_length=120)
    # Templates ship with placeholders that must be pointed at a real KB before use.
    is_placeholder: bool = False

    @field_validator("knowledge_base_id")
    @classmethod
    def _validate_kb_id(cls, v: str) -> str:
        return _check_binding_id(v, "knowledge_base_id")

    @field_validator("name")
    @classmethod
    def _validate_name(cls, v: str | None) -> str | None:
        if v is None:
            return None
        return _reject_secrets(v.strip(), "name") or None


def _reject_duplicates(items: list[BaseModel] | None, key: str) -> None:
    if not items:
        return
    ids = [getattr(item, key) for item in items]
    if len(ids) != len(set(ids)):
        raise ValueError(f"duplicate {key} in bindings")


class DraftConfigFields(BaseModel):
    """Editable configuration. ``None`` means "not provided" on create; on a draft
    PATCH an explicit ``null`` clears the field."""

    model_config = ConfigDict(extra="forbid")

    system_prompt: str | None = None
    provider_id: str | None = None
    model_id: str | None = None
    generation_settings: GenerationSettings | None = None
    tool_bindings: list[ToolBinding] | None = Field(None, max_length=MAX_BINDINGS)
    knowledge_base_bindings: list[KnowledgeBaseBinding] | None = Field(
        None, max_length=MAX_BINDINGS
    )

    @field_validator("system_prompt")
    @classmethod
    def _validate_prompt(cls, v: str | None) -> str | None:
        return None if v is None else clean_system_prompt(v)

    @field_validator("provider_id")
    @classmethod
    def _validate_provider(cls, v: str | None) -> str | None:
        return None if v is None else clean_provider_id(v)

    @field_validator("model_id")
    @classmethod
    def _validate_model(cls, v: str | None) -> str | None:
        return None if v is None else clean_model_id(v)

    @model_validator(mode="after")
    def _validate_bindings(self) -> "DraftConfigFields":
        _reject_duplicates(self.tool_bindings, "tool_id")
        _reject_duplicates(self.knowledge_base_bindings, "knowledge_base_id")
        return self

    def config_values(self, fields: set[str]) -> dict[str, Any]:
        """Column values for ``fields``, with cleared collections stored as empty."""
        values: dict[str, Any] = {}
        for name in fields & CONFIG_FIELDS:
            value = getattr(self, name)
            if name == "generation_settings":
                values[name] = value.model_dump(exclude_none=True) if value else {}
            elif name in ("tool_bindings", "knowledge_base_bindings"):
                values[name] = [item.model_dump() for item in value] if value else []
            else:
                values[name] = value
        return values


CONFIG_FIELDS = frozenset(DraftConfigFields.model_fields)


class AgentDraftUpdate(DraftConfigFields):
    change_note: str | None = None

    @field_validator("change_note")
    @classmethod
    def _validate_note(cls, v: str | None) -> str | None:
        return clean_change_note(v)


class PublishableConfig(DraftConfigFields):
    """A draft must satisfy this before it can be published."""

    system_prompt: str
    provider_id: str
    model_id: str


class PublishRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    change_note: str | None = None

    @field_validator("change_note")
    @classmethod
    def _validate_note(cls, v: str | None) -> str | None:
        return clean_change_note(v)


class AgentVersionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    agent_id: uuid.UUID
    version_number: int | None
    is_published: bool
    system_prompt: str | None
    provider_id: str | None
    model_id: str | None
    generation_settings: dict[str, Any]
    tool_bindings: list[dict[str, Any]]
    knowledge_base_bindings: list[dict[str, Any]]
    change_note: str | None
    created_by: uuid.UUID | None
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime


class AgentVersionSummary(BaseModel):
    """History list entry — the full snapshot is fetched per version."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    version_number: int
    provider_id: str
    model_id: str
    change_note: str | None
    created_by: uuid.UUID | None
    published_at: datetime
