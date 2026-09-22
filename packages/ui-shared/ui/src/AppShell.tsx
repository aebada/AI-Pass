import type { ReactNode } from 'react';
import { tokens } from './tokens';
import { Sidebar, type SidebarProps } from './Sidebar';
import { ChatPanel, type ChatPanelProps } from './ChatPanel';
import { EditorArea, type EditorAreaProps } from './EditorArea';

export interface AppShellProps {
  title?: string;
  sidebar?: SidebarProps;
  editor?: EditorAreaProps;
  chat?: ChatPanelProps;
  terminal?: ReactNode;
  statusBar?: ReactNode;
  headerActions?: ReactNode;
}

export function AppShell({
  title = 'AI Pass',
  sidebar,
  editor,
  chat,
  terminal,
  statusBar,
  headerActions,
}: AppShellProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        background: tokens.colors.bg,
        color: tokens.colors.text,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          height: 40,
          minHeight: 40,
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${tokens.spacing.md}px`,
          background: tokens.colors.bgElevated,
          borderBottom: `1px solid ${tokens.colors.border}`,
          gap: tokens.spacing.md,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: tokens.fontSize.lg }}>{title}</span>
        <span style={{ color: tokens.colors.textMuted, fontSize: tokens.fontSize.sm }}>
          AI-powered code editor
        </span>
        {headerActions && <div style={{ marginLeft: 'auto' }}>{headerActions}</div>}
      </header>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {sidebar && <Sidebar {...sidebar} />}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {editor && <EditorArea {...editor} />}
          {terminal && (
            <div
              style={{
                height: tokens.terminalHeight,
                minHeight: tokens.terminalHeight,
                borderTop: `1px solid ${tokens.colors.border}`,
                overflow: 'hidden',
              }}
            >
              {terminal}
            </div>
          )}
        </div>
        {chat && <ChatPanel {...chat} />}
      </div>
      {statusBar ?? (
        <footer
          style={{
            height: 24,
            minHeight: 24,
            display: 'flex',
            alignItems: 'center',
            padding: `0 ${tokens.spacing.md}px`,
            background: tokens.colors.accentMuted,
            fontSize: tokens.fontSize.sm,
            color: tokens.colors.text,
          }}
        >
          Ready
        </footer>
      )}
    </div>
  );
}

export { tokens };
export type { SidebarProps, ChatPanelProps, EditorAreaProps };
