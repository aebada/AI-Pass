export {
  createMarketplaceCore,
  getMarketplaceCore,
  resetMarketplaceCore,
  SkillRegistry,
  DEFAULT_REVENUE_SHARE,
  MARKETPLACE_CATEGORIES,
  SKILL_CATEGORIES,
  SKILL_CATEGORY_LABELS,
  CATEGORY_LABELS,
} from '@ai-pass/marketplace-core';

export {
  createMarketplaceRuntime,
  getMarketplaceRuntime,
  MarketplaceSkillExecutor,
  SkillExecutor,
  InstallationManager,
  MockRuntimeSandbox,
  MockRuntimeSandboxFactory,
} from '@ai-pass/marketplace-runtime';

/** @deprecated Use createMarketplaceRuntime */
export { createMarketplaceRuntime as createMarketplacePlatform } from '@ai-pass/marketplace-runtime';

/** @deprecated Use getMarketplaceRuntime */
export { getMarketplaceRuntime as getMarketplacePlatform } from '@ai-pass/marketplace-runtime';

export type { MarketplaceRuntimePlatform as MarketplacePlatform } from '@ai-pass/marketplace-runtime';
export type { SkillRegistry as MarketplaceSkillRegistry } from '@ai-pass/marketplace-core';

export * from '@ai-pass/marketplace-core';
