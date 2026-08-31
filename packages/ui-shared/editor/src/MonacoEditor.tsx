import { useRef, useCallback } from 'react';
import Editor, { type OnMount, type OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import type { EditorSelection } from '@ai-pass/shared';
import { getLanguageFromPath } from './language';

export interface MonacoEditorProps {
  path: string;
  value: string;
  theme?: 'vs-dark' | 'vs-light' | 'hc-black';
  fontSize?: number;
  onChange?: (value: string) => void;
  onSelectionChange?: (selection: EditorSelection | undefined) => void;
  onMount?: (editor: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => void;
  readOnly?: boolean;
}

export function MonacoEditor({
  path,
  value,
  theme = 'vs-dark',
  fontSize = 14,
  onChange,
  onSelectionChange,
  onMount,
  readOnly = false,
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const language = getLanguageFromPath(path);

  const handleMount: OnMount = useCallback(
    (ed, monaco) => {
      editorRef.current = ed;
      ed.onDidChangeCursorSelection(() => {
        const sel = ed.getSelection();
        if (!sel || !onSelectionChange) return;
        const model = ed.getModel();
        if (!model) return;
        const text = model.getValueInRange(sel);
        onSelectionChange({
          startLine: sel.startLineNumber,
          startColumn: sel.startColumn,
          endLine: sel.endLineNumber,
          endColumn: sel.endColumn,
          text,
        });
      });
      onMount?.(ed, monaco);
    },
    [onMount, onSelectionChange]
  );

  const handleChange: OnChange = useCallback(
    (val) => {
      onChange?.(val ?? '');
    },
    [onChange]
  );

  return (
    <Editor
      path={path}
      language={language}
      value={value}
      theme={theme}
      onChange={handleChange}
      onMount={handleMount}
      options={{
        fontSize,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        readOnly,
        tabSize: 2,
        wordWrap: 'on',
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
      }}
      loading={<div style={{ padding: 16, color: '#888' }}>Loading editor...</div>}
    />
  );
}
