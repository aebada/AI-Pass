export type {
  ERPProvider,
  ERPSyncDirection,
  ERPSyncStatus,
  ERPConnectionStatus,
  ERPCredentialType,
  ERPCredentials,
  ERPConnection,
  ERPSyncRecord,
  ERPSyncResult,
  ERPHealthCheckResult,
  ERPConnectionTestResult,
  CanonicalInvoice,
  CanonicalInvoiceItem,
  CanonicalVendor,
  CanonicalPayment,
  ERPWebhookEvent,
} from './types.js';

export type { ERPConnector, PushResult } from './ERPConnector.js';
export { BaseERPAdapter } from './ERPConnector.js';

export { resolveCredentialRef, resolveCredentials, hasRequiredCredentials } from './credentials.js';
export { DEFAULT_RATE_LIMIT, RateLimiter, withRetry } from './rate-limiter.js';

export { SAPAdapter } from './adapters/sap.js';
export { OracleCloudAdapter } from './adapters/oracle-cloud.js';
export { DATEVAdapter } from './adapters/datev.js';
export { DynamicsAdapter } from './adapters/dynamics.js';
export { QuickBooksAdapter } from './adapters/quickbooks.js';
export { XeroAdapter } from './adapters/xero.js';
export { CustomERPAdapter } from './adapters/custom.js';

export {
  listERPProviders,
  createERPAdapter,
  isERPProvider,
  ERP_PROVIDER_LABELS,
} from './registry.js';

export {
  invoiceToCanonical,
  vendorToCanonical,
  canonicalToInvoiceSummary,
  canonicalToVendorSummary,
} from './mappers/index.js';

export {
  ERPSyncEngine,
  InMemoryIdempotencyStore,
  createIdempotencyKey,
  defaultERPSyncEngine,
} from './sync-engine.js';
export type { SyncEngineOptions, ERPAuditEntry, IdempotencyStore } from './sync-engine.js';
