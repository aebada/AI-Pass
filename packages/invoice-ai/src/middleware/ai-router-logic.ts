import type { TaskType } from '@ai-pass/provider-hub';
import type { AIRouteResult, InvoiceAITaskType } from './types.js';

export const TASK_TYPE_MAP: Record<InvoiceAITaskType, TaskType> = {
  extraction: 'vision',
  validation: 'agent',
  fraud: 'reasoning',
  compliance: 'agent',
  chat: 'chat',
};

export const TOKEN_ESTIMATES: Record<InvoiceAITaskType, { input: number; output: number }> = {
  extraction: { input: 4000, output: 800 },
  validation: { input: 2000, output: 400 },
  fraud: { input: 3000, output: 600 },
  compliance: { input: 2500, output: 500 },
  chat: { input: 1500, output: 600 },
};

export function buildRouteResult(
  decision: AIRouteResult['decision'],
  taskType: InvoiceAITaskType,
): Pick<AIRouteResult, 'decision' | 'estimatedInputTokens' | 'estimatedOutputTokens' | 'estimatedCostUsd'> {
  const estimates = TOKEN_ESTIMATES[taskType];
  const inputCost = (estimates.input / 1_000_000) * decision.model.inputCostPer1M;
  const outputCost = (estimates.output / 1_000_000) * decision.model.outputCostPer1M;

  return {
    decision,
    estimatedInputTokens: estimates.input,
    estimatedOutputTokens: estimates.output,
    estimatedCostUsd: inputCost + outputCost,
  };
}

export function hubTaskForInvoiceTask(taskType: InvoiceAITaskType): TaskType {
  return TASK_TYPE_MAP[taskType];
}
