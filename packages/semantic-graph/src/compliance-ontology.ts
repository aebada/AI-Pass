import type { ComplianceGap } from './types.js';

/** Ontology-driven compliance mapping — obligations → platform components */
export function getComplianceGaps(): ComplianceGap[] {
  return [
    {
      obligationId: 'obl_inventory',
      obligation: 'Maintain inventory of AI systems and purposes',
      framework: 'ISO/IEC 42001',
      mappedTo: ['AI-Pass OS', 'AI Governance inventory'],
      status: 'covered',
      evidence: 'sys_aipass satisfies obl_inventory via governed agent registry.',
    },
    {
      obligationId: 'obl_audit',
      obligation: 'Retain explainable decision records',
      framework: 'ISO/IEC 42001 · SOC 2',
      mappedTo: ['Decision Lineage Log', 'Trust Engine runs'],
      status: 'covered',
      evidence: 'ctrl_lineage writes immutable hops for every regulated action.',
    },
    {
      obligationId: 'obl_impact',
      obligation: 'Document residual risk before production release',
      framework: 'ISO/IEC 42001',
      mappedTo: ['Production Release Process'],
      status: 'partial',
      evidence: 'Process exists; impact worksheet not auto-generated for new agents.',
      remediation: 'Attach ontology impact template to Trust Certification gate.',
    },
    {
      obligationId: 'obl_gdpr22',
      obligation: 'Meaningful human oversight for automated decisions',
      framework: 'GDPR Art. 22',
      mappedTo: ['Human Oversight Gate', 'Claims Triage Agent'],
      status: 'covered',
      evidence: 'High-risk wire holds require reviewer before release/deny.',
    },
    {
      obligationId: 'obl_hipaa',
      obligation: 'Minimum necessary PHI in agent context',
      framework: 'HIPAA',
      mappedTo: ['Clinical Intake Agent', 'Graph RAG filters'],
      status: 'covered',
      evidence: 'Research-consent flag excluded from clinician-facing answers.',
    },
    {
      obligationId: 'obl_mdr_trace',
      obligation: 'Device / lot traceability for quality events',
      framework: 'EU MDR',
      mappedTo: ['Quality Twin Agent', 'BOM ↔ sensor graph'],
      status: 'covered',
      evidence: 'VE-991 → SKF-6205 L19 → DU-7 → Plant Munich path is queryable.',
    },
    {
      obligationId: 'obl_model_card',
      obligation: 'Publish model cards for approved models',
      framework: 'SOC 2 · Internal AI Policy',
      mappedTo: ['Governed Router'],
      status: 'gap',
      evidence: 'Router inventories models; machine-readable cards missing for Frontier LLM.',
      remediation: 'Generate model-card nodes linked from each Model entity.',
    },
  ];
}

export function complianceSummary() {
  const gaps = getComplianceGaps();
  return {
    covered: gaps.filter((g) => g.status === 'covered').length,
    partial: gaps.filter((g) => g.status === 'partial').length,
    gap: gaps.filter((g) => g.status === 'gap').length,
    frameworks: [...new Set(gaps.map((g) => g.framework.split('·')[0]!.trim()))],
  };
}
