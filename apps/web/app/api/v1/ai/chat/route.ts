import type { Session } from 'next-auth';
import { auth } from '@/auth';
import { createHubContext, MODEL_CATALOG } from '@ai-pass/provider-hub';
import { defaultMembershipService } from '@ai-pass/membership';
import { defaultWalletService } from '@ai-pass/wallet';
import { createMessage } from '@ai-pass/shared';
import { getPlatformHub, getUserMembershipTier } from '@/lib/ai-platform';

export const runtime = 'nodejs';

interface ChatBody {
  messages?: Array<{ role: string; content: string }>;
  modelId?: string;
  prompt?: string;
}

function resolveUserId(session: Session): string {
  return session.user?.id ?? session.authSession?.userId ?? 'anonymous';
}

export async function POST(request: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Sign in with Google to use AI chat.' }, { status: 401 });
  }

  const userId = resolveUserId(session);
  const body = (await request.json()) as ChatBody;
  const modelId = body.modelId ?? 'gpt-4o-mini';

  const model = MODEL_CATALOG.find((m) => m.id === modelId);
  if (!model) {
    return Response.json({ error: `Unknown model: ${modelId}` }, { status: 400 });
  }

  const tier = getUserMembershipTier(userId);
  if (!defaultMembershipService.canAccessModel(tier, model.id, model.tier, model.providerId)) {
    return Response.json(
      { error: `Model "${model.displayName}" requires a higher plan. Upgrade to unlock.` },
      { status: 403 },
    );
  }

  const membershipCheck = defaultMembershipService.checkRequest(userId, tier);
  if (!membershipCheck.allowed) {
    return Response.json({ error: membershipCheck.reason ?? 'Request limit reached' }, { status: 429 });
  }

  const balance = defaultWalletService.getBalance(userId);
  if (balance.creditsRemaining <= 0) {
    return Response.json({ error: 'Monthly credits exhausted. Upgrade or wait for renewal.' }, { status: 402 });
  }

  const messages =
    body.messages?.map((m) => createMessage(m.role as 'user' | 'assistant' | 'system', m.content)) ??
    (body.prompt ? [createMessage('user', body.prompt)] : []);

  if (messages.length === 0) {
    return Response.json({ error: 'messages or prompt required' }, { status: 400 });
  }

  const hub = getPlatformHub();
  const ctx = createHubContext(userId, tier, {
    taskType: 'chat',
    module: 'playground',
    preferredModelId: modelId,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of hub.streamChat({ messages, modelId }, ctx)) {
          if (chunk.type === 'text' && chunk.content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: chunk.content })}\n\n`));
          } else if (chunk.type === 'error') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: chunk.error })}\n\n`));
          } else if (chunk.type === 'done') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Stream failed';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: message })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
