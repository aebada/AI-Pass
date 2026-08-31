import type { Application, Campaign, MarketplaceCategory } from '@ai-pass/marketplace-core';

export type BestAiSlug =
  | 'finance'
  | 'hr'
  | 'developers'
  | 'agents'
  | 'automation'
  | 'platforms'
  | 'europe'
  | 'open-source'
  | 'free'
  | 'enterprise';

export interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: MarketplaceCategory;
  tags: string[];
  developerId: string;
  developerName?: string;
  pricingModel: Application['pricingModel'];
  priceMonthly?: number;
  pricePerUse?: number;
  certified: boolean;
  enterpriseReady: boolean;
  openSource: boolean;
  featured: boolean;
  trending: boolean;
  installCount: number;
  rating: number;
  reviewCount: number;
  trustScore: number;
  trustBadges: string[];
  creditsRequired: number;
  estimatedCostPerRun?: number;
  supportedPlatforms: string[];
  modelsUsed: string[];
  screenshots: string[];
  features: string[];
  membershipTierRequired: string;
  workspaceRoute?: string;
  storeRoute: string;
  presenceAuditRoute?: string;
}

export interface Category {
  id: MarketplaceCategory;
  slug: string;
  label: string;
  description: string;
  toolCount: number;
  seoTitle: string;
  seoDescription: string;
}

export interface Tag {
  id: string;
  label: string;
  slug: string;
  toolCount: number;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  audience: 'startups' | 'enterprise' | 'developers' | 'students' | 'government' | 'healthcare' | 'finance' | 'procurement' | 'hr' | 'general';
  toolIds: string[];
  featured: boolean;
  editable: boolean;
}

export interface Comparison {
  toolAId: string;
  toolBId: string;
  slug: string;
  title: string;
  summary: string;
  dimensions: ComparisonDimension[];
}

export interface ComparisonDimension {
  key: string;
  label: string;
  valueA: string | number | boolean;
  valueB: string | number | boolean;
  winner?: 'a' | 'b' | 'tie';
}

export interface Recommendation {
  toolId: string;
  score: number;
  reason: string;
  type: 'similar' | 'alternative' | 'competitor' | 'personalized' | 'trending';
}

export interface DiscoveryDeal {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  appIds: string[];
  validUntil: string;
  code?: string;
  dealType: 'lifetime' | 'discount' | 'bundle' | 'enterprise' | 'limited_time' | 'campaign';
  originalPrice?: number;
  dealPrice?: number;
  savingsPercent: number;
  countdownEndsAt: string;
  featured: boolean;
  toolIds: string[];
}

export type DiscoveryCampaign = Campaign;

export interface TrendingScore {
  toolId: string;
  score: number;
  downloads: number;
  installs: number;
  usage: number;
  ratings: number;
  growth: number;
  engagement: number;
  trustScore: number;
  rank: number;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: 'product_launch' | 'llm_update' | 'marketplace_update' | 'event';
  publishedAt: string;
  source: string;
  toolIds?: string[];
  url?: string;
}

export interface ResearchArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  type: 'paper' | 'benchmark' | 'industry_report';
  publishedAt: string;
  authors: string[];
  toolIds?: string[];
  url?: string;
}

export interface AnalyticsEvent {
  type: 'view' | 'search' | 'install' | 'click' | 'conversion';
  resourceType: 'tool' | 'category' | 'collection' | 'deal' | 'comparison' | 'page';
  resourceId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsSummary {
  views: number;
  searches: number;
  installs: number;
  clicks: number;
  conversions: number;
  trendingScore: number;
}

export interface DiscoverySearchFilters {
  keyword?: string;
  category?: MarketplaceCategory;
  tag?: string;
  industry?: string;
  developerId?: string;
  free?: boolean;
  paid?: boolean;
  openSource?: boolean;
  enterprise?: boolean;
  certified?: boolean;
  trending?: boolean;
  topRated?: boolean;
  region?: string;
  language?: string;
  provider?: string;
  useCase?: string;
}

export interface DiscoveryHomeSections {
  featured: Tool[];
  trending: Tool[];
  editorsPicks: Tool[];
  recentlyAdded: Tool[];
  mostInstalled: Tool[];
  highestRated: Tool[];
  enterpriseReady: Tool[];
  bestAiTools: Tool[];
  collections: Collection[];
  deals: DiscoveryDeal[];
  news: NewsArticle[];
  research: ResearchArticle[];
  recommendedForYou?: Tool[];
}

export interface BestAiPageContent {
  slug: BestAiSlug;
  title: string;
  headline: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  toolIds: string[];
  membershipGate?: string;
}

export interface SeoMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonicalPath: string;
  ogType: 'website' | 'article';
}
