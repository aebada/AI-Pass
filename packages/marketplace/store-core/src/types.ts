import type {
  Application,
  Installation,
  Review,
  DeveloperProfile,
  AnalyticsSnapshot,
  EnterpriseMarketplacePolicy,
  TrustCertificate,
  MarketplaceSearchFilters,
  MarketplaceSearchResult,
  Deal,
  Collection,
  RevenueShareConfig,
  RuntimeExecutionResult,
} from '@ai-pass/marketplace-core';
import type { MembershipTier } from '@ai-pass/shared';

export type {
  Application,
  Installation,
  Review,
  DeveloperProfile,
  AnalyticsSnapshot,
  EnterpriseMarketplacePolicy,
  TrustCertificate,
  MarketplaceSearchFilters,
  MarketplaceSearchResult,
  Deal,
  Collection,
  RevenueShareConfig,
  RuntimeExecutionResult,
};

/** Store-facing alias for marketplace Application */
export type AppVersion = {
  id: string;
  appId: string;
  version: string;
  changelog?: string;
  publishedAt: string;
  status: 'draft' | 'published' | 'deprecated';
};

export type Developer = DeveloperProfile;

export type Rating = Pick<Review, 'rating' | 'title' | 'comment' | 'verifiedUsage' | 'createdAt'>;

export interface Subscription {
  id: string;
  appId: string;
  tenantId: string;
  userId: string;
  planTier: MembershipTier;
  status: 'active' | 'cancelled' | 'past_due';
  startedAt: string;
  renewsAt?: string;
}

export interface CreditUsage {
  appId: string;
  skillId?: string;
  credits: number;
  provider: string;
  model: string;
  timestamp: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  tenantId: string;
  appId?: string;
  credits: number;
  type: 'install' | 'execution' | 'subscription';
  description: string;
  timestamp: string;
}

export interface Permission {
  id: string;
  label: string;
  description: string;
  required: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export type Certification = TrustCertificate;

export type Analytics = AnalyticsSnapshot;

export interface EnterpriseCatalog {
  orgId: string;
  name: string;
  appIds: string[];
  privateOnly: boolean;
  lockedVersions: Record<string, string>;
  publicAppsDisabled: boolean;
}

export type ExecutionMode =
  | 'in_app'
  | 'api'
  | 'workflow'
  | 'agent'
  | 'scheduled'
  | 'event_triggered';

export type InstallStep =
  | 'permission_review'
  | 'membership_validation'
  | 'wallet_check'
  | 'install'
  | 'activate'
  | 'workspace_add'
  | 'ready';

export interface InstallStepResult {
  step: InstallStep;
  status: 'pending' | 'passed' | 'failed' | 'skipped';
  message?: string;
}

export interface StoreInstallRequest {
  appId: string;
  tenantId: string;
  userId: string;
  userTier: MembershipTier | string;
  permissionsGranted?: string[];
  orgId?: string;
  minCredits?: number;
}

export interface StoreInstallResult {
  installation: Installation;
  steps: InstallStepResult[];
  workspaceRoute: string;
  subscription?: Subscription;
}

export interface StoreSearchFilters extends MarketplaceSearchFilters {
  semantic?: boolean;
  region?: string;
  language?: string;
  provider?: string;
}

export interface StoreAppDetail extends Application {
  versions: AppVersion[];
  permissionsDetail: Permission[];
  trustScore?: number;
  workspaceRoute: string;
  screenshots: string[];
  demoUrl?: string;
  changelog?: string;
  docsUrl?: string;
  membershipRequired: MembershipTier;
  creditsPerUse?: number;
}

export interface StoreHomeData {
  featured: Application[];
  recommended: Application[];
  trending: Application[];
  newReleases: Application[];
  enterprise: Application[];
  free: Application[];
  openSource: Application[];
  automationPacks: Application[];
  agentPacks: Application[];
  skillPacks: Application[];
  industrySolutions: Collection[];
  recentlyUpdated: Application[];
  deals: Deal[];
  collections: Collection[];
}

export interface GitHubAppMetadata {
  appId: string;
  repoUrl: string;
  readmeExcerpt: string;
  docsUrl?: string;
  syncStatus: 'pending' | 'synced' | 'error';
  lastSyncedAt?: string;
}
