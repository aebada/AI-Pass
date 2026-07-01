'use client';

import { workspaceTokens } from '@ai-pass/ui';

export function WorkspacePageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: workspaceTokens.fontSize.xxl, fontWeight: 600, margin: 0, color: workspaceTokens.colors.text }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize: workspaceTokens.fontSize.md, color: workspaceTokens.colors.textMuted, margin: '8px 0 0' }}>
          {subtitle}
        </p>
      )}
    </header>
  );
}
