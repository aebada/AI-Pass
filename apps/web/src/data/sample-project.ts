import type { OpenFile } from '@ai-pass/shared';

export const SAMPLE_TREE = [
  {
    name: 'src',
    path: 'src',
    type: 'directory' as const,
    children: [
      { name: 'index.ts', path: 'src/index.ts', type: 'file' as const },
      { name: 'app.ts', path: 'src/app.ts', type: 'file' as const },
      { name: 'utils.ts', path: 'src/utils.ts', type: 'file' as const },
    ],
  },
  {
    name: 'package.json',
    path: 'package.json',
    type: 'file' as const,
  },
  {
    name: 'README.md',
    path: 'README.md',
    type: 'file' as const,
  },
  {
    name: 'tsconfig.json',
    path: 'tsconfig.json',
    type: 'file' as const,
  },
];

export const SAMPLE_FILES: Record<string, OpenFile> = {
  'src/index.ts': {
    path: 'src/index.ts',
    language: 'typescript',
    isDirty: false,
    content: `import { createApp } from './app';

/**
 * AI Pass sample project entry point.
 * Open the chat panel and ask the assistant about this code.
 */
async function main() {
  const app = createApp();
  await app.start();
  console.log('AI Pass is running');
}

main().catch(console.error);
`,
  },
  'src/app.ts': {
    path: 'src/app.ts',
    language: 'typescript',
    isDirty: false,
    content: `export interface AppConfig {
  name: string;
  port: number;
}

export function createApp(config: AppConfig = { name: 'AI Pass', port: 3000 }) {
  return {
    config,
    async start() {
      // Application bootstrap logic
    },
  };
}
`,
  },
  'src/utils.ts': {
    path: 'src/utils.ts',
    language: 'typescript',
    isDirty: false,
    content: `export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}
`,
  },
  'package.json': {
    path: 'package.json',
    language: 'json',
    isDirty: false,
    content: `{
  "name": "sample-project",
  "version": "1.0.0",
  "type": "module"
}
`,
  },
  'README.md': {
    path: 'README.md',
    language: 'markdown',
    isDirty: false,
    content: `# Sample Project

Welcome to AI Pass! This is a demo workspace.

## Features

- Monaco code editor
- AI chat with context
- Agent mode with tools
- Integrated terminal
`,
  },
  'tsconfig.json': {
    path: 'tsconfig.json',
    language: 'json',
    isDirty: false,
    content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true
  }
}
`,
  },
};
