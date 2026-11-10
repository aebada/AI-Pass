import { createId, type AISystem, type GovernanceEvaluation, type GovernancePolicy, type PolicyRule } from '@ai-pass/shared';

/** @deprecated Use PolicyService + PolicyEnforcementEngine */
export class PolicyEngine {
  private policies = new Map<string, GovernancePolicy>();

  registerPolicy(policy: Omit<GovernancePolicy, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'category' | 'frameworks' | 'createdBy'> & Partial<Pick<GovernancePolicy, 'category' | 'frameworks' | 'createdBy'>>): GovernancePolicy {
    const entry: GovernancePolicy = {
      category: 'compliance',
      frameworks: ['internal'],
      createdBy: 'system',
      status: 'published',
      updatedAt: new Date().toISOString(),
      ...policy,
      id: `pol_${createId()}`,
      createdAt: new Date().toISOString(),
    };
    this.policies.set(entry.id, entry);
    return entry;
  }

  evaluate(params: {
    systemId: string;
    action: string;
    context: Record<string, unknown>;
    systemType?: AISystem['type'];
  }): GovernanceEvaluation {
    const activePolicies = [...this.policies.values()].filter((p) => p.active);
    const violations: string[] = [];
    let requiresHumanApproval = false;

    for (const policy of activePolicies) {
      if (params.systemType && !policy.applicableSystemTypes.includes(params.systemType)) continue;

      for (const rule of policy.rules) {
        if (this.ruleTriggered(rule, params.context)) {
          violations.push(`${policy.name}: ${rule.type}`);
          if (rule.action === 'block') {
            return { allowed: false, decision: 'block', violations, requiresHumanApproval: true };
          }
          if (rule.action === 'escalate' || rule.action === 'require_approval' || rule.type === 'human_approval') {
            requiresHumanApproval = true;
          }
        }
      }
    }

    if (requiresHumanApproval) {
      return { allowed: false, decision: 'escalate', violations, requiresHumanApproval: true };
    }

    return { allowed: true, decision: 'allow', violations: [], requiresHumanApproval: false };
  }

  private ruleTriggered(rule: PolicyRule, context: Record<string, unknown>): boolean {
    switch (rule.type) {
      case 'mandatory_citation':
        return context.requires_citation === true && !context.citations;
      case 'human_approval':
        return context.risk_level === 'high' || context.risk_level === 'critical';
      case 'pii_masking':
        return context.contains_pii === true && context.pii_masked !== true;
      case 'prohibited_prompt':
        return typeof context.prompt === 'string' && String(rule.condition.pattern ?? '').length > 0
          ? String(context.prompt).includes(String(rule.condition.pattern))
          : false;
      default:
        return false;
    }
  }
}
