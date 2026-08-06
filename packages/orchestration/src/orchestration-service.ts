import { getExecutionEngine } from '@ai-pass/runtime-core';
import type { ExecuteRequest, OutputFormat, PlanInput } from '@ai-pass/runtime-core';
import type {
  OrchestrationExecuteRequest,
  OrchestrationExecuteResponse,
  OrchestrationPlanRequest,
  OrchestrationPlanResponse,
} from './types.js';

export class OrchestrationService {
  plan(request: OrchestrationPlanRequest): OrchestrationPlanResponse {
    const engine = getExecutionEngine();
    const { plan } = engine.plan({ input: request.input });
    return { plan };
  }

  async execute(request: OrchestrationExecuteRequest): Promise<OrchestrationExecuteResponse> {
    const engine = getExecutionEngine();
    const body: ExecuteRequest = {
      planId: request.planId,
      plan: request.plan,
      input: request.input,
      mode: request.mode ?? 'sequential',
      outputFormat: (request.outputFormat ?? 'executive_summary') as OutputFormat,
    };
    const { execution } = await engine.execute(body);
    return { execution };
  }

  planFromGoal(goal: string, extras?: Partial<PlanInput>): OrchestrationPlanResponse {
    return this.plan({
      input: {
        goal,
        membershipTier: 'professional',
        userId: 'demo-user',
        ...extras,
      },
    });
  }
}

let singleton: OrchestrationService | undefined;

export function getOrchestrationService(): OrchestrationService {
  if (!singleton) singleton = new OrchestrationService();
  return singleton;
}
