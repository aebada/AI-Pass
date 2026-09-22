'use client';

import Editor from '@monaco-editor/react';
import type { EditorProps } from './types';

export function MonacoEditor({
  file,
  fontSize = 14,
  readOnly = false,
  onChange,
  onSelectionChange,
}: EditorProps) {
  return (
    <Editor
      height="100%"
      language={file.language}
      value={file.content}
      theme="vs-dark"
      options={{
        fontSize,
        readOnly,
        minimap: { enabled: true },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
      }}
      onChange={(value) => onChange?.(value ?? '')}
      onMount={(editor) => {
        editor.onDidChangeCursorSelection(() => {
          const sel = editor.getSelection();
          if (!sel || !onSelectionChange) return;
          const text = editor.getModel()?.getValueInRange(sel) ?? '';
          onSelectionChange({
            startLine: sel.startLineNumber,
            startColumn: sel.startColumn,
            endLine: sel.endLineNumber,
            endColumn: sel.endColumn,
            text,
          });
        });
      }}
    />
  );
}
