export type {
  Industry,
  EntityKind,
  GraphNode,
  GraphEdge,
  ProvenanceHop,
  GraphRagAnswer,
  ComplianceGap,
  DecisionStep,
  DecisionLineage,
  DemoScenario,
} from './types';

export {
  getEnterpriseGraph,
  nodesForIndustry,
  edgesAmong,
} from './enterprise-graph';

export { graphRagQuery, subgraphForAnswer } from './graph-rag';

export { getComplianceGaps, complianceSummary } from './compliance-ontology';

export { getLineages, getLineage } from './decision-lineage';

export {
  DEMO_SCENARIOS,
  INDUSTRY_LABELS,
  runSemanticDemo,
  listGraphOverview,
} from './demo';
export type { DemoSnapshot } from './demo';

export type {
  OntologyNamespace,
  OntologyClass,
  OntologyProperty,
  OntologyAxiom,
  ShapeConstraint,
} from './ontology';
export {
  getOntologyClasses,
  getOntologyProperties,
  getOntologyAxioms,
  getShapeConstraints,
  getClassHierarchy,
  isSubClassOf,
  ontologySummary,
} from './ontology';

export type { GraphLayerId, GraphLayer, LayeredGraph } from './layers';
export { buildLayeredGraph, nodesOfType } from './layers';

export type {
  RuleSeverity,
  RuleCategory,
  BusinessRule,
  RuleViolation,
  RuleEvaluationResult,
} from './business-rules';
export {
  getBusinessRules,
  evaluateBusinessRules,
  businessRulesSummary,
} from './business-rules';

export type { Inference, ShapeViolation, ReasonerResult } from './reasoner';
export { runReasoner, validateShapes } from './reasoner';

export type {
  SemanticLayerSnapshot,
  SemanticCapabilities,
} from './semantic-platform';
export {
  SemanticPlatform,
  getSemanticPlatform,
  resetSemanticPlatform,
  loadSemanticLayer,
} from './semantic-platform';
