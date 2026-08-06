import type { Plan } from '@ai-pass/runtime-core';
import { AbstractAgent } from './agent-interface.js';
import type { AgentConfig, AgentExecutionContext, AgentStepResult } from './types.js';

/**
 * Default reusable agent — delegates planning/execution to runtime-core in production.
 * Domain agents override hooks; GenericAgent covers custom wizard-created agents.
 */
export class GenericAgent extends AbstractAgent {
  constructor(config: AgentConfig) {
    super(config);
  }

  async plan(context: AgentExecutionContext): Promise<AgentStepResult<{ plan?: Plan }>> {
    this.transition('planning', 'planning');
    this.log('info', 'Planning goal', { goal: context.input.goal });

    const stubPlan: Plan = {
      id: `plan_${context.executionId}`,
      input: context.input,
      tasks: [],
      requiredTools: this.config.tools.toolIds,
      requiredSkills: this.config.skills.map((s) => s.skillId),
      requiredModels: [this.config.model.primaryModelId],
      estimatedCredits: 0,
      estimatedCostUsd: 0,
      summary: `Plan for: ${context.input.goal}`,
      createdAt: new Date().toISOString(),
    };

    return { success: true, phase: 'planning', output: { plan: stubPlan } };
  }

  async reason(context: AgentExecutionContext): Promise<AgentStepResult> {
    this.transition('reasoning');
    this.log('debug', 'Reasoning over plan and context', { agentId: context.agentId });
    return { success: true, phase: 'reasoning', output: { rationale: 'Stub reasoning step' } };
  }

  async execute(context: AgentExecutionContext): Promise<AgentStepResult> {
    this.transition('executing', 'executing');
    this.log('info', 'Executing agent workflow', {
      executionId: context.executionId,
      workflowId: this.config.workflowId,
    });
    return {
      success: true,
      phase: 'executing',
      output: {
        decision: 'pending',
        message: 'GenericAgent execute stub — wire to @ai-pass/runtime-core ExecutionEngine',
        input: context.input,
      },
    };
  }
}

/** Factory for domain agents — extend GenericAgent per vertical */
export function createDomainAgent(config: AgentConfig): GenericAgent {
  return new GenericAgent(config);
}

/** Example domain agent stubs — override in vertical packages (invoice-ai, supply-chain-ai, etc.) */
export class InvoiceAgent extends GenericAgent {
  override async plan(context: AgentExecutionContext): Promise<AgentStepResult<{ plan?: Plan }>> {
    this.log('info', 'Invoice domain planning', { goal: context.input.goal });
    return super.plan(context);
  }
}

export class HrAgent extends GenericAgent {}
export class SupplyChainAgent extends GenericAgent {}
