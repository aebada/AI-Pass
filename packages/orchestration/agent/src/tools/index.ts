import type { AgentContext, ToolDefinition } from '@ai-pass/shared';

export interface FileSystemAdapter {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  listDir(path: string): Promise<string[]>;
  exists(path: string): Promise<boolean>;
}

export interface TerminalAdapter {
  run(command: string, cwd?: string): Promise<{ stdout: string; stderr: string; exitCode: number }>;
}

export interface SearchAdapter {
  search(query: string, options?: { limit?: number }): Promise<Array<{ path: string; snippet: string; score: number }>>;
}

export interface ToolAdapters {
  fs: FileSystemAdapter;
  terminal: TerminalAdapter;
  search: SearchAdapter;
}

export { readFileTool } from './read-file.js';
export { writeFileTool } from './write-file.js';
export { searchCodebaseTool } from './search-codebase.js';
export { runTerminalTool } from './run-terminal.js';

import { readFileTool } from './read-file.js';
import { writeFileTool } from './write-file.js';
import { searchCodebaseTool } from './search-codebase.js';
import { runTerminalTool } from './run-terminal.js';

export function createDefaultTools(adapters: ToolAdapters): ToolDefinition[] {
  return [
    readFileTool(adapters.fs),
    writeFileTool(adapters.fs),
    searchCodebaseTool(adapters.search),
    runTerminalTool(adapters.terminal),
  ];
}

export function resolvePath(workspaceRoot: string, path: string): string {
  if (path.startsWith('/')) return path;
  return `${workspaceRoot.replace(/\/$/, '')}/${path}`;
}

export function withContext<T extends ToolDefinition>(
  tool: T,
  getContext: () => AgentContext
): ToolDefinition {
  return {
    ...tool,
    execute: (args, _ctx) => tool.execute(args, getContext()),
  };
}
