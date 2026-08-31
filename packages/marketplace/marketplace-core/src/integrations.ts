import { MembershipService } from '@ai-pass/membership';
import { defaultWalletService } from '@ai-pass/wallet';
import type { Application, Skill } from './types.js';
import type { CertificationRegistry } from './developers.js';

/** Lightweight trust stub — avoids hard dependency on trust-engine build graph */
class MarketplaceTrustStub {
  issue(_params: Record<string, unknown>): void {
    // Trust Engine integration point for marketplace certifications
  }
}

export interface MarketplaceIntegrations {
  membership: MembershipService;
  wallet: typeof defaultWalletService;
  trust: MarketplaceTrustStub;
}

export function createMarketplaceIntegrations(): MarketplaceIntegrations {
  return {
    membership: new MembershipService(),
    wallet: defaultWalletService,
    trust: new MarketplaceTrustStub(),
  };
}

export function checkInstallEntitlement(
  integrations: MarketplaceIntegrations,
  userTier: string,
): { allowed: boolean; reason?: string } {
  const entitlements = integrations.membership.getEntitlements(userTier as 'free' | 'professional' | 'power' | 'enterprise');
  if (!entitlements.features.includes('marketplace_install')) {
    return { allowed: false, reason: 'Upgrade to Professional to install marketplace apps' };
  }
  return { allowed: true };
}

export function recordSkillUsage(
  integrations: MarketplaceIntegrations,
  params: {
    userId: string;
    tenantId: string;
    skill: Skill;
    credits: number;
  },
): void {
  integrations.wallet.recordUsage({
    userId: params.userId,
    tenantId: params.tenantId,
    provider: 'marketplace',
    model: params.skill.name,
    credits: params.credits,
    estimatedCostUsd: params.credits * 0.01,
    taskType: 'skill_execution',
    module: 'marketplace',
    metadata: { skillId: params.skill.id, category: params.skill.category },
  });
}

export function issueAppCertification(
  integrations: MarketplaceIntegrations,
  app: Application,
  certRegistry: CertificationRegistry,
): void {
  if (!app.certified) return;

  certRegistry.issue({
    resourceType: 'app',
    resourceId: app.id,
    level: app.enterpriseReady ? 'gold' : 'silver',
    status: 'certified',
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 365 * 86400000).toISOString(),
    verificationUrl: `https://ai-pass.com/verify/app/${app.id}`,
  });

  integrations.trust.issue({
    systemId: app.id,
    companyName: app.name,
    level: app.enterpriseReady ? 'gold' : 'silver',
    scorecard: {
      accuracy: 92,
      reliability: 95,
      safety: app.riskLevel === 'critical' ? 88 : 94,
      transparency: 90,
      overall: 92,
    },
    riskClass: app.riskLevel === 'critical' ? 'high' : app.riskLevel === 'high' ? 'medium' : 'low',
  });
}

export type LiveSyncEventEmitter = (event: {
  type: 'marketplace.install' | 'marketplace.skill_execute' | 'marketplace.review';
  payload: Record<string, unknown>;
}) => void;

export function emitInstallEvent(
  emit: LiveSyncEventEmitter | undefined,
  installation: { appId: string; userId: string; tenantId: string },
): void {
  emit?.({
    type: 'marketplace.install',
    payload: installation,
  });
}

export function emitSkillExecuteEvent(
  emit: LiveSyncEventEmitter | undefined,
  params: { skillId: string; userId: string; credits: number },
): void {
  emit?.({
    type: 'marketplace.skill_execute',
    payload: params,
  });
}
