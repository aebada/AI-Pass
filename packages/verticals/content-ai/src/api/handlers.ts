import type { MembershipTier } from '@ai-pass/shared';
import { ContentAIPlatform } from '../services/content-ai-platform.js';
import { DEMO_DETECTIONS, DEMO_HUMANIZATIONS } from '../demo-data.js';
import { DEMO_TENANT_ID } from '../types.js';

export const defaultContentAIPlatformApi = new ContentAIPlatform(DEMO_DETECTIONS, DEMO_HUMANIZATIONS);

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

export { defaultContentAIPlatformApi as defaultContentAIPlatform };
