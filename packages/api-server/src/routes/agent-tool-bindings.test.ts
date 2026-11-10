import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const toolFindUnique = vi.fn();
const bindingFindUnique = vi.fn();
const bindingFindMany = vi.fn();
const bindingCreate = vi.fn();
const bindingUpdate = vi.fn();
const bindingDelete = vi.fn();

vi.mock('@ai-pass/db', () => ({
  getPrisma: () => ({
    tool: { findUnique: toolFindUnique },
    agentToolBinding: {
      findUnique: bindingFindUnique,
      findMany: bindingFindMany,
      create: bindingCreate,
      update: bindingUpdate,
      delete: bindingDelete,
    },
  }),
}));

vi.mock('@ai-pass/auth-core/server', () => ({
  requireAuth: () => {
    return (req: any, res: any, next: any) => {
      const role = req.header('x-test-role');
      if (!role) {
        res.status(401).json({ error: { code: 'unauthenticated', message: 'Sign in required' } });
        return;
      }
      req.auth = { user: { id: `user-${role}` }, session: {}, organizationId: 'org-a', role };
      next();
    };
  },
  requireWorkspace: () => (req: any, res: any, next: any) => {
    if (!req.auth) {
      res.status(401).json({ error: { code: 'unauthenticated', message: 'Sign in required' } });
      return;
    }
    next();
  },
  requirePermission: (permissions: Record<string, string[]>) => {
    return (req: any, res: any, next: any) => {
      if (!req.auth) {
        res.status(401).json({ error: { code: 'unauthenticated', message: 'Sign in required' } });
        return;
      }
      const role = req.auth.role;
      const memberAllowed = permissions.tool?.every((action) => action === 'list');
      if (role === 'owner' || role === 'admin' || (role === 'member' && memberAllowed)) {
        next();
        return;
      }
      res.status(403).json({ error: { code: 'forbidden', message: 'Insufficient permissions' } });
    };
  },
}));

import { createAgentToolBindingsRouter } from './agent-tool-bindings.js';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1', createAgentToolBindingsRouter());
  return app;
}

describe('agent-tool binding routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('denies MEMBER from binding a tool', async () => {
    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/agents/agent-1/tools')
      .set('x-test-role', 'member')
      .send({ toolId: 'tool-1' });

    expect(res.status).toBe(403);
    expect(bindingCreate).not.toHaveBeenCalled();
  });

  it('404s when the tool does not belong to the workspace', async () => {
    toolFindUnique.mockResolvedValue({ id: 'tool-1', teamId: 'ws-b', enabled: true });

    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/agents/agent-1/tools')
      .set('x-test-role', 'owner')
      .send({ toolId: 'tool-1' });

    expect(res.status).toBe(404);
    expect(bindingCreate).not.toHaveBeenCalled();
  });

  it('rejects binding a disabled tool', async () => {
    toolFindUnique.mockResolvedValue({ id: 'tool-1', teamId: 'ws-a', enabled: false });

    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/agents/agent-1/tools')
      .set('x-test-role', 'owner')
      .send({ toolId: 'tool-1' });

    expect(res.status).toBe(409);
    expect(bindingCreate).not.toHaveBeenCalled();
  });

  it('rejects a duplicate binding', async () => {
    toolFindUnique.mockResolvedValue({ id: 'tool-1', teamId: 'ws-a', enabled: true });
    bindingFindUnique.mockResolvedValue({ id: 'existing-binding', agentId: 'agent-1', toolId: 'tool-1' });

    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/agents/agent-1/tools')
      .set('x-test-role', 'owner')
      .send({ toolId: 'tool-1' });

    expect(res.status).toBe(409);
    expect(bindingCreate).not.toHaveBeenCalled();
  });

  it('binds an enabled tool to an agent', async () => {
    toolFindUnique.mockResolvedValue({ id: 'tool-1', teamId: 'ws-a', enabled: true });
    bindingFindUnique.mockResolvedValue(null);
    bindingCreate.mockResolvedValue({ id: 'binding-1', agentId: 'agent-1', toolId: 'tool-1' });

    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/agents/agent-1/tools')
      .set('x-test-role', 'owner')
      .send({ toolId: 'tool-1' });

    expect(res.status).toBe(201);
    expect(bindingCreate).toHaveBeenCalledOnce();
  });

  it('removes a binding', async () => {
    bindingFindUnique.mockResolvedValue({ id: 'binding-1', agentId: 'agent-1', toolId: 'tool-1' });

    const res = await request(createTestApp())
      .delete('/api/v1/workspaces/ws-a/agents/agent-1/tools/tool-1')
      .set('x-test-role', 'admin');

    expect(res.status).toBe(204);
    expect(bindingDelete).toHaveBeenCalledWith({ where: { id: 'binding-1' } });
  });

  it('404s removing a binding that does not exist', async () => {
    bindingFindUnique.mockResolvedValue(null);

    const res = await request(createTestApp())
      .delete('/api/v1/workspaces/ws-a/agents/agent-1/tools/tool-1')
      .set('x-test-role', 'admin');

    expect(res.status).toBe(404);
    expect(bindingDelete).not.toHaveBeenCalled();
  });
});
