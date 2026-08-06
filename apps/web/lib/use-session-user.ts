'use client';

import { useSession } from 'next-auth/react';
import { useApp } from '../app/components/premium/AppProviders';

/** Client-side user id from NextAuth session, falling back to AppProviders profile. */
export function useSessionUserId(): string | null {
  const { data: session } = useSession();
  const { user } = useApp();
  return session?.user?.id ?? session?.authSession?.userId ?? user?.id ?? null;
}
