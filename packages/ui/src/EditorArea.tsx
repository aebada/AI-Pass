import type { ReactNode } from 'react';
import { tokens } from './tokens';
import { ModuleIcon } from './workspace/ModuleIcon';

export interface EditorAreaProps {
  filePath?: string;
  content?: string;
  language?: string;
  onChange?: (content: string) => void;
  children?: ReactNode;
}

export function EditorArea({
  filePath,
  content = '',
  language = 'plaintext',
  children,
}: EditorAreaProps) {
  return (
    <main
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: tokens.colors.bg,
      }}
    >
      <div
        style={{
          padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
          borderBottom: `1px solid ${tokens.colors.border}`,
          fontSize: tokens.fontSize.sm,
          color: tokens.colors.textMuted,
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing.sm,
        }}
      >
        <span><ModuleIcon name="file-text" size={14} /></span>
        <span>{filePath ?? 'No file selected'}</span>
        {language && (
          <span
            style={{
              marginLeft: 'auto',
              padding: `2px ${tokens.spacing.sm}px`,
              background: tokens.colors.bgHover,
              borderRadius: 4,
              fontSize: tokens.fontSize.sm,
            }}
          >
            {language}
          </span>
        )}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {children ?? (
          <pre
            style={{
              margin: 0,
              padding: tokens.spacing.md,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: tokens.fontSize.md,
              color: tokens.colors.text,
              overflow: 'auto',
              height: '100%',
            }}
          >
            {content || '// Open a file to start editing'}
          </pre>
        )}
      </div>
    </main>
  );
}
