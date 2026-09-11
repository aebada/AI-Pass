import { app, BrowserWindow, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import { loadSettings, saveSettings } from './settings';

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
let interval: NodeJS.Timeout | null = null;
let checking = false;

export function configureUpdater(): void {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;
  // Generic provider URL is set in electron-builder.yml → publish.url
  // Override for staging via env when needed.
  const feed = process.env.AIPASS_UPDATE_URL;
  if (feed) {
    autoUpdater.setFeedURL({ provider: 'generic', url: feed });
  }
  autoUpdater.on('checking-for-update', () => {
    checking = true;
  });
  autoUpdater.on('update-available', (info) => {
    checking = false;
    const settings = loadSettings();
    if (settings.skippedUpdateVersion === info.version) return;
    notifyWindows({
      type: 'update-available',
      version: info.version,
      releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : '',
    });
  });
  autoUpdater.on('update-not-available', () => {
    checking = false;
  });
  autoUpdater.on('error', (err) => {
    checking = false;
    console.error('[updater]', err.message);
  });
  autoUpdater.on('download-progress', (progress) => {
    notifyWindows({
      type: 'update-progress',
      percent: progress.percent,
    });
  });
  autoUpdater.on('update-downloaded', async (info) => {
    checking = false;
    const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
    const options = {
      type: 'info' as const,
      buttons: ['Restart now', 'Later'],
      defaultId: 0,
      cancelId: 1,
      title: 'Update ready',
      message: `AI-Pass IDE ${info.version} is ready to install.`,
      detail: 'The update will be applied when you restart the app.',
    };
    const result = win
      ? await dialog.showMessageBox(win, options)
      : await dialog.showMessageBox(options);
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    } else {
      saveSettings({ skippedUpdateVersion: info.version });
    }
  });
}

export function startUpdateSchedule(): void {
  if (app.isPackaged) {
    void checkForUpdatesQuiet();
    interval = setInterval(() => {
      void checkForUpdatesQuiet();
    }, CHECK_INTERVAL_MS);
  }
}

export function stopUpdateSchedule(): void {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

export async function checkForUpdatesQuiet(): Promise<void> {
  if (!app.isPackaged || checking) return;
  try {
    await autoUpdater.checkForUpdates();
  } catch (err) {
    console.error('[updater] check failed', err);
  }
}

export async function checkForUpdatesInteractive(): Promise<void> {
  if (!app.isPackaged) {
    await dialog.showMessageBox({
      type: 'info',
      title: 'Updates',
      message: 'Auto-update is only available in packaged builds.',
      detail:
        'Run a release build (`pnpm dist`) to test electron-updater against https://aipass.space/downloads/releases/.',
    });
    return;
  }
  try {
    const result = await autoUpdater.checkForUpdates();
    if (!result?.updateInfo) {
      await dialog.showMessageBox({
        type: 'info',
        title: 'Updates',
        message: 'You are on the latest version.',
        detail: `Current version: ${app.getVersion()}`,
      });
      return;
    }
    const current = app.getVersion();
    if (result.updateInfo.version === current) {
      await dialog.showMessageBox({
        type: 'info',
        title: 'Updates',
        message: 'You are on the latest version.',
        detail: `Current version: ${current}`,
      });
    }
  } catch (err) {
    await dialog.showMessageBox({
      type: 'error',
      title: 'Update check failed',
      message: 'Could not check for updates.',
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}

function notifyWindows(payload: {
  type: string;
  version?: string;
  releaseNotes?: string;
  percent?: number;
}): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('ide:update-status', payload);
  }
}
