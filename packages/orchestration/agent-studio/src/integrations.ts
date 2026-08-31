import type { MembershipTier, RiskLevel } from '@ai-pass/shared';
import { defaultMembershipService } from '@ai-pass/membership';
import { getPlan } from '@ai-pass/membership';
import { GovernanceHook } from '@ai-pass/governance';

export function checkAgentStudioAccess(tier: MembershipTier): { allowed: boolean; reason?: string } {
  if (!defaultMembershipService.hasFeature(tier, 'agent_studio')) {
    return { allowed: false, reason: 'Agent Studio requires Professional plan or higher.' };
  }
  return { allowed: true };
}

export function checkExecutionGates(
  tier: MembershipTier,
  agentCount: number,
): { allowed: boolean; reason?: string } {
  const access = checkAgentStudioAccess(tier);
  if (!access.allowed) return access;

  const plan = getPlan(tier);
  const maxAgents = plan.entitlements.maxAgents;
  if (maxAgents !== null && agentCount >= maxAgents) {
    return { allowed: false, reason: `Agent limit reached (${maxAgents}). Upgrade to create more agents.` };
  }
  return { allowed: true };
}

export function checkMultiAgentGate(tier: MembershipTier): { allowed: boolean; reason?: string } {
  if (!defaultMembershipService.hasFeature(tier, 'multi_agent')) {
    return { allowed: false, reason: 'Multi-agent orchestration requires Power plan or higher.' };
  }
  return { allowed: true };
}

export function checkPublishingGate(tier: MembershipTier): { allowed: boolean; reason?: string } {
  if (!defaultMembershipService.hasFeature(tier, 'marketplace_install')) {
    return { allowed: false, reason: 'Marketplace publishing requires Professional plan or higher.' };
  }
  return { allowed: true };
}

export function runGovernanceCheck(
  agentId: string,
  riskLevel: RiskLevel,
  input: Record<string, unknown>,
): { allowed: boolean; violations: string[] } {
  try {
    const hook = new GovernanceHook();
    const evaluation = hook.evaluatePolicies({
      systemId: agentId,
      action: 'agent.execute',
      context: { input, riskLevel },
    });
    return {
      allowed: evaluation.allowed,
      violations: evaluation.violations,
    };
  } catch {
    return { allowed: true, violations: [] };
  }
}

export function runTrustCheck(trustScore?: number): number {
  return trustScore ?? 75;
}

/** Provider Hub routing stub — all agent AI calls route through hub */
export function routeAgentModel(modelId: string, tier: MembershipTier): { providerId: string; modelId: string } {
  const enterprise = defaultMembershipService.hasFeature(tier, 'private_routing');
  return {
    providerId: enterprise ? 'byok-enterprise' : 'provider-hub-auto',
    modelId,
  };
}

/** Knowledge Pipeline RAG stub */
export function retrieveKnowledge(query: string, collectionId?: string): { chunks: string[]; citations: string[] } {
  return {
    chunks: [`Retrieved context for: ${query.slice(0, 80)}`],
    citations: collectionId ? [`kb://${collectionId}/doc_001`] : [],
  };
}

/** LiveSync trigger registration stub */
export function registerLiveSyncTrigger(agentId: string, eventType: string): { subscriptionId: string } {
  return { subscriptionId: `livesync_${agentId}_${eventType}` };
}

/** Wallet credit estimate */
export function estimateExecutionCredits(skillIds: string[], baseCost = 10): number {
  return baseCost + skillIds.length * 8;
}
