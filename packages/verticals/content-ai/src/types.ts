import type { MembershipTier } from '@ai-pass/shared';

export const DEMO_TENANT_ID = 'tenant_demo_ai_pass';

export type HumanizeTone = 'professional' | 'casual' | 'academic';

export type DetectionLabel = 'ai' | 'human' | 'mixed';

export interface SentenceHighlight {
  index: number;
  text: string;
  aiProbability: number;
  label: DetectionLabel;
}

export interface DetectionResult {
  id: string;
  tenantId: string;
  userId: string;
  text: string;
  wordCount: number;
  aiScore: number;
  humanScore: number;
  confidence: number;
  modelHints: string[];
  sentences: SentenceHighlight[];
  trustScore: number;
  creditsUsed: number;
  createdAt: string;
}

export interface HumanizeResult {
  id: string;
  tenantId: string;
  userId: string;
  originalText: string;
  humanizedText: string;
  tone: HumanizeTone;
  modelId: string;
  providerId: string;
  trustScore: number;
  creditsUsed: number;
  createdAt: string;
}

export interface BatchJob {
  id: string;
  tenantId: string;
  type: 'detect' | 'humanize';
  status: 'pending' | 'running' | 'completed' | 'failed';
  itemCount: number;
  completedCount: number;
  creditsUsed: number;
  createdAt: string;
}

export interface ContentUsage {
  tenantId: string;
  tier: MembershipTier;
  detectsUsed: number;
  detectsLimit: number;
  humanizesUsed: number;
  humanizesLimit: number;
  creditsUsed: number;
  batchJobsThisMonth: number;
}

export interface ContentDashboard {
  tenantId: string;
  recentDetections: DetectionResult[];
  recentHumanizations: HumanizeResult[];
  usage: ContentUsage;
  avgAiScore: number;
  totalScans: number;
  totalHumanized: number;
}

export const CONTENT_AI_PRICING = {
  detectCredits: 1,
  humanizeCredits: 5,
  batchMultiplier: 0.9,
  subscriptionMonthly: 39,
  revenueShareDeveloper: 0.7,
  revenueSharePlatform: 0.3,
} as const;
