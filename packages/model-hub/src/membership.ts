import type { MembershipPlanGate } from './types.js';

export const PLAN_GATES: Record<
  MembershipPlanGate,
  { label: string; maxModels: number; frontierModels: boolean; fineTuning: boolean; byoKeys: boolean }
> = {
  free: { label: 'Free', maxModels: 5, frontierModels: false, fineTuning: false, byoKeys: false },
  professional: { label: 'Professional', maxModels: 20, frontierModels: false, fineTuning: false, byoKeys: true },
  power: { label: 'Power', maxModels: 50, frontierModels: true, fineTuning: false, byoKeys: true },
  enterprise: { label: 'Enterprise', maxModels: 999, frontierModels: true, fineTuning: true, byoKeys: true },
};

const FREE_MODEL_IDS = new Set(['gpt-4o-mini', 'gemini-flash', 'deepseek-free', 'deepseek-r1-free', 'llama-3.3-70b', 'groq-llama-70b', 'ollama-llama3', 'hf-mistral-7b']);
const POWER_ONLY_IDS = new Set([
  'gpt-5',
  'gpt-5.6-sol',
  'claude-opus-4',
  'claude-opus-5',
  'o3-mini',
  'grok-2',
  'grok-4.5',
  'kimi-k3',
  'gemini-3.1-pro',
  'cerebras-llama',
  'cerebras-70b',
  'sambanova-llama',
  'sambanova-deepseek',
]);

export function canAccessModel(plan: MembershipPlanGate, modelId: string): boolean {
  if (FREE_MODEL_IDS.has(modelId)) return true;
  if (plan === 'free') return false;
  if (POWER_ONLY_IDS.has(modelId) && plan !== 'power' && plan !== 'enterprise') return false;
  if (modelId.startsWith('aipass-')) {
    if (modelId === 'aipass-general') return true;
    return plan === 'enterprise';
  }
  return true;
}

export function getPlanEntitlements(plan: MembershipPlanGate) {
  return PLAN_GATES[plan];
}

export function listAllowedModelIds(plan: MembershipPlanGate, allIds: string[]): string[] {
  return allIds.filter((id) => canAccessModel(plan, id));
}
