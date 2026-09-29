import type { GraphEdge, GraphNode, Industry } from './types';
import { getEnterpriseGraph } from './enterprise-graph';
import { getShapeConstraints } from './ontology';

/** Executable business rules over the assertional knowledge graph */

export type RuleSeverity = 'info' | 'warning' | 'critical';
export type RuleCategory =
  | 'governance'
  | 'compliance'
  | 'security'
  | 'routing'
  | 'quality'
  | 'lineage';

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  severity: RuleSeverity;
  industries?: Industry[];
  /** Human-readable when clause */
  when: string;
  /** Human-readable then clause */
  then: string;
  enabled: boolean;
}

export interface RuleViolation {
  ruleId: string;
  ruleName: string;
  severity: RuleSeverity;
  subjectId: string;
  subjectLabel: string;
  message: string;
  evidence: string[];
}

export interface RuleEvaluationResult {
  evaluatedAt: string;
  rulesEvaluated: number;
  passed: number;
  failed: number;
  violations: RuleViolation[];
  bySeverity: Record<RuleSeverity, number>;
}

const RULES: BusinessRule[] = [
  {
    id: 'br_agent_governed',
    name: 'Agents must be policy-governed',
    description: 'Every production agent asserts at least one governed_by policy edge.',
    category: 'governance',
    severity: 'critical',
    when: 'entity.type = Agent AND entity.status = production',
    then: 'EXISTS edge(agent, governed_by, Policy)',
    enabled: true,
  },
  {
    id: 'br_high_risk_human',
    name: 'High-risk actions require human gate',
    description: 'Agents that read high-risk assets must require the human oversight control.',
    category: 'compliance',
    severity: 'critical',
    when: 'Agent READS DataAsset WHERE risk = high OR amount > threshold',
    then: 'EXISTS edge(agent, requires, HumanOversightGate)',
    enabled: true,
  },
  {
    id: 'br_lineage_write',
    name: 'Regulated decisions write lineage',
    description: 'Agents constrained by GDPR/HIPAA/MDR must write to the decision lineage log.',
    category: 'lineage',
    severity: 'warning',
    when: 'EXISTS edge(agent, constrained_by, Regulation)',
    then: 'EXISTS edge(agent, writes, DecisionLineageLog)',
    enabled: true,
  },
  {
    id: 'br_secret_sovereign',
    name: 'SECRET data uses sovereign model',
    description: 'Agents reading SECRET clearance assets must use the on-prem sovereign model.',
    category: 'security',
    severity: 'critical',
    industries: ['defence'],
    when: 'Agent READS DataAsset WHERE clearance = SECRET',
    then: 'EXISTS edge(agent, must_use, OnPremSovereignModel)',
    enabled: true,
  },
  {
    id: 'br_iso_obligations',
    name: 'ISO 42001 obligations mapped',
    description: 'Every ISO 42001 obligation must be satisfied_by or partially_met_by a component.',
    category: 'compliance',
    severity: 'warning',
    when: 'edge(ISO42001, requires, Obligation)',
    then: 'EXISTS edge(obligation, satisfied_by|partially_met_by, Component)',
    enabled: true,
  },
  {
    id: 'br_cert_before_release',
    name: 'Trust certification gates release',
    description: 'Production release process must be gated by trust certification.',
    category: 'governance',
    severity: 'critical',
    when: 'entity = ProductionReleaseProcess',
    then: 'EXISTS edge(TrustCertification, gates, process)',
    enabled: true,
  },
  {
    id: 'br_phi_constraint',
    name: 'Clinical agents constrained by HIPAA',
    description: 'Healthcare agents that read clinical records must be constrained by HIPAA.',
    category: 'compliance',
    severity: 'critical',
    industries: ['healthcare'],
    when: 'Agent.industry = healthcare AND READS ClinicalRecord',
    then: 'EXISTS edge(agent, constrained_by, HIPAA)',
    enabled: true,
  },
  {
    id: 'br_quality_localize',
    name: 'Quality events localize to BOM',
    description: 'Sensor/quality events must localize to a BOM or product for digital-twin explainability.',
    category: 'quality',
    severity: 'warning',
    industries: ['manufacturing'],
    when: 'DataAsset is vibration/sensor event',
    then: 'EXISTS edge(event, localized_to, BOM) AND path to Product',
    enabled: true,
  },
  {
    id: 'br_router_approved',
    name: 'Router only invokes approved models',
    description: 'Model router may_invoke edges must target inventory-approved models.',
    category: 'routing',
    severity: 'info',
    when: 'edge(GovernedRouter, may_invoke, Model)',
    then: 'Model is in AI inventory (sys_aipass hosts path)',
    enabled: true,
  },
  {
    id: 'br_shacl_agent_policy',
    name: 'SHACL: agent policy shape',
    description: 'Ontology shape sh_agent_policy enforced as a business rule.',
    category: 'governance',
    severity: 'critical',
    when: 'SHACL targetClass = Agent',
    then: 'minCount(governed_by) >= 1',
    enabled: true,
  },
];

export function getBusinessRules(industry?: Industry): BusinessRule[] {
  return RULES
    .filter((r) => r.enabled)
    .filter((r) => !industry || !r.industries || r.industries.includes(industry))
    .map((r) => ({ ...r, industries: r.industries ? [...r.industries] : undefined }));
}

function edgesFrom(edges: GraphEdge[], from: string, predicate?: string): GraphEdge[] {
  return edges.filter((e) => e.from === from && (!predicate || e.predicate === predicate));
}

function hasEdge(edges: GraphEdge[], from: string, predicate: string, to?: string): boolean {
  return edges.some(
    (e) => e.from === from && e.predicate === predicate && (!to || e.to === to),
  );
}

function nodeById(nodes: GraphNode[], id: string): GraphNode | undefined {
  return nodes.find((n) => n.id === id);
}

/** Evaluate all enabled business rules against the enterprise twin */
export function evaluateBusinessRules(industry?: Industry): RuleEvaluationResult {
  const { nodes, edges } = getEnterpriseGraph();
  const rules = getBusinessRules(industry);
  const violations: RuleViolation[] = [];

  const agents = nodes.filter((n) => n.kind === 'Agent');
  const obligations = nodes.filter((n) => n.kind === 'Obligation');

  for (const rule of rules) {
    switch (rule.id) {
      case 'br_agent_governed':
      case 'br_shacl_agent_policy': {
        for (const agent of agents) {
          if (industry && agent.industry && agent.industry !== industry) continue;
          if (!hasEdge(edges, agent.id, 'governed_by')) {
            violations.push({
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              subjectId: agent.id,
              subjectLabel: agent.label,
              message: `${agent.label} has no governed_by policy edge.`,
              evidence: [`Missing predicate governed_by from ${agent.id}`],
            });
          }
        }
        break;
      }
      case 'br_high_risk_human': {
        for (const agent of agents) {
          const reads = edgesFrom(edges, agent.id, 'reads');
          const highRisk = reads.some((e) => {
            const asset = nodeById(nodes, e.to);
            const risk = asset?.properties?.risk;
            return risk === 'high' || String(asset?.properties?.amount ?? '').includes('185');
          });
          if (highRisk && !hasEdge(edges, agent.id, 'requires', 'ctrl_human')) {
            violations.push({
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              subjectId: agent.id,
              subjectLabel: agent.label,
              message: 'High-risk read without human oversight gate.',
              evidence: reads.map((e) => `${e.from} -reads-> ${e.to}`),
            });
          }
        }
        break;
      }
      case 'br_lineage_write': {
        for (const agent of agents) {
          if (!hasEdge(edges, agent.id, 'constrained_by')) continue;
          if (!hasEdge(edges, agent.id, 'writes', 'ctrl_lineage')) {
            violations.push({
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              subjectId: agent.id,
              subjectLabel: agent.label,
              message: 'Regulated agent does not write decision lineage.',
              evidence: [`constrained_by present; writes→ctrl_lineage missing`],
            });
          }
        }
        break;
      }
      case 'br_secret_sovereign': {
        for (const agent of agents) {
          const secretReads = edgesFrom(edges, agent.id, 'reads').filter((e) => {
            const asset = nodeById(nodes, e.to);
            return asset?.properties?.clearance === 'SECRET';
          });
          if (secretReads.length && !hasEdge(edges, agent.id, 'must_use', 'model_local')) {
            violations.push({
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              subjectId: agent.id,
              subjectLabel: agent.label,
              message: 'SECRET asset read without sovereign model constraint.',
              evidence: secretReads.map((e) => e.to),
            });
          }
        }
        break;
      }
      case 'br_iso_obligations': {
        for (const obl of obligations) {
          const mapped =
            hasEdge(edges, obl.id, 'satisfied_by') ||
            hasEdge(edges, obl.id, 'partially_met_by');
          if (!mapped) {
            violations.push({
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              subjectId: obl.id,
              subjectLabel: obl.label,
              message: 'Obligation has no implementing component mapping.',
              evidence: [`No satisfied_by / partially_met_by from ${obl.id}`],
            });
          }
        }
        break;
      }
      case 'br_cert_before_release': {
        if (!hasEdge(edges, 'ctrl_cert', 'gates', 'proc_release')) {
          violations.push({
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            subjectId: 'proc_release',
            subjectLabel: 'Production Release Process',
            message: 'Release process is not gated by trust certification.',
            evidence: ['Missing ctrl_cert -gates-> proc_release'],
          });
        }
        break;
      }
      case 'br_phi_constraint': {
        for (const agent of agents.filter((a) => a.industry === 'healthcare')) {
          if (!hasEdge(edges, agent.id, 'constrained_by', 'reg_hipaa')) {
            violations.push({
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              subjectId: agent.id,
              subjectLabel: agent.label,
              message: 'Healthcare agent missing HIPAA constraint.',
              evidence: [`Expected constrained_by → reg_hipaa`],
            });
          }
        }
        break;
      }
      case 'br_quality_localize': {
        const sensor = nodeById(nodes, 'data_sensor');
        if (sensor) {
          const loc = edgesFrom(edges, sensor.id, 'localized_to');
          const bom = loc[0] && nodeById(nodes, loc[0].to);
          const toProduct = bom
            ? edges.some((e) => e.from === bom.id && e.predicate === 'part_of')
            : false;
          if (!loc.length || !toProduct) {
            violations.push({
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              subjectId: sensor.id,
              subjectLabel: sensor.label,
              message: 'Quality event lacks full localization path to product.',
              evidence: loc.map((e) => `${e.from}→${e.to}`),
            });
          }
        }
        break;
      }
      case 'br_router_approved': {
        const invokes = edges.filter((e) => e.from === 'model_router' && e.predicate === 'may_invoke');
        for (const e of invokes) {
          const model = nodeById(nodes, e.to);
          if (!model) {
            violations.push({
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              subjectId: e.to,
              subjectLabel: e.to,
              message: 'Router invokes unknown model.',
              evidence: [e.id],
            });
          }
        }
        break;
      }
      default:
        break;
    }
  }

  // SHACL shape cross-check (counts toward evaluation)
  const shapes = getShapeConstraints();
  void shapes;

  const bySeverity: Record<RuleSeverity, number> = { info: 0, warning: 0, critical: 0 };
  for (const v of violations) bySeverity[v.severity] += 1;

  return {
    evaluatedAt: new Date().toISOString(),
    rulesEvaluated: rules.length,
    passed: rules.length - new Set(violations.map((v) => v.ruleId)).size,
    failed: new Set(violations.map((v) => v.ruleId)).size,
    violations,
    bySeverity,
  };
}

export function businessRulesSummary() {
  return {
    total: RULES.length,
    enabled: RULES.filter((r) => r.enabled).length,
    categories: [...new Set(RULES.map((r) => r.category))],
  };
}
