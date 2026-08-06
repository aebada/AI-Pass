import { contextBridge, ipcRenderer } from 'electron';
import type { ProjectsData } from './projects';

export type IdeTab = 'work' | 'chat' | 'orchestrations';

export interface TabPaths {
  work: string;
  chat: string;
  orchestrations: string;
}

export interface NavigatePayload {
  path: string;
  tab?: IdeTab;
}

export interface IdeBridge {
  getAppVersion: () => Promise<string>;
  getWebBaseUrl: () => Promise<string>;
  getPlatform: () => Promise<string>;
  checkForUpdates: () => Promise<void>;
  openExternal: (url: string) => Promise<void>;
  onUpdateStatus: (handler: (payload: unknown) => void) => () => void;
  getTabPaths: () => Promise<TabPaths>;
  getProjects: () => Promise<ProjectsData>;
  createProject: (name: string) => Promise<ProjectsData>;
  createFolder: (
    projectId: string,
    parentFolderId: string | null,
    name: string,
  ) => Promise<ProjectsData>;
  selectProject: (projectId: string | null) => Promise<ProjectsData>;
  setExpanded: (expandedIds: string[]) => Promise<ProjectsData>;
  deleteNode: (nodeId: string) => Promise<ProjectsData>;
  onNavigate: (handler: (payload: NavigatePayload) => void) => () => void;
  onProjectsChanged: (handler: (data: ProjectsData) => void) => () => void;
}

const bridge: IdeBridge = {
  getAppVersion: () => ipcRenderer.invoke('ide:get-app-version'),
  getWebBaseUrl: () => ipcRenderer.invoke('ide:get-web-base-url'),
  getPlatform: () => ipcRenderer.invoke('ide:get-platform'),
  checkForUpdates: () => ipcRenderer.invoke('ide:check-for-updates'),
  openExternal: (url: string) => ipcRenderer.invoke('ide:open-external', url),
  onUpdateStatus: (handler) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: unknown) => handler(payload);
    ipcRenderer.on('ide:update-status', listener);
    return () => ipcRenderer.removeListener('ide:update-status', listener);
  },
  getTabPaths: () => ipcRenderer.invoke('ide:get-tab-paths'),
  getProjects: () => ipcRenderer.invoke('ide:projects:get'),
  createProject: (name) => ipcRenderer.invoke('ide:projects:create', name),
  createFolder: (projectId, parentFolderId, name) =>
    ipcRenderer.invoke('ide:projects:create-folder', projectId, parentFolderId, name),
  selectProject: (projectId) => ipcRenderer.invoke('ide:projects:select', projectId),
  setExpanded: (expandedIds) => ipcRenderer.invoke('ide:projects:set-expanded', expandedIds),
  deleteNode: (nodeId) => ipcRenderer.invoke('ide:projects:delete', nodeId),
  onNavigate: (handler) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: NavigatePayload) =>
      handler(payload);
    ipcRenderer.on('ide:navigate', listener);
    return () => ipcRenderer.removeListener('ide:navigate', listener);
  },
  onProjectsChanged: (handler) => {
    const listener = (_event: Electron.IpcRendererEvent, data: ProjectsData) => handler(data);
    ipcRenderer.on('ide:projects-changed', listener);
    return () => ipcRenderer.removeListener('ide:projects-changed', listener);
  },
};

contextBridge.exposeInMainWorld('aiPassIde', bridge);

declare global {
  interface Window {
    aiPassIde: IdeBridge;
  }
}
