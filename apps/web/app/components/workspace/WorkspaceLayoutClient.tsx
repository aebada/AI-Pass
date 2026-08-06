'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { buildWorkspaceNavSections, WORKSPACE_BRAND } from '@ai-pass/platform-core';
import { WorkspaceShell, WorkspaceSidebar, WorkspaceTopBar, GlobalSearch } from '@ai-pass/ui';
import { useApp } from '../premium/AppProviders';

const MOBILE_MQ = '(max-width: 768px)';

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
  const { user } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navSections = buildWorkspaceNavSections();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      if (!mobile) setMobileNavOpen(false);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobile || !mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, mobileNavOpen]);

  const planLabel = user?.plan === 'pro'
    ? 'Professional'
    : user?.plan === 'enterprise'
      ? 'Enterprise'
      : 'Free';

  return (
    <WorkspaceShell
      isMobile={isMobile}
      mobileNavOpen={mobileNavOpen}
      onMobileNavClose={() => setMobileNavOpen(false)}
      sidebar={
        <WorkspaceSidebar
          sections={navSections}
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
          isMobile={isMobile}
          mobileOpen={mobileNavOpen}
          onNavigate={() => setMobileNavOpen(false)}
        />
      }
      topBar={
        <WorkspaceTopBar
          title={title}
          subtitle={isMobile ? undefined : subtitle}
          search={
            showSearch && !isMobile
              ? <GlobalSearch onNavigate={(route) => router.push(route)} />
              : undefined
          }
          onMenuClick={() => setMobileNavOpen((o) => !o)}
          menuOpen={mobileNavOpen}
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
          theme="dark"
        />
      }
    >
      {children}
    </WorkspaceShell>
  );
}
