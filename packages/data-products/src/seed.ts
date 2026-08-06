import type { DataProduct, DataProductCatalogSnapshot } from './types.js';

export const DEMO_PRODUCTS: DataProduct[] = [
  {
    id: 'dp_customer_360',
    name: 'Customer 360',
    description: 'Unified customer profile for CRM, support, and revenue agents',
    status: 'published',
    version: '1.2.0',
    domain: 'Customer',
    owners: [
      { id: 'own_crm', name: 'Maya Chen', email: 'maya@example.com', team: 'CRM Platform', role: 'owner' },
      { id: 'own_steward', name: 'Alex Rivera', team: 'Data Governance', role: 'steward' },
    ],
    schema: {
      id: 'sch_customer_360',
      version: '1.2.0',
      description: 'Customer gold table',
      fields: [
        { name: 'customer_id', type: 'string', primaryKey: true },
        { name: 'name', type: 'string' },
        { name: 'segment', type: 'string', nullable: true },
        { name: 'region', type: 'string' },
        { name: 'arr', type: 'number' },
        { name: 'updated_at', type: 'timestamp' },
      ],
    },
    quality: {
      overall: 0.94,
      dimensions: { completeness: 0.97, accuracy: 0.93, timeliness: 0.91, uniqueness: 0.99 },
      checkedAt: '2026-07-20T08:00:00.000Z',
    },
    contracts: [
      {
        id: 'ctr_c360_consumers',
        name: 'Customer 360 Consumer Contract',
        status: 'active',
        expectations: ['Freshness < 6h', 'Quality overall ≥ 0.90', 'Primary key uniqueness'],
        schemaVersion: '1.2.0',
        freshnessSlaHours: 6,
        qualityThreshold: 0.9,
        consumerIds: ['semantic-layer', 'sales-ai'],
        updatedAt: '2026-06-01T10:00:00.000Z',
      },
    ],
    lineage: {
      upstreamProductIds: ['dp_crm_raw'],
      downstreamProductIds: [],
      knowledgePipelineIds: ['kp_crm_ingest'],
      semanticModelIds: ['model_revenue'],
    },
    tags: ['gold', 'customer', 'crm'],
    sourceUri: 'catalog://gold/customer_360',
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-07-01T12:00:00.000Z',
  },
  {
    id: 'dp_invoice_facts',
    name: 'Invoice Facts',
    description: 'Invoice lifecycle facts for AR analytics and Invoice AI',
    status: 'published',
    version: '2.0.1',
    domain: 'Finance',
    owners: [
      { id: 'own_fin', name: 'Jordan Lee', team: 'Finance Data', role: 'owner' },
    ],
    schema: {
      id: 'sch_invoice_facts',
      version: '2.0.1',
      fields: [
        { name: 'invoice_id', type: 'string', primaryKey: true },
        { name: 'customer_id', type: 'string' },
        { name: 'amount', type: 'number' },
        { name: 'currency', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'issued_at', type: 'date' },
        { name: 'paid_at', type: 'date', nullable: true },
      ],
    },
    quality: {
      overall: 0.88,
      dimensions: { completeness: 0.9, accuracy: 0.87, timeliness: 0.85, consistency: 0.9 },
      checkedAt: '2026-07-22T06:30:00.000Z',
      notes: 'Late ERP sync on weekends',
    },
    contracts: [
      {
        id: 'ctr_invoice_sla',
        name: 'Invoice Facts SLA',
        status: 'active',
        expectations: ['Daily batch by 06:00 UTC', 'Amount non-null', 'Status enum validated'],
        schemaVersion: '2.0.1',
        freshnessSlaHours: 24,
        qualityThreshold: 0.85,
        consumerIds: ['invoice-ai', 'semantic-layer'],
        updatedAt: '2026-05-15T09:00:00.000Z',
      },
    ],
    lineage: {
      upstreamProductIds: ['dp_erp_invoices'],
      downstreamProductIds: ['dp_customer_360'],
      knowledgePipelineIds: ['kp_erp_ingest'],
      semanticModelIds: ['model_revenue'],
    },
    tags: ['finance', 'ar', 'gold'],
    sourceUri: 'catalog://gold/invoice_facts',
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-07-10T11:00:00.000Z',
  },
  {
    id: 'dp_crm_raw',
    name: 'CRM Raw Events',
    description: 'Landing-zone CRM events before enrichment',
    status: 'draft',
    version: '0.4.0',
    domain: 'Customer',
    owners: [{ id: 'own_crm', name: 'Maya Chen', team: 'CRM Platform', role: 'owner' }],
    schema: {
      id: 'sch_crm_raw',
      version: '0.4.0',
      fields: [
        { name: 'event_id', type: 'string', primaryKey: true },
        { name: 'payload', type: 'json' },
        { name: 'received_at', type: 'timestamp' },
      ],
    },
    quality: {
      overall: 0.72,
      dimensions: { completeness: 0.8, accuracy: 0.7, timeliness: 0.65 },
      checkedAt: '2026-07-23T18:00:00.000Z',
    },
    contracts: [
      {
        id: 'ctr_crm_raw_draft',
        name: 'CRM Raw Draft Contract',
        status: 'draft',
        expectations: ['Schema evolving — not for production consumers'],
        updatedAt: '2026-07-01T10:00:00.000Z',
      },
    ],
    lineage: {
      upstreamProductIds: [],
      downstreamProductIds: ['dp_customer_360'],
      knowledgePipelineIds: ['kp_crm_ingest'],
    },
    tags: ['bronze', 'crm'],
    sourceUri: 'catalog://bronze/crm_events',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-07-23T18:00:00.000Z',
  },
  {
    id: 'dp_erp_invoices',
    name: 'ERP Invoice Extract',
    description: 'Nightly ERP invoice extract feeding Invoice Facts',
    status: 'published',
    version: '1.0.0',
    domain: 'Finance',
    owners: [{ id: 'own_fin', name: 'Jordan Lee', team: 'Finance Data', role: 'owner' }],
    schema: {
      id: 'sch_erp_inv',
      version: '1.0.0',
      fields: [
        { name: 'invoice_id', type: 'string', primaryKey: true },
        { name: 'raw_amount', type: 'string' },
        { name: 'extracted_at', type: 'timestamp' },
      ],
    },
    quality: {
      overall: 0.81,
      dimensions: { completeness: 0.84, accuracy: 0.8, timeliness: 0.78 },
      checkedAt: '2026-07-22T05:00:00.000Z',
    },
    contracts: [
      {
        id: 'ctr_erp_extract',
        name: 'ERP Extract Contract',
        status: 'violated',
        expectations: ['Complete before 05:00 UTC', 'No duplicate invoice_id'],
        freshnessSlaHours: 24,
        qualityThreshold: 0.8,
        updatedAt: '2026-07-22T05:15:00.000Z',
      },
    ],
    lineage: {
      upstreamProductIds: [],
      downstreamProductIds: ['dp_invoice_facts'],
      knowledgePipelineIds: ['kp_erp_ingest'],
    },
    tags: ['silver', 'erp'],
    sourceUri: 'catalog://silver/erp_invoices',
    createdAt: '2026-02-01T09:00:00.000Z',
    updatedAt: '2026-07-22T05:15:00.000Z',
  },
];

export function createDemoCatalog(): DataProductCatalogSnapshot {
  return {
    version: 1,
    products: DEMO_PRODUCTS.map((p) => ({
      ...p,
      owners: p.owners.map((o) => ({ ...o })),
      schema: { ...p.schema, fields: p.schema.fields.map((f) => ({ ...f })) },
      quality: { ...p.quality, dimensions: { ...p.quality.dimensions } },
      contracts: p.contracts.map((c) => ({ ...c, expectations: [...c.expectations] })),
      lineage: {
        ...p.lineage,
        upstreamProductIds: [...p.lineage.upstreamProductIds],
        downstreamProductIds: [...p.lineage.downstreamProductIds],
        knowledgePipelineIds: p.lineage.knowledgePipelineIds
          ? [...p.lineage.knowledgePipelineIds]
          : undefined,
        semanticModelIds: p.lineage.semanticModelIds ? [...p.lineage.semanticModelIds] : undefined,
      },
      tags: p.tags ? [...p.tags] : undefined,
    })),
    updatedAt: new Date().toISOString(),
  };
}
