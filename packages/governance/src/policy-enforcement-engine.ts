import type {
  AISystemType,
  GovernanceEvaluation,
  GovernancePolicy,
  PolicyRule,
} from '@ai-pass/shared';

export interface EnforcementContext {
  systemId: string;
  action: string;
  context: Record<string, unknown>;
  systemType?: AISystemType;
  modelId?: string;
  prompt?: string;
  confidence?: number;
  citations?: string[];
}

export class PolicyEnforcementEngine {
  constructor(private getPolicies: () => GovernancePolicy[]) {}

  evaluate(params: EnforcementContext): GovernanceEvaluation {
    const activePolicies = this.getPolicies().filter((p) => p.active && p.status === 'published');
    const violations: string[] = [];
    let requiresHumanApproval = false;
    const blockedModels: string[] = [];
    const requiredApprovals: string[] = [];

    for (const policy of activePolicies) {
      if (params.systemType && !policy.applicableSystemTypes.includes(params.systemType)) continue;

      for (const rule of policy.rules) {
        const triggered = this.ruleTriggered(rule, params);
        if (!triggered) continue;

        violations.push(`${policy.name} (${policy.version}): ${rule.type}`);

        switch (rule.action) {
          case 'block':
            return {
              allowed: false,
              decision: 'block',
              violations,
              requiresHumanApproval: true,
              blockedModels: rule.type === 'blocked_models' ? this.extractModels(rule) : blockedModels,
            };
          case 'require_approval':
          case 'escalate':
            requiresHumanApproval = true;
            requiredApprovals.push(policy.id);
            break;
          case 'warn':
          case 'log':
            break;
        }
      }
    }

    if (requiresHumanApproval) {
      return {
        allowed: false,
        decision: 'require_approval',
        violations,
        requiresHumanApproval: true,
        requiredApprovals,
      };
    }

    return { allowed: true, decision: 'allow', violations: [], requiresHumanApproval: false };
  }

  isModelAllowed(modelId: string, systemType?: AISystemType): GovernanceEvaluation {
    return this.evaluate({
      systemId: 'provider-routing',
      action: 'model_selection',
      context: {},
      systemType,
      modelId,
    });
  }

  private ruleTriggered(rule: PolicyRule, params: EnforcementContext): boolean {
    const ctx = { ...params.context, prompt: params.prompt, modelId: params.modelId, confidence: params.confidence, citations: params.citations };

    switch (rule.type) {
      case 'mandatory_citation':
        return ctx.requires_citation === true && !ctx.citations;
      case 'human_approval':
      case 'human_review':
        return ctx.risk_level === 'high' || ctx.risk_level === 'critical';
      case 'pii_masking':
        return ctx.contains_pii === true && ctx.pii_masked !== true;
      case 'prohibited_prompt':
        return typeof ctx.prompt === 'string' && typeof rule.condition.pattern === 'string'
          ? ctx.prompt.toLowerCase().includes(String(rule.condition.pattern).toLowerCase())
          : false;
      case 'blocked_models': {
        const blocked = this.extractModels(rule);
        return params.modelId ? blocked.includes(params.modelId) : false;
      }
      case 'allowed_models': {
        const allowed = this.extractModels(rule);
        return params.modelId ? allowed.length > 0 && !allowed.includes(params.modelId) : false;
      }
      case 'confidence_threshold': {
        const threshold = Number(rule.condition.min ?? 0.8);
        return typeof params.confidence === 'number' && params.confidence < threshold;
      }
      case 'explainability':
        return ctx.requires_explanation === true && !ctx.explanation;
      case 'restricted_workflow':
        return typeof rule.condition.workflowId === 'string' && ctx.workflow_id === rule.condition.workflowId;
      default:
        return false;
    }
  }

  private extractModels(rule: PolicyRule): string[] {
    const models = rule.condition.models ?? rule.condition.modelIds;
    return Array.isArray(models) ? models.map(String) : [];
  }
}
