import type { AgentDecision } from './platform.js';

export type InvoiceStatus =
  | 'draft'
  | 'processing'
  | 'validated'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'paid'
  | 'flagged';

export type InvoiceDocumentType =
  | 'invoice'
  | 'receipt'
  | 'offer'
  | 'prescription'
  | 'sick_note'
  | 'delivery_note';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
  category?: string;
}

export interface Vendor {
  id: string;
  tenantId: string;
  name: string;
  taxId?: string;
  email?: string;
  country?: string;
  riskScore: number;
  status: 'active' | 'blocked' | 'review';
  totalSpend: number;
  invoiceCount: number;
  createdAt: string;
}

export interface ValidationResult {
  id: string;
  invoiceId: string;
  passed: boolean;
  decision: AgentDecision;
  checks: Array<{
    rule: string;
    passed: boolean;
    message: string;
    severity: 'info' | 'warning' | 'error';
  }>;
  confidence: number;
  validatedAt: string;
}

export type InvoiceUseCaseId =
  | 'bookkeeping'
  | 'tax_declaration'
  | 'insurance_claims'
  | 'public_sector'
  | 'healthcare'
  | 'financial_services'
  | 'construction_procure_to_pay'
  | 'supply_chain'
  | 'custom';

export type TenderStatus = 'open' | 'closed' | 'awarded';

export interface Tender {
  id: string;
  tenantId: string;
  title: string;
  project: string;
  projectId?: string;
  deadline: string;
  status: TenderStatus;
  requirements: string[];
  invitedVendors: string[];
  awardedOfferId?: string;
  createdAt: string;
}

export type SupplyOfferStatus =
  | 'received'
  | 'parsed'
  | 'compared'
  | 'selected'
  | 'rejected'
  | 'revision_requested';

export type UserRuleConditionField =
  | 'price'
  | 'lead_time'
  | 'vendor_risk'
  | 'compliance'
  | 'po_match'
  | 'total';

export type UserRuleOperator = 'lt' | 'lte' | 'gt' | 'gte' | 'eq';

export type UserRuleAction = 'prefer' | 'reject' | 'warn' | 'require_revision';

export interface SupplyOfferItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface SupplyOffer {
  id: string;
  tenantId: string;
  /** Tender this offer responds to (alias: rfqId for legacy RFQ flows). */
  tenderId: string;
  rfqId: string;
  rfqTitle: string;
  category: 'concrete' | 'logistics' | 'office_supplies' | string;
  vendorId: string;
  vendorName: string;
  quoteNumber: string;
  netAmount: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  leadTimeDays: number;
  paymentTerms: string;
  vendorRiskScore: number;
  complianceScore: number;
  poMatchScore: number;
  deliveryDate?: string;
  validityDate: string;
  items: SupplyOfferItem[];
  status: SupplyOfferStatus;
  receivedAt: string;
  projectId?: string;
  projectName?: string;
  purchaseOrderId?: string;
}

export type UserRuleScope = 'global' | 'tender';

export interface UserRule {
  id: string;
  name: string;
  enabled: boolean;
  scope?: UserRuleScope;
  tenderId?: string;
  condition: {
    field: UserRuleConditionField;
    operator: UserRuleOperator;
    value: number;
  };
  action: UserRuleAction;
}

export interface OfferComparisonRow {
  offerId: string;
  vendorName: string;
  quoteNumber: string;
  price: number;
  vatAmount: number;
  total: number;
  leadTimeDays: number;
  vendorScore: number;
  complianceScore: number;
  poMatchScore: number;
  paymentTerms: string;
  rank: number;
  compositeScore: number;
  ruleViolations: string[];
  rejected: boolean;
}

export interface OfferComparison {
  tenderId: string;
  rfqId: string;
  rfqTitle: string;
  category: string;
  projectName?: string;
  purchaseOrderRef?: string;
  offers: OfferComparisonRow[];
  comparedAt: string;
}

export interface TenderComparisonCriterion {
  id: string;
  label: string;
  weight: number;
  higherIsBetter: boolean;
}

export interface TenderComparisonCell {
  offerId: string;
  criterionId: string;
  rawValue: number;
  normalizedScore: number;
}

export interface TenderComparison {
  tenderId: string;
  tenderTitle: string;
  criteria: TenderComparisonCriterion[];
  offers: Array<{ offerId: string; vendorName: string; cells: TenderComparisonCell[]; totalScore: number }>;
  comparedAt: string;
}

export interface SupplyChainRuleResult {
  ruleId: string;
  ruleName: string;
  offerId: string;
  outcome: 'pass' | 'fail' | 'warn';
  message: string;
}

export interface SupplyChainRecommendation {
  tenderId: string;
  rfqId: string;
  bestOfferId: string;
  bestVendorName: string;
  runnerUpOfferId?: string;
  runnerUpVendorName?: string;
  decision: 'select' | 'revision' | 'reject_all';
  confidence: number;
  rationale: string;
  warnings: string[];
  ruleResults: SupplyChainRuleResult[];
  generatedAt: string;
}

export type SupplyChainWorkflowStepStatus = 'pending' | 'active' | 'completed' | 'skipped';

export interface SupplyChainWorkflowStep {
  id: string;
  label: string;
  status: SupplyChainWorkflowStepStatus;
}

export interface SupplyChainWorkflow {
  id: string;
  tenantId: string;
  rfqId: string;
  title: string;
  steps: SupplyChainWorkflowStep[];
  currentStep: string;
  status: 'collecting' | 'comparing' | 'evaluating' | 'decided';
}

export type DeliveryNoteStatus = 'draft' | 'signed' | 'delivered' | 'matched' | 'disputed';
export type PurchaseOrderStatus = 'ordered' | 'partial' | 'delivered' | 'invoiced' | 'closed';
export type DeliveryFlowType = 'supplier_to_site' | 'plant_to_site' | 'site_to_site' | 'internal_transfer';

export interface DeliveryNoteItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  materialCategory?: string;
}

export interface DeliveryNote {
  id: string;
  tenantId: string;
  deliveryNumber: string;
  projectId: string;
  projectName: string;
  vendorId: string;
  vendorName: string;
  purchaseOrderId?: string;
  flowType: DeliveryFlowType;
  status: DeliveryNoteStatus;
  items: DeliveryNoteItem[];
  driverName?: string;
  receiverName?: string;
  signedAt?: string;
  photoProof?: boolean;
  pdfGenerated: boolean;
  deliveredAt: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  materialCategory?: string;
}

export interface PurchaseOrder {
  id: string;
  tenantId: string;
  poNumber: string;
  projectId: string;
  projectName: string;
  vendorId: string;
  vendorName: string;
  contractRef?: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  totalAmount: number;
  currency: string;
  orderedAt: string;
  expectedDeliveryAt?: string;
}

export interface PoInvoiceMatch {
  id: string;
  invoiceId: string;
  purchaseOrderId: string;
  deliveryNoteId?: string;
  matched: boolean;
  quantityMatch: boolean;
  priceMatch: boolean;
  contractMatch: boolean;
  varianceAmount?: number;
  variancePercent?: number;
  message: string;
  checkedAt: string;
}

export interface AccountAssignmentSuggestion {
  id: string;
  invoiceId: string;
  account: string;
  costCenter?: string;
  projectId?: string;
  confidence: number;
  reason: string;
}

export interface CashDiscountAlert {
  id: string;
  invoiceId: string;
  discountPercent: number;
  discountAmount: number;
  deadline: string;
  daysRemaining: number;
  status: 'available' | 'expiring_soon' | 'missed';
}

export interface MaterialConsumption {
  id: string;
  tenantId: string;
  projectId: string;
  projectName: string;
  category: string;
  quantity: number;
  unit: string;
  co2Tonnes?: number;
  period: string;
}

export interface UpcomingDelivery {
  id: string;
  tenantId: string;
  projectName: string;
  vendorName: string;
  description: string;
  quantity: number;
  unit: string;
  scheduledAt: string;
  status: 'confirmed' | 'ordered' | 'in_transit';
}

export interface InvoiceUseCase {
  id: InvoiceUseCaseId | string;
  name: string;
  description: string;
  industry: string;
  complianceFrameworks: string[];
  enabled: boolean;
  isCustom?: boolean;
}

export interface ComplianceCheck {
  id: string;
  invoiceId: string;
  category: 'tax' | 'legal' | 'bookkeeping' | 'insurance' | 'regulatory';
  rule: string;
  passed: boolean;
  message: string;
  severity: 'info' | 'warning' | 'error';
  framework?: string;
}

export interface BookkeepingEntry {
  id: string;
  invoiceId: string;
  account: string;
  debit: number;
  credit: number;
  description: string;
  taxCode?: string;
  postedAt: string;
}

export interface TaxDeclarationLine {
  id: string;
  invoiceId: string;
  vatRate: number;
  netAmount: number;
  vatAmount: number;
  jurisdiction: string;
  declarationPeriod: string;
}

export interface FraudAlert {
  id: string;
  invoiceId: string;
  tenantId: string;
  type: 'duplicate' | 'anomaly' | 'vendor_risk' | 'amount_threshold' | 'pattern' | 'deepfake' | 'legal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  score: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface Approval {
  id: string;
  invoiceId: string;
  tenantId: string;
  approverId: string;
  approverName: string;
  level: number;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  comment?: string;
  requestedAt: string;
  decidedAt?: string;
}

export interface WorkflowStep {
  id: string;
  type: 'trigger' | 'extract' | 'validate' | 'fraud' | 'approve' | 'notify' | 'payment' | 'condition';
  label: string;
  agentId?: string;
  config?: Record<string, unknown>;
  next?: string[];
}

export interface InvoiceWorkflow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  mode: 'manual' | 'semi_automated' | 'autonomous';
  steps: WorkflowStep[];
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  entityType: 'invoice' | 'approval' | 'workflow' | 'vendor' | 'fraud';
  entityId: string;
  action: string;
  actorId: string;
  actorName: string;
  details: Record<string, unknown>;
  creditsUsed?: number;
  timestamp: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  documentType: InvoiceDocumentType;
  direction: 'incoming' | 'outgoing';
  status: InvoiceStatus;
  amount: number;
  currency: string;
  taxAmount?: number;
  dueDate?: string;
  items: InvoiceItem[];
  extractedFields: Record<string, { value: unknown; confidence: number }>;
  decision: AgentDecision;
  validationId?: string;
  workflowId?: string;
  useCaseId?: string;
  department?: string;
  notes?: string;
  uploadedAt: string;
  processedAt?: string;
  projectId?: string;
  purchaseOrderId?: string;
  deliveryNoteId?: string;
  cashDiscountDeadline?: string;
  fileName?: string;
  mimeType?: string;
}

export interface InvoiceAutomationPack {
  id: string;
  industry: string;
  name: string;
  description: string;
  triggers: string[];
  skills: string[];
  approvalMatrix: Record<string, unknown>;
  tier: 'free' | 'professional' | 'enterprise';
  pricingModel: 'free' | 'subscription' | 'per_run';
}

/** @deprecated Use Invoice — kept for verticals compatibility */
export interface InvoiceRecord {
  id: string;
  tenantId: string;
  documentType: InvoiceDocumentType;
  direction: 'incoming' | 'outgoing';
  extractedFields: Record<string, { value: unknown; confidence: number }>;
  decision: AgentDecision;
  amount?: number;
  currency?: string;
  vendorId?: string;
  processedAt: string;
}
