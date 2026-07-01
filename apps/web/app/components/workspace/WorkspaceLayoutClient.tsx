'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { buildWorkspaceNav, WORKSPACE_BRAND } from '@ai-pass/platform-core';
import { WorkspaceShell, WorkspaceSidebar, WorkspaceTopBar, GlobalSearch } from '@ai-pass/ui';
import { useApp } from '../premium/AppProviders';

export interface WorkspaceLayoutClientProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
}

export function WorkspaceLayoutClient({
  children,
  title,
  subtitle,
  showSearch = true,
}: WorkspaceLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, resolvedTheme, setTheme } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = buildWorkspaceNav();

  const planLabel = user?.plan === 'pro'
    ? 'Professional'
    : user?.plan === 'enterprise'
      ? 'Enterprise'
      : 'Free';

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <WorkspaceShell
      sidebar={
        <WorkspaceSidebar
          items={navItems}
          brand={{
            name: WORKSPACE_BRAND.name,
            tagline: WORKSPACE_BRAND.tagline,
            logoMark: WORKSPACE_BRAND.logoMark,
            logoSrc: WORKSPACE_BRAND.logoSrc,
            logoAlt: WORKSPACE_BRAND.logoAlt,
          }}
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          activePath={pathname}
        />
      }
      topBar={
        <WorkspaceTopBar
          title={title}
          subtitle={subtitle}
          search={showSearch ? <GlobalSearch onNavigate={(route) => router.push(route)} /> : undefined}
          user={
            user
              ? {
                  name: user.name,
                  avatarInitials: user.avatarInitials,
                  avatarUrl: user.avatarUrl,
                  plan: planLabel,
                }
              : undefined
          }
          theme={resolvedTheme}
          onThemeToggle={toggleTheme}
        />
      }
    >
      {children}
    </WorkspaceShell>
  );
}
