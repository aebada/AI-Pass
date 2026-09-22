import { getKnowledgePlatform } from '@ai-pass/knowledge-pipeline';
import { createId } from '@ai-pass/shared';
import type { KnowledgeReference } from '../types.js';

const SALES_KNOWLEDGE_SEED = [
  { title: 'Product Overview', content: 'AI Pass Sales AI is a Revenue Operating System for email, LinkedIn, proposals, CRM, and campaigns.', type: 'product' as const },
  { title: 'Pricing — Pro', content: 'Pro tier: €39/month — 500 emails, email assistant, LinkedIn assistant, sales copilot.', type: 'pricing' as const },
  { title: 'Pricing — Business', content: 'Business tier: €99/month — CRM sync, campaigns, analytics, meeting prep, unlimited sequences.', type: 'pricing' as const },
  { title: 'FAQ — CRM Integration', content: 'Sales AI integrates with Salesforce, HubSpot, Zoho, Pipedrive, Dynamics, and Monday.com.', type: 'faq' as const },
  { title: 'Battle Card — vs Manual Outreach', content: 'Sales AI reduces email drafting time by 80% and increases reply rates by 2.5x with personalization.', type: 'battle_card' as const },
  { title: 'Sample Proposal Template', content: 'Executive Summary, Scope of Work, Investment, Timeline, Terms and Conditions.', type: 'proposal' as const },
];

/** Knowledge Pipeline RAG for products, pricing, FAQs, proposals */
export class KnowledgeIntegrationService {
  private platform = getKnowledgePlatform();
  private salesSourceId: string | null = null;

  private ensureSeed(): void {
    if (this.salesSourceId) return;
    const source = this.platform.connectors.addSource({
      tenantId: 'tenant_acme',
      name: 'Sales Knowledge Base',
      connector: 'manual',
      type: 'file',
      embeddingModel: 'text-embedding-stub',
      accessRoles: ['sales'],
    });
    this.salesSourceId = source.id;
    for (const item of SALES_KNOWLEDGE_SEED) {
      const chunk = this.platform.embeddings.embed({
        sourceId: source.id,
        content: item.content,
        metadata: { title: item.title, type: item.type },
      });
      const emb = this.platform.embeddings.getEmbedding(chunk.embeddingId!);
      if (emb) this.platform.vectorStore.upsert(emb, chunk.id);
    }
  }

  retrieve(query: string): KnowledgeReference[] {
    this.ensureSeed();
    const rag = this.platform.rag.query({
      query,
      tenantId: 'tenant_acme',
      sourceIds: this.salesSourceId ? [this.salesSourceId] : undefined,
      topK: 5,
    });
    return rag.chunks.map((r) => ({
      id: `ref_${createId()}`,
      type: (r.metadata?.type as KnowledgeReference['type']) ?? 'faq',
      title: String(r.metadata?.title ?? 'Knowledge Article'),
      excerpt: r.content.slice(0, 200),
      sourceId: r.sourceId,
      score: r.score,
    }));
  }
}
