import type {
  MembershipFeature,
  MembershipTier,
  MembershipUsage,
  OrgMembershipPolicy,
} from '@ai-pass/shared';
import {
  getPlan,
  MEMBERSHIP_PLANS,
  FREE_TIER_MODEL_IDS,
  POWER_ONLY_MODEL_IDS,
  POWER_ONLY_PROVIDER_IDS,
} from './plans.js';

export interface MembershipCheckResult {
  allowed: boolean;
  reason?: string;
  tier: MembershipTier;
}

export class MembershipService {
  private usage = new Map<string, MembershipUsage>();
  private orgPolicies = new Map<string, OrgMembershipPolicy>();

  getPlans() {
    return MEMBERSHIP_PLANS;
  }

  getEntitlements(tier: MembershipTier) {
    return getPlan(tier).entitlements;
  }

  getUsage(userId: string, tier: MembershipTier): MembershipUsage {
    const existing = this.usage.get(userId);
    if (existing) return existing;

    const plan = getPlan(tier);
    const usage: MembershipUsage = {
      userId,
      tier,
      requestsToday: 0,
      creditsUsedThisMonth: 0,
      creditsRemaining: plan.entitlements.monthlyCredits,
    };
    this.usage.set(userId, usage);
    return usage;
  }

  setTier(userId: string, tier: MembershipTier): MembershipUsage {
    const plan = getPlan(tier);
    const usage = this.getUsage(userId, tier);
    usage.tier = tier;
    usage.creditsRemaining = plan.entitlements.monthlyCredits - usage.creditsUsedThisMonth;
    this.usage.set(userId, usage);
    return usage;
  }

  hasFeature(tier: MembershipTier, feature: MembershipFeature): boolean {
    return getPlan(tier).entitlements.features.includes(feature);
  }

  canAccessModelTier(tier: MembershipTier, modelTier: 'free' | 'standard' | 'premium' | 'frontier'): boolean {
    return getPlan(tier).entitlements.allowedModelTiers.includes(modelTier);
  }

  canAccessModel(
    tier: MembershipTier,
    modelId: string,
    modelTier: 'free' | 'standard' | 'premium' | 'frontier',
    providerId?: string,
  ): boolean {
    if (!this.canAccessModelTier(tier, modelTier)) return false;

    if (tier === 'free') {
      return (FREE_TIER_MODEL_IDS as readonly string[]).includes(modelId);
    }

    if (tier === 'professional') {
      if (modelTier === 'frontier') return false;
      if (providerId && (POWER_ONLY_PROVIDER_IDS as readonly string[]).includes(providerId)) return false;
      if ((POWER_ONLY_MODEL_IDS as readonly string[]).includes(modelId)) return false;
      return true;
    }

    return true;
  }

  checkRequest(userId: string, tier: MembershipTier): MembershipCheckResult {
    const plan = getPlan(tier);
    const usage = this.getUsage(userId, tier);

    if (plan.entitlements.dailyRequestLimit !== null && usage.requestsToday >= plan.entitlements.dailyRequestLimit) {
      return {
        allowed: false,
        reason: `Daily limit of ${plan.entitlements.dailyRequestLimit} requests reached. Upgrade for more.`,
        tier,
      };
    }

    if (usage.creditsRemaining <= 0) {
      return {
        allowed: false,
        reason: 'Monthly credits exhausted. Upgrade or wait for renewal.',
        tier,
      };
    }

    return { allowed: true, tier };
  }

  recordRequest(userId: string, credits: number): void {
    const usage = this.usage.get(userId);
    if (!usage) return;
    usage.requestsToday += 1;
    usage.creditsUsedThisMonth += credits;
    usage.creditsRemaining = Math.max(0, usage.creditsRemaining - credits);
    this.usage.set(userId, usage);
  }

  setOrgPolicy(policy: OrgMembershipPolicy): void {
    this.orgPolicies.set(policy.orgId, policy);
  }

  getOrgPolicy(orgId: string): OrgMembershipPolicy | undefined {
    return this.orgPolicies.get(orgId);
  }

  isProviderAllowed(orgId: string | undefined, providerId: string): boolean {
    if (!orgId) return true;
    const policy = this.orgPolicies.get(orgId);
    if (!policy || policy.allowedProviders.length === 0) return true;
    return policy.allowedProviders.includes(providerId);
  }

  isModelBlocked(orgId: string | undefined, modelId: string): boolean {
    if (!orgId) return false;
    const policy = this.orgPolicies.get(orgId);
    return policy?.blockedModels.includes(modelId) ?? false;
  }
}

export const defaultMembershipService = new MembershipService();
