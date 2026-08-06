import type { Session } from 'next-auth';
import { auth } from '@/auth';
import { defaultMembershipService } from '@ai-pass/membership';
import { defaultWalletService } from '@ai-pass/wallet';
import { MODEL_CATALOG, PROVIDER_DEFINITIONS } from '@ai-pass/provider-hub';
import { getUserMembershipTier } from '@/lib/ai-platform';

export const runtime = 'nodejs';

function resolveUserId(session: Session): string {
  return session.user?.id ?? session.authSession?.userId ?? 'anonymous';
}

export async function GET(): Promise<Response> {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = resolveUserId(session);
  const tier = getUserMembershipTier(userId);
  const balance = defaultWalletService.getBalance(userId);
  const usage = defaultMembershipService.getUsage(userId, tier);
  const plan = defaultMembershipService.getEntitlements(tier);

  const models = MODEL_CATALOG.map((m) => ({
    ...m,
    allowed: defaultMembershipService.canAccessModel(tier, m.id, m.tier, m.providerId),
  }));

  return Response.json({
    tier,
    creditsRemaining: balance.creditsRemaining,
    creditsTotal: balance.creditsTotal,
    requestsToday: usage.requestsToday,
    dailyRequestLimit: plan.dailyRequestLimit,
    providers: PROVIDER_DEFINITIONS,
    models,
  });
}
