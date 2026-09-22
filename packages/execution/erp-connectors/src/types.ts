export type ERPProvider =
  | 'sap'
  | 'oracle-cloud'
  | 'datev'
  | 'dynamics'
  | 'quickbooks'
  | 'xero'
  | 'custom';

export type ERPSyncDirection = 'push' | 'pull' | 'bidirectional';

export type ERPSyncStatus = 'pending' | 'running' | 'success' | 'partial' | 'failed';

export type ERPConnectionStatus = 'active' | 'inactive' | 'error' | 'pending_auth';

export type ERPCredentialType = 'oauth2' | 'api_key' | 'basic' | 'certificate' | 'custom';

/** Credential references — secrets resolved from env/vault at runtime, never stored in code. */
export interface ERPCredentials {
  type: ERPCredentialType;
  clientId?: string;
  /** Env var or vault key name for client secret */
  clientSecretRef?: string;
  /** Env var or vault key name for API key / access token */
  apiKeyRef?: string;
  /** Env var or vault key name for refresh token (OAuth2) */
  refreshTokenRef?: string;
  username?: string;
  passwordRef?: string;
  tenantId?: string;
  realmId?: string;
  scopes?: string[];
  extra?: Record<string, string>;
}

export interface ERPConnection {
  id: string;
  tenantId: string;
  provider: ERPProvider;
  name: string;
  credentials: ERPCredentials;
  /** Provider-specific config: base URL, company ID, fiscal year, etc. */
  config: Record<string, unknown>;
  syncDirection: ERPSyncDirection;
  status: ERPConnectionStatus;
  webhookSecretRef?: string;
  lastSyncAt?: string;
  lastHealthCheckAt?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ERPSyncRecord {
  entityType: 'invoice' | 'vendor' | 'payment';
  entityId: string;
  externalId?: string;
  direction: 'push' | 'pull';
  status: 'success' | 'skipped' | 'failed';
  idempotencyKey: string;
  error?: string;
}

export interface ERPSyncResult {
  connectionId: string;
  tenantId: string;
  provider: ERPProvider;
  status: ERPSyncStatus;
  startedAt: string;
  completedAt: string;
  records: ERPSyncRecord[];
  pushed: number;
  pulled: number;
  failed: number;
  skipped: number;
  errors: string[];
}

export interface ERPHealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs: number;
  message: string;
  checkedAt: string;
  details?: Record<string, unknown>;
}

export interface ERPConnectionTestResult {
  ok: boolean;
  message: string;
  latencyMs?: number;
  details?: Record<string, unknown>;
}

export interface CanonicalInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
  glAccount?: string;
  costCenter?: string;
}

export interface CanonicalInvoice {
  id: string;
  tenantId: string;
  externalId?: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  vendorTaxId?: string;
  amount: number;
  currency: string;
  taxAmount?: number;
  dueDate?: string;
  issueDate?: string;
  status: string;
  items: CanonicalInvoiceItem[];
  metadata?: Record<string, unknown>;
}

export interface CanonicalVendor {
  id: string;
  tenantId: string;
  externalId?: string;
  name: string;
  taxId?: string;
  email?: string;
  country?: string;
  paymentTerms?: string;
  bankAccount?: string;
  status: 'active' | 'blocked' | 'review';
  metadata?: Record<string, unknown>;
}

export interface CanonicalPayment {
  id: string;
  tenantId: string;
  externalId?: string;
  invoiceId: string;
  invoiceExternalId?: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}

export interface ERPWebhookEvent {
  provider: ERPProvider;
  eventType: string;
  externalId: string;
  payload: Record<string, unknown>;
  receivedAt: string;
}

/** Legacy supply-chain ERP types (Ariba, Coupa, Jaggaer adapters). */
export interface ErpConnectionConfig {
  baseUrl: string;
  apiKeyRef?: string;
  tenantId?: string;
}

export interface ErpSourcingEvent {
  externalId: string;
  title: string;
  status: string;
  deadline?: string;
}

export interface ErpPurchaseOrder {
  externalId: string;
  supplierName: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface ErpSyncResult {
  success: boolean;
  recordsSynced: number;
  errors: string[];
  syncedAt: string;
}
