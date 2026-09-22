import type { ToolDefinition } from '@ai-pass/shared';
import type { FileSystemAdapter } from './index.js';
import { resolvePath } from './index.js';

export function readFileTool(fs: FileSystemAdapter): ToolDefinition {
  return {
    name: 'read_file',
    description: 'Read the contents of a file at the given path relative to workspace root.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path relative to workspace root' },
      },
      required: ['path'],
    },
    async execute(args, context) {
      const path = resolvePath(context.editor.workspaceRoot, String(args.path));
      try {
        const content = await fs.readFile(path);
        return content;
      } catch (err) {
        return `Error reading file: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
  };
}
