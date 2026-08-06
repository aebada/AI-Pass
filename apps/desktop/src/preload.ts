import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('aiPassDesktop', {
  readFile: (path: string) => ipcRenderer.invoke('fs:readFile', path),
  writeFile: (path: string, content: string) => ipcRenderer.invoke('fs:writeFile', path, content),
  readDir: (path: string) => ipcRenderer.invoke('fs:readDir', path),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  getPlatformInfo: () => ipcRenderer.invoke('platform:getInfo'),
  onWorkspaceOpened: (callback: (path: string) => void) => {
    const handler = (_event: unknown, workspacePath: string) => callback(workspacePath);
    ipcRenderer.on('workspace:opened', handler);
    return () => ipcRenderer.removeListener('workspace:opened', handler);
  },
});

export type AiPassDesktopAPI = {
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  readDir: (path: string) => Promise<Array<{ name: string; path: string; type: string }>>;
  openFolder: () => Promise<string | null>;
  getPlatformInfo: () => Promise<{ platform: string; os: string; version: string }>;
  onWorkspaceOpened: (callback: (path: string) => void) => () => void;
};

declare global {
  interface Window {
    aiPassDesktop?: AiPassDesktopAPI;
  }
}
