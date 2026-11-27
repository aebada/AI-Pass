export type {
  ChangeSet,
  DataMapping,
  Dataset,
  ErrorRootCause,
  GraphEdge,
  GraphNode,
  LifecycleDomain,
  LifecyclePipelineStage,
  LifecycleStageSnapshot,
  MappingRule,
  OntologyEntityType,
  OntologyRelationType,
  ProductOntology,
  ProvenanceRef,
  RequirementIssue,
  StudioApp,
  TicketAnalysis,
  TraceAnswer,
} from './types.js';

export type { ProductLifecycleStage, ProductLifecycleStageId } from './stages.js';
export {
  LIFECYCLE_SOLUTIONS,
  PRODUCT_LIFECYCLE_STAGES,
} from './stages.js';

export { createDefaultProductOntology, LIFECYCLE_PLATFORM_FEATURES } from './ontology.js';
export {
  LifecycleIntelligenceService,
  getLifecycleIntelligenceService,
} from './service.js';

export const LIFECYCLE_PIPELINE = [
  {
    id: 'ingest' as const,
    label: 'Ingest',
    copy: 'Connect PLM, CAD, ERP, test, and warehouse sources — no migration required.',
  },
  {
    id: 'map_trace' as const,
    label: 'Map & trace',
    copy: 'Agentic mapping with provenance: rules first, AI assist, engineer confirm.',
  },
  {
    id: 'resolve_version' as const,
    label: 'Resolve & version',
    copy: 'Deduplicate into one connected dataset with versions and variants.',
  },
  {
    id: 'serve' as const,
    label: 'Serve',
    copy: 'API + MCP for apps, agents, and analytics on the product knowledge graph.',
  },
];
