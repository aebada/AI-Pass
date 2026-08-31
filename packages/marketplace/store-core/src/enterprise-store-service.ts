import type { MarketplaceRuntimePlatform } from '@ai-pass/marketplace-runtime';
import type { Application, EnterpriseMarketplacePolicy } from '@ai-pass/marketplace-core';
import type { EnterpriseCatalog } from './types.js';

export class EnterpriseStoreService {
  private catalogs = new Map<string, EnterpriseCatalog>();
  private lockedVersions = new Map<string, Record<string, string>>();
  private publicDisabled = new Set<string>();

  constructor(private runtime: MarketplaceRuntimePlatform) {}

  getPolicy(orgId: string): EnterpriseMarketplacePolicy {
    return this.runtime.enterprise.getOrCreatePolicy(orgId);
  }

  getCatalog(orgId: string): EnterpriseCatalog {
    const existing = this.catalogs.get(orgId);
    if (existing) return existing;

    const policy = this.getPolicy(orgId);
    const catalog: EnterpriseCatalog = {
      orgId,
      name: `${orgId} Private Catalog`,
      appIds: policy.approvedAppIds.length ? policy.approvedAppIds : this.runtime.apps.list().map((a: Application) => a.id),
      privateOnly: policy.privateStoreEnabled,
      lockedVersions: this.lockedVersions.get(orgId) ?? {},
      publicAppsDisabled: this.publicDisabled.has(orgId),
    };
    this.catalogs.set(orgId, catalog);
    return catalog;
  }

  approveInstall(orgId: string, appId: string): EnterpriseMarketplacePolicy {
    return this.runtime.enterprise.approveApp(orgId, appId);
  }

  lockVersion(orgId: string, appId: string, version: string): EnterpriseCatalog {
    const locked = this.lockedVersions.get(orgId) ?? {};
    locked[appId] = version;
    this.lockedVersions.set(orgId, locked);
    const catalog = this.getCatalog(orgId);
    catalog.lockedVersions = locked;
    this.catalogs.set(orgId, catalog);
    return catalog;
  }

  disablePublicApps(orgId: string, disabled = true): EnterpriseCatalog {
    if (disabled) this.publicDisabled.add(orgId);
    else this.publicDisabled.delete(orgId);
    const catalog = this.getCatalog(orgId);
    catalog.publicAppsDisabled = disabled;
    this.catalogs.set(orgId, catalog);
    return catalog;
  }

  filterApps(orgId: string, apps: Application[]): Application[] {
    const catalog = this.getCatalog(orgId);
    let filtered = this.runtime.enterprise.filterAppsForOrg(orgId, apps, this.runtime.apps);

    if (catalog.publicAppsDisabled) {
      filtered = filtered.filter((a: Application) => a.appType === 'private_app' || a.appType === 'enterprise_app');
    }

    for (const app of filtered) {
      const locked = catalog.lockedVersions[app.id];
      if (locked) app.version = locked;
    }

    if (catalog.privateOnly && catalog.appIds.length) {
      filtered = filtered.filter((a: Application) => catalog.appIds.includes(a.id));
    }

    return filtered;
  }
}
