import type { PricingModel, RiskLevel, SkillCategory } from './platform.js';

export interface AgentSkill {
  id: string;
  name: string;
  version: string;
  developerId: string;
  category: SkillCategory;
  riskLevel: RiskLevel;
  planTierRequired: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  creditCost: number;
  deterministic: boolean;
  explainabilityRequired: boolean;
  platforms: string[];
  createdAt: string;
}

export interface SkillInvocation {
  id: string;
  skillId: string;
  tenantId: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  confidence?: number;
  creditsUsed: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
}

export interface MarketplaceApp {
  id: string;
  name: string;
  slug: string;
  developerId: string;
  pricingModel: PricingModel;
  riskLevel: RiskLevel;
  supportedPlatforms: string[];
  skills: string[];
  certified: boolean;
  featured: boolean;
  trending: boolean;
}

export interface RevenueShare {
  developerId: string;
  appId: string;
  period: string;
  grossRevenue: number;
  platformFee: number;
  developerPayout: number;
  currency: string;
}

export const DEFAULT_PLATFORM_FEE = 0.3;
export const DEFAULT_DEVELOPER_SHARE = 0.7;
