import type { MarketplaceCorePlatform } from '@ai-pass/marketplace-core';
import type { Recommendation, Tool } from './types.js';
import type { DiscoveryService } from './discovery-service.js';
import { appsToTools } from './mappers.js';

export class RecommendationEngine {
  constructor(
    private platform: MarketplaceCorePlatform,
    private discovery?: DiscoveryService,
  ) {}

  private allTools(): Tool[] {
    return this.discovery?.listTools() ?? appsToTools(this.platform.apps.list(), this.platform);
  }

  similar(toolId: string, limit = 6): Recommendation[] {
    const tools = this.allTools();
    const tool = tools.find((t) => t.id === toolId || t.slug === toolId);
    if (!tool) return [];

    return tools
      .filter(
        (t) =>
          t.id !== tool.id &&
          (t.category === tool.category ||
            t.profile.taxonomy.some((tax) => tool.profile.taxonomy.includes(tax)) ||
            t.tags.some((tag) => tool.tags.includes(tag))),
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit)
      .map((t, i) => ({
        toolId: t.id,
        score: 0.9 - i * 0.05,
        reason: `Similar taxonomy / category (${t.category})`,
        type: 'similar' as const,
      }));
  }

  alternatives(toolId: string, limit = 4): Recommendation[] {
    const tools = this.allTools();
    const tool = tools.find((t) => t.id === toolId || t.slug === toolId);
    if (!tool) return [];

    return tools
      .filter(
        (t) =>
          t.id !== tool.id &&
          t.profile.taxonomy.some((tax) => tool.profile.taxonomy.includes(tax)) &&
          t.pricingModel !== tool.pricingModel,
      )
      .sort((a, b) => b.installCount - a.installCount)
      .slice(0, limit)
      .map((t, i) => ({
        toolId: t.id,
        score: 0.85 - i * 0.08,
        reason: `Alternative with different pricing (${t.pricingModel})`,
        type: 'alternative' as const,
      }));
  }

  competitors(toolId: string, limit = 4): Recommendation[] {
    const tools = this.allTools();
    const tool = tools.find((t) => t.id === toolId || t.slug === toolId);
    if (!tool) return [];

    return tools
      .filter(
        (t) =>
          t.id !== tool.id && t.profile.taxonomy.some((tax) => tool.profile.taxonomy.includes(tax)),
      )
      .sort((a, b) => b.installCount - a.installCount)
      .slice(0, limit)
      .map((t, i) => ({
        toolId: t.id,
        score: 0.8 - i * 0.1,
        reason: `Competitor in ${t.profile.taxonomy[0] ?? t.category}`,
        type: 'competitor' as const,
      }));
  }

  personalized(userId: string, limit = 6): Recommendation[] {
    const apps = this.platform.search.recommendForUser(userId, limit);
    if (apps.length) {
      return apps.map((a: { id: string }, i: number) => ({
        toolId: a.id,
        score: 0.95 - i * 0.05,
        reason: 'Based on your installs and browsing history',
        type: 'personalized' as const,
      }));
    }
    return this.allTools()
      .filter((t) => t.featured || t.trending)
      .slice(0, limit)
      .map((t, i) => ({
        toolId: t.id,
        score: 0.9 - i * 0.05,
        reason: 'Popular across the AI Discovery Hub',
        type: 'personalized' as const,
      }));
  }

  resolveTools(recommendations: Recommendation[]): Tool[] {
    return recommendations
      .map((r) => this.discovery?.getTool(r.toolId) ?? (() => {
        const app = this.platform.apps.get(r.toolId);
        return app ? appsToTools([app], this.platform)[0] : undefined;
      })())
      .filter((t): t is Tool => t !== undefined);
  }
}
