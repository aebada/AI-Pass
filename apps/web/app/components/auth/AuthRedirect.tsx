'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '../premium/AppProviders';

/**
 * Static Hostinger export has no Next middleware. After session hydration,
 * send signed-in users from marketing/login into the workspace with a hard
 * navigation (Next soft router can stall on static hosts).
 */
export function AuthRedirect() {
  const { user } = useApp();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;
    const path = pathname?.replace(/\/$/, '') || '';
    if (path === '' || path === '/' || path === '/login') {
      window.location.replace('/workspace/');
    }
  }, [user, pathname]);

  return null;
}
