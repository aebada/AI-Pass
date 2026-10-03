import data from './hopn-lab.json';

export type LabStatus = 'planned' | 'in_progress' | 'done';

export type LabProgram = (typeof data.programs)[number];
export type LabProject = (typeof data.projects)[number];

export const LAB_CONTACT_MAILTO =
  'mailto:contact@ehopn.com?subject=HOPN%20Lab%20%2F%20research%20collaboration';
export const LAB_DEMO_MAILTO =
  'mailto:contact@ehopn.com?subject=HOPN%20Lab%20interactive%20demo';
export const LAB_EMAIL = 'contact@ehopn.com';

export const PROGRAM_ORDER = ['route', 'ground', 'assure', 'foundation', 'physical'] as const;

export function getLab() {
  return data.lab;
}

export function getWhy() {
  return data.why;
}

export function showGovernance(): boolean {
  return data.showGovernance === true || process.env.NEXT_PUBLIC_RESEARCH_SHOW_GOVERNANCE === '1';
}

export function getPrograms(): LabProgram[] {
  return data.programs;
}

export function getProgram(id: string): LabProgram | undefined {
  return data.programs.find((p) => p.id === id);
}

export function publicProjects(): LabProject[] {
  return data.projects.filter((p) => p.public !== false);
}

export function getRoadmap() {
  return data.roadmap;
}

export function getStageGates() {
  return data.stage_gates;
}

export function getPipelineCounts() {
  return data.pipeline_counts;
}

export function getTestbedLadder() {
  return data.testbed_ladder;
}

export function getMetrics(programId: string) {
  const metrics = data.metrics as Record<string, { name: string; definition: string }[]>;
  return metrics[programId] ?? [];
}

export function getResults() {
  return data.results;
}

export function getPhysicalStack() {
  return data.physicalStack;
}

export function getRisks() {
  return data.risks;
}

export function getEvidencePrinciples() {
  return data.evidencePrinciples;
}

export function getArtifacts() {
  return data.artifacts;
}

export function statusLabel(status: string): string {
  if (status === 'in_progress') return 'In progress';
  if (status === 'done') return 'Complete';
  return 'Planned';
}

export function adjacentProgram(id: string): { prev?: LabProgram; next?: LabProgram } {
  const i = PROGRAM_ORDER.indexOf(id as (typeof PROGRAM_ORDER)[number]);
  if (i < 0) return {};
  return {
    prev: i > 0 ? getProgram(PROGRAM_ORDER[i - 1]!) : undefined,
    next: i < PROGRAM_ORDER.length - 1 ? getProgram(PROGRAM_ORDER[i + 1]!) : undefined,
  };
}

export const RESEARCH_NAV = [
  { href: '/research', label: 'Overview' },
  { href: '/research/route', label: 'Route' },
  { href: '/research/ground', label: 'Ground' },
  { href: '/research/assure', label: 'Assure' },
  { href: '/research/foundation', label: 'Foundation' },
  { href: '/research/physical', label: 'Physical' },
  { href: '/research/roadmap', label: 'Roadmap' },
  { href: '/research/evidence', label: 'Evidence' },
] as const;

/** Top-menu Research dropdown: programs plus lab pages, demo, and contact. */
export function researchMenuItems(): { href: string; label: string; description: string }[] {
  const programItems = PROGRAM_ORDER.map((id) => {
    const program = getProgram(id);
    return {
      href: `/research/${id}`,
      label: program?.name ?? id,
      description: program?.direction ?? '',
    };
  });

  return [
    { href: '/research', label: 'HOPN Lab overview', description: 'Thesis, diagrams, and walkthrough' },
    ...programItems,
    { href: '/research/roadmap', label: 'Roadmap', description: 'Twelve-month plan and stage gates' },
    { href: '/research/evidence', label: 'Evidence', description: 'How the lab publishes' },
    { href: '/demo', label: 'Interactive demo', description: 'Graph RAG with provenance' },
    { href: LAB_CONTACT_MAILTO, label: 'Contact the lab', description: `Email ${LAB_EMAIL}` },
  ];
}
