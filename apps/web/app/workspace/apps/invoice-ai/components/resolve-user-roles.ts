import type { InvoiceAIRole } from '@ai-pass/invoice-ai';
import type { UserProfile } from '../../../../components/premium/AppProviders';

const DEMO_EMAIL_ROLES: Record<string, InvoiceAIRole[]> = {
  'demo@example.com': ['finance_manager'],
  'david.park@acme.corp': ['tenant_admin', 'approver'],
  'maria.santos@acme.corp': ['accountant'],
  'alex.chen@acme.corp': ['auditor'],
  'sam.rivera@acme.corp': ['viewer'],
};

/** Resolve Invoice AI roles for the signed-in user (demo mapping + default). */
export function resolveInvoiceUserRoles(user: UserProfile | null): InvoiceAIRole[] {
  if (!user?.email) return ['finance_manager'];
  const normalized = user.email.toLowerCase();
  return DEMO_EMAIL_ROLES[normalized] ?? ['finance_manager'];
}

export function isControllerRole(roles: InvoiceAIRole[]): boolean {
  return roles.some((role) =>
    ['finance_manager', 'approver', 'tenant_admin', 'platform_admin'].includes(role),
  );
}
