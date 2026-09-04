# Authentication and workspace model

Status: accepted
Date: 2026-09-04
Owner: backend team
Covers: Sprint 0 (foundation) and Sprint 1 (identity build-out)

## Problem

The repository currently contains three partial authentication implementations and no
backend database.

- `packages/auth-core` is a mock. `AuthService` stores sessions in an in-memory `Map`,
  returns fabricated redirect URLs, and hardcodes every session to `tenantId: 'demo-tenant'`.
- `apps/web` runs Auth.js v5 with Google OAuth. This works, but it lives in the frontend, so
  the desktop and mobile apps cannot share it and the backend cannot enforce anything.
- `php-auth/` is a separate PHP and MySQL service with its own `users` table, written because
  Hostinger static hosting cannot run Node API routes.

None of them model organizations, workspaces, or roles. `packages/api-server` serves static
stub data on every route with no authentication and permissive CORS, and the root
`typecheck:ci` script excludes it, so nothing verifies that it compiles.

Sprint 1 requires organizations, workspaces, and role-based access control on top of
authentication. Building those against three competing session sources is not possible, so
this document settles the identity layer first.

## Decisions

**Stack.** The backend is TypeScript inside this monorepo. The Python service in
`AI-PASS-Backend-Mono` and the PHP service in `php-auth/` are not carried forward.

**Infrastructure.** Managed Postgres with a containerized Node service, across three
environments (development, staging, production).

**Library.** [Better Auth](https://better-auth.com) rather than a hand-rolled implementation.

The deciding factor is its `organization` plugin, which maps directly onto the Sprint 1
backlog: organizations, members, invitations, and — with `teams` enabled — workspaces and
workspace membership. It also covers all four sign-in methods on the roadmap
(email/password, Google, magic link, SSO over OIDC and SAML), self-hosts with no external
identity vendor, and has adapters for Prisma and Express plus an Expo plugin for
`apps/mobile`.

Self-hosting matters beyond convenience: AI-Pass is positioned for on-premise and sovereign
deployments, which rules out Clerk, Auth0, and WorkOS regardless of their ergonomics.

The argument against hand-rolling is evidenced by the previous backend.
`AI-PASS-Backend-Mono/python/app/core/middleware/rbac.py` derives the caller's identity,
roles, and tenant from `X-User-Id`, `X-User-Roles`, and `X-Tenant-Id` request headers, all of
which the client controls. The same codebase ships an admin bootstrap token defaulting to
`CHANGE_ME_ADMIN_TOKEN`. Both are exploitable, and both are the predictable result of writing
authentication under sprint pressure.

The accepted risk is dependency on a fast-moving library. Mitigated by pinning an exact
version and by keeping application code dependent on types and middleware that `auth-core`
exports, rather than on Better Auth's own surface.

## Package layout

| Package | Responsibility |
|---|---|
| `packages/db` (new) | Prisma schema, migrations, generated client |
| `packages/auth-core` | Better Auth instance, permission matrix, exported types, Express middleware |
| `packages/api-server` | Mounts the auth handler, hosts `/api/v1` routes |

`db` is separate from `auth-core` because `wallet`, `provider-hub`, and the model gateway
need database access without depending on the auth package.

`auth-core`'s `AuthService` and its in-memory session map are deleted. The
`AuthProviderConfig` type is retained for the frontend's provider list. `AuthSession` is
replaced, since it models neither workspaces nor a trustworthy tenant.

Two implementation constraints:

- `app.all("/api/auth/*", toNodeHandler(auth))` must be registered before `express.json()`.
  Better Auth reads the raw request body itself.
- The `@ai-pass/api-server` exclusion in the root `typecheck:ci` script is removed.

## Data model

Better Auth generates `user`, `session`, `account` (OAuth links and the scrypt password
hash), and `verification`. The organization plugin adds `organization`, `member`, and
`invitation`; with `teams: { enabled: true }` it also adds `team` and `teamMember`.

| Product concept | Table |
|---|---|
| Organization | `organization` |
| Workspace | `team` |
| Organization membership and role | `member` |
| Workspace membership | `teamMember` |
| Pending invitation | `invitation` |

The plugin augments `session` with `activeOrganizationId` and `activeTeamId`. Active
organization is therefore server-side session state, not a client-supplied value. This is a
deliberate correction of the previous backend, where the tenant arrived in a request header
and could be changed by the caller at will.

Two tables are added beyond what the plugin provides.

`audit_log` records actor, organization, workspace, action, target, IP address, result, and
timestamp. It is written from Better Auth's database hooks so that sign-in, sign-out, role
changes, and invitation acceptance are captured without per-route plumbing. Auditable
authentication events are a requirement of the compliance and governance positioning, not an
enhancement.

`workspace_settings` is keyed on `team.id` and holds per-workspace model routing
configuration. It is created in this milestone with no behaviour attached, purely as the seam
the model gateway attaches to, so that the AI team is not blocked on a schema change
mid-sprint.

## Permissions

Access control is statement-based: resources map to actions, and roles grant subsets.

| Resource | Actions | owner | admin | member |
|---|---|---|---|---|
| organization | update, delete, transfer | all | update | — |
| member | invite, remove, set-role, list | all | all | list |
| workspace | create, update, delete, list | all | all | list own |
| workspace-member | add, remove | all | all | — |
| provider | configure, list | all | all | list |
| model | invoke | yes | yes | yes |
| apikey | create, revoke, list | all | all | — |
| billing | view, manage | all | view | — |
| audit | view | yes | yes | — |

Better Auth's access control is organization-scoped. It answers whether a user is an admin of
a given organization; it does not answer whether they may act inside a specific workspace.

That second check is ours. A `requireWorkspace` middleware confirms that a `teamMember` row
exists linking the caller to the target workspace, or that the caller's organization role is
`owner` or `admin`. This is the boundary between real and cosmetic workspace isolation, and
it carries its own tests.

## Flows

**Registration.** Creates a `user` and a credential `account`. A `session.create.before` hook
sets `activeOrganizationId`.

**First-login provisioning.** A user with no membership gets an organization, a default
workspace, an `owner` row in `member`, and a matching `teamMember` row. The session is then
pointed at both. Without this, a newly registered user lands in an unusable empty state.

**Google OAuth.** Same path, with an `account` row where `provider` is `google`, linked on
verified email.

**Authenticated request.** Session cookie, then `auth.api.getSession`, then `requireAuth`
attaches the user, active organization, organization role, and workspace memberships to the
request. `requirePermission(resource, action)` and `requireWorkspace(id)` compose on top.

**Switching organization.** `setActive` writes the session row. The client never asserts its
own tenant.

## Errors

`/api/v1` responses use a `{ error: { code, message } }` envelope.

Better Auth's own error codes on `/api/auth/*` are documented rather than translated.
Wrapping them means maintaining a mapping table indefinitely for no gain.

Sign-in returns an identical error for an unknown email and for a wrong password. Diverging
here creates an account enumeration oracle. Better Auth behaves correctly by default; the
behaviour is pinned by test because it is easy to break during refactoring.

Built-in rate limiting is enabled, with a tighter limit on sign-in. The audit log stores
actors and actions, never credentials or tokens.

## Testing

The permission matrix above is implemented as a table-driven test, one case per cell. It
extends mechanically and fails loudly when a role is widened.

Fixtures provide an organization with an owner, an admin, and a member, two workspaces, and a
member deliberately belonging to only one of them. That last detail is what catches broken
workspace isolation.

The cases requested by the testing team — wrong password, expired session, unauthorized
access — derive from these fixtures.

`turbo.json` currently defines no `test` task despite the root `package.json` calling
`turbo run test`. That is fixed as part of this work.

## Sequencing

Sprint 0, foundation:

1. `packages/db` with Prisma and a Postgres connection
2. Initial migration covering the Better Auth core tables
3. Better Auth instance with email and password sign-in
4. Handler mounted in `api-server`; `typecheck:ci` exclusion removed
5. GitHub Actions for typecheck, lint, and test, with migrations applied to staging
6. Development, staging, and production environment configuration

Sprint 1, identity:

7. Organization plugin: organizations, members, invitations
8. Teams enabled, providing workspaces
9. Permission matrix and middleware
10. First-login provisioning
11. Google OAuth
12. Audit log

Deferred beyond Sprint 1, and to be stated as deferred rather than assumed complete:

- Magic link, which requires choosing a transactional email provider and monitoring delivery
- SSO, which requires an identity provider to test against
- Workspace API keys, which depend on where the model gateway lands

## Consequences

`apps/web` moves from owning authentication to consuming it. The Auth.js configuration there
is replaced by the Better Auth client pointed at `api-server`. This is a frontend task and
needs coordinating rather than assuming.

`php-auth/` becomes dead code once the Node service is deployed. It should be removed in a
separate change, not silently left in the tree.

The Hostinger static export path described in `docs/AUTH.md` cannot serve authenticated
traffic. Production requires a Node runtime.
