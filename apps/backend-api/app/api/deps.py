"""Shared FastAPI dependencies: DB session, current user, org membership, RBAC.

Authentication here is a deliberate placeholder for the upcoming auth sprint — it
trusts a bearer token that is simply the caller's user id. Everything downstream
of it (organization-membership resolution and the permission check) is the real
authorization pattern that Workspace and future org-scoped resources rely on.
"""
from __future__ import annotations

import uuid
from collections.abc import Callable

from fastapi import Depends, HTTPException, Path, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.authorization import role_has_permission
from app.db.session import get_db
from app.models.organization import OrganizationMembership
from app.models.user import User

__all__ = ["get_db", "get_current_user", "get_org_membership", "require_permission"]

_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "not authenticated")

    # Placeholder: the token is the raw user id. Swap for real session/JWT checks.
    try:
        user_id = uuid.UUID(credentials.credentials)
    except ValueError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid token")

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid token")
    return user


def get_org_membership(
    organization_id: uuid.UUID = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrganizationMembership:
    """Resolve the caller's membership in the organization named in the path.

    A missing membership and a non-existent organization both return 404, so the
    API never reveals which organizations exist to a non-member.
    """
    membership = db.scalar(
        select(OrganizationMembership).where(
            OrganizationMembership.organization_id == organization_id,
            OrganizationMembership.user_id == current_user.id,
        )
    )
    if membership is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "organization not found")
    return membership


def require_permission(permission: str) -> Callable[..., OrganizationMembership]:
    """Build a dependency that asserts the caller's org role grants ``permission``."""

    def _dependency(
        membership: OrganizationMembership = Depends(get_org_membership),
    ) -> OrganizationMembership:
        if not role_has_permission(membership.role, permission):
            raise HTTPException(
                status.HTTP_403_FORBIDDEN, f"missing required permission: {permission}"
            )
        return membership

    return _dependency
