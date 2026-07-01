'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { AppSettings, EditorContext, OpenFile, FileTreeNode, GitFileStatus } from '@ai-pass/shared';
import { DEFAULT_SETTINGS } from '@ai-pass/shared';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { EditorArea } from './components/EditorArea';
import { ChatPanel } from './components/ChatPanel';
import { TerminalPanel } from './components/TerminalPanel';
import { SettingsModal } from './components/SettingsModal';
import { StatusBar } from './components/StatusBar';
import { CommandPalette } from './components/CommandPalette';
import { SAMPLE_FILES, SAMPLE_TREE } from './data/sample-project';
import { loadRules, saveRules } from './lib/rules';
import { isDesktopApp, openWorkspaceFolder } from './lib/desktop';
import { createBrowserAdapters } from './lib/adapters';
import styles from './App.module.css';

function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS, rules: loadRules() };
  try {
    const saved = localStorage.getItem('ai-pass-settings');
    const base = saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    const settings = { ...base, rules: loadRules() };
    if (!settings.skills.length) {
      settings.skills = [
        { id: 'automate', name: 'Automations', description: 'Create workflow automations', path: '.ai-pass/skills/automate', enabled: true },
        { id: 'create-skill', name: 'Create Skill', description: 'Author agent skills', path: '.ai-pass/skills/create-skill', enabled: true },
        { id: 'create-rule', name: 'Create Rule', description: 'Project rules', path: '.ai-pass/skills/create-rule', enabled: true },
      ];
    }
    return settings;
  } catch {
    return { ...DEFAULT_SETTINGS, rules: loadRules() };
  }
}

export function IdeWorkspace() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [files, setFiles] = useState<Record<string, OpenFile>>(SAMPLE_FILES);
  const [openTabs, setOpenTabs] = useState<string[]>(['src/index.ts']);
  const [activeTab, setActiveTab] = useState('src/index.ts');
  const [showChat, setShowChat] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [chatMode, setChatMode] = useState<'chat' | 'agent' | 'composer'>('chat');
  const [fileTree] = useState<FileTreeNode[]>(SAMPLE_TREE);
  const [workspaceLabel, setWorkspaceLabel] = useState('sample-project');
  const [gitStatus] = useState<GitFileStatus[]>([
    { path: 'src/index.ts', status: 'modified' },
    { path: 'README.md', status: 'untracked' },
  ]);
  const [cursorLine, setCursorLine] = useState(1);

  const editorContext: EditorContext = useMemo(
    () => ({
      workspaceRoot: workspaceLabel,
      openFiles: openTabs.map((p) => files[p]).filter(Boolean),
      activeFilePath: activeTab,
      selection: files[activeTab]?.selection,
    }),
    [files, openTabs, activeTab, workspaceLabel]
  );

  const theme = settings.theme === 'light' ? 'vs-light' : 'vs-dark';

  const handleFileSelect = useCallback(
    (path: string) => {
      if (!files[path]) {
        setFiles((prev) => ({
          ...prev,
          [path]: {
            path,
            content: `// ${path}\n`,
            language: path.split('.').pop() ?? 'plaintext',
            isDirty: false,
          },
        }));
      }
      if (!openTabs.includes(path)) {
        setOpenTabs((prev) => [...prev, path]);
      }
      setActiveTab(path);
    },
    [files, openTabs]
  );

  const handleTabClose = useCallback(
    (path: string) => {
      setOpenTabs((prev) => {
        const next = prev.filter((p) => p !== path);
        if (activeTab === path && next.length) {
          setActiveTab(next[next.length - 1]!);
        }
        return next;
      });
    },
    [activeTab]
  );

  const handleContentChange = useCallback((path: string, content: string) => {
    setFiles((prev) => ({
      ...prev,
      [path]: { ...prev[path]!, content, isDirty: true },
    }));
  }, []);

  const handleSelectionChange = useCallback((path: string, selection: OpenFile['selection']) => {
    if (selection) setCursorLine(selection.endLine);
    setFiles((prev) => {
      const file = prev[path];
      if (!file) return prev;
      return { ...prev, [path]: { ...file, selection } };
    });
  }, []);

  const handleSaveSettings = useCallback((next: AppSettings) => {
    setSettings(next);
    saveRules(next.rules);
    localStorage.setItem('ai-pass-settings', JSON.stringify(next));
    setShowSettings(false);
  }, []);

  const searchInFiles = useCallback(
    async (query: string) => {
      const adapters = createBrowserAdapters(editorContext);
      const results = await adapters.search.search(query, { limit: 8 });
      return results.map((r: { path: string; snippet: string }) => ({ path: r.path, snippet: r.snippet }));
    },
    [editorContext]
  );

  const handleOpenFolder = useCallback(async () => {
    if (!isDesktopApp()) return;
    const folder = await openWorkspaceFolder();
    if (folder) {
      setWorkspaceLabel(folder.split('/').pop() ?? folder);
      // Real FS tree loading wired via desktop IPC in a future pass
    }
  }, []);

  useEffect(() => {
    if (!isDesktopApp()) return;
    return window.aiPassDesktop?.onWorkspaceOpened((path) => {
      setWorkspaceLabel(path.split('/').pop() ?? path);
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const activeFile = files[activeTab];
  const language = activeFile?.language ?? 'typescript';

  return (
    <div className={styles.app}>
      <TitleBar
        onToggleChat={() => setShowChat((v) => !v)}
        onToggleTerminal={() => setShowTerminal((v) => !v)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        showChat={showChat}
        showTerminal={showTerminal}
        chatMode={chatMode}
      />
      <div className={styles.main}>
        <Sidebar
          fileTree={fileTree}
          gitStatus={gitStatus}
          activeFile={activeTab}
          onFileSelect={handleFileSelect}
          onOpenFolder={isDesktopApp() ? handleOpenFolder : undefined}
          workspaceLabel={workspaceLabel}
        />
        <div className={styles.center}>
          <EditorArea
            files={files}
            openTabs={openTabs}
            activeTab={activeTab}
            fontSize={settings.editorFontSize}
            theme={theme}
            settings={settings}
            onTabSelect={setActiveTab}
            onTabClose={handleTabClose}
            onContentChange={handleContentChange}
            onSelectionChange={handleSelectionChange}
          />
          {showTerminal && <TerminalPanel useXterm />}
        </div>
        {showChat && (
          <ChatPanel
            mode={chatMode}
            onModeChange={setChatMode}
            settings={settings}
            editorContext={editorContext}
            fileTree={fileTree}
          />
        )}
      </div>
      <StatusBar
        activeFile={activeTab}
        model={settings.models.chat.model}
        provider={settings.models.chat.provider}
        language={language}
        line={cursorLine}
        encoding="UTF-8"
      />
      {showSettings && (
        <SettingsModal settings={settings} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />
      )}
      <CommandPalette
        open={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        fileTree={fileTree}
        onOpenFile={handleFileSelect}
        onToggleChat={() => setShowChat((v) => !v)}
        onToggleTerminal={() => setShowTerminal((v) => !v)}
        onOpenSettings={() => setShowSettings(true)}
        onSetChatMode={setChatMode}
        searchInFiles={searchInFiles}
      />
    </div>
  );
}
