import type { MembershipTier } from '@ai-pass/shared';
import type { Risk } from '../types.js';
import { emitRiskCreated } from '../livesync.js';
import { canAccessComplianceAI } from '../membership-gates.js';
import { defaultGovernanceIntegration } from '../governance-integration.js';
import { defaultWorkflowIntegration } from '../workflow-integration.js';
import { ComplianceStore, newId } from './store.js';
import type { AuditService } from './audit-service.js';

export class RiskService {
  constructor(
    private store: ComplianceStore,
    private audit: AuditService,
  ) {}

  list(tenantId: string, category?: Risk['category']): Risk[] {
    return this.store.listByTenant(this.store.risks, tenantId).filter(
      (r) => !category || r.category === category,
    );
  }

  get(id: string): Risk | undefined {
    return this.store.risks.get(id);
  }

  async create(params: {
    tenantId: string;
    title: string;
    description: string;
    category: Risk['category'];
    severity: Risk['severity'];
    likelihood: number;
    impact: number;
    ownerId: string;
    ownerName: string;
    mitigationPlan?: string;
    tier: MembershipTier;
    aiSystemId?: string;
    vendorId?: string;
  }): Promise<Risk> {
    if (!canAccessComplianceAI(params.tier)) {
      throw new Error('Compliance AI requires Professional plan or higher');
    }

    const now = new Date().toISOString();
    const risk: Risk = {
      id: newId('risk'),
      tenantId: params.tenantId,
      title: params.title,
      description: params.description,
      category: params.category,
      severity: params.severity,
      likelihood: params.likelihood,
      impact: params.impact,
      riskScore: params.likelihood * params.impact,
      ownerId: params.ownerId,
      ownerName: params.ownerName,
      controlIds: [],
      mitigationPlan: params.mitigationPlan ?? '',
      mitigationStatus: 'planned',
      reviewSchedule: 'quarterly',
      nextReviewAt: new Date(Date.now() + 90 * 86400000).toISOString(),
      aiSystemId: params.aiSystemId,
      vendorId: params.vendorId,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };

    if (params.aiSystemId) {
      const aiSystem = this.store.aiSystems.get(params.aiSystemId);
      if (aiSystem) {
        defaultGovernanceIntegration.evaluateAIAction({
          systemId: aiSystem.governanceSystemId,
          action: 'risk.created',
          context: { risk_level: params.severity, title: params.title },
        });
      }
    }

    this.store.risks.set(risk.id, risk);
    this.audit.log({
      tenantId: params.tenantId,
      entityType: 'risk',
      entityId: risk.id,
      action: 'risk.created',
      actorId: params.ownerId,
      actorName: params.ownerName,
      details: { severity: params.severity, category: params.category },
    });

    await emitRiskCreated(risk);
    await defaultWorkflowIntegration.triggerRiskReview(risk.id, params.tenantId);
    return risk;
  }

  listByCategory(tenantId: string): Record<Risk['category'], Risk[]> {
    const risks = this.list(tenantId);
    const categories: Risk['category'][] = ['security', 'ai', 'privacy', 'vendor', 'operational', 'compliance'];
    return Object.fromEntries(categories.map((c) => [c, risks.filter((r) => r.category === c)])) as Record<Risk['category'], Risk[]>;
  }
}
