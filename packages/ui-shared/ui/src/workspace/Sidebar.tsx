'use client';

import type { NavItem } from '@ai-pass/platform-core';
import { BrandLogo, BRAND_HOME_ARIA_LABEL } from '../BrandLogo';
import { tokens } from './tokens';

export interface WorkspaceSidebarBrand {
  name: string;
  tagline?: string;
  logoMark?: string;
  logoSrc?: string;
  logoAlt?: string;
}

export interface WorkspaceSidebarProps {
  items: NavItem[];
  brand?: WorkspaceSidebarBrand;
  collapsed?: boolean;
  onToggle?: () => void;
  activePath?: string;
}

export function WorkspaceSidebar({
  items,
  brand = { name: 'AI-Pass', logoMark: 'AP', logoSrc: '/logo.png' },
  collapsed = false,
  onToggle,
  activePath = '',
}: WorkspaceSidebarProps) {
  const width = collapsed ? tokens.sidebarCollapsedWidth : tokens.sidebarWidth;

  return (
    <aside
      style={{
        width,
        minWidth: width,
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        background: tokens.colors.bgElevated,
        borderRight: `1px solid ${tokens.colors.border}`,
        transition: 'width 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing.sm,
          padding: collapsed ? '16px 12px' : '16px 20px',
          borderBottom: `1px solid ${tokens.colors.border}`,
        }}
      >
        {brand.logoSrc ? (
          <a
            href="/"
            aria-label={BRAND_HOME_ARIA_LABEL}
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <BrandLogo
              size="sidebar"
              src={brand.logoSrc}
              alt=""
            />
          </a>
        ) : (
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: tokens.radius.md,
              background: `linear-gradient(135deg, ${tokens.colors.accent}, ${tokens.colors.accentMuted})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: tokens.fontSize.sm,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {brand.logoMark}
          </span>
        )}
        {!collapsed && !brand.logoSrc && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: tokens.fontSize.md, fontWeight: 600, color: tokens.colors.text }}>
              {brand.name}
            </div>
            <div style={{ fontSize: tokens.fontSize.xs, color: tokens.colors.textMuted }}>
              {brand.tagline ?? 'Enterprise AI OS'}
            </div>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {items.map((item) => {
          const active =
            activePath === item.route ||
            (item.route !== '/workspace' && activePath.startsWith(item.route));
          return (
            <a
              key={item.id}
              href={item.route}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing.sm,
                padding: collapsed ? '10px 12px' : '10px 12px',
                marginBottom: 2,
                borderRadius: tokens.radius.md,
                fontSize: tokens.fontSize.md,
                color: active ? tokens.colors.accent : tokens.colors.textMuted,
                background: active ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
                fontWeight: active ? 500 : 400,
                textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 }}>
                {item.icon}
              </span>
              {!collapsed && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: tokens.fontSize.xs,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: 'rgba(88, 166, 255, 0.15)',
                        color: tokens.colors.accent,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </a>
          );
        })}
      </nav>

      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            margin: 8,
            padding: '8px',
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: tokens.radius.md,
            background: 'transparent',
            color: tokens.colors.textMuted,
            cursor: 'pointer',
            fontSize: tokens.fontSize.sm,
          }}
        >
          {collapsed ? '→' : '←'}
        </button>
      )}
    </aside>
  );
}
