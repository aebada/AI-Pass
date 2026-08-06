import type { MembershipTier } from '@ai-pass/shared';
import type { Framework, FrameworkCode } from '../types.js';
import { FRAMEWORK_CATALOG } from '../demo-data.js';
import { emitFrameworkActivated } from '../livesync.js';
import { canAccessComplianceAI, getFrameworkLimit } from '../membership-gates.js';
import { defaultWorkflowIntegration } from '../workflow-integration.js';
import { ALL_FRAMEWORK_CODES, ComplianceStore, newId } from './store.js';
import type { AuditService } from './audit-service.js';

export class FrameworkService {
  constructor(
    private store: ComplianceStore,
    private audit: AuditService,
  ) {}

  listCatalog(): typeof FRAMEWORK_CATALOG {
    return FRAMEWORK_CATALOG;
  }

  list(tenantId: string): Framework[] {
    return this.store.listByTenant(this.store.frameworks, tenantId);
  }

  get(id: string): Framework | undefined {
    return this.store.frameworks.get(id);
  }

  async activate(params: {
    tenantId: string;
    code: FrameworkCode;
    ownerId: string;
    ownerName: string;
    tier: MembershipTier;
    targetCertificationDate?: string;
  }): Promise<Framework> {
    if (!canAccessComplianceAI(params.tier)) {
      throw new Error('Compliance AI requires Professional plan or higher');
    }
    const active = this.list(params.tenantId).filter((f) => f.active);
    if (active.length >= getFrameworkLimit(params.tier)) {
      throw new Error('Framework limit reached for current plan');
    }

    const catalog = FRAMEWORK_CATALOG.find((f) => f.code === params.code);
    if (!catalog) throw new Error(`Unknown framework: ${params.code}`);

    const existing = this.list(params.tenantId).find((f) => f.code === params.code);
    if (existing?.active) return existing;

    const now = new Date().toISOString();
    const framework: Framework = {
      id: existing?.id ?? newId('fw'),
      tenantId: params.tenantId,
      ...catalog,
      active: true,
      ownerId: params.ownerId,
      ownerName: params.ownerName,
      activatedAt: now,
      targetCertificationDate: params.targetCertificationDate,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    this.store.frameworks.set(framework.id, framework);
    this.audit.log({
      tenantId: params.tenantId,
      entityType: 'framework',
      entityId: framework.id,
      action: 'framework.activated',
      actorId: params.ownerId,
      actorName: params.ownerName,
      details: { code: params.code },
    });

    await emitFrameworkActivated(framework);
    await defaultWorkflowIntegration.triggerFrameworkActivation(framework.id, params.tenantId);
    return framework;
  }

  getControlMapping(controlRef: string, sourceCode: FrameworkCode): { frameworkCode: FrameworkCode; controlRef: string }[] {
    const controls = [...this.store.controls.values()].filter((c) => c.controlRef === controlRef && c.frameworkCode === sourceCode);
    return controls.flatMap((c) => c.mappedControlRefs);
  }

  supportedCodes(): FrameworkCode[] {
    return ALL_FRAMEWORK_CODES;
  }
}

