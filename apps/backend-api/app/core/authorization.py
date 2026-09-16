"""Organization RBAC: resolve an ``OrgRole`` to the permissions it grants.

This mirrors the role model in ``packages/platform-core`` — ``owner``/``admin``
are superusers, other roles carry an explicit permission set. Workspace routes
check these permission strings; no separate authorization model is introduced.
"""
from __future__ import annotations

from app.models.organization import OrgRole

# Permission strings share the namespace of platform-core's ModulePermission.
WORKSPACE_READ = "workspace:read"
WORKSPACE_WRITE = "workspace:write"

_ALL = "*"

ROLE_PERMISSIONS: dict[OrgRole, set[str]] = {
    OrgRole.owner: {_ALL},
    OrgRole.admin: {_ALL},
    OrgRole.manager: {WORKSPACE_READ, WORKSPACE_WRITE},
    OrgRole.member: {WORKSPACE_READ, WORKSPACE_WRITE},
    OrgRole.viewer: {WORKSPACE_READ},
    OrgRole.auditor: {WORKSPACE_READ},
}


def role_has_permission(role: OrgRole, permission: str) -> bool:
    granted = ROLE_PERMISSIONS.get(role, set())
    return _ALL in granted or permission in granted
