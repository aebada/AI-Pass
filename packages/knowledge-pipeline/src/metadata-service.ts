import { createId, type Document, type Entity, type Metadata } from '@ai-pass/shared';

const STOP_WORDS = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'of', 'in', 'to', 'and', 'or', 'for']);

/** Semantic enrichment — entities, relationships, concepts, categories */
export class MetadataService {
  private metadata = new Map<string, Metadata>();

  extractKeywords(text: string, limit = 10): string[] {
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) ?? [];
    const freq = new Map<string, number>();
    for (const w of words) {
      if (STOP_WORDS.has(w)) continue;
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([w]) => w);
  }

  extractEntities(text: string, sourceId?: string): Entity[] {
    const entities: Entity[] = [];
    const patterns: { regex: RegExp; type: string }[] = [
      { regex: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Inc|Corp|LLC|GmbH|AG)\b/g, type: 'Organization' },
      { regex: /\b(?:ISO|SOC|GDPR|HIPAA)\s*[\d-]*/gi, type: 'Regulation' },
      { regex: /\b[A-Z]{2,}-\d{3,}\b/g, type: 'Product' },
      { regex: /\bEUR\s*[\d,.]+|\$\s*[\d,.]+/g, type: 'MonetaryAmount' },
    ];

    for (const { regex, type } of patterns) {
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        entities.push({
          id: `ent_${createId()}`,
          name: match[0].trim(),
          type,
          properties: { matchedText: match[0] },
          sourceId,
          confidence: 0.75,
        });
      }
    }
    return entities;
  }

  inferTopics(keywords: string[]): string[] {
    const topicMap: Record<string, string[]> = {
      compliance: ['policy', 'regulation', 'audit', 'gdpr', 'iso'],
      finance: ['invoice', 'payment', 'budget', 'cost', 'eur', 'usd'],
      product: ['feature', 'release', 'documentation', 'api'],
      support: ['return', 'shipping', 'refund', 'order', 'ticket'],
    };
    const topics: string[] = [];
    for (const [topic, signals] of Object.entries(topicMap)) {
      if (keywords.some((k) => signals.includes(k))) topics.push(topic);
    }
    return topics.length ? topics : ['general'];
  }

  enrich(doc: Document): Metadata {
    const keywords = this.extractKeywords(doc.content);
    const entities = this.extractEntities(doc.content, doc.sourceId);
    const topics = this.inferTopics(keywords);

    const meta: Metadata = {
      id: `meta_${createId()}`,
      documentId: doc.id,
      entities: entities.map((e) => e.id),
      concepts: keywords.slice(0, 5),
      categories: topics,
      topics,
      keywords,
      businessObjects: entities.filter((e) => e.type === 'Organization' || e.type === 'Product').map((e) => e.name),
      enrichedAt: new Date().toISOString(),
    };
    this.metadata.set(meta.id, meta);
    return meta;
  }

  get(id: string): Metadata | undefined {
    return this.metadata.get(id);
  }

  list(): Metadata[] {
    return [...this.metadata.values()];
  }

  getByDocument(documentId: string): Metadata | undefined {
    return [...this.metadata.values()].find((m) => m.documentId === documentId);
  }
}
