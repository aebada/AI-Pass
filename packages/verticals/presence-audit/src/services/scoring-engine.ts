import { createId, type Company, type PresenceGap, type PresenceScore, type ProviderResponse } from '@ai-pass/shared';

export class ScoringEngine {
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

    const providerSet = new Set(mentions.map((m) => m.provider));
    const consistency = mentions.length > 0 ? (providerSet.size / 4) * 100 : 0;

    const accuracy = this.computeAccuracy(responses);
    const overall = (visibility + recommendation + ranking + consistency + accuracy) / 5;

    return {
      visibility: Math.round(visibility),
      recommendation: Math.round(recommendation),
      ranking: Math.round(ranking),
      consistency: Math.round(consistency),
      accuracy: Math.round(accuracy),
      overall: Math.round(overall),
    };
  }

  private computeAccuracy(responses: ProviderResponse[]): number {
    const withIssues = responses.filter(
      (r) => (r.hallucinations?.length ?? 0) > 0 || (r.outdatedInfo?.length ?? 0) > 0,
    );
    const penalty = (withIssues.length / Math.max(responses.length, 1)) * 30;
    return Math.max(40, 95 - penalty);
  }

  trendFromHistory(scores: PresenceScore[]): number[] {
    return scores.map((s) => s.overall);
  }
}

export class RepresentationAnalysis {
  analyze(company: Company, responses: ProviderResponse[]) {
    const mentioned = responses.filter((r) => r.companyMentioned);
    const positive = mentioned.filter((r) => r.sentiment === 'positive').length;
    const negative = mentioned.filter((r) => r.sentiment === 'negative').length;

    let sentiment: 'positive' | 'neutral' | 'negative' | 'mixed' = 'neutral';
    if (positive > negative * 2) sentiment = 'positive';
    else if (negative > positive * 2) sentiment = 'negative';
    else if (positive > 0 && negative > 0) sentiment = 'mixed';

    const hallucinations = [...new Set(responses.flatMap((r) => r.hallucinations ?? []))];
    const outdatedInfo = [...new Set(responses.flatMap((r) => r.outdatedInfo ?? []))];

    return {
      brandPositioning: `${company.name} is positioned as ${company.valueProposition}`,
      productPositioning: `Products: ${company.products.join(', ')}`,
      strengths: [
        company.valueProposition,
        ...company.products.slice(0, 2).map((p) => `Strong ${p} offering`),
      ],
      weaknesses: outdatedInfo.length > 0 ? ['Outdated information in AI responses'] : ['Limited FAQ coverage'],
      missingCapabilities: company.services.filter(
        (s) => !responses.some((r) => r.fullAnswer.toLowerCase().includes(s.toLowerCase())),
      ).slice(0, 3),
      tone: mentioned[0]?.tone ?? 'professional',
      sentiment,
      hallucinations,
      outdatedInfo,
    };
  }
}

export class GapDetection {
  detect(company: Company, responses: ProviderResponse[]): PresenceGap[] {
    const gaps: PresenceGap[] = [];
    const missing = responses.filter((r) => !r.companyMentioned);

    if (missing.length > responses.length * 0.4) {
      gaps.push({
        id: `gap_${createId()}`,
        type: 'missing_presence',
        severity: missing.length > responses.length * 0.6 ? 'critical' : 'medium',
        description: `${company.name} missing from ${missing.length} of ${responses.length} AI responses`,
      });
    }

    for (const competitor of company.competitors) {
      const compCount = responses.filter((r) => r.competitorsMentioned.includes(competitor)).length;
      const mentionCount = responses.filter((r) => r.companyMentioned).length;
      if (compCount > mentionCount) {
        gaps.push({
          id: `gap_${createId()}`,
          type: 'competitor_dominance',
          severity: compCount > mentionCount * 1.5 ? 'critical' : 'medium',
          description: `${competitor} appears more frequently than ${company.name} in AI recommendations`,
          recommendation: `Strengthen differentiation vs ${competitor}`,
        });
      }
    }

    for (const r of responses) {
      if ((r.hallucinations?.length ?? 0) > 0) {
        gaps.push({
          id: `gap_${createId()}`,
          type: 'incorrect_info',
          severity: 'critical',
          description: `Incorrect information detected on ${r.provider}`,
          provider: r.provider,
          promptId: r.promptId,
        });
      }
      if ((r.outdatedInfo?.length ?? 0) > 0) {
        gaps.push({
          id: `gap_${createId()}`,
          type: 'outdated',
          severity: 'medium',
          description: `Outdated information on ${r.provider}`,
          provider: r.provider,
          promptId: r.promptId,
        });
      }
    }

    const weakMentions = responses.filter((r) => r.companyMentioned && (r.rankingPosition ?? 10) > 5);
    if (weakMentions.length > 2) {
      gaps.push({
        id: `gap_${createId()}`,
        type: 'weak_positioning',
        severity: 'low',
        description: 'Company mentioned but ranked below position 5 in multiple responses',
      });
    }

    return gaps;
  }
}
