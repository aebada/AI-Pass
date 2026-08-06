import { createDesktopLiveSyncClient } from '@ai-pass/livesync/adapters/desktop';

const webUrl = process.env.AI_PASS_WEB_URL ?? 'http://localhost:3000';

/** Desktop LiveSync client — uses web API when Electron loads the Next.js UI */
export const desktopLiveSync = createDesktopLiveSyncClient({ webUrl });
