import { DEMO_TENANT_ID } from '../demo-data.js';

export interface InvoiceAITenantUser {
  id?: string;
  workspace?: string;
  email?: string;
}

const GENERIC_WORKSPACES = new Set(['default', 'my workspace']);

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/** Whether demo seed data should be loaded for this tenant / user. */
export function shouldSeedDemoData(tenantId: string, email?: string | null): boolean {
  if (email === 'demo@example.com') return true;
  if (tenantId === DEMO_TENANT_ID && process.env.NEXT_PUBLIC_INVOICE_AI_DEMO === '1') {
    return true;
  }
  return false;
}

/** Whether the user should be mapped to the shared demo tenant. */
export function shouldUseDemoTenant(user: InvoiceAITenantUser | null | undefined): boolean {
  if (!user) return false;
  return shouldSeedDemoData(DEMO_TENANT_ID, user.email);
}

/**
 * Resolve an isolated tenant id from the logged-in user profile.
 * Prefers a meaningful workspace slug; falls back to user id; then anonymous.
 */
export function resolveInvoiceAITenantId(user: InvoiceAITenantUser | null | undefined): string {
  if (!user) return 'anonymous';
  if (shouldUseDemoTenant(user)) return DEMO_TENANT_ID;

  const workspace = user.workspace?.trim();
  if (workspace && !GENERIC_WORKSPACES.has(workspace.toLowerCase())) {
    const slug = slugify(workspace);
    if (slug) return `tenant_${slug}`;
  }

  if (user.id && user.id !== 'user') {
    return `tenant_${slugify(user.id)}`;
  }

  return 'anonymous';
}
