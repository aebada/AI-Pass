import { getKnowledgePlatform } from '@ai-pass/knowledge-pipeline';
import { createId } from '@ai-pass/shared';
import type { KnowledgeReference, SupportIntent } from '../types.js';

const FAQ_SEED = [
  { title: 'Return Policy', content: 'Items can be returned within 30 days of purchase with receipt.', type: 'policy' as const },
  { title: 'Shipping Times', content: 'Standard shipping takes 3-5 business days. Express shipping is 1-2 days.', type: 'faq' as const },
  { title: 'Refund Processing', content: 'Refunds are processed within 5-7 business days after approval.', type: 'policy' as const },
  { title: 'Order ORD-1042', content: 'Order ORD-1042 shipped on June 25. Expected delivery June 28.', type: 'order' as const },
  { title: 'Premium Plan', content: 'Premium plan includes priority support and extended warranty.', type: 'product' as const },
];

export class KnowledgeService {
  private platform = getKnowledgePlatform();
  private supportSourceId: string | null = null;

  private ensureSeed(): void {
    if (this.supportSourceId) return;
    const source = this.platform.connectors.addSource({
      tenantId: 'tenant_acme',
      name: 'Support Knowledge Base',
      connector: 'manual',
      type: 'file',
      embeddingModel: 'text-embedding-stub',
      accessRoles: ['support'],
    });
    this.supportSourceId = source.id;
    for (const item of FAQ_SEED) {
      const chunk = this.platform.embeddings.embed({
        sourceId: source.id,
        content: item.content,
        metadata: { title: item.title, type: item.type },
      });
      const emb = this.platform.embeddings.getEmbedding(chunk.embeddingId!);
      if (emb) this.platform.vectorStore.upsert(emb, chunk.id);
    }
  }

  retrieve(query: string, _intent?: SupportIntent): KnowledgeReference[] {
    this.ensureSeed();
    const rag = this.platform.rag.query({
      query,
      tenantId: 'tenant_acme',
      sourceIds: this.supportSourceId ? [this.supportSourceId] : undefined,
      topK: 3,
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

  searchFaq(query: string): KnowledgeReference[] {
    return this.retrieve(query).filter((r) => r.type === 'faq');
  }

  searchPolicies(query: string): KnowledgeReference[] {
    return this.retrieve(query).filter((r) => r.type === 'policy');
  }

  lookupOrder(orderId: string): KnowledgeReference | null {
    const refs = this.retrieve(orderId, 'order_status');
    return refs.find((r) => r.excerpt.includes(orderId)) ?? refs[0] ?? null;
  }
}
