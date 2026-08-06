import { useCallback, useEffect, useState } from 'react';
import { AppShell } from '@ai-pass/ui';
import { CodeEditor } from '@ai-pass/editor';
import { createMessage, type FileTreeNode, type Message } from '@ai-pass/shared';

const DEMO_FILES: FileTreeNode[] = [
  {
    name: 'src',
    path: 'src',
    type: 'directory',
    children: [
      { name: 'main.ts', path: 'src/main.ts', type: 'file' },
      { name: 'preload.ts', path: 'src/preload.ts', type: 'file' },
    ],
  },
  { name: 'package.json', path: 'package.json', type: 'file' },
];

const FILE_CONTENTS: Record<string, { content: string; language: string }> = {
  'src/main.ts': {
    content: `import { app, BrowserWindow } from 'electron';\n\n// AI Pass desktop main process\n`,
    language: 'typescript',
  },
  'src/preload.ts': {
    content: `import { contextBridge } from 'electron';\n\ncontextBridge.exposeInMainWorld('desktopApi', {});\n`,
    language: 'typescript',
  },
  'package.json': {
    content: `{\n  "name": "@ai-pass/desktop",\n  "version": "0.1.0"\n}\n`,
    language: 'json',
  },
};

export default function App() {
  const [activePath, setActivePath] = useState('src/main.ts');
  const [content, setContent] = useState(FILE_CONTENTS['src/main.ts']?.content ?? '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState('desktop');

  useEffect(() => {
    setPlatform(window.desktopApi?.platform ?? 'desktop');
  }, []);

  const handleFileSelect = useCallback((path: string) => {
    setActivePath(path);
    const file = FILE_CONTENTS[path];
    if (file) setContent(file.content);
  }, []);

  const handleSend = useCallback((text: string) => {
    setMessages((prev) => [...prev, createMessage('user', text)]);
    setIsLoading(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        createMessage('assistant', `Desktop agent (demo): ${text}`),
      ]);
      setIsLoading(false);
    }, 600);
  }, []);

  const activeFile = FILE_CONTENTS[activePath];

  return (
    <AppShell
      title="AI Pass Desktop"
      sidebar={{
        files: DEMO_FILES,
        activePath,
        onFileSelect: handleFileSelect,
      }}
      editor={{
        filePath: activePath,
        content,
        language: activeFile?.language,
        children: (
          <CodeEditor
            value={content}
            language={activeFile?.language ?? 'typescript'}
            onChange={setContent}
          />
        ),
      }}
      chat={{
        messages,
        onSend: handleSend,
        isLoading,
      }}
      terminal={
        <pre
          style={{
            margin: 0,
            padding: 12,
            height: '100%',
            background: '#0d1117',
            color: '#e6edf3',
            fontFamily: 'ui-monospace, monospace',
            fontSize: 13,
            overflow: 'auto',
          }}
        >
          {`AI Pass terminal — ${platform} (native shell)\n$ ready\n`}
        </pre>
      }
      statusBar={
        <footer
          style={{
            height: 24,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            background: '#1f6feb',
            fontSize: 12,
            color: '#e6edf3',
            gap: 16,
          }}
        >
          <span>Desktop ({platform})</span>
          <span style={{ marginLeft: 'auto' }}>Electron</span>
        </footer>
      }
    />
  );
}
