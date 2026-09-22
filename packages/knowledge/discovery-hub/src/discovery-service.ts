import type { MarketplaceCorePlatform } from '@ai-pass/marketplace-core';
import { CATEGORY_LABELS, MARKETPLACE_CATEGORIES } from '@ai-pass/marketplace-core';
import type { Category, DiscoveryHomeSections, Tool } from './types.js';
import { appsToTools } from './mappers.js';
import { CollectionsService } from './collections-service.js';
import { DealsService } from './deals-service.js';
import { NewsService } from './news-service.js';
import { ResearchService } from './research-service.js';
import { RecommendationEngine } from './recommendation-engine.js';

export class DiscoveryService {
  private collections: CollectionsService;
  private deals: DealsService;
  private news: NewsService;
  private research: ResearchService;
  private recommendations: RecommendationEngine;

  constructor(private platform: MarketplaceCorePlatform) {
    this.collections = new CollectionsService(platform);
    this.deals = new DealsService(platform);
    this.news = new NewsService();
    this.research = new ResearchService();
    this.recommendations = new RecommendationEngine(platform);
  }

  getHome(userId?: string): DiscoveryHomeSections {
    const allApps = this.platform.apps.list();
    const tools = appsToTools(allApps, this.platform);

    const byInstalls = [...tools].sort((a, b) => b.installCount - a.installCount);
    const byRating = [...tools].sort((a, b) => b.rating - a.rating);

    return {
      featured: appsToTools(this.platform.promotions.getFeatured().apps, this.platform),
      trending: appsToTools(this.platform.promotions.getTrending().apps.slice(0, 8), this.platform),
      editorsPicks: appsToTools(this.platform.promotions.getEditorsPicks(), this.platform),
      recentlyAdded: appsToTools(this.platform.promotions.getNew(8), this.platform),
      mostInstalled: byInstalls.slice(0, 8),
      highestRated: byRating.slice(0, 8),
      enterpriseReady: appsToTools(this.platform.promotions.getEnterpriseApps(), this.platform),
      bestAiTools: byRating.filter((t) => t.certified).slice(0, 6),
      collections: this.collections.list(),
      deals: this.deals.listFeatured(),
      news: this.news.list(5),
      research: this.research.list(4),
      recommendedForYou: userId
        ? this.recommendations.personalized(userId, 6).map((r) => this.getTool(r.toolId)).filter(Boolean) as Tool[]
        : undefined,
    };
  }

  getTool(idOrSlug: string): Tool | undefined {
    const app = this.platform.apps.get(idOrSlug) ?? this.platform.apps.getBySlug(idOrSlug);
    if (!app) return undefined;
    return appsToTools([app], this.platform)[0];
  }

  listTools(): Tool[] {
    return appsToTools(this.platform.apps.list(), this.platform);
  }

  getCategories(): Category[] {
    const counts = this.platform.apps.list().reduce(
      (acc: Record<string, number>, app) => {
        acc[app.category] = (acc[app.category] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return MARKETPLACE_CATEGORIES.map((cat: (typeof MARKETPLACE_CATEGORIES)[number]) => ({
      id: cat,
      slug: cat.replace(/_/g, '-'),
      label: CATEGORY_LABELS[cat],
      description: `Discover ${CATEGORY_LABELS[cat]} AI tools on AI Pass`,
      toolCount: counts[cat] ?? 0,
      seoTitle: `Best ${CATEGORY_LABELS[cat]} AI Tools | AI Pass Discovery`,
      seoDescription: `Browse certified ${CATEGORY_LABELS[cat].toLowerCase()} AI apps, compare features, and install in one click.`,
    }));
  }
}
