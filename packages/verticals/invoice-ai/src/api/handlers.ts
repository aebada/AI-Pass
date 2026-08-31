import type { MembershipTier } from '@ai-pass/shared';
import { DEMO_TENANT_ID } from '../demo-data.js';

export function parseTenantId(headers: Headers): string {
  return headers.get('x-tenant-id') ?? DEMO_TENANT_ID;
}

export function parseUserId(headers: Headers): string {
  return headers.get('x-user-id') ?? 'demo-user';
}

export function parseTier(headers: Headers): MembershipTier {
  const tier = headers.get('x-membership-tier');
  if (tier === 'free' || tier === 'professional' || tier === 'power' || tier === 'enterprise') {
    return tier;
  }
  return 'professional';
}

export { defaultInvoiceAIService } from '../services/invoice-service.js';
export { defaultERPService } from '../services/erp-service.js';
