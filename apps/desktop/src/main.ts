import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const isDev = !app.isPackaged;

function getWebUrl(): string {
  if (isDev) {
    return `${process.env.AI_PASS_WEB_URL ?? 'http://localhost:3000'}/ide`;
  }
  return `file://${join(process.resourcesPath, 'web/ide.html')}`;
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'AI Pass',
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
  });

  void win.loadURL(getWebUrl());

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });
}

ipcMain.handle('fs:readFile', async (_event, filePath: string) => {
  return readFile(filePath, 'utf-8');
});

ipcMain.handle('fs:writeFile', async (_event, filePath: string, content: string) => {
  await writeFile(filePath, content, 'utf-8');
});

ipcMain.handle('fs:readDir', async (_event, dirPath: string) => {
  const entries = await readdir(dirPath, { withFileTypes: true });
  return entries.map((entry) => ({
    name: entry.name,
    path: join(dirPath, entry.name),
    type: entry.isDirectory() ? 'directory' : 'file',
  }));
});

ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  const folder = result.filePaths[0];
  if (folder) {
    BrowserWindow.getFocusedWindow()?.webContents.send('workspace:opened', folder);
  }
  return folder ?? null;
});

ipcMain.handle('platform:getInfo', () => ({
  platform: process.platform,
  os: `${process.platform} ${process.arch}`,
  version: process.getSystemVersion(),
}));

void app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
