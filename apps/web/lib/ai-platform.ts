import {
  createManagedAuthFromEnv,
  createProviderHub,
  getEnvFreeMonthlyCredits,
  type ProviderHub,
} from '@ai-pass/provider-hub';
import { defaultMembershipService } from '@ai-pass/membership';
import { defaultWalletService } from '@ai-pass/wallet';
import type { MembershipTier } from '@ai-pass/shared';

let platformHub: ProviderHub | null = null;

/** Server-side singleton Provider Hub with managed API keys from env. */
export function getPlatformHub(): ProviderHub {
  if (!platformHub) {
    platformHub = createProviderHub({
      auth: createManagedAuthFromEnv(),
      membershipService: defaultMembershipService,
      walletService: defaultWalletService,
    });
  }
  return platformHub;
}

export function getUserMembershipTier(userId: string): MembershipTier {
  const usage = defaultMembershipService.getUsage(userId, 'free');
  return usage.tier;
}

export function onboardNewUser(userId: string): { isNew: boolean; credits: number } {
  if (defaultWalletService.hasUser(userId)) {
    const balance = defaultWalletService.getBalance(userId);
    return { isNew: false, credits: balance.creditsRemaining };
  }

  const credits = getEnvFreeMonthlyCredits();
  defaultWalletService.initializeNewUser(userId, credits);
  defaultMembershipService.setTier(userId, 'free');
  return { isNew: true, credits };
}
