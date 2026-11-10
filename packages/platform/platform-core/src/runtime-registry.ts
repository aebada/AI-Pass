import { defaultModuleRegistry } from './module-registry.js';

/** Optional runtime bridge — wire from @ai-pass/runtime-core at app bootstrap */
export interface PlatformRuntimeBridge {
  execute?(request: unknown): Promise<unknown>;
  plan?(request: unknown): Promise<unknown>;
}

let runtimeBridge: PlatformRuntimeBridge | undefined;

/** Register runtime-core module and attach optional bridge */
export function wireRuntimeToPlatform(bridge?: PlatformRuntimeBridge): void {
  if (bridge) runtimeBridge = bridge;

  defaultModuleRegistry.register({
    id: 'runtime-core',
    name: 'Runtime Core',
    description: 'AI agent execution engine — planner, router, evaluator',
    route: '/workspace/execution',
    icon: '⚙',
    category: 'infrastructure',
    tier: 'free',
    status: 'done',
    permissions: ['workspace:read'],
    dependencies: ['provider-hub', 'wallet', 'marketplace'],
    navOrder: 0,
    showInNav: false,
  });

  (defaultModuleRegistry as ModuleRegistryWithRuntime).runtime = runtimeBridge;
}

export interface ModuleRegistryWithRuntime {
  runtime?: PlatformRuntimeBridge;
}

export function getPlatformRuntime(): PlatformRuntimeBridge | undefined {
  return runtimeBridge;
}

// Register module definition (bridge wired separately by apps with runtime-core)
wireRuntimeToPlatform();
