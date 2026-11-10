"""Agent service — workspace-scoped Agent CRUD.

Every lookup filters on ``organization_id`` *and* ``workspace_id`` (and the
workspace itself is loaded by ``(id, organization_id)``), so an agent or workspace
id from another tenant is indistinguishable from one that does not exist.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.slug import is_valid_slug, slugify
from app.models.agent import Agent, AgentStatus, AgentVersion
from app.models.workspace import Workspace
from app.schemas.agent import AgentCreate, AgentUpdate
from app.schemas.agent_config import CONFIG_FIELDS
from app.services.workspace_service import WorkspaceService


class AgentError(Exception):
    """Base class for expected failures the router maps to HTTP status codes."""


class AgentNotFoundError(AgentError):
    pass


class AgentArchivedError(AgentError):
    def __init__(self) -> None:
        super().__init__("agent is archived and can no longer be modified")


class WorkspaceArchivedError(AgentError):
    def __init__(self) -> None:
        super().__init__("cannot create agents in an archived workspace")


class InvalidAgentSlugError(AgentError):
    pass


class AgentSlugConflictError(AgentError):
    def __init__(self, slug: str) -> None:
        super().__init__(f"slug '{slug}' is already used in this workspace")
        self.slug = slug


class AgentService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(
        self,
        *,
        organization_id: uuid.UUID,
        workspace_id: uuid.UUID,
        payload: AgentCreate,
        created_by: uuid.UUID,
    ) -> Agent:
        workspace = self._get_workspace(organization_id, workspace_id)
        if workspace.is_archived:
            raise WorkspaceArchivedError()

        slug = payload.slug or slugify(payload.name)
        if not is_valid_slug(slug):
            raise InvalidAgentSlugError(
                "could not derive a valid slug from the name; provide an explicit slug"
            )
        if self._slug_exists(workspace_id, slug):
            raise AgentSlugConflictError(slug)

        agent = Agent(
            organization_id=organization_id,
            workspace_id=workspace_id,
            name=payload.name,
            slug=slug,
            description=payload.description,
            status=AgentStatus.draft,
            created_by=created_by,
        )
        # Every agent starts with an editable draft, complete or not; publish enforces completeness.
        draft = AgentVersion(created_by=created_by)
        provided = {name for name in CONFIG_FIELDS if getattr(payload, name) is not None}
        for name, value in payload.config_values(provided).items():
            setattr(draft, name, value)
        agent.versions.append(draft)
        self.db.add(agent)
        self._commit_or_conflict(slug)
        self.db.refresh(agent)
        return agent

    def get(
        self,
        *,
        organization_id: uuid.UUID,
        workspace_id: uuid.UUID,
        agent_id: uuid.UUID,
        for_update: bool = False,
    ) -> Agent:
        self._get_workspace(organization_id, workspace_id)
        stmt = select(Agent).where(
            Agent.id == agent_id,
            Agent.organization_id == organization_id,
            Agent.workspace_id == workspace_id,
        )
        if for_update:
            stmt = stmt.with_for_update()
        agent = self.db.scalar(stmt)
        if agent is None:
            raise AgentNotFoundError(str(agent_id))
        return agent

    def list_by_workspace(
        self,
        *,
        organization_id: uuid.UUID,
        workspace_id: uuid.UUID,
        status: AgentStatus | None = None,
        include_archived: bool = False,
    ) -> list[Agent]:
        self._get_workspace(organization_id, workspace_id)
        stmt = select(Agent).where(
            Agent.organization_id == organization_id,
            Agent.workspace_id == workspace_id,
        )
        if status is not None:
            stmt = stmt.where(Agent.status == status)
        elif not include_archived:
            stmt = stmt.where(Agent.status != AgentStatus.archived)
        stmt = stmt.order_by(Agent.created_at, Agent.slug)
        return list(self.db.scalars(stmt))

    def update(
        self,
        *,
        organization_id: uuid.UUID,
        workspace_id: uuid.UUID,
        agent_id: uuid.UUID,
        payload: AgentUpdate,
    ) -> Agent:
        agent = self.get(
            organization_id=organization_id, workspace_id=workspace_id, agent_id=agent_id
        )
        if agent.status == AgentStatus.archived:
            raise AgentArchivedError()

        if payload.name is not None:
            agent.name = payload.name

        if "description" in payload.model_fields_set:
            agent.description = payload.description

        if payload.slug is not None and payload.slug != agent.slug:
            if self._slug_exists(workspace_id, payload.slug, exclude_id=agent.id):
                raise AgentSlugConflictError(payload.slug)
            agent.slug = payload.slug

        self._commit_or_conflict(agent.slug)
        self.db.refresh(agent)
        return agent

    def archive(
        self, *, organization_id: uuid.UUID, workspace_id: uuid.UUID, agent_id: uuid.UUID
    ) -> Agent:
        agent = self.get(
            organization_id=organization_id, workspace_id=workspace_id, agent_id=agent_id
        )
        if agent.status != AgentStatus.archived:
            agent.status = AgentStatus.archived
            agent.archived_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(agent)
        return agent

    def _get_workspace(self, organization_id: uuid.UUID, workspace_id: uuid.UUID) -> Workspace:
        # Raises WorkspaceNotFoundError for unknown or cross-organization ids.
        return WorkspaceService(self.db).get(
            organization_id=organization_id, workspace_id=workspace_id
        )

    def _slug_exists(
        self,
        workspace_id: uuid.UUID,
        slug: str,
        *,
        exclude_id: uuid.UUID | None = None,
    ) -> bool:
        stmt = (
            select(func.count())
            .select_from(Agent)
            .where(Agent.workspace_id == workspace_id, Agent.slug == slug)
        )
        if exclude_id is not None:
            stmt = stmt.where(Agent.id != exclude_id)
        return bool(self.db.scalar(stmt))

    def _commit_or_conflict(self, slug: str) -> None:
        # The pre-check above is advisory; the unique constraint settles concurrent writes.
        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise AgentSlugConflictError(slug)
