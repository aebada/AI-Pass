import { getMarketplaceRuntime, type MarketplaceRuntimePlatform } from '@ai-pass/marketplace-runtime';
import { StoreService } from './store-service.js';
import { seedDemoInstallations } from './seed-data.js';

export interface StorePlatform {
  marketplace: MarketplaceRuntimePlatform;
  store: StoreService;
}

let _instance: StorePlatform | null = null;
let _seeded = false;

export function createStorePlatform(): StorePlatform {
  const marketplace = getMarketplaceRuntime();
  const store = new StoreService(marketplace);

  if (!_seeded) {
    seedDemoInstallations((req) => store.install(req));
    _seeded = true;
  }

  return { marketplace, store };
}

export function getStorePlatform(): StorePlatform {
  if (!_instance) _instance = createStorePlatform();
  return _instance;
}

export function resetStorePlatform(): void {
  _instance = null;
  _seeded = false;
}

export { StoreService } from './store-service.js';
export { AppRegistry } from './app-registry.js';
export { InstallationService } from './installation-service.js';
export { EnterpriseStoreService } from './enterprise-store-service.js';
export { StoreExecutionService } from './execution.js';
export { GitHubAppService } from './github-app.js';
export * from './types.js';
export * from './seed-data.js';
