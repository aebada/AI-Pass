import { LiveSyncClient, type LiveSyncClientOptions } from './base-client.js';

export function createWebLiveSyncClient(
  options?: Partial<LiveSyncClientOptions>
): LiveSyncClient {
  const baseUrl =
    options?.baseUrl ??
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  return new LiveSyncClient({
    baseUrl,
    apiPrefix: '/api/v1',
    offlineQueueKey: 'ai-pass-livesync-offline-web',
    autoReplay: true,
    ...options,
  });
}

export type { LiveSyncClientOptions, OfflineQueueItem } from './base-client.js';
export { LiveSyncClient } from './base-client.js';
