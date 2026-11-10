import type { AuthSession } from './types.js';
import type { User } from './user.js';

export function isAuthenticated(
  session: AuthSession | null | undefined,
): session is AuthSession {
  if (!session) return false;
  const expiresAt = new Date(session.expiresAt);
  return !Number.isNaN(expiresAt.getTime()) && expiresAt > new Date();
}

export function isUserAuthenticated(user: User | null | undefined): user is User {
  return user != null && Boolean(user.id && user.email);
}

export function initialsFromName(name?: string | null, email?: string | null): string {
  const source = (name ?? email ?? '?').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function authSessionFromUser(user: User, ttlMs = 86_400_000 * 7): AuthSession {
  const now = new Date();
  const expires = new Date(now.getTime() + ttlMs);
  return {
    userId: user.id,
    email: user.email,
    provider: user.provider,
    authenticatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    tenantId: user.tenantId,
    roles: user.roles ?? ['user'],
    name: user.name,
    image: user.image,
  };
}

export function userFromOAuthProfile(input: {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  provider: AuthSession['provider'];
}): User {
  return {
    id: input.id,
    email: input.email,
    name: input.name ?? undefined,
    image: input.image ?? undefined,
    provider: input.provider,
    roles: ['user'],
  };
}
