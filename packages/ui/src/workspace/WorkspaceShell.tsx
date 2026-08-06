'use client';

import type { ReactNode } from 'react';
import { Card } from '../card';
import { ModuleIcon } from './ModuleIcon';
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
          <ModuleIcon name={icon} size={24} />
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
  /** When true, layout is phone-sized: sidebar is off-canvas and main is full width. */
  isMobile?: boolean;
  /** Controls off-canvas sidebar visibility on mobile. */
  mobileNavOpen?: boolean;
  /** Called when the dimmed backdrop is clicked (close mobile nav). */
  onMobileNavClose?: () => void;
}

export function WorkspaceShell({
  sidebar,
  topBar,
  children,
  isMobile = false,
  mobileNavOpen = false,
  onMobileNavClose,
}: WorkspaceShellProps) {
  return (
    <div
      data-workspace="true"
      data-ws-mobile={isMobile ? 'true' : 'false'}
      data-ws-nav={mobileNavOpen ? 'open' : 'closed'}
      className="ws-shell"
      style={{
        display: 'flex',
        minHeight: '100vh',
        maxWidth: '100vw',
        overflowX: 'hidden',
        background: tokens.colors.bg,
        color: tokens.colors.text,
        position: 'relative',
      }}
    >
      {sidebar}
      {isMobile && mobileNavOpen && (
        <button
          type="button"
          className="ws-nav-backdrop"
          aria-label="Close navigation"
          onClick={onMobileNavClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 190,
            border: 'none',
            padding: 0,
            margin: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            cursor: 'pointer',
          }}
        />
      )}
      <div
        className="ws-main-column"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}
      >
        {topBar}
        <main
          className="ws-main"
          style={{
            flex: 1,
            overflow: 'auto',
            padding: isMobile ? '16px' : '28px 32px',
            minWidth: 0,
            width: '100%',
            maxWidth: '100%',
            scrollbarGutter: isMobile ? 'auto' : 'stable',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export { tokens as workspaceTokens };
