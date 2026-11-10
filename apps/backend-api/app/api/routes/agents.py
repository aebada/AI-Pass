"""Agent HTTP API — nested under an organization *and* a workspace.

Guard chain on every route (same as workspaces):
  * ``get_current_user``   -> 401 when unauthenticated
  * ``get_org_membership`` -> 404 when the caller is not a member of {organization_id}
  * ``require_permission`` -> 403 when the caller's role lacks the permission

The service then loads the workspace by ``(workspace_id, organization_id)`` and the
agent by ``(agent_id, organization_id, workspace_id)``; any mismatch is a 404.
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_permission
from app.core.authorization import AGENT_PUBLISH, AGENT_READ, AGENT_WRITE
from app.models.agent import AgentStatus
from app.models.organization import OrganizationMembership
from app.schemas.agent import AgentCreate, AgentRead, AgentUpdate
from app.schemas.agent_config import (
    AgentDraftUpdate,
    AgentVersionRead,
    AgentVersionSummary,
    PublishRequest,
)
from app.services.agent_service import (
    AgentArchivedError,
    AgentNotFoundError,
    AgentService,
    AgentSlugConflictError,
    InvalidAgentSlugError,
    WorkspaceArchivedError,
)
from app.services.agent_version_service import (
    AgentVersionNotFoundError,
    AgentVersionService,
    DraftIncompleteError,
    PublishConflictError,
)
from app.services.workspace_service import WorkspaceNotFoundError

router = APIRouter(
    prefix="/api/v1/organizations/{organization_id}/workspaces/{workspace_id}/agents",
    tags=["agents"],
)


_NOT_FOUND = (WorkspaceNotFoundError, AgentNotFoundError, AgentVersionNotFoundError)


def _not_found(exc: Exception) -> HTTPException:
    if isinstance(exc, WorkspaceNotFoundError):
        detail = "workspace not found"
    elif isinstance(exc, AgentVersionNotFoundError):
        detail = "version not found"
    else:
        detail = "agent not found"
    return HTTPException(status.HTTP_404_NOT_FOUND, detail)


@router.post("", response_model=AgentRead, status_code=status.HTTP_201_CREATED)
def create_agent(
    organization_id: uuid.UUID,
    workspace_id: uuid.UUID,
    payload: AgentCreate,
    membership: OrganizationMembership = Depends(require_permission(AGENT_WRITE)),
    db: Session = Depends(get_db),
) -> AgentRead:
    try:
        return AgentService(db).create(
            organization_id=organization_id,
            workspace_id=workspace_id,
            payload=payload,
            created_by=membership.user_id,
        )
    except WorkspaceNotFoundError as exc:
        raise _not_found(exc)
    except InvalidAgentSlugError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc))
    except (AgentSlugConflictError, WorkspaceArchivedError) as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc))


@router.get(
    "",
    response_model=list[AgentRead],
    dependencies=[Depends(require_permission(AGENT_READ))],
)
def list_agents(
    organization_id: uuid.UUID,
    workspace_id: uuid.UUID,
    status_filter: AgentStatus | None = Query(None, alias="status"),
    include_archived: bool = Query(False),
    db: Session = Depends(get_db),
) -> list[AgentRead]:
    try:
        return AgentService(db).list_by_workspace(
            organization_id=organization_id,
            workspace_id=workspace_id,
            status=status_filter,
            include_archived=include_archived,
        )
    except WorkspaceNotFoundError as exc:
        raise _not_found(exc)


@router.get(
    "/{agent_id}",
    response_model=AgentRead,
    dependencies=[Depends(require_permission(AGENT_READ))],
)
def get_agent(
    organization_id: uuid.UUID,
    workspace_id: uuid.UUID,
    agent_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> AgentRead:
    try:
        return AgentService(db).get(
            organization_id=organization_id, workspace_id=workspace_id, agent_id=agent_id
        )
    except _NOT_FOUND as exc:
        raise _not_found(exc)


@router.patch(
    "/{agent_id}",
    response_model=AgentRead,
    dependencies=[Depends(require_permission(AGENT_WRITE))],
)
def update_agent(
    organization_id: uuid.UUID,
    workspace_id: uuid.UUID,
    agent_id: uuid.UUID,
    payload: AgentUpdate,
    db: Session = Depends(get_db),
) -> AgentRead:
    try:
        return AgentService(db).update(
            organization_id=organization_id,
            workspace_id=workspace_id,
            agent_id=agent_id,
            payload=payload,
        )
    except _NOT_FOUND as exc:
        raise _not_found(exc)
    except (AgentSlugConflictError, AgentArchivedError) as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc))


@router.post(
    "/{agent_id}/archive",
    response_model=AgentRead,
    dependencies=[Depends(require_permission(AGENT_WRITE))],
)
def archive_agent(
    organization_id: uuid.UUID,
    workspace_id: uuid.UUID,
    agent_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> AgentRead:
    try:
        return AgentService(db).archive(
            organization_id=organization_id, workspace_id=workspace_id, agent_id=agent_id
        )
    except _NOT_FOUND as exc:
        raise _not_found(exc)


# --- draft / publish / versions -----------------------------------------------


@router.get(
    "/{agent_id}/draft",
    response_model=AgentVersionRead,
    dependencies=[Depends(require_permission(AGENT_READ))],
)
def get_draft(
    organization_id: uuid.UUID,
    workspace_id: uuid.UUID,
    agent_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> AgentVersionRead:
    try:
        return AgentVersionService(db).get_draft(
            organization_id=organization_id, workspace_id=workspace_id, agent_id=agent_id
        )
    except _NOT_FOUND as exc:
        raise _not_found(exc)


@router.patch(
    "/{agent_id}/draft",
    response_model=AgentVersionRead,
    dependencies=[Depends(require_permission(AGENT_WRITE))],
)
def update_draft(
    organization_id: uuid.UUID,
    workspace_id: uuid.UUID,
    agent_id: uuid.UUID,
    payload: AgentDraftUpdate,
    db: Session = Depends(get_db),
) -> AgentVersionRead:
    try:
        return AgentVersionService(db).update_draft(
            organization_id=organization_id,
            workspace_id=workspace_id,
            agent_id=agent_id,
            payload=payload,
        )
    except _NOT_FOUND as exc:
        raise _not_found(exc)
    except AgentArchivedError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc))


@router.post(
    "/{agent_id}/publish",
    response_model=AgentVersionRead,
    status_code=status.HTTP_201_CREATED,
)
def publish_agent(
    organization_id: uuid.UUID,
    workspace_id: uuid.UUID,
    agent_id: uuid.UUID,
    payload: PublishRequest | None = None,
    membership: OrganizationMembership = Depends(require_permission(AGENT_PUBLISH)),
    db: Session = Depends(get_db),
) -> AgentVersionRead:
    try:
        return AgentVersionService(db).publish(
            organization_id=organization_id,
            workspace_id=workspace_id,
            agent_id=agent_id,
            payload=payload or PublishRequest(),
            published_by=membership.user_id,
        )
    except _NOT_FOUND as exc:
        raise _not_found(exc)
    except DraftIncompleteError as exc:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            {"message": str(exc), "invalid_fields": exc.invalid_fields},
        )
    except (AgentArchivedError, PublishConflictError) as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc))


@router.get(
    "/{agent_id}/versions",
    response_model=list[AgentVersionSummary],
    dependencies=[Depends(require_permission(AGENT_READ))],
)
def list_versions(
    organization_id: uuid.UUID,
    workspace_id: uuid.UUID,
    agent_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> list[AgentVersionSummary]:
    try:
        return AgentVersionService(db).list_versions(
            organization_id=organization_id, workspace_id=workspace_id, agent_id=agent_id
        )
    except _NOT_FOUND as exc:
        raise _not_found(exc)


@router.get(
    "/{agent_id}/versions/{version_id}",
    response_model=AgentVersionRead,
    dependencies=[Depends(require_permission(AGENT_READ))],
)
def get_version(
    organization_id: uuid.UUID,
    workspace_id: uuid.UUID,
    agent_id: uuid.UUID,
    version_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> AgentVersionRead:
    try:
        return AgentVersionService(db).get_version(
            organization_id=organization_id,
            workspace_id=workspace_id,
            agent_id=agent_id,
            version_id=version_id,
        )
    except _NOT_FOUND as exc:
        raise _not_found(exc)


@router.post(
    "/{agent_id}/versions/{version_id}/restore",
    response_model=AgentVersionRead,
    dependencies=[Depends(require_permission(AGENT_WRITE))],
)
def restore_version(
    organization_id: uuid.UUID,
    workspace_id: uuid.UUID,
    agent_id: uuid.UUID,
    version_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> AgentVersionRead:
    """Copy a published snapshot into the draft. Publish to make it live."""
    try:
        return AgentVersionService(db).restore(
            organization_id=organization_id,
            workspace_id=workspace_id,
            agent_id=agent_id,
            version_id=version_id,
        )
    except _NOT_FOUND as exc:
        raise _not_found(exc)
    except AgentArchivedError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc))
