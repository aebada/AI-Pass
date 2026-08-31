import type { ToolDefinition } from '@ai-pass/shared';
import type { FileSystemAdapter } from './index.js';
import { resolvePath } from './index.js';

export function writeFileTool(fs: FileSystemAdapter): ToolDefinition {
  return {
    name: 'write_file',
    description: 'Write content to a file. Creates the file if it does not exist.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path relative to workspace root' },
        content: { type: 'string', description: 'Full file content to write' },
      },
      required: ['path', 'content'],
    },
    async execute(args, context) {
      const path = resolvePath(context.editor.workspaceRoot, String(args.path));
      try {
        await fs.writeFile(path, String(args.content));
        return `Successfully wrote ${args.path}`;
      } catch (err) {
        return `Error writing file: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
  };
}
