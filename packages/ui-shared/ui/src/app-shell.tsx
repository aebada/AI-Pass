import type { ReactNode } from 'react';

export interface AppShellProps {
  sidebar: ReactNode;
  editor: ReactNode;
  chat: ReactNode;
  statusBar?: ReactNode;
}

export function AppShell({ sidebar, editor, chat, statusBar }: AppShellProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--ai-bg)',
        color: 'var(--ai-text)',
        fontFamily: 'var(--ai-font)',
      }}
    >
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside style={{ width: 240, borderRight: '1px solid var(--ai-border)', overflow: 'auto' }}>
          {sidebar}
        </aside>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {editor}
        </main>
        <aside style={{ width: 360, borderLeft: '1px solid var(--ai-border)', overflow: 'hidden' }}>
          {chat}
        </aside>
      </div>
      {statusBar && (
        <footer
          style={{
            height: 24,
            borderTop: '1px solid var(--ai-border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            fontSize: 12,
            color: 'var(--ai-text-muted)',
          }}
        >
          {statusBar}
        </footer>
      )}
    </div>
  );
}
