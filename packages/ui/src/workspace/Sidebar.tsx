'use client';

import type { NavItem } from '@ai-pass/platform-core';
import { BrandLogo, BRAND_HOME_ARIA_LABEL } from '../BrandLogo';
import { ModuleIcon } from './ModuleIcon';
import { tokens } from './tokens';

export interface WorkspaceSidebarBrand {
  name: string;
  tagline?: string;
  logoMark?: string;
  logoSrc?: string;
  logoAlt?: string;
}

export interface WorkspaceNavSectionProp {
  id: string;
  label: string;
  items: NavItem[];
}

export interface WorkspaceSidebarProps {
  items?: NavItem[];
  /** Prefer sections for calm grouped navigation. Falls back to flat `items`. */
  sections?: WorkspaceNavSectionProp[];
  brand?: WorkspaceSidebarBrand;
  collapsed?: boolean;
  onToggle?: () => void;
  activePath?: string;
  /** Phone / narrow viewport — sidebar becomes an off-canvas drawer. */
  isMobile?: boolean;
  /** Whether the mobile drawer is visible. */
  mobileOpen?: boolean;
  /** Called after a nav link is clicked on mobile (close drawer). */
  onNavigate?: () => void;
}

function isActive(activePath: string, route: string) {
  return activePath === route || (route !== '/workspace' && activePath.startsWith(route));
}

export function WorkspaceSidebar({
  items = [],
  sections,
  brand = { name: 'AI-Pass', logoMark: 'AP', logoSrc: '/logo.svg' },
  collapsed = false,
  onToggle,
  activePath = '',
  isMobile = false,
  mobileOpen = false,
  onNavigate,
}: WorkspaceSidebarProps) {
  const desktopCollapsed = !isMobile && collapsed;
  const width = desktopCollapsed ? tokens.sidebarCollapsedWidth : tokens.sidebarWidth;
  const showLabels = !desktopCollapsed || isMobile;

  const groups: WorkspaceNavSectionProp[] =
    sections && sections.length > 0
      ? sections
      : [{ id: 'all', label: '', items }];

  return (
    <aside
      className="ws-sidebar"
      data-ws-sidebar={isMobile ? (mobileOpen ? 'open' : 'closed') : desktopCollapsed ? 'collapsed' : 'expanded'}
      aria-hidden={isMobile && !mobileOpen ? true : undefined}
      style={{
        width: isMobile ? tokens.sidebarWidth : width,
        minWidth: isMobile ? tokens.sidebarWidth : width,
        height: '100vh',
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        left: isMobile ? 0 : undefined,
        zIndex: isMobile ? 200 : undefined,
        display: 'flex',
        flexDirection: 'column',
        background: tokens.colors.bgElevated,
        borderRight: `1px solid ${tokens.colors.border}`,
        transition: isMobile
          ? 'transform 0.2s ease'
          : 'width 0.2s ease, min-width 0.2s ease',
        transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : undefined,
        boxShadow: isMobile && mobileOpen ? '8px 0 32px rgba(0,0,0,0.45)' : undefined,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing.sm,
          padding: desktopCollapsed ? '18px 14px' : '18px 16px',
          borderBottom: `1px solid ${tokens.colors.border}`,
          minHeight: tokens.topBarHeight,
          boxSizing: 'border-box',
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
              theme="dark"
              alt={brand.logoAlt ?? brand.name}
              className="ws-brand-logo"
            />
          </a>
        ) : (
          <a
            href="/"
            aria-label={BRAND_HOME_ARIA_LABEL}
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: tokens.radius.sm,
                background: tokens.colors.accentMuted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tokens.fontSize.sm,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {brand.logoMark}
            </span>
          </a>
        )}
        {showLabels && !brand.logoSrc && (
          <a
            href="/"
            aria-label={BRAND_HOME_ARIA_LABEL}
            style={{ minWidth: 0, textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ fontSize: tokens.fontSize.md, fontWeight: 600, color: tokens.colors.text }}>
              {brand.name}
            </div>
            <div style={{ fontSize: tokens.fontSize.xs, color: tokens.colors.textMuted }}>
              {brand.tagline ?? 'Enterprise AI OS'}
            </div>
          </a>
        )}
      </div>

      <nav style={{ flex: 1, padding: '10px 8px 12px', overflowY: 'auto' }}>
        {groups.map((group) => (
          <div key={group.id} className="ws-nav-section">
            {showLabels && group.label ? (
              <p className="ws-nav-section-label">{group.label}</p>
            ) : null}
            {group.items.map((item) => {
              const active = isActive(activePath, item.route);
              return (
                <a
                  key={item.id}
                  href={item.route}
                  title={desktopCollapsed ? item.label : undefined}
                  className="ws-nav-link"
                  data-active={active ? 'true' : undefined}
                  onClick={() => {
                    if (isMobile) onNavigate?.();
                  }}
                  style={
                    desktopCollapsed
                      ? { justifyContent: 'center', padding: '8px' }
                      : undefined
                  }
                >
                  <ModuleIcon name={item.icon} active={active} size={18} />
                  {showLabels && (
                    <>
                      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: 'rgba(88, 166, 255, 0.12)',
                            color: tokens.colors.accent,
                            fontWeight: 500,
                            flexShrink: 0,
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
          </div>
        ))}
      </nav>

      {!isMobile && onToggle && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            margin: '4px 8px 10px',
            padding: '7px',
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: tokens.radius.sm,
            background: 'transparent',
            color: tokens.colors.textMuted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {collapsed ? (
              <path d="M9 18l6-6-6-6" />
            ) : (
              <path d="M15 18l-6-6 6-6" />
            )}
          </svg>
        </button>
      )}
    </aside>
  );
}
