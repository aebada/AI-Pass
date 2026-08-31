import {
  createMarketplaceCore,
  type MarketplaceCorePlatform,
} from '@ai-pass/marketplace-core';
import { createMarketplaceEmitter } from '@ai-pass/livesync';
import { MockRuntimeSandboxFactory } from './sandbox.js';
import { MarketplaceSkillExecutor } from './skill-executor.js';
import { InstallationManager } from './installation-manager.js';
import { MarketplaceAppExecutor } from './app-executor.js';
import { defaultIndustryPackRegistry } from './industry-packs.js';

export interface MarketplaceRuntimePlatform extends MarketplaceCorePlatform {
  sandboxFactory: MockRuntimeSandboxFactory;
  skillExecutor: MarketplaceSkillExecutor;
  appExecutor: MarketplaceAppExecutor;
  installations: InstallationManager;
  industryPacks: typeof defaultIndustryPackRegistry;
}

let _runtime: MarketplaceRuntimePlatform | null = null;

export function createMarketplaceRuntime(): MarketplaceRuntimePlatform {
  const liveSyncEmit = createMarketplaceEmitter();
  const core = createMarketplaceCore({ liveSyncEmit });
  const sandboxFactory = new MockRuntimeSandboxFactory();
  const skillExecutor = new MarketplaceSkillExecutor(
    core.skills,
    core.lifecycle,
    sandboxFactory,
    core.integrations,
    liveSyncEmit,
  );

  return {
    ...core,
    sandboxFactory,
    skillExecutor,
    appExecutor: new MarketplaceAppExecutor(sandboxFactory),
    installations: new InstallationManager(core.apps, core.integrations, liveSyncEmit),
    industryPacks: defaultIndustryPackRegistry,
  };
}

export function getMarketplaceRuntime(): MarketplaceRuntimePlatform {
  if (!_runtime) _runtime = createMarketplaceRuntime();
  return _runtime;
}

export { MockRuntimeSandbox, MockRuntimeSandboxFactory } from './sandbox.js';
export { MarketplaceSkillExecutor, SkillExecutor } from './skill-executor.js';
export { InstallationManager } from './installation-manager.js';
export { MarketplaceAppExecutor } from './app-executor.js';
export { INDUSTRY_PACKS, IndustryPackRegistry, defaultIndustryPackRegistry } from './industry-packs.js';
export type { IndustryPack } from './types.js';
