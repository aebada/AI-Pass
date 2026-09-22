import type {
  ComplianceMapping,
  ExportFormat,
  GovernanceReportRequest,
  Inventory,
  Risk,
} from '@ai-pass/shared';
import type { GovernancePolicy } from '@ai-pass/shared';
import type { AISystem } from '@ai-pass/shared';
import type { AuditLog } from '@ai-pass/shared';
import type { MonitoringEvent } from '@ai-pass/shared';

export interface ReportResult {
  type: GovernanceReportRequest['type'];
  format: ExportFormat;
  generatedAt: string;
  recordCount: number;
  data: unknown;
  exportStub: string;
}

export class ReportingService {
  constructor(
    private getInventory: () => Inventory,
    private getRisks: () => Risk[],
    private getPolicies: () => GovernancePolicy[],
    private getMappings: () => ComplianceMapping[],
    private getAuditLogs: () => AuditLog[],
    private getMonitoring: () => MonitoringEvent[],
    private getSystems: () => AISystem[],
  ) {}

  generate(request: GovernanceReportRequest): ReportResult {
    const generatedAt = new Date().toISOString();
    let data: unknown;
    let recordCount = 0;

    switch (request.type) {
      case 'inventory':
        data = this.getInventory();
        recordCount = (data as Inventory).totalCount;
        break;
      case 'risk':
        data = this.getRisks();
        recordCount = (data as Risk[]).length;
        break;
      case 'policy':
        data = this.getPolicies();
        recordCount = (data as GovernancePolicy[]).length;
        break;
      case 'compliance':
        data = this.getMappings();
        recordCount = (data as ComplianceMapping[]).length;
        break;
      case 'executive':
        data = this.executiveSummary();
        recordCount = 1;
        break;
      case 'certification':
        data = this.getSystems().filter((s) => s.certificationStatus);
        recordCount = (data as AISystem[]).length;
        break;
      case 'drift':
        data = this.getMonitoring().filter((e) => e.type === 'drift');
        recordCount = (data as MonitoringEvent[]).length;
        break;
      case 'audit':
        data = this.getAuditLogs();
        recordCount = (data as AuditLog[]).length;
        break;
    }

    return {
      type: request.type,
      format: request.format,
      generatedAt,
      recordCount,
      data,
      exportStub: `Export to ${request.format.toUpperCase()} — stub implementation`,
    };
  }

  private executiveSummary() {
    const inventory = this.getInventory();
    const risks = this.getRisks();
    const openRisks = risks.filter((r) => r.status === 'open').length;
    const compliant = inventory.systems.filter((s) => s.complianceStatus === 'compliant').length;
    return {
      totalSystems: inventory.totalCount,
      complianceRate: inventory.totalCount > 0 ? Math.round((compliant / inventory.totalCount) * 100) : 0,
      openRisks,
      highRiskSystems: inventory.byRisk.high + inventory.byRisk.critical,
      activePolicies: this.getPolicies().filter((p) => p.active).length,
    };
  }
}
