import { edgesAmong, getEnterpriseGraph, nodesForIndustry } from './enterprise-graph.js';
import type { GraphRagAnswer, Industry, ProvenanceHop } from './types.js';

interface ScenarioAnswer {
  match: RegExp;
  industry?: Industry;
  seedIds: string[];
  answer: string;
  excerpts: Record<string, string>;
}

const SCENARIOS: ScenarioAnswer[] = [
  {
    match: /wire|transfer|claim|fraud|hold|beneficiary|kyc/i,
    industry: 'banking',
    seedIds: ['data_claims', 'data_kyc', 'data_policy_doc', 'agent_claims', 'ctrl_human', 'reg_gdpr'],
    answer:
      'Hold the EUR 185k wire on CLM-88421. The beneficiary name does not match Meridian GmbH’s KYC legal name, which triggers Wire Fraud Playbook v4 (§ hold > EUR 50k on mismatch). GDPR Art. 22 requires the Human Oversight Gate before any irreversible deny/release — Claims Triage Agent has prepared the decision but cannot auto-execute.',
    excerpts: {
      data_claims: 'Wire dispute: EUR 185k, beneficiary mismatch, KYC flag.',
      data_kyc: 'UBO verified; legal name Meridian GmbH; sanctioned-list clear.',
      data_policy_doc: 'Hold transfers > EUR 50k when beneficiary ≠ KYC legal name.',
      ctrl_human: 'Mandatory reviewer before irreversible high-risk actions.',
      reg_gdpr: 'Automated decisions need meaningful human oversight.',
    },
  },
  {
    match: /penicillin|allergy|patient|clinical|prescribe|antibiotic/i,
    industry: 'healthcare',
    seedIds: ['data_patient', 'data_protocol', 'agent_clinical', 'reg_hipaa'],
    answer:
      'Do not suggest beta-lactam antibiotics for encounter PE-22019. The patient graph asserts a penicillin allergy, and Pain Pathway Protocol explicitly avoids that class. Clinical Intake Agent answers only from these governed nodes — not from generic model memory — and HIPAA minimum-necessary keeps the research-consent flag out of the clinician reply.',
    excerpts: {
      data_patient: 'Allergy: penicillin. Consent: research=no.',
      data_protocol: 'Avoid beta-lactam antibiotics when penicillin allergy asserted.',
      reg_hipaa: 'PHI minimum necessary and access controls.',
    },
  },
  {
    match: /vibration|bearing|defect|plant|munich|drive unit|quality/i,
    industry: 'manufacturing',
    seedIds: ['data_sensor', 'data_bom', 'prod_du7', 'loc_munich', 'agent_quality', 'reg_mdr'],
    answer:
      'Vibration Event VE-991 (12.4 mm/s) localizes to bearing SKF-6205 lot L19 on Drive Unit DU-7 at Plant Munich Line 3. Quality Twin Agent multi-hop links sensor → BOM → product → plant, giving an explainable root-cause path for MDR traceability instead of a black-box “anomaly” label.',
    excerpts: {
      data_sensor: 'Spike 12.4 mm/s at bearing housing — exceeds ISO threshold.',
      data_bom: 'Bearing SKF-6205 lot L19 linked to Plant Munich Line 3.',
      prod_du7: 'EV drive unit with digital twin linkage.',
      loc_munich: 'Line 3 assembles Drive Unit DU-7.',
    },
  },
  {
    match: /mission|convoy|sigint|clearance|defence|defense|brief/i,
    industry: 'defence',
    seedIds: ['data_intel', 'agent_mission', 'model_local', 'ctrl_lineage'],
    answer:
      'Mission Brief Agent correlates SIGINT Fragment SF-17 with convoy schedule C-44, but only via the on-prem Sovereign Model (clearance SECRET). Provenance is written to the Decision Lineage Log — no frontier cloud model is in the path.',
    excerpts: {
      data_intel: 'Corridor activity correlated with convoy schedule C-44.',
      model_local: 'Air-gapped model for restricted and defence workloads.',
      ctrl_lineage: 'Immutable graph of who/what triggered each hop.',
    },
  },
  {
    match: /iso\s*42001|compliance gap|audit evidence|soc\s*2|deploy|production/i,
    seedIds: ['reg_iso42001', 'obl_inventory', 'obl_impact', 'obl_audit', 'sys_aipass', 'ctrl_lineage', 'proc_release', 'ctrl_cert'],
    answer:
      'ISO/IEC 42001 inventory and audit-trail obligations are satisfied by AI-Pass OS + Decision Lineage Log. Impact assessment is only partially mapped to the Production Release Process — that is the live compliance gap before certifying new agents. Trust Certification still gates production deploy.',
    excerpts: {
      obl_inventory: 'Maintain inventory of AI systems and purposes.',
      obl_audit: 'Retain explainable decision records for regulated actions.',
      obl_impact: 'Document residual risk before production release.',
      ctrl_cert: 'Trust Engine badge required for production agents.',
    },
  },
];

function buildHops(seedIds: string[]): ProvenanceHop[] {
  const { nodes, edges } = getEnterpriseGraph();
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const hops: ProvenanceHop[] = [];
  const seen = new Set<string>();

  for (const id of seedIds) {
    const node = byId.get(id);
    if (!node || seen.has(id)) continue;
    seen.add(id);
    const inbound = edges.find((e) => e.to === id && seedIds.includes(e.from));
    hops.push({
      nodeId: id,
      label: node.label,
      kind: node.kind,
      via: inbound?.predicate,
    });
  }
  return hops;
}

function pathLabels(seedIds: string[]): string[] {
  const { nodes, edges } = getEnterpriseGraph();
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const labels: string[] = [];
  for (let i = 0; i < seedIds.length - 1; i++) {
    const a = seedIds[i]!;
    const b = seedIds[i + 1]!;
    const edge = edges.find(
      (e) => (e.from === a && e.to === b) || (e.from === b && e.to === a),
    );
    const left = byId.get(a)?.label ?? a;
    const right = byId.get(b)?.label ?? b;
    if (edge) labels.push(`${left} —${edge.predicate}→ ${right}`);
    else labels.push(`${left} → ${right}`);
  }
  return labels;
}

/** Graph RAG: answer from connected enterprise records with provenance */
export function graphRagQuery(question: string, industry?: Industry): GraphRagAnswer {
  const scenario =
    SCENARIOS.find((s) => s.match.test(question) && (!industry || !s.industry || s.industry === industry)) ??
    SCENARIOS.find((s) => s.match.test(question)) ??
    SCENARIOS[SCENARIOS.length - 1]!;

  const hops = buildHops(scenario.seedIds);
  const evidence = scenario.seedIds
    .filter((id) => scenario.excerpts[id])
    .map((id) => ({
      nodeId: id,
      label: hops.find((h) => h.nodeId === id)?.label ?? id,
      excerpt: scenario.excerpts[id]!,
    }));

  const conf = 0.86 + Math.min(0.12, evidence.length * 0.02);

  return {
    question,
    answer: scenario.answer,
    confidence: Number(conf.toFixed(2)),
    hops,
    evidence,
    pathLabels: pathLabels(scenario.seedIds),
  };
}

export function subgraphForAnswer(answer: GraphRagAnswer, industry?: Industry) {
  const ids = new Set(answer.hops.map((h) => h.nodeId));
  // Include org + OS for visual context
  ids.add('org_apex');
  ids.add('sys_aipass');
  const nodes = nodesForIndustry(industry).filter((n) => ids.has(n.id));
  const edges = edgesAmong(ids);
  return { nodes, edges };
}
