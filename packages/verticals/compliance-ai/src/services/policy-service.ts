import type { Policy, PolicyVersion } from '../types.js';
import { emitPolicyUpdated } from '../livesync.js';
import { defaultWorkflowIntegration } from '../workflow-integration.js';
import { ComplianceStore, newId } from './store.js';
import type { AuditService } from './audit-service.js';

export const POLICY_TEMPLATES: Record<NonNullable<Policy['templateType']>, string> = {
  ai_governance: 'Responsible AI development, deployment, and monitoring standards...',
  security: 'Organization-wide information security requirements and controls...',
  privacy: 'Data protection, privacy rights, and lawful processing procedures...',
  acceptable_use: 'Acceptable use of company IT resources and systems...',
  data_retention: 'Data retention schedules and secure deletion procedures...',
  incident_response: 'Security incident classification, response, and notification...',
};

export class PolicyService {
  constructor(
    private store: ComplianceStore,
    private audit: AuditService,
  ) {}

  list(tenantId: string): Policy[] {
    return this.store.listByTenant(this.store.policies, tenantId);
  }

  get(id: string): Policy | undefined {
    return this.store.policies.get(id);
  }

  getTemplates(): typeof POLICY_TEMPLATES {
    return POLICY_TEMPLATES;
  }

  async create(params: {
    tenantId: string;
    title: string;
    templateType?: Policy['templateType'];
    content: string;
    ownerId: string;
    ownerName: string;
    frameworkCodes?: Policy['frameworkCodes'];
  }): Promise<Policy> {
    const now = new Date().toISOString();
    const policyId = newId('pol');
    const versionId = newId('pv');
    const version: PolicyVersion = {
      id: versionId,
      policyId,
      version: 1,
      content: params.content,
      status: 'draft',
      changeSummary: 'Initial draft',
      createdAt: now,
    };
    const policy: Policy = {
      id: policyId,
      tenantId: params.tenantId,
      title: params.title,
      templateType: params.templateType,
      status: 'draft',
      currentVersionId: versionId,
      versions: [version],
      ownerId: params.ownerId,
      ownerName: params.ownerName,
      acceptanceRequired: true,
      acceptanceRate: 0,
      frameworkCodes: params.frameworkCodes ?? [],
      createdAt: now,
      updatedAt: now,
    };
    this.store.policies.set(policy.id, policy);
    return policy;
  }

  async approve(policyId: string, _approverId: string, approverName: string): Promise<Policy> {
    const policy = this.store.policies.get(policyId);
    if (!policy) throw new Error('Policy not found');
    const now = new Date().toISOString();
    const versions = policy.versions.map((v) =>
      v.id === policy.currentVersionId ? { ...v, status: 'approved' as const, approvedBy: approverName, approvedAt: now } : v,
    );
    const updated: Policy = { ...policy, versions, status: 'approved', updatedAt: now };
    this.store.policies.set(policyId, updated);
    await defaultWorkflowIntegration.triggerPolicyApproval(policyId, policy.tenantId);
    return updated;
  }

  async publish(policyId: string, actorId: string, actorName: string): Promise<Policy> {
    const policy = this.store.policies.get(policyId);
    if (!policy) throw new Error('Policy not found');
    const now = new Date().toISOString();
    const versions = policy.versions.map((v) =>
      v.id === policy.currentVersionId ? { ...v, status: 'published' as const, publishedAt: now } : v,
    );
    const updated: Policy = { ...policy, versions, status: 'published', updatedAt: now };
    this.store.policies.set(policyId, updated);
    this.audit.log({
      tenantId: policy.tenantId,
      entityType: 'policy',
      entityId: policyId,
      action: 'policy.published',
      actorId,
      actorName,
      details: { version: policy.versions.find((v) => v.id === policy.currentVersionId)?.version },
    });
    await emitPolicyUpdated(updated);
    return updated;
  }
}
