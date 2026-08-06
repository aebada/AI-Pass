import { authApiUrl } from '@/lib/auth-api';
import type { UserProfile } from '@/app/components/premium/AppProviders';

const AUTH_ME_PATHS = ['/auth/me', '/auth/me.php'] as const;

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

export function profileFromApiUser(data: {
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

type MeResponse = {
  authenticated: boolean;
  user?: { id: string; email: string; name?: string; avatarUrl?: string };
};

function isJsonResponse(res: Response): boolean {
  const type = res.headers.get('content-type') ?? '';
  return type.includes('application/json') || type.includes('text/json');
}

async function fetchMe(url: string): Promise<MeResponse | 'unauthorized' | null> {
  const res = await fetch(url, { credentials: 'include', cache: 'no-store' });

  if (res.status === 401) {
    return 'unauthorized';
  }

  if (!res.ok || !isJsonResponse(res)) {
    return null;
  }

  try {
    return (await res.json()) as MeResponse;
  } catch {
    return null;
  }
}

/** Resolve current Laravel session; tries clean URL then legacy .php path. */
export async function syncLaravelSession(): Promise<UserProfile | null | 'signed_out'> {
  const urls = AUTH_ME_PATHS.map((path) => authApiUrl(path));

  for (const url of urls) {
    const data = await fetchMe(url);

    if (data === 'unauthorized') {
      return 'signed_out';
    }

    if (data?.authenticated && data.user) {
      return profileFromApiUser(data.user);
    }
  }

  return null;
}
