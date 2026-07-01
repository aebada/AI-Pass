'use client';

import { getStorePlatform } from '@ai-pass/store-core';
import { STORE_ROUTES } from '@ai-pass/routes';

export const DEMO_USER = 'demo-user';
export const DEMO_TENANT = 'default';
export const DEMO_TIER = 'professional';

export function useStorePlatform() {
  return getStorePlatform();
}

export function installStoreApp(appId: string, userTier = DEMO_TIER) {
  const { store } = getStorePlatform();
  return store.install({
    appId,
    tenantId: DEMO_TENANT,
    userId: DEMO_USER,
    userTier,
  });
}

export function getStoreHomeData(orgId?: string) {
  return getStorePlatform().store.getHomeData(orgId);
}

export function getInstalledApps() {
  return getStorePlatform().store.installations.getInstalledApps(DEMO_TENANT);
}

export { STORE_ROUTES };
