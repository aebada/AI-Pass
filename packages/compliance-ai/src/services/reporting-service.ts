import type { ComplianceReport, ReportFormat } from '../types.js';
import { canAccessEnterpriseCompliance } from '../membership-gates.js';
import type { MembershipTier } from '@ai-pass/shared';
import { ComplianceStore, newId } from './store.js';
import type { FrameworkService } from './framework-service.js';
import type { RiskService } from './risk-service.js';
import type { VendorService } from './vendor-service.js';
import type { PolicyService } from './policy-service.js';
import type { EvidenceService } from './evidence-service.js';
import type { EmployeeComplianceService } from './employee-compliance-service.js';

export class ReportingService {
  constructor(
    private store: ComplianceStore,
    private frameworks: FrameworkService,
    private risks: RiskService,
    private vendors: VendorService,
    private policies: PolicyService,
    private evidence: EvidenceService,
    private employees: EmployeeComplianceService,
  ) {}

  list(tenantId: string): ComplianceReport[] {
    return this.generateAll(tenantId);
  }

  generate(params: {
    tenantId: string;
    type: ComplianceReport['type'];
    format?: ReportFormat;
    tier: MembershipTier;
  }): ComplianceReport {
    if (params.type === 'audit_evidence' && !canAccessEnterpriseCompliance(params.tier)) {
      throw new Error('Audit evidence packages require Enterprise plan');
    }
    const reports = this.generateAll(params.tenantId);
    const report = reports.find((r) => r.type === params.type) ?? reports[0]!;
    if (params.format) {
      return { ...report, format: params.format, exportUrl: this.stubExportUrl(report.id, params.format) };
    }
    return report;
  }

  private generateAll(tenantId: string): ComplianceReport[] {
    const now = new Date().toISOString();
    const frameworks = this.frameworks.list(tenantId);
    const risks = this.risks.list(tenantId);
    const vendors = this.vendors.list(tenantId);
    const policies = this.policies.list(tenantId);
    const evidence = this.evidence.list(tenantId);
    const employees = this.employees.list(tenantId);
    const aiSystems = [...this.store.aiSystems.values()].filter((s) => s.tenantId === tenantId);

    const types: ComplianceReport['type'][] = [
      'compliance_summary',
      'executive_dashboard',
      'risk_register',
      'vendor_risk',
      'policy_acceptance',
      'audit_evidence',
      'employee_compliance',
      'ai_governance',
    ];

    return types.map((type) => ({
      id: newId('rpt'),
      tenantId,
      type,
      title: type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      generatedAt: now,
      format: 'json' as ReportFormat,
      data: this.reportData(type, { frameworks, risks, vendors, policies, evidence, employees, aiSystems }),
      exportUrl: this.stubExportUrl(type, 'pdf'),
    }));
  }

  private reportData(
    type: ComplianceReport['type'],
    ctx: {
      frameworks: ReturnType<FrameworkService['list']>;
      risks: ReturnType<RiskService['list']>;
      vendors: ReturnType<VendorService['list']>;
      policies: ReturnType<PolicyService['list']>;
      evidence: ReturnType<EvidenceService['list']>;
      employees: ReturnType<EmployeeComplianceService['list']>;
      aiSystems: { id: string; name: string; complianceStatus: string }[];
    },
  ): Record<string, unknown> {
    switch (type) {
      case 'compliance_summary':
        return { frameworks: ctx.frameworks.length, avgProgress: ctx.frameworks.reduce((s, f) => s + f.progress, 0) / (ctx.frameworks.length || 1) };
      case 'executive_dashboard':
        return { score: 72, openRisks: ctx.risks.filter((r) => r.status === 'open').length, vendors: ctx.vendors.length };
      case 'risk_register':
        return { risks: ctx.risks.map((r) => ({ id: r.id, title: r.title, score: r.riskScore, severity: r.severity })) };
      case 'vendor_risk':
        return { vendors: ctx.vendors.map((v) => ({ name: v.name, riskClass: v.riskClass, status: v.status })) };
      case 'policy_acceptance':
        return { policies: ctx.policies.map((p) => ({ title: p.title, acceptanceRate: p.acceptanceRate })) };
      case 'audit_evidence':
        return { evidence: ctx.evidence.map((e) => ({ title: e.title, status: e.status, controls: e.controlIds })) };
      case 'employee_compliance':
        return { rate: this.employees.getComplianceRate(ctx.employees[0]?.tenantId ?? ''), employees: ctx.employees.length };
      case 'ai_governance':
        return { systems: ctx.aiSystems, iso42001Progress: ctx.frameworks.find((f) => f.code === 'ISO_42001')?.progress };
      default:
        return {};
    }
  }

  private stubExportUrl(id: string, format: ReportFormat): string {
    return `/api/v1/compliance-ai/reports/${id}/export?format=${format}`;
  }
}
