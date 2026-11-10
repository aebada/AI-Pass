import type {
  RuntimeSandboxConfig,
  RuntimeExecutionResult,
  SandboxLimits,
  SandboxPermissions,
} from './types.js';
import { DEFAULT_SANDBOX_LIMITS } from './constants.js';

/** Runtime sandbox interface — all apps execute inside AI-Pass runtime */
export interface RuntimeSandbox {
  readonly config: RuntimeSandboxConfig;
  execute<T = Record<string, unknown>>(fn: () => Promise<T>): Promise<RuntimeExecutionResult>;
  validatePermissions(required: Partial<SandboxPermissions>): boolean;
  getLimits(): SandboxLimits;
  dispose(): void;
}

export interface RuntimeSandboxFactory {
  create(config: Partial<RuntimeSandboxConfig> & { tenantId: string }): RuntimeSandbox;
}

export function defaultSandboxPermissions(mode: RuntimeSandboxConfig['mode']): SandboxPermissions {
  switch (mode) {
    case 'enterprise':
    case 'private':
      return { network: false, filesystem: false, wallet: true, providerHub: true, tenantData: true };
    case 'edge':
      return { network: true, filesystem: false, wallet: true, providerHub: true, tenantData: false };
    default:
      return { network: true, filesystem: false, wallet: true, providerHub: true, tenantData: true };
  }
}

export function createSandboxConfig(
  tenantId: string,
  mode: RuntimeSandboxConfig['mode'] = 'cloud',
): RuntimeSandboxConfig {
  return {
    mode,
    tenantId,
    limits: { ...DEFAULT_SANDBOX_LIMITS },
    permissions: defaultSandboxPermissions(mode),
  };
}
