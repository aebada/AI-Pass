import { defaultRoutingEngine, type RoutingDecision, type RoutingEngine } from '@ai-pass/provider-hub';
import type { MembershipTier } from '@ai-pass/shared';
import type { AIRouteRequest, AIRouteResult } from './types.js';
import { buildRouteResult, hubTaskForInvoiceTask } from './ai-router-logic.js';

export class AIRouter {
  constructor(private routing: RoutingEngine = defaultRoutingEngine) {}

  select(request: AIRouteRequest): AIRouteResult {
    const decision = this.routing.select({
      taskType: hubTaskForInvoiceTask(request.taskType),
      membershipTier: request.membershipTier,
      orgId: request.orgId,
      preferSpeed: request.preferSpeed ?? request.taskType === 'extraction',
      preferQuality: request.preferQuality ?? request.taskType === 'fraud',
      preferCost: request.preferCost,
      preferredModelId: request.preferredModelId,
    });

    return buildRouteResult(decision, request.taskType);
  }

  getDecisionForTier(taskType: AIRouteRequest['taskType'], tier: MembershipTier): RoutingDecision {
    return this.select({ taskType, tenantId: '', userId: '', membershipTier: tier }).decision;
  }
}

export const defaultAIRouter = new AIRouter();
