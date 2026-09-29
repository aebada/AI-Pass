import { complianceSummary, getComplianceGaps } from './compliance-ontology.js';
import { getLineages } from './decision-lineage.js';
import { edgesAmong, getEnterpriseGraph, nodesForIndustry } from './enterprise-graph.js';
import { graphRagQuery, subgraphForAnswer } from './graph-rag.js';
import type { DemoScenario, GraphRagAnswer, Industry } from './types.js';

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'banking-wire',
    industry: 'banking',
    title: 'Banking · Wire fraud hold',
    blurb: 'Multi-hop KYC + playbook + human gate — Graph RAG with provenance.',
    question: 'Should we hold the EUR 185k wire on claim CLM-88421?',
  },
  {
    id: 'health-allergy',
    industry: 'healthcare',
    title: 'Healthcare · Allergy-safe answer',
    blurb: 'Semantically grounded clinical reply — not a hallucinated formulary.',
    question: 'What antibiotics are safe for patient encounter PE-22019?',
  },
  {
    id: 'mfg-defect',
    industry: 'manufacturing',
    title: 'Manufacturing · Digital twin defect',
    blurb: 'Sensor → BOM → product → plant path for explainable quality.',
    question: 'Where does vibration event VE-991 localize in the drive unit?',
  },
  {
    id: 'defence-brief',
    industry: 'defence',
    title: 'Defence · Clearance-aware brief',
    blurb: 'Sovereign model only; full decision lineage for SECRET data.',
    question: 'Brief the corridor activity linked to convoy C-44.',
  },
  {
    id: 'compliance-iso',
    industry: 'government',
    title: 'Compliance · ISO 42001 gaps',
    blurb: 'Ontology maps obligations to components and surfaces gaps.',
    question: 'Where are we non-compliant with ISO 42001 before production deploy?',
  },
];

export const INDUSTRY_LABELS: Record<Industry, string> = {
  banking: 'Banking',
  healthcare: 'Healthcare',
  manufacturing: 'Manufacturing',
  defence: 'Defence',
  logistics: 'Logistics',
  energy: 'Energy',
  government: 'Government',
  retail: 'Retail',
};

export interface DemoSnapshot {
  scenario: DemoScenario;
  answer: GraphRagAnswer;
  graph: ReturnType<typeof subgraphForAnswer>;
  fullGraphStats: { nodes: number; edges: number };
  industryNodes: number;
  compliance: ReturnType<typeof complianceSummary>;
  gaps: ReturnType<typeof getComplianceGaps>;
  lineage: ReturnType<typeof getLineages>[number] | null;
}

/** One-call demo runner for UI — pick a scenario (or custom question) */
export function runSemanticDemo(options: {
  scenarioId?: string;
  question?: string;
  industry?: Industry;
} = {}): DemoSnapshot {
  const scenario =
    DEMO_SCENARIOS.find((s) => s.id === options.scenarioId) ??
    DEMO_SCENARIOS.find((s) => s.industry === options.industry) ??
    DEMO_SCENARIOS[0]!;

  const question = options.question?.trim() || scenario.question;
  const industry = options.industry ?? scenario.industry;
  const answer = graphRagQuery(question, industry);
  const graph = subgraphForAnswer(answer, industry);
  const full = getEnterpriseGraph();
  const lineages = getLineages(industry === 'government' ? undefined : industry);

  return {
    scenario,
    answer,
    graph,
    fullGraphStats: { nodes: full.nodes.length, edges: full.edges.length },
    industryNodes: nodesForIndustry(industry).length,
    compliance: complianceSummary(),
    gaps: getComplianceGaps(),
    lineage: lineages[0] ?? null,
  };
}

export function listGraphOverview(industry?: Industry) {
  const nodes = nodesForIndustry(industry);
  const ids = new Set(nodes.map((n) => n.id));
  return { nodes, edges: edgesAmong(ids) };
}
