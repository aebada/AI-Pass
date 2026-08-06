/** Detect static-hosting SPA fallback (HTML) instead of a real API response. */
export function apiUnavailable(res: Response): boolean {
  if (res.status === 404 || res.status === 405) return true;
  const ct = res.headers.get('content-type') ?? '';
  return ct.includes('text/html');
}

export const apiFetchInit: RequestInit = {
  credentials: 'include',
};
