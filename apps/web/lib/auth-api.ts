/**
 * Laravel auth API URLs for the static Next.js frontend.
 */
export const useLaravelAuth = process.env.NEXT_PUBLIC_USE_LARAVEL_AUTH === '1';

export const authApiBase = (process.env.NEXT_PUBLIC_AUTH_API_URL ?? '').replace(/\/$/, '');

export function authApiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${authApiBase}${normalized}`;
}

export function authCallbackQuery(callbackUrl: string): string {
  return callbackUrl !== '/workspace' ? `?callback=${encodeURIComponent(callbackUrl)}` : '';
}
