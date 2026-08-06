'use client';

import { useEffect } from 'react';
import { useApp, type UserProfile } from '../premium/AppProviders';

const PHP_AUTH_ME = '/auth/me.php';

function initialsFromName(name: string, email: string): string {
  const trimmed = name.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function profileFromPhpUser(data: {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}): UserProfile {
  const name = data.name?.trim() || data.email.split('@')[0] || 'User';
  return {
    id: data.id,
    name,
    email: data.email,
    avatarInitials: initialsFromName(name, data.email),
    avatarUrl: data.avatarUrl ?? undefined,
    plan: 'free',
    workspace: 'default',
    onboarded: false,
  };
}

/** Syncs PHP session (/auth/me.php) into AppProviders on static Hostinger deploy. */
export function PhpAuthBridge() {
  const { user, signIn, signOut, setAuthResolved } = useApp();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_PHP_AUTH !== '1') return;

    let cancelled = false;

    fetch(PHP_AUTH_ME, { credentials: 'include', cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) {
          if (user) signOut();
          return null;
        }
        return res.json() as Promise<{ authenticated: boolean; user?: { id: string; email: string; name?: string; avatarUrl?: string } }>;
      })
      .then((data) => {
        if (cancelled || !data?.authenticated || !data.user) return;
        const next = profileFromPhpUser(data.user);
        if (
          !user ||
          user.id !== next.id ||
          user.email !== next.email ||
          user.name !== next.name ||
          user.avatarUrl !== next.avatarUrl
        ) {
          signIn(next);
        }
      })
      .catch(() => {
        if (user) signOut();
      })
      .finally(() => {
        if (!cancelled) setAuthResolved(true);
      });

    return () => {
      cancelled = true;
    };
  }, [user, signIn, signOut, setAuthResolved]);

  return null;
}
