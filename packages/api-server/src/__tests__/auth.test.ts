import { randomUUID } from 'node:crypto';
import { disconnectPrisma, getPrisma } from '@ai-pass/db';
import type { Express } from 'express';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApiServer } from '../index.js';
import {
  PASSWORD,
  agentFor,
  register,
  resetDatabase,
  signIn,
  signedInAgent,
  type MePayload,
} from './support.js';

// These exercise the real Postgres schema. Without a database there is nothing
// meaningful to assert, so the suite is skipped locally rather than mocked into
// passing.
const hasDatabase = Boolean(process.env.DATABASE_URL);

// Skipping is only acceptable on a developer machine. Turbo runs tasks in
// strict environment mode, so a variable that is not declared in turbo.json
// never reaches this process, and the whole suite would skip in CI while the
// run still reported success.
if (!hasDatabase && process.env.CI) {
  throw new Error(
    'DATABASE_URL is not set in CI. The auth integration suite must run there, ' +
      'not skip. Check the env list on the test task in turbo.json.',
  );
}

describe.skipIf(!hasDatabase)('authentication', () => {
  let app: Express;

  beforeAll(() => {
    app = createApiServer();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  describe('registration', () => {
    it('creates the user with an organization and a default workspace', async () => {
      const { me } = await signedInAgent(app, 'owner@example.com', 'Owner Person');

      expect(me.user.email).toBe('owner@example.com');
      expect(me.organizationId).not.toBeNull();
      expect(me.role).toBe('owner');
      expect(me.workspaces).toHaveLength(1);
      expect(me.workspaces[0]?.name).toBe('General');
    });

    it('stores a hash, never the password itself', async () => {
      await register(agentFor(app), 'hashed@example.com');

      const account = await getPrisma().account.findFirst({
        where: { user: { email: 'hashed@example.com' } },
      });

      expect(account?.password).toBeTruthy();
      expect(account?.password).not.toContain(PASSWORD);
    });

    it('rejects a malformed email address', async () => {
      const res = await register(agentFor(app), 'not-an-email');
      expect(res.status).toBe(400);
    });

    it('rejects a password shorter than the minimum', async () => {
      const res = await agentFor(app)
        .post('/api/auth/sign-up/email')
        .send({ email: 'short@example.com', name: 'Short', password: 'abc123' });

      expect(res.status).toBe(400);
    });

    it('rejects an empty name', async () => {
      const res = await register(agentFor(app), 'noname@example.com', '   ');
      expect(res.status).toBe(400);
    });

    it('rejects a password identical to the email address', async () => {
      const res = await agentFor(app).post('/api/auth/sign-up/email').send({
        email: 'samesame@example.com',
        name: 'Same',
        password: 'samesame@example.com',
      });

      expect(res.status).toBe(400);
    });

    it('does not create a second account for an address already registered', async () => {
      await register(agentFor(app), 'duplicate@example.com');
      await register(agentFor(app), 'duplicate@example.com');

      const users = await getPrisma().user.count({ where: { email: 'duplicate@example.com' } });
      expect(users).toBe(1);
    });
  });

  describe('sign in', () => {
    it('establishes a session with correct credentials', async () => {
      const agent = agentFor(app);
      await register(agent, 'signin@example.com');

      const res = await signIn(agent, 'signin@example.com');
      expect(res.status).toBe(200);

      const me = await agent.get('/api/v1/me');
      expect(me.status).toBe(200);
      expect((me.body as MePayload).user.email).toBe('signin@example.com');
    });

    it('answers identically for a wrong password and an unknown address', async () => {
      await register(agentFor(app), 'known@example.com');

      const wrongPassword = await signIn(agentFor(app), 'known@example.com', 'wrong-password-here');
      const unknownEmail = await signIn(agentFor(app), 'nobody@example.com', PASSWORD);

      // Diverging here would let an attacker enumerate which addresses hold
      // accounts, so status and body must match exactly.
      expect(wrongPassword.status).toBe(unknownEmail.status);
      expect(wrongPassword.body).toEqual(unknownEmail.body);
      expect(wrongPassword.status).toBeGreaterThanOrEqual(400);
    });

    it('leaves no session behind after a failed attempt', async () => {
      await register(agentFor(app), 'failed@example.com');

      const agent = agentFor(app);
      await signIn(agent, 'failed@example.com', 'not-the-password');

      const me = await agent.get('/api/v1/me');
      expect(me.status).toBe(401);
    });
  });

  describe('session handling', () => {
    it('refuses the current user endpoint without a session', async () => {
      const res = await agentFor(app).get('/api/v1/me');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('unauthenticated');
    });

    it('ends the session on sign out', async () => {
      const { agent } = await signedInAgent(app, 'signout@example.com');

      expect((await agent.get('/api/v1/me')).status).toBe(200);

      await agent.post('/api/auth/sign-out').send({});

      expect((await agent.get('/api/v1/me')).status).toBe(401);
    });

    it('refuses an expired session', async () => {
      const { agent } = await signedInAgent(app, 'expired@example.com');

      await getPrisma().session.updateMany({
        data: { expiresAt: new Date(Date.now() - 60_000) },
      });

      const res = await agent.get('/api/v1/me');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('unauthenticated');
    });
  });

  describe('workspace access', () => {
    it('returns the workspace to a member of it', async () => {
      const { agent, me } = await signedInAgent(app, 'member@example.com');
      const workspaceId = me.workspaces[0]!.id;

      const res = await agent.get(`/api/v1/workspaces/${workspaceId}`);

      expect(res.status).toBe(200);
      expect(res.body.workspace.id).toBe(workspaceId);
    });

    it('hides a workspace belonging to another organization', async () => {
      const first = await signedInAgent(app, 'orga@example.com');
      const second = await signedInAgent(app, 'orgb@example.com');
      const foreignWorkspace = first.me.workspaces[0]!.id;

      const res = await second.agent.get(`/api/v1/workspaces/${foreignWorkspace}`);

      // 404 rather than 403, so workspace ids cannot be probed across
      // organization boundaries.
      expect(res.status).toBe(404);
    });

    it('refuses an organization member who is not in the workspace', async () => {
      const owner = await signedInAgent(app, 'wsowner@example.com');
      const organizationId = owner.me.organizationId!;
      const workspaceId = owner.me.workspaces[0]!.id;

      const outsider = await signedInAgent(app, 'outsider@example.com');
      const prisma = getPrisma();

      // Join the organization as a plain member without joining the workspace.
      await prisma.member.create({
        data: {
          id: randomUUID(),
          organizationId,
          userId: outsider.me.user.id,
          role: 'member',
        },
      });
      await prisma.session.updateMany({
        where: { userId: outsider.me.user.id },
        data: { activeOrganizationId: organizationId },
      });

      const res = await outsider.agent.get(`/api/v1/workspaces/${workspaceId}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('forbidden');
    });
  });

  describe('audit trail', () => {
    it('records registration and sign in', async () => {
      await signedInAgent(app, 'audited@example.com');

      const actions = await getPrisma().auditLog.findMany({ select: { action: true } });
      const seen = actions.map((entry) => entry.action);

      expect(seen).toContain('auth.user.created');
      expect(seen).toContain('auth.session.created');
    });
  });
});
