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

const MAX_SLUG_LENGTH = 60;
const TOOL_KINDS = new Set(['READ', 'WRITE']);

// A starting heuristic, not a security boundary: inputSchema is metadata
// describing a tool's call signature, never a place to embed a command to
// run. This rejects the obvious cases without pretending to be a sandbox.
const DANGEROUS_PATTERNS = [
  /\$\(/, // command substitution
  /`[^`]*`/, // backticks
  /\bexec\s*\(/i,
  /\beval\s*\(/i,
  /\bchild_process\b/i,
  /\bDROP\s+TABLE\b/i,
  /\bDELETE\s+FROM\b/i,
  /;\s*--/,
  /\brm\s+-rf\b/i,
];

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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH);
}

function containsDangerousContent(value: unknown): boolean {
  const serialized = JSON.stringify(value);
  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(serialized));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

interface ValidatedToolInput {
  name: string;
  slug: string;
  description: string;
  inputSchema: Record<string, unknown>;
  kind: string;
}

/** Shared by create and update — update only requires the fields present in the body. */
function validateToolInput(
  body: Record<string, unknown>,
  options: { requireAll: boolean },
): { value: ValidatedToolInput } | { error: string } {
  const name = typeof body.name === 'string' ? body.name.trim() : undefined;
  if (options.requireAll || 'name' in body) {
    if (!name) return { error: 'Tool name is required' };
  }

  const rawSlug = typeof body.slug === 'string' ? body.slug.trim() : undefined;
  const slug = rawSlug ? slugify(rawSlug) : name ? slugify(name) : undefined;
  if (options.requireAll || 'slug' in body || 'name' in body) {
    if (!slug) return { error: 'A usable slug could not be derived' };
  }

  const description = typeof body.description === 'string' ? body.description.trim() : undefined;
  if (options.requireAll || 'description' in body) {
    if (!description) return { error: 'Tool description is required' };
  }

  let inputSchema: Record<string, unknown> | undefined;
  if (options.requireAll || 'inputSchema' in body) {
    if (!isPlainObject(body.inputSchema)) {
      return { error: 'inputSchema must be a JSON object' };
    }
    if (containsDangerousContent(body.inputSchema)) {
      return { error: 'inputSchema contains disallowed content' };
    }
    inputSchema = body.inputSchema;
  }

  let kind: string | undefined;
  if (options.requireAll || 'kind' in body) {
    kind = typeof body.kind === 'string' ? body.kind.toUpperCase() : '';
    if (!TOOL_KINDS.has(kind)) {
      return { error: 'kind must be "READ" or "WRITE"' };
    }
  }

  return {
    value: {
      name: name as string,
      slug: slug as string,
      description: description as string,
      inputSchema: inputSchema as Record<string, unknown>,
      kind: kind as string,
    },
  };
}

export function createToolsRouter(): Router {
  const router = Router();

  router.post(
    '/workspaces/:workspaceId/tools',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ tool: ['create'] }),
    wrap(async (req, res) => {
      const result = validateToolInput(req.body ?? {}, { requireAll: true });
      if ('error' in result) {
        badRequest(res, result.error);
        return;
      }

      const prisma = getPrisma();
      const existing = await prisma.tool.findUnique({
        where: { teamId_slug: { teamId: req.params.workspaceId!, slug: result.value.slug } },
      });
      if (existing) {
        res.status(409).json({ error: { code: 'conflict', message: 'A tool with this slug already exists' } });
        return;
      }

      const tool = await prisma.tool.create({
        data: {
          id: randomUUID(),
          teamId: req.params.workspaceId!,
          name: result.value.name,
          slug: result.value.slug,
          description: result.value.description,
          inputSchema: result.value.inputSchema as Prisma.InputJsonValue,
          kind: result.value.kind,
        },
      });

      res.status(201).json({ tool });
    }),
  );

  router.get(
    '/workspaces/:workspaceId/tools',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ tool: ['list'] }),
    wrap(async (req, res) => {
      const tools = await getPrisma().tool.findMany({
        where: { teamId: req.params.workspaceId! },
        orderBy: { createdAt: 'asc' },
      });

      res.json({ tools });
    }),
  );

  router.get(
    '/workspaces/:workspaceId/tools/:toolId',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ tool: ['list'] }),
    wrap(async (req, res) => {
      const tool = await getPrisma().tool.findUnique({ where: { id: req.params.toolId } });

      // A tool that exists but belongs to another workspace answers the same
      // as one that does not exist, matching requireWorkspace's own
      // cross-organization behaviour elsewhere in this codebase.
      if (!tool || tool.teamId !== req.params.workspaceId) {
        notFound(res, 'Tool not found');
        return;
      }

      res.json({ tool });
    }),
  );

  router.patch(
    '/workspaces/:workspaceId/tools/:toolId',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ tool: ['update'] }),
    wrap(async (req, res) => {
      const prisma = getPrisma();
      const existing = await prisma.tool.findUnique({ where: { id: req.params.toolId } });

      if (!existing || existing.teamId !== req.params.workspaceId) {
        notFound(res, 'Tool not found');
        return;
      }

      const result = validateToolInput(req.body ?? {}, { requireAll: false });
      if ('error' in result) {
        badRequest(res, result.error);
        return;
      }

      if (result.value.slug && result.value.slug !== existing.slug) {
        const conflict = await prisma.tool.findUnique({
          where: { teamId_slug: { teamId: req.params.workspaceId!, slug: result.value.slug } },
        });
        if (conflict) {
          res.status(409).json({ error: { code: 'conflict', message: 'A tool with this slug already exists' } });
          return;
        }
      }

      const tool = await prisma.tool.update({
        where: { id: req.params.toolId },
        data: {
          ...(result.value.name !== undefined ? { name: result.value.name } : {}),
          ...(result.value.slug !== undefined ? { slug: result.value.slug } : {}),
          ...(result.value.description !== undefined ? { description: result.value.description } : {}),
          ...(result.value.inputSchema !== undefined
            ? { inputSchema: result.value.inputSchema as Prisma.InputJsonValue }
            : {}),
          ...(result.value.kind !== undefined ? { kind: result.value.kind } : {}),
        },
      });

      res.json({ tool });
    }),
  );

  router.post(
    '/workspaces/:workspaceId/tools/:toolId/enable',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ tool: ['update'] }),
    wrap(async (req, res) => {
      await setToolEnabled(req, res, true);
    }),
  );

  router.post(
    '/workspaces/:workspaceId/tools/:toolId/disable',
    requireAuth(),
    requireWorkspace(),
    requirePermission({ tool: ['update'] }),
    wrap(async (req, res) => {
      await setToolEnabled(req, res, false);
    }),
  );

  return router;
}

async function setToolEnabled(req: Request, res: Response, enabled: boolean): Promise<void> {
  const prisma = getPrisma();
  const existing = await prisma.tool.findUnique({ where: { id: req.params.toolId } });

  if (!existing || existing.teamId !== req.params.workspaceId) {
    notFound(res, 'Tool not found');
    return;
  }

  const tool = await prisma.tool.update({
    where: { id: req.params.toolId },
    data: { enabled },
  });

  res.json({ tool });
}
