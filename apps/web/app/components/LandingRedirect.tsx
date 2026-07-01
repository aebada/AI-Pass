'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

/** Redirects authenticated users from the landing page to workspace. */
export function LandingRedirect() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/workspace');
    }
  }, [status, router]);

  return null;
}
