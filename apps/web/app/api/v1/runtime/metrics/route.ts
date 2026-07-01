import { NextResponse } from 'next/server';
import { defaultRuntimeMonitoring } from '@ai-pass/runtime-core';
import { getLiveSyncEngine } from '@ai-pass/livesync';
import { defaultWalletService } from '@ai-pass/wallet';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  const runtimeMetrics = defaultRuntimeMonitoring.getMetrics();
  const livesync = getLiveSyncEngine();
  const livesyncHealth = livesync.getHealth();
  const livesyncMetrics = livesync.getMetrics();

  return NextResponse.json({
    runtime: runtimeMetrics,
    livesync: { health: livesyncHealth, metrics: livesyncMetrics },
    wallet: {
      demoUser: defaultWalletService.getBalance('demo-user'),
    },
    timestamp: new Date().toISOString(),
  });
}
