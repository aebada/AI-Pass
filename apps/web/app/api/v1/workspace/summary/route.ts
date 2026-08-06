import { auth } from '@/auth';
import { onboardNewUser } from '@/lib/ai-platform';
import { requireSessionUserId } from '@/lib/session-user';
import { handleWorkspaceSummary } from '@ai-pass/platform-api';
import { defaultWalletService } from '@ai-pass/wallet';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = requireSessionUserId(session);
  onboardNewUser(userId);
  const wallet = defaultWalletService.getBalance(userId);

  return NextResponse.json(
    handleWorkspaceSummary({
      userId,
      userName: session.user.name ?? undefined,
      tenantId: session.authSession?.tenantId,
      credits: {
        remaining: wallet.creditsRemaining,
        used: wallet.creditsUsed,
        total: wallet.creditsTotal,
        daysLeft: wallet.daysLeftInPeriod,
        spendUsd: wallet.spentUsd,
        budgetUsd: wallet.monthlyBudgetUsd,
      },
    }),
  );
}
