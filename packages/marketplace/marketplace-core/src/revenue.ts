import type { RevenueShareConfig, RevenueShareRecord } from './types.js';
import { DEFAULT_REVENUE_SHARE } from './constants.js';

export class RevenueShareEngine {
  constructor(private config: RevenueShareConfig = DEFAULT_REVENUE_SHARE) {}

  setConfig(config: RevenueShareConfig): void {
    this.config = config;
  }

  getConfig(): RevenueShareConfig {
    return { ...this.config };
  }

  calculate(params: {
    developerId: string;
    appId: string;
    grossRevenue: number;
    period: string;
    currency?: string;
  }): RevenueShareRecord {
    const platformFee = params.grossRevenue * this.config.platformFee;
    return {
      developerId: params.developerId,
      appId: params.appId,
      period: params.period,
      grossRevenue: params.grossRevenue,
      platformFee,
      developerPayout: params.grossRevenue * this.config.developerShare,
      currency: params.currency ?? 'USD',
    };
  }
}
