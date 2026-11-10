"""Request/response schemas for the Workspace API."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.slug import SLUG_MAX_LENGTH, is_valid_slug

_SLUG_ERROR = "slug must be lowercase alphanumeric words separated by single hyphens"


def _normalize_optional_slug(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.strip().lower()
    if not is_valid_slug(value):
        raise ValueError(_SLUG_ERROR)
    return value


def _clean_optional_name(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.strip()
    if not value:
        raise ValueError("name must not be blank")
    return value


class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    slug: str | None = Field(default=None, max_length=SLUG_MAX_LENGTH)

    @field_validator("name")
    @classmethod
    def _validate_name(cls, v: str) -> str:
        return _clean_optional_name(v)  # type: ignore[return-value]

    @field_validator("slug")
    @classmethod
    def _validate_slug(cls, v: str | None) -> str | None:
        return _normalize_optional_slug(v)


class WorkspaceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    slug: str | None = Field(default=None, max_length=SLUG_MAX_LENGTH)

    @field_validator("name")
    @classmethod
    def _validate_name(cls, v: str | None) -> str | None:
        return _clean_optional_name(v)

    @field_validator("slug")
    @classmethod
    def _validate_slug(cls, v: str | None) -> str | None:
        return _normalize_optional_slug(v)


class WorkspaceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    name: str
    slug: str
    is_archived: bool
    archived_at: datetime | None
    created_at: datetime
    updated_at: datetime
