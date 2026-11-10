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
 * KNOWN GAP, not a guess: there is no Agent/AgentVersion model in the schema
 * yet (a parallel Sprint 2 track). Until it lands, agentId is accepted as an
 * opaque string with no existence or workspace-scope check — this route
 * cannot yet verify "the agent belongs to this workspace" or "the caller may
 * configure this specific agent" beyond the generic tool:update permission
 * on the workspace. Close this gap in the same change that adds the real
 * relation: look up the agent, 404 if agentId does not resolve or its
 * teamId !== workspaceId, before any binding logic below runs.
 */
async function assertAgentInWorkspace(_agentId: string, _workspaceId: string): Promise<boolean> {
  return true;
}

export function createAgentToolBindingsRouter(): Router {
  const router = Router();

  router.get(
    '/workspaces/:workspaceId/agents/:agentId/tools',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ tool: ['list'] }),
    wrap(async (req, res) => {
      if (!(await assertAgentInWorkspace(req.params.agentId!, req.params.workspaceId!))) {
        notFound(res, 'Agent not found');
        return;
      }

      const bindings = await getPrisma().agentToolBinding.findMany({
        where: { agentId: req.params.agentId },
        include: { tool: true },
        orderBy: { createdAt: 'asc' },
      });

      res.json({ bindings });
    }),
  );

  router.post(
    '/workspaces/:workspaceId/agents/:agentId/tools',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ tool: ['update'] }),
    wrap(async (req, res) => {
      if (!(await assertAgentInWorkspace(req.params.agentId!, req.params.workspaceId!))) {
        notFound(res, 'Agent not found');
        return;
      }

      const toolId = typeof req.body?.toolId === 'string' ? req.body.toolId : '';
      if (!toolId) {
        badRequest(res, 'toolId is required');
        return;
      }

      const prisma = getPrisma();
      const tool = await prisma.tool.findUnique({ where: { id: toolId } });

      if (!tool || tool.teamId !== req.params.workspaceId) {
        notFound(res, 'Tool not found');
        return;
      }

      if (!tool.enabled) {
        conflict(res, 'Tool is disabled and cannot be bound');
        return;
      }

      const existing = await prisma.agentToolBinding.findUnique({
        where: { agentId_toolId: { agentId: req.params.agentId!, toolId } },
      });
      if (existing) {
        conflict(res, 'This tool is already bound to this agent');
        return;
      }

      const binding = await prisma.agentToolBinding.create({
        data: { id: randomUUID(), agentId: req.params.agentId!, toolId },
        include: { tool: true },
      });

      res.status(201).json({ binding });
    }),
  );

  router.patch(
    '/workspaces/:workspaceId/agents/:agentId/tools/:toolId',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ tool: ['update'] }),
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
      const existing = await prisma.agentToolBinding.findUnique({
        where: { agentId_toolId: { agentId: req.params.agentId!, toolId: req.params.toolId! } },
      });

      if (!existing) {
        notFound(res, 'Binding not found');
        return;
      }

      const binding = await prisma.agentToolBinding.update({
        where: { id: existing.id },
        data: { enabled: req.body.enabled },
        include: { tool: true },
      });

      res.json({ binding });
    }),
  );

  router.delete(
    '/workspaces/:workspaceId/agents/:agentId/tools/:toolId',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ tool: ['update'] }),
    wrap(async (req, res) => {
      if (!(await assertAgentInWorkspace(req.params.agentId!, req.params.workspaceId!))) {
        notFound(res, 'Agent not found');
        return;
      }

      const prisma = getPrisma();
      const existing = await prisma.agentToolBinding.findUnique({
        where: { agentId_toolId: { agentId: req.params.agentId!, toolId: req.params.toolId! } },
      });

      if (!existing) {
        notFound(res, 'Binding not found');
        return;
      }

      await prisma.agentToolBinding.delete({ where: { id: existing.id } });

      res.status(204).send();
    }),
  );

  return router;
}
