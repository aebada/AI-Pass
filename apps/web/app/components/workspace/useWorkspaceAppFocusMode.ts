'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/** Routes under this prefix get immersive app focus mode (sidebar hidden by default). */
export const WORKSPACE_APP_ROUTE_PREFIX = '/workspace/apps/';

const STORAGE_KEY = 'workspace-app-sidebar-visible';

export function isWorkspaceAppRoute(
  pathname: string,
  prefix = WORKSPACE_APP_ROUTE_PREFIX,
): boolean {
  return pathname.startsWith(prefix);
}

export function useWorkspaceAppFocusMode(prefix = WORKSPACE_APP_ROUTE_PREFIX) {
  const pathname = usePathname();
  const inAppRoute = isWorkspaceAppRoute(pathname, prefix);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    if (!inAppRoute) {
      setSidebarVisible(true);
      return;
    }
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    setSidebarVisible(stored === 'true');
  }, [inAppRoute, pathname]);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => {
      const next = !prev;
      if (inAppRoute && typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, String(next));
      }
      return next;
    });
  }, [inAppRoute]);

  const effectiveSidebarVisible = inAppRoute ? sidebarVisible : true;
  const focusMode = inAppRoute && !sidebarVisible;

  return {
    inAppRoute,
    sidebarVisible: effectiveSidebarVisible,
    focusMode,
    toggleSidebar,
  };
}
