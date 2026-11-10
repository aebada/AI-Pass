import type { TrustCenter } from '../types.js';
import { canAccessTrustCenter } from '../membership-gates.js';
import type { MembershipTier } from '@ai-pass/shared';
import { defaultTrustIntegration } from '../trust-integration.js';
import { defaultWorkflowIntegration } from '../workflow-integration.js';
import { ComplianceStore } from './store.js';
import type { AuditService } from './audit-service.js';
import type { FrameworkService } from './framework-service.js';

export class TrustCenterService {
  constructor(
    private store: ComplianceStore,
    private audit: AuditService,
    private frameworks: FrameworkService,
  ) {}

  get(tenantId: string): TrustCenter | undefined {
    return [...this.store.trustCenters.values()].find((t) => t.tenantId === tenantId);
  }

  getPublished(orgSlug: string): TrustCenter | undefined {
    return this.store.publishedTrustCenters.get(orgSlug);
  }

  preview(tenantId: string): TrustCenter {
    const existing = this.get(tenantId);
    if (existing) return existing;

    const frameworks = this.frameworks.list(tenantId).filter((f) => f.active);
    return {
      id: 'tc_preview',
      tenantId,
      orgSlug: 'preview',
      orgName: 'Preview',
      status: 'draft',
      frameworks: frameworks.map((f) => ({ code: f.code, status: `${f.progress}%`, progress: f.progress })),
      certifications: [],
      commitments: [],
      auditStatus: 'Not published',
      trustScore: 0,
      aiGovernanceSummary: '',
      updatedAt: new Date().toISOString(),
    };
  }

  async publish(params: {
    tenantId: string;
    orgSlug: string;
    orgName: string;
    actorId: string;
    actorName: string;
    tier: MembershipTier;
  }): Promise<{ trustCenter: TrustCenter; publicUrl: string }> {
    if (!canAccessTrustCenter(params.tier)) {
      throw new Error('Trust Center publishing requires Power plan or higher');
    }

    const frameworks = this.frameworks.list(params.tenantId).filter((f) => f.active);
    const risks = [...this.store.risks.values()].filter((r) => r.tenantId === params.tenantId);
    const evidence = [...this.store.evidence.values()].filter((e) => e.tenantId === params.tenantId);
    const trust = defaultTrustIntegration.computeComplianceTrustScore({
      frameworks,
      risks,
      evidenceValidated: evidence.filter((e) => e.status === 'validated').length,
      evidenceTotal: evidence.length,
    });

    const now = new Date().toISOString();
    const trustCenter: TrustCenter = {
      id: this.get(params.tenantId)?.id ?? 'tc_001',
      tenantId: params.tenantId,
      orgSlug: params.orgSlug,
      orgName: params.orgName,
      status: 'published',
      publishedAt: now,
      frameworks: frameworks.map((f) => ({ code: f.code, status: `In progress — ${f.progress}%`, progress: f.progress })),
      certifications: trust.certificationLevel
        ? [{ name: 'AI Pass Trust Certification', level: trust.certificationLevel, validUntil: new Date(Date.now() + 365 * 86400000).toISOString(), verificationUrl: `https://ai-pass.com/verify/${params.orgSlug}` }]
        : [],
      commitments: [
        { id: 'c1', title: 'Security commitments', description: 'Encryption, access control, and monitoring', category: 'security' },
        { id: 'c2', title: 'Privacy commitments', description: 'GDPR-aligned data handling', category: 'privacy' },
        { id: 'c3', title: 'AI governance', description: 'Responsible AI per ISO 42001', category: 'ai_governance' },
      ],
      auditStatus: 'Audit readiness tracked via Compliance AI',
      trustScore: trust.trustScore,
      aiGovernanceSummary: 'AI systems registered in governance inventory with ISO 42001 evidence tracking.',
      updatedAt: now,
    };

    this.store.trustCenters.set(trustCenter.id, trustCenter);
    this.store.publishedTrustCenters.set(params.orgSlug, trustCenter);

    this.audit.log({
      tenantId: params.tenantId,
      entityType: 'trust_center',
      entityId: trustCenter.id,
      action: 'trust_center.published',
      actorId: params.actorId,
      actorName: params.actorName,
      details: { orgSlug: params.orgSlug, trustScore: trust.trustScore },
    });

    await defaultWorkflowIntegration.triggerTrustCenterUpdate(params.tenantId);

    return {
      trustCenter,
      publicUrl: `/trust/${params.orgSlug}`,
    };
  }
}
