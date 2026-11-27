'use client';

import { useEffect } from 'react';
import { authApiUrl } from '@/lib/auth-api';
import { useApp, type UserProfile } from '../premium/AppProviders';

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

function profileFromApiUser(data: {
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
    onboarded: true,
  };
}

async function fetchMe(): Promise<{
  authenticated: boolean;
  user?: { id: string; email: string; name?: string; avatarUrl?: string };
} | null> {
  const endpoints = [authApiUrl('/auth/me'), '/auth/me.php', '/auth/me'];
  let sawUnauthorized = false;

  for (const url of [...new Set(endpoints)]) {
    try {
      const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
      if (res.status === 401) {
        sawUnauthorized = true;
        continue;
      }
      if (!res.ok) continue;
      const data = (await res.json()) as {
        authenticated?: boolean;
        user?: { id: string; email: string; name?: string; avatarUrl?: string };
      };
      if (data?.authenticated && data.user) return { authenticated: true, user: data.user };
      if (data && data.authenticated === false) sawUnauthorized = true;
    } catch {
      // try next endpoint
    }
  }

  return sawUnauthorized ? { authenticated: false } : null;
}

/** Syncs Laravel/PHP session into AppProviders on static Hostinger deploy. */
export function LaravelAuthBridge() {
  const { user, signIn, signOut } = useApp();

  useEffect(() => {
    const enabled =
      process.env.NEXT_PUBLIC_USE_LARAVEL_AUTH === '1' ||
      process.env.NEXT_PUBLIC_USE_PHP_AUTH === '1' ||
      process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';
    if (!enabled) return;

    let cancelled = false;

    fetchMe().then((data) => {
      if (cancelled || data === null) return;
      if (!data.authenticated || !data.user) {
        if (user) signOut();
        return;
      }
      const next = profileFromApiUser(data.user);
      if (
        !user ||
        user.id !== next.id ||
        user.email !== next.email ||
        user.name !== next.name ||
        user.avatarUrl !== next.avatarUrl
      ) {
        signIn(next);
      }
    });

    return () => {
      cancelled = true;
    };
    // Intentionally sync once on mount + when user identity changes from elsewhere.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
