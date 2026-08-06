import { NextResponse } from 'next/server';
import { handleInstall, toJsonResponse } from '@ai-pass/marketplace-api';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';
  let body: Record<string, string>;

  if (contentType.includes('application/json')) {
    body = await request.json();
  } else {
    const form = await request.formData();
    body = Object.fromEntries(form.entries()) as Record<string, string>;
  }

  const result = toJsonResponse(
    handleInstall({
      appId: body.appId,
      tenantId: body.tenantId ?? 'tenant_demo',
      userId: body.userId ?? 'demo-user',
      userTier: body.userTier ?? 'professional',
      permissionsGranted: body.permissionsGranted?.split(','),
    }),
    NextResponse,
  );

  if (contentType.includes('application/json')) return result;
  return NextResponse.redirect(new URL('/workspace/marketplace', request.url));
}
