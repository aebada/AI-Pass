import { createId } from '@ai-pass/shared';
import type { DeveloperApiKey, DeveloperPayoutStub, DeveloperProfile } from './types.js';
import type { DeveloperService } from './developers.js';
import type { RevenueShareEngine } from './revenue.js';

export class DeveloperPortalService {
  private apiKeys = new Map<string, DeveloperApiKey[]>();
  private payouts = new Map<string, DeveloperPayoutStub[]>();

  constructor(
    private developers: DeveloperService,
    private revenue: RevenueShareEngine,
  ) {}

  register(params: Omit<DeveloperProfile, 'createdAt'>): DeveloperProfile {
    return this.developers.register(params);
  }

  verify(developerId: string): DeveloperProfile | undefined {
    const dev = this.developers.get(developerId);
    if (!dev) return undefined;
    dev.verified = true;
    if (!dev.badges.some((b) => b.type === 'verified_developer')) {
      dev.badges.push({
        type: 'verified_developer',
        label: 'Verified Developer',
        issuedAt: new Date().toISOString(),
      });
    }
    return dev;
  }

  createApiKey(developerId: string, label: string, sandbox = true): DeveloperApiKey {
    const key: DeveloperApiKey = {
      id: `key_${createId()}`,
      developerId,
      label,
      keyPrefix: `aip_${sandbox ? 'sb' : 'live'}_${createId().slice(0, 8)}`,
      sandbox,
      createdAt: new Date().toISOString(),
    };
    const keys = this.apiKeys.get(developerId) ?? [];
    keys.push(key);
    this.apiKeys.set(developerId, keys);
    return key;
  }

  listApiKeys(developerId: string): DeveloperApiKey[] {
    return this.apiKeys.get(developerId) ?? [];
  }

  revokeApiKey(developerId: string, keyId: string): boolean {
    const keys = this.apiKeys.get(developerId) ?? [];
    const next = keys.filter((k) => k.id !== keyId);
    if (next.length === keys.length) return false;
    this.apiKeys.set(developerId, next);
    return true;
  }

  getPayoutStub(developerId: string, period: string, grossRevenue: number): DeveloperPayoutStub {
    const share = this.revenue.getConfig();
    const platformFee = grossRevenue * share.platformFee;
    const stub: DeveloperPayoutStub = {
      developerId,
      period,
      grossRevenue,
      platformFee,
      netPayout: grossRevenue * share.developerShare,
      currency: 'USD',
      status: 'pending',
    };
    const existing = this.payouts.get(developerId) ?? [];
    existing.push(stub);
    this.payouts.set(developerId, existing);
    return stub;
  }

  listPayouts(developerId: string): DeveloperPayoutStub[] {
    return this.payouts.get(developerId) ?? [];
  }

  getDashboard(developerId: string) {
    const dev = this.developers.get(developerId);
    if (!dev) return null;
    return {
      profile: dev,
      apiKeys: this.listApiKeys(developerId),
      payouts: this.listPayouts(developerId),
      revenueShare: this.revenue.getConfig(),
    };
  }
}
