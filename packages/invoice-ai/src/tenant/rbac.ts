import type { InvoiceAIPermission, InvoiceAIRole } from './types.js';
import { hasPermission } from './tenant-context.js';

export type InvoiceAIAction =
  | 'invoice.read'
  | 'invoice.upload'
  | 'invoice.approve'
  | 'invoice.reject'
  | 'invoice.validate'
  | 'fraud.read'
  | 'workflow.read'
  | 'workflow.run'
  | 'chat.use'
  | 'export.run'
  | 'admin.read'
  | 'admin.manage';

const ACTION_PERMISSIONS: Record<InvoiceAIAction, InvoiceAIPermission> = {
  'invoice.read': 'invoice:read',
  'invoice.upload': 'invoice:upload',
  'invoice.approve': 'invoice:approve',
  'invoice.reject': 'invoice:reject',
  'invoice.validate': 'invoice:upload',
  'fraud.read': 'fraud:read',
  'workflow.read': 'workflow:read',
  'workflow.run': 'workflow:manage',
  'chat.use': 'chat:use',
  'export.run': 'export:run',
  'admin.read': 'admin:read',
  'admin.manage': 'admin:manage',
};

const VALID_ROLES = new Set<string>([
  'platform_admin',
  'tenant_admin',
  'finance_manager',
  'approver',
  'accountant',
  'auditor',
  'viewer',
]);

export function parseRoles(headers: Headers): InvoiceAIRole[] {
  const raw =
    headers.get('x-user-roles') ??
    headers.get('x-role') ??
    headers.get('x-roles') ??
    'finance_manager';

  const roles = raw
    .split(',')
    .map((r) => r.trim())
    .filter((r): r is InvoiceAIRole => VALID_ROLES.has(r));

  return roles.length > 0 ? roles : ['finance_manager'];
}

export function canPerform(roles: InvoiceAIRole[], action: InvoiceAIAction): boolean {
  const permission = ACTION_PERMISSIONS[action];
  return hasPermission(roles, permission);
}

export function assertCanPerform(roles: InvoiceAIRole[], action: InvoiceAIAction): void {
  if (!canPerform(roles, action)) {
    throw new Error(`Forbidden: action "${action}" requires role with ${ACTION_PERMISSIONS[action]} permission`);
  }
}
