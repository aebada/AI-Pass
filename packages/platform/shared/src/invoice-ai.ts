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
  | 'sick_note';

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

export interface FraudAlert {
  id: string;
  invoiceId: string;
  tenantId: string;
  type: 'duplicate' | 'anomaly' | 'vendor_risk' | 'amount_threshold' | 'pattern';
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
  department?: string;
  notes?: string;
  uploadedAt: string;
  processedAt?: string;
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
