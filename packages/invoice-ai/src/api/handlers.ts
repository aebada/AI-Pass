import type { MembershipTier } from '@ai-pass/shared';
import { canPerform, parseRoles, type InvoiceAIAction } from '../tenant/rbac.js';

export function parseTenantId(headers: Headers): string {
  return headers.get('x-tenant-id') ?? 'anonymous';
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

export function parseUserName(headers: Headers): string {
  return headers.get('x-user-name') ?? 'User';
}

export { parseRoles };

export function checkAction(
  headers: Headers,
  action: InvoiceAIAction,
): { allowed: boolean; roles: ReturnType<typeof parseRoles> } {
  const roles = parseRoles(headers);
  return { allowed: canPerform(roles, action), roles };
}

export {
  defaultInvoiceAIService,
  getInvoiceAIService,
  resetInvoiceAIServiceRegistry,
} from '../services/service-registry.js';
export { defaultERPService } from '../services/erp-service.js';
export { defaultAdminMetricsService } from '../admin/admin-service.js';
