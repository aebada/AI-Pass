/** Framework docs RAG — integrates with Knowledge Pipeline when available */
export class ComplianceKnowledgeService {
  async ingestFrameworkDoc(params: {
    frameworkCode: string;
    content: string;
    tenantId: string;
  }): Promise<{ documentId: string }> {
    try {
      const { getKnowledgePlatform } = await import('@ai-pass/knowledge-pipeline');
      const platform = getKnowledgePlatform();
      const source = platform.connectors.addSource({
        name: `Framework ${params.frameworkCode}`,
        type: 'file',
        connector: 'compliance-ai',
        tenantId: params.tenantId,
        embeddingModel: 'text-embedding-3-small',
        accessRoles: ['compliance'],
      });
      const chunk = platform.embeddings.embed({
        sourceId: source.id,
        content: params.content,
        metadata: { tenantId: params.tenantId, frameworkCode: params.frameworkCode },
      });
      const emb = platform.embeddings.getEmbedding(chunk.embeddingId!);
      if (emb) platform.vectorStore.upsert(emb, chunk.id);
      return { documentId: chunk.id };
    } catch {
      return { documentId: `doc_${params.frameworkCode}_${Date.now()}` };
    }
  }

  async retrieveFrameworkContext(
    query: string,
    frameworkCode?: string,
  ): Promise<{ excerpts: string[]; citations: string[] }> {
    try {
      const { getKnowledgePlatform } = await import('@ai-pass/knowledge-pipeline');
      const platform = getKnowledgePlatform();
      const rag = platform.rag.query({
        query,
        tenantId: 'tenant_acme',
        topK: 5,
        filters: frameworkCode ? { frameworkCode } : undefined,
      });
      const excerpts = rag.chunks
        .filter((r) => !frameworkCode || String(r.metadata?.frameworkCode) === frameworkCode)
        .map((r) => r.content.slice(0, 300));
      return {
        excerpts: excerpts.length > 0 ? excerpts : [this.fallbackExcerpt(query, frameworkCode)],
        citations: rag.citations,
      };
    } catch {
      return {
        excerpts: [this.fallbackExcerpt(query, frameworkCode)],
        citations: [],
      };
    }
  }

  private fallbackExcerpt(query: string, frameworkCode?: string): string {
    const scope = frameworkCode ? ` for ${frameworkCode}` : '';
    return `Knowledge Pipeline context stub${scope}. Query: "${query}". Using org policies, controls, and evidence as copilot grounding.`;
  }
}

export const defaultComplianceKnowledgeService = new ComplianceKnowledgeService();
