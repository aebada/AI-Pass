"""Agent Studio models: an Agent and its versioned configuration.

Each agent owns exactly one editable *draft* ``AgentVersion`` (``published_at`` is
NULL, no ``version_number``) plus any number of *published* versions. Publishing
copies the draft into a new numbered row; published rows are immutable snapshots
and ``Agent.current_version_id`` points at the latest one.
"""
from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    JSON,
    CheckConstraint,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    event,
    func,
    inspect,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class AgentStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class Agent(Base):
    __tablename__ = "agents"
    __table_args__ = (
        UniqueConstraint("workspace_id", "slug", name="uq_agents_workspace_slug"),
        Index("ix_agents_org_workspace_status", "organization_id", "workspace_id", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(), primary_key=True, default=uuid.uuid4)
    # Denormalized from the workspace so every query can filter on both tenant keys.
    organization_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(140), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[AgentStatus] = mapped_column(
        SAEnum(AgentStatus, name="agent_status"),
        nullable=False,
        default=AgentStatus.draft,
        server_default=AgentStatus.draft.value,
    )
    # agents <-> agent_versions is circular, so this FK is added after both tables exist.
    current_version_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey(
            "agent_versions.id",
            ondelete="SET NULL",
            use_alter=True,
            name="fk_agents_current_version_id",
        ),
        nullable=True,
    )

    created_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    versions: Mapped[list["AgentVersion"]] = relationship(
        back_populates="agent",
        foreign_keys="AgentVersion.agent_id",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<Agent id={self.id} workspace={self.workspace_id} slug={self.slug!r}>"


class AgentVersion(Base):
    __tablename__ = "agent_versions"
    __table_args__ = (
        # NULLs are distinct, so the unnumbered draft never collides here.
        UniqueConstraint("agent_id", "version_number", name="uq_agent_versions_agent_number"),
        # At most one draft per agent.
        Index(
            "uq_agent_versions_one_draft",
            "agent_id",
            unique=True,
            sqlite_where=text("published_at IS NULL"),
            postgresql_where=text("published_at IS NULL"),
        ),
        CheckConstraint(
            "(published_at IS NULL AND version_number IS NULL) OR "
            "(published_at IS NOT NULL AND version_number IS NOT NULL "
            "AND system_prompt IS NOT NULL AND provider_id IS NOT NULL "
            "AND model_id IS NOT NULL)",
            name="ck_agent_versions_published_complete",
        ),
        CheckConstraint(
            "version_number IS NULL OR version_number > 0",
            name="ck_agent_versions_number_positive",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(), primary_key=True, default=uuid.uuid4)
    agent_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version_number: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Draft fields may be incomplete; the check constraint requires them once published.
    system_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    provider_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    model_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    generation_settings: Mapped[dict[str, Any]] = mapped_column(
        JSON, nullable=False, default=dict
    )
    tool_bindings: Mapped[list[dict[str, Any]]] = mapped_column(
        JSON, nullable=False, default=list
    )
    knowledge_base_bindings: Mapped[list[dict[str, Any]]] = mapped_column(
        JSON, nullable=False, default=list
    )
    change_note: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    agent: Mapped["Agent"] = relationship(back_populates="versions", foreign_keys=[agent_id])

    @property
    def is_published(self) -> bool:
        return self.published_at is not None

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        label = f"v{self.version_number}" if self.version_number else "draft"
        return f"<AgentVersion id={self.id} agent={self.agent_id} {label}>"


class PublishedVersionImmutableError(Exception):
    pass


@event.listens_for(AgentVersion, "before_update")
def _forbid_published_version_changes(mapper, connection, target: AgentVersion) -> None:
    # Last line of defence: services never edit published rows, and this makes sure
    # no future code path can either. Judged on the value loaded from the database.
    history = inspect(target).attrs.published_at.history
    previously_published_at = history.deleted[0] if history.deleted else target.published_at
    if previously_published_at is not None:
        raise PublishedVersionImmutableError(
            f"agent version {target.id} is published and cannot be modified"
        )
