"""Agent draft, publish, version history and restore.

The draft is the only mutable ``AgentVersion`` row. Publishing inserts a new,
numbered snapshot copied from the draft; restoring copies a snapshot back into
the draft. Neither operation ever updates a published row.
"""
from __future__ import annotations

import copy
import uuid
from datetime import datetime, timezone

from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.agent import Agent, AgentStatus, AgentVersion
from app.schemas.agent_config import (
    CONFIG_FIELDS,
    AgentDraftUpdate,
    PublishableConfig,
    PublishRequest,
)
from app.services.agent_service import AgentArchivedError, AgentError, AgentService


class AgentVersionNotFoundError(AgentError):
    pass


class DraftIncompleteError(AgentError):
    def __init__(self, invalid_fields: list[str]) -> None:
        super().__init__("draft is not ready to publish")
        self.invalid_fields = invalid_fields


class PublishConflictError(AgentError):
    def __init__(self) -> None:
        super().__init__("another version was published concurrently; retry")


class AgentVersionService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.agents = AgentService(db)

    def get_draft(
        self, *, organization_id: uuid.UUID, workspace_id: uuid.UUID, agent_id: uuid.UUID
    ) -> AgentVersion:
        agent = self.agents.get(
            organization_id=organization_id, workspace_id=workspace_id, agent_id=agent_id
        )
        return self._draft_for(agent)

    def update_draft(
        self,
        *,
        organization_id: uuid.UUID,
        workspace_id: uuid.UUID,
        agent_id: uuid.UUID,
        payload: AgentDraftUpdate,
    ) -> AgentVersion:
        agent = self._editable_agent(organization_id, workspace_id, agent_id)
        draft = self._draft_for(agent)

        for name, value in payload.config_values(payload.model_fields_set).items():
            setattr(draft, name, value)
        if "change_note" in payload.model_fields_set:
            draft.change_note = payload.change_note

        self.db.commit()
        self.db.refresh(draft)
        return draft

    def publish(
        self,
        *,
        organization_id: uuid.UUID,
        workspace_id: uuid.UUID,
        agent_id: uuid.UUID,
        payload: PublishRequest,
        published_by: uuid.UUID,
    ) -> AgentVersion:
        agent = self._editable_agent(organization_id, workspace_id, agent_id)
        draft = self._draft_for(agent)

        # Re-validate the stored draft so a snapshot can never be weaker than the
        # current rules, even if the draft was written before they tightened.
        try:
            PublishableConfig.model_validate(
                {name: getattr(draft, name) for name in CONFIG_FIELDS}
            )
        except ValidationError as exc:
            fields = sorted({str(err["loc"][0]) for err in exc.errors() if err["loc"]})
            raise DraftIncompleteError(fields)

        latest = self.db.scalar(
            select(func.max(AgentVersion.version_number)).where(AgentVersion.agent_id == agent.id)
        )
        version = AgentVersion(
            agent_id=agent.id,
            version_number=(latest or 0) + 1,
            change_note=payload.change_note or draft.change_note,
            created_by=published_by,
            published_at=datetime.now(timezone.utc),
            **self._snapshot(draft),
        )
        self.db.add(version)
        try:
            self.db.flush()
        except IntegrityError:
            # Two publishes raced for the same version_number (SQLite has no row lock).
            self.db.rollback()
            raise PublishConflictError()

        agent.current_version_id = version.id
        agent.status = AgentStatus.published
        draft.change_note = None  # the note now belongs to the published version
        self.db.commit()
        self.db.refresh(version)
        return version

    def list_versions(
        self, *, organization_id: uuid.UUID, workspace_id: uuid.UUID, agent_id: uuid.UUID
    ) -> list[AgentVersion]:
        agent = self.agents.get(
            organization_id=organization_id, workspace_id=workspace_id, agent_id=agent_id
        )
        stmt = (
            select(AgentVersion)
            .where(AgentVersion.agent_id == agent.id, AgentVersion.published_at.is_not(None))
            .order_by(AgentVersion.version_number.desc())
        )
        return list(self.db.scalars(stmt))

    def get_version(
        self,
        *,
        organization_id: uuid.UUID,
        workspace_id: uuid.UUID,
        agent_id: uuid.UUID,
        version_id: uuid.UUID,
    ) -> AgentVersion:
        agent = self.agents.get(
            organization_id=organization_id, workspace_id=workspace_id, agent_id=agent_id
        )
        return self._published_version(agent, version_id)

    def restore(
        self,
        *,
        organization_id: uuid.UUID,
        workspace_id: uuid.UUID,
        agent_id: uuid.UUID,
        version_id: uuid.UUID,
    ) -> AgentVersion:
        agent = self._editable_agent(organization_id, workspace_id, agent_id)
        source = self._published_version(agent, version_id)
        draft = self._draft_for(agent)

        for name, value in self._snapshot(source).items():
            setattr(draft, name, value)
        draft.change_note = f"Restored from version {source.version_number}"

        self.db.commit()
        self.db.refresh(draft)
        return draft

    def _editable_agent(
        self, organization_id: uuid.UUID, workspace_id: uuid.UUID, agent_id: uuid.UUID
    ) -> Agent:
        # Lock the agent row so concurrent publishes/edits on it serialize (Postgres).
        agent = self.agents.get(
            organization_id=organization_id,
            workspace_id=workspace_id,
            agent_id=agent_id,
            for_update=True,
        )
        if agent.status == AgentStatus.archived:
            raise AgentArchivedError()
        return agent

    def _draft_for(self, agent: Agent) -> AgentVersion:
        draft = self.db.scalar(
            select(AgentVersion).where(
                AgentVersion.agent_id == agent.id, AgentVersion.published_at.is_(None)
            )
        )
        if draft is None:
            # Agents are always created with a draft; this only heals rows made outside the service.
            draft = AgentVersion(agent_id=agent.id, created_by=agent.created_by)
            self.db.add(draft)
            self.db.flush()
            self.db.refresh(draft)
        return draft

    def _published_version(self, agent: Agent, version_id: uuid.UUID) -> AgentVersion:
        # Scoped by agent_id: a version id from another agent is simply "not found".
        version = self.db.scalar(
            select(AgentVersion).where(
                AgentVersion.id == version_id,
                AgentVersion.agent_id == agent.id,
                AgentVersion.published_at.is_not(None),
            )
        )
        if version is None:
            raise AgentVersionNotFoundError(str(version_id))
        return version

    @staticmethod
    def _snapshot(source: AgentVersion) -> dict:
        # Deep copies so the draft and a snapshot never share mutable JSON objects.
        return {name: copy.deepcopy(getattr(source, name)) for name in CONFIG_FIELDS}
