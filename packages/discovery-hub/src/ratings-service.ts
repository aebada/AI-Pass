import type { Tool, ToolRatings, ToolRatingsBreakdown } from './types.js';

function clamp(n: number): number {
  return Math.max(0, Math.min(5, Math.round(n * 10) / 10));
}

/**
 * User, enterprise, and expert ratings with metric breakdown.
 */
export class RatingsService {
  forTool(tool: Tool): ToolRatings {
    if (tool.profile.ratings) return tool.profile.ratings;

    const base = tool.rating || 4.0;
    const enterpriseBoost = tool.enterpriseReady ? 0.2 : 0;
    const expertBoost = tool.certified ? 0.15 : -0.1;

    const breakdown: ToolRatingsBreakdown = {
      accuracy: clamp(base + (tool.certified ? 0.2 : 0)),
      easeOfUse: clamp(base - 0.1 + (tool.openSource ? 0.05 : 0.1)),
      speed: clamp(base + (tool.profile.latencyMs && tool.profile.latencyMs < 800 ? 0.3 : -0.1)),
      reliability: clamp(base + enterpriseBoost),
      documentation: clamp(base + (tool.openSource ? 0.25 : 0)),
      support: clamp(base + (tool.enterpriseReady ? 0.3 : -0.2)),
    };

    return {
      user: clamp(base),
      enterprise: clamp(base + enterpriseBoost),
      expert: clamp(base + expertBoost),
      breakdown,
      reviewCount: tool.reviewCount,
    };
  }
}
