import { app, ipcMain, shell } from 'electron';
import { buildAppMenu } from './menu';
import {
  checkForUpdatesInteractive,
  configureUpdater,
  startUpdateSchedule,
  stopUpdateSchedule,
} from './updater';
import {
  createMainWindow,
  getMainWindow,
  getWebBaseUrl,
  handleDeepLink,
} from './window';

const PROTOCOL = 'aipass';

function chromeLikeUserAgentFallback(): string {
  const chrome = process.versions.chrome || '134.0.0.0';
  if (process.platform === 'darwin') {
    return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chrome} Safari/537.36`;
  }
  if (process.platform === 'win32') {
    return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chrome} Safari/537.36`;
  }
  return `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chrome} Safari/537.36`;
}

// Must run before any BrowserWindow: subframe/XHR fallbacks can bypass session.setUserAgent
// and leak "Electron/" — Google OAuth rejects that with a 500 / disallowed_useragent page.
app.userAgentFallback = chromeLikeUserAgentFallback();

// Single-instance lock so deep links focus the existing window.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    const deep = argv.find((arg) => arg.startsWith(`${PROTOCOL}://`));
    if (deep) handleDeepLink(deep);
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    } else {
      createMainWindow();
    }
  });
}

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [process.argv[1]]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL);
}

ipcMain.handle('ide:get-app-version', () => app.getVersion());
ipcMain.handle('ide:get-web-base-url', () => getWebBaseUrl());
ipcMain.handle('ide:get-platform', () => process.platform);
ipcMain.handle('ide:check-for-updates', () => checkForUpdatesInteractive());
ipcMain.handle('ide:open-external', (_event, url: unknown) => {
  if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
    return shell.openExternal(url);
  }
});

app.on('open-url', (event, url) => {
  event.preventDefault();
  if (app.isReady()) {
    handleDeepLink(url);
  } else {
    void app.whenReady().then(() => handleDeepLink(url));
  }
});

void app.whenReady().then(() => {
  configureUpdater();
  buildAppMenu();
  createMainWindow();
  startUpdateSchedule();
  const deep = process.argv.find((arg) => arg.startsWith(`${PROTOCOL}://`));
  if (deep) handleDeepLink(deep);
  app.on('activate', () => {
    if (!getMainWindow()) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  stopUpdateSchedule();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopUpdateSchedule();
});
