'use client';

import type { ReactNode } from 'react';
import { tokens } from './tokens';

export interface WorkspaceTopBarProps {
  title?: string;
  subtitle?: string;
  user?: { name: string; avatarInitials: string; avatarUrl?: string; plan?: string };
  actions?: ReactNode;
  search?: ReactNode;
  onThemeToggle?: () => void;
  theme?: 'dark' | 'light';
}

export function WorkspaceTopBar({
  title,
  subtitle,
  user,
  actions,
  search,
  onThemeToggle,
  theme = 'dark',
}: WorkspaceTopBarProps) {
  return (
    <header
      style={{
        height: tokens.topBarHeight,
        minHeight: tokens.topBarHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: `1px solid ${tokens.colors.border}`,
        background: tokens.colors.bg,
        gap: tokens.spacing.md,
      }}
    >
      <div style={{ flexShrink: 0 }}>
        {title && (
          <h1 style={{ fontSize: tokens.fontSize.lg, fontWeight: 600, color: tokens.colors.text, margin: 0 }}>
            {title}
          </h1>
        )}
        {subtitle && (
          <p style={{ fontSize: tokens.fontSize.sm, color: tokens.colors.textMuted, margin: '2px 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>

      {search && <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{search}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md, flexShrink: 0 }}>
        {actions}
        {onThemeToggle && (
          <button
            type="button"
            onClick={onThemeToggle}
            aria-label="Toggle theme"
            style={{
              width: 36,
              height: 36,
              borderRadius: tokens.radius.md,
              border: `1px solid ${tokens.colors.border}`,
              background: 'transparent',
              color: tokens.colors.textMuted,
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        )}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing.sm,
              padding: '4px 12px 4px 4px',
              borderRadius: tokens.radius.lg,
              border: `1px solid ${tokens.colors.border}`,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: user.avatarUrl ? 'transparent' : tokens.colors.accentMuted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tokens.fontSize.xs,
                fontWeight: 600,
                color: '#fff',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                user.avatarInitials
              )}
            </span>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: tokens.fontSize.sm, fontWeight: 500, color: tokens.colors.text }}>
                {user.name}
              </div>
              {user.plan && (
                <div style={{ fontSize: tokens.fontSize.xs, color: tokens.colors.textMuted }}>
                  {user.plan}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
