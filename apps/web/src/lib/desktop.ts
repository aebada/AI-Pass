import type { FileTreeNode } from '@ai-pass/shared';

export interface DesktopFsEntry {
  name: string;
  path: string;
  type: string;
}

export function isDesktopApp(): boolean {
  return typeof window !== 'undefined' && Boolean(window.aiPassDesktop);
}

declare global {
  interface Window {
    aiPassDesktop?: {
      readFile: (path: string) => Promise<string>;
      writeFile: (path: string, content: string) => Promise<void>;
      readDir: (path: string) => Promise<DesktopFsEntry[]>;
      openFolder: () => Promise<string | null>;
      getPlatformInfo: () => Promise<{ platform: string; os: string; version: string }>;
      onWorkspaceOpened: (callback: (path: string) => void) => () => void;
    };
  }
}

export async function openWorkspaceFolder(): Promise<string | null> {
  if (!window.aiPassDesktop) return null;
  return window.aiPassDesktop.openFolder();
}

export async function readDirEntries(dirPath: string): Promise<DesktopFsEntry[]> {
  if (!window.aiPassDesktop) return [];
  return window.aiPassDesktop.readDir(dirPath);
}

export function buildTreeFromEntries(entries: DesktopFsEntry[]): FileTreeNode[] {
  return entries
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    })
    .map((entry) => ({
      name: entry.name,
      path: entry.path,
      type: entry.type === 'directory' ? 'directory' : 'file',
      children: entry.type === 'directory' ? [] : undefined,
    }));
}
