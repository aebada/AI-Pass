import type { EditorContext } from '@ai-pass/shared';
import type { FileSystemAdapter, TerminalAdapter, SearchAdapter } from '@ai-pass/agent';
import { SAMPLE_FILES } from '../data/sample-project';

export function createBrowserAdapters(editorContext: EditorContext): {
  fs: FileSystemAdapter;
  terminal: TerminalAdapter;
  search: SearchAdapter;
} {
  return {
    fs: {
      async readFile(path: string) {
        const file = SAMPLE_FILES[path] ?? editorContext.openFiles.find((f) => f.path === path);
        if (!file) throw new Error(`File not found: ${path}`);
        return file.content;
      },
      async writeFile(path: string, content: string) {
        console.log(`[agent] write_file: ${path} (${content.length} bytes)`);
      },
      async listDir(path: string) {
        return Object.keys(SAMPLE_FILES).filter((p) => p.startsWith(path));
      },
      async exists(path: string) {
        return path in SAMPLE_FILES || editorContext.openFiles.some((f) => f.path === path);
      },
    },
    terminal: {
      async run(command: string, cwd?: string) {
        return {
          stdout: `[browser stub] Would run: ${command} in ${cwd ?? editorContext.workspaceRoot}`,
          stderr: '',
          exitCode: 0,
        };
      },
    },
    search: {
      async search(query: string, options?: { limit?: number }) {
        const limit = options?.limit ?? 10;
        const results: Array<{ path: string; snippet: string; score: number }> = [];
        const terms = query.toLowerCase().split(/\s+/);

        for (const [path, file] of Object.entries(SAMPLE_FILES)) {
          const content = file.content.toLowerCase();
          let score = 0;
          for (const term of terms) {
            score += (content.match(new RegExp(term, 'g')) ?? []).length;
          }
          if (score > 0) {
            const idx = content.indexOf(terms[0] ?? '');
            results.push({
              path,
              score,
              snippet: file.content.slice(Math.max(0, idx - 30), idx + 80).trim(),
            });
          }
        }

        return results.sort((a, b) => b.score - a.score).slice(0, limit);
      },
    },
  };
}
