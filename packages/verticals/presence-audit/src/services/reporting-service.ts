import { createId, type AuditRun, type Company, type Competitor, type OptimizationRecommendation, type PresenceScore, type Report, type ReportFormat } from '@ai-pass/shared';

export class ReportingService {
  generateExecutiveSummary(
    company: Company,
    audit: AuditRun,
    recommendations: OptimizationRecommendation[],
  ): Report {
    return this.buildReport(company, 'executive', 'Executive Summary', audit.score, [
      { id: 's1', title: 'AI Presence Score', content: `Overall score: ${audit.score.overall}/100`, metrics: { overall: audit.score.overall } },
      { id: 's2', title: 'Key Findings', content: `${audit.gaps.filter((g) => g.severity === 'critical').length} critical issues identified` },
      { id: 's3', title: 'Top Recommendations', content: recommendations.slice(0, 3).map((r) => r.title).join('; ') },
    ]);
  }

  generateProviderComparison(company: Company, audit: AuditRun): Report {
    const breakdown: Record<string, number> = {};
    for (const r of audit.responses) {
      breakdown[r.provider] = (breakdown[r.provider] ?? 0) + (r.companyMentioned ? 1 : 0);
    }
    return this.buildReport(company, 'provider_comparison', 'Provider Comparison', audit.score, [
      { id: 'pc1', title: 'Mentions by Provider', content: JSON.stringify(breakdown), metrics: breakdown as Record<string, number> },
    ]);
  }

  generateCompetitorReport(company: Company, competitors: Competitor[], score: PresenceScore): Report {
    return this.buildReport(company, 'competitor', 'Competitor Analysis', score, [
      { id: 'c1', title: 'Competitive Landscape', content: competitors.map((c) => `${c.name}: ${c.visibilityScore}% visibility`).join('\n') },
    ]);
  }

  exportStub(report: Report, format: ReportFormat): { format: ReportFormat; url: string; status: 'stub' } {
    return {
      format,
      url: `/api/v1/presence/reports/${report.id}/export?format=${format}`,
      status: 'stub',
    };
  }

  private buildReport(
    company: Company,
    type: Report['type'],
    title: string,
    score: PresenceScore,
    sections: Report['sections'],
  ): Report {
    return {
      id: `report_${createId()}`,
      companyId: company.id,
      type,
      title,
      format: 'json',
      generatedAt: new Date().toISOString(),
      summary: `${title} for ${company.name} — AI Presence Score ${score.overall}`,
      sections,
    };
  }
}
