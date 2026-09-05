import { getPrisma } from '@ai-pass/db';
import { fromNodeHeaders } from 'better-auth/node';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { getAuth } from './auth.js';
import type { Session, SessionUser } from './auth.js';

export interface AuthContext {
  user: SessionUser;
  session: Session['session'];
  organizationId: string | null;
  role: string | null;
}

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthContext;
  }
}

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

function wrap(handler: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

function unauthenticated(res: Response): void {
  res.status(401).json({ error: { code: 'unauthenticated', message: 'Sign in required' } });
}

function forbidden(res: Response, message: string): void {
  res.status(403).json({ error: { code: 'forbidden', message } });
}

export function requireAuth(): RequestHandler {
  return wrap(async (req, res, next) => {
    const session = await getAuth().api.getSession({ headers: fromNodeHeaders(req.headers) });

    if (!session) {
      unauthenticated(res);
      return;
    }

    const organizationId = session.session.activeOrganizationId ?? null;
    const membership = organizationId
      ? await getPrisma().member.findUnique({
          where: { organizationId_userId: { organizationId, userId: session.user.id } },
        })
      : null;

    req.auth = {
      user: session.user,
      session: session.session,
      organizationId,
      role: membership?.role ?? null,
    };

    next();
  });
}

export function requirePermission(permissions: Record<string, string[]>): RequestHandler {
  return wrap(async (req, res, next) => {
    const context = req.auth;

    if (!context) {
      unauthenticated(res);
      return;
    }

    if (!context.organizationId) {
      forbidden(res, 'No active organization');
      return;
    }

    const result = await getAuth().api.hasPermission({
      headers: fromNodeHeaders(req.headers),
      body: { organizationId: context.organizationId, permissions },
    });

    if (!result?.success) {
      forbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  });
}

/**
 * Organization role alone does not decide workspace access, so this checks
 * membership of the specific workspace. Owners and admins pass by role.
 */
export function requireWorkspace(paramName = 'workspaceId'): RequestHandler {
  return wrap(async (req, res, next) => {
    const context = req.auth;

    if (!context) {
      unauthenticated(res);
      return;
    }

    if (!context.organizationId) {
      forbidden(res, 'No active organization');
      return;
    }

    const workspaceId = req.params[paramName];

    if (!workspaceId) {
      res.status(400).json({ error: { code: 'invalid_request', message: 'Workspace id missing' } });
      return;
    }

    const prisma = getPrisma();
    const workspace = await prisma.team.findUnique({ where: { id: workspaceId } });

    // A workspace in another organization answers the same as one that does not
    // exist, so that ids cannot be probed across organization boundaries.
    if (!workspace || workspace.organizationId !== context.organizationId) {
      res.status(404).json({ error: { code: 'not_found', message: 'Workspace not found' } });
      return;
    }

    if (context.role === 'owner' || context.role === 'admin') {
      next();
      return;
    }

    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: workspaceId, userId: context.user.id } },
    });

    if (!membership) {
      forbidden(res, 'Not a member of this workspace');
      return;
    }

    next();
  });
}
