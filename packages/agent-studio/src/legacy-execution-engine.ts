import type { AgentExecutionResult } from '@ai-pass/shared';
import type { AgentService } from './services/agent-service.js';
import type { SkillExecutor } from '@ai-pass/marketplace';
import { createId } from '@ai-pass/shared';

/** Original skill-step workflow executor — backward compatible with vertical apps */
export class AgentLegacyExecutionEngine {
  constructor(
    private registry: AgentService,
    private skillExecutor: SkillExecutor,
  ) {}

  async execute(agentId: string, input: Record<string, unknown>): Promise<AgentExecutionResult> {
    const agent = this.registry.get(agentId);
    const version = this.registry.getLatestVersion(agentId);
    if (!agent || !version) throw new Error(`Agent or workflow not found: ${agentId}`);

    const steps: AgentExecutionResult['steps'] = [];
    let creditsUsed = 0;
    let lastOutput: Record<string, unknown> = input;
    const reasons: string[] = [];
    const evidence: string[] = [];

    for (const step of version.workflowConfig.steps) {
      const started = Date.now();
      if (step.type === 'skill' && step.skillId) {
        const invocation = await this.skillExecutor.invoke({
          skillId: step.skillId,
          tenantId: 'default',
          input: lastOutput,
        });
        creditsUsed += invocation.creditsUsed;
        lastOutput = invocation.output ?? {};
        if (invocation.output?.decision) reasons.push(String(invocation.output.decision));
        evidence.push(`skill:${step.skillId}`);
        steps.push({
          stepId: step.stepId,
          skillId: step.skillId,
          input: lastOutput,
          output: invocation.output ?? {},
          durationMs: Date.now() - started,
          status: 'completed',
        });
      }
    }

    const decision = (lastOutput.decision as AgentExecutionResult['output']['decision']) ?? 'NEEDS_INFO';

    return {
      id: `exec_${createId()}`,
      agentId,
      input,
      output: {
        decision,
        reasons: reasons.length ? reasons : ['Workflow completed'],
        evidence,
        confidence: 0.85,
      },
      steps,
      status: 'completed',
      creditsUsed,
      timestamp: new Date().toISOString(),
    };
  }
}

/** @deprecated Use ExecutionService for runtime-core lifecycle; kept for vertical app compat */
export class ExecutionEngine extends AgentLegacyExecutionEngine {}
