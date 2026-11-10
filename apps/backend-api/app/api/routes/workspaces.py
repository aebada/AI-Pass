"""Workspace HTTP API — always nested under an organization.

Guard chain on every route:
  * ``get_current_user``  -> 401 when unauthenticated
  * ``get_org_membership`` -> 404 when the caller is not a member of {organization_id}
  * ``require_permission``  -> 403 when the caller's role lacks the permission

The service only loads a workspace by ``(id, organization_id)``, so a workspace id
from another organization is indistinguishable from one that does not exist (404).
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_permission
from app.core.authorization import WORKSPACE_READ, WORKSPACE_WRITE
from app.schemas.workspace import WorkspaceCreate, WorkspaceRead, WorkspaceUpdate
from app.services.workspace_service import (
    InvalidSlugError,
    SlugConflictError,
    WorkspaceNotFoundError,
    WorkspaceService,
)

router = APIRouter(
    prefix="/api/v1/organizations/{organization_id}/workspaces",
    tags=["workspaces"],
)


@router.post(
    "",
    response_model=WorkspaceRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission(WORKSPACE_WRITE))],
)
def create_workspace(
    organization_id: uuid.UUID,
    payload: WorkspaceCreate,
    db: Session = Depends(get_db),
) -> WorkspaceRead:
    try:
        return WorkspaceService(db).create(organization_id=organization_id, payload=payload)
    except InvalidSlugError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc))
    except SlugConflictError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc))


@router.get(
    "",
    response_model=list[WorkspaceRead],
    dependencies=[Depends(require_permission(WORKSPACE_READ))],
)
def list_workspaces(
    organization_id: uuid.UUID,
    include_archived: bool = Query(False),
    db: Session = Depends(get_db),
) -> list[WorkspaceRead]:
    return WorkspaceService(db).list_by_organization(
        organization_id=organization_id, include_archived=include_archived
    )


@router.get(
    "/{workspace_id}",
    response_model=WorkspaceRead,
    dependencies=[Depends(require_permission(WORKSPACE_READ))],
)
def get_workspace(
    organization_id: uuid.UUID,
    workspace_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> WorkspaceRead:
    try:
        return WorkspaceService(db).get(
            organization_id=organization_id, workspace_id=workspace_id
        )
    except WorkspaceNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "workspace not found")


@router.patch(
    "/{workspace_id}",
    response_model=WorkspaceRead,
    dependencies=[Depends(require_permission(WORKSPACE_WRITE))],
)
def update_workspace(
    organization_id: uuid.UUID,
    workspace_id: uuid.UUID,
    payload: WorkspaceUpdate,
    db: Session = Depends(get_db),
) -> WorkspaceRead:
    try:
        return WorkspaceService(db).update(
            organization_id=organization_id, workspace_id=workspace_id, payload=payload
        )
    except WorkspaceNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "workspace not found")
    except SlugConflictError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc))


@router.post(
    "/{workspace_id}/archive",
    response_model=WorkspaceRead,
    dependencies=[Depends(require_permission(WORKSPACE_WRITE))],
)
def archive_workspace(
    organization_id: uuid.UUID,
    workspace_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> WorkspaceRead:
    try:
        return WorkspaceService(db).archive(
            organization_id=organization_id, workspace_id=workspace_id
        )
    except WorkspaceNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "workspace not found")
