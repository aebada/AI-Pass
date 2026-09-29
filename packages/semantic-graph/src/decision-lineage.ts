import type { DecisionLineage, Industry } from './types.js';

const LINEAGES: DecisionLineage[] = [
  {
    id: 'lin_wire',
    title: 'Wire hold CLM-88421',
    industry: 'banking',
    summary: 'Full decision chain from ingestion to human gate — not just “which model ran”.',
    steps: [
      {
        id: 's1',
        at: '2026-09-28T09:14:02Z',
        actor: 'LiveSync · payments.wire.flagged',
        action: 'Triggered Claims Triage Agent',
        touched: ['Claims Case CLM-88421'],
        outcome: 'Agent session opened',
      },
      {
        id: 's2',
        at: '2026-09-28T09:14:03Z',
        actor: 'Claims Triage Agent',
        action: 'Graph RAG over KYC + playbook',
        touched: ['KYC Profile — Meridian GmbH', 'Wire Fraud Playbook v4'],
        outcome: 'Mismatch rule matched (confidence 0.97)',
      },
      {
        id: 's3',
        at: '2026-09-28T09:14:04Z',
        actor: 'Governed Router',
        action: 'Selected Frontier LLM for draft rationale only',
        touched: ['Frontier LLM (approved)', 'AI Governance Policy'],
        outcome: 'Rationale draft; no auto-execute',
      },
      {
        id: 's4',
        at: '2026-09-28T09:14:05Z',
        actor: 'Human Oversight Gate',
        action: 'Queued reviewer decision',
        touched: ['GDPR Art. 22', 'Decision Lineage Log'],
        outcome: 'Pending human approve/deny',
      },
    ],
  },
  {
    id: 'lin_quality',
    title: 'Defect localization VE-991',
    industry: 'manufacturing',
    summary: 'Sensor event to BOM lot to plant — digital-twin style multi-hop.',
    steps: [
      {
        id: 's1',
        at: '2026-09-28T11:02:11Z',
        actor: 'Plant Munich telemetry',
        action: 'Emitted vibration spike',
        touched: ['Vibration Event VE-991'],
        outcome: 'Threshold breach',
      },
      {
        id: 's2',
        at: '2026-09-28T11:02:12Z',
        actor: 'Quality Twin Agent',
        action: 'Traversed sensor → BOM → product → plant',
        touched: ['Drive Unit BOM DU-7', 'Drive Unit DU-7', 'Plant Munich'],
        outcome: 'Lot L19 implicated',
      },
      {
        id: 's3',
        at: '2026-09-28T11:02:13Z',
        actor: 'Decision Lineage Log',
        action: 'Persisted explainability path',
        touched: ['EU MDR', 'Trust Certification'],
        outcome: 'Audit evidence packaged',
      },
    ],
  },
  {
    id: 'lin_clinical',
    title: 'Allergy-safe recommendation',
    industry: 'healthcare',
    summary: 'Answer grounded in patient + protocol nodes, not model memorization.',
    steps: [
      {
        id: 's1',
        at: '2026-09-28T08:40:00Z',
        actor: 'Clinician workspace',
        action: 'Asked for antibiotic options',
        touched: ['Patient Encounter PE-22019'],
        outcome: 'Query accepted under HIPAA filter',
      },
      {
        id: 's2',
        at: '2026-09-28T08:40:01Z',
        actor: 'Clinical Intake Agent',
        action: 'Graph RAG: patient ↔ protocol',
        touched: ['Pain Pathway Protocol'],
        outcome: 'Beta-lactams excluded',
      },
      {
        id: 's3',
        at: '2026-09-28T08:40:02Z',
        actor: 'Decision Lineage Log',
        action: 'Recorded provenance hops',
        touched: ['HIPAA Privacy'],
        outcome: 'Explainable denial of unsafe suggestion',
      },
    ],
  },
  {
    id: 'lin_mission',
    title: 'SECRET briefing path',
    industry: 'defence',
    summary: 'Clearance-aware routing — sovereign model only.',
    steps: [
      {
        id: 's1',
        at: '2026-09-28T06:15:44Z',
        actor: 'Analyst console',
        action: 'Requested corridor brief',
        touched: ['SIGINT Fragment SF-17'],
        outcome: 'Clearance SECRET verified',
      },
      {
        id: 's2',
        at: '2026-09-28T06:15:45Z',
        actor: 'Mission Brief Agent',
        action: 'Forced on-prem Sovereign Model',
        touched: ['On-prem Sovereign Model'],
        outcome: 'Frontier LLM blocked by policy',
      },
      {
        id: 's3',
        at: '2026-09-28T06:15:46Z',
        actor: 'Decision Lineage Log',
        action: 'Wrote model + data hops',
        touched: ['Decision Lineage Log'],
        outcome: 'Defence-grade audit trail',
      },
    ],
  },
];

export function getLineages(industry?: Industry): DecisionLineage[] {
  if (!industry) return LINEAGES;
  return LINEAGES.filter((l) => l.industry === industry);
}

export function getLineage(id: string): DecisionLineage | undefined {
  return LINEAGES.find((l) => l.id === id);
}
