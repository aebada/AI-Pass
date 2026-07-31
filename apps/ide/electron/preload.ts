import { contextBridge, ipcRenderer } from 'electron';

export type IdeUpdateStatus =
  | { type: 'update-available'; version: string; releaseNotes: string }
  | { type: 'update-progress'; percent: number };

const bridge = {
  getAppVersion: () => ipcRenderer.invoke('ide:get-app-version') as Promise<string>,
  getWebBaseUrl: () => ipcRenderer.invoke('ide:get-web-base-url') as Promise<string>,
  getPlatform: () => ipcRenderer.invoke('ide:get-platform') as Promise<NodeJS.Platform>,
  checkForUpdates: () => ipcRenderer.invoke('ide:check-for-updates') as Promise<void>,
  openExternal: (url: string) => ipcRenderer.invoke('ide:open-external', url) as Promise<void>,
  onUpdateStatus: (handler: (payload: IdeUpdateStatus) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: IdeUpdateStatus) => handler(payload);
    ipcRenderer.on('ide:update-status', listener);
    return () => ipcRenderer.removeListener('ide:update-status', listener);
  },
};

contextBridge.exposeInMainWorld('aiPassIde', bridge);

declare global {
  interface Window {
    aiPassIde: typeof bridge;
  }
}
