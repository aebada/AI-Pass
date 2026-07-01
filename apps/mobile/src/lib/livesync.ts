import { createMobileLiveSyncClient } from '@ai-pass/livesync/adapters/mobile';
import Constants from 'expo-constants';

function resolveDevHost(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3000`;
  }
  return process.env.EXPO_PUBLIC_LIVESYNC_URL ?? 'http://localhost:3000';
}

/** Mobile LiveSync client — points at dev machine web API */
export const mobileLiveSync = createMobileLiveSyncClient({
  devServerHost: resolveDevHost(),
});
