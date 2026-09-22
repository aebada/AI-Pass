import { createId } from '@ai-pass/shared';
import type { RAGService } from './rag-service.js';

export interface KnowledgeEndpoint {
  id: string;
  name: string;
  path: string;
  type: 'rag' | 'search' | 'graph' | 'context_package';
  sourceIds: string[];
  enabled: boolean;
  createdAt: string;
}

export interface ContextPackage {
  id: string;
  name: string;
  description: string;
  sourceIds: string[];
  chunkCount: number;
  createdAt: string;
}

/** Publishing — RAG endpoints, knowledge APIs, context packages */
export class PublishingService {
  private endpoints: KnowledgeEndpoint[] = [
    {
      id: 'ep_rag_default',
      name: 'Default RAG API',
      path: '/api/v1/knowledge/query',
      type: 'rag',
      sourceIds: [],
      enabled: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ep_graph_default',
      name: 'Graph Query API',
      path: '/api/v1/knowledge/graph/query',
      type: 'graph',
      sourceIds: [],
      enabled: true,
      createdAt: new Date().toISOString(),
    },
  ];

  private packages: ContextPackage[] = [];

  constructor(private rag: RAGService) {}

  listEndpoints(): KnowledgeEndpoint[] {
    return [...this.endpoints];
  }

  createEndpoint(params: Omit<KnowledgeEndpoint, 'id' | 'createdAt'>): KnowledgeEndpoint {
    const ep: KnowledgeEndpoint = {
      ...params,
      id: `ep_${createId()}`,
      createdAt: new Date().toISOString(),
    };
    this.endpoints.push(ep);
    return ep;
  }

  createContextPackage(params: {
    name: string;
    description: string;
    sourceIds: string[];
    query?: string;
    tenantId: string;
  }): ContextPackage {
    const ragResult = params.query
      ? this.rag.query({ query: params.query, tenantId: params.tenantId, sourceIds: params.sourceIds })
      : null;

    const pkg: ContextPackage = {
      id: `pkg_${createId()}`,
      name: params.name,
      description: params.description,
      sourceIds: params.sourceIds,
      chunkCount: ragResult?.chunks.length ?? 0,
      createdAt: new Date().toISOString(),
    };
    this.packages.push(pkg);
    return pkg;
  }

  listPackages(): ContextPackage[] {
    return [...this.packages];
  }
}
