import {
  requireAuth,
  requireOrganization,
  requirePermission,
} from '@ai-pass/auth-core/server';
import { getPrisma } from '@ai-pass/db';
import { randomUUID } from 'node:crypto';
import {
  Router,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from 'express';

function wrap(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

export function createOrganizationRouter(): Router {
  const router = Router();

  router.patch(
    '/organizations/:organizationId',
    requireAuth(),
    requireOrganization(),
    requirePermission({
      organization: ['update'],
    }),
    wrap(async (req, res) => {
      const name =
        typeof req.body?.name === 'string'
          ? req.body.name.trim()
          : '';

      if (!name) {
        res.status(400).json({
          error: {
            code: 'invalid_request',
            message: 'Organization name is required',
          },
        });
        return;
      }

      const organization = await getPrisma().organization.update({
        where: {
          id: req.params.organizationId,
        },
        data: {
          name,
        },
      });

      res.json({
        organization,
      });
    }),
  );

  router.post(
    '/organizations/:organizationId/workspaces',
    requireAuth(),
    requireOrganization(),
    requirePermission({
      team: ['create'],
    }),
    wrap(async (req, res) => {
      const name =
        typeof req.body?.name === 'string'
          ? req.body.name.trim()
          : '';

      if (!name) {
        res.status(400).json({
          error: {
            code: 'invalid_request',
            message: 'Workspace name is required',
          },
        });
        return;
      }

      const workspace = await getPrisma().team.create({
        data: {
          id: randomUUID(),
          name,
          organizationId: req.params.organizationId,
        },
      });

      res.status(201).json({
        workspace,
      });
    }),
  );

  return router;
}