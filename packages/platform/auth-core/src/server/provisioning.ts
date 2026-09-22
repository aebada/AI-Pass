import { randomUUID } from 'node:crypto';
import { getPrisma } from '@ai-pass/db';

const DEFAULT_WORKSPACE_NAME = 'General';
const MAX_SLUG_LENGTH = 40;
const SLUG_ATTEMPTS = 5;

export interface SessionContext {
  organizationId: string | null;
  teamId: string | null;
}

function toSlug(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH);

  return slug || 'workspace';
}

async function availableSlug(base: string): Promise<string> {
  const prisma = getPrisma();
  let candidate = base;

  for (let attempt = 0; attempt < SLUG_ATTEMPTS; attempt += 1) {
    const taken = await prisma.organization.findUnique({ where: { slug: candidate } });
    if (!taken) return candidate;
    candidate = `${base}-${randomUUID().slice(0, 6)}`;
  }

  return `${base}-${randomUUID()}`;
}

async function existingContext(userId: string): Promise<SessionContext | null> {
  const prisma = getPrisma();

  const membership = await prisma.member.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  if (!membership) return null;

  const teamMembership = await prisma.teamMember.findFirst({
    where: { userId, team: { organizationId: membership.organizationId } },
    orderBy: { createdAt: 'asc' },
  });

  return {
    organizationId: membership.organizationId,
    teamId: teamMembership?.teamId ?? null,
  };
}

/**
 * Gives a user with no membership an organization and a default workspace.
 * Without this a newly registered user signs in to an empty state with nowhere
 * to act.
 */
export async function provisionOrganization(user: {
  id: string;
  name?: string | null;
  email: string;
}): Promise<SessionContext> {
  const current = await existingContext(user.id);
  if (current) return current;

  const displayName = user.name?.trim() || user.email.split('@')[0] || 'Workspace';
  const slug = await availableSlug(toSlug(displayName));

  return getPrisma().$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { id: randomUUID(), name: displayName, slug },
    });

    await tx.member.create({
      data: {
        id: randomUUID(),
        organizationId: organization.id,
        userId: user.id,
        role: 'owner',
      },
    });

    const team = await tx.team.create({
      data: {
        id: randomUUID(),
        name: DEFAULT_WORKSPACE_NAME,
        organizationId: organization.id,
        memberCount: 1,
      },
    });

    await tx.teamMember.create({
      data: { id: randomUUID(), teamId: team.id, userId: user.id },
    });

    await tx.workspaceSettings.create({
      data: { teamId: team.id, allowedProviders: [] },
    });

    return { organizationId: organization.id, teamId: team.id };
  });
}

export async function resolveSessionContext(userId: string): Promise<SessionContext> {
  const current = await existingContext(userId);
  if (current) return current;

  const user = await getPrisma().user.findUnique({ where: { id: userId } });
  if (!user) return { organizationId: null, teamId: null };

  return provisionOrganization(user);
}
