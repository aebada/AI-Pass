import type { MarketplaceCorePlatform } from '@ai-pass/marketplace-core';
import { CATEGORY_LABELS, MARKETPLACE_CATEGORIES } from '@ai-pass/marketplace-core';
import type { Category, DiscoveryHomeSections, DiscoveryTaxonomyId, Tool } from './types.js';
import { appsToTools } from './mappers.js';
import { EXTERNAL_CATALOG, getExternalTool } from './external-catalog.js';
import { DISCOVERY_TAXONOMY, getTaxonomyBySlug } from './taxonomy.js';
import { CollectionsService } from './collections-service.js';
import { DealsService } from './deals-service.js';
import { NewsService } from './news-service.js';
import { ResearchService } from './research-service.js';
import { RecommendationEngine } from './recommendation-engine.js';
import { TrustScoreService } from './trust-score-service.js';
import { BenchmarkService } from './benchmark-service.js';
import { RatingsService } from './ratings-service.js';

export class DiscoveryService {
  private collections: CollectionsService;
  private deals: DealsService;
  private news: NewsService;
  private research: ResearchService;
  private recommendations: RecommendationEngine;
  readonly trustScores = new TrustScoreService();
  readonly benchmarks = new BenchmarkService();
  readonly ratings = new RatingsService();

  constructor(private platform: MarketplaceCorePlatform) {
    this.collections = new CollectionsService(platform);
    this.deals = new DealsService(platform);
    this.news = new NewsService();
    this.research = new ResearchService();
    this.recommendations = new RecommendationEngine(platform);
  }

  /** Marketplace apps + external AI catalog. */
  listTools(): Tool[] {
    const marketplace = appsToTools(this.platform.apps.list(), this.platform);
    const enrichedExternal = EXTERNAL_CATALOG.map((t) => this.enrich(t));
    const byId = new Map<string, Tool>();
    for (const t of [...marketplace, ...enrichedExternal]) byId.set(t.id, t);
    return Array.from(byId.values());
  }

  getTool(idOrSlug: string): Tool | undefined {
    const app = this.platform.apps.get(idOrSlug) ?? this.platform.apps.getBySlug(idOrSlug);
    if (app) return this.enrich(appsToTools([app], this.platform)[0]!);
    const external = getExternalTool(idOrSlug);
    return external ? this.enrich(external) : undefined;
  }

  private enrich(tool: Tool): Tool {
    const benchmark = this.benchmarks.ensure(tool);
    const trust = this.trustScores.fromTool(tool, benchmark.overall);
    const ratings = this.ratings.forTool(tool);
    return {
      ...tool,
      trustScore: trust.score,
      trustBadges: Array.from(new Set([trust.label, ...tool.trustBadges])),
      profile: {
        ...tool.profile,
        trust,
        ratings,
        latestBenchmark: benchmark,
      },
    };
  }

  getHome(userId?: string): DiscoveryHomeSections {
    const tools = this.listTools();
    const byInstalls = [...tools].sort((a, b) => b.installCount - a.installCount);
    const byRating = [...tools].sort((a, b) => b.rating - a.rating);
    const byTrust = [...tools].sort((a, b) => b.trustScore - a.trustScore);
    const byNew = [...tools].sort((a, b) => {
      const da = a.profile.general.launchDate ?? '';
      const db = b.profile.general.launchDate ?? '';
      return db.localeCompare(da);
    });

    const marketplaceFeatured = appsToTools(this.platform.promotions.getFeatured().apps, this.platform).map((t) =>
      this.enrich(t),
    );
    const marketplaceTrending = appsToTools(this.platform.promotions.getTrending().apps.slice(0, 8), this.platform).map(
      (t) => this.enrich(t),
    );

    const taxonomyHighlights = DISCOVERY_TAXONOMY.slice(0, 6).map((node) => ({
      taxonomyId: node.id,
      tools: tools.filter((t) => t.profile.taxonomy.includes(node.id)).slice(0, 4),
    }));

    return {
      featured: [...marketplaceFeatured, ...tools.filter((t) => t.featured && t.source === 'external')].slice(0, 10),
      trending: [...marketplaceTrending, ...tools.filter((t) => t.trending && t.source === 'external')].slice(0, 10),
      editorsPicks: appsToTools(this.platform.promotions.getEditorsPicks(), this.platform).map((t) => this.enrich(t)),
      recentlyAdded: byNew.slice(0, 8),
      mostInstalled: byInstalls.slice(0, 8),
      highestRated: byRating.slice(0, 8),
      enterpriseReady: tools.filter((t) => t.enterpriseReady).slice(0, 8),
      bestAiTools: byRating.filter((t) => t.certified || t.trustScore >= 85).slice(0, 8),
      highestTrust: byTrust.slice(0, 8),
      collections: this.collections.list(),
      deals: this.deals.listFeatured(),
      news: this.news.list(5),
      research: this.research.list(4),
      taxonomyHighlights,
      recommendedForYou: userId
        ? this.recommendations
            .personalized(userId, 6)
            .map((r) => this.getTool(r.toolId))
            .filter(Boolean) as Tool[]
        : undefined,
    };
  }

  getCategories(): Category[] {
    const tools = this.listTools();
    const counts = tools.reduce(
      (acc: Record<string, number>, tool) => {
        acc[tool.category] = (acc[tool.category] ?? 0) + 1;
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

  getTaxonomy() {
    const tools = this.listTools();
    return DISCOVERY_TAXONOMY.map((node) => ({
      ...node,
      toolCount: tools.filter((t) => t.profile.taxonomy.includes(node.id)).length,
    }));
  }

  listByTaxonomy(taxonomyIdOrSlug: string): Tool[] {
    const node = getTaxonomyBySlug(taxonomyIdOrSlug);
    const id = (node?.id ?? taxonomyIdOrSlug) as DiscoveryTaxonomyId;
    return this.listTools().filter((t) => t.profile.taxonomy.includes(id));
  }

  catalogStats() {
    const tools = this.listTools();
    return {
      totalTools: tools.length,
      marketplaceTools: tools.filter((t) => t.source === 'marketplace').length,
      externalTools: tools.filter((t) => t.source === 'external').length,
      taxonomyCount: DISCOVERY_TAXONOMY.length,
      targetCatalogSize: 50000,
      goldCertified: tools.filter((t) => t.profile.trust?.tier === 'gold' || t.profile.trust?.tier === 'platinum').length,
    };
  }
}
