import { NextRequest, NextResponse } from 'next/server';

/**
 * Alias for Google OAuth callback when Console uses `/auth/google/callback`
 * instead of NextAuth's default `/api/auth/callback/google`.
 * Preserves query params (code, state, error) for the real handler.
 */
export function GET(request: NextRequest) {
  const target = new URL('/api/auth/callback/google', request.url);
  target.search = request.nextUrl.search;
  return NextResponse.redirect(target);
}
