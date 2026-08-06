import { BrowserWindow, shell, app, session, type WebContents } from 'electron';
import { join } from 'node:path';
import { loadSettings } from './settings';

const SESSION_PARTITION = 'persist:aipass';

export type IdeTab = 'work' | 'chat' | 'orchestrations';

export interface TabPaths {
  work: string;
  chat: string;
  orchestrations: string;
}

let mainWindow: BrowserWindow | null = null;
let aboutWindow: BrowserWindow | null = null;
let sessionConfigured = false;

export function getWebBaseUrl(): string {
  const settings = loadSettings();
  const fromEnv = process.env.AIPASS_WEB_URL?.replace(/\/$/, '');
  const fromSettings = settings.webBaseUrl?.replace(/\/$/, '');
  return fromEnv || fromSettings || 'https://aipass.space';
}

export function workspaceUrl(path = '/workspace'): string {
  const base = getWebBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function getDefaultTabPaths(): TabPaths {
  return {
    work: '/workspace',
    chat: '/workspace/playground',
    orchestrations: '/workspace/workflows/livesync',
  };
}

export function tabForPath(path: string): IdeTab {
  const normalized = path.replace(/\/+$/, '') || '/workspace';
  if (normalized.startsWith('/workspace/playground') || normalized.startsWith('/workspace/ai')) {
    return 'chat';
  }
  if (
    normalized.startsWith('/workspace/workflows') ||
    normalized.startsWith('/workspace/agents') ||
    normalized.startsWith('/workspace/livesync')
  ) {
    return 'orchestrations';
  }
  return 'work';
}

function shellHtmlPath(): string {
  return app.isPackaged
    ? join(process.resourcesPath, 'renderer', 'index.html')
    : join(__dirname, '..', 'src', 'index.html');
}

function isAiPassUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const base = new URL(getWebBaseUrl());
    return parsed.origin === base.origin || parsed.hostname.endsWith('aipass.space');
  } catch {
    return false;
  }
}

function isOAuthProviderUrl(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url);
    const host = hostname.toLowerCase();
    const path = pathname.toLowerCase();

    if (
      host === 'accounts.google.com' ||
      host === 'accounts.youtube.com' ||
      host === 'oauth2.googleapis.com' ||
      host === 'www.googleapis.com'
    ) {
      return true;
    }

    if (host === 'www.google.com' || host === 'google.com') {
      return (
        path.startsWith('/accounts') ||
        path.startsWith('/signin') ||
        path.includes('/oauth') ||
        path.includes('/o/oauth')
      );
    }

    if (host.endsWith('.google.com') && (path.includes('/signin') || path.includes('/oauth'))) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

function isGoogleAuthStartUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!isAiPassUrl(url)) return false;
    const path = parsed.pathname.replace(/\/+$/, '') || '/';
    return path === '/auth/google' || path === '/auth/google.php';
  } catch {
    return false;
  }
}

function shouldAllowInAppNavigation(url: string): boolean {
  if (url.startsWith('file://') || url.startsWith('about:') || url.startsWith('devtools:')) {
    return true;
  }
  return isAiPassUrl(url) || isOAuthProviderUrl(url);
}

function chromeLikeUserAgent(_raw: string): string {
  const chrome = process.versions.chrome || '134.0.0.0';
  if (process.platform === 'darwin') {
    return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chrome} Safari/537.36`;
  }
  if (process.platform === 'win32') {
    return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chrome} Safari/537.36`;
  }
  return `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chrome} Safari/537.36`;
}

function chromeClientHintBrands(chromeVersion: string): string {
  const major = chromeVersion.split('.')[0] || '134';
  return `"Google Chrome";v="${major}", "Chromium";v="${major}", "Not-A.Brand";v="24"`;
}

function configureAiPassSession(): void {
  if (sessionConfigured) return;
  sessionConfigured = true;

  const ses = session.fromPartition(SESSION_PARTITION);
  const chrome = process.versions.chrome || '134.0.0.0';
  const ua = chromeLikeUserAgent(ses.getUserAgent());
  const brands = chromeClientHintBrands(chrome);
  const platform =
    process.platform === 'darwin' ? '"macOS"' : process.platform === 'win32' ? '"Windows"' : '"Linux"';

  ses.setUserAgent(ua);

  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    const headers = { ...details.requestHeaders };
    headers['User-Agent'] = ua;
    headers['Sec-CH-UA'] = brands;
    headers['Sec-CH-UA-Mobile'] = '?0';
    headers['Sec-CH-UA-Platform'] = platform;
    delete headers['Sec-CH-UA-Full-Version-List'];
    callback({ cancel: false, requestHeaders: headers });
  });

  ses.setPermissionRequestHandler((_wc, permission, callback) => {
    const allow = ['notifications', 'clipboard-read', 'clipboard-sanitized-write', 'media'].includes(
      permission,
    );
    callback(allow);
  });
}

function openGoogleAuthInSystemBrowser(url: string): void {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('desktop', '1');
    void shell.openExternal(parsed.toString());
  } catch {
    void shell.openExternal(url);
  }

  sendNavigate({
    path: '/login?error=desktop_browser&callbackUrl=' + encodeURIComponent('/workspace'),
    tab: 'work',
  });
}

function attachNavigationGuards(contents: WebContents, parentWin?: BrowserWindow): void {
  const guard = (event: { preventDefault: () => void }, url: string) => {
    if (isGoogleAuthStartUrl(url)) {
      event.preventDefault();
      openGoogleAuthInSystemBrowser(url);
      return;
    }
    if (!shouldAllowInAppNavigation(url)) {
      event.preventDefault();
      void shell.openExternal(url);
    }
  };

  contents.on('will-navigate', (event, url) => guard(event, url));
  contents.on('will-redirect', (event, url) => {
    if (isGoogleAuthStartUrl(url)) {
      event.preventDefault();
      openGoogleAuthInSystemBrowser(url);
      return;
    }
    if (!shouldAllowInAppNavigation(url)) {
      event.preventDefault();
      void shell.openExternal(url);
    }
  });

  contents.setWindowOpenHandler(({ url }) => {
    if (isGoogleAuthStartUrl(url)) {
      openGoogleAuthInSystemBrowser(url);
      return { action: 'deny' };
    }

    if (isAiPassUrl(url) || isOAuthProviderUrl(url)) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 520,
          height: 740,
          minWidth: 420,
          minHeight: 560,
          parent: parentWin ?? undefined,
          modal: false,
          title: 'Sign in — AI-Pass',
          backgroundColor: '#0d1117',
          autoHideMenuBar: true,
          webPreferences: {
            partition: SESSION_PARTITION,
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            spellcheck: true,
          },
        },
      };
    }

    void shell.openExternal(url);
    return { action: 'deny' };
  });

  contents.on('did-create-window', (child) => {
    child.setMenuBarVisibility(false);
    attachNavigationGuards(child.webContents, parentWin);
  });
}

function attachWebviewGuards(win: BrowserWindow): void {
  win.webContents.on('will-attach-webview', (_event, webPreferences) => {
    webPreferences.partition = SESSION_PARTITION;
    webPreferences.contextIsolation = true;
    webPreferences.nodeIntegration = false;
    webPreferences.sandbox = true;
    webPreferences.spellcheck = true;
  });

  win.webContents.on('did-attach-webview', (_event, webContents) => {
    attachNavigationGuards(webContents, win);
  });
}

export function sendNavigate(payload: { path: string; tab?: IdeTab }): void {
  const win = mainWindow;
  if (!win || win.isDestroyed()) return;
  const tab = payload.tab ?? tabForPath(payload.path);
  win.webContents.send('ide:navigate', { path: payload.path, tab });
}

export function createMainWindow(): BrowserWindow {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus();
    return mainWindow;
  }

  configureAiPassSession();

  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 960,
    minHeight: 640,
    show: false,
    title: 'AI-Pass IDE',
    backgroundColor: '#0d1117',
    autoHideMenuBar: process.platform === 'win32',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: process.platform === 'darwin' ? { x: 16, y: 16 } : undefined,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      partition: SESSION_PARTITION,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
      webviewTag: true,
    },
  });

  mainWindow = win;

  win.on('ready-to-show', () => {
    win.show();
  });

  win.on('closed', () => {
    mainWindow = null;
  });

  attachWebviewGuards(win);

  void win.loadFile(shellHtmlPath());

  const settings = loadSettings();
  if (!app.isPackaged || settings.openDevTools || process.env.AIPASS_DEVTOOLS === '1') {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  return win;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function navigateMainWindow(path: string): void {
  const win = mainWindow ?? createMainWindow();
  sendNavigate({ path, tab: tabForPath(path) });
  win.focus();
}

export function openAboutWindow(): void {
  if (aboutWindow && !aboutWindow.isDestroyed()) {
    aboutWindow.focus();
    return;
  }

  aboutWindow = new BrowserWindow({
    width: 420,
    height: 360,
    resizable: false,
    minimizable: false,
    maximizable: false,
    title: 'About AI-Pass IDE',
    parent: mainWindow ?? undefined,
    modal: Boolean(mainWindow),
    show: false,
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const aboutPath = app.isPackaged
    ? join(process.resourcesPath, 'renderer', 'about.html')
    : join(__dirname, '..', 'src', 'about.html');

  void aboutWindow.loadFile(aboutPath);

  aboutWindow.on('ready-to-show', () => aboutWindow?.show());
  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });
}

function handleDesktopAuthDeepLink(url: string): boolean {
  try {
    if (!url.startsWith('aipass://')) return false;
    if (!/aipass:\/\/auth\/desktop/i.test(url) && !/aipass:\/\/auth\.desktop/i.test(url)) {
      return false;
    }

    const parsed = new URL(url);
    const code = parsed.searchParams.get('code');
    if (!code) return false;

    configureAiPassSession();
    const win = mainWindow ?? createMainWindow();
    const exchange = new URL(workspaceUrl('/auth/google/desktop-exchange'));
    exchange.searchParams.set('code', code);
    sendNavigate({ path: exchange.pathname + exchange.search, tab: 'work' });
    if (win.isMinimized()) win.restore();
    win.focus();
    return true;
  } catch {
    return false;
  }
}

export function handleDeepLink(url: string): void {
  if (handleDesktopAuthDeepLink(url)) {
    return;
  }

  try {
    const parsed = new URL(url);
    const path = parsed.hostname
      ? `/${parsed.hostname}${parsed.pathname}`.replace(/\/+/g, '/')
      : parsed.pathname || '/workspace';
    navigateMainWindow(path.startsWith('/workspace') ? path : `/workspace${path === '/' ? '' : path}`);
  } catch {
    navigateMainWindow('/workspace');
  }
}
