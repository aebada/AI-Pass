import { createId } from '@ai-pass/shared';
import type { TrustScorecard } from '@ai-pass/shared';
import type { AISystem, Certification, RiskAssessment, TrustReport } from './types.js';

export type ReportFormat = 'pdf' | 'json' | 'html' | 'csv';

export interface ExportResult {
  format: ReportFormat;
  content: string;
  filename: string;
  mimeType: string;
}

export class ReportingService {
  private reports = new Map<string, TrustReport>();

  generateExecutiveSummary(system: AISystem, cert?: Certification, scorecard?: TrustScorecard): TrustReport {
    const report: TrustReport = {
      id: `rpt_${createId()}`,
      systemId: system.id,
      type: 'executive',
      title: `Executive Trust Summary — ${system.productName}`,
      generatedAt: new Date().toISOString(),
      sections: [
        {
          heading: 'Overview',
          content: `${system.productName} by ${system.companyName} has been evaluated across functional, reliability, explainability, compliance, and safety dimensions.`,
          score: scorecard?.overall,
        },
        {
          heading: 'Certification Status',
          content: cert
            ? `AI-Pass ${cert.level.toUpperCase()} certified until ${new Date(cert.validUntil).toLocaleDateString()}.`
            : 'Not currently certified.',
        },
        {
          heading: 'Key Findings',
          content: scorecard
            ? `Overall trust score: ${scorecard.overall}/100. Strongest dimension: functional (${scorecard.functional}).`
            : 'Validation pending.',
        },
      ],
      recommendations: cert
        ? ['Maintain monitoring cadence', 'Schedule renewal before expiry']
        : ['Complete validation run', 'Address remediation items before certification'],
    };
    this.reports.set(report.id, report);
    return report;
  }

  generateTechnicalReport(system: AISystem, scorecard: TrustScorecard): TrustReport {
    const report: TrustReport = {
      id: `rpt_${createId()}`,
      systemId: system.id,
      type: 'technical',
      title: `Technical Validation Report — ${system.productName}`,
      generatedAt: new Date().toISOString(),
      sections: [
        { heading: 'Functional', content: 'Test suite execution results and pass rates.', score: scorecard.functional },
        { heading: 'Reliability', content: 'Consistency metrics across repeated runs.', score: scorecard.reliability },
        { heading: 'Explainability', content: 'Citation coverage and decision transparency.', score: scorecard.explainability },
        { heading: 'Compliance', content: 'Policy alignment and control mapping.', score: scorecard.compliance },
        { heading: 'Safety', content: 'Hallucination rate and guardrail effectiveness.', score: scorecard.safety },
      ],
      recommendations: [],
    };
    this.reports.set(report.id, report);
    return report;
  }

  generateRiskAnalysis(assessment: RiskAssessment): TrustReport {
    const report: TrustReport = {
      id: `rpt_${createId()}`,
      systemId: assessment.systemId,
      type: 'risk',
      title: 'Risk Analysis Report',
      generatedAt: new Date().toISOString(),
      sections: assessment.factors.map((f) => ({
        heading: f.name,
        content: f.description,
        score: f.score,
      })),
      recommendations: assessment.recommendations,
    };
    this.reports.set(report.id, report);
    return report;
  }

  generateComplianceSummary(systemId: string, frameworks: RiskAssessment['complianceFrameworks']): TrustReport {
    const report: TrustReport = {
      id: `rpt_${createId()}`,
      systemId,
      type: 'compliance',
      title: 'Compliance Framework Summary',
      generatedAt: new Date().toISOString(),
      sections: frameworks.map((f) => ({
        heading: f.framework.replace('_', ' '),
        content: `${f.controlsPassed}/${f.controlsTotal} controls passed. Status: ${f.status}.`,
        score: Math.round((f.controlsPassed / f.controlsTotal) * 100),
      })),
      recommendations: frameworks
        .filter((f) => f.status !== 'compliant')
        .map((f) => `Address gaps in ${f.framework}`),
    };
    this.reports.set(report.id, report);
    return report;
  }

  export(reportId: string, format: ReportFormat): ExportResult | undefined {
    const report = this.reports.get(reportId);
    if (!report) return undefined;

    const base = report.title.replace(/\s+/g, '_').toLowerCase();
    switch (format) {
      case 'json':
        return { format, content: JSON.stringify(report, null, 2), filename: `${base}.json`, mimeType: 'application/json' };
      case 'html':
        return {
          format,
          content: `<html><body><h1>${report.title}</h1>${report.sections.map((s) => `<h2>${s.heading}</h2><p>${s.content}</p>`).join('')}</body></html>`,
          filename: `${base}.html`,
          mimeType: 'text/html',
        };
      case 'csv':
        return {
          format,
          content: `heading,content,score\n${report.sections.map((s) => `"${s.heading}","${s.content}",${s.score ?? ''}`).join('\n')}`,
          filename: `${base}.csv`,
          mimeType: 'text/csv',
        };
      case 'pdf':
        return {
          format,
          content: `%PDF-1.4 stub\n% ${report.title}\n% Generated ${report.generatedAt}`,
          filename: `${base}.pdf`,
          mimeType: 'application/pdf',
        };
    }
  }

  list(systemId?: string): TrustReport[] {
    const all = [...this.reports.values()];
    return systemId ? all.filter((r) => r.systemId === systemId) : all;
  }
}
