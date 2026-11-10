import type { EditorSelection, OpenFile } from '@ai-pass/shared';

export interface EditorAdapter {
  openFile(file: OpenFile): void;
  closeFile(path: string): void;
  setActiveFile(path: string): void;
  getOpenFiles(): OpenFile[];
  getActiveFile(): OpenFile | undefined;
  updateContent(path: string, content: string): void;
  getSelection(): EditorSelection | undefined;
}

export interface EditorProps {
  file: OpenFile;
  fontSize?: number;
  readOnly?: boolean;
  onChange?: (content: string) => void;
  onSelectionChange?: (selection: EditorSelection | undefined) => void;
}

export function inferLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    md: 'markdown',
    css: 'css',
    html: 'html',
    py: 'python',
    rs: 'rust',
    go: 'go',
    yaml: 'yaml',
    yml: 'yaml',
  };
  return map[ext] ?? 'plaintext';
}
