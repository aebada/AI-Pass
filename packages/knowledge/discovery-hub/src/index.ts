import type { MarketplaceCorePlatform } from '@ai-pass/marketplace-core';
import type { Comparison, ComparisonDimension, Tool } from './types.js';
import { SEED_COMPARISONS, BEST_AI_PAGES } from './seed-data.js';
import { DiscoveryService } from './discovery-service.js';
import { SearchService } from './search-service.js';
import { RecommendationEngine } from './recommendation-engine.js';
import { RankingEngine, TrendingEngine } from './ranking-engine.js';
import { SEOGenerator } from './seo-generator.js';
import { CollectionsService } from './collections-service.js';
import { DealsService } from './deals-service.js';
import { NewsService } from './news-service.js';
import { ResearchService } from './research-service.js';
import { AnalyticsService } from './analytics-service.js';

export interface DiscoveryHubPlatform {
  discovery: DiscoveryService;
  search: SearchService;
  recommendations: RecommendationEngine;
  ranking: RankingEngine;
  trending: TrendingEngine;
  seo: SEOGenerator;
  collections: CollectionsService;
  deals: DealsService;
  news: NewsService;
  research: ResearchService;
  analytics: AnalyticsService;
  compare: (toolAId: string, toolBId: string) => Comparison | undefined;
  getBestAiPage: (slug: string) => ReturnType<typeof getBestAiContent>;
  marketplace: MarketplaceCorePlatform;
}

function buildComparisonDimensions(toolA: Tool, toolB: Tool): ComparisonDimension[] {
  return [
    { key: 'pricing', label: 'Pricing', valueA: toolA.pricingModel, valueB: toolB.pricingModel },
    { key: 'price', label: 'Monthly Price', valueA: toolA.priceMonthly ?? 'N/A', valueB: toolB.priceMonthly ?? 'N/A', winner: compareNumeric(toolA.priceMonthly, toolB.priceMonthly, true) },
    { key: 'trust', label: 'Trust Score', valueA: toolA.trustScore, valueB: toolB.trustScore, winner: compareNumeric(toolA.trustScore, toolB.trustScore) },
    { key: 'rating', label: 'Rating', valueA: toolA.rating, valueB: toolB.rating, winner: compareNumeric(toolA.rating, toolB.rating) },
    { key: 'installs', label: 'Installs', valueA: toolA.installCount, valueB: toolB.installCount, winner: compareNumeric(toolA.installCount, toolB.installCount) },
    { key: 'enterprise', label: 'Enterprise Ready', valueA: toolA.enterpriseReady, valueB: toolB.enterpriseReady },
    { key: 'certified', label: 'Certified', valueA: toolA.certified, valueB: toolB.certified },
    { key: 'openSource', label: 'Open Source', valueA: toolA.openSource, valueB: toolB.openSource },
    { key: 'platforms', label: 'Platforms', valueA: toolA.supportedPlatforms.join(', '), valueB: toolB.supportedPlatforms.join(', ') },
    { key: 'models', label: 'Models', valueA: toolA.modelsUsed.join(', '), valueB: toolB.modelsUsed.join(', ') },
    { key: 'membership', label: 'Membership Tier', valueA: toolA.membershipTierRequired, valueB: toolB.membershipTierRequired },
    { key: 'credits', label: 'Credits Required', valueA: toolA.creditsRequired, valueB: toolB.creditsRequired, winner: compareNumeric(toolA.creditsRequired, toolB.creditsRequired, true) },
  ];
}

function compareNumeric(a?: number, b?: number, lowerWins = false): 'a' | 'b' | 'tie' | undefined {
  if (a === undefined || b === undefined) return undefined;
  if (a === b) return 'tie';
  if (lowerWins) return a < b ? 'a' : 'b';
  return a > b ? 'a' : 'b';
}

function getBestAiContent(slug: string) {
  return BEST_AI_PAGES.find((p) => p.slug === slug);
}

export function createDiscoveryHub(marketplace: MarketplaceCorePlatform): DiscoveryHubPlatform {
  const discovery = new DiscoveryService(marketplace);

  return {
    discovery,
    search: new SearchService(marketplace),
    recommendations: new RecommendationEngine(marketplace),
    ranking: new RankingEngine(),
    trending: new TrendingEngine(marketplace),
    seo: new SEOGenerator(),
    collections: new CollectionsService(marketplace),
    deals: new DealsService(marketplace),
    news: new NewsService(),
    research: new ResearchService(),
    analytics: new AnalyticsService(),
    compare(toolAId: string, toolBId: string) {
      const seed = SEED_COMPARISONS.find(
        (c) =>
          (c.toolAId === toolAId && c.toolBId === toolBId) ||
          (c.toolAId === toolBId && c.toolBId === toolAId),
      );
      const toolA = discovery.getTool(toolAId);
      const toolB = discovery.getTool(toolBId);
      if (!toolA || !toolB) return undefined;

      return {
        toolAId,
        toolBId,
        slug: seed?.slug ?? `${toolA.slug}-vs-${toolB.slug}`,
        title: seed?.title ?? `${toolA.name} vs ${toolB.name}`,
        summary: seed?.summary ?? `Compare ${toolA.name} and ${toolB.name} side by side.`,
        dimensions: buildComparisonDimensions(toolA, toolB),
      };
    },
    getBestAiPage: getBestAiContent,
    marketplace,
  };
}

export * from './types.js';
export * from './seed-data.js';
export * from './mappers.js';
export { DiscoveryService } from './discovery-service.js';
export { SearchService } from './search-service.js';
export { RecommendationEngine } from './recommendation-engine.js';
export { RankingEngine, TrendingEngine } from './ranking-engine.js';
export { SEOGenerator } from './seo-generator.js';
export { CollectionsService } from './collections-service.js';
export { DealsService } from './deals-service.js';
export { NewsService } from './news-service.js';
export { ResearchService } from './research-service.js';
export { AnalyticsService } from './analytics-service.js';
