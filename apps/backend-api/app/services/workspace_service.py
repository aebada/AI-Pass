"""Workspace service — all Workspace business rules live here, not in the router.

Every method is organization-scoped: the ``organization_id`` is always applied in
the query, so a workspace id belonging to another organization is treated exactly
like one that does not exist.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.slug import is_valid_slug, slugify
from app.models.workspace import Workspace
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate


class WorkspaceError(Exception):
    """Base class for expected failures the router maps to HTTP status codes."""


class WorkspaceNotFoundError(WorkspaceError):
    pass


class InvalidSlugError(WorkspaceError):
    pass


class SlugConflictError(WorkspaceError):
    def __init__(self, slug: str) -> None:
        super().__init__(f"slug '{slug}' is already used in this organization")
        self.slug = slug


class WorkspaceService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, *, organization_id: uuid.UUID, payload: WorkspaceCreate) -> Workspace:
        slug = payload.slug or slugify(payload.name)
        if not is_valid_slug(slug):
            raise InvalidSlugError(
                "could not derive a valid slug from the name; provide an explicit slug"
            )
        if self._slug_exists(organization_id, slug):
            raise SlugConflictError(slug)

        workspace = Workspace(organization_id=organization_id, name=payload.name, slug=slug)
        self.db.add(workspace)
        self.db.commit()
        self.db.refresh(workspace)
        return workspace

    def get(self, *, organization_id: uuid.UUID, workspace_id: uuid.UUID) -> Workspace:
        workspace = self.db.scalar(
            select(Workspace).where(
                Workspace.id == workspace_id,
                Workspace.organization_id == organization_id,
            )
        )
        if workspace is None:
            raise WorkspaceNotFoundError(str(workspace_id))
        return workspace

    def list_by_organization(
        self, *, organization_id: uuid.UUID, include_archived: bool = False
    ) -> list[Workspace]:
        stmt = select(Workspace).where(Workspace.organization_id == organization_id)
        if not include_archived:
            stmt = stmt.where(Workspace.is_archived.is_(False))
        stmt = stmt.order_by(Workspace.created_at, Workspace.slug)
        return list(self.db.scalars(stmt))

    def update(
        self,
        *,
        organization_id: uuid.UUID,
        workspace_id: uuid.UUID,
        payload: WorkspaceUpdate,
    ) -> Workspace:
        workspace = self.get(organization_id=organization_id, workspace_id=workspace_id)

        if payload.name is not None:
            workspace.name = payload.name

        if payload.slug is not None and payload.slug != workspace.slug:
            if self._slug_exists(organization_id, payload.slug, exclude_id=workspace.id):
                raise SlugConflictError(payload.slug)
            workspace.slug = payload.slug

        self.db.commit()
        self.db.refresh(workspace)
        return workspace

    def archive(self, *, organization_id: uuid.UUID, workspace_id: uuid.UUID) -> Workspace:
        workspace = self.get(organization_id=organization_id, workspace_id=workspace_id)
        if not workspace.is_archived:
            workspace.is_archived = True
            workspace.archived_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(workspace)
        return workspace

    def _slug_exists(
        self,
        organization_id: uuid.UUID,
        slug: str,
        *,
        exclude_id: uuid.UUID | None = None,
    ) -> bool:
        stmt = (
            select(func.count())
            .select_from(Workspace)
            .where(
                Workspace.organization_id == organization_id,
                Workspace.slug == slug,
            )
        )
        if exclude_id is not None:
            stmt = stmt.where(Workspace.id != exclude_id)
        return bool(self.db.scalar(stmt))
