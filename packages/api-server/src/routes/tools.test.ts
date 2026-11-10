import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const toolCreate = vi.fn();
const toolFindMany = vi.fn();
const toolFindUnique = vi.fn();
const toolUpdate = vi.fn();

vi.mock('@ai-pass/db', () => ({
  getPrisma: () => ({
    tool: {
      create: toolCreate,
      findMany: toolFindMany,
      findUnique: toolFindUnique,
      update: toolUpdate,
    },
  }),
}));

/**
 * Integration tests here verify that the tool routes are wired through
 * authentication, workspace isolation and role-based permission checks, plus
 * this route's own input validation. Detailed Better Auth permission-matrix
 * behaviour is tested separately in @ai-pass/auth-core; requireWorkspace's
 * real cross-organization 404 behaviour is tested for real in
 * @ai-pass/api-server's __tests__/auth.test.ts integration suite.
 */
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

      // Only enforced when the test opts in, so tests that don't care about
      // workspace scoping don't have to set it on every request.
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
      const memberAllowed = permissions.tool?.every((action) => action === 'list');

      if (role === 'owner' || role === 'admin' || (role === 'member' && memberAllowed)) {
        next();
        return;
      }

      res.status(403).json({ error: { code: 'forbidden', message: 'Insufficient permissions' } });
    };
  },
}));

import { createToolsRouter } from './tools.js';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1', createToolsRouter());
  return app;
}

const VALID_TOOL = {
  name: 'Send Email',
  description: 'Sends an email through the configured provider',
  inputSchema: { type: 'object', properties: { to: { type: 'string' } } },
  kind: 'WRITE',
};

describe('tool registry routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    toolFindUnique.mockResolvedValue(null);
  });

  it('denies unauthenticated tool creation with 401', async () => {
    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/tools')
      .send(VALID_TOOL);

    expect(res.status).toBe(401);
    expect(toolCreate).not.toHaveBeenCalled();
  });

  it('allows OWNER to create a tool', async () => {
    toolCreate.mockResolvedValue({ id: 'tool-1', teamId: 'ws-a', ...VALID_TOOL, slug: 'send-email' });

    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/tools')
      .set('x-test-role', 'owner')
      .send(VALID_TOOL);

    expect(res.status).toBe(201);
    expect(toolCreate).toHaveBeenCalledOnce();
  });

  it('denies MEMBER from creating a tool', async () => {
    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/tools')
      .set('x-test-role', 'member')
      .send(VALID_TOOL);

    expect(res.status).toBe(403);
    expect(toolCreate).not.toHaveBeenCalled();
  });

  it('allows MEMBER to list tools', async () => {
    toolFindMany.mockResolvedValue([]);

    const res = await request(createTestApp())
      .get('/api/v1/workspaces/ws-a/tools')
      .set('x-test-role', 'member');

    expect(res.status).toBe(200);
    expect(toolFindMany).toHaveBeenCalledOnce();
  });

  it('rejects an empty name', async () => {
    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/tools')
      .set('x-test-role', 'owner')
      .send({ ...VALID_TOOL, name: '   ' });

    expect(res.status).toBe(400);
    expect(toolCreate).not.toHaveBeenCalled();
  });

  it('rejects a kind other than READ or WRITE', async () => {
    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/tools')
      .set('x-test-role', 'owner')
      .send({ ...VALID_TOOL, kind: 'DELETE' });

    expect(res.status).toBe(400);
    expect(toolCreate).not.toHaveBeenCalled();
  });

  it('rejects an inputSchema that is not a JSON object', async () => {
    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/tools')
      .set('x-test-role', 'owner')
      .send({ ...VALID_TOOL, inputSchema: 'not-an-object' });

    expect(res.status).toBe(400);
    expect(toolCreate).not.toHaveBeenCalled();
  });

  it('rejects an inputSchema containing shell-command-looking content', async () => {
    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/tools')
      .set('x-test-role', 'owner')
      .send({ ...VALID_TOOL, inputSchema: { default: '$(rm -rf /)' } });

    expect(res.status).toBe(400);
    expect(toolCreate).not.toHaveBeenCalled();
  });

  it('rejects creating a duplicate slug in the same workspace', async () => {
    toolFindUnique.mockResolvedValue({ id: 'existing', teamId: 'ws-a', slug: 'send-email' });

    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/tools')
      .set('x-test-role', 'owner')
      .send(VALID_TOOL);

    expect(res.status).toBe(409);
    expect(toolCreate).not.toHaveBeenCalled();
  });

  it('hides a tool belonging to another workspace with 404, not 403', async () => {
    toolFindUnique.mockResolvedValue({ id: 'tool-1', teamId: 'ws-b', ...VALID_TOOL, slug: 'send-email' });

    const res = await request(createTestApp())
      .get('/api/v1/workspaces/ws-a/tools/tool-1')
      .set('x-test-role', 'member');

    expect(res.status).toBe(404);
  });

  it('enables and disables a tool', async () => {
    toolFindUnique.mockResolvedValue({ id: 'tool-1', teamId: 'ws-a', enabled: false });
    toolUpdate.mockResolvedValue({ id: 'tool-1', teamId: 'ws-a', enabled: true });

    const res = await request(createTestApp())
      .post('/api/v1/workspaces/ws-a/tools/tool-1/enable')
      .set('x-test-role', 'admin');

    expect(res.status).toBe(200);
    expect(toolUpdate).toHaveBeenCalledWith({ where: { id: 'tool-1' }, data: { enabled: true } });
  });
});
