import { contextBridge, ipcRenderer } from 'electron';

export interface DesktopApi {
  platform: NodeJS.Platform;
  getWorkspaceRoot: () => Promise<string>;
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
}

const api: DesktopApi = {
  platform: process.platform,
  getWorkspaceRoot: () => ipcRenderer.invoke('workspace:getRoot'),
  readFile: (path: string) => ipcRenderer.invoke('fs:readFile', path),
  writeFile: (path: string, content: string) =>
    ipcRenderer.invoke('fs:writeFile', path, content),
};

contextBridge.exposeInMainWorld('desktopApi', api);

declare global {
  interface Window {
    desktopApi: DesktopApi;
  }
}
