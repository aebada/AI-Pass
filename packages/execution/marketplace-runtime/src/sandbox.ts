import { createId } from '@ai-pass/shared';
import type {
  RuntimeSandbox,
  RuntimeSandboxConfig,
  RuntimeExecutionResult,
  SandboxPermissions,
} from '@ai-pass/marketplace-core';
import { createSandboxConfig } from '@ai-pass/marketplace-core';

export class MockRuntimeSandbox implements RuntimeSandbox {
  readonly config: RuntimeSandboxConfig;
  private disposed = false;

  constructor(config: RuntimeSandboxConfig) {
    this.config = config;
  }

  validatePermissions(required: Partial<SandboxPermissions>): boolean {
    for (const [key, value] of Object.entries(required)) {
      if (value && !this.config.permissions[key as keyof SandboxPermissions]) {
        return false;
      }
    }
    return true;
  }

  getLimits() {
    return { ...this.config.limits };
  }

  async execute<T = Record<string, unknown>>(fn: () => Promise<T>): Promise<RuntimeExecutionResult> {
    if (this.disposed) {
      return {
        success: false,
        error: 'Sandbox disposed',
        creditsUsed: 0,
        durationMs: 0,
        logs: [],
        auditId: `audit_${createId()}`,
      };
    }

    const started = Date.now();
    const logs: string[] = [`[sandbox:${this.config.mode}] tenant=${this.config.tenantId} executing`];

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Sandbox timeout')), this.config.limits.timeoutMs);
      });

      const output = await Promise.race([fn(), timeoutPromise]) as T;
      const durationMs = Date.now() - started;
      logs.push(`[sandbox] completed in ${durationMs}ms`);

      return {
        success: true,
        output: output as Record<string, unknown>,
        creditsUsed: 0,
        durationMs,
        logs,
        auditId: `audit_${createId()}`,
      };
    } catch (err) {
      const durationMs = Date.now() - started;
      const message = err instanceof Error ? err.message : 'Unknown error';
      logs.push(`[sandbox] error: ${message}`);
      return {
        success: false,
        error: message,
        creditsUsed: 0,
        durationMs,
        logs,
        auditId: `audit_${createId()}`,
      };
    }
  }

  dispose(): void {
    this.disposed = true;
  }
}

export class MockRuntimeSandboxFactory {
  create(config: Partial<RuntimeSandboxConfig> & { tenantId: string }): RuntimeSandbox {
    const full = createSandboxConfig(config.tenantId, config.mode ?? 'cloud');
    return new MockRuntimeSandbox({
      ...full,
      ...config,
      limits: { ...full.limits, ...config.limits },
      permissions: { ...full.permissions, ...config.permissions },
    });
  }
}
