/** TenantContext — multi-tenant isolation for the AI OS */

export type TenantPlan = 'free' | 'professional' | 'power' | 'enterprise';

export interface TenantContext {
  tenantId: string;
  tenantName: string;
  slug: string;
  plan: TenantPlan;
  region?: string;
  features: string[];
  metadata?: Record<string, string>;
}

export interface TenantIsolationPolicy {
  tenantId: string;
  dataResidency?: string;
  encryptionRequired: boolean;
  crossTenantSharing: boolean;
  auditRetentionDays: number;
}

export interface TenantSession {
  sessionId: string;
  tenantId: string;
  userId: string;
  roles: string[];
  permissions: string[];
  expiresAt: string;
}

export const DEMO_TENANT: TenantContext = {
  tenantId: 'tenant_acme',
  tenantName: 'Acme Corp',
  slug: 'acme',
  plan: 'professional',
  region: 'us-east-1',
  features: ['playground', 'agents', 'workflows', 'marketplace', 'wallet'],
};

export function createTenantContext(overrides?: Partial<TenantContext>): TenantContext {
  return { ...DEMO_TENANT, ...overrides };
}

export function tenantHasFeature(tenant: TenantContext, feature: string): boolean {
  return tenant.features.includes(feature) || tenant.plan === 'enterprise';
}
