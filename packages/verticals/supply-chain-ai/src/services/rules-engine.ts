import type { AgentDecision } from '@ai-pass/shared';
import type { Offer, ProcurementPolicy, ProcurementRule, RuleResult, SourcingEvent, Supplier } from '../types.js';

export const DEFAULT_RULES: ProcurementRule[] = [
  { id: 'rule_budget', name: 'Budget Cap', category: 'budget', description: 'Offer must not exceed event budget', severity: 'error', enabled: true },
  { id: 'rule_certs', name: 'ISO Certification', category: 'certs', description: 'Supplier must hold ISO 9001', severity: 'warning', enabled: true },
  { id: 'rule_blacklist', name: 'Blacklist Check', category: 'blacklist', description: 'Supplier must not be blocked', severity: 'error', enabled: true },
  { id: 'rule_country', name: 'Country Restrictions', category: 'country', description: 'No restricted country suppliers', severity: 'error', enabled: true },
  { id: 'rule_delivery', name: 'Delivery SLA', category: 'delivery', description: 'Delivery within event deadline window', severity: 'warning', enabled: true },
  { id: 'rule_docs', name: 'Required Documents', category: 'docs', description: 'Offer must include required documentation', severity: 'warning', enabled: true },
  { id: 'rule_policy', name: 'Policy Compliance', category: 'policy', description: 'Offer must comply with active procurement policies', severity: 'error', enabled: true },
];

const RESTRICTED_COUNTRIES = ['KP', 'IR', 'SY'];

export class RulesEngine {
  evaluate(params: {
    event: SourcingEvent;
    offer: Offer;
    supplier: Supplier;
    policies: ProcurementPolicy[];
    rules?: ProcurementRule[];
    maxLeadTimeDays?: number;
  }): { decision: AgentDecision; results: RuleResult[] } {
    const rules = params.rules ?? DEFAULT_RULES.filter((r) => r.enabled);
    const results: RuleResult[] = [];

    for (const rule of rules) {
      results.push(this.evaluateRule(rule, params));
    }

    const hasFail = results.some((r) => r.outcome === 'FAIL');
    const hasNeedsInfo = results.some((r) => r.outcome === 'NEEDS_INFO');

    let decision: AgentDecision = 'PASS';
    if (hasFail) decision = 'FAIL';
    else if (hasNeedsInfo) decision = 'NEEDS_INFO';

    return { decision, results };
  }

  private evaluateRule(
    rule: ProcurementRule,
    params: { event: SourcingEvent; offer: Offer; supplier: Supplier; policies: ProcurementPolicy[]; maxLeadTimeDays?: number },
  ): RuleResult {
    const { event, offer, supplier, policies, maxLeadTimeDays } = params;
    const price = Number(offer.normalizedFields.price?.value ?? offer.totalPrice ?? 0);
    const delivery = Number(offer.normalizedFields.delivery_days?.value ?? offer.deliveryDays ?? 999);
    const hasIso = Boolean(offer.normalizedFields.iso_9001?.value) || supplier.certifications.includes('ISO 9001');

    switch (rule.category) {
      case 'budget': {
        const cap = event.budgetCap;
        if (cap && price > cap) {
          return this.result(rule, 'FAIL', `Price ${price} exceeds budget cap ${cap}`);
        }
        return this.result(rule, 'PASS', 'Within budget');
      }
      case 'certs':
        return hasIso
          ? this.result(rule, 'PASS', 'ISO 9001 certified')
          : this.result(rule, 'NEEDS_INFO', 'ISO 9001 certification not confirmed');
      case 'blacklist':
        return supplier.status === 'blocked'
          ? this.result(rule, 'FAIL', `Supplier blocked: ${supplier.blacklistReason ?? 'policy violation'}`)
          : this.result(rule, 'PASS', 'Supplier not on blacklist');
      case 'country':
        return RESTRICTED_COUNTRIES.includes(supplier.country)
          ? this.result(rule, 'FAIL', `Restricted country: ${supplier.country}`)
          : this.result(rule, 'PASS', `Country ${supplier.country} allowed`);
      case 'delivery': {
        const maxDays = maxLeadTimeDays ?? 90;
        return delivery > maxDays
          ? this.result(rule, 'NEEDS_INFO', `Delivery ${delivery}d exceeds max ${maxDays}d`)
          : this.result(rule, 'PASS', `Delivery ${delivery}d within SLA`);
      }
      case 'docs':
        return offer.fields.length >= 5
          ? this.result(rule, 'PASS', 'Required fields extracted')
          : this.result(rule, 'NEEDS_INFO', 'Incomplete documentation');
      case 'policy': {
        const active = policies.filter((p) => p.status === 'active');
        if (active.length === 0) return this.result(rule, 'PASS', 'No active policies');
        const compliant = supplier.riskScore < 70;
        return compliant
          ? this.result(rule, 'PASS', `Compliant with ${active.length} active policy(ies)`)
          : this.result(rule, 'FAIL', 'Policy violation: supplier risk threshold exceeded');
      }
      default:
        return this.result(rule, 'PASS', 'Rule passed');
    }
  }

  private result(rule: ProcurementRule, outcome: AgentDecision, message: string): RuleResult {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      category: rule.category,
      outcome,
      message,
      severity: rule.severity,
    };
  }
}
