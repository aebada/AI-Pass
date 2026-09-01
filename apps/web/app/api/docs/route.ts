import { API_VERSION } from '@ai-pass/platform-core';
import { PLATFORM_API_ROUTES } from '@ai-pass/platform-api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  const paths: Record<string, Record<string, { summary: string; tags?: string[] }>> = {};

  for (const route of PLATFORM_API_ROUTES) {
    const pathKey = route.path.replace('/api/v1', '');
    const method = route.method.toLowerCase();
    if (!paths[pathKey]) paths[pathKey] = {};
    paths[pathKey][method] = { summary: route.summary, tags: [route.tag] };
  }

  return NextResponse.json({
    openapi: '3.1.0',
    info: {
      title: 'AI Pass Platform API',
      version: API_VERSION,
      description: 'Enterprise AI Operating System - REST API (scaffold)',
    },
    servers: [{ url: '/api/v1', description: 'API v1' }],
    paths,
  });
}
