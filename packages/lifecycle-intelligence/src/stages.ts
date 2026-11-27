/** End-to-end product lifecycle stages (R&D → Aftermarket) */

export type ProductLifecycleStageId =
  | 'concept'
  | 'requirements'
  | 'design'
  | 'simulation'
  | 'pilot'
  | 'series'
  | 'field'
  | 'aftermarket';

export type ProductLifecycleStage = {
  id: ProductLifecycleStageId;
  order: number;
  label: string;
  phase: 'rd' | 'production' | 'aftermarket';
  copy: string;
  ontologyDomains: string[];
  apps: string[];
  typicalSources: string[];
};

export const PRODUCT_LIFECYCLE_STAGES: ProductLifecycleStage[] = [
  {
    id: 'concept',
    order: 1,
    label: 'Concept',
    phase: 'rd',
    copy: 'Capture product intent, variants, and market constraints before design freezes.',
    ontologyDomains: ['requirements'],
    apps: ['requirements', 'studio'],
    typicalSources: ['requirements-mgmt', 'crm', 'excel'],
  },
  {
    id: 'requirements',
    order: 2,
    label: 'Requirements',
    phase: 'rd',
    copy: 'Validate coverage, conflicts, and traceability against prior programs.',
    ontologyDomains: ['requirements', 'quality'],
    apps: ['requirements', 'explorer'],
    typicalSources: ['doors', 'jama', 'polarion', 'codebeamer'],
  },
  {
    id: 'design',
    order: 3,
    label: 'Design',
    phase: 'rd',
    copy: 'Link mechanics, electronics, and software into one product structure.',
    ontologyDomains: ['hardware', 'software', 'supplier'],
    apps: ['explorer', 'studio'],
    typicalSources: ['teamcenter', 'windchill', '3dexperience', 'git'],
  },
  {
    id: 'simulation',
    order: 4,
    label: 'Simulation & test',
    phase: 'rd',
    copy: 'Connect CAE, HIL, and verification results back to requirements and parts.',
    ontologyDomains: ['simulation', 'quality'],
    apps: ['explorer', 'inspector'],
    typicalSources: ['ansys', 'test-management', 'plcopen'],
  },
  {
    id: 'pilot',
    order: 5,
    label: 'Pilot production',
    phase: 'production',
    copy: 'Surface build issues early with process steps, defects, and change sets.',
    ontologyDomains: ['production', 'quality'],
    apps: ['inspector', 'explorer'],
    typicalSources: ['mes', 'qms', 'erp'],
  },
  {
    id: 'series',
    order: 6,
    label: 'Series production',
    phase: 'production',
    copy: 'Keep BOM, process, and supplier truth aligned as volume ramps.',
    ontologyDomains: ['production', 'supplier', 'hardware'],
    apps: ['explorer', 'inspector', 'studio'],
    typicalSources: ['sap', 'mes', 'teamcenter'],
  },
  {
    id: 'field',
    order: 7,
    label: 'Field & warranty',
    phase: 'aftermarket',
    copy: 'Trace tickets and returns to the exact component, software, and requirement.',
    ontologyDomains: ['service', 'quality'],
    apps: ['tickets', 'inspector'],
    typicalSources: ['servicenow', 'salesforce', 'warranty'],
  },
  {
    id: 'aftermarket',
    order: 8,
    label: 'Aftermarket & service',
    phase: 'aftermarket',
    copy: 'Feed lessons learned back into the next concept and requirements cycle.',
    ontologyDomains: ['service', 'requirements'],
    apps: ['tickets', 'requirements', 'studio'],
    typicalSources: ['dealer-systems', 'iot', 'ticket-systems'],
  },
];

export const LIFECYCLE_SOLUTIONS = [
  {
    id: 'requirements-manager',
    name: 'Requirements Manager',
    stages: ['concept', 'requirements', 'aftermarket'] as ProductLifecycleStageId[],
    copy: 'Catch gaps and conflicts before they hit design — against years of linked data.',
  },
  {
    id: 'product-explorer',
    name: 'Product Explorer',
    stages: ['design', 'simulation', 'pilot', 'series'] as ProductLifecycleStageId[],
    copy: 'Ask natural-language questions across parts, tests, suppliers, and serial units.',
  },
  {
    id: 'error-inspector',
    name: 'Error Inspector',
    stages: ['simulation', 'pilot', 'series', 'field'] as ProductLifecycleStageId[],
    copy: 'Trace defects and warranty tickets to components and requirements in minutes.',
  },
  {
    id: 'ticket-analyzer',
    name: 'Ticket Analyzer',
    stages: ['field', 'aftermarket'] as ProductLifecycleStageId[],
    copy: 'Summarize service tickets, propose fixes, and link them into the product twin.',
  },
  {
    id: 'studio',
    name: 'Build Your Own Solution',
    stages: ['concept', 'design', 'series', 'aftermarket'] as ProductLifecycleStageId[],
    copy: 'Configure ontologies, widgets, and agents on the same product knowledge graph.',
  },
] as const;
