/** Enterprise OWL/RDFS-style ontology for AI-Pass semantic layer */

export type OntologyNamespace = 'aipass' | 'gov' | 'fin' | 'health' | 'mfg' | 'def' | 'owl' | 'rdfs';

export interface OntologyClass {
  id: string;
  label: string;
  comment: string;
  parentIds: string[];
  namespace: OntologyNamespace;
  abstract?: boolean;
}

export interface OntologyProperty {
  id: string;
  label: string;
  comment: string;
  domain: string[];
  range: string[];
  type: 'object' | 'datatype';
  functional?: boolean;
  inverseOf?: string;
  transitive?: boolean;
  symmetric?: boolean;
}

export interface OntologyAxiom {
  id: string;
  kind: 'subClassOf' | 'equivalentClass' | 'disjointWith' | 'domain' | 'range' | 'inverseOf' | 'transitive';
  subject: string;
  object: string;
  comment?: string;
}

export interface ShapeConstraint {
  id: string;
  targetClass: string;
  property: string;
  minCount?: number;
  maxCount?: number;
  datatype?: string;
  nodeKind?: 'IRI' | 'Literal';
  severity: 'Violation' | 'Warning';
  message: string;
}

const CLASSES: OntologyClass[] = [
  { id: 'Thing', label: 'Thing', comment: 'Top class', parentIds: [], namespace: 'owl', abstract: true },
  { id: 'Organization', label: 'Organization', comment: 'Legal or operating entity', parentIds: ['Thing'], namespace: 'aipass' },
  { id: 'System', label: 'System', comment: 'Software or platform system', parentIds: ['Thing'], namespace: 'aipass' },
  { id: 'Agent', label: 'Agent', comment: 'Autonomous or assisted AI agent', parentIds: ['System'], namespace: 'aipass' },
  { id: 'Model', label: 'Model', comment: 'Foundation or fine-tuned model', parentIds: ['Thing'], namespace: 'aipass' },
  { id: 'Policy', label: 'Policy', comment: 'Internal governing policy', parentIds: ['Thing'], namespace: 'gov' },
  { id: 'Regulation', label: 'Regulation', comment: 'External regulatory framework', parentIds: ['Thing'], namespace: 'gov' },
  { id: 'Obligation', label: 'Obligation', comment: 'Binding control requirement', parentIds: ['Thing'], namespace: 'gov' },
  { id: 'Control', label: 'Control', comment: 'Implemented safeguard', parentIds: ['Thing'], namespace: 'gov' },
  { id: 'DataAsset', label: 'Data Asset', comment: 'Governed dataset or record', parentIds: ['Thing'], namespace: 'aipass' },
  { id: 'Process', label: 'Process', comment: 'Business or release process', parentIds: ['Thing'], namespace: 'aipass' },
  { id: 'Decision', label: 'Decision', comment: 'Recorded agent or human decision', parentIds: ['Thing'], namespace: 'aipass' },
  { id: 'Product', label: 'Product', comment: 'Manufactured or offered product', parentIds: ['Thing'], namespace: 'mfg' },
  { id: 'Location', label: 'Location', comment: 'Plant, site, or jurisdiction', parentIds: ['Thing'], namespace: 'aipass' },
  { id: 'Person', label: 'Person', comment: 'Human actor', parentIds: ['Thing'], namespace: 'aipass' },
  { id: 'FinancialCase', label: 'Financial Case', comment: 'Claim, transfer, or ledger case', parentIds: ['DataAsset'], namespace: 'fin' },
  { id: 'ClinicalRecord', label: 'Clinical Record', comment: 'Patient encounter or chart fragment', parentIds: ['DataAsset'], namespace: 'health' },
  { id: 'QualityEvent', label: 'Quality Event', comment: 'Sensor or defect event', parentIds: ['DataAsset'], namespace: 'mfg' },
  { id: 'IntelFragment', label: 'Intelligence Fragment', comment: 'Classified intelligence item', parentIds: ['DataAsset'], namespace: 'def' },
  { id: 'BusinessRule', label: 'Business Rule', comment: 'Executable semantic rule', parentIds: ['Thing'], namespace: 'aipass' },
];

const PROPERTIES: OntologyProperty[] = [
  { id: 'operates', label: 'operates', comment: 'Organization operates system', domain: ['Organization'], range: ['System'], type: 'object' },
  { id: 'hosts', label: 'hosts', comment: 'System hosts agent', domain: ['System'], range: ['Agent'], type: 'object' },
  { id: 'routed_by', label: 'routed by', comment: 'Agent is routed by model router', domain: ['Agent'], range: ['Model'], type: 'object' },
  { id: 'may_invoke', label: 'may invoke', comment: 'Router may invoke model', domain: ['Model'], range: ['Model'], type: 'object' },
  { id: 'must_use', label: 'must use', comment: 'Hard model constraint', domain: ['Agent'], range: ['Model'], type: 'object', functional: true },
  { id: 'governed_by', label: 'governed by', comment: 'Subject governed by policy', domain: ['Agent', 'System', 'Organization'], range: ['Policy'], type: 'object' },
  { id: 'implements', label: 'implements', comment: 'Policy implements regulation', domain: ['Policy', 'Control'], range: ['Regulation'], type: 'object' },
  { id: 'constrained_by', label: 'constrained by', comment: 'Direct regulatory constraint', domain: ['Agent', 'Process'], range: ['Regulation'], type: 'object' },
  { id: 'reads', label: 'reads', comment: 'Agent reads data asset', domain: ['Agent'], range: ['DataAsset'], type: 'object' },
  { id: 'writes', label: 'writes', comment: 'Agent writes to control/log', domain: ['Agent'], range: ['Control', 'DataAsset'], type: 'object' },
  { id: 'requires', label: 'requires', comment: 'Regulation/agent requires obligation/control', domain: ['Regulation', 'Agent', 'Process'], range: ['Obligation', 'Control'], type: 'object' },
  { id: 'satisfied_by', label: 'satisfied by', comment: 'Obligation satisfied by component', domain: ['Obligation'], range: ['System', 'Control', 'Process'], type: 'object' },
  { id: 'partially_met_by', label: 'partially met by', comment: 'Obligation only partially met', domain: ['Obligation'], range: ['Process', 'Control'], type: 'object' },
  { id: 'references', label: 'references', comment: 'Asset references another asset', domain: ['DataAsset'], range: ['DataAsset'], type: 'object' },
  { id: 'matched_against', label: 'matched against', comment: 'Case matched to playbook/policy doc', domain: ['DataAsset'], range: ['DataAsset', 'Policy'], type: 'object' },
  { id: 'informed_by', label: 'informed by', comment: 'Clinical/context informed by protocol', domain: ['DataAsset'], range: ['DataAsset'], type: 'object' },
  { id: 'localized_to', label: 'localized to', comment: 'Event localized to BOM/part', domain: ['QualityEvent', 'DataAsset'], range: ['DataAsset', 'Product'], type: 'object' },
  { id: 'part_of', label: 'part of', comment: 'Part of product', domain: ['DataAsset'], range: ['Product'], type: 'object', transitive: true },
  { id: 'assembled_at', label: 'assembled at', comment: 'Product assembled at location', domain: ['Product'], range: ['Location'], type: 'object' },
  { id: 'certified_by', label: 'certified by', comment: 'Agent certified by trust control', domain: ['Agent'], range: ['Control'], type: 'object' },
  { id: 'gates', label: 'gates', comment: 'Control gates process', domain: ['Control'], range: ['Process'], type: 'object' },
  { id: 'evidences', label: 'evidences', comment: 'Control evidences regulation', domain: ['Control'], range: ['Regulation'], type: 'object' },
  { id: 'triggers', label: 'triggers', comment: 'Event/process triggers decision', domain: ['Process', 'DataAsset', 'Agent'], range: ['Decision', 'Agent'], type: 'object' },
  { id: 'hasRiskTier', label: 'has risk tier', comment: 'Risk classification (string)', domain: ['Agent', 'DataAsset', 'Decision'], range: ['xsd:string'], type: 'datatype' },
  { id: 'hasClearance', label: 'has clearance', comment: 'Security clearance level', domain: ['DataAsset', 'Agent', 'Person'], range: ['xsd:string'], type: 'datatype' },
  { id: 'hasConfidence', label: 'has confidence', comment: 'Assertion confidence 0-1', domain: ['Decision', 'DataAsset'], range: ['xsd:decimal'], type: 'datatype' },
];

const AXIOMS: OntologyAxiom[] = [
  { id: 'ax1', kind: 'subClassOf', subject: 'Agent', object: 'System' },
  { id: 'ax2', kind: 'subClassOf', subject: 'FinancialCase', object: 'DataAsset' },
  { id: 'ax3', kind: 'subClassOf', subject: 'ClinicalRecord', object: 'DataAsset' },
  { id: 'ax4', kind: 'subClassOf', subject: 'QualityEvent', object: 'DataAsset' },
  { id: 'ax5', kind: 'subClassOf', subject: 'IntelFragment', object: 'DataAsset' },
  { id: 'ax6', kind: 'disjointWith', subject: 'Policy', object: 'Regulation', comment: 'Internal vs external norms' },
  { id: 'ax7', kind: 'transitive', subject: 'part_of', object: 'part_of' },
];

const SHAPES: ShapeConstraint[] = [
  {
    id: 'sh_agent_policy',
    targetClass: 'Agent',
    property: 'governed_by',
    minCount: 1,
    severity: 'Violation',
    message: 'Every production agent must be governed by at least one policy.',
  },
  {
    id: 'sh_agent_lineage',
    targetClass: 'Agent',
    property: 'writes',
    minCount: 1,
    severity: 'Warning',
    message: 'Agents should write decision lineage for auditability.',
  },
  {
    id: 'sh_high_risk_human',
    targetClass: 'Agent',
    property: 'requires',
    minCount: 1,
    severity: 'Violation',
    message: 'High-risk agents must require a human oversight control.',
  },
  {
    id: 'sh_obligation_map',
    targetClass: 'Obligation',
    property: 'satisfied_by',
    minCount: 1,
    severity: 'Warning',
    message: 'Obligations should map to an implementing component.',
  },
];

export function getOntologyClasses(): OntologyClass[] {
  return CLASSES.map((c) => ({ ...c, parentIds: [...c.parentIds] }));
}

export function getOntologyProperties(): OntologyProperty[] {
  return PROPERTIES.map((p) => ({ ...p, domain: [...p.domain], range: [...p.range] }));
}

export function getOntologyAxioms(): OntologyAxiom[] {
  return AXIOMS.map((a) => ({ ...a }));
}

export function getShapeConstraints(): ShapeConstraint[] {
  return SHAPES.map((s) => ({ ...s }));
}

export function getClassHierarchy(classId: string): string[] {
  const byId = new Map(CLASSES.map((c) => [c.id, c]));
  const chain: string[] = [];
  let cur: string | undefined = classId;
  const seen = new Set<string>();
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    chain.push(cur);
    cur = byId.get(cur)?.parentIds[0];
  }
  return chain;
}

export function isSubClassOf(child: string, parent: string): boolean {
  return getClassHierarchy(child).includes(parent);
}

export function ontologySummary() {
  return {
    classes: CLASSES.length,
    properties: PROPERTIES.length,
    axioms: AXIOMS.length,
    shapes: SHAPES.length,
    namespaces: [...new Set(CLASSES.map((c) => c.namespace))],
  };
}
