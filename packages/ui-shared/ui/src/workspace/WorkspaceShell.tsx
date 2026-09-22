'use client';

import type { ReactNode } from 'react';
import { Card } from '../card';
import { tokens } from './tokens';

export interface ModuleCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  status?: 'done' | 'stub' | 'pending';
  tier?: string;
}

export function ModuleCard({ name, description, icon, route, status, tier }: ModuleCardProps) {
  const statusColors: Record<string, string> = {
    done: tokens.colors.success,
    stub: tokens.colors.warning,
    pending: tokens.colors.textMuted,
  };

  return (
    <a href={route} style={{ textDecoration: 'none', display: 'block' }}>
      <Card variant="default" hover padding="md">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing.md }}>
          <span style={{ fontSize: 24, lineHeight: 1 }}>{icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, marginBottom: 4 }}>
              <h3 style={{ fontSize: tokens.fontSize.md, fontWeight: 600, color: tokens.colors.text, margin: 0 }}>
                {name}
              </h3>
              {status && (
                <span
                  style={{
                    fontSize: tokens.fontSize.xs,
                    color: statusColors[status] ?? tokens.colors.textMuted,
                    textTransform: 'capitalize',
                  }}
                >
                  {status}
                </span>
              )}
            </div>
            <p style={{ fontSize: tokens.fontSize.sm, color: tokens.colors.textMuted, margin: 0, lineHeight: 1.5 }}>
              {description}
            </p>
            {tier && (
              <span style={{ fontSize: tokens.fontSize.xs, color: tokens.colors.accent, marginTop: 8, display: 'inline-block' }}>
                {tier}
              </span>
            )}
          </div>
          <span style={{ color: tokens.colors.textMuted, fontSize: 14 }}>→</span>
        </div>
      </Card>
    </a>
  );
}

export interface WorkspaceShellProps {
  sidebar: ReactNode;
  topBar?: ReactNode;
  children: ReactNode;
}

export function WorkspaceShell({ sidebar, topBar, children }: WorkspaceShellProps) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: tokens.colors.bg,
        color: tokens.colors.text,
      }}
    >
      {sidebar}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {topBar}
        <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
      </div>
    </div>
  );
}

export { tokens as workspaceTokens };
