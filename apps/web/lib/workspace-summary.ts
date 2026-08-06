import type { WorkspaceDashboardData } from '@ai-pass/platform-core';
import { createEmptyDashboard } from '@ai-pass/platform-core';

function isJsonResponse(res: Response): boolean {
  const type = res.headers.get('content-type') ?? '';
  return type.includes('application/json') || type.includes('text/json');
}

/** Load workspace dashboard from API; null when unavailable or unauthenticated context. */
export async function fetchWorkspaceSummary(): Promise<WorkspaceDashboardData | null> {
  try {
    const res = await fetch('/api/v1/workspace/summary', {
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok || !isJsonResponse(res)) {
      return null;
    }

    const payload = (await res.json()) as { data?: { dashboard?: WorkspaceDashboardData } };
    return payload?.data?.dashboard ?? null;
  } catch {
    return null;
  }
}

/** Client fallback when static hosting has no API routes but Laravel session is valid. */
export function fallbackWorkspaceSummary(userName?: string): WorkspaceDashboardData {
  return createEmptyDashboard(userName);
}
