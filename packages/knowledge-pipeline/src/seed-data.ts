import type { KnowledgePlatform } from './knowledge-platform.js';

const DEMO_CHUNKS: { content: string; metadata: Record<string, unknown> }[] = [
  { content: 'Acme Corp Q4 2025 revenue reached EUR 12.4M, up 8% YoY driven by enterprise SaaS growth.', metadata: { topic: 'finance', quarter: 'Q4' } },
  { content: 'Return policy: items may be returned within 30 days with original receipt and packaging intact.', metadata: { topic: 'support', type: 'policy' } },
  { content: 'ISO 27001 control A.12.6.1 requires technical vulnerability management with regular patching.', metadata: { topic: 'compliance', framework: 'ISO_27001' } },
  { content: 'Product Alpha v3.2 release includes API rate limiting, webhook retries, and batch export.', metadata: { topic: 'product', product: 'Alpha' } },
  { content: 'Procurement policy: all purchases above EUR 10,000 require dual approval from finance and department head.', metadata: { topic: 'procurement', type: 'policy' } },
  { content: 'GDPR Article 17 grants data subjects the right to erasure of personal data without undue delay.', metadata: { topic: 'compliance', framework: 'GDPR' } },
  { content: 'Standard shipping takes 3-5 business days. Express shipping delivers within 1-2 business days.', metadata: { topic: 'support', type: 'faq' } },
  { content: 'Supplier evaluation criteria: price 30%, quality 25%, delivery 20%, ESG 15%, innovation 10%.', metadata: { topic: 'supply_chain' } },
  { content: 'Invoice INV-2025-1042 from TechVendor GmbH for EUR 4,850.00 — pending finance approval.', metadata: { topic: 'finance', type: 'invoice' } },
  { content: 'AI governance policy: all production AI systems must be registered in the governance inventory.', metadata: { topic: 'governance', type: 'policy' } },
];

function expandChunks(): typeof DEMO_CHUNKS {
  const expanded = [...DEMO_CHUNKS];
  const topics = ['finance', 'compliance', 'product', 'support', 'procurement', 'governance'];
  for (let i = expanded.length; i < 50; i++) {
    const topic = topics[i % topics.length]!;
    expanded.push({
      content: `Knowledge chunk ${i + 1}: Enterprise documentation for ${topic} domain — section ${Math.floor(i / 5) + 1}.`,
      metadata: { topic, chunkIndex: i + 1 },
    });
  }
  return expanded;
}

export const RETRIEVAL_TEST_QUERIES = [
  'What is the return policy?',
  'ISO 27001 vulnerability management requirements',
  'Q4 revenue performance',
  'procurement approval threshold',
  'GDPR right to erasure',
  'supplier evaluation scoring weights',
];

export function seedKnowledgePlatform(platform: KnowledgePlatform, tenantId = 'tenant_acme'): void {
  const src1 = platform.connectors.addSource({
    name: 'Financial Reports',
    type: 'file',
    connector: 'pdf',
    connectorKind: 'pdf',
    tenantId,
    embeddingModel: 'text-embedding-3-small',
    accessRoles: ['knowledge:read', 'finance'],
  });

  const src2 = platform.connectors.addSource({
    name: 'Compliance Policies',
    type: 'enterprise_system',
    connector: 'sharepoint',
    connectorKind: 'sharepoint',
    tenantId,
    embeddingModel: 'text-embedding-3-small',
    accessRoles: ['knowledge:read', 'compliance'],
  });

  const src3 = platform.connectors.addSource({
    name: 'Product Documentation',
    type: 'api',
    connector: 'rest',
    connectorKind: 'rest',
    tenantId,
    embeddingModel: 'text-embedding-3-small',
    accessRoles: ['knowledge:read', 'product'],
  });

  platform.pipelines.create({
    name: 'Standard RAG — Financial',
    sourceId: src1.id,
    tenantId,
    templateId: 'tpl_standard_rag',
  });

  const pipe2 = platform.pipelines.create({
    name: 'Semantic Graph — Compliance',
    sourceId: src2.id,
    tenantId,
    templateId: 'tpl_semantic_graph',
  });
  platform.pipelines.activate(pipe2.id);

  platform.vectorStore.createIndex(src1.id, 8);
  platform.vectorStore.createIndex(src2.id, 8);
  platform.vectorStore.createIndex(src3.id, 8);

  const sources = [src1.id, src2.id, src3.id];
  const chunks = expandChunks();

  for (let i = 0; i < chunks.length; i++) {
    const sourceId = sources[i % sources.length]!;
    const item = chunks[i]!;
    const chunk = platform.embeddings.embed({
      sourceId,
      content: item.content,
      metadata: item.metadata,
    });
    const emb = platform.embeddings.getEmbedding(chunk.embeddingId!);
    if (emb) platform.vectorStore.upsert(emb, chunk.id);

    platform.connectors.updateSyncStatus(sourceId, 'indexed', Math.floor(i / 3) + 1);
  }

  const company = platform.graph.addEntity({
    name: 'Acme Corp',
    type: 'Organization',
    properties: { tenantId, industry: 'Technology' },
    sourceId: src1.id,
    confidence: 0.95,
  });

  const productAlpha = platform.graph.addEntity({
    name: 'Product Alpha',
    type: 'Product',
    properties: { version: '3.2' },
    sourceId: src3.id,
    confidence: 0.92,
  });

  const productBeta = platform.graph.addEntity({
    name: 'Product Beta',
    type: 'Product',
    properties: { version: '1.0' },
    sourceId: src3.id,
    confidence: 0.90,
  });

  const policyGdpr = platform.graph.addEntity({
    name: 'GDPR Data Policy',
    type: 'Policy',
    properties: { framework: 'GDPR' },
    sourceId: src2.id,
    confidence: 0.88,
  });

  const policyProcurement = platform.graph.addEntity({
    name: 'Procurement Policy 2026',
    type: 'Policy',
    properties: { threshold: 'EUR 10000' },
    sourceId: src2.id,
    confidence: 0.87,
  });

  platform.graph.addRelationship({ subjectId: company.id, predicate: 'offers', objectId: productAlpha.id, confidence: 0.95 });
  platform.graph.addRelationship({ subjectId: company.id, predicate: 'offers', objectId: productBeta.id, confidence: 0.93 });
  platform.graph.addRelationship({ subjectId: company.id, predicate: 'governed_by', objectId: policyGdpr.id, confidence: 0.90 });
  platform.graph.addRelationship({ subjectId: company.id, predicate: 'governed_by', objectId: policyProcurement.id, confidence: 0.89 });
  platform.graph.addRelationship({ subjectId: productAlpha.id, predicate: 'complies_with', objectId: policyGdpr.id, confidence: 0.85 });

  platform.graph.createGraph(tenantId, 'Acme Enterprise Knowledge Graph');

  platform.governance.recordLineage({
    entityType: 'source',
    entityId: src1.id,
    action: 'seed',
    parentIds: [],
    metadata: { seeded: true },
  });

  platform.governance.audit('platform.seeded', tenantId, 'system');
}
