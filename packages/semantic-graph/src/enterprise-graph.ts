import type { GraphEdge, GraphNode, Industry } from './types.js';

/** Shared enterprise digital twin used by the interactive demo */
const NODES: GraphNode[] = [
  {
    id: 'org_apex',
    label: 'Apex Holdings',
    kind: 'Organization',
    summary: 'Multi-industry enterprise operating under AI-Pass governance.',
    properties: { region: 'EU/US', employees: 42000 },
  },
  {
    id: 'sys_aipass',
    label: 'AI-Pass OS',
    kind: 'System',
    summary: 'Enterprise AI operating system — routing, governance, trust.',
  },
  {
    id: 'agent_claims',
    label: 'Claims Triage Agent',
    kind: 'Agent',
    industry: 'banking',
    summary: 'Routes insurance/banking claims with policy-aware decisions.',
  },
  {
    id: 'agent_clinical',
    label: 'Clinical Intake Agent',
    kind: 'Agent',
    industry: 'healthcare',
    summary: 'Grounds patient intake answers in governed clinical ontology.',
  },
  {
    id: 'agent_quality',
    label: 'Quality Twin Agent',
    kind: 'Agent',
    industry: 'manufacturing',
    summary: 'Links plant sensors, BOM, and ISO controls for defect explainability.',
  },
  {
    id: 'agent_mission',
    label: 'Mission Brief Agent',
    kind: 'Agent',
    industry: 'defence',
    summary: 'Multi-hop briefing with clearance-aware provenance.',
  },
  {
    id: 'model_router',
    label: 'Governed Router',
    kind: 'Model',
    summary: 'Routes prompts to approved models by risk tier.',
  },
  {
    id: 'model_frontier',
    label: 'Frontier LLM (approved)',
    kind: 'Model',
    summary: 'High-capability model allowed for low-sensitivity hops only.',
  },
  {
    id: 'model_local',
    label: 'On-prem Sovereign Model',
    kind: 'Model',
    summary: 'Air-gapped model for restricted and defence workloads.',
  },
  {
    id: 'pol_ai_gov',
    label: 'AI Governance Policy',
    kind: 'Policy',
    summary: 'Production AI must be inventoried, certified, and auditable.',
  },
  {
    id: 'reg_iso42001',
    label: 'ISO/IEC 42001',
    kind: 'Regulation',
    summary: 'AI management system — risk, impact, monitoring.',
  },
  {
    id: 'reg_soc2',
    label: 'SOC 2 Type II',
    kind: 'Regulation',
    summary: 'Security, availability, confidentiality controls.',
  },
  {
    id: 'reg_gdpr',
    label: 'GDPR Art. 22',
    kind: 'Regulation',
    industry: 'banking',
    summary: 'Automated decision-making with meaningful human oversight.',
  },
  {
    id: 'reg_hipaa',
    label: 'HIPAA Privacy',
    kind: 'Regulation',
    industry: 'healthcare',
    summary: 'PHI minimum necessary and access controls.',
  },
  {
    id: 'reg_mdr',
    label: 'EU MDR',
    kind: 'Regulation',
    industry: 'manufacturing',
    summary: 'Medical device / quality system traceability.',
  },
  {
    id: 'data_claims',
    label: 'Claims Case CLM-88421',
    kind: 'DataAsset',
    industry: 'banking',
    summary: 'Wire dispute: EUR 185k, flagged beneficiary mismatch, KYC flag.',
    properties: { amount: 'EUR 185000', risk: 'high' },
  },
  {
    id: 'data_kyc',
    label: 'KYC Profile — Meridian GmbH',
    kind: 'DataAsset',
    industry: 'banking',
    summary: 'UBO verified 2025-11; sanctioned-list clear; country DE.',
  },
  {
    id: 'data_policy_doc',
    label: 'Wire Fraud Playbook v4',
    kind: 'DataAsset',
    industry: 'banking',
    summary: 'Hold transfers > EUR 50k when beneficiary name ≠ KYC legal name.',
  },
  {
    id: 'data_patient',
    label: 'Patient Encounter PE-22019',
    kind: 'DataAsset',
    industry: 'healthcare',
    summary: 'Allergy: penicillin. Prior MRI lumbar. Consent: research=no.',
  },
  {
    id: 'data_protocol',
    label: 'Pain Pathway Protocol',
    kind: 'DataAsset',
    industry: 'healthcare',
    summary: 'Avoid beta-lactam antibiotics when penicillin allergy asserted.',
  },
  {
    id: 'data_bom',
    label: 'Drive Unit BOM DU-7',
    kind: 'DataAsset',
    industry: 'manufacturing',
    summary: 'Bearing SKF-6205 lot L19 linked to Plant Munich Line 3.',
  },
  {
    id: 'data_sensor',
    label: 'Vibration Event VE-991',
    kind: 'DataAsset',
    industry: 'manufacturing',
    summary: 'Spike 12.4 mm/s at bearing housing — exceeds ISO threshold.',
  },
  {
    id: 'data_intel',
    label: 'SIGINT Fragment SF-17',
    kind: 'DataAsset',
    industry: 'defence',
    summary: 'Corridor activity correlated with convoy schedule C-44.',
    properties: { clearance: 'SECRET' },
  },
  {
    id: 'ctrl_human',
    label: 'Human Oversight Gate',
    kind: 'Control',
    summary: 'Mandatory reviewer before irreversible high-risk actions.',
  },
  {
    id: 'ctrl_lineage',
    label: 'Decision Lineage Log',
    kind: 'Control',
    summary: 'Immutable graph of who/what triggered each hop.',
  },
  {
    id: 'ctrl_cert',
    label: 'Trust Certification',
    kind: 'Control',
    summary: 'Trust Engine badge required for production agents.',
  },
  {
    id: 'obl_inventory',
    label: 'Obligation: AI Inventory',
    kind: 'Obligation',
    summary: 'ISO 42001 — maintain inventory of AI systems and purposes.',
  },
  {
    id: 'obl_impact',
    label: 'Obligation: Impact Assessment',
    kind: 'Obligation',
    summary: 'Document residual risk before production release.',
  },
  {
    id: 'obl_audit',
    label: 'Obligation: Audit Trail',
    kind: 'Obligation',
    summary: 'Retain explainable decision records for regulated actions.',
  },
  {
    id: 'proc_release',
    label: 'Production Release Process',
    kind: 'Process',
    summary: 'Certify → map obligations → human gate → deploy.',
  },
  {
    id: 'loc_munich',
    label: 'Plant Munich',
    kind: 'Location',
    industry: 'manufacturing',
    summary: 'Line 3 assembles Drive Unit DU-7.',
  },
  {
    id: 'prod_du7',
    label: 'Drive Unit DU-7',
    kind: 'Product',
    industry: 'manufacturing',
    summary: 'EV drive unit with digital twin linkage.',
  },
];

const EDGES: GraphEdge[] = [
  { id: 'e1', from: 'org_apex', to: 'sys_aipass', predicate: 'operates', confidence: 0.99 },
  { id: 'e2', from: 'sys_aipass', to: 'agent_claims', predicate: 'hosts', confidence: 0.98 },
  { id: 'e3', from: 'sys_aipass', to: 'agent_clinical', predicate: 'hosts', confidence: 0.98 },
  { id: 'e4', from: 'sys_aipass', to: 'agent_quality', predicate: 'hosts', confidence: 0.98 },
  { id: 'e5', from: 'sys_aipass', to: 'agent_mission', predicate: 'hosts', confidence: 0.98 },
  { id: 'e6', from: 'agent_claims', to: 'model_router', predicate: 'routed_by', confidence: 0.96 },
  { id: 'e7', from: 'model_router', to: 'model_frontier', predicate: 'may_invoke', confidence: 0.9 },
  { id: 'e8', from: 'agent_mission', to: 'model_local', predicate: 'must_use', confidence: 0.99 },
  { id: 'e9', from: 'agent_claims', to: 'pol_ai_gov', predicate: 'governed_by', confidence: 0.97 },
  { id: 'e10', from: 'pol_ai_gov', to: 'reg_iso42001', predicate: 'implements', confidence: 0.95 },
  { id: 'e11', from: 'pol_ai_gov', to: 'reg_soc2', predicate: 'implements', confidence: 0.93 },
  { id: 'e12', from: 'agent_claims', to: 'reg_gdpr', predicate: 'constrained_by', confidence: 0.96 },
  { id: 'e13', from: 'agent_clinical', to: 'reg_hipaa', predicate: 'constrained_by', confidence: 0.97 },
  { id: 'e14', from: 'agent_quality', to: 'reg_mdr', predicate: 'constrained_by', confidence: 0.9 },
  { id: 'e15', from: 'agent_claims', to: 'data_claims', predicate: 'reads', confidence: 0.99 },
  { id: 'e16', from: 'data_claims', to: 'data_kyc', predicate: 'references', confidence: 0.94 },
  { id: 'e17', from: 'data_claims', to: 'data_policy_doc', predicate: 'matched_against', confidence: 0.97 },
  { id: 'e18', from: 'agent_claims', to: 'ctrl_human', predicate: 'requires', confidence: 0.99 },
  { id: 'e19', from: 'agent_claims', to: 'ctrl_lineage', predicate: 'writes', confidence: 0.99 },
  { id: 'e20', from: 'agent_claims', to: 'ctrl_cert', predicate: 'certified_by', confidence: 0.88 },
  { id: 'e21', from: 'reg_iso42001', to: 'obl_inventory', predicate: 'requires', confidence: 0.99 },
  { id: 'e22', from: 'reg_iso42001', to: 'obl_impact', predicate: 'requires', confidence: 0.99 },
  { id: 'e23', from: 'reg_iso42001', to: 'obl_audit', predicate: 'requires', confidence: 0.99 },
  { id: 'e24', from: 'obl_inventory', to: 'sys_aipass', predicate: 'satisfied_by', confidence: 0.95 },
  { id: 'e25', from: 'obl_audit', to: 'ctrl_lineage', predicate: 'satisfied_by', confidence: 0.96 },
  { id: 'e26', from: 'obl_impact', to: 'proc_release', predicate: 'partially_met_by', confidence: 0.7 },
  { id: 'e27', from: 'agent_clinical', to: 'data_patient', predicate: 'reads', confidence: 0.99 },
  { id: 'e28', from: 'data_patient', to: 'data_protocol', predicate: 'informed_by', confidence: 0.93 },
  { id: 'e29', from: 'agent_quality', to: 'data_sensor', predicate: 'reads', confidence: 0.98 },
  { id: 'e30', from: 'data_sensor', to: 'data_bom', predicate: 'localized_to', confidence: 0.92 },
  { id: 'e31', from: 'data_bom', to: 'prod_du7', predicate: 'part_of', confidence: 0.97 },
  { id: 'e32', from: 'prod_du7', to: 'loc_munich', predicate: 'assembled_at', confidence: 0.96 },
  { id: 'e33', from: 'agent_mission', to: 'data_intel', predicate: 'reads', confidence: 0.99 },
  { id: 'e34', from: 'ctrl_cert', to: 'proc_release', predicate: 'gates', confidence: 0.94 },
  { id: 'e35', from: 'ctrl_human', to: 'reg_gdpr', predicate: 'evidences', confidence: 0.91 },
];

export function getEnterpriseGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  return {
    nodes: NODES.map((n) => ({ ...n, properties: n.properties ? { ...n.properties } : undefined })),
    edges: EDGES.map((e) => ({ ...e })),
  };
}

export function nodesForIndustry(industry?: Industry): GraphNode[] {
  const { nodes } = getEnterpriseGraph();
  if (!industry) return nodes;
  return nodes.filter((n) => !n.industry || n.industry === industry || n.kind === 'Organization' || n.kind === 'System' || n.kind === 'Regulation' || n.kind === 'Policy' || n.kind === 'Control' || n.kind === 'Obligation' || n.kind === 'Process' || n.kind === 'Model');
}

export function edgesAmong(nodeIds: Set<string>): GraphEdge[] {
  const { edges } = getEnterpriseGraph();
  return edges.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to));
}
