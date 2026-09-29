/** Semantic Graph — enterprise ontology, Graph RAG, compliance, lineage */

export type Industry =
  | 'banking'
  | 'healthcare'
  | 'manufacturing'
  | 'defence'
  | 'logistics'
  | 'energy'
  | 'government'
  | 'retail';

export type EntityKind =
  | 'Organization'
  | 'System'
  | 'Agent'
  | 'Model'
  | 'Policy'
  | 'Regulation'
  | 'DataAsset'
  | 'Process'
  | 'Person'
  | 'Location'
  | 'Product'
  | 'Control'
  | 'Obligation'
  | 'Decision';

export interface GraphNode {
  id: string;
  label: string;
  kind: EntityKind;
  industry?: Industry;
  summary: string;
  properties?: Record<string, string | number | boolean>;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  predicate: string;
  confidence: number;
}

export interface ProvenanceHop {
  nodeId: string;
  label: string;
  kind: EntityKind;
  via?: string;
}

export interface GraphRagAnswer {
  question: string;
  answer: string;
  confidence: number;
  hops: ProvenanceHop[];
  evidence: { nodeId: string; label: string; excerpt: string }[];
  pathLabels: string[];
}

export interface ComplianceGap {
  obligationId: string;
  obligation: string;
  framework: string;
  mappedTo: string[];
  status: 'covered' | 'partial' | 'gap';
  evidence?: string;
  remediation?: string;
}

export interface DecisionStep {
  id: string;
  at: string;
  actor: string;
  action: string;
  touched: string[];
  outcome: string;
}

export interface DecisionLineage {
  id: string;
  title: string;
  industry: Industry;
  steps: DecisionStep[];
  summary: string;
}

export interface DemoScenario {
  id: string;
  industry: Industry;
  title: string;
  blurb: string;
  question: string;
}
