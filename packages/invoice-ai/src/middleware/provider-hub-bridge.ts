import { createManagedAuthFromEnv, createProviderHub } from '@ai-pass/provider-hub';
// GUARD: All LLM calls MUST route through Provider Hub → Model Hub. Never call OpenAI/Claude/Gemini directly.
import type { MembershipTier } from '@ai-pass/shared';
import type { InvoiceAITaskType } from './types.js';
import { hubTaskForInvoiceTask } from './ai-router-logic.js';
import { isProviderHubLive } from './provider-hub-live.js';

export { isProviderHubLive };

let cachedHub: ReturnType<typeof createProviderHub> | null = null;

export function getProviderHub() {
  if (!cachedHub) {
    cachedHub = createProviderHub({ auth: createManagedAuthFromEnv() });
  }
  return cachedHub;
}

export async function executeHubPrompt(params: {
  tenantId: string;
  userId: string;
  membershipTier: MembershipTier;
  taskType: InvoiceAITaskType;
  prompt: string;
  systemPrompt?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<{ content: string; modelId: string; providerId: string; credits: number } | null> {
  if (!isProviderHubLive()) return null;

  try {
    const hub = getProviderHub();
    const now = Date.now();
    const priorMessages = (params.history ?? []).slice(-12).map((m, i) => ({
      id: `msg_${now}_${i}`,
      role: m.role,
      content: m.content,
      createdAt: now + i,
    }));
    const response = await hub.executeRequest({
      messages: [
        ...priorMessages,
        {
          id: `msg_${now}_current`,
          role: 'user' as const,
          content: params.prompt,
          createdAt: now + priorMessages.length,
        },
      ],
      systemPrompt: params.systemPrompt,
      context: {
        userId: params.userId,
        tenantId: params.tenantId,
        membershipTier: params.membershipTier,
        taskType: hubTaskForInvoiceTask(params.taskType),
        module: 'invoice-ai',
      },
    });

    return {
      content: response.content,
      modelId: response.modelId,
      providerId: response.providerId,
      credits: response.credits,
    };
  } catch {
    return null;
  }
}
