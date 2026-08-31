import type { ToolDefinition } from '@ai-pass/shared';
import type { TerminalAdapter } from './index.js';

export function runTerminalTool(terminal: TerminalAdapter): ToolDefinition {
  return {
    name: 'run_terminal',
    description: 'Run a shell command in the project workspace.',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Shell command to execute' },
        cwd: { type: 'string', description: 'Working directory (optional)' },
      },
      required: ['command'],
    },
    async execute(args, context) {
      const command = String(args.command);
      const cwd = args.cwd ? String(args.cwd) : context.cwd;
      try {
        const result = await terminal.run(command, cwd);
        const parts = [`exit code: ${result.exitCode}`];
        if (result.stdout) parts.push(`stdout:\n${result.stdout}`);
        if (result.stderr) parts.push(`stderr:\n${result.stderr}`);
        return parts.join('\n');
      } catch (err) {
        return `Terminal error: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
  };
}
