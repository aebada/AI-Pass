import { auth } from '@/auth';
import { getUserMembershipTier, onboardNewUser } from '@/lib/ai-platform';
import { requireSessionUserId } from '@/lib/session-user';
import { NextResponse } from 'next/server';
import type { PlanTier } from '@ai-pass/ui';

export const runtime = 'nodejs';

const TIER_TO_PLAN: Record<string, PlanTier> = {
  free: 'free',
  professional: 'pro',
  power: 'pro',
  enterprise: 'enterprise',
};

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = requireSessionUserId(session);
  const { isNew, credits } = onboardNewUser(userId);
  const tier = getUserMembershipTier(userId);

  return NextResponse.json({
    userId,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    tier,
    plan: TIER_TO_PLAN[tier] ?? 'free',
    isNew,
    credits,
  });
}
