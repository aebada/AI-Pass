import type { MembershipTier } from '@ai-pass/shared';
import { defaultRoutingEngine } from '@ai-pass/provider-hub';

export type SupportTaskType = 'chat' | 'intent' | 'summarize' | 'voice_stt' | 'voice_tts' | 'knowledge';

/** Routes AI requests via Provider Hub — no direct provider calls */
export function routeSupportRequest(params: {
  taskType: SupportTaskType;
  membershipTier: MembershipTier;
  preferredModelId?: string;
  orgId?: string;
}) {
  const taskMap: Record<SupportTaskType, 'chat' | 'embedding' | 'completion'> = {
    chat: 'chat',
    intent: 'chat',
    summarize: 'completion',
    voice_stt: 'completion',
    voice_tts: 'completion',
    knowledge: 'embedding',
  };

  return defaultRoutingEngine.select({
    taskType: taskMap[params.taskType],
    membershipTier: params.membershipTier,
    preferredModelId: params.preferredModelId,
    orgId: params.orgId,
  });
}
