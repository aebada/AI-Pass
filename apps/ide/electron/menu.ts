import { app, BrowserWindow, Menu, shell, type MenuItemConstructorOptions } from 'electron';
import { checkForUpdatesInteractive } from './updater';
import { getWebBaseUrl, navigateMainWindow, openAboutWindow } from './window';

const SHORTCUTS = [
  { label: 'Workspace', path: '/workspace' },
  { label: 'Playground', path: '/workspace/playground' },
  { label: 'Agent Studio', path: '/workspace/agents/studio' },
  { label: 'Model Hub', path: '/workspace/model-hub' },
  { label: 'Store', path: '/workspace/store' },
  { label: 'Governance', path: '/workspace/governance' },
];

export function buildAppMenu(): void {
  const isMac = process.platform === 'darwin';
  const navigateSubmenu: MenuItemConstructorOptions[] = SHORTCUTS.map((item) => ({
    label: item.label,
    click: () => navigateMainWindow(item.path),
  }));
  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              {
                label: 'Check for Updates…',
                click: () => void checkForUpdatesInteractive(),
              },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open in Browser',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => {
            const win = BrowserWindow.getFocusedWindow();
            const url = win?.webContents.getURL() || `${getWebBaseUrl()}/workspace`;
            void shell.openExternal(url);
          },
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.reload();
          },
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.reloadIgnoringCache();
          },
        },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Go',
      submenu: navigateSubmenu,
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About AI-Pass IDE',
          click: () => openAboutWindow(),
        },
        {
          label: 'Check for Updates…',
          click: () => void checkForUpdatesInteractive(),
        },
        { type: 'separator' },
        {
          label: 'AI-Pass Website',
          click: () => void shell.openExternal('https://aipass.space'),
        },
        {
          label: 'Downloads',
          click: () => void shell.openExternal('https://aipass.space/downloads'),
        },
        {
          label: 'Documentation',
          click: () => void shell.openExternal('https://aipass.space/docs'),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
