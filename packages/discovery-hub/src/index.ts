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
import { EnterpriseCatalogService } from './enterprise-catalog-service.js';
import { TrustScoreService } from './trust-score-service.js';
import { RatingsService } from './ratings-service.js';
import { BenchmarkService } from './benchmark-service.js';
import { getToolActions, ROUTING_PREFERENCES } from './actions.js';

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
  enterprise: EnterpriseCatalogService;
  trustScores: TrustScoreService;
  ratings: RatingsService;
  benchmarks: BenchmarkService;
  compare: (toolAId: string, toolBId: string) => Comparison | undefined;
  compareMany: (toolIds: string[]) => Comparison | undefined;
  getToolActions: typeof getToolActions;
  routingPreferences: typeof ROUTING_PREFERENCES;
  getBestAiPage: (slug: string) => ReturnType<typeof getBestAiContent>;
  marketplace: MarketplaceCorePlatform;
}

function buildComparisonDimensions(toolA: Tool, toolB: Tool): ComparisonDimension[] {
  return [
    { key: 'pricing', label: 'Pricing', valueA: toolA.profile.pricing.join(', '), valueB: toolB.profile.pricing.join(', ') },
    {
      key: 'price',
      label: 'Monthly Price',
      valueA: toolA.priceMonthly ?? 'N/A',
      valueB: toolB.priceMonthly ?? 'N/A',
      winner: compareNumeric(toolA.priceMonthly, toolB.priceMonthly, true),
    },
    {
      key: 'trust',
      label: 'AI Trust Score',
      valueA: toolA.trustScore,
      valueB: toolB.trustScore,
      winner: compareNumeric(toolA.trustScore, toolB.trustScore),
    },
    {
      key: 'rating',
      label: 'User Rating',
      valueA: toolA.rating,
      valueB: toolB.rating,
      winner: compareNumeric(toolA.rating, toolB.rating),
    },
    {
      key: 'enterprise_rating',
      label: 'Enterprise Rating',
      valueA: toolA.profile.ratings?.enterprise ?? toolA.rating,
      valueB: toolB.profile.ratings?.enterprise ?? toolB.rating,
      winner: compareNumeric(toolA.profile.ratings?.enterprise, toolB.profile.ratings?.enterprise),
    },
    {
      key: 'latency',
      label: 'Latency (ms)',
      valueA: toolA.profile.latencyMs ?? 'N/A',
      valueB: toolB.profile.latencyMs ?? 'N/A',
      winner: compareNumeric(toolA.profile.latencyMs, toolB.profile.latencyMs, true),
    },
    {
      key: 'context',
      label: 'Context Window',
      valueA: toolA.profile.contextWindow ?? 'N/A',
      valueB: toolB.profile.contextWindow ?? 'N/A',
      winner: compareNumeric(toolA.profile.contextWindow, toolB.profile.contextWindow),
    },
    {
      key: 'benchmark',
      label: 'Benchmark Overall',
      valueA: toolA.profile.latestBenchmark?.overall ?? 'N/A',
      valueB: toolB.profile.latestBenchmark?.overall ?? 'N/A',
      winner: compareNumeric(toolA.profile.latestBenchmark?.overall, toolB.profile.latestBenchmark?.overall),
    },
    {
      key: 'languages',
      label: 'Languages',
      valueA: toolA.profile.languages.join(', '),
      valueB: toolB.profile.languages.join(', '),
    },
    {
      key: 'api',
      label: 'API Available',
      valueA: toolA.profile.apiAvailable,
      valueB: toolB.profile.apiAvailable,
    },
    {
      key: 'deployment',
      label: 'Deployment',
      valueA: toolA.profile.deployment.join(', '),
      valueB: toolB.profile.deployment.join(', '),
    },
    {
      key: 'security',
      label: 'Compliance',
      valueA: toolA.profile.compliance.join(', ') || '—',
      valueB: toolB.profile.compliance.join(', ') || '—',
    },
    {
      key: 'installs',
      label: 'Installs',
      valueA: toolA.installCount,
      valueB: toolB.installCount,
      winner: compareNumeric(toolA.installCount, toolB.installCount),
    },
    { key: 'enterprise', label: 'Enterprise Ready', valueA: toolA.enterpriseReady, valueB: toolB.enterpriseReady },
    { key: 'openSource', label: 'Open Source', valueA: toolA.openSource, valueB: toolB.openSource },
    {
      key: 'models',
      label: 'Supported Models',
      valueA: toolA.profile.supportedModels.join(', '),
      valueB: toolB.profile.supportedModels.join(', '),
    },
    {
      key: 'capabilities',
      label: 'Capabilities',
      valueA: toolA.profile.capabilities.join(', '),
      valueB: toolB.profile.capabilities.join(', '),
    },
    {
      key: 'credits',
      label: 'Credits Required',
      valueA: toolA.creditsRequired,
      valueB: toolB.creditsRequired,
      winner: compareNumeric(toolA.creditsRequired, toolB.creditsRequired, true),
    },
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

function compareManyTools(discovery: DiscoveryService, toolIds: string[]): Comparison | undefined {
  const unique = Array.from(new Set(toolIds.filter(Boolean)));
  if (unique.length < 2) return undefined;
  const tools = unique.map((id) => discovery.getTool(id)).filter((t): t is Tool => Boolean(t));
  if (tools.length < 2) return undefined;

  const [toolA, toolB] = tools;
  const seed = SEED_COMPARISONS.find(
    (c) =>
      (c.toolAId === toolA!.id && c.toolBId === toolB!.id) ||
      (c.toolAId === toolB!.id && c.toolBId === toolA!.id),
  );

  const dimensions = buildComparisonDimensions(toolA!, toolB!);
  if (tools.length > 2) {
    for (const dim of dimensions) {
      dim.values = tools.map((t) => {
        switch (dim.key) {
          case 'pricing':
            return t.profile.pricing.join(', ');
          case 'price':
            return t.priceMonthly ?? 'N/A';
          case 'trust':
            return t.trustScore;
          case 'rating':
            return t.rating;
          case 'latency':
            return t.profile.latencyMs ?? 'N/A';
          case 'context':
            return t.profile.contextWindow ?? 'N/A';
          case 'benchmark':
            return t.profile.latestBenchmark?.overall ?? 'N/A';
          case 'languages':
            return t.profile.languages.join(', ');
          case 'api':
            return t.profile.apiAvailable;
          case 'deployment':
            return t.profile.deployment.join(', ');
          case 'security':
            return t.profile.compliance.join(', ') || '—';
          case 'installs':
            return t.installCount;
          case 'enterprise':
            return t.enterpriseReady;
          case 'openSource':
            return t.openSource;
          case 'models':
            return t.profile.supportedModels.join(', ');
          case 'capabilities':
            return t.profile.capabilities.join(', ');
          case 'credits':
            return t.creditsRequired;
          default:
            return '';
        }
      });
    }
  }

  return {
    toolAId: toolA!.id,
    toolBId: toolB!.id,
    toolIds: tools.map((t) => t.id),
    slug: seed?.slug ?? tools.map((t) => t.slug).join('-vs-'),
    title: seed?.title ?? tools.map((t) => t.name).join(' vs '),
    summary:
      seed?.summary ??
      `Compare ${tools.map((t) => t.name).join(', ')} side by side across features, pricing, trust, benchmarks, and compliance.`,
    dimensions,
  };
}

export function createDiscoveryHub(marketplace: MarketplaceCorePlatform): DiscoveryHubPlatform {
  const discovery = new DiscoveryService(marketplace);
  const analytics = new AnalyticsService();
  const search = new SearchService(marketplace, discovery);
  const enterprise = new EnterpriseCatalogService(discovery, analytics);
  const recommendations = new RecommendationEngine(marketplace, discovery);

  return {
    discovery,
    search,
    recommendations,
    ranking: new RankingEngine(),
    trending: new TrendingEngine(marketplace),
    seo: new SEOGenerator(),
    collections: new CollectionsService(marketplace),
    deals: new DealsService(marketplace),
    news: new NewsService(),
    research: new ResearchService(),
    analytics,
    enterprise,
    trustScores: discovery.trustScores,
    ratings: discovery.ratings,
    benchmarks: discovery.benchmarks,
    compare(toolAId: string, toolBId: string) {
      return compareManyTools(discovery, [toolAId, toolBId]);
    },
    compareMany(toolIds: string[]) {
      return compareManyTools(discovery, toolIds);
    },
    getToolActions,
    routingPreferences: ROUTING_PREFERENCES,
    getBestAiPage: getBestAiContent,
    marketplace,
  };
}

export * from './types.js';
export * from './taxonomy.js';
export * from './seed-data.js';
export * from './mappers.js';
export * from './external-catalog.js';
export * from './actions.js';
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
export { EnterpriseCatalogService } from './enterprise-catalog-service.js';
export { TrustScoreService } from './trust-score-service.js';
export { RatingsService } from './ratings-service.js';
export { BenchmarkService } from './benchmark-service.js';
