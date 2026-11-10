import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const knowledgeBaseCreate = vi.fn();
const knowledgeBaseFindMany = vi.fn();
const knowledgeBaseFindUnique = vi.fn();
const knowledgeBaseUpdate = vi.fn();

vi.mock('@ai-pass/db', () => ({
  getPrisma: () => ({
    knowledgeBase: {
      create: knowledgeBaseCreate,
      findMany: knowledgeBaseFindMany,
      findUnique: knowledgeBaseFindUnique,
      update: knowledgeBaseUpdate,
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

      req.auth = {
        user: { id: `user-${role}`, email: `${role}@example.com` },
        session: {},
        organizationId: req.header('x-test-organization') ?? null,
        role,
      };

      next();
    };
  },

  requireWorkspace: (paramName = 'workspaceId') => {
    return (req: any, res: any, next: any) => {
      if (!req.auth) {
        res.status(401).json({ error: { code: 'unauthenticated', message: 'Sign in required' } });
        return;
      }

      const testWorkspace = req.header('x-test-workspace');
      const requested = req.params[paramName];

      if (testWorkspace && requested !== testWorkspace) {
        res.status(404).json({ error: { code: 'not_found', message: 'Workspace not found' } });
        return;
      }

      next();
    };
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

import { createKnowledgeBasesRouter } from './knowledge-bases.js';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1', createKnowledgeBasesRouter());
  return app;
}

const VALID_KB = {
  name: 'Product Docs',
  description: 'Public product documentation',
  sourceType: 'placeholder',
};

describe('knowledge base routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    knowledgeBaseFindUnique.mockResolvedValue(null);
  });

  it('denies unauthenticated creation with 401', async () => {
    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/knowledge-bases')
      .send(VALID_KB);

    expect(res.status).toBe(401);
    expect(knowledgeBaseCreate).not.toHaveBeenCalled();
  });

  it('allows OWNER to create with status defaulting to PENDING', async () => {
    knowledgeBaseCreate.mockResolvedValue({ id: 'kb-1', teamId: 'ws-a', status: 'PENDING', ...VALID_KB });

    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/knowledge-bases')
      .set('x-test-role', 'owner')
      .send(VALID_KB);

    expect(res.status).toBe(201);
    expect(knowledgeBaseCreate).toHaveBeenCalledOnce();
    expect((knowledgeBaseCreate.mock.calls[0]![0] as any).data.status).toBe('PENDING');
  });

  it('denies MEMBER from creating a knowledge base', async () => {
    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/knowledge-bases')
      .set('x-test-role', 'member')
      .send(VALID_KB);

    expect(res.status).toBe(403);
    expect(knowledgeBaseCreate).not.toHaveBeenCalled();
  });

  it('allows MEMBER to list knowledge bases', async () => {
    knowledgeBaseFindMany.mockResolvedValue([]);

    const res = await request(createTestApp())
      .get('/api/v1/workspaces/ws-a/knowledge-bases')
      .set('x-test-role', 'member');

    expect(res.status).toBe(200);
  });

  it('rejects an unknown sourceType', async () => {
    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/knowledge-bases')
      .set('x-test-role', 'owner')
      .send({ ...VALID_KB, sourceType: 'ftp' });

    expect(res.status).toBe(400);
    expect(knowledgeBaseCreate).not.toHaveBeenCalled();
  });

  it('rejects metadata containing a credential-like key', async () => {
    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/knowledge-bases')
      .set('x-test-role', 'owner')
      .send({ ...VALID_KB, metadata: { apiKey: 'sk-something' } });

    expect(res.status).toBe(400);
    expect(knowledgeBaseCreate).not.toHaveBeenCalled();
  });

  it('rejects setting ARCHIVED directly on create', async () => {
    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/knowledge-bases')
      .set('x-test-role', 'owner')
      .send({ ...VALID_KB, status: 'ARCHIVED' });

    expect(res.status).toBe(400);
    expect(knowledgeBaseCreate).not.toHaveBeenCalled();
  });

  it('rejects changing status via PATCH', async () => {
    knowledgeBaseFindUnique.mockResolvedValue({ id: 'kb-1', teamId: 'ws-a', ...VALID_KB, status: 'PENDING' });

    const res = await request(createTestApp())
      .patch('/api/v1/workspaces/ws-a/knowledge-bases/kb-1')
      .set('x-test-role', 'owner')
      .send({ status: 'ACTIVE' });

    expect(res.status).toBe(400);
    expect(knowledgeBaseUpdate).not.toHaveBeenCalled();
  });

  it('archives a knowledge base via the dedicated endpoint', async () => {
    knowledgeBaseFindUnique.mockResolvedValue({ id: 'kb-1', teamId: 'ws-a', ...VALID_KB, status: 'ACTIVE' });
    knowledgeBaseUpdate.mockResolvedValue({ id: 'kb-1', teamId: 'ws-a', ...VALID_KB, status: 'ARCHIVED' });

    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/knowledge-bases/kb-1/archive')
      .set('x-test-role', 'admin');

    expect(res.status).toBe(200);
    expect(knowledgeBaseUpdate).toHaveBeenCalledWith({
      where: { id: 'kb-1' },
      data: { status: 'ARCHIVED' },
    });
  });

  it('hides a knowledge base belonging to another workspace with 404', async () => {
    knowledgeBaseFindUnique.mockResolvedValue({ id: 'kb-1', teamId: 'ws-b', ...VALID_KB, status: 'ACTIVE' });

    const res = await request(createTestApp())
      .get('/api/v1/workspaces/ws-a/knowledge-bases/kb-1')
      .set('x-test-role', 'member');

    expect(res.status).toBe(404);
  });
});
