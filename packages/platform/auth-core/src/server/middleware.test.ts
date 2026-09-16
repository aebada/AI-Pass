import { randomUUID } from 'node:crypto';
import { getPrisma } from '@ai-pass/db';
import type { NextFunction, Request, Response } from 'express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getAuth } from './auth.js';
import { requireAuth, requirePermission, requireWorkspace } from './middleware.js';

// Integration tests: real Postgres, real Better Auth sign-up/sign-in, real
// Prisma rows. Requires DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL and
// AUTH_TRUSTED_ORIGINS to be set, same as running the API server itself (see
// docs/ENVIRONMENTS.md). CI provides these against a disposable Postgres
// service.
//
// Fixture shape follows docs/specs/2026-09-04-auth-and-workspace-model.md's
// testing section: one organization with an owner, an admin, and a member,
// two workspaces, and a member deliberately belonging to only one of them.
// That last detail is what catches broken workspace isolation.

const prisma = getPrisma();
const auth = getAuth();
const PASSWORD = 'correct horse battery staple';

interface Actor {
  id: string;
  cookie: string;
}

type Outcome = { type: 'next' } | { type: 'response'; status: number; body: unknown };

function mockReq(cookie: string, params: Record<string, string> = {}): Request {
  return { headers: { cookie }, params } as unknown as Request;
}

/** Runs an Express-shaped middleware without an HTTP server, resolving with
 * whichever of `next()` or `res.json()` fires first. */
function invoke(
  handler: (req: Request, res: Response, next: NextFunction) => void,
  req: Request,
): Promise<Outcome> {
  return new Promise((resolve, reject) => {
    let statusCode = 200;
    const res = {
      status(code: number) {
        statusCode = code;
        return res;
      },
      json(body: unknown) {
        resolve({ type: 'response', status: statusCode, body });
        return res;
      },
    } as unknown as Response;

    const next = ((err?: unknown) => {
      if (err) reject(err);
      else resolve({ type: 'next' });
    }) as NextFunction;

    try {
      handler(req, res, next);
    } catch (err) {
      reject(err);
    }
  });
}

/** Runs requireAuth() and returns the same request object, now carrying
 * req.auth, so a second middleware can be invoked on top of it. */
async function authenticated(cookie: string, params: Record<string, string> = {}): Promise<Request> {
  const req = mockReq(cookie, params);
  const outcome = await invoke(requireAuth(), req);
  if (outcome.type !== 'next') {
    throw new Error(`requireAuth did not authenticate: ${JSON.stringify(outcome)}`);
  }
  return req;
}

async function signUpAndSignIn(email: string): Promise<Actor> {
  const signUp = await auth.api.signUpEmail({
    body: { name: email.split('@')[0], email, password: PASSWORD },
  });

  const signIn = await auth.api.signInEmail({
    body: { email, password: PASSWORD },
    returnHeaders: true,
  });

  const cookie = signIn.headers
    .getSetCookie()
    .map((raw) => raw.split(';')[0])
    .join('; ');

  return { id: signUp.user.id, cookie };
}

async function addMember(organizationId: string, userId: string, role: string): Promise<void> {
  await prisma.member.create({ data: { id: randomUUID(), organizationId, userId, role } });
}

async function addTeamMember(teamId: string, userId: string): Promise<void> {
  await prisma.teamMember.create({ data: { id: randomUUID(), teamId, userId } });
}

async function organizationIdFor(userId: string): Promise<string> {
  const membership = await prisma.member.findFirstOrThrow({ where: { userId } });
  return membership.organizationId;
}

describe('organization and workspace access control', () => {
  let organizationId: string;
  let workspaceAId: string; // the auto-provisioned "General" workspace
  let workspaceBId: string; // second workspace; only `owner` and `admin` belong to it
  let owner: Actor;
  let admin: Actor;
  let member: Actor;
  let outsider: Actor;
  let outsiderWorkspaceId: string;

  beforeAll(async () => {
    const suffix = randomUUID().slice(0, 8);

    // First sign-in with no existing membership auto-provisions an
    // organization and a default workspace (packages/platform/auth-core/src/server/provisioning.ts).
    owner = await signUpAndSignIn(`owner-${suffix}@example.com`);
    organizationId = await organizationIdFor(owner.id);
    const workspaceA = await prisma.team.findFirstOrThrow({ where: { organizationId } });
    workspaceAId = workspaceA.id;

    const workspaceB = await prisma.team.create({
      data: { id: randomUUID(), name: 'Second workspace', organizationId, memberCount: 0 },
    });
    workspaceBId = workspaceB.id;

    // Sign up (no session yet — autoSignIn is disabled) and seed membership
    // directly, so their first sign-in finds existing membership and skips
    // provisioning a *new*, separate organization for them.
    const adminSignUp = await auth.api.signUpEmail({
      body: { name: 'admin', email: `admin-${suffix}@example.com`, password: PASSWORD },
    });
    await addMember(organizationId, adminSignUp.user.id, 'admin');
    await addTeamMember(workspaceAId, adminSignUp.user.id);
    await addTeamMember(workspaceBId, adminSignUp.user.id);

    const memberSignUp = await auth.api.signUpEmail({
      body: { name: 'member', email: `member-${suffix}@example.com`, password: PASSWORD },
    });
    await addMember(organizationId, memberSignUp.user.id, 'member');
    // Deliberately only workspace A — this is what proves workspace
    // isolation, not just organization isolation.
    await addTeamMember(workspaceAId, memberSignUp.user.id);

    const adminSignIn = await auth.api.signInEmail({
      body: { email: `admin-${suffix}@example.com`, password: PASSWORD },
      returnHeaders: true,
    });
    admin = {
      id: adminSignUp.user.id,
      cookie: adminSignIn.headers
        .getSetCookie()
        .map((raw) => raw.split(';')[0])
        .join('; '),
    };

    const memberSignIn = await auth.api.signInEmail({
      body: { email: `member-${suffix}@example.com`, password: PASSWORD },
      returnHeaders: true,
    });
    member = {
      id: memberSignUp.user.id,
      cookie: memberSignIn.headers
        .getSetCookie()
        .map((raw) => raw.split(';')[0])
        .join('; '),
    };

    // A user with no seeded membership at all — their sign-in provisions a
    // *separate* organization and workspace, unrelated to the one above.
    outsider = await signUpAndSignIn(`outsider-${suffix}@example.com`);
    const outsiderWorkspace = await prisma.team.findFirstOrThrow({
      where: { organizationId: await organizationIdFor(outsider.id) },
    });
    outsiderWorkspaceId = outsiderWorkspace.id;
  });

  afterAll(async () => {
    // Cascades (schema.prisma onDelete: Cascade) take care of member/team/
    // teamMember/invitation/session/account rows for each organization/user.
    await prisma.organization.deleteMany({ where: { id: { in: [organizationId, await organizationIdFor(outsider.id)] } } });
    await prisma.user.deleteMany({ where: { id: { in: [owner.id, admin.id, member.id, outsider.id] } } });
  });

  describe('requireAuth', () => {
    it('rejects a request with no session', async () => {
      const outcome = await invoke(requireAuth(), mockReq(''));
      expect(outcome).toMatchObject({ status: 401, body: { error: { code: 'unauthenticated' } } });
    });

    it('attaches the caller, active organization and role for a real session', async () => {
      const req = await authenticated(owner.cookie);
      expect(req.auth?.organizationId).toBe(organizationId);
      expect(req.auth?.role).toBe('owner');
      expect(req.auth?.user.id).toBe(owner.id);
    });
  });

  describe('requireWorkspace: prevents cross-organization access', () => {
    it('allows a member into a workspace they belong to', async () => {
      const req = await authenticated(member.cookie, { workspaceId: workspaceAId });
      const outcome = await invoke(requireWorkspace(), req);
      expect(outcome).toEqual({ type: 'next' });
    });

    it('rejects a member from a workspace in their own organization they do not belong to', async () => {
      const req = await authenticated(member.cookie, { workspaceId: workspaceBId });
      const outcome = await invoke(requireWorkspace(), req);
      expect(outcome).toMatchObject({ status: 403, body: { error: { code: 'forbidden' } } });
    });

    it('lets an admin into any workspace in their organization regardless of membership row', async () => {
      const req = await authenticated(admin.cookie, { workspaceId: workspaceBId });
      const outcome = await invoke(requireWorkspace(), req);
      expect(outcome).toEqual({ type: 'next' });
    });

    it('returns 404, not 403, for a workspace belonging to a different organization', async () => {
      // The acceptance case: a member of one organization must not be able to
      // reach another organization's workspace, and the response must not
      // distinguish "exists but forbidden" from "does not exist" (see
      // docs/AUTH-API.md's note on why this is 404 rather than 403).
      const req = await authenticated(member.cookie, { workspaceId: outsiderWorkspaceId });
      const outcome = await invoke(requireWorkspace(), req);
      expect(outcome).toMatchObject({ status: 404, body: { error: { code: 'not_found' } } });
    });

    it('returns 404 for the organization owner too, not just members', async () => {
      const req = await authenticated(owner.cookie, { workspaceId: outsiderWorkspaceId });
      const outcome = await invoke(requireWorkspace(), req);
      expect(outcome).toMatchObject({ status: 404 });
    });
  });

  describe('requirePermission: organization update/delete, end to end', () => {
    it('allows an owner to update the organization', async () => {
      const req = await authenticated(owner.cookie);
      const outcome = await invoke(requirePermission({ organization: ['update'] }), req);
      expect(outcome).toEqual({ type: 'next' });
    });

    it('allows an admin to update the organization', async () => {
      const req = await authenticated(admin.cookie);
      const outcome = await invoke(requirePermission({ organization: ['update'] }), req);
      expect(outcome).toEqual({ type: 'next' });
    });

    it('denies a member from updating the organization', async () => {
      const req = await authenticated(member.cookie);
      const outcome = await invoke(requirePermission({ organization: ['update'] }), req);
      expect(outcome).toMatchObject({ status: 403 });
    });

    it('denies an admin from deleting the organization (owner only)', async () => {
      const req = await authenticated(admin.cookie);
      const outcome = await invoke(requirePermission({ organization: ['delete'] }), req);
      expect(outcome).toMatchObject({ status: 403 });
    });

    it('allows the owner to delete the organization', async () => {
      const req = await authenticated(owner.cookie);
      const outcome = await invoke(requirePermission({ organization: ['delete'] }), req);
      expect(outcome).toEqual({ type: 'next' });
    });
  });
});

describe('organization CRUD via the Better Auth API', () => {
  let owner: Actor;
  let member: Actor;
  let organizationId: string;

  beforeAll(async () => {
    const suffix = randomUUID().slice(0, 8);
    owner = await signUpAndSignIn(`crud-owner-${suffix}@example.com`);
    organizationId = await organizationIdFor(owner.id);

    const memberSignUp = await auth.api.signUpEmail({
      body: { name: 'member', email: `crud-member-${suffix}@example.com`, password: PASSWORD },
    });
    await addMember(organizationId, memberSignUp.user.id, 'member');
    const memberSignIn = await auth.api.signInEmail({
      body: { email: `crud-member-${suffix}@example.com`, password: PASSWORD },
      returnHeaders: true,
    });
    member = {
      id: memberSignUp.user.id,
      cookie: memberSignIn.headers
        .getSetCookie()
        .map((raw) => raw.split(';')[0])
        .join('; '),
    };
  });

  it('lets the owner retrieve one organization by id', async () => {
    const result = await auth.api.getOrganization({
      query: { organizationId },
      headers: new Headers({ cookie: owner.cookie }),
    });
    expect(result?.id).toBe(organizationId);
  });

  it('lets the owner update the organization and bumps updatedAt', async () => {
    const before = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });

    const updated = await auth.api.updateOrganization({
      body: { organizationId, data: { name: 'Renamed via test' } },
      headers: new Headers({ cookie: owner.cookie }),
    });

    expect(updated?.name).toBe('Renamed via test');

    const after = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
    expect(after.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());
  });

  it('rejects a member trying to update the organization', async () => {
    await expect(
      auth.api.updateOrganization({
        body: { organizationId, data: { name: 'Should not apply' } },
        headers: new Headers({ cookie: member.cookie }),
      }),
    ).rejects.toThrow();
  });

  it('rejects a member trying to delete the organization, then lets the owner delete it', async () => {
    await expect(
      auth.api.deleteOrganization({
        body: { organizationId },
        headers: new Headers({ cookie: member.cookie }),
      }),
    ).rejects.toThrow();

    await auth.api.deleteOrganization({
      body: { organizationId },
      headers: new Headers({ cookie: owner.cookie }),
    });

    const gone = await prisma.organization.findUnique({ where: { id: organizationId } });
    expect(gone).toBeNull();
  });

  afterAll(async () => {
    // The organization may already be gone if the delete test above ran.
    await prisma.organization.deleteMany({ where: { id: organizationId } });
    await prisma.user.deleteMany({ where: { id: { in: [owner.id, member.id] } } });
  });
});
