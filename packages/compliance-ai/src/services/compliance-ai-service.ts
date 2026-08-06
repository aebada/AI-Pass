import type { DashboardResponse } from '../api-types.js';
import {
  DEMO_AI_SYSTEMS,
  DEMO_AI_USE_CASES,
  DEMO_AUDIT_LOGS,
  DEMO_CONTROLS,
  DEMO_EMPLOYEES,
  DEMO_EVIDENCE,
  DEMO_FRAMEWORKS,
  DEMO_POLICIES,
  DEMO_RISKS,
  DEMO_TASKS,
  DEMO_TRUST_CENTER,
  DEMO_VENDORS,
  getDashboardStats,
} from '../demo-data.js';
import { AuditService } from './audit-service.js';
import { ControlService, TaskService } from './control-service.js';
import { CopilotService } from './copilot-service.js';
import { EmployeeComplianceService } from './employee-compliance-service.js';
import { EvidenceService } from './evidence-service.js';
import { FrameworkService } from './framework-service.js';
import { PolicyService } from './policy-service.js';
import { ReportingService } from './reporting-service.js';
import { RiskService } from './risk-service.js';
import { ComplianceStore } from './store.js';
import { TrustCenterService } from './trust-center-service.js';
import { VendorService } from './vendor-service.js';

export class ComplianceAIService {
  readonly store = new ComplianceStore();
  readonly audit: AuditService;
  readonly frameworks: FrameworkService;
  readonly controls: ControlService;
  readonly tasks: TaskService;
  readonly risks: RiskService;
  readonly vendors: VendorService;
  readonly employees: EmployeeComplianceService;
  readonly policies: PolicyService;
  readonly evidence: EvidenceService;
  readonly trustCenter: TrustCenterService;
  readonly copilot: CopilotService;
  readonly reporting: ReportingService;

  constructor(seedDemo = true) {
    this.audit = new AuditService(this.store);
    this.frameworks = new FrameworkService(this.store, this.audit);
    this.controls = new ControlService(this.store, this.audit);
    this.tasks = new TaskService(this.store);
    this.risks = new RiskService(this.store, this.audit);
    this.vendors = new VendorService(this.store, this.audit);
    this.employees = new EmployeeComplianceService(this.store);
    this.policies = new PolicyService(this.store, this.audit);
    this.evidence = new EvidenceService(this.store, this.audit);
    this.trustCenter = new TrustCenterService(this.store, this.audit, this.frameworks);
    this.copilot = new CopilotService(this.store);
    this.reporting = new ReportingService(
      this.store,
      this.frameworks,
      this.risks,
      this.vendors,
      this.policies,
      this.evidence,
      this.employees,
    );

    if (seedDemo) {
      this.store.seed({
        frameworks: DEMO_FRAMEWORKS,
        controls: DEMO_CONTROLS,
        tasks: DEMO_TASKS,
        risks: DEMO_RISKS,
        vendors: DEMO_VENDORS,
        employees: DEMO_EMPLOYEES,
        policies: DEMO_POLICIES,
        evidence: DEMO_EVIDENCE,
        audits: DEMO_AUDIT_LOGS,
        trustCenter: DEMO_TRUST_CENTER,
        aiSystems: DEMO_AI_SYSTEMS,
        aiUseCases: DEMO_AI_USE_CASES,
      });
    }
  }

  getDashboard(tenantId: string): DashboardResponse {
    const frameworks = this.frameworks.list(tenantId);
    const risks = this.risks.list(tenantId);
    const evidence = this.evidence.list(tenantId);
    const vendors = this.vendors.list(tenantId);
    const employees = this.employees.list(tenantId);
    const trust = this.trustCenter.get(tenantId) ?? DEMO_TRUST_CENTER;

    return {
      dashboard: getDashboardStats(frameworks, risks, evidence, vendors, employees, trust),
      frameworks,
      recentRisks: risks.slice(0, 5),
      recentEvidence: evidence.slice(0, 5),
    };
  }

  listAISystems(tenantId: string) {
    return [...this.store.aiSystems.values()].filter((s) => s.tenantId === tenantId);
  }

  listAIUseCases(tenantId: string) {
    return [...this.store.aiUseCases.values()].filter((u) => u.tenantId === tenantId);
  }

  listTasks(tenantId: string) {
    return this.tasks.list(tenantId);
  }
}

export const defaultComplianceAIService = new ComplianceAIService();
