import type { StoreInstallRequest } from './types.js';

/** Demo tenant/user for seeded installations */
export const DEMO_STORE_TENANT = 'default';
export const DEMO_STORE_USER = 'demo-user';
export const DEMO_STORE_TIER = 'professional';

/** Apps pre-installed in demo workspace */
export const DEMO_INSTALLED_APP_IDS = [
  'app_invoice_ai',
  'app_supply_chain_ai',
];

export function seedDemoInstallations(
  install: (req: StoreInstallRequest) => unknown,
): void {
  for (const appId of DEMO_INSTALLED_APP_IDS) {
    try {
      install({
        appId,
        tenantId: DEMO_STORE_TENANT,
        userId: DEMO_STORE_USER,
        userTier: DEMO_STORE_TIER,
      });
    } catch {
      // already installed
    }
  }
}
