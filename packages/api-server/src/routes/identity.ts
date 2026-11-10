import { requireAuth, requireWorkspace } from '@ai-pass/auth-core/server';
import { getPrisma } from '@ai-pass/db';
import {
  Router,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from 'express';

function wrap(handler: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

export function createIdentityRouter(): Router {
  const router = Router();

  router.get(
    '/me',
    requireAuth(),
    wrap(async (req, res) => {
      const context = req.auth;

      if (!context) {
        res.status(401).json({ error: { code: 'unauthenticated', message: 'Sign in required' } });
        return;
      }

      const privileged = context.role === 'owner' || context.role === 'admin';

      // Owners and admins see every workspace in the organization. Everyone
      // else sees only the ones they belong to.
      const workspaces = context.organizationId
        ? await getPrisma().team.findMany({
            where: {
              organizationId: context.organizationId,
              ...(privileged ? {} : { members: { some: { userId: context.user.id } } }),
            },
            select: { id: true, name: true },
            orderBy: { createdAt: 'asc' },
          })
        : [];

      res.json({
        user: {
          id: context.user.id,
          email: context.user.email,
          name: context.user.name,
          image: context.user.image,
        },
        organizationId: context.organizationId,
        role: context.role,
        workspaces,
      });
    }),
  );

  router.get(
    '/workspaces/:workspaceId',
    requireAuth(),
    requireWorkspace(),
    wrap(async (req, res) => {
      const workspace = await getPrisma().team.findUnique({
        where: { id: req.params.workspaceId },
        select: {
          id: true,
          name: true,
          createdAt: true,
          settings: {
            select: { defaultProviderId: true, defaultModelId: true, allowedProviders: true },
          },
        },
      });

      res.json({ workspace });
    }),
  );

  return router;
}
