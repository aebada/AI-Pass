import type { AiTrustScore, AiTrustScoreBreakdown, Tool, TrustCertificationTier } from './types.js';

const TIER_THRESHOLDS: Array<{ min: number; tier: TrustCertificationTier; label: string }> = [
  { min: 95, tier: 'platinum', label: 'Platinum Certified' },
  { min: 90, tier: 'gold', label: 'Gold Certified' },
  { min: 80, tier: 'silver', label: 'Silver Certified' },
  { min: 70, tier: 'bronze', label: 'Bronze Certified' },
  { min: 0, tier: 'unrated', label: 'Unrated' },
];

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * AI Trust Score — Security, Privacy, Compliance, Reliability,
 * Community Rating, Benchmark Results, Maintenance Frequency.
 * Integrates with Trust Engine scores when available.
 */
export class TrustScoreService {
  compute(input: {
    trustEngineScore?: number;
    certified?: boolean;
    enterpriseReady?: boolean;
    openSource?: boolean;
    complianceCount?: number;
    rating?: number;
    reviewCount?: number;
    installCount?: number;
    benchmarkOverall?: number;
    maintenanceScore?: number;
  }): AiTrustScore {
    const compliance = clamp((input.complianceCount ?? 0) * 20 + (input.certified ? 15 : 0));
    const security = clamp(
      (input.trustEngineScore ?? 60) * 0.6 + (input.enterpriseReady ? 20 : 0) + (input.certified ? 15 : 0),
    );
    const privacy = clamp(compliance * 0.7 + (input.complianceCount && input.complianceCount > 0 ? 20 : 10));
    const reliability = clamp(
      (input.rating ?? 3.5) * 15 + Math.min((input.installCount ?? 0) / 200, 20) + (input.enterpriseReady ? 10 : 0),
    );
    const communityRating = clamp((input.rating ?? 3.5) * 18 + Math.min((input.reviewCount ?? 0) / 10, 15));
    const benchmarkResults = clamp(input.benchmarkOverall ?? 55);
    const maintenanceFrequency = clamp(input.maintenanceScore ?? (input.openSource ? 70 : 65));

    const breakdown: AiTrustScoreBreakdown = {
      security,
      privacy,
      compliance,
      reliability,
      communityRating,
      benchmarkResults,
      maintenanceFrequency,
    };

    const score = clamp(
      security * 0.2 +
        privacy * 0.15 +
        compliance * 0.15 +
        reliability * 0.15 +
        communityRating * 0.15 +
        benchmarkResults * 0.12 +
        maintenanceFrequency * 0.08,
    );

    const tierInfo = TIER_THRESHOLDS.find((t) => score >= t.min) ?? TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1]!;

    return {
      score,
      tier: tierInfo.tier,
      label: tierInfo.label,
      breakdown,
    };
  }

  fromTool(tool: Tool, benchmarkOverall?: number): AiTrustScore {
    return this.compute({
      trustEngineScore: tool.trustScore,
      certified: tool.certified,
      enterpriseReady: tool.enterpriseReady,
      openSource: tool.openSource,
      complianceCount: tool.profile.compliance.length,
      rating: tool.rating,
      reviewCount: tool.reviewCount,
      installCount: tool.installCount,
      benchmarkOverall: benchmarkOverall ?? tool.profile.latestBenchmark?.overall,
      maintenanceScore: tool.source === 'marketplace' ? 75 : 60,
    });
  }

  tierLabel(tier: TrustCertificationTier): string {
    return TIER_THRESHOLDS.find((t) => t.tier === tier)?.label ?? 'Unrated';
  }
}
