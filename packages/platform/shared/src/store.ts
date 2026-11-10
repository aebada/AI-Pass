import type { AppType, PricingModel, RiskLevel } from './platform.js';

export type StoreCategory =
  | 'finance'
  | 'supply_chain'
  | 'hr'
  | 'customer_support'
  | 'legal'
  | 'data_analytics'
  | 'automation'
  | 'ai_agents'
  | 'developer_tools';

export interface StoreAppMetadata {
  id: string;
  name: string;
  description: string;
  category: StoreCategory;
  appType: AppType;
  useCase: string;
  features: string[];
  inputTypes: string[];
  outputTypes: string[];
  pricingModel: PricingModel;
  modelsUsed: string[];
  riskLevel: RiskLevel;
  permissions: string[];
  developerId: string;
  version: string;
  rating: number;
  installCount: number;
  certified: boolean;
  enterpriseReady: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppInstallation {
  id: string;
  appId: string;
  tenantId: string;
  userId: string;
  permissionsGranted: string[];
  installedAt: string;
  status: 'active' | 'suspended' | 'uninstalled';
}

export interface AppReview {
  id: string;
  appId: string;
  userId: string;
  rating: number;
  comment: string;
  verifiedUsage: boolean;
  createdAt: string;
}

export interface DeveloperProfile {
  id: string;
  name: string;
  verified: boolean;
  appCount: number;
  totalRevenue: number;
  reputationScore: number;
}

export interface StoreSearchFilters {
  keyword?: string;
  category?: StoreCategory;
  pricingModel?: PricingModel;
  riskLevel?: RiskLevel;
  certified?: boolean;
  enterpriseReady?: boolean;
  openSource?: boolean;
}
