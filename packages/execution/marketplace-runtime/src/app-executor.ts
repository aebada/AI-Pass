import { createId } from '@ai-pass/shared';
import {
  getExecutionEngine,
  type ExecuteRequest,
  type Execution,
  defaultRuntimeMonitoring,
} from '@ai-pass/runtime-core';
import type { Application } from '@ai-pass/marketplace-core';
import type { MockRuntimeSandboxFactory } from './sandbox.js';

export interface AppRunRequest {
  app: Application;
  tenantId: string;
  userId: string;
  input: Record<string, unknown>;
  goal?: string;
}

export interface AppRunResult {
  runId: string;
  appId: string;
  execution: Execution;
  sandboxAuditId?: string;
}

/**
 * Runs marketplace apps inside sandbox via runtime-core execution pipeline.
 * ALL model/skill routing goes through runtime-core Tool Router.
 */
export class MarketplaceAppExecutor {
  constructor(private sandboxFactory: MockRuntimeSandboxFactory) {}

  async run(request: AppRunRequest): Promise<AppRunResult> {
    const sandbox = this.sandboxFactory.create({
      tenantId: request.tenantId,
      mode: 'cloud',
    });

    const runId = `apprun_${createId()}`;
    const goal =
      request.goal ??
      `Execute marketplace app "${request.app.name}" with input keys: ${Object.keys(request.input).join(', ')}`;

    let execution: Execution;

    const sandboxResult = await sandbox.execute(async () => {
      const engine = getExecutionEngine();
      const { execution: exec } = await engine.execute({
        input: {
          goal,
          context: { appId: request.app.id, ...request.input },
          userId: request.userId,
          tenantId: request.tenantId,
          membershipTier: 'professional',
        },
        outputFormat: 'workflow_result',
      } satisfies ExecuteRequest);
      execution = exec;
      return { executionId: exec.id, decision: exec.output?.decision };
    });

    sandbox.dispose();

    defaultRuntimeMonitoring.recordMarketplaceRun();
    defaultRuntimeMonitoring.recordExecution(execution!);

    return {
      runId,
      appId: request.app.id,
      execution: execution!,
      sandboxAuditId: sandboxResult.auditId,
    };
  }
}
