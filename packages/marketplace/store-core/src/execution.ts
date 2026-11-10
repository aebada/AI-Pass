import type { Application, RuntimeExecutionResult } from '@ai-pass/marketplace-core';
import type { MarketplaceRuntimePlatform } from '@ai-pass/marketplace-runtime';
import type { ExecutionMode } from './types.js';

export interface ExecuteAppParams {
  appId: string;
  tenantId: string;
  userId: string;
  mode: ExecutionMode;
  input?: Record<string, unknown>;
  skillId?: string;
}

export class StoreExecutionService {
  constructor(private runtime: MarketplaceRuntimePlatform) {}

  async execute(params: ExecuteAppParams): Promise<RuntimeExecutionResult & { mode: ExecutionMode }> {
    const app = this.runtime.apps.get(params.appId);
    if (!app) throw new Error(`App not found: ${params.appId}`);

    if (!this.runtime.installations.isInstalled(params.appId, params.tenantId)) {
      throw new Error('App must be installed before execution');
    }

    const skillId = params.skillId ?? app.skillIds[0];
    if (!skillId) {
      return {
        success: true,
        output: { message: `Executed ${app.name} via ${params.mode}` },
        creditsUsed: 0,
        durationMs: 50,
        logs: [`store.execute mode=${params.mode}`],
        auditId: `audit_${Date.now()}`,
        mode: params.mode,
      };
    }

    const invocation = await this.runtime.skillExecutor.invoke({
      skillId,
      tenantId: params.tenantId,
      userId: params.userId,
      input: params.input ?? {},
    });

    return {
      success: invocation.status === 'completed',
      output: invocation.output,
      creditsUsed: invocation.creditsUsed,
      durationMs: 100,
      logs: [`store.execute mode=${params.mode} skill=${skillId}`],
      auditId: invocation.id,
      mode: params.mode,
    };
  }

  supportedModes(app: Application): ExecutionMode[] {
    const modes: ExecutionMode[] = ['in_app', 'api'];
    if (app.appType === 'automation_pack' || app.appType === 'agent_pack') {
      modes.push('workflow', 'agent', 'scheduled', 'event_triggered');
    }
    if (app.appType === 'hosted_saas') {
      modes.push('workflow');
    }
    return modes;
  }
}
