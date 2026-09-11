import { NextResponse } from 'next/server';
import type { SkillGovernanceActor, TenantRole } from '@ai-pass/shared';
import { SKILL_AVAILABILITY_OPTIONS } from '@ai-pass/shared';
import { getWebAgentStudio } from '../../../../../../lib/agent-studio-platform';

export const runtime = 'nodejs';

function demoActor(request: Request): SkillGovernanceActor {
  const role = (request.headers.get('x-aipass-role') as TenantRole | null) ?? 'admin';
  const userId = request.headers.get('x-aipass-user-id') ?? 'user_demo_admin';
  const roles: TenantRole[] =
    role === 'builder' ? ['builder'] : role === 'viewer' ? ['viewer'] : ['admin'];
  return {
    userId,
    roles,
    isAdmin: roles.includes('admin') || roles.includes('owner'),
  };
}

export async function GET(request: Request): Promise<NextResponse> {
  const studio = getWebAgentStudio();
  return NextResponse.json({
    permissions: studio.skillGovernance.getPermissions(),
    availabilityOptions: SKILL_AVAILABILITY_OPTIONS,
    actor: demoActor(request),
  });
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const studio = getWebAgentStudio();
    const actor = demoActor(request);
    const permissions = studio.skillGovernance.updatePermissions(
      {
        ...(body.createSkills ? { createSkills: body.createSkills } : {}),
        ...(body.changeAvailability ? { changeAvailability: body.changeAvailability } : {}),
      },
      actor,
    );
    return NextResponse.json({ permissions });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    const status = message.includes('admins') || message.includes('permission') ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
