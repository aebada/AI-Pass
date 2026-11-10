import { createId, type AuditQuery, type AuditReport, type CompanyProfile, type OptimizationRecommendation, type PresenceIssue, type PresenceScore, type ProviderResponse } from '@ai-pass/shared';

export const DEFAULT_PROMPTS: Omit<AuditQuery, 'id'>[] = [
  { prompt: 'Best platforms for {use_case}', language: 'en', category: 'discovery' },
  { prompt: 'Top companies in {industry}', language: 'en', category: 'ranking' },
  { prompt: 'Alternatives to {competitor}', language: 'en', category: 'competitive' },
];

export class QueryEngine {
  buildQueries(profile: CompanyProfile): AuditQuery[] {
    return DEFAULT_PROMPTS.map((p) => ({
      ...p,
      id: `q_${createId()}`,
      prompt: p.prompt
        .replace('{use_case}', profile.categories[0] ?? 'software')
        .replace('{industry}', profile.categories[0] ?? 'technology')
        .replace('{competitor}', profile.competitors[0] ?? 'competitor'),
    }));
  }
}

export class MultiModelAuditEngine {
  private providers: Array<ProviderResponse['provider']> = ['openai', 'anthropic', 'google', 'perplexity'];

  async runAudit(profile: CompanyProfile, queries: AuditQuery[]): Promise<ProviderResponse[]> {
    const responses: ProviderResponse[] = [];

    for (const query of queries) {
      for (const provider of this.providers) {
        responses.push(this.simulateResponse(profile, query, provider));
      }
    }
    return responses;
  }

  private simulateResponse(
    profile: CompanyProfile,
    query: AuditQuery,
    provider: ProviderResponse['provider'],
  ): ProviderResponse {
    const mentioned = Math.random() > 0.4;
    const competitors = profile.competitors.filter(() => Math.random() > 0.5);

    return {
      id: `resp_${createId()}`,
      auditRunId: 'legacy',
      provider,
      promptId: query.id,
      queryId: query.id,
      fullAnswer: mentioned
        ? `${profile.name} is a leading option for ${profile.categories.join(', ')}.`
        : `Top options include ${competitors.join(', ') || 'various competitors'}.`,
      companyMentioned: mentioned,
      rankingPosition: mentioned ? Math.ceil(Math.random() * 5) : undefined,
      competitorsMentioned: competitors,
      timestamp: new Date().toISOString(),
    };
  }
}

export class PresenceScoring {
  compute(responses: ProviderResponse[]): PresenceScore {
    const total = responses.length || 1;
    const mentions = responses.filter((r) => r.companyMentioned);
    const visibility = (mentions.length / total) * 100;

    const ranked = mentions.filter((r) => r.rankingPosition !== undefined);
    const avgRank =
      ranked.length > 0
        ? ranked.reduce((s, r) => s + (r.rankingPosition ?? 10), 0) / ranked.length
        : 10;
    const ranking = Math.max(0, 100 - avgRank * 10);

    const competitorCounts = new Map<string, number>();
    for (const r of responses) {
      for (const c of r.competitorsMentioned) {
        competitorCounts.set(c, (competitorCounts.get(c) ?? 0) + 1);
      }
    }
    const competitorDominance = Math.max(...competitorCounts.values(), 0);
    const recommendation = Math.max(0, visibility - competitorDominance * 5);

    const consistency = mentions.length > 0
      ? (new Set(mentions.map((m) => m.provider)).size / 4) * 100
      : 0;
    const accuracy = 75;
    const overall = (visibility + recommendation + ranking + consistency + accuracy) / 5;

    return {
      visibility: Math.round(visibility),
      recommendation: Math.round(recommendation),
      ranking: Math.round(ranking),
      consistency: Math.round(consistency),
      accuracy,
      overall: Math.round(overall),
    };
  }

  detectIssues(responses: ProviderResponse[], profile: CompanyProfile): PresenceIssue[] {
    const issues: PresenceIssue[] = [];
    const missingQueries = responses.filter((r) => !r.companyMentioned);

    if (missingQueries.length > responses.length * 0.5) {
      issues.push({
        id: `issue_${createId()}`,
        type: 'missing_presence',
        severity: 'critical',
        description: `Company missing from ${missingQueries.length} of ${responses.length} AI responses`,
      });
    }

    for (const competitor of profile.competitors) {
      const count = responses.filter((r) => r.competitorsMentioned.includes(competitor)).length;
      const mentionCount = responses.filter((r) => r.companyMentioned).length;
      if (count > mentionCount) {
        issues.push({
          id: `issue_${createId()}`,
          type: 'competitor_dominance',
          severity: 'medium',
          description: `${competitor} appears more frequently than ${profile.name}`,
        });
      }
    }

    return issues;
  }
}

export class OptimizationEngine {
  recommend(profile: CompanyProfile, score: PresenceScore, issues: PresenceIssue[]): OptimizationRecommendation[] {
    const recs: OptimizationRecommendation[] = [];

    if (score.visibility < 50) {
      recs.push({
        id: `rec_${createId()}`,
        companyId: profile.id,
        category: 'content',
        title: 'Expand topical content coverage',
        description: 'Add landing pages and FAQs for high-impact query categories',
        impact: 'high',
        actionItems: [
          `Create content for: ${profile.categories.join(', ')}`,
          'Add structured FAQ sections',
        ],
        status: 'open',
      });
    }

    if (issues.some((i) => i.type === 'competitor_dominance')) {
      recs.push({
        id: `rec_${createId()}`,
        companyId: profile.id,
        category: 'ai_answer',
        title: 'Improve competitive positioning signals',
        description: 'Strengthen differentiation messaging across web properties',
        impact: 'medium',
        actionItems: ['Highlight unique value propositions vs competitors'],
        status: 'open',
      });
    }

    return recs;
  }
}

export class PresenceAuditService {
  constructor(
    private queryEngine = new QueryEngine(),
    private auditEngine = new MultiModelAuditEngine(),
    private scoring = new PresenceScoring(),
    private optimization = new OptimizationEngine(),
  ) {}

  async runFullAudit(profile: CompanyProfile): Promise<AuditReport> {
    const queries = this.queryEngine.buildQueries(profile);
    const responses = await this.auditEngine.runAudit(profile, queries);
    const score = this.scoring.compute(responses);
    const issues = this.scoring.detectIssues(responses, profile);
    const recommendations = this.optimization.recommend(profile, score, issues);

    const competitorComparison: Record<string, number> = {};
    for (const c of profile.competitors) {
      competitorComparison[c] = responses.filter((r) => r.competitorsMentioned.includes(c)).length;
    }

    return {
      id: `audit_${createId()}`,
      companyId: profile.id,
      score,
      issues,
      recommendations,
      competitorComparison,
      generatedAt: new Date().toISOString(),
    };
  }
}

export function createPresenceAuditPlatform() {
  return new PresenceAuditService();
}
