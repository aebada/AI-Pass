import { createId, type Pipeline, type PipelineStage } from '@ai-pass/shared';

export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  'connect', 'validate', 'clean', 'normalize', 'extract_metadata',
  'extract_entities', 'relationships', 'chunk', 'embed', 'index', 'publish', 'sync',
];

export const PIPELINE_TEMPLATES: { id: string; name: string; description: string; stages: PipelineStage[] }[] = [
  {
    id: 'tpl_standard_rag',
    name: 'Standard RAG',
    description: 'Connect → Clean → Chunk → Embed → Index → Publish',
    stages: ['connect', 'validate', 'clean', 'chunk', 'embed', 'index', 'publish'],
  },
  {
    id: 'tpl_semantic_graph',
    name: 'Semantic Graph',
    description: 'Full enrichment with entity extraction and knowledge graph',
    stages: ['connect', 'validate', 'clean', 'normalize', 'extract_metadata', 'extract_entities', 'relationships', 'chunk', 'embed', 'index', 'publish', 'sync'],
  },
  {
    id: 'tpl_compliance',
    name: 'Compliance Documents',
    description: 'Policy ingestion with metadata enrichment and governance sync',
    stages: ['connect', 'validate', 'clean', 'extract_metadata', 'chunk', 'embed', 'index', 'publish', 'sync'],
  },
];

export interface PipelineRunResult {
  pipelineId: string;
  stagesCompleted: PipelineStage[];
  documentsProcessed: number;
  chunksCreated: number;
  status: 'completed' | 'failed';
  durationMs: number;
}

/** Visual pipeline stages with reusable templates */
export class PipelineService {
  private pipelines = new Map<string, Pipeline>();

  create(params: {
    name: string;
    sourceId: string;
    tenantId: string;
    stages?: PipelineStage[];
    templateId?: string;
    description?: string;
  }): Pipeline {
    const template = params.templateId
      ? PIPELINE_TEMPLATES.find((t) => t.id === params.templateId)
      : undefined;

    const pipeline: Pipeline = {
      id: `pipe_${createId()}`,
      name: params.name,
      description: params.description ?? template?.description,
      sourceId: params.sourceId,
      tenantId: params.tenantId,
      stages: params.stages ?? template?.stages ?? DEFAULT_PIPELINE_STAGES,
      templateId: params.templateId,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    this.pipelines.set(pipeline.id, pipeline);
    return pipeline;
  }

  get(id: string): Pipeline | undefined {
    return this.pipelines.get(id);
  }

  list(tenantId?: string): Pipeline[] {
    const all = [...this.pipelines.values()];
    return tenantId ? all.filter((p) => p.tenantId === tenantId) : all;
  }

  activate(id: string): Pipeline | undefined {
    const p = this.pipelines.get(id);
    if (!p) return undefined;
    p.status = 'active';
    this.pipelines.set(id, p);
    return p;
  }

  listTemplates() {
    return PIPELINE_TEMPLATES;
  }

  async run(id: string, processStage: (stage: PipelineStage) => Promise<{ docs: number; chunks: number }>): Promise<PipelineRunResult> {
    const pipeline = this.pipelines.get(id);
    if (!pipeline) throw new Error(`Pipeline not found: ${id}`);

    const started = Date.now();
    const stagesCompleted: PipelineStage[] = [];
    let documentsProcessed = 0;
    let chunksCreated = 0;

    pipeline.status = 'active';
    for (const stage of pipeline.stages) {
      const result = await processStage(stage);
      documentsProcessed += result.docs;
      chunksCreated += result.chunks;
      stagesCompleted.push(stage);
    }

    pipeline.lastRunAt = new Date().toISOString();
    pipeline.status = 'active';
    this.pipelines.set(id, pipeline);

    return {
      pipelineId: id,
      stagesCompleted,
      documentsProcessed,
      chunksCreated,
      status: 'completed',
      durationMs: Date.now() - started,
    };
  }
}
