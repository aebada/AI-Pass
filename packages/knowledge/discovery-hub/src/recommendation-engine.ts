import type { MarketplaceCorePlatform } from '@ai-pass/marketplace-core';
import type { Recommendation, Tool } from './types.js';
import { appsToTools } from './mappers.js';

export class RecommendationEngine {
  constructor(private platform: MarketplaceCorePlatform) {}

  similar(toolId: string, limit = 6): Recommendation[] {
    const app = this.platform.apps.get(toolId);
    if (!app) return [];

    return this.platform.apps
      .list()
      .filter((a) => a.id !== toolId && (a.category === app.category || a.tags.some((t) => app.tags.includes(t))))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit)
      .map((a, i) => ({
        toolId: a.id,
        score: 0.9 - i * 0.05,
        reason: `Similar category (${a.category}) and shared tags`,
        type: 'similar' as const,
      }));
  }

  alternatives(toolId: string, limit = 4): Recommendation[] {
    const app = this.platform.apps.get(toolId);
    if (!app) return [];

    return this.platform.apps
      .list()
      .filter((a) => a.id !== toolId && a.category === app.category && a.pricingModel !== app.pricingModel)
      .sort((a, b) => b.installCount - a.installCount)
      .slice(0, limit)
      .map((a, i) => ({
        toolId: a.id,
        score: 0.85 - i * 0.08,
        reason: `Alternative in ${a.category} with different pricing`,
        type: 'alternative' as const,
      }));
  }

  competitors(toolId: string, limit = 4): Recommendation[] {
    const app = this.platform.apps.get(toolId);
    if (!app) return [];

    return this.platform.apps
      .list()
      .filter((a) => a.id !== toolId && a.category === app.category)
      .sort((a, b) => b.installCount - a.installCount)
      .slice(0, limit)
      .map((a, i) => ({
        toolId: a.id,
        score: 0.8 - i * 0.1,
        reason: `Direct competitor in ${a.category}`,
        type: 'competitor' as const,
      }));
  }

  personalized(userId: string, limit = 6): Recommendation[] {
    const apps = this.platform.search.recommendForUser(userId, limit);
    return apps.map((a, i) => ({
      toolId: a.id,
      score: 0.95 - i * 0.05,
      reason: 'Based on your installs and browsing history',
      type: 'personalized' as const,
    }));
  }

  resolveTools(recommendations: Recommendation[]): Tool[] {
    return recommendations
      .map((r) => {
        const app = this.platform.apps.get(r.toolId);
        return app ? appsToTools([app], this.platform)[0] : undefined;
      })
      .filter((t): t is Tool => t !== undefined);
  }
}
