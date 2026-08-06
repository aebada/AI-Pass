# Workspace Governance (People, Groups, Roles)

People and access governance for AI-Pass workspaces. This is **not** the same as [AI Governance](./AI-GOVERNANCE.md) (inventory, policies, risk for AI systems).

## Concepts

| Concept | Purpose |
|---------|---------|
| **Groups** | Foundation for governance. Assign capabilities to groups, not one person at a time. Create manually or provision via SCIM. |
| **Manager** | Day-to-day admin: members, groups, analytics. Cannot manage billing, connectors, or IT & Security. |
| **Admin / Owner** | Full control including sensitive settings. |
| **Capabilities** | Granular permissions (create/publish agents & skills, Frames, audit logs, etc.). |
| **Builders group** | Replaces the former Builder role with equivalent capabilities. |

## Roles

`owner` · `admin` · `manager` · `member` · `viewer` · `auditor`

The legacy `builder` role is deprecated. Existing builders are migrated into the **builders** group (`People → Groups`).

## Sensitive capabilities (Admin only)

- `billing:manage`
- `connectors:manage`
- `it_security:manage`
- `settings:sensitive`

Managers cannot receive these via role or group assignment.

## UI

| Route | Description |
|-------|-------------|
| `/workspace/people` | Member directory and role assignment |
| `/workspace/people/groups` | Create groups, assign capabilities & members |
| `/workspace/settings/governance` | Settings & Governance hub + role matrix |
| `/workspace/settings/governance/scim` | SCIM token and base URL |
| `/workspace/admin` | Manager-facing members/groups snapshot |
| `/workspace/settings` | Settings hub (includes governance links) |

## Package

`@ai-pass/workspace-rbac` — types, capability catalog, role matrix, `resolveEffectiveCapabilities`, Builder migration helpers, and a localStorage-backed demo service for the static web app.

## Auth API

Tables: `organizations`, `organization_members`, `workspace_groups`, `workspace_group_members`, `scim_tokens`.

### REST (session auth)

```
GET  /api/v1/governance/capabilities
GET  /api/v1/orgs/{org}/members
POST /api/v1/orgs/{org}/members
PATCH /api/v1/orgs/{org}/members/{userId}
GET/POST/PATCH/DELETE /api/v1/orgs/{org}/groups...
GET  /api/v1/orgs/{org}/scim
POST /api/v1/orgs/{org}/scim/enable
POST /api/v1/orgs/{org}/scim/disable
```

`GET /auth/me` returns `orgId`, `roles`, `groupIds`, and effective `capabilities`.

### SCIM 2.0

Base URL: `/scim/v2`  
Auth: Bearer token from Settings → SCIM.

Supported: `ServiceProviderConfig`, `Schemas`, `Users`, `Groups` (list/get/create/replace/delete).

SCIM groups map to `workspace_groups` with `source=scim`. Assign capabilities in the Groups UI after sync.

## Migrate / deploy

```bash
cd services/auth-api
php artisan migrate
```

First authenticated `/auth/me` bootstraps the default organization, membership, and builders group.

## Related

- [AI Governance](./AI-GOVERNANCE.md) — AI system control plane
- `@ai-pass/workspace-rbac` — shared model used by the workspace UI
