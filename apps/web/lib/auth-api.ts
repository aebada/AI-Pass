/**
 * Laravel / PHP auth URLs for the static Next.js frontend.
 */
export const useLaravelAuth = process.env.NEXT_PUBLIC_USE_LARAVEL_AUTH === '1';
export const usePhpAuth = process.env.NEXT_PUBLIC_USE_PHP_AUTH === '1';
export const useServerAuth = usePhpAuth || useLaravelAuth;

export const authApiBase = (process.env.NEXT_PUBLIC_AUTH_API_URL ?? '').replace(/\/$/, '');

export const AIPASS_AUTH_SUCCESS = 'AIPASS_AUTH_SUCCESS';

export function authApiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${authApiBase}${normalized}`;
}

export function authCallbackQuery(callbackUrl: string): string {
  return callbackUrl !== '/workspace' ? `?callback=${encodeURIComponent(callbackUrl)}` : '';
}

/** Same-origin /auth/* on static deploy, or prefixed when NEXT_PUBLIC_AUTH_API_URL is set. */
export function siteAuthPath(path: string, callbackUrl = '/workspace'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${authApiBase}${normalized}${authCallbackQuery(callbackUrl)}`;
}


function appendQuery(url: string, key: string, value: string): string {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${key}=${encodeURIComponent(value)}`;
}

export function authMessageOrigins(): string[] {
  const origins = new Set<string>();
  if (typeof window !== 'undefined' && window.location.origin) {
    origins.add(window.location.origin);
  }
  if (authApiBase) {
    try {
      origins.add(new URL(authApiBase).origin);
    } catch {
      /* ignore invalid base */
    }
  }
  return [...origins];
}

export function isAipassAuthMessage(data: unknown): data is { type: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    typeof (data as { type: unknown }).type === 'string'
  );
}

export function emailLoginHref(callbackUrl = '/workspace'): string {
  if (useLaravelAuth) {
    return siteAuthPath('/auth/login', callbackUrl);
  }
  if (usePhpAuth) {
    return callbackUrl !== '/workspace'
      ? `/auth/login.php?callback=${encodeURIComponent(callbackUrl)}`
      : '/auth/login.php';
  }
  return '/login';
}

export function registerHref(callbackUrl = '/workspace'): string {
  if (useLaravelAuth) {
    return siteAuthPath('/auth/register', callbackUrl);
  }
  if (usePhpAuth) {
    return '/auth/register.php';
  }
  return '/login';
}

export function googleAuthHref(
  callbackUrl = '/workspace',
  _fallback = '/workspace',
  opts?: { popup?: boolean },
): string {
  if (useLaravelAuth) {
    let href = siteAuthPath('/auth/google', callbackUrl);
    if (opts?.popup) {
      href = appendQuery(href, 'popup', '1');
    }
    return href;
  }
  if (usePhpAuth) {
    let href =
      callbackUrl !== '/workspace'
        ? `/auth/google.php?callback=${encodeURIComponent(callbackUrl)}`
        : '/auth/google.php';
    if (opts?.popup) {
      href = appendQuery(href, 'popup', '1');
    }
    return href;
  }
  return '/login';
}
