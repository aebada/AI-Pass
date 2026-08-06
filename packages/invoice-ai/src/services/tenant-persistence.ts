import type { InvoiceAIServiceSnapshot } from './invoice-service.js';

const STORAGE_PREFIX = 'invoice-ai:data:';

const SNAPSHOT_ARRAY_KEYS = [
  'invoices',
  'vendors',
  'validations',
  'fraudAlerts',
  'approvals',
  'workflows',
  'complianceChecks',
  'bookkeepingEntries',
  'taxLines',
  'purchaseOrders',
  'deliveryNotes',
  'poMatches',
  'accountSuggestions',
  'cashDiscounts',
  'materialConsumption',
  'upcomingDeliveries',
  'supplyOffers',
  'supplyChainWorkflows',
  'tenders',
  'auditLogs',
] as const satisfies ReadonlyArray<keyof InvoiceAIServiceSnapshot>;

export function tenantStorageKey(tenantId: string): string {
  return `${STORAGE_PREFIX}${tenantId}`;
}

function canUseBrowserStorage(): boolean {
  return typeof window !== 'undefined';
}

/** Guards against corrupt or schema-mismatched browser snapshots (prevents client crash on hydrate). */
export function isValidInvoiceAIServiceSnapshot(
  value: unknown,
): value is InvoiceAIServiceSnapshot {
  if (!value || typeof value !== 'object') return false;
  const snapshot = value as Record<string, unknown>;
  return SNAPSHOT_ARRAY_KEYS.every((key) => Array.isArray(snapshot[key]));
}

export function loadTenantSnapshot(tenantId: string): InvoiceAIServiceSnapshot | null {
  if (!canUseBrowserStorage()) return null;
  try {
    const raw = window.localStorage.getItem(tenantStorageKey(tenantId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidInvoiceAIServiceSnapshot(parsed)) {
      window.localStorage.removeItem(tenantStorageKey(tenantId));
      return null;
    }
    return parsed;
  } catch {
    try {
      window.localStorage.removeItem(tenantStorageKey(tenantId));
    } catch {
      // private browsing — ignore
    }
    return null;
  }
}

export function saveTenantSnapshot(tenantId: string, snapshot: InvoiceAIServiceSnapshot): void {
  if (!canUseBrowserStorage()) return;
  try {
    window.localStorage.setItem(tenantStorageKey(tenantId), JSON.stringify(snapshot));
  } catch {
    // Quota or private browsing — ignore
  }
}
