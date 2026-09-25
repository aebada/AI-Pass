import type { AppRegistry as MarketplaceAppRegistry } from '@ai-pass/marketplace-core';

/** Delegates to marketplace AppRegistry — single source of truth for catalog */
export class AppRegistry {
  constructor(private delegate: MarketplaceAppRegistry) {}

  register(...args: Parameters<MarketplaceAppRegistry['register']>) {
    return this.delegate.register(...args);
  }

  get(id: string) {
    return this.delegate.get(id);
  }

  getBySlug(slug: string) {
    return this.delegate.getBySlug(slug);
  }

  list() {
    return this.delegate.list();
  }

  featured() {
    const apps = this.delegate.list();
    return apps.filter((a: { featured?: boolean; certified?: boolean; enterpriseReady?: boolean }) =>
      Boolean(a.featured || a.certified || a.enterpriseReady)
    ).slice(0, 10);
  }

  trending() {
    return this.delegate.list().slice(0, 10);
  }

  update(...args: Parameters<MarketplaceAppRegistry['update']>) {
    return this.delegate.update(...args);
  }

  delete(id: string) {
    return this.delegate.delete(id);
  }

  publishVersion(...args: Parameters<MarketplaceAppRegistry['publishVersion']>) {
    return this.delegate.publishVersion(...args);
  }

  getVersions(appId: string) {
    return this.delegate.getVersions(appId);
  }
}
