export type {
  ChangeSet,
  DataMapping,
  Dataset,
  ErrorRootCause,
  GraphEdge,
  GraphNode,
  LifecycleDomain,
  LifecyclePipelineStage,
  MappingRule,
  OntologyEntityType,
  OntologyRelationType,
  ProductOntology,
  ProvenanceRef,
  RequirementIssue,
  StudioApp,
  TraceAnswer,
} from './types.js';

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
