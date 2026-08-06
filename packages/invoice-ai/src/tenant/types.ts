export type InvoiceAIRole =
  | 'platform_admin'
  | 'tenant_admin'
  | 'finance_manager'
  | 'approver'
  | 'accountant'
  | 'auditor'
  | 'viewer';

export type InvoiceAIPermission =
  | 'invoice:read'
  | 'invoice:upload'
  | 'invoice:approve'
  | 'invoice:reject'
  | 'fraud:read'
  | 'fraud:manage'
  | 'compliance:read'
  | 'workflow:read'
  | 'workflow:manage'
  | 'admin:read'
  | 'admin:manage'
  | 'chat:use'
  | 'export:run';

export const ROLE_PERMISSIONS: Record<InvoiceAIRole, InvoiceAIPermission[]> = {
  platform_admin: [
    'invoice:read', 'invoice:upload', 'invoice:approve', 'invoice:reject',
    'fraud:read', 'fraud:manage', 'compliance:read', 'workflow:read', 'workflow:manage',
    'admin:read', 'admin:manage', 'chat:use', 'export:run',
  ],
  tenant_admin: [
    'invoice:read', 'invoice:upload', 'invoice:approve', 'invoice:reject',
    'fraud:read', 'fraud:manage', 'compliance:read', 'workflow:read', 'workflow:manage',
    'admin:read', 'chat:use', 'export:run',
  ],
  finance_manager: [
    'invoice:read', 'invoice:upload', 'invoice:approve', 'invoice:reject',
    'fraud:read', 'compliance:read', 'workflow:read', 'chat:use', 'export:run',
  ],
  approver: ['invoice:read', 'invoice:approve', 'invoice:reject', 'chat:use'],
  accountant: ['invoice:read', 'invoice:upload', 'compliance:read', 'chat:use', 'export:run'],
  auditor: ['invoice:read', 'fraud:read', 'compliance:read', 'export:run'],
  viewer: ['invoice:read', 'chat:use'],
};

export interface InvoiceAITenantContext {
  tenantId: string;
  tenantName: string;
  slug: string;
  plan: 'free' | 'professional' | 'power' | 'enterprise';
  region?: string;
  features: string[];
  roles: InvoiceAIRole[];
}
