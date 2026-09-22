import type { MembershipTier } from '@ai-pass/shared';
import { defaultRoutingEngine } from '@ai-pass/provider-hub';

export type SalesTaskType =
  | 'email'
  | 'linkedin'
  | 'proposal'
  | 'meeting_prep'
  | 'copilot'
  | 'personalization'
  | 'scoring';

/** Routes AI requests via Provider Hub — no direct provider calls */
export function routeSalesRequest(params: {
  taskType: SalesTaskType;
  membershipTier: MembershipTier;
  preferredModelId?: string;
  orgId?: string;
}) {
  const taskMap: Record<SalesTaskType, 'chat' | 'embedding' | 'completion'> = {
    email: 'chat',
    linkedin: 'chat',
    proposal: 'completion',
    meeting_prep: 'completion',
    copilot: 'chat',
    personalization: 'embedding',
    scoring: 'chat',
  };

  return defaultRoutingEngine.select({
    taskType: taskMap[params.taskType],
    membershipTier: params.membershipTier,
    preferredModelId: params.preferredModelId,
    orgId: params.orgId,
  });
}
