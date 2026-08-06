import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = Boolean(req.auth);

  if (isAuthenticated && (pathname === '/' || pathname === '/login')) {
    return NextResponse.redirect(new URL('/workspace', req.url));
  }

  // The playground is the public try-before-signup surface: signed-out visitors
  // get demo responses and are asked to sign in only when they hit the free
  // limit. It reads no tenant data — the model list 401s into demo mode.
  const isPublicPlayground = pathname === '/workspace/playground';

  const isProtected =
    !isPublicPlayground &&
    (pathname.startsWith('/workspace') || pathname.startsWith('/dashboard'));
  if (!isAuthenticated && isProtected) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/', '/login', '/workspace/:path*', '/dashboard/:path*'],
};
