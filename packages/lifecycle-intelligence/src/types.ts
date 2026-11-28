/** Spread-class Lifecycle Intelligence — first-party AI-Pass product twin layer */

export type LifecycleDomain =
  | 'requirements'
  | 'software'
  | 'hardware'
  | 'simulation'
  | 'production'
  | 'quality'
  | 'service'
  | 'supplier';

export type ProvenanceRef = {
  sourceSystem: string;
  sourceRecordId: string;
  sourcePath?: string;
  ingestedAt: string;
  mappingId?: string;
};

export type OntologyEntityType = {
  id: string;
  label: string;
  domain: LifecycleDomain;
  definition: string;
  attributes: { id: string; label: string; dataType: string }[];
};

export type OntologyRelationType = {
  id: string;
  label: string;
  domain: string;
  range: string;
  definition: string;
};

export type ProductOntology = {
  id: string;
  name: string;
  version: string;
  entities: OntologyEntityType[];
  relations: OntologyRelationType[];
  updatedAt: string;
};

export type GraphNode = {
  id: string;
  typeId: string;
  label: string;
  attributes: Record<string, string | number | boolean>;
  version: string;
  provenance: ProvenanceRef[];
  datasetId: string;
};

export type GraphEdge = {
  id: string;
  typeId: string;
  fromId: string;
  toId: string;
  provenance: ProvenanceRef[];
  datasetId: string;
};

export type MappingRule = {
  id: string;
  sourceField: string;
  targetEntityType: string;
  targetAttribute?: string;
  transform?: 'identity' | 'normalize' | 'lookup' | 'ai_suggest';
  confidence: number;
  confirmedByEngineer: boolean;
};

export type DataMapping = {
  id: string;
  name: string;
  sourceSystem: string;
  sourceFormat: 'xml' | 'csv' | 'json' | 'yaml' | 'plcopen' | 'custom';
  targetApp?: string;
  rules: MappingRule[];
  status: 'draft' | 'validated' | 'published';
  createdAt: string;
};

export type ChangeSet = {
  id: string;
  datasetId: string;
  mappingId: string;
  nodesAdded: number;
  edgesAdded: number;
  deduped: number;
  createdAt: string;
};

export type Dataset = {
  id: string;
  name: string;
  productLine: string;
  ontologyId: string;
  createdAt: string;
};

export type TraceAnswer = {
  question: string;
  answer: string;
  path: string[];
  provenance: ProvenanceRef[];
  confidence: number;
};

export type RequirementIssue = {
  id: string;
  requirementId: string;
  severity: 'gap' | 'conflict' | 'risk';
  summary: string;
  linkedIds: string[];
};

export type ErrorRootCause = {
  id: string;
  ticketOrDefect: string;
  summary: string;
  rootComponentIds: string[];
  rootRequirementIds: string[];
  path: string[];
};

export type StudioApp = {
  id: string;
  name: string;
  kind: 'requirements' | 'explorer' | 'inspector' | 'custom';
  ontologyId: string;
  widgets: string[];
  createdAt: string;
};

export type LifecyclePipelineStage =
  | 'ingest'
  | 'map_trace'
  | 'resolve_version'
  | 'serve';
