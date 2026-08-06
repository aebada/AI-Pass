'use client';

import { workspaceTokens } from '@ai-pass/ui';

export function WorkspacePageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="ws-page-header">
      <h1
        className="ws-page-title"
        style={{
          fontSize: workspaceTokens.fontSize.xxl,
          fontWeight: 600,
          letterSpacing: '-0.025em',
          margin: 0,
          color: workspaceTokens.colors.text,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className="ws-page-subtitle"
          style={{
            fontSize: workspaceTokens.fontSize.md,
            color: workspaceTokens.colors.textMuted,
            margin: '8px 0 0',
            lineHeight: 1.5,
            maxWidth: '42rem',
          }}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}
