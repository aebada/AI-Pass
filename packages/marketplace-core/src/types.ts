import type { PricingModel, RiskLevel } from '@ai-pass/shared';

/** Skill categories for agent capabilities */
export type MarketplaceSkillCategory =
  | 'parsing'
  | 'ocr'
  | 'retrieval'
  | 'decision'
  | 'automation'
  | 'analytics'
  | 'translation'
  | 'voice'
  | 'vision'
  | 'compliance'
  | 'knowledge'
  | 'api_integration'
  | 'computer_action'
  | 'communication'
  | 'reasoning'
  | 'rag'
  | 'custom';

/** Application types in the marketplace */
export type ApplicationType =
  | 'hosted_saas'
  | 'github_app'
  | 'external_app'
  | 'automation_pack'
  | 'agent_pack'
  | 'skill_pack'
  | 'enterprise_app'
  | 'private_app';

/** Marketplace browse categories */
export type MarketplaceCategory =
  | 'finance'
  | 'supply_chain'
  | 'hr'
  | 'customer_support'
  | 'marketing'
  | 'sales'
  | 'legal'
  | 'healthcare'
  | 'manufacturing'
  | 'education'
  | 'automation'
  | 'developer_tools'
  | 'ai_agents'
  | 'compliance'
  | 'analytics'
  | 'knowledge'
  | 'voice_ai'
  | 'vision_ai'
  | 'iot'
  | 'custom';

export type RuntimeMode = 'cloud' | 'edge' | 'hybrid' | 'private' | 'enterprise';

export type PromotionType = 'featured' | 'trending' | 'sponsored' | 'editors_pick' | 'deal';

export type InstallationStatus = 'pending' | 'active' | 'suspended' | 'uninstalled';

export type SkillLifecycleStatus = 'draft' | 'review' | 'published' | 'deprecated' | 'archived';

export interface Developer {
  id: string;
  email: string;
  name: string;
  company?: string;
  verified: boolean;
  createdAt: string;
}

export interface DeveloperProfile extends Developer {
  slug: string;
  bio?: string;
  website?: string;
  avatarUrl?: string;
  appCount: number;
  skillCount: number;
  totalRevenue: number;
  reputationScore: number;
  badges: TrustBadge[];
}

export interface TrustBadge {
  type:
    | 'verified_developer'
    | 'certified'
    | 'enterprise_ready'
    | 'open_source'
    | 'compliance_ready'
    | 'trust_score';
  label: string;
  issuedAt: string;
  score?: number;
}

export interface TrustCertificate {
  id: string;
  resourceType: 'app' | 'skill';
  resourceId: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  status: 'pending' | 'certified' | 'expired' | 'revoked';
  validFrom: string;
  validUntil: string;
  verificationUrl: string;
}

export interface Version {
  id: string;
  resourceType: 'app' | 'skill';
  resourceId: string;
  version: string;
  changelog?: string;
  publishedAt: string;
  status: 'draft' | 'published' | 'deprecated';
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  developerId: string;
  category: MarketplaceSkillCategory;
  riskLevel: RiskLevel;
  planTierRequired: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  creditCost: number;
  deterministic: boolean;
  explainabilityRequired: boolean;
  permissions: string[];
  compatibleModels: string[];
  dependencies: string[];
  platforms: string[];
  tags: string[];
  modelsUsed: string[];
  lifecycleStatus: SkillLifecycleStatus;
  certified: boolean;
  featured: boolean;
  trending: boolean;
  installCount: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  name: string;
  slug: string;
  description: string;
  developerId: string;
  appType: ApplicationType;
  category: MarketplaceCategory;
  pricingModel: PricingModel;
  priceMonthly?: number;
  pricePerUse?: number;
  riskLevel: RiskLevel;
  supportedPlatforms: string[];
  skillIds: string[];
  modelsUsed: string[];
  tags: string[];
  permissions: string[];
  certified: boolean;
  enterpriseReady: boolean;
  openSource: boolean;
  featured: boolean;
  trending: boolean;
  sponsored: boolean;
  installCount: number;
  rating: number;
  reviewCount: number;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface Installation {
  id: string;
  appId: string;
  tenantId: string;
  userId: string;
  permissionsGranted: string[];
  status: InstallationStatus;
  runtimeMode: RuntimeMode;
  installedAt: string;
  activatedAt?: string;
}

export interface Review {
  id: string;
  resourceType: 'app' | 'skill';
  resourceId: string;
  userId: string;
  rating: number;
  title?: string;
  comment: string;
  verifiedUsage: boolean;
  developerReply?: string;
  developerReplyAt?: string;
  abuseReported?: boolean;
  abuseReason?: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: PromotionType;
  resourceIds: string[];
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  appIds: string[];
  validUntil: string;
  code?: string;
}

export interface AnalyticsSnapshot {
  resourceType: 'app' | 'skill' | 'developer';
  resourceId: string;
  period: string;
  installs: number;
  activeUsers: number;
  invocations: number;
  creditsConsumed: number;
  revenue: number;
  uniqueUsers: number;
  crashes: number;
  avgLatencyMs: number;
  retentionRate: number;
}

export interface DeveloperApiKey {
  id: string;
  developerId: string;
  label: string;
  keyPrefix: string;
  sandbox: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export interface DeveloperPayoutStub {
  developerId: string;
  period: string;
  grossRevenue: number;
  platformFee: number;
  netPayout: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid';
}

export interface SecurityReviewResult {
  resourceType: 'app' | 'skill';
  resourceId: string;
  staticAnalysis: { passed: boolean; issues: string[] };
  dependencyScan: { passed: boolean; vulnerabilities: string[] };
  permissionReview: { passed: boolean; excessive: string[] };
  aiSafety: { passed: boolean; flags: string[] };
  riskLevel: RiskLevel;
  approved: boolean;
  reviewedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  appIds: string[];
  skillIds: string[];
  featured: boolean;
}

export interface IndustryPack {
  id: string;
  name: string;
  industry: MarketplaceCategory;
  description: string;
  appIds: string[];
  skillIds: string[];
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  appIds: string[];
  validUntil: string;
  active: boolean;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  appIds: string[];
  discountPercent: number;
}

export interface RevenueShareConfig {
  developerShare: number;
  platformFee: number;
}

export interface RevenueShareRecord {
  developerId: string;
  appId: string;
  period: string;
  grossRevenue: number;
  platformFee: number;
  developerPayout: number;
  currency: string;
}

export interface SandboxLimits {
  memoryMb: number;
  cpuPercent: number;
  timeoutMs: number;
  maxConcurrent: number;
}

export interface SandboxPermissions {
  network: boolean;
  filesystem: boolean;
  wallet: boolean;
  providerHub: boolean;
  tenantData: boolean;
}

export interface RuntimeSandboxConfig {
  mode: RuntimeMode;
  tenantId: string;
  limits: SandboxLimits;
  permissions: SandboxPermissions;
}

export interface RuntimeExecutionResult {
  success: boolean;
  output?: Record<string, unknown>;
  error?: string;
  creditsUsed: number;
  durationMs: number;
  logs: string[];
  auditId: string;
}

export interface SkillAuditLog {
  id: string;
  skillId: string;
  tenantId: string;
  userId: string;
  action: 'validate' | 'estimate' | 'execute' | 'version_publish';
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  creditsEstimated?: number;
  creditsUsed?: number;
  timestamp: string;
}

export interface MarketplaceSearchFilters {
  keyword?: string;
  category?: MarketplaceCategory;
  skillCategory?: MarketplaceSkillCategory;
  industry?: string;
  model?: string;
  developerId?: string;
  pricing?: PricingModel;
  tags?: string[];
  certified?: boolean;
  enterpriseReady?: boolean;
  openSource?: boolean;
  verified?: boolean;
  trending?: boolean;
  topRated?: boolean;
  free?: boolean;
  paid?: boolean;
  appType?: ApplicationType;
}

export interface MarketplaceSearchResult {
  apps: Application[];
  skills: Skill[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EnterpriseMarketplacePolicy {
  orgId: string;
  privateStoreEnabled: boolean;
  requireApproval: boolean;
  allowedCategories: MarketplaceCategory[];
  blockedModels: string[];
  approvedAppIds: string[];
  pendingAppIds: string[];
  rejectedAppIds: string[];
}
