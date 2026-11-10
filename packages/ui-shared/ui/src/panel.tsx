import type { ReactNode } from 'react';

export interface PanelProps {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  style?: React.CSSProperties;
}

export function Panel({ title, children, actions, style }: PanelProps) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--ai-bg-elevated)',
        border: '1px solid var(--ai-border)',
        borderRadius: 'var(--ai-radius)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {(title || actions) && (
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderBottom: '1px solid var(--ai-border)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--ai-text)',
          }}
        >
          <span>{title}</span>
          {actions}
        </header>
      )}
      <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
    </section>
  );
}
