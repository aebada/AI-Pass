import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { onboardNewUser } from '@/lib/ai-platform';
import { requireSessionUserId } from '@/lib/session-user';
import { defaultWalletService } from '@ai-pass/wallet';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = requireSessionUserId(session);
  onboardNewUser(userId);
  const summary = defaultWalletService.getSummary(userId);
  return NextResponse.json(summary);
}
