"""Request/response schemas for the Agent API."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.slug import SLUG_MAX_LENGTH
from app.models.agent import AgentStatus
from app.schemas.agent_config import DraftConfigFields
from app.schemas.workspace import _clean_optional_name, _normalize_optional_slug

DESCRIPTION_MAX_LENGTH = 2000


def _clean_description(value: str | None) -> str | None:
    if value is None:
        return None
    return value.strip() or None


class AgentCreate(DraftConfigFields):
    """Agent metadata plus an optional initial draft configuration."""

    name: str = Field(min_length=1, max_length=120)
    slug: str | None = Field(default=None, max_length=SLUG_MAX_LENGTH)
    description: str | None = Field(default=None, max_length=DESCRIPTION_MAX_LENGTH)

    @field_validator("name")
    @classmethod
    def _validate_name(cls, v: str) -> str:
        return _clean_optional_name(v)  # type: ignore[return-value]

    @field_validator("slug")
    @classmethod
    def _validate_slug(cls, v: str | None) -> str | None:
        return _normalize_optional_slug(v)

    @field_validator("description")
    @classmethod
    def _validate_description(cls, v: str | None) -> str | None:
        return _clean_description(v)


class AgentUpdate(BaseModel):
    """Partial update of agent metadata. Send ``description: null`` to clear it."""

    name: str | None = Field(default=None, min_length=1, max_length=120)
    slug: str | None = Field(default=None, max_length=SLUG_MAX_LENGTH)
    description: str | None = Field(default=None, max_length=DESCRIPTION_MAX_LENGTH)

    @field_validator("name")
    @classmethod
    def _validate_name(cls, v: str | None) -> str | None:
        return _clean_optional_name(v)

    @field_validator("slug")
    @classmethod
    def _validate_slug(cls, v: str | None) -> str | None:
        return _normalize_optional_slug(v)

    @field_validator("description")
    @classmethod
    def _validate_description(cls, v: str | None) -> str | None:
        return _clean_description(v)


class AgentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    workspace_id: uuid.UUID
    name: str
    slug: str
    description: str | None
    status: AgentStatus
    current_version_id: uuid.UUID | None
    created_by: uuid.UUID | None
    archived_at: datetime | None
    created_at: datetime
    updated_at: datetime
