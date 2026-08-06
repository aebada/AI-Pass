'use client';

import type { CSSProperties, ReactNode } from 'react';
import { tokens } from './tokens';

export interface WorkspaceTopBarBreadcrumb {
  label: string;
  href?: string;
}

export interface WorkspaceTopBarProps {
  title?: string;
  subtitle?: string;
  breadcrumb?: WorkspaceTopBarBreadcrumb[];
  user?: { name: string; avatarInitials: string; avatarUrl?: string; plan?: string };
  actions?: ReactNode;
  search?: ReactNode;
  onThemeToggle?: () => void;
  theme?: 'dark' | 'light';
  /** Opens the mobile navigation drawer. */
  onMenuClick?: () => void;
  menuOpen?: boolean;
}

export function WorkspaceTopBar({
  title,
  subtitle,
  breadcrumb,
  user,
  actions,
  search,
  onThemeToggle,
  theme = 'dark',
  onMenuClick,
  menuOpen = false,
}: WorkspaceTopBarProps) {
  const linkStyle: CSSProperties = {
    color: tokens.colors.textMuted,
    textDecoration: 'none',
  };

  return (
    <header
      className="ws-topbar"
      style={{
        minHeight: tokens.topBarHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        borderBottom: `1px solid ${tokens.colors.border}`,
        background: tokens.colors.bg,
        gap: tokens.spacing.md,
        minWidth: 0,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          flex: '1 1 auto',
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing.sm,
          minWidth: 0,
        }}
      >
        {onMenuClick && (
          <button
            type="button"
            className="ws-menu-btn"
            onClick={onMenuClick}
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            style={{
              display: 'none',
              width: 36,
              height: 36,
              flexShrink: 0,
              borderRadius: tokens.radius.sm,
              border: `1px solid ${tokens.colors.border}`,
              background: 'transparent',
              color: tokens.colors.text,
              cursor: 'pointer',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
              {menuOpen ? (
                <>
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        )}
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          {breadcrumb && breadcrumb.length > 0 && (
            <nav
              aria-label="Breadcrumb"
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 4,
                fontSize: tokens.fontSize.xs,
                color: tokens.colors.textMuted,
                marginBottom: title || subtitle ? 2 : 0,
              }}
            >
              {breadcrumb.map((segment, index) => (
                <span key={`${segment.label}-${index}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {index > 0 && <span aria-hidden style={{ opacity: 0.5 }}>/</span>}
                  {segment.href ? (
                    <a href={segment.href} style={linkStyle}>
                      {segment.label}
                    </a>
                  ) : (
                    <span style={{ color: tokens.colors.text }}>{segment.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          {title && (
            <h1
              style={{
                fontSize: tokens.fontSize.lg,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: tokens.colors.text,
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </h1>
          )}
          {subtitle && (
            <p
              className="ws-topbar-subtitle"
              style={{
                fontSize: tokens.fontSize.sm,
                color: tokens.colors.textMuted,
                margin: '2px 0 0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {search && (
        <div
          className="ws-topbar-search"
          style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0, maxWidth: 400 }}
        >
          {search}
        </div>
      )}

      <div
        className="ws-topbar-actions"
        style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
      >
        {actions}
        {onThemeToggle && (
          <button
            type="button"
            onClick={onThemeToggle}
            aria-label="Toggle theme"
            style={{
              width: 32,
              height: 32,
              borderRadius: tokens.radius.sm,
              border: `1px solid ${tokens.colors.border}`,
              background: 'transparent',
              color: tokens.colors.textMuted,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
              {theme === 'dark' ? (
                <circle cx="12" cy="12" r="4" />
              ) : (
                <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z" />
              )}
            </svg>
          </button>
        )}
        {user && (
          <div
            className="ws-topbar-user"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '3px 10px 3px 3px',
              borderRadius: 999,
              border: `1px solid ${tokens.colors.border}`,
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: user.avatarUrl ? 'transparent' : tokens.colors.accentMuted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
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
            <div className="ws-topbar-user-meta" style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: tokens.fontSize.sm, fontWeight: 500, color: tokens.colors.text }}>
                {user.name}
              </div>
              {user.plan && (
                <div style={{ fontSize: 10, color: tokens.colors.textMuted }}>
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
