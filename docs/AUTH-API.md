# Auth API

The backend auth service runs in `packages/api-server` on port 4000 and is
mounted at `/api/auth`. Endpoint paths below are the ones the current
configuration actually exposes.

Sessions are cookies. Every browser call must send credentials:

```ts
fetch('http://localhost:4000/api/auth/get-session', { credentials: 'include' })
```

The origin must appear in `AUTH_TRUSTED_ORIGINS` or CORS will reject the
request. There is no wildcard, because the requests carry cookies.

## Sign-in and registration

| Method | Path | Body |
|---|---|---|
| POST | `/api/auth/sign-up/email` | `name`, `email`, `password` |
| POST | `/api/auth/sign-in/email` | `email`, `password` |
| POST | `/api/auth/sign-in/social` | `provider: "google"`, `callbackURL` |
| POST | `/api/auth/sign-out` | — |
| GET | `/api/auth/get-session` | — |

Passwords are a minimum of 12 characters. `autoSignIn` is off, so registration
does not create a session; the client signs in as a second step.

Sign-in returns the same error for an unknown email and a wrong password. This
is deliberate. Do not add a "no account found" message on the client, because
that reintroduces the account enumeration this avoids.

Registration is rate limited to 10 per hour per client and sign-in to 5 per
minute. Tests that loop over failed sign-ins will hit this.

## Session management

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/auth/list-sessions` | Sessions for the current user |
| POST | `/api/auth/revoke-session` | Revoke one session by token |
| POST | `/api/auth/revoke-sessions` | Revoke all sessions |
| POST | `/api/auth/change-password` | Requires the current password |
| POST | `/api/auth/update-user` | Name and image |

Sessions last seven days and refresh once a day of activity.

## Organizations and workspaces

A workspace is a team. The endpoint names come from the organization plugin.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/organization/create` | Create an organization |
| POST | `/api/auth/organization/set-active` | Switch active organization |
| GET | `/api/auth/organization/list` | Organizations the caller belongs to |
| GET | `/api/auth/organization/get-full-organization` | Members, teams, invitations |
| POST | `/api/auth/organization/invite-member` | Invite by email and role |
| POST | `/api/auth/organization/accept-invitation` | Accept an invitation |
| POST | `/api/auth/organization/cancel-invitation` | Cancel a pending invitation |
| GET | `/api/auth/organization/list-members` | Members |
| POST | `/api/auth/organization/update-member-role` | Change a member's role |
| POST | `/api/auth/organization/remove-member` | Remove a member |
| POST | `/api/auth/organization/create-team` | Create a workspace |
| GET | `/api/auth/organization/list-teams` | Workspaces |
| POST | `/api/auth/organization/set-active-team` | Switch active workspace |
| POST | `/api/auth/organization/add-team-member` | Add someone to a workspace |
| POST | `/api/auth/organization/remove-team-member` | Remove from a workspace |
| POST | `/api/auth/organization/has-permission` | Check a permission |

The active organization and the active workspace are stored on the session
row, not sent by the client. A caller cannot act as another organization by
changing a header or a body field.

## Application routes

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/me` | Caller, organization, role, visible workspaces |
| GET | `/api/v1/workspaces/:workspaceId` | One workspace and its model routing settings |

`/api/v1/me` returns every workspace in the organization for an owner or admin,
and only the caller's own workspaces otherwise.

Errors on `/api/v1` use one envelope:

```json
{ "error": { "code": "forbidden", "message": "Not a member of this workspace" } }
```

Codes are `unauthenticated` (401), `forbidden` (403), `not_found` (404) and
`invalid_request` (400). Endpoints under `/api/auth` return Better Auth's own
error shape, which is left as-is rather than translated.

A workspace belonging to another organization returns 404, not 403, so that
workspace ids cannot be probed across organizations. A test asserting 403 for
that case is asserting the wrong thing.

## Roles

Three roles: `owner`, `admin`, `member`. The full matrix is in
`docs/specs/2026-09-04-auth-and-workspace-model.md` and is enforced by
`packages/auth-core/src/server/permissions.ts`. The test in
`permissions.test.ts` covers it cell by cell.

The first user to register gets an organization and a `General` workspace, and
becomes its owner.

## Account linking

Signing in with Google using an address that already has a password account
fails rather than linking the two. Linking is disabled on purpose.

Enabling it would let someone register with an address they do not control and
be linked to the real owner the moment that owner signs in with Google. The
protection against that is verifying the address on the password side, which
needs an email provider. Turn linking on in the same change that makes email
verification work, not before.

## Not yet available

These are configured in schema or planned but do not work today:

- Password reset and email verification. The endpoints exist but no
  transactional email provider is wired up, so nothing is delivered.
- Magic link sign-in. Same reason.
- Enterprise SSO over OIDC and SAML. Needs an identity provider to test
  against.
- Workspace API keys.

`apps/web` still runs its own Auth.js Google flow and does not yet call this
service. Moving it across is a frontend task.
