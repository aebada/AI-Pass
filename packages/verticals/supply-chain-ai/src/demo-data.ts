import type {
  ScApproval,
  ScAuditLog,
  Decision,
  Evaluation,
  Offer,
  ProcurementPolicy,
  SourcingEvent,
  Supplier,
} from './types.js';

export const DEMO_TENANT_ID = 'tenant_acme';

export const DEMO_SUPPLIERS: Supplier[] = [
  {
    id: 'sup_001',
    tenantId: DEMO_TENANT_ID,
    name: 'Nordic Components AB',
    country: 'SE',
    taxId: 'SE5566778899',
    email: 'bids@nordic-components.se',
    certifications: ['ISO 9001', 'ISO 14001'],
    riskScore: 18,
    esgScore: 78,
    status: 'active',
    totalSpend: 420000,
    offerCount: 12,
    createdAt: '2024-08-15T10:00:00Z',
  },
  {
    id: 'sup_002',
    tenantId: DEMO_TENANT_ID,
    name: 'GlobalTech Solutions',
    country: 'US',
    taxId: 'US123456789',
    email: 'procurement@globaltech.io',
    certifications: ['ISO 9001', 'SOC 2'],
    riskScore: 25,
    esgScore: 65,
    status: 'active',
    totalSpend: 890000,
    offerCount: 8,
    createdAt: '2024-03-02T08:00:00Z',
  },
  {
    id: 'sup_003',
    tenantId: DEMO_TENANT_ID,
    name: 'MedSupply Europe',
    country: 'DE',
    taxId: 'DE998877665',
    email: 'offers@medsupply.eu',
    certifications: ['ISO 13485', 'ISO 9001'],
    riskScore: 32,
    esgScore: 72,
    status: 'active',
    totalSpend: 1250000,
    offerCount: 15,
    createdAt: '2023-11-20T14:00:00Z',
  },
  {
    id: 'sup_004',
    tenantId: DEMO_TENANT_ID,
    name: 'Rapid Logistics Ltd',
    country: 'GB',
    taxId: 'GB112233445',
    email: 'ap@rapidlogistics.co.uk',
    certifications: [],
    riskScore: 72,
    esgScore: 38,
    status: 'blocked',
    blacklistReason: 'Repeated delivery failures and compliance violations',
    totalSpend: 45000,
    offerCount: 2,
    createdAt: '2025-02-01T09:00:00Z',
  },
];

export const DEMO_EVENTS: SourcingEvent[] = [
  {
    id: 'evt_001',
    tenantId: DEMO_TENANT_ID,
    title: 'IT Hardware Refresh Q3 2026',
    category: 'IT Equipment',
    department: 'Information Technology',
    deadline: '2026-08-15',
    currency: 'EUR',
    budgetCap: 180000,
    status: 'evaluating',
    requirements: [
      { id: 'req_001', eventId: 'evt_001', category: 'technical', label: 'Minimum 3-year warranty', mandatory: true },
      { id: 'req_002', eventId: 'evt_001', category: 'compliance', label: 'ISO 9001 certification required', mandatory: true },
      { id: 'req_003', eventId: 'evt_001', category: 'logistics', label: 'Delivery within 45 days', mandatory: true },
      { id: 'req_004', eventId: 'evt_001', category: 'commercial', label: 'Total cost under EUR 180,000', mandatory: true },
    ],
    version: 2,
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-06-20T14:00:00Z',
  },
  {
    id: 'evt_002',
    tenantId: DEMO_TENANT_ID,
    title: 'Facilities Maintenance Contract',
    category: 'Services',
    department: 'Operations',
    deadline: '2026-09-30',
    currency: 'EUR',
    budgetCap: 250000,
    status: 'collecting',
    requirements: [
      { id: 'req_005', eventId: 'evt_002', category: 'compliance', label: 'Valid liability insurance EUR 2M+', mandatory: true },
      { id: 'req_006', eventId: 'evt_002', category: 'esg', label: 'Sustainability reporting required', mandatory: false },
    ],
    version: 1,
    createdAt: '2026-06-10T09:00:00Z',
    updatedAt: '2026-06-10T09:00:00Z',
  },
  {
    id: 'evt_003',
    tenantId: DEMO_TENANT_ID,
    title: 'Medical Supplies Framework',
    category: 'Healthcare',
    department: 'Clinical Procurement',
    deadline: '2026-07-31',
    currency: 'EUR',
    budgetCap: 500000,
    status: 'decided',
    requirements: [
      { id: 'req_007', eventId: 'evt_003', category: 'compliance', label: 'ISO 13485 medical devices certification', mandatory: true },
      { id: 'req_008', eventId: 'evt_003', category: 'logistics', label: 'Cold chain capability', mandatory: true },
    ],
    version: 3,
    createdAt: '2026-03-15T08:00:00Z',
    updatedAt: '2026-06-25T16:00:00Z',
  },
];

export const DEMO_OFFERS: Offer[] = [
  {
    id: 'offer_001',
    eventId: 'evt_001',
    supplierId: 'sup_001',
    supplierName: 'Nordic Components AB',
    fileName: 'nordic-it-offer-q3.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fields: [
      { key: 'price', value: 142000, confidence: 0.94, source: 'excel', validation: 'valid' },
      { key: 'delivery_days', value: 28, confidence: 0.9, source: 'excel', validation: 'valid' },
      { key: 'warranty_months', value: 36, confidence: 0.95, source: 'excel', validation: 'valid' },
      { key: 'iso_9001', value: true, confidence: 0.98, source: 'excel', validation: 'valid' },
    ],
    normalizedFields: {
      price: { value: 142000, confidence: 0.94, provenance: 'excel:nordic-it-offer-q3.xlsx' },
      delivery_days: { value: 28, confidence: 0.9, provenance: 'excel' },
      lead_time: { value: 28, confidence: 0.9, provenance: 'alias' },
      quality_score: { value: 88, confidence: 0.85, provenance: 'excel' },
      warranty_months: { value: 36, confidence: 0.95, provenance: 'excel' },
      esg_score: { value: 78, confidence: 0.8, provenance: 'supplier' },
      risk_score: { value: 18, confidence: 0.9, provenance: 'supplier' },
      currency: { value: 'EUR', confidence: 1, provenance: 'normalization' },
      payment_terms: { value: 'Net 30', confidence: 0.92, provenance: 'excel' },
      iso_9001: { value: true, confidence: 0.98, provenance: 'excel' },
    },
    currency: 'EUR',
    totalPrice: 142000,
    deliveryDays: 28,
    status: 'PASS',
    overallScore: 82.4,
    rank: 1,
    uploadedAt: '2026-06-15T11:00:00Z',
    parsedAt: '2026-06-15T11:02:00Z',
  },
  {
    id: 'offer_002',
    eventId: 'evt_001',
    supplierId: 'sup_002',
    supplierName: 'GlobalTech Solutions',
    fileName: 'globaltech-proposal.pdf',
    mimeType: 'application/pdf',
    fields: [
      { key: 'price', value: 156000, confidence: 0.91, source: 'pdf', validation: 'valid' },
      { key: 'delivery_days', value: 35, confidence: 0.87, source: 'pdf', validation: 'valid' },
    ],
    normalizedFields: {
      price: { value: 143520, confidence: 0.91, provenance: 'normalized:USD->EUR' },
      delivery_days: { value: 35, confidence: 0.87, provenance: 'pdf' },
      lead_time: { value: 35, confidence: 0.87, provenance: 'alias' },
      quality_score: { value: 82, confidence: 0.8, provenance: 'pdf' },
      warranty_months: { value: 24, confidence: 0.88, provenance: 'pdf' },
      esg_score: { value: 65, confidence: 0.75, provenance: 'supplier' },
      risk_score: { value: 25, confidence: 0.85, provenance: 'supplier' },
      currency: { value: 'EUR', confidence: 1, provenance: 'normalization' },
      payment_terms: { value: 'Net 45', confidence: 0.9, provenance: 'pdf' },
      iso_9001: { value: true, confidence: 0.92, provenance: 'pdf' },
    },
    currency: 'EUR',
    totalPrice: 143520,
    deliveryDays: 35,
    status: 'PASS',
    overallScore: 76.8,
    rank: 2,
    uploadedAt: '2026-06-18T14:30:00Z',
    parsedAt: '2026-06-18T14:32:00Z',
  },
  {
    id: 'offer_003',
    eventId: 'evt_003',
    supplierId: 'sup_003',
    supplierName: 'MedSupply Europe',
    fileName: 'medsupply-framework-bid.pdf',
    mimeType: 'application/pdf',
    fields: [
      { key: 'price', value: 412000, confidence: 0.93, source: 'pdf', validation: 'valid' },
      { key: 'delivery_days', value: 21, confidence: 0.91, source: 'pdf', validation: 'valid' },
    ],
    normalizedFields: {
      price: { value: 412000, confidence: 0.93, provenance: 'pdf' },
      delivery_days: { value: 21, confidence: 0.91, provenance: 'pdf' },
      quality_score: { value: 92, confidence: 0.9, provenance: 'pdf' },
      warranty_months: { value: 24, confidence: 0.88, provenance: 'pdf' },
      esg_score: { value: 72, confidence: 0.82, provenance: 'supplier' },
      risk_score: { value: 32, confidence: 0.88, provenance: 'supplier' },
      currency: { value: 'EUR', confidence: 1, provenance: 'normalization' },
      payment_terms: { value: 'Net 30', confidence: 0.94, provenance: 'pdf' },
      iso_9001: { value: true, confidence: 0.96, provenance: 'pdf' },
    },
    currency: 'EUR',
    totalPrice: 412000,
    deliveryDays: 21,
    status: 'PASS',
    overallScore: 85.2,
    rank: 1,
    uploadedAt: '2026-05-20T09:00:00Z',
    parsedAt: '2026-05-20T09:03:00Z',
  },
];

export const DEMO_POLICIES: ProcurementPolicy[] = [
  {
    id: 'pol_001',
    tenantId: DEMO_TENANT_ID,
    name: 'Procurement Policy 2026',
    category: 'general',
    version: 2,
    status: 'active',
    content: 'All purchases above EUR 50,000 require competitive bidding with minimum 3 qualified suppliers. Blocked vendors may not participate.',
    knowledgeRef: 'kp://policies/procurement-2026',
    uploadedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'pol_002',
    tenantId: DEMO_TENANT_ID,
    name: 'ESG Supplier Requirements',
    category: 'esg',
    version: 1,
    status: 'active',
    content: 'Suppliers must disclose carbon footprint and maintain minimum ESG score of 50 for contracts above EUR 100,000.',
    knowledgeRef: 'kp://policies/esg-suppliers',
    uploadedAt: '2026-03-01T00:00:00Z',
  },
];

export const DEMO_EVALUATIONS: Evaluation[] = [
  {
    id: 'eval_001',
    eventId: 'evt_001',
    tenantId: DEMO_TENANT_ID,
    ruleSetVersion: '1.0.0',
    weights: { price: 0.25, delivery: 0.15, risk: 0.15, quality: 0.15, warranty: 0.1, esg: 0.1, compliance: 0.05, payment: 0.05 },
    status: 'completed',
    results: [
      {
        offerId: 'offer_001',
        supplierId: 'sup_001',
        supplierName: 'Nordic Components AB',
        decision: 'PASS',
        score: 82.4,
        scores: [],
        ruleResults: [],
        reasons: ['Best overall score', 'Within budget', 'ISO 9001 certified', '28-day delivery'],
        evidenceIds: ['ev_001', 'ev_002', 'ev_003'],
        rank: 1,
      },
      {
        offerId: 'offer_002',
        supplierId: 'sup_002',
        supplierName: 'GlobalTech Solutions',
        decision: 'PASS',
        score: 76.8,
        scores: [],
        ruleResults: [],
        reasons: ['Competitive pricing', 'Within budget', '35-day delivery acceptable'],
        evidenceIds: ['ev_004', 'ev_005'],
        rank: 2,
      },
    ],
    agentResults: [
      { agentType: 'sc_pricing', agentName: 'pricing', offerId: 'offer_001', decision: 'PASS', confidence: 0.88, summary: 'Nordic offer 9% below benchmark', citations: ['offer:offer_001'], creditsUsed: 10 },
      { agentType: 'sc_risk', agentName: 'risk', offerId: 'offer_001', decision: 'PASS', confidence: 0.92, summary: 'Low risk supplier (18/100)', citations: ['supplier:sup_001'], creditsUsed: 12 },
    ],
    recommendedOfferId: 'offer_001',
    trustScore: 84,
    startedAt: '2026-06-22T10:00:00Z',
    completedAt: '2026-06-22T10:05:30Z',
  },
];

export const DEMO_DECISIONS: Decision[] = [
  {
    id: 'dec_001',
    eventId: 'evt_003',
    evaluationId: 'eval_med_001',
    recommendedOfferId: 'offer_003',
    awardedOfferId: 'offer_003',
    status: 'approved',
    rationale: 'MedSupply Europe offers best clinical compliance, cold chain capability, and competitive pricing within framework budget.',
    trustScore: 87,
    createdAt: '2026-06-25T16:00:00Z',
  },
];

export const DEMO_APPROVALS: ScApproval[] = [
  {
    id: 'appr_sc_001',
    tenantId: DEMO_TENANT_ID,
    eventId: 'evt_001',
    decisionId: 'dec_pending_001',
    approverId: 'user_proc_mgr',
    approverName: 'Elena Vogt',
    level: 1,
    status: 'pending',
    requestedAt: '2026-06-22T10:06:00Z',
  },
];

export const DEMO_AUDIT_LOGS: ScAuditLog[] = [
  {
    id: 'aud_sc_001',
    tenantId: DEMO_TENANT_ID,
    entityType: 'offer',
    entityId: 'offer_001',
    action: 'offer.uploaded',
    actorId: 'demo-user',
    actorName: 'Jordan Lee',
    details: { fileName: 'nordic-it-offer-q3.xlsx', eventId: 'evt_001' },
    creditsUsed: 12,
    timestamp: '2026-06-15T11:00:00Z',
  },
  {
    id: 'aud_sc_002',
    tenantId: DEMO_TENANT_ID,
    entityType: 'evaluation',
    entityId: 'eval_001',
    action: 'evaluation.completed',
    actorId: 'system',
    actorName: 'Supply Chain AI',
    details: { eventId: 'evt_001', recommendedOfferId: 'offer_001' },
    creditsUsed: 106,
    timestamp: '2026-06-22T10:05:30Z',
  },
];

export interface DashboardStats {
  activeEvents: number;
  openTenders: number;
  pendingResponses: number;
  pendingEvaluations: number;
  pipelineValue: number;
  riskAlerts: number;
  totalSpend: number;
  approvalRate: number;
}

export function getDashboardStats(
  events: SourcingEvent[],
  offers: Offer[],
  evaluations: Evaluation[],
  suppliers: Supplier[],
  approvals: ScApproval[],
): DashboardStats {
  const activeEvents = events.filter((e) => e.status !== 'closed').length;
  const openTenders = events.filter((e) => e.status === 'collecting').length;
  const pendingEvaluations = events.filter((e) => e.status === 'evaluating').length;
  const pendingResponses = events.filter((e) => e.status === 'collecting').length;
  const pipelineValue = offers.reduce((s, o) => s + (o.totalPrice ?? 0), 0);
  const riskAlerts = suppliers.filter((s) => s.riskScore > 50 || s.status === 'blocked').length;
  const totalSpend = suppliers.reduce((s, sup) => s + sup.totalSpend, 0);
  const decided = evaluations.filter((e) => e.status === 'completed').length;
  const approved = approvals.filter((a) => a.status === 'approved').length;
  const approvalRate = decided > 0 ? Math.round((approved / Math.max(approvals.length, 1)) * 100) : 0;

  return {
    activeEvents,
    openTenders,
    pendingResponses,
    pendingEvaluations,
    pipelineValue,
    riskAlerts,
    totalSpend,
    approvalRate,
  };
}
