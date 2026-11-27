'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../premium/AppProviders';

/**
 * Static Hostinger export has no Next middleware. After session hydration,
 * send signed-in users from marketing/login into the workspace.
 */
export function AuthRedirect() {
  const { user } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (pathname === '/' || pathname === '/login') {
      router.replace('/workspace');
    }
  }, [user, pathname, router]);

  return null;
}
