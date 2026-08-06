import type {
  AISystem,
  ComplianceMapping,
  GovernanceDashboard,
  GovernanceEvaluation,
  GovernanceLifecycleStage,
} from '@ai-pass/shared';
import { ApprovalService } from './approval-service.js';
import { AuditService } from './audit-service.js';
import { InventoryService } from './inventory-service.js';
import { MonitoringService } from './monitoring-service.js';
import { NotificationService } from './notification-service.js';
import { PolicyEnforcementEngine } from './policy-enforcement-engine.js';
import { PolicyService } from './policy-service.js';
import { ReportingService } from './reporting-service.js';
import { RiskService } from './risk-service.js';
import {
  SEED_APPROVALS,
  SEED_COMPLIANCE_MAPPINGS,
  SEED_MONITORING,
  SEED_POLICIES,
  SEED_RISKS,
  SEED_SYSTEMS,
} from './seed-data.js';
import { WorkflowEngine } from './workflow-engine.js';

export interface GovernanceServiceOptions {
  seed?: boolean;
}

export class GovernanceService {
  readonly inventory = new InventoryService();
  readonly policies = new PolicyService();
  readonly enforcement: PolicyEnforcementEngine;
  readonly risks = new RiskService();
  readonly approvals = new ApprovalService();
  readonly monitoring = new MonitoringService();
  readonly audit = new AuditService();
  readonly notifications = new NotificationService();
  readonly workflow = new WorkflowEngine();
  readonly reporting: ReportingService;

  private complianceMappings: ComplianceMapping[] = [];

  constructor(options: GovernanceServiceOptions = { seed: true }) {
    this.enforcement = new PolicyEnforcementEngine(() => this.policies.getActive());
    this.reporting = new ReportingService(
      () => this.inventory.getInventory(),
      () => this.risks.list(),
      () => this.policies.list(),
      () => this.complianceMappings,
      () => this.audit.list(),
      () => this.monitoring.list(),
      () => this.inventory.list(),
    );

    if (options.seed !== false) this.loadSeedData();
  }

  private loadSeedData(): void {
    this.inventory.seed(SEED_SYSTEMS);
    this.policies.seed(SEED_POLICIES);
    this.risks.seed(SEED_RISKS);
    this.approvals.seed(SEED_APPROVALS);
    this.monitoring.seed(SEED_MONITORING);
    this.complianceMappings = [...SEED_COMPLIANCE_MAPPINGS];
  }

  // ── Central orchestration ──────────────────────────────────────────────────

  registerSystem(data: Omit<AISystem, 'id' | 'createdAt' | 'updatedAt' | 'lifecycleStage'>): AISystem {
    const system = this.inventory.register({
      ...data,
      lifecycleStage: 'registration',
    });
    this.audit.record({
      actorId: data.ownerId,
      action: 'system.registered',
      resourceType: 'system',
      resourceId: system.id,
      details: { name: system.name, type: system.type },
    });
    this.notifications.send({
      channel: 'in_app',
      recipientId: 'governance-officers',
      subject: `New AI system registered: ${system.name}`,
      body: `System ${system.name} requires risk assessment.`,
      eventType: 'system_registered',
    });
    return system;
  }

  advanceLifecycle(systemId: string, stage: GovernanceLifecycleStage): AISystem | undefined {
    const system = this.inventory.get(systemId);
    if (!system) return undefined;
    const next = this.workflow.advance(system, stage) ?? stage;
    return this.inventory.update(systemId, { lifecycleStage: next });
  }

  evaluateAndEnforce(params: {
    systemId: string;
    action: string;
    context: Record<string, unknown>;
    modelId?: string;
    prompt?: string;
    confidence?: number;
  }): GovernanceEvaluation {
    const system = this.inventory.get(params.systemId);
    const evaluation = this.enforcement.evaluate({
      ...params,
      systemType: system?.type,
    });

    this.audit.record({
      actorId: 'system',
      action: `policy.${evaluation.decision}`,
      resourceType: 'system',
      resourceId: params.systemId,
      details: { evaluation, action: params.action },
    });

    if (!evaluation.allowed) {
      this.monitoring.record({
        systemId: params.systemId,
        type: 'policy_violation',
        severity: evaluation.decision === 'block' ? 'critical' : 'high',
        title: `Policy ${evaluation.decision}: ${evaluation.violations.join(', ')}`,
        details: { violations: evaluation.violations, action: params.action },
      });

      if (evaluation.requiresHumanApproval) {
        this.approvals.request({
          systemId: params.systemId,
          type: 'manual',
          requestedBy: 'system',
          reason: evaluation.violations.join('; ') || params.action,
          priority: evaluation.decision === 'block' ? 'critical' : 'high',
        });
      }
    }

    return evaluation;
  }

  processApproval(approvalId: string, action: 'approve' | 'reject' | 'escalate' | 'override', actorId: string): void {
    switch (action) {
      case 'approve':
        this.approvals.approve(approvalId, actorId);
        break;
      case 'reject':
        this.approvals.reject(approvalId, actorId);
        break;
      case 'escalate':
        this.approvals.escalate(approvalId, 'governance-committee');
        break;
      case 'override':
        this.approvals.override(approvalId, actorId, 'Governance override approved');
        break;
    }
    this.audit.record({
      actorId,
      action: `approval.${action}`,
      resourceType: 'approval',
      resourceId: approvalId,
      details: { action },
    });
  }

  recordMonitoringEvent(params: Omit<import('@ai-pass/shared').MonitoringEvent, 'id' | 'acknowledged' | 'timestamp'>): void {
    const event = this.monitoring.record(params);
    this.audit.record({
      actorId: 'system',
      action: 'monitoring.event',
      resourceType: 'monitoring',
      resourceId: event.id,
      details: { type: event.type, severity: event.severity },
    });
  }

  getDashboard(): GovernanceDashboard {
    const inventory = this.inventory.getInventory();
    const alerts = this.monitoring.listAlerts();
    const pending = this.approvals.listPending();
    const compliant = inventory.systems.filter((s) => s.complianceStatus === 'compliant').length;

    return {
      systemCount: inventory.totalCount,
      highRiskCount: inventory.byRisk.high + inventory.byRisk.critical,
      pendingApprovals: pending.length,
      activeViolations: alerts.filter((a) => a.type === 'policy_violation').length,
      certifiedCount: inventory.systems.filter((s) => s.certificationStatus).length,
      driftAlerts: this.monitoring.listDrift().length,
      monitoringActive: inventory.systems.filter((s) => s.monitoringStatus === 'active').length,
      complianceRate: inventory.totalCount > 0 ? Math.round((compliant / inventory.totalCount) * 100) : 0,
      riskDistribution: this.risks.getDistribution(),
      recentEvents: this.monitoring.list().slice(0, 5),
    };
  }

  getComplianceMappings(): ComplianceMapping[] {
    return [...this.complianceMappings];
  }

  // ── Integration hooks ──────────────────────────────────────────────────────

  /** Trust Engine: trigger validation and update trust score */
  onTrustValidation(systemId: string, trustScore: number, certificationLevel?: AISystem['certificationStatus']): void {
    this.inventory.update(systemId, { trustScore, certificationStatus: certificationLevel });
    if (trustScore < 70) {
      this.monitoring.record({
        systemId,
        type: 'confidence_low',
        severity: 'high',
        title: 'Trust score below threshold',
        details: { trustScore, threshold: 70 },
        recommendation: 'Schedule revalidation and risk review',
      });
    }
    this.advanceLifecycle(systemId, 'certification');
  }

  /** LiveSync: handle platform events */
  async onLiveSyncEvent(params: {
    type: string;
    severity: string;
    systemId: string;
    details: Record<string, unknown>;
  }): Promise<{ escalated: boolean; approvalId?: string }> {
    const evaluation = this.evaluateAndEnforce({
      systemId: params.systemId,
      action: params.type,
      context: { ...params.details, risk_level: params.severity },
    });

    if (!evaluation.allowed) {
      const approval = this.approvals.listPending().find((a) => a.systemId === params.systemId);
      return { escalated: true, approvalId: approval?.id };
    }
    return { escalated: false };
  }

  /** Provider Hub: block or route models based on policy */
  routeModel(modelId: string, systemType?: AISystem['type']): GovernanceEvaluation {
    return this.enforcement.isModelAllowed(modelId, systemType);
  }

  /** Marketplace: check if install requires approval */
  checkMarketplaceInstall(appId: string, userId: string): { allowed: boolean; requiresApproval: boolean; reason?: string } {
    const evaluation = this.evaluateAndEnforce({
      systemId: appId,
      action: 'marketplace.install',
      context: { risk_level: 'medium', app_id: appId },
    });
    return {
      allowed: evaluation.allowed,
      requiresApproval: evaluation.requiresHumanApproval,
      reason: evaluation.violations.join('; ') || undefined,
    };
  }

  /** Wallet: record governance usage (stub) */
  recordGovernanceUsage(userId: string, operation: string, credits: number): void {
    this.audit.record({
      actorId: userId,
      action: 'wallet.governance_usage',
      resourceType: 'report',
      resourceId: operation,
      details: { credits, operation },
    });
  }
}

let _default: GovernanceService | undefined;

export function getGovernanceService(): GovernanceService {
  if (!_default) _default = new GovernanceService();
  return _default;
}

export function resetGovernanceService(): void {
  _default = undefined;
}

export function createGovernancePlatform(): GovernanceService {
  return getGovernanceService();
}
