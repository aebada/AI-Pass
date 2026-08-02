import type { Application, Campaign, MarketplaceCategory } from '@ai-pass/marketplace-core';
import type {
  DiscoveryCapability,
  DiscoveryCompliance,
  DiscoveryDeployment,
  DiscoveryIntegration,
  DiscoveryModelFamily,
  DiscoveryPricing,
  DiscoveryTaxonomyId,
} from './taxonomy.js';

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

export type TrustCertificationTier = 'platinum' | 'gold' | 'silver' | 'bronze' | 'unrated';

export type InstallMethod = 'api_key' | 'oauth' | 'docker' | 'github' | 'marketplace' | 'sdk';

export type RoutingPreference =
  | 'fixed_provider'
  | 'automatic'
  | 'lowest_cost'
  | 'lowest_latency'
  | 'highest_quality'
  | 'local_only'
  | 'compliance_based';

export type ToolActionId =
  | 'install'
  | 'connect'
  | 'add_to_workflow'
  | 'add_as_agent_skill'
  | 'compare'
  | 'benchmark'
  | 'save_to_collection'
  | 'request_approval'
  | 'open_playground'
  | 'configure_routing';

export interface ToolGeneralInfo {
  logoUrl?: string;
  website?: string;
  developer: string;
  country?: string;
  launchDate?: string;
}

export interface ToolRatingsBreakdown {
  accuracy: number;
  easeOfUse: number;
  speed: number;
  reliability: number;
  documentation: number;
  support: number;
}

export interface ToolRatings {
  user: number;
  enterprise: number;
  expert: number;
  breakdown: ToolRatingsBreakdown;
  reviewCount: number;
}

export interface AiTrustScoreBreakdown {
  security: number;
  privacy: number;
  compliance: number;
  reliability: number;
  communityRating: number;
  benchmarkResults: number;
  maintenanceFrequency: number;
}

export interface AiTrustScore {
  score: number;
  tier: TrustCertificationTier;
  label: string;
  breakdown: AiTrustScoreBreakdown;
}

export interface BenchmarkMetric {
  key:
    | 'reasoning'
    | 'coding'
    | 'mathematics'
    | 'translation'
    | 'rag'
    | 'vision'
    | 'long_context'
    | 'cost_efficiency'
    | 'latency'
    | 'tool_calling';
  label: string;
  score: number;
  unit?: string;
  higherIsBetter: boolean;
}

export interface BenchmarkSnapshot {
  toolId: string;
  measuredAt: string;
  metrics: BenchmarkMetric[];
  overall: number;
}

export interface ToolProfileExtras {
  capabilities: DiscoveryCapability[];
  supportedModels: DiscoveryModelFamily[];
  deployment: DiscoveryDeployment[];
  pricing: DiscoveryPricing[];
  integrations: DiscoveryIntegration[];
  compliance: DiscoveryCompliance[];
  taxonomy: DiscoveryTaxonomyId[];
  subcategories: string[];
  contextWindow?: number;
  languages: string[];
  apiAvailable: boolean;
  localDeployable: boolean;
  openSource: boolean;
  latencyMs?: number;
  installMethods: InstallMethod[];
  general: ToolGeneralInfo;
  ratings?: ToolRatings;
  trust?: AiTrustScore;
  latestBenchmark?: BenchmarkSnapshot;
}

/**
 * Catalog tool — marketplace Application mapped + optional external AI products.
 * Retains marketplace fields for Store/Trust/Wallet integration.
 */
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
  /** Extended ecosystem profile (Discovery Hub v2). */
  profile: ToolProfileExtras;
  /** Source: marketplace app vs external catalog entry. */
  source: 'marketplace' | 'external';
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
  audience:
    | 'startups'
    | 'enterprise'
    | 'developers'
    | 'students'
    | 'government'
    | 'healthcare'
    | 'finance'
    | 'procurement'
    | 'hr'
    | 'general'
    | 'research'
    | 'marketing';
  toolIds: string[];
  featured: boolean;
  editable: boolean;
}

export interface Comparison {
  toolAId: string;
  toolBId: string;
  toolIds?: string[];
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
  values?: Array<string | number | boolean>;
  winner?: 'a' | 'b' | 'tie' | number;
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
  dealType:
    | 'lifetime'
    | 'discount'
    | 'bundle'
    | 'enterprise'
    | 'limited_time'
    | 'campaign'
    | 'student'
    | 'startup_credits';
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
  type: 'view' | 'search' | 'install' | 'click' | 'conversion' | 'connect' | 'workflow_add' | 'skill_add' | 'approval';
  resourceType: 'tool' | 'category' | 'collection' | 'deal' | 'comparison' | 'page' | 'benchmark';
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

export interface DiscoveryAnalyticsDashboard {
  trending: Tool[];
  mostInstalled: Tool[];
  mostUsed: Tool[];
  fastestGrowing: Tool[];
  highestTrust: Tool[];
  newReleases: Tool[];
  enterpriseAdoption: Tool[];
}

export interface DiscoverySearchFilters {
  keyword?: string;
  category?: MarketplaceCategory;
  taxonomy?: DiscoveryTaxonomyId;
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
  model?: DiscoveryModelFamily;
  pricing?: DiscoveryPricing;
  apiAvailable?: boolean;
  localDeployment?: boolean;
  compliance?: DiscoveryCompliance;
  capability?: DiscoveryCapability;
  deployment?: DiscoveryDeployment;
  minContextWindow?: number;
  minTrustScore?: number;
}

export interface ToolAction {
  id: ToolActionId;
  label: string;
  href: string;
  primary?: boolean;
  requiresAuth?: boolean;
  requiresEnterprise?: boolean;
}

export interface EnterpriseCatalogPolicy {
  orgId: string;
  approvedToolIds: string[];
  blockedToolIds: string[];
  requireApproval: boolean;
  allowedTaxonomies?: DiscoveryTaxonomyId[];
  minTrustScore?: number;
  requiredCompliance?: DiscoveryCompliance[];
}

export interface EnterpriseCatalogReport {
  orgId: string;
  approvedCount: number;
  blockedCount: number;
  pendingCount: number;
  inventory: Array<{
    toolId: string;
    name: string;
    status: 'approved' | 'blocked' | 'pending';
    trustScore: number;
    usageEvents: number;
  }>;
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
  highestTrust?: Tool[];
  taxonomyHighlights?: Array<{ taxonomyId: DiscoveryTaxonomyId; tools: Tool[] }>;
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

export type {
  DiscoveryCapability,
  DiscoveryCompliance,
  DiscoveryDeployment,
  DiscoveryIntegration,
  DiscoveryModelFamily,
  DiscoveryPricing,
  DiscoveryTaxonomyId,
};
