/**
 * @ai-pass/store — backward-compatible facade over @ai-pass/store-core.
 */
import { getStorePlatform } from '@ai-pass/store-core';
import { SEED_APPS } from '@ai-pass/marketplace-core';

export {
  getStorePlatform,
  createStorePlatform as createStoreCorePlatform,
  resetStorePlatform,
  StoreService,
  AppRegistry,
  InstallationService,
} from '@ai-pass/store-core';

export type { StorePlatform, StoreHomeData, StoreAppDetail } from '@ai-pass/store-core';

/** Legacy seed apps for templates marketplace page */
export const SEED_STORE_APPS = SEED_APPS;

export function createStorePlatform() {
  const platform = getStorePlatform();
  return {
    registry: platform.store.apps,
    installations: platform.store.installations,
    reviews: platform.marketplace.reviews,
    reviewPipeline: platform.marketplace.security,
  };
}
