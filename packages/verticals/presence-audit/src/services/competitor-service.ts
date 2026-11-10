import { createId, type Company, type Competitor, type ProviderResponse } from '@ai-pass/shared';

export class CompetitorService {
  analyze(company: Company, responses: ProviderResponse[]): Competitor[] {
    return company.competitors.map((name) => {
      const mentions = responses.filter((r) => r.competitorsMentioned.includes(name));
      const total = responses.length || 1;
      const visibilityScore = Math.round((mentions.length / total) * 100);
      const ranked = mentions.filter((r) => r.rankingPosition !== undefined);
      const avgRank = ranked.length
        ? ranked.reduce((s, r) => s + (r.rankingPosition ?? 10), 0) / ranked.length
        : 8;
      const rankingScore = Math.max(0, Math.round(100 - avgRank * 10));
      const recommendationFrequency = Math.round((mentions.length / total) * 100);
      const allCompMentions = responses.flatMap((r) => r.competitorsMentioned).length || 1;
      const shareOfRecommendations = Math.round((mentions.length / allCompMentions) * 100);

      return {
        id: `comp_${createId()}`,
        companyId: company.id,
        name,
        visibilityScore,
        rankingScore,
        recommendationFrequency,
        shareOfRecommendations,
        strengths: [`Strong visibility in ${mentions.length} responses`, 'Frequently recommended'],
        weaknesses: visibilityScore < 30 ? ['Low AI visibility'] : ['Limited differentiation data'],
        lastAuditedAt: new Date().toISOString(),
      };
    });
  }

  compare(company: Company, competitors: Competitor[]) {
    const companyMentions = competitors.length
      ? Math.round(competitors.reduce((s, c) => s + c.visibilityScore, 0) / competitors.length)
      : 0;

    return {
      company: company.name,
      companyScore: companyMentions,
      competitors: competitors.map((c, i) => ({
        name: c.name,
        visibilityScore: c.visibilityScore,
        rankingScore: c.rankingScore,
        shareOfRecommendations: c.shareOfRecommendations,
        rank: i + 1,
      })),
      sideBySide: competitors.map((c) => ({
        dimension: c.name,
        company: companyMentions,
        competitor: c.visibilityScore,
        winner: c.visibilityScore > companyMentions ? c.name : company.name,
      })),
    };
  }
}
