import { ok, type ApiResponse } from '@ai-pass/platform-core';
import { getKnowledgePlatform } from '@ai-pass/knowledge-pipeline';
import { NextResponse } from 'next/server';

export function getKnowledge() {
  return getKnowledgePlatform();
}

export function jsonOk<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(ok(data), { status });
}

export function jsonError(message: string, code = 'BAD_REQUEST', status = 400): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function parseTenantId(request: Request): string {
  return request.headers.get('x-tenant-id') ?? 'tenant_acme';
}
