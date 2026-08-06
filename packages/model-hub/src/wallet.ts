/** AI Wallet credit deduction stub — per-request metering */

export interface CreditDeductionRequest {
  userId: string;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  creditsPerInput1K: number;
  creditsPerOutput1K: number;
}

export interface CreditDeductionResult {
  creditsDeducted: number;
  balanceBefore: number;
  balanceAfter: number;
  recorded: boolean;
}

const balances = new Map<string, number>();

const DEFAULT_BALANCE = 500;

export function getWalletBalance(userId: string): number {
  return balances.get(userId) ?? DEFAULT_BALANCE;
}

export function deductCredits(request: CreditDeductionRequest): CreditDeductionResult {
  const inputCredits = (request.inputTokens / 1000) * request.creditsPerInput1K;
  const outputCredits = (request.outputTokens / 1000) * request.creditsPerOutput1K;
  const creditsDeducted = Math.max(0.1, Math.ceil((inputCredits + outputCredits) * 10) / 10);

  const balanceBefore = getWalletBalance(request.userId);
  const balanceAfter = Math.max(0, balanceBefore - creditsDeducted);
  balances.set(request.userId, balanceAfter);

  return {
    creditsDeducted,
    balanceBefore,
    balanceAfter,
    recorded: true,
  };
}

export function estimateRequestCredits(
  inputTokens: number,
  outputTokens: number,
  creditsPerInput1K: number,
  creditsPerOutput1K: number,
): number {
  const inputCredits = (inputTokens / 1000) * creditsPerInput1K;
  const outputCredits = (outputTokens / 1000) * creditsPerOutput1K;
  return Math.max(0.1, Math.ceil((inputCredits + outputCredits) * 10) / 10);
}

export function topUpCredits(userId: string, amount: number): number {
  const current = getWalletBalance(userId);
  const next = current + amount;
  balances.set(userId, next);
  return next;
}
