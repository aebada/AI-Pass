import { useCallback } from 'react';
import Editor from '@monaco-editor/react';

export interface CodeEditorProps {
  value: string;
  language?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  fontSize?: number;
  theme?: 'vs-dark' | 'vs-light';
}

export function CodeEditor({
  value,
  language = 'typescript',
  onChange,
  readOnly = false,
  fontSize = 14,
  theme = 'vs-dark',
}: CodeEditorProps) {
  const handleChange = useCallback(
    (next: string | undefined) => {
      onChange?.(next ?? '');
    },
    [onChange]
  );

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={handleChange}
      theme={theme}
      options={{
        readOnly,
        fontSize,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
      }}
    />
  );
}

export { CodeEditor as default };
