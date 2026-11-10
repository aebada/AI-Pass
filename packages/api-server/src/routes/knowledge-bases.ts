import { randomUUID } from 'node:crypto';
import {
  requireAuth,
  requirePermission,
  requireWorkspace,
} from '@ai-pass/auth-core/server';
import { getPrisma, type Prisma } from '@ai-pass/db';
import {
  Router,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from 'express';

const SOURCE_TYPES = new Set(['placeholder', 'upload', 'url', 'connector']);
const CREATABLE_STATUSES = new Set(['PENDING', 'ACTIVE']);

// Sprint 2 is metadata and bindings only. Connector credentials are never
// modeled here — this is a defensive check against a caller (or a future
// connector integration) putting one in anyway, not the primary control.
const SECRET_KEY_PATTERN = /key|secret|token|password|credential/i;

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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function containsLikelySecret(metadata: Record<string, unknown>): boolean {
  return Object.keys(metadata).some((key) => SECRET_KEY_PATTERN.test(key));
}

interface ValidatedMetadataInput {
  name?: string;
  description?: string;
  sourceType?: string;
  metadata?: Record<string, unknown> | null;
}

function validateKnowledgeBaseInput(
  body: Record<string, unknown>,
  options: { requireAll: boolean },
): { value: ValidatedMetadataInput } | { error: string } {
  const value: ValidatedMetadataInput = {};

  if (options.requireAll || 'name' in body) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) return { error: 'Knowledge base name is required' };
    value.name = name;
  }

  if (options.requireAll || 'description' in body) {
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    if (!description) return { error: 'Knowledge base description is required' };
    value.description = description;
  }

  if (options.requireAll || 'sourceType' in body) {
    const sourceType = typeof body.sourceType === 'string' ? body.sourceType : '';
    if (!SOURCE_TYPES.has(sourceType)) {
      return { error: `sourceType must be one of: ${Array.from(SOURCE_TYPES).join(', ')}` };
    }
    value.sourceType = sourceType;
  }

  if ('metadata' in body) {
    if (body.metadata !== null && !isPlainObject(body.metadata)) {
      return { error: 'metadata must be a JSON object or null' };
    }
    if (body.metadata && containsLikelySecret(body.metadata)) {
      return { error: 'metadata must not contain credential-like fields' };
    }
    value.metadata = body.metadata as Record<string, unknown> | null;
  }

  return { value };
}

export function createKnowledgeBasesRouter(): Router {
  const router = Router();

  router.post(
    '/workspaces/:workspaceId/knowledge-bases',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ knowledgeBase: ['create'] }),
    wrap(async (req, res) => {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const result = validateKnowledgeBaseInput(body, { requireAll: true });
      if ('error' in result) {
        badRequest(res, result.error);
        return;
      }

      let status = 'PENDING';
      if ('status' in body) {
        const requested = typeof body.status === 'string' ? body.status : '';
        if (!CREATABLE_STATUSES.has(requested)) {
          badRequest(res, 'status must be "PENDING" or "ACTIVE" on create; use the archive endpoint to archive');
          return;
        }
        status = requested;
      }

      const knowledgeBase = await getPrisma().knowledgeBase.create({
        data: {
          id: randomUUID(),
          teamId: req.params.workspaceId!,
          name: result.value.name!,
          description: result.value.description!,
          sourceType: result.value.sourceType!,
          metadata: (result.value.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
          status,
          createdById: req.auth!.user.id,
        },
      });

      res.status(201).json({ knowledgeBase });
    }),
  );

  router.get(
    '/workspaces/:workspaceId/knowledge-bases',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ knowledgeBase: ['list'] }),
    wrap(async (req, res) => {
      const knowledgeBases = await getPrisma().knowledgeBase.findMany({
        where: { teamId: req.params.workspaceId! },
        orderBy: { createdAt: 'asc' },
      });

      res.json({ knowledgeBases });
    }),
  );

  router.get(
    '/workspaces/:workspaceId/knowledge-bases/:knowledgeBaseId',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ knowledgeBase: ['list'] }),
    wrap(async (req, res) => {
      const knowledgeBase = await getPrisma().knowledgeBase.findUnique({
        where: { id: req.params.knowledgeBaseId },
      });

      if (!knowledgeBase || knowledgeBase.teamId !== req.params.workspaceId) {
        notFound(res, 'Knowledge base not found');
        return;
      }

      res.json({ knowledgeBase });
    }),
  );

  router.patch(
    '/workspaces/:workspaceId/knowledge-bases/:knowledgeBaseId',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ knowledgeBase: ['update'] }),
    wrap(async (req, res) => {
      const prisma = getPrisma();
      const existing = await prisma.knowledgeBase.findUnique({
        where: { id: req.params.knowledgeBaseId },
      });

      if (!existing || existing.teamId !== req.params.workspaceId) {
        notFound(res, 'Knowledge base not found');
        return;
      }

      const body = (req.body ?? {}) as Record<string, unknown>;
      if ('status' in body) {
        badRequest(res, 'status cannot be changed directly; use the archive endpoint');
        return;
      }

      const result = validateKnowledgeBaseInput(body, { requireAll: false });
      if ('error' in result) {
        badRequest(res, result.error);
        return;
      }

      const knowledgeBase = await prisma.knowledgeBase.update({
        where: { id: req.params.knowledgeBaseId },
        data: {
          ...(result.value.name !== undefined ? { name: result.value.name } : {}),
          ...(result.value.description !== undefined ? { description: result.value.description } : {}),
          ...(result.value.sourceType !== undefined ? { sourceType: result.value.sourceType } : {}),
          ...('metadata' in body
            ? { metadata: (result.value.metadata ?? undefined) as Prisma.InputJsonValue | undefined }
            : {}),
        },
      });

      res.json({ knowledgeBase });
    }),
  );

  router.post(
    '/workspaces/:workspaceId/knowledge-bases/:knowledgeBaseId/archive',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ knowledgeBase: ['archive'] }),
    wrap(async (req, res) => {
      const prisma = getPrisma();
      const existing = await prisma.knowledgeBase.findUnique({
        where: { id: req.params.knowledgeBaseId },
      });

      if (!existing || existing.teamId !== req.params.workspaceId) {
        notFound(res, 'Knowledge base not found');
        return;
      }

      const knowledgeBase = await prisma.knowledgeBase.update({
        where: { id: req.params.knowledgeBaseId },
        data: { status: 'ARCHIVED' },
      });

      res.json({ knowledgeBase });
    }),
  );

  return router;
}
