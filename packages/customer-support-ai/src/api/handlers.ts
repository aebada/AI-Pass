import type { MembershipTier } from '@ai-pass/shared';
import { defaultCustomerSupportAIService } from '../services/conversation-service.js';
import { DEMO_TENANT_ID } from '../demo-data.js';

export function parseTenantId(request: { headers: { get(name: string): string | null } }): string {
  return request.headers.get('x-tenant-id') ?? DEMO_TENANT_ID;
}

export function parseUserId(request: { headers: { get(name: string): string | null } }): string {
  return request.headers.get('x-user-id') ?? 'demo-user';
}

export function parseTier(request: { headers: { get(name: string): string | null } }): MembershipTier {
  const tier = request.headers.get('x-membership-tier');
  if (tier === 'free' || tier === 'professional' || tier === 'power' || tier === 'enterprise') {
    return tier;
  }
  return 'professional';
}

export { defaultCustomerSupportAIService };
