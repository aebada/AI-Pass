import type {
  ProviderSpendBreakdown,
  RecordUsageInput,
  UsageRecord,
  WalletBalance,
  WalletSummary,
} from '@ai-pass/shared';
import { createId } from '@ai-pass/shared';

const DEFAULT_FREE_CREDITS = 500;

function readFreeCreditsFromEnv(): number {
  const parsed = Number.parseInt(process.env.FREE_MONTHLY_CREDITS ?? '500', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_FREE_CREDITS;
}

function periodBounds(now = new Date()): { start: Date; end: Date } {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export class WalletService {
  private balances = new Map<string, WalletBalance>();
  private usageHistory = new Map<string, UsageRecord[]>();
  private providerSpend = new Map<string, ProviderSpendBreakdown[]>();

  hasUser(userId: string): boolean {
    return this.balances.has(userId);
  }

  /** Initialize wallet for new users with free starter credits */
  initializeNewUser(userId: string, freeCredits = readFreeCreditsFromEnv()): WalletBalance {
    const now = new Date();
    const { start, end } = periodBounds(now);
    const balance: WalletBalance = {
      userId,
      creditsTotal: freeCredits,
      creditsUsed: 0,
      creditsRemaining: freeCredits,
      monthlyBudgetUsd: 0,
      spentUsd: 0,
      daysLeftInPeriod: Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000)),
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
    };
    this.balances.set(userId, balance);
    return balance;
  }

  private maybeResetMonthlyPeriod(balance: WalletBalance): void {
    const now = new Date();
    const periodEnd = new Date(balance.periodEnd);
    if (now <= periodEnd) return;

    const freeCredits = readFreeCreditsFromEnv();
    const { start, end } = periodBounds(now);
    balance.creditsTotal = freeCredits;
    balance.creditsUsed = 0;
    balance.creditsRemaining = freeCredits;
    balance.spentUsd = 0;
    balance.periodStart = start.toISOString();
    balance.periodEnd = end.toISOString();
    balance.daysLeftInPeriod = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
    this.balances.set(balance.userId, balance);
  }

  getBalance(userId: string): WalletBalance {
    const existing = this.balances.get(userId);
    if (existing) {
      this.maybeResetMonthlyPeriod(existing);
      return this.balances.get(userId)!;
    }

    return this.initializeNewUser(userId);
  }

  getSpendByProvider(userId: string): ProviderSpendBreakdown[] {
    if (!this.providerSpend.has(userId)) {
      this.providerSpend.set(userId, []);
    }
    return this.providerSpend.get(userId)!;
  }

  getRecentUsage(userId: string, limit = 20): UsageRecord[] {
    const history = this.usageHistory.get(userId) ?? [];
    return history.slice(0, limit);
  }

  getSummary(userId: string): WalletSummary {
    return {
      balance: this.getBalance(userId),
      spendByProvider: this.getSpendByProvider(userId),
      recentUsage: this.getRecentUsage(userId),
    };
  }

  recordUsage(input: RecordUsageInput): UsageRecord {
    const record: UsageRecord = {
      id: createId(),
      userId: input.userId,
      tenantId: input.tenantId,
      provider: input.provider,
      model: input.model,
      credits: input.credits,
      estimatedCostUsd: input.estimatedCostUsd,
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      taskType: input.taskType,
      module: input.module,
      timestamp: new Date().toISOString(),
      status: 'completed',
      metadata: input.metadata,
    };

    const history = this.usageHistory.get(input.userId) ?? [];
    history.unshift(record);
    this.usageHistory.set(input.userId, history);

    const balance = this.getBalance(input.userId);
    balance.creditsUsed += input.credits;
    balance.creditsRemaining = Math.max(0, balance.creditsTotal - balance.creditsUsed);
    balance.spentUsd += input.estimatedCostUsd;
    this.balances.set(input.userId, balance);

    this.updateProviderSpend(input.userId, input.provider, input.estimatedCostUsd);

    return record;
  }

  private updateProviderSpend(userId: string, provider: string, amountUsd: number): void {
    const spend = this.getSpendByProvider(userId);
    const entry = spend.find((s) => s.provider.toLowerCase() === provider.toLowerCase());
    if (entry) {
      entry.amountUsd += amountUsd;
      entry.requestCount += 1;
    } else {
      spend.push({ provider, amountUsd, percent: 0, requestCount: 1 });
    }

    const total = spend.reduce((sum, s) => sum + s.amountUsd, 0);
    for (const s of spend) {
      s.percent = total > 0 ? Math.round((s.amountUsd / total) * 100) : 0;
    }
    this.providerSpend.set(userId, spend);
  }
}

export const defaultWalletService = new WalletService();
