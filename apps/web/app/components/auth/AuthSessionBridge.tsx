'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { initialsFromName } from '@ai-pass/auth-core';
import type { PlanTier } from '@ai-pass/ui';
import { useApp, type UserProfile } from '../premium/AppProviders';

const TIER_TO_PLAN: Record<string, PlanTier> = {
  free: 'free',
  professional: 'pro',
  pro: 'pro',
  power: 'pro',
  enterprise: 'enterprise',
};

function profileFromSession(session: NonNullable<ReturnType<typeof useSession>['data']>): UserProfile {
  const name = session.user?.name ?? session.user?.email ?? 'User';
  const email = session.user?.email ?? '';
  return {
    id: session.user?.id ?? session.authSession?.userId ?? 'user',
    name,
    email,
    avatarInitials: initialsFromName(session.user?.name, session.user?.email),
    avatarUrl: session.user?.image ?? session.authSession?.image,
    plan: 'free',
    workspace: 'My Workspace',
    onboarded: true,
  };
}

/** Keeps AppProviders user state aligned with the NextAuth session. */
export function AuthSessionBridge() {
  const { data: session, status } = useSession();
  const { user, signIn, signOut, updateUser } = useApp();

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user) {
      const next = profileFromSession(session);
      if (
        !user ||
        user.id !== next.id ||
        user.email !== next.email ||
        user.name !== next.name ||
        user.avatarUrl !== next.avatarUrl ||
        user.plan !== next.plan
      ) {
        signIn(next);
      }
      return;
    }

    if (user) {
      signOut();
    }
  }, [session, status, user, signIn, signOut]);

  useEffect(() => {
    const userId = session?.user?.id ?? session?.authSession?.userId;
    if (status !== 'authenticated' || !userId) return;

    let cancelled = false;
    fetch('/api/v1/user/bootstrap')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { tier?: string; plan?: PlanTier } | null) => {
        if (cancelled || !data?.plan) return;
        updateUser({ plan: data.plan });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [session, status, updateUser]);

  return null;
}
