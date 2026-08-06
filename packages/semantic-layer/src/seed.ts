import type {
  Dimension,
  Entity,
  MetricDefinition,
  SemanticCatalogSnapshot,
  SemanticModel,
} from './types.js';

export const DEMO_ENTITIES: Entity[] = [
  {
    id: 'ent_customer',
    name: 'Customer',
    description: 'Buying organization or individual account',
    kind: 'business',
    primaryKey: 'customer_id',
    dimensions: ['dim_region', 'dim_segment'],
    knowledgeSourceIds: ['ks_crm'],
    tags: ['crm', 'revenue'],
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'ent_invoice',
    name: 'Invoice',
    description: 'Accounts receivable invoice document',
    kind: 'business',
    primaryKey: 'invoice_id',
    dimensions: ['dim_status', 'dim_currency'],
    knowledgeSourceIds: ['ks_erp'],
    tags: ['finance', 'ar'],
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-01-12T14:00:00.000Z',
  },
  {
    id: 'ent_order',
    name: 'Order',
    description: 'Sales or purchase order line aggregate',
    kind: 'business',
    primaryKey: 'order_id',
    dimensions: ['dim_channel', 'dim_region'],
    tags: ['commerce'],
    createdAt: '2026-01-11T09:00:00.000Z',
    updatedAt: '2026-01-11T09:00:00.000Z',
  },
];

export const DEMO_DIMENSIONS: Dimension[] = [
  { id: 'dim_region', name: 'Region', dataType: 'string', expression: 'customer.region' },
  { id: 'dim_segment', name: 'Segment', dataType: 'string', expression: 'customer.segment' },
  { id: 'dim_status', name: 'Invoice Status', dataType: 'string', expression: 'invoice.status' },
  { id: 'dim_currency', name: 'Currency', dataType: 'string', expression: 'invoice.currency' },
  { id: 'dim_channel', name: 'Channel', dataType: 'string', expression: 'order.channel' },
];

export const DEMO_METRICS: MetricDefinition[] = [
  {
    id: 'met_arr',
    name: 'arr',
    label: 'Annual Recurring Revenue',
    description: 'Sum of contracted annual subscription value for active customers',
    formula: 'SUM(subscription.arr) WHERE status = active',
    aggregation: 'sum',
    status: 'certified',
    entityId: 'ent_customer',
    dimensions: ['dim_region', 'dim_segment'],
    unit: 'USD',
    owner: 'Finance Ops',
    tags: ['revenue', 'saas'],
    knowledgeRefIds: ['doc_arr_policy'],
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-02-01T12:00:00.000Z',
  },
  {
    id: 'met_dso',
    name: 'dso',
    label: 'Days Sales Outstanding',
    description: 'Average days to collect receivables',
    formula: '(AR balance / credit sales) * days in period',
    aggregation: 'avg',
    status: 'certified',
    entityId: 'ent_invoice',
    dimensions: ['dim_region', 'dim_currency'],
    unit: 'days',
    owner: 'AR Team',
    tags: ['finance', 'ar'],
    createdAt: '2026-01-12T14:00:00.000Z',
    updatedAt: '2026-01-12T14:00:00.000Z',
  },
  {
    id: 'met_order_volume',
    name: 'order_volume',
    label: 'Order Volume',
    description: 'Count of completed orders in the period',
    formula: 'COUNT(order.id) WHERE status = completed',
    aggregation: 'count',
    status: 'draft',
    entityId: 'ent_order',
    dimensions: ['dim_channel', 'dim_region'],
    unit: 'orders',
    owner: 'Commerce',
    tags: ['commerce'],
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-01T08:00:00.000Z',
  },
];

export const DEMO_MODELS: SemanticModel[] = [
  {
    id: 'model_revenue',
    name: 'Revenue Semantic Model',
    description: 'Core revenue metrics shared by Analysis and agents',
    version: '0.1.0',
    entityIds: ['ent_customer', 'ent_invoice', 'ent_order'],
    metricIds: ['met_arr', 'met_dso', 'met_order_volume'],
    dimensionIds: ['dim_region', 'dim_segment', 'dim_status', 'dim_currency', 'dim_channel'],
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-01T08:00:00.000Z',
  },
];

export function createDemoSnapshot(): SemanticCatalogSnapshot {
  return {
    version: 1,
    entities: DEMO_ENTITIES.map((e) => ({ ...e })),
    dimensions: DEMO_DIMENSIONS.map((d) => ({ ...d })),
    metrics: DEMO_METRICS.map((m) => ({ ...m })),
    models: DEMO_MODELS.map((m) => ({ ...m })),
    updatedAt: new Date().toISOString(),
  };
}
