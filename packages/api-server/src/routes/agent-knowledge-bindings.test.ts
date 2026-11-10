import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const knowledgeBaseFindUnique = vi.fn();
const bindingFindUnique = vi.fn();
const bindingFindMany = vi.fn();
const bindingCreate = vi.fn();
const bindingUpdate = vi.fn();
const bindingDelete = vi.fn();

vi.mock('@ai-pass/db', () => ({
  getPrisma: () => ({
    knowledgeBase: { findUnique: knowledgeBaseFindUnique },
    agentKnowledgeBinding: {
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
      const memberAllowed = permissions.knowledgeBase?.every((action) => action === 'list');
      if (role === 'owner' || role === 'admin' || (role === 'member' && memberAllowed)) {
        next();
        return;
      }
      res.status(403).json({ error: { code: 'forbidden', message: 'Insufficient permissions' } });
    };
  },
}));

import { createAgentKnowledgeBindingsRouter } from './agent-knowledge-bindings.js';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1', createAgentKnowledgeBindingsRouter());
  return app;
}

describe('agent-knowledge binding routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('denies MEMBER from binding a knowledge base', async () => {
    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/agents/agent-1/knowledge-bases')
      .set('x-test-role', 'member')
      .send({ knowledgeBaseId: 'kb-1' });

    expect(res.status).toBe(403);
    expect(bindingCreate).not.toHaveBeenCalled();
  });

  it('404s when the knowledge base does not belong to the workspace', async () => {
    knowledgeBaseFindUnique.mockResolvedValue({ id: 'kb-1', teamId: 'ws-b', status: 'ACTIVE' });

    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/agents/agent-1/knowledge-bases')
      .set('x-test-role', 'owner')
      .send({ knowledgeBaseId: 'kb-1' });

    expect(res.status).toBe(404);
    expect(bindingCreate).not.toHaveBeenCalled();
  });

  it('rejects binding a knowledge base that is not ACTIVE', async () => {
    knowledgeBaseFindUnique.mockResolvedValue({ id: 'kb-1', teamId: 'ws-a', status: 'PENDING' });

    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/agents/agent-1/knowledge-bases')
      .set('x-test-role', 'owner')
      .send({ knowledgeBaseId: 'kb-1' });

    expect(res.status).toBe(409);
    expect(bindingCreate).not.toHaveBeenCalled();
  });

  it('rejects a duplicate binding', async () => {
    knowledgeBaseFindUnique.mockResolvedValue({ id: 'kb-1', teamId: 'ws-a', status: 'ACTIVE' });
    bindingFindUnique.mockResolvedValue({ id: 'existing', agentId: 'agent-1', knowledgeBaseId: 'kb-1' });

    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/agents/agent-1/knowledge-bases')
      .set('x-test-role', 'owner')
      .send({ knowledgeBaseId: 'kb-1' });

    expect(res.status).toBe(409);
    expect(bindingCreate).not.toHaveBeenCalled();
  });

  it('binds an active knowledge base to an agent', async () => {
    knowledgeBaseFindUnique.mockResolvedValue({ id: 'kb-1', teamId: 'ws-a', status: 'ACTIVE' });
    bindingFindUnique.mockResolvedValue(null);
    bindingCreate.mockResolvedValue({ id: 'binding-1', agentId: 'agent-1', knowledgeBaseId: 'kb-1' });

    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/agents/agent-1/knowledge-bases')
      .set('x-test-role', 'owner')
      .send({ knowledgeBaseId: 'kb-1' });

    expect(res.status).toBe(201);
    expect(bindingCreate).toHaveBeenCalledOnce();
  });

  it('removes a binding', async () => {
    bindingFindUnique.mockResolvedValue({ id: 'binding-1', agentId: 'agent-1', knowledgeBaseId: 'kb-1' });

    const res = await request(createTestApp())
      .delete('/api/v1/workspaces/ws-a/agents/agent-1/knowledge-bases/kb-1')
      .set('x-test-role', 'admin');

    expect(res.status).toBe(204);
    expect(bindingDelete).toHaveBeenCalledWith({ where: { id: 'binding-1' } });
  });
});
