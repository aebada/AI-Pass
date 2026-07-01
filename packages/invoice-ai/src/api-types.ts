import type {
  Approval,
  AuditLog,
  FraudAlert,
  Invoice,
  InvoiceAutomationPack,
  InvoiceWorkflow,
  ValidationResult,
  Vendor,
} from '@ai-pass/shared/invoice-ai';

export interface UploadInvoiceRequest {
  tenantId: string;
  userId: string;
  fileName: string;
  mimeType: string;
  documentType?: Invoice['documentType'];
  direction?: Invoice['direction'];
}

export interface UploadInvoiceResponse {
  invoice: Invoice;
  validation: ValidationResult;
  fraudAlerts: FraudAlert[];
  creditsUsed: number;
  liveSyncEventId?: string;
}

export interface ValidateInvoiceRequest {
  invoiceId: string;
  tenantId: string;
  userId: string;
}

export interface ValidateInvoiceResponse {
  validation: ValidationResult;
  creditsUsed: number;
}

export interface ApproveInvoiceRequest {
  invoiceId: string;
  tenantId: string;
  approverId: string;
  approverName: string;
  comment?: string;
}

export interface RejectInvoiceRequest {
  invoiceId: string;
  tenantId: string;
  approverId: string;
  approverName: string;
  reason: string;
}

export interface ApprovalActionResponse {
  approval: Approval;
  invoice: Invoice;
  auditLog: AuditLog;
}

export interface ChatQueryRequest {
  tenantId: string;
  userId: string;
  query: string;
}

export interface ChatQueryResponse {
  answer: string;
  sources: Array<{ type: string; id: string; label: string }>;
  creditsUsed: number;
}

export interface WorkflowListResponse {
  workflows: InvoiceWorkflow[];
}

export interface VendorListResponse {
  vendors: Vendor[];
}

export interface FraudListResponse {
  alerts: FraudAlert[];
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
}

export interface InvoiceDetailResponse {
  invoice: Invoice;
  validation?: ValidationResult;
  approvals: Approval[];
  fraudAlerts: FraudAlert[];
  auditLogs: AuditLog[];
}

export interface AutomationPackListResponse {
  packs: InvoiceAutomationPack[];
}

export interface DashboardStats {
  todayProcessed: number;
  awaitingApproval: number;
  fraudAlerts: number;
  monthlySpend: number;
  vendorCount: number;
  approvalRate: number;
}

export interface ApiErrorBody {
  error: string;
  code?: string;
}

export interface CreateERPConnectionRequest {
  provider: string;
  name: string;
  credentials: {
    type: 'oauth2' | 'api_key' | 'basic' | 'certificate' | 'custom';
    clientId?: string;
    clientSecretRef?: string;
    apiKeyRef?: string;
    refreshTokenRef?: string;
    tenantId?: string;
    realmId?: string;
    scopes?: string[];
  };
  config?: Record<string, unknown>;
  syncDirection?: 'push' | 'pull' | 'bidirectional';
}

export interface ERPConnectionListResponse {
  connections: Array<{
    id: string;
    provider: string;
    providerLabel: string;
    name: string;
    status: string;
    syncDirection: string;
    lastSyncAt?: string;
    lastHealthCheckAt?: string;
    lastError?: string;
  }>;
  providers: Array<{ id: string; label: string }>;
}

export interface ERPConnectionTestResponse {
  ok: boolean;
  message: string;
  latencyMs?: number;
}

export interface ERPSyncResponse {
  status: string;
  pushed: number;
  pulled: number;
  failed: number;
  errors: string[];
  completedAt: string;
}
