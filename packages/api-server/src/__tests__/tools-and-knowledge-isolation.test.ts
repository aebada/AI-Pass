import { randomUUID } from 'node:crypto';
import { disconnectPrisma, getPrisma } from '@ai-pass/db';
import type { Express } from 'express';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApiServer } from '../index.js';
import { agentFor, resetDatabase, signedInAgent } from './support.js';

// Same rationale as auth.test.ts: without a database there is nothing
// meaningful to assert, so this suite skips locally rather than mocking its
// way to a green result. It must not silently skip in CI.
const hasDatabase = Boolean(process.env.DATABASE_URL);

if (!hasDatabase && process.env.CI) {
  throw new Error(
    'DATABASE_URL is not set in CI. The tools/knowledge isolation suite must run there, ' +
      'not skip. Check the env list on the test task in turbo.json.',
  );
}

describe.skipIf(!hasDatabase)('tool and knowledge base isolation', () => {
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

  const VALID_TOOL = {
    name: 'Send Email',
    description: 'Sends an email through the configured provider',
    inputSchema: { type: 'object', properties: { to: { type: 'string' } } },
    kind: 'WRITE',
  };

  const VALID_KB = {
    name: 'Product Docs',
    description: 'Public product documentation',
    sourceType: 'placeholder',
  };

  describe('role permissions within a workspace', () => {
    it('lets the owner create a tool and a member list it but not create one', async () => {
      const { agent, me } = await signedInAgent(app, 'owner@example.com');
      const workspaceId = me.workspaces[0]!.id;

      const created = await agent
        .post(`/api/v1/workspaces/${workspaceId}/tools`)
        .send(VALID_TOOL);
      expect(created.status).toBe(201);

      const outsider = await signedInAgent(app, 'restricted@example.com');
      const prisma = getPrisma();
      await prisma.member.create({
        data: { id: randomUUID(), organizationId: me.organizationId!, userId: outsider.me.user.id, role: 'member' },
      });
      await prisma.teamMember.create({
        data: { id: randomUUID(), teamId: workspaceId, userId: outsider.me.user.id },
      });
      await prisma.session.updateMany({
        where: { userId: outsider.me.user.id },
        data: { activeOrganizationId: me.organizationId },
      });

      const list = await outsider.agent.get(`/api/v1/workspaces/${workspaceId}/tools`);
      expect(list.status).toBe(200);

      const attemptCreate = await outsider.agent
        .post(`/api/v1/workspaces/${workspaceId}/tools`)
        .send({ ...VALID_TOOL, name: 'Another Tool' });
      expect(attemptCreate.status).toBe(403);
    });
  });

  describe('cross-organization isolation', () => {
    it('cannot read a tool belonging to another organization', async () => {
      const orgA = await signedInAgent(app, 'orga-tools@example.com');
      const workspaceA = orgA.me.workspaces[0]!.id;
      const created = await orgA.agent.post(`/api/v1/workspaces/${workspaceA}/tools`).send(VALID_TOOL);
      const toolId = created.body.tool.id as string;

      const orgB = await signedInAgent(app, 'orgb-tools@example.com');
      const workspaceB = orgB.me.workspaces[0]!.id;

      const res = await orgB.agent.get(`/api/v1/workspaces/${workspaceB}/tools/${toolId}`);

      // 404, not 403 — matches this codebase's established convention for
      // hiding cross-tenant existence (see requireWorkspace's own workspace
      // lookup, and docs/AUTH-API.md's note on why).
      expect(res.status).toBe(404);
    });

    it('cannot read a knowledge base belonging to another organization', async () => {
      const orgA = await signedInAgent(app, 'orga-kb@example.com');
      const workspaceA = orgA.me.workspaces[0]!.id;
      const created = await orgA.agent
        .post(`/api/v1/workspaces/${workspaceA}/knowledge-bases`)
        .send(VALID_KB);
      const kbId = created.body.knowledgeBase.id as string;

      const orgB = await signedInAgent(app, 'orgb-kb@example.com');
      const workspaceB = orgB.me.workspaces[0]!.id;

      const res = await orgB.agent.get(`/api/v1/workspaces/${workspaceB}/knowledge-bases/${kbId}`);

      expect(res.status).toBe(404);
    });
  });

  describe('cross-workspace binding isolation', () => {
    it('cannot bind another workspace\'s tool to an agent', async () => {
      const owner = await signedInAgent(app, 'multi-workspace-owner@example.com');
      const workspaceA = owner.me.workspaces[0]!.id;

      const secondWorkspace = await owner.agent
        .post(`/api/v1/organizations/${owner.me.organizationId}/workspaces`)
        .send({ name: 'Second Workspace' });
      const workspaceB = secondWorkspace.body.workspace.id as string;

      const toolInB = await owner.agent
        .post(`/api/v1/workspaces/${workspaceB}/tools`)
        .send(VALID_TOOL);
      const toolId = toolInB.body.tool.id as string;

      const agentId = randomUUID();
      const res = await owner.agent
        .post(`/api/v1/workspaces/${workspaceA}/agents/${agentId}/tools`)
        .send({ toolId });

      // The tool resolves, just not inside workspace A, so it is hidden the
      // same way a cross-organization resource is.
      expect(res.status).toBe(404);
    });

    it('cannot bind another workspace\'s knowledge base to an agent', async () => {
      const owner = await signedInAgent(app, 'multi-workspace-kb-owner@example.com');
      const workspaceA = owner.me.workspaces[0]!.id;

      const secondWorkspace = await owner.agent
        .post(`/api/v1/organizations/${owner.me.organizationId}/workspaces`)
        .send({ name: 'Second Workspace' });
      const workspaceB = secondWorkspace.body.workspace.id as string;

      const kbInB = await owner.agent
        .post(`/api/v1/workspaces/${workspaceB}/knowledge-bases`)
        .send({ ...VALID_KB, status: 'ACTIVE' });
      const knowledgeBaseId = kbInB.body.knowledgeBase.id as string;

      const agentId = randomUUID();
      const res = await owner.agent
        .post(`/api/v1/workspaces/${workspaceA}/agents/${agentId}/knowledge-bases`)
        .send({ knowledgeBaseId });

      expect(res.status).toBe(404);
    });
  });

  describe('binding rules', () => {
    it('rejects a duplicate agent-tool binding', async () => {
      const { agent, me } = await signedInAgent(app, 'duplicate-tool-binding@example.com');
      const workspaceId = me.workspaces[0]!.id;

      const tool = await agent.post(`/api/v1/workspaces/${workspaceId}/tools`).send(VALID_TOOL);
      const toolId = tool.body.tool.id as string;
      const agentId = randomUUID();

      const first = await agent
        .post(`/api/v1/workspaces/${workspaceId}/agents/${agentId}/tools`)
        .send({ toolId });
      expect(first.status).toBe(201);

      const second = await agent
        .post(`/api/v1/workspaces/${workspaceId}/agents/${agentId}/tools`)
        .send({ toolId });
      expect(second.status).toBe(409);
    });

    it('rejects a duplicate agent-knowledge-base binding', async () => {
      const { agent, me } = await signedInAgent(app, 'duplicate-kb-binding@example.com');
      const workspaceId = me.workspaces[0]!.id;

      const kb = await agent
        .post(`/api/v1/workspaces/${workspaceId}/knowledge-bases`)
        .send({ ...VALID_KB, status: 'ACTIVE' });
      const knowledgeBaseId = kb.body.knowledgeBase.id as string;
      const agentId = randomUUID();

      const first = await agent
        .post(`/api/v1/workspaces/${workspaceId}/agents/${agentId}/knowledge-bases`)
        .send({ knowledgeBaseId });
      expect(first.status).toBe(201);

      const second = await agent
        .post(`/api/v1/workspaces/${workspaceId}/agents/${agentId}/knowledge-bases`)
        .send({ knowledgeBaseId });
      expect(second.status).toBe(409);
    });

    it('rejects binding a disabled tool', async () => {
      const { agent, me } = await signedInAgent(app, 'disabled-tool@example.com');
      const workspaceId = me.workspaces[0]!.id;

      const tool = await agent.post(`/api/v1/workspaces/${workspaceId}/tools`).send(VALID_TOOL);
      const toolId = tool.body.tool.id as string;
      await agent.post(`/api/v1/workspaces/${workspaceId}/tools/${toolId}/disable`);

      const res = await agent
        .post(`/api/v1/workspaces/${workspaceId}/agents/${randomUUID()}/tools`)
        .send({ toolId });

      expect(res.status).toBe(409);
    });

    it('rejects binding a knowledge base that has not been activated', async () => {
      const { agent, me } = await signedInAgent(app, 'pending-kb@example.com');
      const workspaceId = me.workspaces[0]!.id;

      // No status override — defaults to PENDING.
      const kb = await agent.post(`/api/v1/workspaces/${workspaceId}/knowledge-bases`).send(VALID_KB);
      const knowledgeBaseId = kb.body.knowledgeBase.id as string;

      const res = await agent
        .post(`/api/v1/workspaces/${workspaceId}/agents/${randomUUID()}/knowledge-bases`)
        .send({ knowledgeBaseId });

      expect(res.status).toBe(409);
    });

    it('excludes a disabled binding\'s tool state from what a runtime reader would see as usable', async () => {
      // There is no runtime-loader endpoint yet (depends on Arash's
      // Agent/AgentVersion + publish mechanism). This asserts the one thing
      // that IS implemented now: an agent's binding list surfaces the tool's
      // live enabled state, so a future loader can filter on it without a
      // second query.
      const { agent, me } = await signedInAgent(app, 'binding-state@example.com');
      const workspaceId = me.workspaces[0]!.id;
      const agentId = randomUUID();

      const tool = await agent.post(`/api/v1/workspaces/${workspaceId}/tools`).send(VALID_TOOL);
      const toolId = tool.body.tool.id as string;
      await agent.post(`/api/v1/workspaces/${workspaceId}/agents/${agentId}/tools`).send({ toolId });
      await agent.post(`/api/v1/workspaces/${workspaceId}/tools/${toolId}/disable`);

      const bindings = await agent.get(`/api/v1/workspaces/${workspaceId}/agents/${agentId}/tools`);

      expect(bindings.status).toBe(200);
      expect(bindings.body.bindings[0].tool.enabled).toBe(false);
    });
  });

  describe('archived knowledge bases', () => {
    it('archive is a one-way transition not reachable via PATCH', async () => {
      const { agent, me } = await signedInAgent(app, 'archive-flow@example.com');
      const workspaceId = me.workspaces[0]!.id;

      const kb = await agent
        .post(`/api/v1/workspaces/${workspaceId}/knowledge-bases`)
        .send({ ...VALID_KB, status: 'ACTIVE' });
      const knowledgeBaseId = kb.body.knowledgeBase.id as string;

      const archived = await agent.post(
        `/api/v1/workspaces/${workspaceId}/knowledge-bases/${knowledgeBaseId}/archive`,
      );
      expect(archived.status).toBe(200);
      expect(archived.body.knowledgeBase.status).toBe('ARCHIVED');

      const reread = await agent.get(`/api/v1/workspaces/${workspaceId}/knowledge-bases/${knowledgeBaseId}`);
      expect(reread.body.knowledgeBase.status).toBe('ARCHIVED');
    });
  });

  it('refuses an unauthenticated caller entirely', async () => {
    const res = await agentFor(app).get('/api/v1/workspaces/anything/tools');
    expect(res.status).toBe(401);
  });
});
