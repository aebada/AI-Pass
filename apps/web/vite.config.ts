import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const packagesDir = path.resolve(__dirname, '../../packages');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ai-pass/shared': path.join(packagesDir, 'shared/src/index.ts'),
      '@ai-pass/ai-core': path.join(packagesDir, 'ai-core/src/index.ts'),
      '@ai-pass/agent': path.join(packagesDir, 'agent/src/index.ts'),
      '@ai-pass/indexer': path.join(packagesDir, 'indexer/src/index.ts'),
      '@ai-pass/mcp': path.join(packagesDir, 'mcp/src/index.ts'),
      '@ai-pass/editor': path.join(packagesDir, 'editor/src/index.ts'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    include: ['monaco-editor', '@monaco-editor/react'],
  },
});
