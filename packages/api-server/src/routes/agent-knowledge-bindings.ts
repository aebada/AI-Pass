import { randomUUID } from 'node:crypto';
import {
  requireAuth,
  requirePermission,
  requireWorkspace,
} from '@ai-pass/auth-core/server';
import { getPrisma } from '@ai-pass/db';
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

function badRequest(res: Response, message: string): void {
  res.status(400).json({ error: { code: 'invalid_request', message } });
}

function notFound(res: Response, message: string): void {
  res.status(404).json({ error: { code: 'not_found', message } });
}

function conflict(res: Response, message: string): void {
  res.status(409).json({ error: { code: 'conflict', message } });
}

/**
 * Same known gap as agent-tool-bindings.ts: no Agent/AgentVersion model
 * exists yet, so agentId is an opaque string with no existence or
 * workspace-scope check. Close this in the same change that adds the real
 * relation.
 */
async function assertAgentInWorkspace(_agentId: string, _workspaceId: string): Promise<boolean> {
  return true;
}

export function createAgentKnowledgeBindingsRouter(): Router {
  const router = Router();

  router.get(
    '/workspaces/:workspaceId/agents/:agentId/knowledge-bases',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ knowledgeBase: ['list'] }),
    wrap(async (req, res) => {
      if (!(await assertAgentInWorkspace(req.params.agentId!, req.params.workspaceId!))) {
        notFound(res, 'Agent not found');
        return;
      }

      const bindings = await getPrisma().agentKnowledgeBinding.findMany({
        where: { agentId: req.params.agentId },
        include: { knowledgeBase: true },
        orderBy: { createdAt: 'asc' },
      });

      res.json({ bindings });
    }),
  );

  router.post(
    '/workspaces/:workspaceId/agents/:agentId/knowledge-bases',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ knowledgeBase: ['update'] }),
    wrap(async (req, res) => {
      if (!(await assertAgentInWorkspace(req.params.agentId!, req.params.workspaceId!))) {
        notFound(res, 'Agent not found');
        return;
      }

      const knowledgeBaseId = typeof req.body?.knowledgeBaseId === 'string' ? req.body.knowledgeBaseId : '';
      if (!knowledgeBaseId) {
        badRequest(res, 'knowledgeBaseId is required');
        return;
      }

      const prisma = getPrisma();
      const knowledgeBase = await prisma.knowledgeBase.findUnique({ where: { id: knowledgeBaseId } });

      if (!knowledgeBase || knowledgeBase.teamId !== req.params.workspaceId) {
        notFound(res, 'Knowledge base not found');
        return;
      }

      // Bind-time gate. The runtime read path must independently re-check
      // status at query time too, since a knowledge base can be archived
      // after a binding already exists — see docs.
      if (knowledgeBase.status !== 'ACTIVE') {
        conflict(res, 'Knowledge base must be ACTIVE to be bound');
        return;
      }

      const existing = await prisma.agentKnowledgeBinding.findUnique({
        where: { agentId_knowledgeBaseId: { agentId: req.params.agentId!, knowledgeBaseId } },
      });
      if (existing) {
        conflict(res, 'This knowledge base is already bound to this agent');
        return;
      }

      const binding = await prisma.agentKnowledgeBinding.create({
        data: { id: randomUUID(), agentId: req.params.agentId!, knowledgeBaseId },
        include: { knowledgeBase: true },
      });

      res.status(201).json({ binding });
    }),
  );

  router.patch(
    '/workspaces/:workspaceId/agents/:agentId/knowledge-bases/:knowledgeBaseId',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ knowledgeBase: ['update'] }),
    wrap(async (req, res) => {
      if (!(await assertAgentInWorkspace(req.params.agentId!, req.params.workspaceId!))) {
        notFound(res, 'Agent not found');
        return;
      }

      if (typeof req.body?.enabled !== 'boolean') {
        badRequest(res, 'enabled must be a boolean');
        return;
      }

      const prisma = getPrisma();
      const existing = await prisma.agentKnowledgeBinding.findUnique({
        where: {
          agentId_knowledgeBaseId: {
            agentId: req.params.agentId!,
            knowledgeBaseId: req.params.knowledgeBaseId!,
          },
        },
      });

      if (!existing) {
        notFound(res, 'Binding not found');
        return;
      }

      const binding = await prisma.agentKnowledgeBinding.update({
        where: { id: existing.id },
        data: { enabled: req.body.enabled },
        include: { knowledgeBase: true },
      });

      res.json({ binding });
    }),
  );

  router.delete(
    '/workspaces/:workspaceId/agents/:agentId/knowledge-bases/:knowledgeBaseId',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ knowledgeBase: ['update'] }),
    wrap(async (req, res) => {
      if (!(await assertAgentInWorkspace(req.params.agentId!, req.params.workspaceId!))) {
        notFound(res, 'Agent not found');
        return;
      }

      const prisma = getPrisma();
      const existing = await prisma.agentKnowledgeBinding.findUnique({
        where: {
          agentId_knowledgeBaseId: {
            agentId: req.params.agentId!,
            knowledgeBaseId: req.params.knowledgeBaseId!,
          },
        },
      });

      if (!existing) {
        notFound(res, 'Binding not found');
        return;
      }

      await prisma.agentKnowledgeBinding.delete({ where: { id: existing.id } });

      res.status(204).send();
    }),
  );

  return router;
}
