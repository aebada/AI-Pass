import { createManagedAuthFromEnv, createProviderHub } from '@ai-pass/provider-hub';
import type { MembershipTier } from '@ai-pass/shared';
import { isProviderHubLive } from './provider-hub-live.js';

export { isProviderHubLive };

let cachedHub: ReturnType<typeof createProviderHub> | null = null;

export function getProviderHub() {
  if (!cachedHub) {
    cachedHub = createProviderHub({ auth: createManagedAuthFromEnv() });
  }
  return cachedHub;
}

export async function executeTwinPrompt(params: {
  userId: string;
  membershipTier: MembershipTier;
  prompt: string;
  systemPrompt: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<{ content: string; modelId: string; providerId: string; credits: number } | null> {
  if (!isProviderHubLive()) return null;

  try {
    const hub = getProviderHub();
    const now = Date.now();
    const priorMessages = (params.history ?? []).slice(-12).map((m, i) => ({
      id: `twin-${now}-${i}`,
      role: m.role,
      content: m.content,
      createdAt: now + i,
    }));
    const response = await hub.executeRequest({
      messages: [
        ...priorMessages,
        {
          id: `twin-${now}-current`,
          role: 'user' as const,
          content: params.prompt,
          createdAt: now + priorMessages.length,
        },
      ],
      systemPrompt: params.systemPrompt,
      context: {
        userId: params.userId,
        membershipTier: params.membershipTier,
        taskType: 'chat',
        module: 'digital-twin',
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
