import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = Boolean(req.auth);

  if (isAuthenticated && (pathname === '/' || pathname === '/login')) {
    return NextResponse.redirect(new URL('/workspace', req.url));
  }

  const isProtected =
    pathname.startsWith('/workspace') || pathname.startsWith('/dashboard');
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
