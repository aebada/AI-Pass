import type { Vendor, VendorIntegrationStub } from '../types.js';
import { emitVendorAdded } from '../livesync.js';
import { defaultWorkflowIntegration } from '../workflow-integration.js';
import { ComplianceStore, newId } from './store.js';
import type { AuditService } from './audit-service.js';

export const VENDOR_INTEGRATIONS: VendorIntegrationStub[] = [
  { provider: 'google_workspace', status: 'stub', description: 'Sync users and groups for access reviews' },
  { provider: 'm365', status: 'stub', description: 'Microsoft 365 identity and compliance data' },
  { provider: 'jira', status: 'available', description: 'Track compliance tasks and remediation' },
  { provider: 'github', status: 'stub', description: 'Repository security posture' },
  { provider: 'personio', status: 'available', description: 'HR onboarding/offboarding sync' },
  { provider: 'bamboohr', status: 'stub', description: 'Employee records and training' },
  { provider: 'aws', status: 'available', description: 'Cloud security configuration evidence' },
  { provider: 'azure', status: 'stub', description: 'Azure compliance and security center' },
  { provider: 'gcp', status: 'stub', description: 'GCP security command center' },
];

export class VendorService {
  constructor(
    private store: ComplianceStore,
    private audit: AuditService,
  ) {}

  list(tenantId: string): Vendor[] {
    return this.store.listByTenant(this.store.vendors, tenantId);
  }

  get(id: string): Vendor | undefined {
    return this.store.vendors.get(id);
  }

  listIntegrations(): VendorIntegrationStub[] {
    return VENDOR_INTEGRATIONS;
  }

  async create(params: {
    tenantId: string;
    name: string;
    category: string;
    riskClass?: Vendor['riskClass'];
    dataAccess?: boolean;
    contactEmail: string;
    actorId: string;
    actorName: string;
  }): Promise<Vendor> {
    const now = new Date().toISOString();
    const vendor: Vendor = {
      id: newId('vnd'),
      tenantId: params.tenantId,
      name: params.name,
      category: params.category,
      riskClass: params.riskClass ?? 'medium',
      dataAccess: params.dataAccess ?? false,
      criticality: 'medium',
      questionnaireStatus: 'not_sent',
      contactEmail: params.contactEmail,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    this.store.vendors.set(vendor.id, vendor);
    this.audit.log({
      tenantId: params.tenantId,
      entityType: 'vendor',
      entityId: vendor.id,
      action: 'vendor.created',
      actorId: params.actorId,
      actorName: params.actorName,
      details: { name: params.name, riskClass: vendor.riskClass },
    });

    await emitVendorAdded(vendor);
    await defaultWorkflowIntegration.triggerVendorReview(vendor.id, params.tenantId);
    return vendor;
  }

  getHighRisk(tenantId: string): Vendor[] {
    return this.list(tenantId).filter((v) => v.riskClass === 'high' || v.riskClass === 'critical');
  }
}
