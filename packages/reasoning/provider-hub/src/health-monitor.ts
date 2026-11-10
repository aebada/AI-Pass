import type { HubProviderId, ProviderHealth } from './types.js';
import { PROVIDER_DEFINITIONS } from './catalog.js';

/** Health monitoring stubs — production would poll provider APIs */
export class HealthMonitor {
  private cache = new Map<HubProviderId, ProviderHealth>();

  check(providerId: HubProviderId): ProviderHealth {
    const cached = this.cache.get(providerId);
    if (cached && Date.now() - new Date(cached.lastChecked).getTime() < 60000) {
      return cached;
    }

    const health = this.probe(providerId);
    this.cache.set(providerId, health);
    return health;
  }

  checkAll(): ProviderHealth[] {
    return PROVIDER_DEFINITIONS.map((p) => this.check(p.id));
  }

  getHealthyProviders(): HubProviderId[] {
    return this.checkAll()
      .filter((h) => h.status !== 'down')
      .map((h) => h.providerId);
  }

  private probe(providerId: HubProviderId): ProviderHealth {
    const degraded: HubProviderId[] = ['huggingface', 'ollama'];
    const isDegraded = degraded.includes(providerId);

    return {
      providerId,
      status: isDegraded ? 'degraded' : 'healthy',
      latencyMs: isDegraded ? 450 : 120 + Math.floor(Math.random() * 80),
      errorRate: isDegraded ? 0.05 : 0.01,
      lastChecked: new Date().toISOString(),
    };
  }
}

export const defaultHealthMonitor = new HealthMonitor();
