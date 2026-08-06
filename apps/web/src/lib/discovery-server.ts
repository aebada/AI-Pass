import { getMarketplaceRuntime } from '@ai-pass/marketplace-runtime';
import { createDiscoveryHub, type DiscoveryHubPlatform } from '@ai-pass/discovery-hub';

let _hub: DiscoveryHubPlatform | null = null;

export function getDiscoveryHub(): DiscoveryHubPlatform {
  if (!_hub) {
    _hub = createDiscoveryHub(getMarketplaceRuntime());
  }
  return _hub;
}
