import type { Session } from 'next-auth';

/** Resolve the canonical user id from a NextAuth session. */
export function resolveSessionUserId(session: Session | null | undefined): string | null {
  if (!session?.user) return null;
  return session.user.id ?? session.authSession?.userId ?? null;
}

/** Resolve user id or throw - for authenticated API routes. */
export function requireSessionUserId(session: Session | null | undefined): string {
  const userId = resolveSessionUserId(session);
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

/** Legacy demo profile persisted in localStorage before OAuth wiring. */
export function isLegacyDemoProfile(profile: { id?: string; name?: string; email?: string }): boolean {
  return (
    profile.id === 'demo-user' ||
    profile.name === 'Jordan Lee' ||
    profile.email === 'jordan@acme.corp'
  );
}
