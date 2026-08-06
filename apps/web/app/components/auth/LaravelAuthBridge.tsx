'use client';

import { useEffect } from 'react';
import { syncLaravelSession } from '@/lib/laravel-auth-sync';
import { useApp } from '../premium/AppProviders';

/** Syncs Laravel session (/auth/me) into AppProviders on static Hostinger deploy. */
export function LaravelAuthBridge() {
  const { signIn, signOut, setAuthResolved } = useApp();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_LARAVEL_AUTH !== '1') return;

    let cancelled = false;

    void syncLaravelSession()
      .then((result) => {
        if (cancelled) return;
        if (result === 'signed_out') {
          signOut();
          return;
        }
        if (result) {
          signIn(result);
        }
      })
      .catch(() => {
        if (!cancelled) signOut();
      })
      .finally(() => {
        if (!cancelled) setAuthResolved(true);
      });

    return () => {
      cancelled = true;
    };
  }, [signIn, signOut, setAuthResolved]);

  return null;
}
