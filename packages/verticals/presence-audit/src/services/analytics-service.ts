import type { AIProvider, Analytics, AuditRun, OptimizationRecommendation } from '@ai-pass/shared';

export class AnalyticsService {
  compute(
    companyId: string,
    audits: AuditRun[],
    recommendations: OptimizationRecommendation[],
  ): Analytics {
    const completed = audits.filter((a) => a.status === 'completed');
    const scores = completed.map((a) => a.score.overall);
    const avgPresenceScore = scores.length
      ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
      : 0;

    const providerBreakdown: Record<AIProvider, number> = {
      openai: 0,
      anthropic: 0,
      google: 0,
      perplexity: 0,
    };
    const latest = completed[completed.length - 1];
    if (latest) {
      for (const r of latest.responses) {
        if (r.companyMentioned) providerBreakdown[r.provider]++;
      }
    }

    const done = recommendations.filter((r) => r.status === 'done').length;
    const optimizationProgress = recommendations.length
      ? Math.round((done / recommendations.length) * 100)
      : 0;

    return {
      companyId,
      period: '30d',
      auditCount: completed.length,
      avgPresenceScore,
      visibilityTrend: completed.map((a) => a.score.visibility),
      recommendationTrend: completed.map((a) => a.score.recommendation),
      providerBreakdown,
      topOpportunities: recommendations.filter((r) => r.impact === 'high').map((r) => r.title).slice(0, 5),
      criticalIssueCount: latest?.gaps.filter((g) => g.severity === 'critical').length ?? 0,
      optimizationProgress,
    };
  }
}
