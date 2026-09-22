import { LiveSyncClient, type LiveSyncClientOptions } from './base-client.js';

export interface MobileLiveSyncOptions extends Partial<LiveSyncClientOptions> {
  /** Dev machine IP for Expo — e.g. http://192.168.1.10:3000 */
  devServerHost?: string;
}

/**
 * Mobile adapter — polls LiveSync API; offline queue uses in-memory storage
 * (localStorage unavailable in React Native; extend with AsyncStorage later).
 */
export class MobileLiveSyncClient extends LiveSyncClient {
  constructor(options: MobileLiveSyncOptions = {}) {
    const baseUrl =
      options.baseUrl ?? options.devServerHost ?? 'http://localhost:3000';

    super({
      baseUrl,
      apiPrefix: '/api/v1',
      offlineQueueKey: 'ai-pass-livesync-offline-mobile',
      autoReplay: true,
      ...options,
    });
  }

  protected override loadOfflineQueue(): void {
    // In-memory only for MVP; AsyncStorage integration is a follow-up
  }

  protected override persistOfflineQueue(): void {
    // no-op on mobile MVP
  }
}

export function createMobileLiveSyncClient(
  options?: MobileLiveSyncOptions
): MobileLiveSyncClient {
  return new MobileLiveSyncClient(options);
}

export type { LiveSyncClientOptions, OfflineQueueItem } from './base-client.js';
