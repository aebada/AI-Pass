import type { MembershipTier } from '@ai-pass/shared';
import { MembershipService } from '@ai-pass/membership';
import { defaultWalletService } from '@ai-pass/wallet';
import type { TrustMembershipLimits } from './types.js';

export const TRUST_MEMBERSHIP_LIMITS: Record<MembershipTier, TrustMembershipLimits> = {
  free: { validationsPerMonth: 1, monitoringTier: 'none', maxCertLevel: 'bronze', reportsPerMonth: 1 },
  professional: { validationsPerMonth: 5, monitoringTier: 'basic', maxCertLevel: 'silver', reportsPerMonth: 5 },
  power: { validationsPerMonth: 20, monitoringTier: 'standard', maxCertLevel: 'gold', reportsPerMonth: 20 },
  enterprise: { validationsPerMonth: 100, monitoringTier: 'enterprise', maxCertLevel: 'platinum', reportsPerMonth: 100 },
};

export const TRUST_CREDIT_COSTS = {
  validation: 50,
  certification: 100,
  monitoring_monthly: 25,
  report: 10,
} as const;

export interface TrustIntegrations {
  membership: MembershipService;
  wallet: typeof defaultWalletService;
}

export function createTrustIntegrations(): TrustIntegrations {
  return {
    membership: new MembershipService(),
    wallet: defaultWalletService,
  };
}

export function getTrustLimits(tier: string): TrustMembershipLimits {
  return TRUST_MEMBERSHIP_LIMITS[tier as MembershipTier] ?? TRUST_MEMBERSHIP_LIMITS.free;
}

export function checkValidationEntitlement(
  integrations: TrustIntegrations,
  userId: string,
  tier: string,
  validationsThisMonth: number,
): { allowed: boolean; reason?: string } {
  const limits = getTrustLimits(tier);
  if (validationsThisMonth >= limits.validationsPerMonth) {
    return {
      allowed: false,
      reason: `Validation limit reached (${limits.validationsPerMonth}/month on ${tier} plan). Upgrade for more.`,
    };
  }
  const check = integrations.membership.checkRequest(userId, tier as MembershipTier);
  if (!check.allowed) return check;
  return { allowed: true };
}

export function consumeTrustCredits(
  integrations: TrustIntegrations,
  params: {
    userId: string;
    tenantId: string;
    action: keyof typeof TRUST_CREDIT_COSTS;
    systemId: string;
    metadata?: Record<string, unknown>;
  },
): void {
  const credits = TRUST_CREDIT_COSTS[params.action];
  integrations.wallet.recordUsage({
    userId: params.userId,
    tenantId: params.tenantId,
    provider: 'trust-engine',
    model: params.action,
    credits,
    estimatedCostUsd: credits * 0.01,
    taskType: 'trust',
    module: 'trust',
    metadata: { systemId: params.systemId, ...params.metadata },
  });
  integrations.membership.recordRequest(params.userId, credits);
}

export type LiveSyncTrustEmitter = (event: {
  type: 'trust.validation' | 'trust.certification' | 'trust.monitoring_alert' | 'trust.revalidation';
  payload: Record<string, unknown>;
}) => void;

export function emitMonitoringAlert(
  emit: LiveSyncTrustEmitter | undefined,
  event: { systemId: string; type: string; severity: string; details: Record<string, unknown> },
): void {
  emit?.({
    type: 'trust.monitoring_alert',
    payload: event,
  });
}

export const COMPLIANCE_FRAMEWORK_STUBS = [
  { framework: 'ISO_42001' as const, controlsTotal: 42, controlsPassed: 38 },
  { framework: 'ISO_27001' as const, controlsTotal: 114, controlsPassed: 108 },
  { framework: 'SOC2' as const, controlsTotal: 64, controlsPassed: 61 },
  { framework: 'GDPR' as const, controlsTotal: 28, controlsPassed: 27 },
  { framework: 'NIS2' as const, controlsTotal: 18, controlsPassed: 16 },
  { framework: 'DORA' as const, controlsTotal: 22, controlsPassed: 20 },
];
