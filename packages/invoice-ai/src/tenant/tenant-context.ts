import { DEMO_TENANT_ID } from '../demo-data.js';
import type { InvoiceAIPermission, InvoiceAIRole, InvoiceAITenantContext } from './types.js';
import { ROLE_PERMISSIONS } from './types.js';

export const DEMO_TENANT_CONTEXT: InvoiceAITenantContext = {
  tenantId: DEMO_TENANT_ID,
  tenantName: 'Acme Corp',
  slug: 'acme',
  plan: 'professional',
  region: 'eu-central-1',
  features: ['invoice-ai', 'fraud-center', 'workflows', 'marketplace', 'admin-portal'],
  roles: ['finance_manager'],
};

export function createTenantContext(overrides?: Partial<InvoiceAITenantContext>): InvoiceAITenantContext {
  return { ...DEMO_TENANT_CONTEXT, ...overrides };
}

export function tenantHasFeature(tenant: InvoiceAITenantContext, feature: string): boolean {
  return tenant.features.includes(feature) || tenant.plan === 'enterprise';
}

export function resolvePermissions(roles: InvoiceAIRole[]): InvoiceAIPermission[] {
  const perms = new Set<InvoiceAIPermission>();
  for (const role of roles) {
    for (const p of ROLE_PERMISSIONS[role] ?? []) perms.add(p);
  }
  return [...perms];
}

export function hasPermission(roles: InvoiceAIRole[], permission: InvoiceAIPermission): boolean {
  return resolvePermissions(roles).includes(permission);
}
