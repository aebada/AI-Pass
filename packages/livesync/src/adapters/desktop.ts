import { LiveSyncClient, type LiveSyncClientOptions } from './base-client.js';

export interface DesktopLiveSyncOptions extends Partial<LiveSyncClientOptions> {
  webUrl?: string;
}

/**
 * Desktop adapter — targets the Next.js LiveSync API (Electron loads web UI).
 * IPC bridge can be added later for embedded worker mode.
 */
export function createDesktopLiveSyncClient(
  options: DesktopLiveSyncOptions = {}
): LiveSyncClient {
  const baseUrl = options.baseUrl ?? options.webUrl ?? 'http://localhost:3000';

  return new LiveSyncClient({
    baseUrl,
    apiPrefix: '/api/v1',
    offlineQueueKey: 'ai-pass-livesync-offline-desktop',
    autoReplay: true,
    ...options,
  });
}

export type { LiveSyncClientOptions, OfflineQueueItem } from './base-client.js';
export { LiveSyncClient } from './base-client.js';
