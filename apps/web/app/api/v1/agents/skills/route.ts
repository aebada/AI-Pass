import { NextResponse } from 'next/server';
import type { SkillGovernanceActor, TenantRole } from '@ai-pass/shared';
import { getWebAgentStudio } from '../../../../../lib/agent-studio-platform';

export const runtime = 'nodejs';

function demoActor(request: Request): SkillGovernanceActor {
  const role = (request.headers.get('x-aipass-role') as TenantRole | null) ?? 'builder';
  const userId = request.headers.get('x-aipass-user-id') ?? 'user_demo_admin';
  const roles: TenantRole[] =
    role === 'admin' || role === 'owner'
      ? [role]
      : role === 'viewer'
        ? ['viewer']
        : ['builder'];
  return {
    userId,
    roles,
    isAdmin: roles.includes('admin') || roles.includes('owner'),
  };
}

export async function GET(request: Request): Promise<NextResponse> {
  const studio = getWebAgentStudio();
  const url = new URL(request.url);
  const scope = url.searchParams.get('scope') ?? 'member';
  const actor = demoActor(request);

  if (scope === 'agents') {
    return NextResponse.json({
      skills: studio.skills.listDiscoverableForAgents(),
      scope: 'agents',
    });
  }

  if (scope === 'all') {
    return NextResponse.json({
      skills: studio.skills.listAll(),
      scope: 'all',
      actor,
    });
  }

  return NextResponse.json({
    skills: studio.skills.listForMember(actor),
    scope: 'member',
    actor,
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const studio = getWebAgentStudio();
    const actor = demoActor(request);
    studio.skillGovernance.assertCanCreate(actor);
    const skill = studio.skills.register({
      ...body,
      createdBy: actor.userId,
      editorIds: body.editorIds ?? [actor.userId],
      availability: body.availability ?? 'editors_only',
    });
    return NextResponse.json({ skill }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Create failed';
    const status = message.includes('permission') ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      skillId?: string;
      availability?: 'editors_only' | 'all_members' | 'members_and_agents';
      editorIds?: string[];
      name?: string;
      description?: string;
    };
    if (!body.skillId) {
      return NextResponse.json({ error: 'skillId required' }, { status: 400 });
    }
    const studio = getWebAgentStudio();
    const actor = demoActor(request);

    if (body.availability) {
      const skill = studio.skills.setAvailability(body.skillId, body.availability, actor);
      return NextResponse.json({ skill });
    }

    const existing = studio.skills.get(body.skillId);
    if (!existing) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }
    const isEditor =
      existing.editorIds.includes(actor.userId) || existing.createdBy === actor.userId;
    if (!actor.isAdmin && !isEditor) {
      return NextResponse.json({ error: 'Only editors or admins can update this skill.' }, { status: 403 });
    }
    const skill = studio.skills.update(body.skillId, {
      ...(body.name ? { name: body.name } : {}),
      ...(body.description ? { description: body.description } : {}),
      ...(body.editorIds ? { editorIds: body.editorIds } : {}),
    });
    return NextResponse.json({ skill });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    const status = message.includes('permission') ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
