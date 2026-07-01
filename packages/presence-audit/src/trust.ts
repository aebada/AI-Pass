import type { Company, OptimizationRecommendation } from '@ai-pass/shared';

export class PresenceTrustService {
  evaluateCompany(company: Company): {
    trustScore: number;
    certified: boolean;
    verified: boolean;
    riskClass: 'low' | 'medium' | 'high';
  } {
    const hasWebsite = Boolean(company.website);
    const hasDescription = company.brandDescription.length > 20;
    const hasCompetitors = company.competitors.length > 0;

    let score = 50;
    if (hasWebsite) score += 20;
    if (hasDescription) score += 15;
    if (hasCompetitors) score += 10;
    if (company.products.length >= 2) score += 5;

    const trustScore = Math.min(100, score);
    const riskClass: 'low' | 'medium' | 'high' =
      trustScore >= 80 ? 'low' : trustScore >= 60 ? 'medium' : 'high';

    return {
      trustScore,
      certified: trustScore >= 80,
      verified: hasWebsite && hasDescription,
      riskClass,
    };
  }

  annotateRecommendations(
    recommendations: OptimizationRecommendation[],
    riskClass: 'low' | 'medium' | 'high',
  ): OptimizationRecommendation[] {
    return recommendations.map((r) => ({
      ...r,
      trustRisk: riskClass === 'high' ? 'high' : r.trustRisk ?? 'low',
    }));
  }
}

export const defaultPresenceTrustService = new PresenceTrustService();
