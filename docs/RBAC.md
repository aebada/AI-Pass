# AI-Pass Role-Based Access Control (RBAC)

## Overview

AI-Pass uses role-based access control to determine who can perform protected actions inside an organization and its workspaces.

RBAC is evaluated before protected platform operations execute.

The authorization flow is:

1. Authenticate the user
2. Resolve the active organization
3. Resolve the user's organization membership and role
4. Verify organization scope
5. Check the required permission
6. Verify workspace access when applicable
7. Continue to governance/policy enforcement
8. Execute the requested action

RBAC and governance are intentionally separate:

- RBAC answers: "Can this user perform this action?"
- Governance answers: "Is this action allowed under platform and organizational policy?"

---

## Roles

Sprint 1 defines three organization roles:

### OWNER

The organization owner has the highest level of access.

Typical capabilities:

- Update organization settings
- Delete the organization
- Invite members
- Update members
- Remove members
- Create workspaces
- Update workspaces
- Delete workspaces
- Configure providers
- Invoke AI models
- Manage API keys
- View and manage billing
- View audit logs

### ADMIN

Administrators manage normal organization operations but do not receive owner-only privileges.

Typical capabilities:

- Update organization settings
- Invite members
- Update members
- Remove members
- Create workspaces
- Update workspaces
- Delete workspaces
- Configure providers
- Invoke AI models
- Manage API keys
- View billing
- View audit logs

Administrators cannot:

- Delete the organization
- Manage owner-only billing operations

### MEMBER

Members can use organization resources but cannot perform administrative actions.

Typical capabilities:

- View allowed providers
- Invoke AI models
- Access workspaces they belong to

Members cannot:

- Update the organization
- Invite members
- Remove members
- Create or manage workspaces
- Configure providers
- Manage API keys
- Manage billing
- View administrative audit data

---

## Permission Model

AI-Pass uses Better Auth's organization access-control system.

Permission definitions are located in:

`packages/auth-core/src/server/permissions.ts`

Examples:

- `organization:update`
- `organization:delete`
- `member:create`
- `member:update`
- `member:delete`
- `invitation:create`
- `invitation:cancel`
- `team:create`
- `team:update`
- `team:delete`
- `provider:configure`
- `provider:list`
- `model:invoke`
- `apikey:create`
- `apikey:revoke`
- `apikey:list`
- `billing:view`
- `billing:manage`
- `audit:view`

The Better Auth resource name `team` represents an AI-Pass workspace.

---

## Organization Membership

Organization authorization is based on the database relationship:

User → Member → Organization

The `Member` record contains:

- `userId`
- `organizationId`
- `role`

Roles are therefore scoped to an organization rather than being global.

A user can therefore have different roles in different organizations.

Example:

- Organization A → ADMIN
- Organization B → MEMBER

Being an ADMIN in Organization A does not grant administrative access to Organization B.

---

## Cross-Organization Isolation

Protected organization routes use `requireOrganization()`.

The middleware verifies that the organization referenced by the route matches the authenticated user's active organization.

Example:

Authenticated context:

`activeOrganizationId = org-a`

Request:

`PATCH /organizations/org-b`

Result:

`403 Forbidden`

This prevents permissions from one organization from being reused against another organization.

---

## Workspace Access

AI-Pass workspaces are stored as Better Auth `Team` records.

Workspace membership is stored through `TeamMember`.

The `requireWorkspace()` middleware:

1. Verifies authentication
2. Verifies an active organization exists
3. Loads the requested workspace
4. Ensures the workspace belongs to the active organization
5. Allows OWNER and ADMIN
6. For MEMBER users, verifies explicit workspace membership

A workspace belonging to another organization is returned as not found to reduce cross-organization resource discovery.

---

## Authorization Middleware

Authorization middleware is located in:

`packages/auth-core/src/server/middleware.ts`

### requireAuth()

Ensures the request has an authenticated Better Auth session.

Failure:

`401 Unauthenticated`

### requireOrganization()

Ensures the route organization matches the active organization.

Failure:

`403 Forbidden`

### requirePermission()

Uses Better Auth's permission engine to verify the requested action.

Failure:

`403 Forbidden`

### requireWorkspace()

Checks organization ownership and workspace membership.

Failure:

`403 Forbidden` or `404 Not Found`

---

## Example Protected Route

```ts
router.patch(
  '/organizations/:organizationId',
  requireAuth(),
  requireOrganization(),
  requirePermission({
    organization: ['update'],
  }),
  handler,
);pnpm --filter @ai-pass/auth-core test