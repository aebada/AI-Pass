/** AI Wallet — usage tracking & billing primitives (web, mobile, desktop) */

export interface WalletBalance {
  userId: string;
  tenantId?: string;
  creditsTotal: number;
  creditsUsed: number;
  creditsRemaining: number;
  monthlyBudgetUsd: number;
  spentUsd: number;
  daysLeftInPeriod: number;
  periodStart: string;
  periodEnd: string;
}

export interface ProviderSpendBreakdown {
  provider: string;
  amountUsd: number;
  percent: number;
  requestCount: number;
  highlight?: boolean;
}

export interface UsageRecord {
  id: string;
  userId: string;
  tenantId?: string;
  provider: string;
  model: string;
  credits: number;
  estimatedCostUsd: number;
  inputTokens?: number;
  outputTokens?: number;
  taskType?: string;
  module?: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'cancelled';
  metadata?: Record<string, unknown>;
}

export interface WalletSummary {
  balance: WalletBalance;
  spendByProvider: ProviderSpendBreakdown[];
  recentUsage: UsageRecord[];
}

export interface RecordUsageInput {
  userId: string;
  tenantId?: string;
  provider: string;
  model: string;
  credits: number;
  estimatedCostUsd: number;
  inputTokens?: number;
  outputTokens?: number;
  taskType?: string;
  module?: string;
  metadata?: Record<string, unknown>;
}
