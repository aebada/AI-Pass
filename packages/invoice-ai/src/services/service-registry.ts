import { DEMO_TENANT_ID } from '../demo-data.js';
import { shouldSeedDemoData } from '../tenant/resolve-tenant.js';
import { InvoiceAIService } from './invoice-service.js';
import { loadTenantSnapshot, saveTenantSnapshot } from './tenant-persistence.js';

const services = new Map<string, InvoiceAIService>();
const persistTimers = new Map<string, ReturnType<typeof setTimeout>>();

function schedulePersist(tenantId: string, service: InvoiceAIService): void {
  if (typeof window === 'undefined') return;
  const existing = persistTimers.get(tenantId);
  if (existing) clearTimeout(existing);
  persistTimers.set(
    tenantId,
    setTimeout(() => {
      persistTimers.delete(tenantId);
      saveTenantSnapshot(tenantId, service.exportSnapshot());
    }, 300),
  );
}

function attachPersistence(tenantId: string, service: InvoiceAIService): void {
  if (typeof window === 'undefined') return;
  service.subscribe(() => schedulePersist(tenantId, service));
}

export interface GetInvoiceAIServiceOptions {
  seedDemo?: boolean;
  email?: string | null;
}

/** Returns a tenant-scoped InvoiceAIService instance (in-memory + optional browser persistence). */
export function getInvoiceAIService(
  tenantId: string,
  options?: GetInvoiceAIServiceOptions,
): InvoiceAIService {
  let service = services.get(tenantId);
  if (service) return service;

  const seedDemo = options?.seedDemo ?? shouldSeedDemoData(tenantId, options?.email);
  service = new InvoiceAIService(seedDemo);

  if (typeof window !== 'undefined') {
    const stored = loadTenantSnapshot(tenantId);
    if (stored) {
      try {
        service.hydrateFromSnapshot(stored);
      } catch {
        // Defensive: discard corrupt snapshot that passed validation edge cases.
        saveTenantSnapshot(tenantId, service.exportSnapshot());
      }
    }
    attachPersistence(tenantId, service);
  }

  services.set(tenantId, service);
  return service;
}

let defaultService: InvoiceAIService | undefined;

/** Legacy singleton for the demo tenant — prefer getInvoiceAIService(tenantId). */
export function getDefaultInvoiceAIService(): InvoiceAIService {
  if (!defaultService) {
    defaultService = getInvoiceAIService(DEMO_TENANT_ID);
  }
  return defaultService;
}

/** Lazy singleton — defers init until first property access (SSR-safe). */
export const defaultInvoiceAIService: InvoiceAIService = new Proxy({} as InvoiceAIService, {
  get(_target, prop, receiver) {
    const service = getDefaultInvoiceAIService();
    const value = Reflect.get(service, prop, receiver);
    return typeof value === 'function' ? value.bind(service) : value;
  },
});

/** Clears cached instances — intended for tests. */
export function resetInvoiceAIServiceRegistry(): void {
  for (const timer of persistTimers.values()) clearTimeout(timer);
  persistTimers.clear();
  services.clear();
}
