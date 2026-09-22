import type { MarketplaceCorePlatform } from '@ai-pass/marketplace-core';
import type { Tool, TrendingScore } from './types.js';
import { appsToTools } from './mappers.js';

export class RankingEngine {
  computeScore(app: { installCount: number; rating: number; reviewCount: number; trending: boolean; certified: boolean }): number {
    const installWeight = Math.log10(app.installCount + 1) * 20;
    const ratingWeight = app.rating * 15;
    const reviewWeight = Math.min(app.reviewCount / 10, 10);
    const trendingBoost = app.trending ? 10 : 0;
    const certBoost = app.certified ? 5 : 0;
    return Math.round(installWeight + ratingWeight + reviewWeight + trendingBoost + certBoost);
  }

  rankTools(tools: Tool[]): Tool[] {
    return [...tools].sort((a, b) => {
      const scoreA = this.computeScore({
        installCount: a.installCount,
        rating: a.rating,
        reviewCount: a.reviewCount,
        trending: a.trending,
        certified: a.certified,
      });
      const scoreB = this.computeScore({
        installCount: b.installCount,
        rating: b.rating,
        reviewCount: b.reviewCount,
        trending: b.trending,
        certified: b.certified,
      });
      return scoreB - scoreA;
    });
  }
}

export class TrendingEngine {
  private ranking: RankingEngine;

  constructor(private platform: MarketplaceCorePlatform) {
    this.ranking = new RankingEngine();
  }

  getTrendingScores(limit = 20): TrendingScore[] {
    const apps = this.platform.promotions.getTrending().apps;
    const tools = appsToTools(apps, this.platform);

    return tools
      .map((tool, index) => ({
        toolId: tool.id,
        score: this.ranking.computeScore(tool),
        downloads: Math.round(tool.installCount * 1.2),
        installs: tool.installCount,
        usage: Math.round(tool.installCount * 3.5),
        ratings: tool.rating,
        growth: tool.trending ? 15 + Math.random() * 10 : 5 + Math.random() * 5,
        engagement: Math.round(tool.reviewCount * 2.1),
        trustScore: tool.trustScore,
        rank: index + 1,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s, i) => ({ ...s, rank: i + 1 }));
  }

  getTrendingTools(limit = 12): Tool[] {
    return appsToTools(this.platform.promotions.getTrending().apps.slice(0, limit), this.platform);
  }
}
