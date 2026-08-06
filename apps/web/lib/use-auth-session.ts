'use client';

import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useApp } from '@/app/components/premium/AppProviders';
import { profileFromApiUser, syncLaravelSession } from '@/lib/laravel-auth-sync';
import { useLaravelAuth, usePhpAuth, useServerAuth } from '@/lib/auth-api';

async function syncPhpSession(): Promise<
  ReturnType<typeof profileFromApiUser> | null | 'signed_out'
> {
  const res = await fetch('/auth/me.php', { credentials: 'include', cache: 'no-store' });

  if (res.status === 401) {
    return 'signed_out';
  }

  if (!res.ok) {
    return null;
  }

  const type = res.headers.get('content-type') ?? '';
  if (!type.includes('json')) {
    return null;
  }

  try {
    const data = (await res.json()) as {
      authenticated: boolean;
      user?: { id: string; email: string; name?: string; avatarUrl?: string };
    };
    if (data?.authenticated && data.user) {
      return profileFromApiUser(data.user);
    }
  } catch {
    return null;
  }

  return null;
}

function useServerAuthSession() {
  const { user, authResolved, signIn, signOut, setAuthResolved } = useApp();

  const refreshAuth = useCallback(async () => {
    if (useLaravelAuth) {
      setAuthResolved(false);
      try {
        const result = await syncLaravelSession();
        if (result === 'signed_out') {
          signOut();
        } else if (result) {
          signIn(result);
        }
      } finally {
        setAuthResolved(true);
      }
      return;
    }

    if (usePhpAuth) {
      setAuthResolved(false);
      try {
        const result = await syncPhpSession();
        if (result === 'signed_out') {
          signOut();
        } else if (result) {
          signIn(result);
        }
      } finally {
        setAuthResolved(true);
      }
    }
  }, [signIn, signOut, setAuthResolved]);

  return {
    isAuthenticated: Boolean(user),
    isLoading: !authResolved,
    user,
    refreshAuth,
  };
}

function useNextAuthSession() {
  const { data: session, status, update } = useSession();

  const refreshAuth = useCallback(async () => {
    await update();
  }, [update]);

  return {
    isAuthenticated: status === 'authenticated' && Boolean(session?.user),
    isLoading: status === 'loading',
    user: session?.user ?? null,
    refreshAuth,
  };
}

/** Unified auth state for static Laravel/PHP deploy and local NextAuth dev. */
export function useAuthSession() {
  return useServerAuth ? useServerAuthSession() : useNextAuthSession();
}
