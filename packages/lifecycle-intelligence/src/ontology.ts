import { createId } from '@ai-pass/shared';
import type { OntologyEntityType, OntologyRelationType, ProductOntology } from './types.js';

/** Default Engineering Intelligence Network-style product ontology */
export function createDefaultProductOntology(name = 'AI-Pass Product Ontology'): ProductOntology {
  const entities: OntologyEntityType[] = [
    {
      id: 'Requirement',
      label: 'Requirement',
      domain: 'requirements',
      definition: 'Product intent or constraint from stakeholders.',
      attributes: [
        { id: 'reqId', label: 'Requirement ID', dataType: 'string' },
        { id: 'text', label: 'Text', dataType: 'string' },
        { id: 'priority', label: 'Priority', dataType: 'string' },
      ],
    },
    {
      id: 'TestCase',
      label: 'Test case',
      domain: 'quality',
      definition: 'Verification or validation procedure.',
      attributes: [
        { id: 'testId', label: 'Test ID', dataType: 'string' },
        { id: 'result', label: 'Last result', dataType: 'string' },
      ],
    },
    {
      id: 'Part',
      label: 'Part / component',
      domain: 'hardware',
      definition: 'Hardware part, assembly, or BOM item.',
      attributes: [
        { id: 'partNumber', label: 'Part number', dataType: 'string' },
        { id: 'revision', label: 'Revision', dataType: 'string' },
      ],
    },
    {
      id: 'SoftwareModule',
      label: 'Software module',
      domain: 'software',
      definition: 'Software unit, ECU software, or release.',
      attributes: [
        { id: 'swId', label: 'Software ID', dataType: 'string' },
        { id: 'version', label: 'Version', dataType: 'string' },
      ],
    },
    {
      id: 'ECU',
      label: 'ECU / controller',
      domain: 'hardware',
      definition: 'Electronic control unit or controller instance.',
      attributes: [
        { id: 'ecuId', label: 'ECU ID', dataType: 'string' },
        { id: 'hwRev', label: 'Hardware rev', dataType: 'string' },
      ],
    },
    {
      id: 'Variant',
      label: 'Product variant',
      domain: 'hardware',
      definition: 'Configuration or variant of the product.',
      attributes: [{ id: 'variantCode', label: 'Variant code', dataType: 'string' }],
    },
    {
      id: 'VIN',
      label: 'Vehicle / serial instance',
      domain: 'production',
      definition: 'Serialized product instance (e.g. VIN).',
      attributes: [{ id: 'vin', label: 'VIN / serial', dataType: 'string' }],
    },
    {
      id: 'ProcessStep',
      label: 'Process step',
      domain: 'production',
      definition: 'Manufacturing or assembly step.',
      attributes: [{ id: 'station', label: 'Station', dataType: 'string' }],
    },
    {
      id: 'Defect',
      label: 'Defect / issue',
      domain: 'quality',
      definition: 'Quality finding, failed test, or field issue.',
      attributes: [
        { id: 'code', label: 'Defect code', dataType: 'string' },
        { id: 'severity', label: 'Severity', dataType: 'string' },
      ],
    },
    {
      id: 'Ticket',
      label: 'Field / warranty ticket',
      domain: 'service',
      definition: 'Aftermarket or warranty ticket.',
      attributes: [{ id: 'ticketId', label: 'Ticket ID', dataType: 'string' }],
    },
    {
      id: 'Supplier',
      label: 'Supplier',
      domain: 'supplier',
      definition: 'Part or software supplier.',
      attributes: [{ id: 'supplierCode', label: 'Supplier code', dataType: 'string' }],
    },
    {
      id: 'SimulationRun',
      label: 'Simulation run',
      domain: 'simulation',
      definition: 'CAE/simulation result linked to design.',
      attributes: [{ id: 'runId', label: 'Run ID', dataType: 'string' }],
    },
  ];

  const relations: OntologyRelationType[] = [
    {
      id: 'satisfies',
      label: 'satisfies',
      domain: 'Part|SoftwareModule|ECU',
      range: 'Requirement',
      definition: 'Design element addresses a requirement.',
    },
    {
      id: 'verifiedBy',
      label: 'verified by',
      domain: 'Requirement',
      range: 'TestCase',
      definition: 'Requirement covered by a test.',
    },
    {
      id: 'consistsOf',
      label: 'consists of',
      domain: 'Part|Variant',
      range: 'Part|ECU|SoftwareModule',
      definition: 'BOM / structure relationship.',
    },
    {
      id: 'runsOn',
      label: 'runs on',
      domain: 'SoftwareModule',
      range: 'ECU',
      definition: 'Software deployed on hardware.',
    },
    {
      id: 'instanceOf',
      label: 'instance of',
      domain: 'VIN',
      range: 'Variant|Part',
      definition: 'Serialized unit of a configuration.',
    },
    {
      id: 'producedAt',
      label: 'produced at',
      domain: 'VIN|Part',
      range: 'ProcessStep',
      definition: 'Manufacturing touchpoint.',
    },
    {
      id: 'causedBy',
      label: 'caused by',
      domain: 'Defect|Ticket',
      range: 'Part|SoftwareModule|Requirement|ECU',
      definition: 'Root-cause link.',
    },
    {
      id: 'reportedIn',
      label: 'reported in',
      domain: 'Defect',
      range: 'Ticket|TestCase',
      definition: 'Where the defect surfaced.',
    },
    {
      id: 'suppliedBy',
      label: 'supplied by',
      domain: 'Part|SoftwareModule',
      range: 'Supplier',
      definition: 'Supplier ownership.',
    },
    {
      id: 'simulatedBy',
      label: 'simulated by',
      domain: 'Part|ECU',
      range: 'SimulationRun',
      definition: 'Simulation evidence for design.',
    },
  ];

  return {
    id: `onto_${createId()}`,
    name,
    version: '1.0.0',
    entities,
    relations,
    updatedAt: new Date().toISOString(),
  };
}

export const LIFECYCLE_PLATFORM_FEATURES = [
  {
    id: 'product_ontology',
    name: 'Product ontology',
    copy: 'One schema across requirements, software, hardware, production, and service — no drift between teams.',
  },
  {
    id: 'knowledge_graph',
    name: 'Engineering knowledge graph',
    copy: 'Queryable product truth with versions, variants, and full provenance to source systems.',
  },
  {
    id: 'agentic_mapping',
    name: 'Agentic data mapping',
    copy: 'Deterministic rules first, AI-assisted matching, engineer confirmation — 100% provenance.',
  },
  {
    id: 'ingest_pipeline',
    name: 'Ingest → map → resolve → serve',
    copy: 'Connect PLM/CAD/ERP/test sources, resolve into a dataset, serve via API and MCP.',
  },
  {
    id: 'requirements_manager',
    name: 'Requirements Manager',
    copy: 'Read requirements against years of design data; flag gaps and conflicts early.',
  },
  {
    id: 'product_explorer',
    name: 'Product Explorer',
    copy: 'Natural-language questions across parts, requirements, tests, and suppliers with evidence paths.',
  },
  {
    id: 'error_inspector',
    name: 'Error Inspector',
    copy: 'Trace defects and field tickets to components and requirements in minutes.',
  },
  {
    id: 'ai_studio',
    name: 'AI Studio',
    copy: 'Configure ontologies, agents, and no-code apps grounded in product twins.',
  },
] as const;
