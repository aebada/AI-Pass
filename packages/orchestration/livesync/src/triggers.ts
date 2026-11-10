import type { TriggerCondition, TriggerMapping } from '@ai-pass/shared';
import { createId } from '@ai-pass/shared';

export const DEFAULT_TRIGGER_MAPPINGS: TriggerMapping[] = [
  {
    id: 'trg_invoice_uploaded',
    event_type: 'invoice.uploaded',
    workflow_id: 'wf_invoice_validation',
    agent_name: 'invoice-validator',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_supplier_updated',
    event_type: 'supplier.updated',
    workflow_id: 'wf_supplier_recommendation',
    agent_name: 'supplier-analyzer',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_analysis_dataset',
    event_type: 'analysis.dataset_uploaded',
    workflow_id: 'wf_analysis_auto_run',
    agent_name: 'analysis-runner',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_knowledge_sync',
    event_type: 'knowledge.source_updated',
    workflow_id: 'wf_knowledge_sync',
    agent_name: 'knowledge-sync-agent',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_erp_invoice_synced',
    event_type: 'erp.invoice.synced',
    workflow_id: 'wf_invoice_validation',
    agent_name: 'payment-agent',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_erp_payment_posted',
    event_type: 'erp.payment.posted',
    workflow_id: 'wf_invoice_validation',
    agent_name: 'payment-agent',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_erp_connection_failed',
    event_type: 'erp.connection.failed',
    workflow_id: 'wf_governance_escalation',
    agent_name: 'governance-monitor',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_governance_model_update',
    event_type: 'governance.model_update',
    workflow_id: 'wf_governance_escalation',
    agent_name: 'governance-monitor',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_governance_policy_change',
    event_type: 'governance.policy_change',
    workflow_id: 'wf_governance_escalation',
    agent_name: 'governance-monitor',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_governance_app_install',
    event_type: 'marketplace.app_installed',
    workflow_id: 'wf_governance_escalation',
    agent_name: 'governance-monitor',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_governance_risk_detected',
    event_type: 'governance.risk_detected',
    workflow_id: 'wf_governance_escalation',
    agent_name: 'governance-monitor',
    conditions: [{ field: 'severity', operator: 'gte', value: 'high' }],
    is_active: true,
  },
  {
    id: 'trg_governance_provider_updated',
    event_type: 'provider.updated',
    workflow_id: 'wf_governance_escalation',
    agent_name: 'governance-monitor',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_erp_sync',
    event_type: 'erp.sync',
    workflow_id: 'wf_invoice_validation',
    agent_name: 'payment-agent',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_customer_created',
    event_type: 'customer.created',
    workflow_id: 'wf_customer_onboard',
    agent_name: 'customer-agent',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_user_registered',
    event_type: 'user.registered',
    workflow_id: 'wf_customer_onboard',
    agent_name: 'customer-agent',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_policy_updated',
    event_type: 'policy.updated',
    workflow_id: 'wf_governance_escalation',
    agent_name: 'governance-monitor',
    target_type: 'workflow',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_agent_executed',
    event_type: 'agent.executed',
    workflow_id: 'wf_analysis_auto_run',
    agent_name: 'analysis-runner',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_workflow_completed',
    event_type: 'workflow.completed',
    workflow_id: 'wf_knowledge_sync',
    agent_name: 'knowledge-sync-agent',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_analysis_finished',
    event_type: 'analysis.finished',
    workflow_id: 'wf_analysis_auto_run',
    agent_name: 'analysis-runner',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_knowledge_updated',
    event_type: 'knowledge.updated',
    workflow_id: 'wf_knowledge_sync',
    agent_name: 'knowledge-sync-agent',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_marketplace_installed',
    event_type: 'marketplace.installed',
    workflow_id: 'wf_marketplace_onboard',
    target_type: 'marketplace_app',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_model_changed',
    event_type: 'model.changed',
    workflow_id: 'wf_governance_escalation',
    agent_name: 'governance-monitor',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_trust_validation',
    event_type: 'trust.validation.completed',
    workflow_id: 'wf_governance_escalation',
    agent_name: 'governance-monitor',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_compliance_risk',
    event_type: 'compliance.risk.created',
    workflow_id: 'wf_governance_escalation',
    agent_name: 'governance-monitor',
    conditions: [{ field: 'severity', operator: 'gte', value: 'medium' }],
    is_active: true,
  },
  {
    id: 'trg_support_ticket',
    event_type: 'support.ticket.updated',
    workflow_id: 'wf_customer_onboard',
    agent_name: 'customer-agent',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_presence_kb',
    event_type: 'presence.knowledge.updated',
    workflow_id: 'wf_knowledge_sync',
    agent_name: 'knowledge-sync-agent',
    conditions: [],
    is_active: true,
  },
  {
    id: 'trg_custom_wildcard',
    event_type: 'custom.*',
    workflow_id: 'wf_analysis_auto_run',
    agent_name: 'analysis-runner',
    conditions: [],
    is_active: true,
  },
];

function getFieldValue(payload: Record<string, unknown>, field: string): unknown {
  return field.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, payload);
}

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
  return String(a).localeCompare(String(b));
}

const SEVERITY_RANK: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function resolveComparable(value: unknown): number | string {
  if (typeof value === 'string' && value in SEVERITY_RANK) {
    return SEVERITY_RANK[value];
  }
  if (typeof value === 'number') return value;
  return String(value);
}

export function matchesCondition(
  payload: Record<string, unknown>,
  condition: TriggerCondition
): boolean {
  const actual = getFieldValue(payload, condition.field);

  switch (condition.operator) {
    case 'exists':
      return actual !== undefined && actual !== null;
    case 'eq':
      return actual === condition.value;
    case 'neq':
      return actual !== condition.value;
    case 'contains':
      return typeof actual === 'string' && typeof condition.value === 'string'
        ? actual.includes(condition.value)
        : false;
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte': {
      const left = resolveComparable(actual);
      const right = resolveComparable(condition.value);
      const cmp = compareValues(left, right);
      if (condition.operator === 'gt') return cmp > 0;
      if (condition.operator === 'gte') return cmp >= 0;
      if (condition.operator === 'lt') return cmp < 0;
      return cmp <= 0;
    }
    default:
      return false;
  }
}

export class TriggerRegistry {
  private mappings = new Map<string, TriggerMapping>();

  constructor(seed: TriggerMapping[] = DEFAULT_TRIGGER_MAPPINGS) {
    for (const mapping of seed) {
      this.mappings.set(mapping.id, mapping);
    }
  }

  list(): TriggerMapping[] {
    return [...this.mappings.values()];
  }

  register(mapping: Omit<TriggerMapping, 'id'> & { id?: string }): TriggerMapping {
    const entry: TriggerMapping = {
      ...mapping,
      id: mapping.id ?? `trg_${createId()}`,
    };
    this.mappings.set(entry.id, entry);
    return entry;
  }

  findByEventType(eventType: string): TriggerMapping[] {
    return this.list().filter((m) => m.is_active && m.event_type === eventType);
  }
}

export class TriggerResolver {
  constructor(private registry: TriggerRegistry) {}

  resolve(
    eventType: string,
    payload: Record<string, unknown>
  ): TriggerMapping | undefined {
    const candidates = this.registry.findByEventType(eventType);
    const customMatch = eventType.startsWith('custom.')
      ? this.registry.findByEventType('custom.*')
      : [];
    const all = [...candidates, ...customMatch];
    return all.find((mapping) =>
      mapping.conditions.every((c) => matchesCondition(payload, c))
    );
  }
}
