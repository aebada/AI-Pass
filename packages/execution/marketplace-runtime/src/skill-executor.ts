import { createId, type SkillInvocation } from '@ai-pass/shared';
import type { SkillRegistry, SkillLifecycleService, Skill } from '@ai-pass/marketplace-core';
import {
  recordSkillUsage,
  emitSkillExecuteEvent,
  type MarketplaceIntegrations,
  type LiveSyncEventEmitter,
} from '@ai-pass/marketplace-core';
import type { MockRuntimeSandboxFactory } from './sandbox.js';

export class MarketplaceSkillExecutor {
  constructor(
    private registry: SkillRegistry,
    private lifecycle: SkillLifecycleService,
    private sandboxFactory: MockRuntimeSandboxFactory,
    private integrations: MarketplaceIntegrations,
    private liveSyncEmit?: LiveSyncEventEmitter,
  ) {}

  async invoke(params: {
    skillId: string;
    tenantId: string;
    userId?: string;
    input: Record<string, unknown>;
    runtimeMode?: 'cloud' | 'edge' | 'hybrid' | 'private' | 'enterprise';
  }): Promise<SkillInvocation> {
    const userId = params.userId ?? 'system';
    const skill = this.registry.get(params.skillId);
    if (!skill) throw new Error(`Skill not found: ${params.skillId}`);

    const validation = this.lifecycle.validate(skill);
    if (!validation.valid) {
      throw new Error(`Skill validation failed: ${validation.errors.join(', ')}`);
    }

    const creditsEstimated = this.lifecycle.estimateCredits(params.skillId, params.input);
    const sandbox = this.sandboxFactory.create({
      tenantId: params.tenantId,
      mode: params.runtimeMode ?? 'cloud',
    });

    if (!sandbox.validatePermissions({ wallet: true, providerHub: true })) {
      throw new Error('Sandbox missing required permissions for skill execution');
    }

    const invocation: SkillInvocation = {
      id: `inv_${createId()}`,
      skillId: params.skillId,
      tenantId: params.tenantId,
      input: params.input,
      creditsUsed: creditsEstimated,
      status: 'running',
      startedAt: new Date().toISOString(),
    };

    const result = await sandbox.execute(async () =>
      this.lifecycle.executeMock(skill, params.input),
    );

    sandbox.dispose();

    if (!result.success) {
      invocation.status = 'failed';
      invocation.completedAt = new Date().toISOString();
      return invocation;
    }

    invocation.output = result.output;
    invocation.confidence = skill.deterministic ? 0.95 : 0.75;
    invocation.status = 'completed';
    invocation.completedAt = new Date().toISOString();
    invocation.creditsUsed = creditsEstimated;

    recordSkillUsage(this.integrations, {
      userId,
      tenantId: params.tenantId,
      skill,
      credits: creditsEstimated,
    });

    this.lifecycle.log({
      skillId: params.skillId,
      tenantId: params.tenantId,
      userId,
      action: 'execute',
      input: params.input,
      output: result.output,
      creditsUsed: creditsEstimated,
    });

    emitSkillExecuteEvent(this.liveSyncEmit, {
      skillId: params.skillId,
      userId,
      credits: creditsEstimated,
    });

    return invocation;
  }

  estimateCredits(skillId: string, input: Record<string, unknown>): number {
    return this.lifecycle.estimateCredits(skillId, input);
  }

  getSkill(skillId: string): Skill | undefined {
    return this.registry.get(skillId);
  }
}

/** Backward-compatible alias for agent-studio */
export class SkillExecutor extends MarketplaceSkillExecutor {}
