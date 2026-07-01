import { generateExecutionPlan, getExecutionEngine } from '@ai-pass/runtime-core';
import type { PlanInput, PlanRequest, PlanResponse } from '@ai-pass/runtime-core';
import type { AgentService } from './agent-service.js';
import type { PlannerRequest, PlannerResult } from '../types.js';

export class PlannerService {
  constructor(private agents: AgentService) {}

  plan(request: PlannerRequest): PlannerResult {
    const agent = this.agents.get(request.agentId);
    const goal = request.goal || agent?.description || 'Execute agent task';

    const input: PlanInput = {
      goal,
      context: {
        agentId: request.agentId,
        agentName: agent?.name,
        agentType: agent?.agentType,
        skillIds: agent?.skillIds,
        ...request.context,
      },
      constraints: request.constraints,
      tenantId: agent?.tenantId,
    };

    const plan = generateExecutionPlan(input);
    return { plan, agentId: request.agentId };
  }

  planRaw(request: PlanRequest): PlanResponse {
    const engine = getExecutionEngine();
    return engine.plan(request);
  }
}
