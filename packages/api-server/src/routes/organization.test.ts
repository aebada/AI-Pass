import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const organizationUpdate = vi.fn();
const teamCreate = vi.fn();

vi.mock('@ai-pass/db', () => ({
  getPrisma: () => ({
    organization: {
      update: organizationUpdate,
    },
    team: {
      create: teamCreate,
    },
  }),
}));

/**
 * Integration tests here verify that the organization routes are wired through
 * authentication, organization isolation and role-based permission checks.
 *
 * Detailed Better Auth permission-matrix behaviour is tested separately in
 * @ai-pass/auth-core.
 */
vi.mock('@ai-pass/auth-core/server', () => ({
  requireAuth: () => {
    return (req: any, res: any, next: any) => {
      const role = req.header('x-test-role');
      const organizationId = req.header('x-test-organization');

      if (!role) {
        res.status(401).json({
          error: {
            code: 'unauthenticated',
            message: 'Sign in required',
          },
        });
        return;
      }

      req.auth = {
        user: {
          id: `user-${role}`,
          email: `${role}@example.com`,
        },
        session: {},
        organizationId: organizationId ?? null,
        role,
      };

      next();
    };
  },

  requireOrganization: (paramName = 'organizationId') => {
    return (req: any, res: any, next: any) => {
      if (!req.auth) {
        res.status(401).json({
          error: {
            code: 'unauthenticated',
            message: 'Sign in required',
          },
        });
        return;
      }

      const requestedOrganization = req.params[paramName];

      if (!req.auth.organizationId) {
        res.status(403).json({
          error: {
            code: 'forbidden',
            message: 'No active organization',
          },
        });
        return;
      }

      if (requestedOrganization !== req.auth.organizationId) {
        res.status(403).json({
          error: {
            code: 'forbidden',
            message: 'Organization access denied',
          },
        });
        return;
      }

      next();
    };
  },

  requirePermission: (permissions: Record<string, string[]>) => {
    return (req: any, res: any, next: any) => {
      if (!req.auth) {
        res.status(401).json({
          error: {
            code: 'unauthenticated',
            message: 'Sign in required',
          },
        });
        return;
      }

      const role = req.auth.role;

      const ownerAllowed = true;

      const adminAllowed =
        !(
          permissions.organization?.includes('delete') ||
          permissions.billing?.includes('manage')
        );

      const memberAllowed =
        permissions.provider?.every((action) => action === 'list') ||
        permissions.model?.every((action) => action === 'invoke');

      if (
        (role === 'owner' && ownerAllowed) ||
        (role === 'admin' && adminAllowed) ||
        (role === 'member' && memberAllowed)
      ) {
        next();
        return;
      }

      res.status(403).json({
        error: {
          code: 'forbidden',
          message: 'Insufficient permissions',
        },
      });
    };
  },
}));

import { createOrganizationRouter } from './organization.js';

function createTestApp() {
  const app = express();

  app.use(express.json());
  app.use('/api/v1', createOrganizationRouter());

  return app;
}

describe('organization RBAC routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    organizationUpdate.mockResolvedValue({
      id: 'org-a',
      name: 'Updated Organization',
    });

    teamCreate.mockResolvedValue({
      id: 'workspace-1',
      name: 'Engineering',
      organizationId: 'org-a',
    });
  });

  it('denies unauthenticated organization updates with 401', async () => {
    const response = await request(createTestApp())
      .patch('/api/v1/organizations/org-a')
      .send({
        name: 'Updated Organization',
      });

    expect(response.status).toBe(401);
    expect(organizationUpdate).not.toHaveBeenCalled();
  });

  it('allows OWNER to update own organization', async () => {
    const response = await request(createTestApp())
      .patch('/api/v1/organizations/org-a')
      .set('x-test-role', 'owner')
      .set('x-test-organization', 'org-a')
      .send({
        name: 'Updated Organization',
      });

    expect(response.status).toBe(200);

    expect(organizationUpdate).toHaveBeenCalledWith({
      where: {
        id: 'org-a',
      },
      data: {
        name: 'Updated Organization',
      },
    });
  });

  it('allows ADMIN to update own organization', async () => {
    const response = await request(createTestApp())
      .patch('/api/v1/organizations/org-a')
      .set('x-test-role', 'admin')
      .set('x-test-organization', 'org-a')
      .send({
        name: 'Updated Organization',
      });

    expect(response.status).toBe(200);
    expect(organizationUpdate).toHaveBeenCalledOnce();
  });

  it('denies MEMBER from updating organization', async () => {
    const response = await request(createTestApp())
      .patch('/api/v1/organizations/org-a')
      .set('x-test-role', 'member')
      .set('x-test-organization', 'org-a')
      .send({
        name: 'Updated Organization',
      });

    expect(response.status).toBe(403);
    expect(organizationUpdate).not.toHaveBeenCalled();
  });

  it('denies ADMIN of Organization A from updating Organization B', async () => {
    const response = await request(createTestApp())
      .patch('/api/v1/organizations/org-b')
      .set('x-test-role', 'admin')
      .set('x-test-organization', 'org-a')
      .send({
        name: 'Illegal Cross Organization Update',
      });

    expect(response.status).toBe(403);
    expect(organizationUpdate).not.toHaveBeenCalled();
  });

  it('allows OWNER to create a workspace', async () => {
    const response = await request(createTestApp())
      .post('/api/v1/organizations/org-a/workspaces')
      .set('x-test-role', 'owner')
      .set('x-test-organization', 'org-a')
      .send({
        name: 'Engineering',
      });

    expect(response.status).toBe(201);
    expect(teamCreate).toHaveBeenCalledOnce();
  });

  it('allows ADMIN to create a workspace', async () => {
    const response = await request(createTestApp())
      .post('/api/v1/organizations/org-a/workspaces')
      .set('x-test-role', 'admin')
      .set('x-test-organization', 'org-a')
      .send({
        name: 'Engineering',
      });

    expect(response.status).toBe(201);
    expect(teamCreate).toHaveBeenCalledOnce();
  });

  it('denies MEMBER from creating a workspace', async () => {
    const response = await request(createTestApp())
      .post('/api/v1/organizations/org-a/workspaces')
      .set('x-test-role', 'member')
      .set('x-test-organization', 'org-a')
      .send({
        name: 'Engineering',
      });

    expect(response.status).toBe(403);
    expect(teamCreate).not.toHaveBeenCalled();
  });
});